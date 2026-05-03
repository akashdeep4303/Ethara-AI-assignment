"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { messageFromApiError, readJsonResponse } from "@/lib/client-errors";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description.trim().length ? description : undefined,
        }),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) {
        setError(messageFromApiError(data, "Unable to create project", res.status));
        return;
      }
      const created = data as { project: { id: string } };
      router.push(`/projects/${created.project.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/projects" className="text-sm font-medium text-blue-700 hover:text-blue-600">
          ← Back to projects
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Create project</h1>
        <p className="mt-2 text-slate-600">
          Build a workspace for your team. You&apos;ll be project admin by default.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-2xl p-6">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <label className="block text-sm font-medium text-slate-700">
          Name <span className="text-red-600">*</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-900/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Q2 Launch Readiness"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Description <span className="font-normal text-slate-500">(optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-slate-900/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Goals, milestones, stakeholders..."
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="soft-glow rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create project"}
          </button>
          <Link
            href="/projects"
            className="rounded-xl border border-slate-900/10 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
