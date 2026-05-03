import type { ProjectRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProjectAccess = {
  role: ProjectRole;
  projectId: string;
};

export async function getProjectAccess(
  userId: string,
  projectId: string
): Promise<ProjectAccess | null> {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { role: true, projectId: true },
  });
  return member ?? null;
}

export function assertAdmin(role: ProjectRole): boolean {
  return role === "ADMIN";
}

/** Member may edit/delete a task they created or are assigned to. */
export function canMemberMutateTask(
  role: ProjectRole,
  userId: string,
  createdById: string,
  assignedToId: string | null
): boolean {
  if (role === "ADMIN") return true;
  return createdById === userId || assignedToId === userId;
}
