import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { assertAdmin, getProjectAccess } from "@/lib/project-access";
import { jsonError } from "@/lib/errors";
import { addMemberSchema, parseJson } from "@/lib/validations";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, context: Ctx) {
  return withApi("GET /api/projects/[projectId]/members", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: [{ role: "asc" }, { user: { email: "asc" } }],
    });

    return Response.json({
      members: members.map((m) => ({
        userId: m.userId,
        role: m.role,
        email: m.user.email,
        name: m.user.name,
      })),
      myRole: access.role,
    });
  });
}

export async function POST(request: Request, context: Ctx) {
  return withApi("POST /api/projects/[projectId]/members", async () => {
    const actorId = await getCurrentUserIdFromRequest();
    if (!actorId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(actorId, projectId);
    if (!access) return jsonError("Project not found", 404);
    if (!assertAdmin(access.role)) {
      return jsonError("Only admins can add members", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(addMemberSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, role } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return jsonError("No user with that email exists. They must register first.", 404);
    }

    try {
      const member = await prisma.projectMember.create({
        data: { userId: user.id, projectId, role },
        include: { user: { select: { email: true, name: true } } },
      });
      return Response.json(
        {
          member: {
            userId: member.userId,
            role: member.role,
            email: member.user.email,
            name: member.user.name,
          },
        },
        { status: 201 }
      );
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return jsonError("User is already a member of this project", 409);
      }
      throw e;
    }
  });
}
