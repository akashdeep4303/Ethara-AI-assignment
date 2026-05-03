"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { messageFromApiError, readJsonResponse } from "@/lib/client-errors";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  role: "ADMIN" | "MEMBER";
  memberCount: number;
  taskCount: number;
};

/* ─── Inline SVG icons ─── */
function Ic({ n, c = "h-4 w-4" }: { n: string; c?: string }) {
  const d: Record<string, string> = {
    plus:    "M12 5v14m-7-7h14",
    folder:  "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z",
    users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    task:    "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    arr:     "M5 12h14M12 5l7 7-7 7",
    alert:   "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    sparkle: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
    dot3:    "M5 12h.01M12 12h.01M19 12h.01",
  };
  const isStroke = ["plus","folder","users","task","shield","arr","alert","sparkle","dot3"].includes(n);
  return (
    <svg className={c} viewBox="0 0 24 24"
      fill={isStroke ? "none" : "currentColor"}
      stroke={isStroke ? "currentColor" : "none"}
      strokeWidth={isStroke ? "2" : undefined}
      strokeLinecap={isStroke ? "round" : undefined}
      strokeLinejoin={isStroke ? "round" : undefined}>
      <path d={d[n] ?? d.dot3} />
    </svg>
  );
}

/* ─── Project card avatar (colored initial block) ─── */
const GRAD_PAIRS = [
  ["from-blue-500 to-blue-700",       "bg-blue-50",  "text-blue-600"],
  ["from-violet-500 to-violet-700",   "bg-violet-50","text-violet-600"],
  ["from-cyan-500 to-cyan-700",       "bg-cyan-50",  "text-cyan-600"],
  ["from-emerald-500 to-emerald-700", "bg-emerald-50","text-emerald-600"],
  ["from-amber-400 to-amber-600",     "bg-amber-50", "text-amber-600"],
  ["from-rose-500 to-rose-700",       "bg-rose-50",  "text-rose-600"],
  ["from-indigo-500 to-indigo-700",   "bg-indigo-50","text-indigo-600"],
];
function pickGrad(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRAD_PAIRS[h % GRAD_PAIRS.length];
}

