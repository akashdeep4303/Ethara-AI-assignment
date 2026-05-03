"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { messageFromApiError, readJsonResponse } from "@/lib/client-errors";

type Summary = {
  totalTasks: number; overdue: number; todo: number;
  inProgress: number; done: number; assignedToMe: number;
};
type Overdue = {
  id: string; projectId: string; projectName: string;
  title: string; dueDate: string | null; status: string; mine: boolean;
};
type MyTask = {
  id: string; projectId: string; projectName: string;
  title: string; dueDate: string | null; status: string;
};

/* ─── Animated SVG Donut ─── */
function DonutRing({ pct }: { pct: number }) {
  const r = 48, circ = 2 * Math.PI * r;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="10" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="url(#dg)" strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
      <text x="64" y="59" textAnchor="middle" fontSize="24" fontWeight="800"
        fill="#fff" fontFamily="'Plus Jakarta Sans',sans-serif">{pct}%</text>
      <text x="64" y="76" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.65)"
        fontFamily="'Plus Jakarta Sans',sans-serif" letterSpacing="1.5">DONE</text>
    </svg>
  );
}

/* ─── Progress bar ─── */
function Bar({ v, max, color }: { v: number; max: number; color: string }) {
  const w = max > 0 ? Math.max(3, Math.round((v / max) * 100)) : 0;
  return (
    <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`}
        style={{ width: `${w}%`, transition: "width 1.1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

/* ─── Status pill ─── */
function Pill({ s }: { s: string }) {
  const k = s.toLowerCase().replace(/ /g, "_");
  const cls =
    k === "done"        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70" :
    k === "in_progress" ? "bg-blue-50 text-blue-700 ring-blue-200/70" :
                          "bg-amber-50 text-amber-700 ring-amber-200/70";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 capitalize ${cls}`}>
      {s.replace(/_/g, " ")}
    </span>
  );
}

