import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { assertAdmin, canMemberMutateTask, getProjectAccess } from "@/lib/project-access";
import { jsonError } from "@/lib/errors";
import { parseJson, patchTaskSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ projectId: string; taskId: string }> };

async function ensureTask(projectId: string, taskId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
}

function serialize(row: NonNullable<Awaited<ReturnType<typeof ensureTask>>>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.dueDate,
    assignedToId: row.assignedToId,
    createdById: row.createdById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    assignee: row.assignedTo
      ? { id: row.assignedTo.id, name: row.assignedTo.name, email: row.assignedTo.email }
      : null,
    creator: {
      id: row.createdBy.id,
      name: row.createdBy.name,
      email: row.createdBy.email,
    },
  };
}

export async function PATCH(request: Request, context: Ctx) {
  return withApi("PATCH /api/projects/[projectId]/tasks/[taskId]", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId, taskId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);

    const existing = await ensureTask(projectId, taskId);
    if (!existing) return jsonError("Task not found", 404);

    if (!canMemberMutateTask(access.role, userId, existing.createdById, existing.assignedToId)) {
      return jsonError("You can only edit tasks you created or that are assigned to you", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(patchTaskSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const patch = parsed.data;
    const isAdmin = assertAdmin(access.role);

    if (!isAdmin) {
      if (patch.title !== undefined || patch.description !== undefined || patch.assignedToId !== undefined) {
        return jsonError("Only admins can change title, description, or assignee", 403);
      }
    }

    if (patch.assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: patch.assignedToId, projectId } },
      });
      if (!isMember) {
        return jsonError("Assigned user must be a project member", 400);
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.dueDate !== undefined && { dueDate: patch.dueDate }),
        ...(patch.assignedToId !== undefined && { assignedToId: patch.assignedToId }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return Response.json({ task: serialize(updated) });
  });
}

export async function DELETE(_request: Request, context: Ctx) {
  return withApi("DELETE /api/projects/[projectId]/tasks/[taskId]", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId, taskId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);

    const existing = await ensureTask(projectId, taskId);
    if (!existing) return jsonError("Task not found", 404);

    if (!canMemberMutateTask(access.role, userId, existing.createdById, existing.assignedToId)) {
      return jsonError("You can only delete tasks you created or that are assigned to you", 403);
    }

    await prisma.task.delete({ where: { id: taskId } });

    return Response.json({ ok: true });
  });
}
