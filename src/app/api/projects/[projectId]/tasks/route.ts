import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { assertAdmin, getProjectAccess } from "@/lib/project-access";
import { jsonError } from "@/lib/errors";
import { createTaskSchema, parseJson } from "@/lib/validations";

type Ctx = { params: Promise<{ projectId: string }> };

function serializeTask(
  row: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueDate: Date | null;
    assignedToId: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: { id: string; name: string; email: string } | null;
    createdBy?: { id: string; name: string; email: string };
  }
) {
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
    creator: row.createdBy
      ? { id: row.createdBy.id, name: row.createdBy.name, email: row.createdBy.email }
      : undefined,
  };
}

export async function GET(_request: Request, context: Ctx) {
  return withApi("GET /api/projects/[projectId]/tasks", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    const now = new Date();
    return Response.json({
      tasks: tasks.map(serializeTask),
      myRole: access.role,
      counts: {
        total: tasks.length,
        overdue: tasks.filter(
          (t) => t.dueDate !== null && t.dueDate < now && t.status !== "DONE"
        ).length,
      },
    });
  });
}

export async function POST(request: Request, context: Ctx) {
  return withApi("POST /api/projects/[projectId]/tasks", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const { projectId } = await context.params;
    const access = await getProjectAccess(userId, projectId);
    if (!access) return jsonError("Project not found", 404);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(createTaskSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, status, dueDate, assignedToId } = parsed.data;

    if (!assertAdmin(access.role)) {
      const allowedAssignment = assignedToId === undefined || assignedToId === null || assignedToId === userId;
      if (!allowedAssignment) {
        return jsonError("Members may only assign tasks to themselves or leave them unassigned", 403);
      }
    }

    if (assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assignedToId, projectId } },
      });
      if (!isMember) {
        return jsonError("Assigned user must be a project member", 400);
      }
    }

    const created = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description ?? null,
        status: status ?? "TODO",
        dueDate: dueDate ?? null,
        assignedToId: assignedToId ?? null,
        createdById: userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return Response.json({ task: serializeTask(created) }, { status: 201 });
  });
}
