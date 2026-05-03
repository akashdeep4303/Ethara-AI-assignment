import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { assertAdmin, getProjectAccess } from "@/lib/project-access";
import { jsonError } from "@/lib/errors";
import { parseJson, updateProjectSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, context: Ctx) {
  return withApi("GET /api/projects/[projectId]", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) return jsonError("Project not found", 404);

    return Response.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        role: access.role,
        taskCount: project._count.tasks,
        memberCount: project._count.members,
      },
    });
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return withApi("PATCH /api/projects/[projectId]", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);
    if (!assertAdmin(access.role)) {
      return jsonError("Only admins can update project settings", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(updateProjectSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    if (Object.keys(data).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return Response.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
      },
    });
  });
}

export async function DELETE(_request: Request, context: Ctx) {
  return withApi("DELETE /api/projects/[projectId]", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);
    if (!assertAdmin(access.role)) {
      return jsonError("Only admins can delete projects", 403);
    }

    await prisma.project.delete({ where: { id: projectId } });
    return Response.json({ ok: true });
  });
}
