import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { jsonError } from "@/lib/errors";
import { createProjectSchema, parseJson } from "@/lib/validations";

export async function GET() {
  return withApi("GET /api/projects", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true, members: true } },
          },
        },
      },
      orderBy: { project: { updatedAt: "desc" } },
    });

    const projects = memberships.map((m) => ({
      id: m.project.id,
      name: m.project.name,
      description: m.project.description,
      role: m.role,
      memberCount: m.project._count.members,
      taskCount: m.project._count.tasks,
      updatedAt: m.project.updatedAt,
    }));

    return Response.json({ projects });
  });
}

export async function POST(request: Request) {
  return withApi("POST /api/projects", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(createProjectSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, description } = parsed.data;

    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: {
          name,
          description: description ?? null,
          ownerId: userId,
        },
      });
      await tx.projectMember.create({
        data: { userId, projectId: p.id, role: "ADMIN" },
      });
      return p;
    });

    return Response.json(
      {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          role: "ADMIN" as const,
        },
      },
      { status: 201 }
    );
  });
}
