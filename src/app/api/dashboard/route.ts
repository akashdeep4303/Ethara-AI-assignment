import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { jsonError } from "@/lib/errors";

export async function GET() {
  return withApi("GET /api/dashboard", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) return jsonError("Unauthorized", 401);

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = memberships.map((m) => m.projectId);
    const now = new Date();

    if (projectIds.length === 0) {
      return Response.json({
        summary: {
          totalTasks: 0,
          overdue: 0,
          todo: 0,
          inProgress: 0,
          done: 0,
          assignedToMe: 0,
        },
        overdueTasks: [],
        myTasksRecent: [],
      });
    }

    const allTasksInProjects = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    });

    const assignedToMe = allTasksInProjects.filter((t) => t.assignedToId === userId);
    const overdue = allTasksInProjects.filter(
      (t) => t.dueDate !== null && t.dueDate < now && t.status !== "DONE"
    );

    const todo = allTasksInProjects.filter((t) => t.status === "TODO");
    const inProgress = allTasksInProjects.filter((t) => t.status === "IN_PROGRESS");
    const done = allTasksInProjects.filter((t) => t.status === "DONE");

    const overdueTasks = overdue.slice(0, 20).map((t) => ({
      id: t.id,
      projectId: t.projectId,
      projectName: t.project.name,
      title: t.title,
      dueDate: t.dueDate,
      status: t.status,
      assignee: t.assignedTo
        ? { id: t.assignedTo.id, name: t.assignedTo.name, email: t.assignedTo.email }
        : null,
      mine: t.assignedToId === userId,
    }));

    const myTasksRecent = assignedToMe.slice(0, 15).map((t) => ({
      id: t.id,
      projectId: t.projectId,
      projectName: t.project.name,
      title: t.title,
      dueDate: t.dueDate,
      status: t.status,
    }));

    return Response.json({
      summary: {
        totalTasks: allTasksInProjects.length,
        overdue: overdue.length,
        todo: todo.length,
        inProgress: inProgress.length,
        done: done.length,
        assignedToMe: assignedToMe.length,
      },
      overdueTasks,
      myTasksRecent,
    });
  });
}