/* ─── Skeleton card ─── */
function Skel() {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="mt-5 h-8 w-10 animate-pulse rounded-lg bg-slate-100" />
      <div className="mt-4 h-[3px] w-full animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

/* ─── Inline SVG icons ─── */
function Ic({ n, c = "h-[17px] w-[17px]" }: { n: string; c?: string }) {
  const d: Record<string, string> = {
    grid:    "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
    user:    "M12 12c2.67 0 4.8-2.13 4.8-4.8S14.67 2.4 12 2.4 7.2 4.53 7.2 7.2 9.33 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
    warn:    "M12 2L1 21h22L12 2zm0 4l7.5 13H4.5L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z",
    inbox:   "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
    bolt:    "M13 2 3 14h9l-1 8 10-12h-9z",
    check:   "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    alert:   "M11 15h2v2h-2zm0-8h2v6h-2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    cal:     "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
    arr:     "M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z",
    dot:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  };
  return <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d={d[n] ?? d.dot} /></svg>;
}

const STATS = [
  { k: "totalTasks",   label: "Total Tasks",    icon: "grid",  iconBg: "from-blue-500 to-blue-700",    bar: "bg-blue-500"    },
  { k: "assignedToMe", label: "Assigned to Me", icon: "user",  iconBg: "from-violet-500 to-violet-700",bar: "bg-violet-500"  },
  { k: "overdue",      label: "Overdue",        icon: "warn",  iconBg: "from-rose-500 to-rose-700",    bar: "bg-rose-500"    },
  { k: "todo",         label: "To Do",          icon: "inbox", iconBg: "from-amber-400 to-amber-600",  bar: "bg-amber-400"   },
  { k: "inProgress",   label: "In Progress",    icon: "bolt",  iconBg: "from-cyan-500 to-cyan-700",    bar: "bg-cyan-500"    },
  { k: "done",         label: "Done",           icon: "check", iconBg: "from-emerald-500 to-emerald-700",bar:"bg-emerald-500"},
] as const;

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [overdue, setOverdue] = useState<Overdue[]>([]);
  const [recent, setRecent]   = useState<MyTask[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [go, setGo]           = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const res  = await fetch("/api/dashboard");
        const data = await readJsonResponse(res);
        if (!res.ok) { if (!dead) setError(messageFromApiError(data, "Could not load dashboard", res.status)); return; }
        if (!dead) {
          const d = data as { summary: Summary; overdueTasks: Overdue[]; myTasksRecent: MyTask[] };
          setSummary(d.summary);
          setOverdue(d.overdueTasks ?? []);
          setRecent(d.myTasksRecent ?? []);
          requestAnimationFrame(() => setGo(true));
        }
      } catch { if (!dead) setError("Could not load dashboard"); }
    })();
    return () => { dead = true; };
  }, []);

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

  const pct = summary?.totalTasks ? Math.round((summary.done / summary.totalTasks) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        .db-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          /* Beautiful clean page background: white with very soft blue radial glow corners */
          background:
            radial-gradient(ellipse 70% 45% at 0% 0%,   rgba(219,234,254,.5) 0%, transparent 65%),
            radial-gradient(ellipse 55% 40% at 100% 100%, rgba(224,231,255,.45) 0%, transparent 65%),
            #ffffff;
          min-height: 100vh;
        }

        /* Top gradient bar */
        .hero {
          background: linear-gradient(120deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%);
          border-radius: 0 0 36px 36px;
          position: relative; overflow: hidden;
        }
        /* Subtle mesh overlay */
        .hero::after {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 50% 80% at 90% 50%, rgba(255,255,255,.07) 0%, transparent 60%),
            repeating-linear-gradient(
              0deg, transparent, transparent 39px,
              rgba(255,255,255,.025) 39px, rgba(255,255,255,.025) 40px
            ),
            repeating-linear-gradient(
              90deg, transparent, transparent 39px,
              rgba(255,255,255,.025) 39px, rgba(255,255,255,.025) 40px
            );
        }

        /* Card */
        .card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(226,232,240,.9);
          box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 18px rgba(15,23,42,.05);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .stat-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(37,99,235,.12), 0 1px 4px rgba(0,0,0,.05);
        }
        .panel-card { background:#fff; border-radius:22px;
          border:1px solid rgba(226,232,240,.9);
          box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 6px 24px rgba(15,23,42,.06); overflow:hidden; }

        /* Row hover */
        .tr { border-left: 3px solid transparent; transition: background .14s ease; }
        .tr:hover { background: rgba(239,246,255,.65); }
        .tr-mine { border-left-color: #3b82f6; }

        /* Stagger animation */
        @keyframes su { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        .su { opacity: 0; }
        .su.go { animation: su .55s cubic-bezier(.22,1,.36,1) forwards; }

        /* Pulse live dot */
        @keyframes lp { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.45)} 60%{box-shadow:0 0 0 5px rgba(239,68,68,0)} }
        .ld { animation: lp 1.8s ease infinite; }

        /* Number pop */
        @keyframes np { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
        .np { animation: np .4s cubic-bezier(.34,1.56,.64,1) .1s both; }
      `}</style>

      <div className="db-wrap">

        {/* ══════ HERO HEADER ══════ */}
        <div className="hero px-6 pt-10 pb-20 sm:px-10 sm:pt-12">
          <div className="relative z-10 mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="inline-block rounded-lg bg-white/15 px-3 py-1 text-[11px]
                               font-bold uppercase tracking-[2px] text-blue-200 mb-3">
                Command Centre
              </span>
              <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.6px" }}
                className="text-[2.15rem] font-extrabold leading-tight text-white sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-blue-200/80">
                Live execution health across all projects — risks, workload, and momentum at a glance.
              </p>
            </div>

            {/* Donut widget */}
            {summary && (
              <div className="flex items-center gap-5 rounded-2xl border border-white/15
                              bg-white/10 px-6 py-4 backdrop-blur-sm">
                <DonutRing pct={pct} />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-blue-300">Overall</p>
                  <p className="text-xl font-extrabold text-white leading-tight">
                    {summary.done}
                    <span className="ml-1 text-sm font-medium text-blue-200">
                      / {summary.totalTasks} done
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {[
                      ["bg-amber-300",  `${summary.todo} todo`],
                      ["bg-cyan-300",   `${summary.inProgress} wip`],
                      ["bg-emerald-300",`${summary.done} done`],
                    ].map(([dot, txt]) => (
                      <span key={txt as string} className="flex items-center gap-1.5 text-[12px] text-blue-100">
                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                        {txt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════ CONTENT ══════ */}
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pb-16">

          {/* ── STAT CARDS (float up over hero) ── */}
          <div className="-mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {!summary
              ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} />)
              : STATS.map(({ k, label, icon, iconBg, bar }, i) => {
                  const val = summary[k as keyof Summary] as number;
                  const hot = k === "overdue" && val > 0;
                  return (
                    <div key={k}
                      className={`card stat-lift p-5 su ${go ? "go" : ""}`}
                      style={{ animationDelay: `${i * 65}ms` }}>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl
                                          bg-gradient-to-br text-white shadow-sm ${iconBg}`}>
                          <Ic n={icon} />
                        </span>
                      </div>
                      <p className={`np mt-4 text-[2rem] font-extrabold leading-none tracking-tight ${hot ? "text-rose-600" : "text-slate-900"}`}>
                        {val}
                      </p>
                      {hot && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">Needs attention</p>
                      )}
                      <Bar v={val} max={summary.totalTasks} color={bar} />
                    </div>
                  );
                })}
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200
                            bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <Ic n="alert" c="h-4 w-4 shrink-0 text-rose-500" />
              {error}
            </div>
          )}

          {/* ── TWO PANELS ── */}
          <div className={`mt-6 grid gap-6 lg:grid-cols-2 su ${go ? "go" : ""}`}
            style={{ animationDelay: "450ms" }}>

            {/* OVERDUE PANEL */}
            <div className="panel-card flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl
                                   bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm">
                    <Ic n="warn" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Overdue & At Risk</h2>
                    <p className="text-[12px] text-slate-400">Tasks past their deadline</p>
                  </div>
                </div>
                {overdue.length > 0 && (
                  <div className="flex items-center gap-2 rounded-full border border-rose-100
                                  bg-rose-50 px-3 py-1.5">
                    <span className="ld h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-[12px] font-bold text-rose-600">{overdue.length} overdue</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {overdue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 py-16 px-6 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl
                                     bg-emerald-50 text-emerald-500">
                      <Ic n="check" c="h-7 w-7" />
                    </span>
                    <p className="font-bold text-slate-800">All clear — great momentum!</p>
                    <p className="text-[13px] text-slate-400">No tasks are currently overdue.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {overdue.map((t, idx) => (
                      <li key={`${t.projectId}-${t.id}`}>
                        <Link href={`/projects/${t.projectId}?task=${encodeURIComponent(t.id)}`}
                          className={`tr flex items-start gap-4 px-6 py-4 ${t.mine ? "tr-mine" : ""}`}>
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
                                          rounded-xl bg-rose-50 text-[12px] font-extrabold text-rose-400">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[14px] font-semibold text-slate-900">{t.title}</p>
                            <p className="mt-0.5 text-[12px] text-slate-400">{t.projectName}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5 pl-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50
                                             px-2.5 py-1 text-[11px] font-bold text-rose-600 ring-1 ring-rose-200/60">
                              <Ic n="cal" c="h-3 w-3" />
                              {fmt(t.dueDate)}
                            </span>
                            {t.mine && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px]
                                               font-semibold text-blue-600 ring-1 ring-blue-200/50">
                                Yours
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ASSIGNMENTS PANEL */}
            <div className="panel-card flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl
                                   bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm">
                    <Ic n="user" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Your Assignments</h2>
                    <p className="text-[12px] text-slate-400">Recent tasks assigned to you</p>
                  </div>
                </div>
                {recent.length > 0 && (
                  <span className="rounded-full border border-blue-100 bg-blue-50
                                   px-3 py-1.5 text-[12px] font-bold text-blue-700">
                    {recent.length} tasks
                  </span>
                )}
              </div>

              <div className="flex-1">
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 py-16 px-6 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl
                                     bg-blue-50 text-blue-400">
                      <Ic n="inbox" c="h-7 w-7" />
                    </span>
                    <p className="font-bold text-slate-800">No assignments yet</p>
                    <p className="text-[13px] text-slate-400">You have no open tasks at the moment.</p>
                    <Link href="/projects"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full
                                 bg-blue-600 px-5 py-2 text-[13px] font-bold text-white
                                 shadow-sm hover:bg-blue-700 transition-colors">
                      Browse Projects <Ic n="arr" c="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {recent.map((t) => (
                      <li key={`${t.projectId}-${t.id}`}>
                        <Link href={`/projects/${t.projectId}`}
                          className="tr flex items-start gap-4 px-6 py-4">
                          {/* Initials avatar */}
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
                                          rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100
                                          text-[11px] font-extrabold text-blue-600 ring-1 ring-blue-200/50">
                            {t.title.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[14px] font-semibold text-slate-900">{t.title}</p>
                            <p className="mt-0.5 text-[12px] text-slate-400">
                              {t.projectName}
                              {t.dueDate && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <span className="text-slate-200">·</span>
                                  <Ic n="cal" c="h-3 w-3 text-slate-300" />
                                  {fmt(t.dueDate)}
                                </span>
                              )}
                            </p>
                          </div>
                          <Pill s={t.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}