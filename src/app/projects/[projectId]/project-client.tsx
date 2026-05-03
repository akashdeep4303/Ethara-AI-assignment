"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { messageFromApiError, readJsonResponse } from "@/lib/client-errors";

type Me = { id: string; email: string; name: string };

type Project = {
  id: string;
  name: string;
  description: string | null;
  role: "ADMIN" | "MEMBER";
  ownerId: string;
};

type MemberRow = {
  userId: string;
  role: "ADMIN" | "MEMBER";
  email: string;
  name: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
  assignedToId: string | null;
  createdById: string;
  assignee: { id: string; name: string; email: string } | null;
};

const STATUS_OPTS: TaskRow["status"][] = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_CONFIG = {
  TODO: {
    label: "To Do",
    bg: "#EEF3FB",
    color: "#1746A2",
    border: "#BFCFEE",
    dot: "#3B7EF8",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "#FFF8EC",
    color: "#92400E",
    border: "#FCD88A",
    dot: "#F59E0B",
  },
  DONE: {
    label: "Done",
    bg: "#ECFDF5",
    color: "#065F46",
    border: "#6EE7B7",
    dot: "#10B981",
  },
};

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    ["#DBEAFE", "#1D4ED8"],
    ["#D1FAE5", "#065F46"],
    ["#FEF3C7", "#92400E"],
    ["#FCE7F3", "#9D174D"],
    ["#EDE9FE", "#5B21B6"],
  ];
  const [bg, fg] = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: TaskRow["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-[#E4EAF2] bg-[#F7FAFF] px-3.5 py-2.5 text-[13.5px] text-[#0B1540] placeholder:text-[#B8C4D4] outline-none transition focus:border-[#3B7EF8] focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,126,248,0.10)]";

const selectCls =
  "rounded-[10px] border border-[#E4EAF2] bg-[#F7FAFF] px-3 py-2.5 text-[13.5px] text-[#0B1540] outline-none transition focus:border-[#3B7EF8] focus:bg-white";

export default function ProjectClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [me, setMe] = useState<Me | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [tab, setTab] = useState<"tasks" | "members" | "settings">("tasks");
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newAssignee, setNewAssignee] = useState<string>("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const [settingsName, setSettingsName] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [meRes, projRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/projects/${projectId}`),
      ]);
      const meData = await readJsonResponse(meRes);
      const projData = await readJsonResponse(projRes);

      if (meRes.status === 401) { router.push("/login"); return; }
      if (!meRes.ok) { setError(messageFromApiError(meData, "Could not verify your session.", meRes.status)); return; }
      const meParsed = meData as { user?: Me };
      if (!meParsed.user) { setError("Invalid session response."); return; }
      setMe(meParsed.user);

      if (!projRes.ok) {
        setError(projRes.status === 404 ? "Project not found or you lack access." : messageFromApiError(projData, "Could not load project.", projRes.status));
        return;
      }
      const p = (projData as { project: Project }).project;
      setProject(p);
      setSettingsName(p.name);
      setSettingsDesc(p.description ?? "");

      const [memRes, taskRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/members`),
        fetch(`/api/projects/${projectId}/tasks`),
      ]);
      const memJson = (await readJsonResponse(memRes)) as { members?: MemberRow[] };
      const taskJson = (await readJsonResponse(taskRes)) as { tasks?: TaskRow[] };
      if (memRes.ok) setMembers(memJson.members ?? []);
      if (taskRes.ok) setTasks(taskJson.tasks ?? []);
    } catch {
      setError("Network error loading project.");
    }
  }, [projectId, router]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const highlighted = searchParams.get("task");
  const isAdmin = project?.role === "ADMIN";
  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email)),
    [members]
  );

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body: Record<string, unknown> = {
      title: newTitle.trim(),
      description: newDesc.trim().length ? newDesc : null,
    };
    if (newDue) body.dueDate = newDue;
    if (newAssignee) body.assignedToId = newAssignee;
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not create task", res.status)); return; }
    setNewTitle(""); setNewDesc(""); setNewDue(""); setNewAssignee("");
    loadAll();
  }

  async function patchTask(taskId: string, patch: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not update task", res.status)); return; }
    loadAll();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not delete task", res.status)); return; }
    loadAll();
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not add member", res.status)); return; }
    setInviteEmail("");
    loadAll();
  }

  async function changeRole(uid: string, role: "ADMIN" | "MEMBER") {
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/members/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not update role", res.status)); return; }
    loadAll();
  }

  async function removeMember(uid: string) {
    if (!confirm("Remove this member from the project?")) return;
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/members/${uid}`, { method: "DELETE" });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not remove member", res.status)); return; }
    loadAll();
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: settingsName.trim(), description: settingsDesc.trim() || null }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not update project", res.status)); return; }
    loadAll();
  }

  async function deleteProject() {
    if (!confirm("Delete this entire project and all tasks?")) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    const data = await readJsonResponse(res);
    if (!res.ok) { setError(messageFromApiError(data, "Could not delete project", res.status)); return; }
    router.push("/projects");
    router.refresh();
  }

  function canEditTask(t: TaskRow) {
    if (!me) return false;
    if (isAdmin) return true;
    return t.createdById === me.id || t.assignedToId === me.id;
  }

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

  const now = Date.now();

  const taskCounts = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };

  if (error === "Project not found or you lack access." && !project) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center rounded-[20px] bg-white p-12 text-center"
        style={{ border: "1px solid #E4EAF2" }}
      >
        {/* Icon */}
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-[14px]"
          style={{ background: "#EEF3FB" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B7EF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-[18px] font-bold text-[#0B1540]">Project not found</h2>
        <p className="mt-2 text-[14px] text-[#8492a6]">You don&apos;t have access to this project.</p>
        <Link
          href="/projects"
          className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-[#3B7EF8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#2563EB] transition"
        >
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F0F4FB]"
      style={{ fontFamily: "'Inter', sans-serif", padding: "28px 24px 48px" }}
    >
      <div className="mx-auto max-w-[1100px] space-y-6">

        {/* ── Breadcrumb ── */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3B7EF8] hover:text-[#2563EB] transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All projects
        </Link>

        {/* ── Project header card ── */}
        {project ? (
          <div
            className="overflow-hidden rounded-[20px] bg-white"
            style={{ border: "1px solid #E4EAF2", boxShadow: "0 2px 12px rgba(11,28,110,0.06)" }}
          >
            {/* Blue top stripe */}
            <div
              className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, #3B7EF8 0%, #60A5FA 100%)" }}
            />

            <div className="flex flex-wrap items-start justify-between gap-4 px-7 py-6">
              <div className="flex items-start gap-4">
                {/* Project icon */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]"
                  style={{ background: "#EEF3FB" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B7EF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[22px] font-bold tracking-[-0.4px] text-[#0B1540]">{project.name}</h1>
                  {project.description && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#8492a6]">{project.description}</p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    {/* Role badge */}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-semibold"
                      style={
                        isAdmin
                          ? { background: "#EEF3FB", color: "#1746A2", border: "1px solid #BFCFEE" }
                          : { background: "#F3F4F6", color: "#374151", border: "1px solid #D1D5DB" }
                      }
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {isAdmin ? (
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        ) : (
                          <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>
                        )}
                      </svg>
                      {project.role}
                    </span>

                    {me && (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#B8C4D4]">
                        <Avatar name={me.name} size={18} />
                        {me.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(["TODO", "IN_PROGRESS", "DONE"] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div
                      key={s}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-1.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: cfg.dot }} />
                      <span className="text-[12px] font-semibold" style={{ color: cfg.color }}>
                        {taskCounts[s]} {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-28 animate-pulse rounded-[20px] bg-white" style={{ border: "1px solid #E4EAF2" }} />
        )}

        {/* ── Error banner ── */}
        {error && project && (
          <div
            className="flex items-start gap-3 rounded-[12px] px-4 py-3 text-[13px]"
            style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Tab bar ── */}
        {project && (
          <div
            className="flex gap-1 rounded-[14px] bg-white p-1.5"
            style={{ border: "1px solid #E4EAF2", boxShadow: "0 1px 4px rgba(11,28,110,0.04)" }}
          >
            {(
              [
                ["tasks", "Tasks", <svg key="t" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="6" height="6" rx="1" /><path d="M3 17h6M13 8h8M13 12h5M13 16h8" /></svg>],
                ["members", "Team", <svg key="m" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" /></svg>],
                ...(isAdmin ? [["settings", "Settings", <svg key="s" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>]] : []),
              ] as [string, string, React.ReactNode][]
            ).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id as typeof tab)}
                className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition-all"
                style={
                  tab === id
                    ? { background: "#3B7EF8", color: "#fff", boxShadow: "0 2px 8px rgba(59,126,248,0.30)" }
                    : { color: "#8492a6" }
                }
              >
                {icon}
                {label}
                {id === "tasks" && tasks.length > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={
                      tab === "tasks"
                        ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                        : { background: "#EEF3FB", color: "#3B7EF8" }
                    }
                  >
                    {tasks.length}
                  </span>
                )}
                {id === "members" && members.length > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={
                      tab === "members"
                        ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                        : { background: "#EEF3FB", color: "#3B7EF8" }
                    }
                  >
                    {members.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TASKS TAB */}
        {/* ══════════════════════════════════════════ */}
        {project && tab === "tasks" && (
          <div className="space-y-5">
            {/* New task form */}
            <div
              className="rounded-[20px] bg-white p-6"
              style={{ border: "1px solid #E4EAF2", boxShadow: "0 1px 6px rgba(11,28,110,0.04)" }}
            >
              <div className="mb-5 flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[8px]"
                  style={{ background: "#EEF3FB" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B7EF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <h2 className="text-[15px] font-bold text-[#0B1540]">New task</h2>
              </div>

              <form onSubmit={createTask}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">
                      Title *
                    </label>
                    <input
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">
                      Description
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={2}
                      placeholder="Add more context…"
                      className={inputCls}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">
                      Due date
                    </label>
                    <input
                      type="datetime-local"
                      value={newDue}
                      onChange={(e) => setNewDue(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">
                      Assign to
                    </label>
                    <select
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className={`${selectCls} w-full`}
                    >
                      <option value="">Unassigned</option>
                      {(isAdmin ? sortedMembers : sortedMembers.filter((m) => me && m.userId === me.id)).map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                    {!isAdmin && (
                      <p className="mt-1 text-[11px] text-[#B8C4D4]">
                        Members may only self-assign.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(59,126,248,0.35)]"
                    style={{ background: "#3B7EF8", boxShadow: "0 2px 10px rgba(59,126,248,0.25)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add task
                  </button>
                </div>
              </form>
            </div>

            {/* Task list */}
            <div
              className="overflow-hidden rounded-[20px] bg-white"
              style={{ border: "1px solid #E4EAF2", boxShadow: "0 1px 6px rgba(11,28,110,0.04)" }}
            >
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px]"
                    style={{ background: "#EEF3FB" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B7EF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="6" height="6" rx="1" /><path d="M3 17h6M13 8h8M13 12h5M13 16h8" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-[#0B1540]">No tasks yet</p>
                  <p className="mt-1 text-[13px] text-[#B8C4D4]">Create your first task above</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F0F4FB]">
                  {tasks.map((t, idx) => {
                    const overdue = t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "DONE";
                    const isHighlighted = highlighted === t.id;
                    return (
                      <li
                        key={t.id}
                        className="px-6 py-4 transition-colors hover:bg-[#FAFBFF]"
                        style={isHighlighted ? { background: "#EEF3FB", borderLeft: "3px solid #3B7EF8" } : {}}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          {/* Left content */}
                          <div className="flex min-w-0 gap-3">
                            {/* Number */}
                            <span
                              className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                              style={{ background: "#EEF3FB", color: "#3B7EF8" }}
                            >
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-[14px] font-semibold text-[#0B1540]">{t.title}</h3>
                                <StatusBadge status={t.status} />
                                {overdue && (
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                    style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }}
                                  >
                                    Overdue
                                  </span>
                                )}
                              </div>
                              {t.description && (
                                <p className="mt-1.5 text-[13px] leading-relaxed text-[#8492a6]">{t.description}</p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                {t.assignee && (
                                  <span className="flex items-center gap-1.5 text-[12px] text-[#8492a6]">
                                    <Avatar name={t.assignee.name} size={18} />
                                    {t.assignee.name}
                                  </span>
                                )}
                                {!t.assignee && (
                                  <span className="text-[12px] text-[#B8C4D4]">Unassigned</span>
                                )}
                                {t.dueDate && (
                                  <span className="flex items-center gap-1 text-[12px] text-[#B8C4D4]">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {fmt(t.dueDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right actions */}
                          {canEditTask(t) ? (
                            <div className="flex flex-shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                              {/* Status select */}
                              <select
                                value={t.status}
                                onChange={(e) => patchTask(t.id, { status: e.target.value as TaskRow["status"] })}
                                className={`${selectCls} text-[12px]`}
                                style={{ padding: "5px 10px" }}
                              >
                                {STATUS_OPTS.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_CONFIG[s].label}
                                  </option>
                                ))}
                              </select>

                              <div className="flex gap-1.5">
                                {/* Set due */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = prompt("Due datetime (YYYY-MM-DDTHH:MM)", t.dueDate ?? "");
                                    if (next === null) return;
                                    patchTask(t.id, { dueDate: next.trim().length ? next : null });
                                  }}
                                  className="rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold text-[#3B7EF8] transition hover:bg-[#EEF3FB]"
                                  style={{ border: "1px solid #BFCFEE" }}
                                >
                                  Set due
                                </button>

                                {/* Assignee (admin) */}
                                {isAdmin && (
                                  <select
                                    value={t.assignedToId ?? ""}
                                    onChange={(e) =>
                                      patchTask(t.id, { assignedToId: e.target.value.length ? e.target.value : null })
                                    }
                                    className={`${selectCls} text-[11px]`}
                                    style={{ padding: "5px 8px" }}
                                  >
                                    <option value="">Unassigned</option>
                                    {sortedMembers.map((m) => (
                                      <option key={m.userId} value={m.userId}>{m.name}</option>
                                    ))}
                                  </select>
                                )}

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => deleteTask(t.id)}
                                  className="rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                                  style={{ border: "1px solid #FCA5A5" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                              style={{ background: "#F3F4F6", color: "#9CA3AF" }}
                            >
                              View only
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* MEMBERS TAB */}
        {/* ══════════════════════════════════════════ */}
        {project && tab === "members" && (
          <div className="grid gap-5 lg:grid-cols-5">
            {/* Invite panel */}
            <div className="lg:col-span-2">
              {isAdmin ? (
                <div
                  className="rounded-[20px] bg-white p-6"
                  style={{ border: "1px solid #E4EAF2", boxShadow: "0 1px 6px rgba(11,28,110,0.04)" }}
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: "#EEF3FB" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B7EF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </div>
                    <h2 className="text-[15px] font-bold text-[#0B1540]">Invite member</h2>
                  </div>

                  <p className="mb-4 text-[12px] leading-relaxed text-[#B8C4D4]">
                    They must have a TaskFlow account. Use their exact account email.
                  </p>

                  <form onSubmit={inviteMember} className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">Email</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")}
                        className={`${selectCls} w-full`}
                      >
                        <option value="MEMBER">Member — tasks & assignments</option>
                        <option value="ADMIN">Admin — manage team & settings</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-bold text-white transition hover:bg-[#2563EB]"
                      style={{ background: "#3B7EF8" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add to team
                    </button>
                  </form>
                </div>
              ) : (
                <div
                  className="rounded-[20px] bg-white p-6"
                  style={{ border: "1px solid #E4EAF2" }}
                >
                  <p className="text-[13px] text-[#B8C4D4]">
                    Only admins can invite or promote members.
                  </p>
                </div>
              )}
            </div>

            {/* Members list */}
            <div className="lg:col-span-3">
              <div
                className="overflow-hidden rounded-[20px] bg-white"
                style={{ border: "1px solid #E4EAF2", boxShadow: "0 1px 6px rgba(11,28,110,0.04)" }}
              >
                <div className="border-b border-[#F0F4FB] px-6 py-4">
                  <h2 className="text-[15px] font-bold text-[#0B1540]">
                    Team{" "}
                    <span
                      className="ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: "#EEF3FB", color: "#3B7EF8" }}
                    >
                      {members.length}
                    </span>
                  </h2>
                </div>
                <ul className="divide-y divide-[#F0F4FB]">
                  {members.map((m) => (
                    <li key={m.userId} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size={36} />
                        <div>
                          <p className="text-[14px] font-semibold text-[#0B1540]">{m.name}</p>
                          <p className="text-[12px] text-[#B8C4D4]">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {isAdmin ? (
                          <>
                            <select
                              value={m.role}
                              onChange={(e) => changeRole(m.userId, e.target.value as "ADMIN" | "MEMBER")}
                              className={`${selectCls} text-[12px]`}
                              style={{ padding: "5px 10px" }}
                            >
                              <option value="MEMBER">Member</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeMember(m.userId)}
                              className="rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                              style={{ border: "1px solid #FCA5A5" }}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <span
                            className="rounded-full px-3 py-1 text-[11px] font-semibold capitalize"
                            style={
                              m.role === "ADMIN"
                                ? { background: "#EEF3FB", color: "#1746A2", border: "1px solid #BFCFEE" }
                                : { background: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }
                            }
                          >
                            {m.role.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* SETTINGS TAB */}
        {/* ══════════════════════════════════════════ */}
        {project && tab === "settings" && isAdmin && (
          <div className="max-w-[600px] space-y-5">
            {/* Project details form */}
            <div
              className="rounded-[20px] bg-white p-6"
              style={{ border: "1px solid #E4EAF2", boxShadow: "0 1px 6px rgba(11,28,110,0.04)" }}
            >
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: "#EEF3FB" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B7EF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h2 className="text-[15px] font-bold text-[#0B1540]">Project details</h2>
              </div>

              <form onSubmit={saveSettings} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">
                    Project name *
                  </label>
                  <input
                    required
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8492a6]">
                    Description
                  </label>
                  <textarea
                    value={settingsDesc}
                    onChange={(e) => setSettingsDesc(e.target.value)}
                    rows={3}
                    placeholder="What is this project about?"
                    className={inputCls}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#2563EB]"
                  style={{ background: "#3B7EF8" }}
                >
                  Save changes
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div
              className="rounded-[20px] p-6"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <h2 className="text-[15px] font-bold text-[#991B1B]">Danger zone</h2>
              </div>
              <p className="mb-4 text-[13px] text-[#DC2626]/70">
                Deleting this project permanently removes all tasks and membership for everyone. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={deleteProject}
                className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#B91C1C]"
                style={{ background: "#DC2626" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete project…
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}