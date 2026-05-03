import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { assertAdmin, getProjectAccess } from "@/lib/project-access";
import { jsonError } from "@/lib/errors";
import { parseJson, updateMemberRoleSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ projectId: string; memberUserId: string }> };

export async function PATCH(request: Request, context: Ctx) {
  return withApi("PATCH /api/projects/.../members/[memberUserId]", async () => {
    const actorId = await getCurrentUserIdFromRequest();
    if (!actorId) return jsonError("Unauthorized", 401);

    const { projectId, memberUserId } = await context.params;
    const access = await getProjectAccess(actorId, projectId);
    if (!access) return jsonError("Project not found", 404);
    if (!assertAdmin(access.role)) {
      return jsonError("Only admins can change roles", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(updateMemberRoleSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: memberUserId, projectId } },
      select: { role: true },
    });
    if (!member) return jsonError("Member not found", 404);

    const newRole = parsed.data.role;
    if (newRole !== "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" },
      });
      if (member.role === "ADMIN" && adminCount <= 1) {
        return jsonError("Cannot demote the only admin — promote another admin first", 400);
      }
    }

    const updated = await prisma.projectMember.update({
      where: { userId_projectId: { userId: memberUserId, projectId } },
      data: { role: newRole },
      include: { user: { select: { email: true, name: true } } },
    });

    return Response.json({
      member: {
        userId: updated.userId,
        role: updated.role,
        email: updated.user.email,
        name: updated.user.name,
      },
    });
  });
}

export async function DELETE(_request: Request, context: Ctx) {
  return withApi("DELETE /api/projects/.../members/[memberUserId]", async () => {
    const actorId = await getCurrentUserIdFromRequest();
    if (!actorId) return jsonError("Unauthorized", 401);

    const { projectId, memberUserId } = await context.params;
    const access = await getProjectAccess(actorId, projectId);
    if (!access) return jsonError("Project not found", 404);
    if (!assertAdmin(access.role)) {
      return jsonError("Only admins can remove members", 403);
    }

    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: memberUserId, projectId } },
      select: { role: true },
    });
    if (!member) return jsonError("Member not found", 404);

    if (member.role === "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return jsonError("Cannot remove the only admin", 400);
      }
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: memberUserId, projectId } },
    });

    return Response.json({ ok: true });
  });
}