/* ─── Skeleton ─── */
function Skel() {
  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [go, setGo]             = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const res  = await fetch("/api/projects");
        const data = await readJsonResponse(res);
        if (!res.ok) {
          if (!dead) setError(messageFromApiError(data, "Could not load projects", res.status));
          return;
        }
        const d = data as { projects: ProjectRow[] };
        if (!dead) {
          setProjects(d.projects);
          requestAnimationFrame(() => setGo(true));
        }
      } catch { if (!dead) setError("Could not load projects"); }
    })();
    return () => { dead = true; };
  }, []);

  const total     = projects?.length ?? 0;
  const adminCount  = projects?.filter(p => p.role === "ADMIN").length ?? 0;
  const totalTasks  = projects?.reduce((s, p) => s + p.taskCount, 0) ?? 0;
  const totalMembers = projects?.reduce((s, p) => s + p.memberCount, 0) ?? 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pj-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background:
            radial-gradient(ellipse 70% 45% at 0% 0%,   rgba(219,234,254,.5) 0%, transparent 65%),
            radial-gradient(ellipse 55% 40% at 100% 100%, rgba(224,231,255,.45) 0%, transparent 65%),
            #ffffff;
          min-height: 100vh;
        }

        /* Hero */
        .pj-hero {
          background: linear-gradient(120deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%);
          border-radius: 0 0 36px 36px;
          position: relative; overflow: hidden;
        }
        .pj-hero::after {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 50% 80% at 90% 50%, rgba(255,255,255,.07) 0%, transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 39px,
              rgba(255,255,255,.025) 39px, rgba(255,255,255,.025) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px,
              rgba(255,255,255,.025) 39px, rgba(255,255,255,.025) 40px);
        }

        /* Hero stat pills */
        .h-stat {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 14px;
          backdrop-filter: blur(8px);
          padding: 14px 20px;
          min-width: 100px;
        }

        /* Card */
        .pj-card {
          background: #fff;
          border-radius: 22px;
          border: 1px solid rgba(226,232,240,.9);
          box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 18px rgba(15,23,42,.05);
          transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease, border-color .22s ease;
          text-decoration: none;
          display: block;
        }
        .pj-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(37,99,235,.13), 0 2px 6px rgba(0,0,0,.05);
          border-color: rgba(147,197,253,.7);
        }
        .pj-card:hover .card-arrow { opacity: 1; transform: translateX(0); }
        .card-arrow {
          opacity: 0; transform: translateX(-6px);
          transition: opacity .2s ease, transform .2s ease;
        }

        /* Progress bar fill */
        .prog-fill { transition: width 1.1s cubic-bezier(.4,0,.2,1); }

        /* Stagger animation */
        @keyframes su { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .su { opacity: 0; }
        .su.go { animation: su .5s cubic-bezier(.22,1,.36,1) forwards; }

        /* New project button */
        .new-btn {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border-radius: 14px; border: none;
          padding: 0 22px; height: 44px;
          font-size: 13.5px; font-weight: 700;
          color: #fff; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 8px rgba(37,99,235,.35), 0 1px 2px rgba(0,0,0,.08);
          transition: box-shadow .2s ease, transform .2s ease;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .new-btn:hover {
          box-shadow: 0 6px 20px rgba(37,99,235,.45), 0 1px 4px rgba(0,0,0,.1);
          transform: translateY(-1px);
        }

        /* Error */
        .err-box {
          display: flex; align-items: center; gap: 10px;
          background: #fff1f2; border: 1px solid #fecdd3;
          border-radius: 14px; padding: 12px 16px;
          color: #be123c; font-size: 13.5px;
        }
      `}</style>

      <div className="pj-wrap">

        {/* ══════ HERO ══════ */}
        <div className="pj-hero px-6 pt-10 pb-20 sm:px-10 sm:pt-12">
          <div className="relative z-10 mx-auto max-w-7xl">

            {/* Top row */}
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <span className="inline-block rounded-lg bg-white/15 px-3 py-1 text-[11px]
                                 font-bold uppercase tracking-[2px] text-blue-200 mb-3">
                  Workspace
                </span>
                <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.6px" }}
                  className="text-[2.15rem] font-extrabold leading-tight text-white sm:text-4xl">
                  Projects
                </h1>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-blue-200/80">
                  Organize work by initiative, control access with roles, and keep team execution visible.
                </p>
              </div>

              <Link href="/projects/new" className="new-btn self-start mt-1">
                <Ic n="plus" c="h-4 w-4" />
                New Project
              </Link>
            </div>

            {/* Hero stats row */}
            {projects !== null && (
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { label: "Total Projects", val: total,        icon: "folder"  },
                  { label: "Admin Access",   val: adminCount,   icon: "shield"  },
                  { label: "Total Tasks",    val: totalTasks,   icon: "task"    },
                  { label: "Team Members",   val: totalMembers, icon: "users"   },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="h-stat">
                    <div className="flex items-center gap-2 text-blue-300">
                      <Ic n={icon} c="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="mt-1.5 text-2xl font-extrabold text-white">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══════ CONTENT ══════ */}
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pb-16">

          {/* Error */}
          {error && (
            <div className="err-box mt-6">
              <Ic n="alert" c="h-4 w-4 shrink-0 text-rose-500" />
              {error}
            </div>
          )}

          {/* Grid */}
          <div className="-mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects === null ? (
              Array.from({ length: 6 }).map((_, i) => <Skel key={i} />)
            ) : projects.length === 0 ? (
              /* ── Empty state ── */
              <div className={`col-span-full su ${go ? "go" : ""}`}>
                <div className="flex flex-col items-center justify-center gap-4 rounded-[22px]
                                border border-dashed border-slate-200 bg-white/60 px-8 py-20 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl
                                   bg-blue-50 text-blue-400">
                    <Ic n="folder" c="h-8 w-8" />
                  </span>
                  <div>
                    <p className="text-[16px] font-bold text-slate-800">No projects yet</p>
                    <p className="mt-1 text-[13.5px] text-slate-400">
                      Create your first project to start organizing work.
                    </p>
                  </div>
                  <Link href="/projects/new" className="new-btn mt-2">
                    <Ic n="plus" c="h-4 w-4" />
                    Create First Project
                  </Link>
                </div>
              </div>
            ) : (
              projects.map((p, i) => {
                const [grad, lightBg, textColor] = pickGrad(p.id);
                const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const taskPct  = p.taskCount > 0 ? Math.min(100, Math.round((1 / p.taskCount) * 100)) : 0;

                return (
                  <Link key={p.id} href={`/projects/${p.id}`}
                    className={`pj-card su ${go ? "go" : ""}`}
                    style={{ animationDelay: `${i * 60}ms` }}>

                    <div className="p-6">
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar */}
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center
                                           rounded-2xl bg-gradient-to-br text-white text-[13px]
                                           font-extrabold shadow-sm ${grad}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-[15px] font-bold text-slate-900
                                           group-hover:text-blue-700 leading-snug">
                              {p.name}
                            </h2>
                            <p className="mt-0.5 text-[12px] text-slate-400 truncate">
                              {p.description ?? "No description yet."}
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <span className={`card-arrow mt-0.5 shrink-0 ${textColor}`}>
                          <Ic n="arr" c="h-4 w-4" />
                        </span>
                      </div>

                      {/* Description (full line if avatar row too short) */}
                      {p.description && p.description.length > 40 && (
                        <p className="mt-3 line-clamp-2 text-[13px] text-slate-500 leading-relaxed">
                          {p.description}
                        </p>
                      )}

                      {/* Divider */}
                      <div className="mt-5 h-px bg-slate-100" />

                      {/* Footer stats */}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-md ${lightBg} ${textColor}`}>
                              <Ic n="task" c="h-3 w-3" />
                            </span>
                            <span className="font-semibold text-slate-700">{p.taskCount}</span>
                            <span>tasks</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-md ${lightBg} ${textColor}`}>
                              <Ic n="users" c="h-3 w-3" />
                            </span>
                            <span className="font-semibold text-slate-700">{p.memberCount}</span>
                            <span>members</span>
                          </div>
                        </div>

                        {/* Role badge */}
                        {p.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 rounded-full
                                           bg-blue-50 px-2.5 py-1 text-[11px] font-bold
                                           text-blue-700 ring-1 ring-blue-200/60">
                            <Ic n="shield" c="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full
                                           bg-slate-50 px-2.5 py-1 text-[11px] font-semibold
                                           text-slate-500 ring-1 ring-slate-200/60">
                            <Ic n="users" c="h-3 w-3" />
                            Member
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom color accent bar */}
                    <div className={`h-[3px] w-full rounded-b-[22px] bg-gradient-to-r ${grad} opacity-60`} />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}