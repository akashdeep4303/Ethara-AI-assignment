import { Suspense } from "react";
import ProjectClient from "./project-client";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <ProjectClient projectId={projectId} />
    </Suspense>
  );
}
