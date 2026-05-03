import Link from "next/link";

export default function HomePage() {
  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-[#F7FAFF] text-slate-950"
      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
    >
      {/* ── Background blobs ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-[540px] w-[540px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-[-6%] top-[8%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.08] blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[28%] h-[460px] w-[460px] rounded-full bg-blue-500/[0.06] blur-[140px]" />
      </div>

      {/* ── Dot grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(2,6,23,0.55) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* ── Nav ── */}
      <nav className="glass-light relative z-20 mx-4 mt-4 flex items-center justify-between rounded-2xl px-6 py-4 md:mx-6 md:px-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#2563EB] shadow-[0_10px_26px_rgba(37,99,235,0.25)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <span
            className="text-[1.2rem] text-slate-950"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
          >
            Ethara
          </span>
        </div>

        <div className="hidden items-center gap-7 md:flex">
          {["Features", "Pricing", "Teams"].map((l) => (
            <Link key={l} href="#" className="text-[.82rem] font-semibold text-slate-600 transition hover:text-slate-950">
              {l}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[.82rem] font-bold text-slate-950">Sign in</Link>
          <Link
            href="/register"
            className="rounded-full bg-[#2563EB] px-[1.1rem] py-[.48rem] text-[.8rem] font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero Grid ── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1080px] items-center gap-14 px-10 pb-12 pt-16 lg:grid-cols-[1.2fr_0.8fr]">

        {/* ── Left — copy ── */}
        <section>
          <p className="glass-light-soft animate-fade-up-1 mb-[1.2rem] inline-flex items-center gap-2 rounded-full px-[.9rem] py-[.3rem]">
            <span className="animate-pulse-dot h-[6px] w-[6px] rounded-full bg-[#2563EB]" />
            <span className="text-[.66rem] font-extrabold uppercase tracking-[.14em] text-slate-700">
              Teams · Tasks · Roles
            </span>
          </p>

          <h1 className="animate-fade-up-2 text-balance text-[clamp(2.3rem,3.4vw,3.7rem)] font-extrabold leading-[1.03] tracking-[-0.03em] text-slate-950">
            Plan faster,{" "}
            <span className="font-normal italic text-[#2563EB]" style={{ fontFamily: "'Lora', serif" }}>
              assign smarter,
            </span>
            <br />
            and track progress{" "}
            <span className="font-normal italic text-[#2563EB]" style={{ fontFamily: "'Lora', serif" }}>
              beautifully.
            </span>
          </h1>

          <p className="animate-fade-up-3 mt-[1rem] max-w-[470px] text-pretty text-[1rem] leading-[1.9] text-slate-600">
            Ethara gives your team a single, elegant place for projects, deadlines,
            task ownership, and clear Admin&thinsp;/&thinsp;Member access controls.
          </p>

          <div className="animate-fade-up-4 mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-[7px] rounded-xl bg-[#2563EB] px-[1.65rem] py-[.78rem] text-[.92rem] font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
            >
              Get started free
              <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="glass-light-soft rounded-xl px-[1.55rem] py-[.72rem] text-[.875rem] font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white/75"
            >
              Sign in
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fade-up-4 mt-6 flex items-center gap-[14px]">
            <div className="flex">
              {[
                { initials: "AK", bg: "from-[#DBEAFE] to-[#BFDBFE]", text: "text-slate-900" },
                { initials: "SR", bg: "from-[#E0F2FE] to-[#BAE6FD]", text: "text-slate-900" },
                { initials: "+4", bg: "from-[#2563EB] to-[#1D4ED8]",  text: "text-white" },
              ].map((av, i) => (
                <div
                  key={i}
                  className={`-mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${av.bg} text-[10px] font-bold ${av.text}`}
                >
                  {av.initials}
                </div>
              ))}
            </div>
            <div>
              <div className="mb-[2px] flex gap-[2px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[11px] text-[#2563EB]">★</span>
                ))}
              </div>
              <p className="text-[.72rem] font-medium text-slate-600">
                Loved by <strong className="text-slate-950">2,400+</strong> teams worldwide
              </p>
            </div>
          </div>
        </section>

        {/* ── Right — snapshot panel ── */}
        <section className="animate-float-panel">
          <div className="glass-light relative overflow-hidden rounded-[28px] p-[1.4rem]">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[.66rem] font-extrabold uppercase tracking-[.12em] text-slate-500">Live snapshot</p>
                <p className="mt-[1px] text-[.75rem] text-slate-400">Sprint · Week 22</p>
              </div>
              <span className="glass-light-soft flex items-center gap-[5px] rounded-full px-[10px] py-[4px] text-[.62rem] font-bold tracking-[.06em] text-emerald-700">
                <span className="animate-pulse-live h-[6px] w-[6px] rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            {/* Overdue */}
            <div className="glass-light-soft relative mb-[.875rem] overflow-hidden rounded-[18px] px-5 py-[1.1rem]">
              <p className="mb-[6px] text-[.62rem] font-extrabold uppercase tracking-[.12em] text-slate-600">Overdue tasks</p>
              <p className="text-[2.5rem] font-extrabold leading-none text-slate-950">04</p>
              <div className="pointer-events-none absolute bottom-2.5 right-3 grid grid-cols-4 gap-1 opacity-[0.18]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="block h-[5px] w-[5px] rounded-full bg-slate-950" />
                ))}
              </div>
              <div className="absolute right-4 top-3 flex items-end gap-[3px] opacity-30">
                {[12, 20, 16, 24].map((h, i) => (
                  <div key={i} className="w-[5px] rounded-t-[2px] bg-[#2563EB]" style={{ height: `${h}px` }} />
                ))}
              </div>
            </div>

            {/* In progress + Done */}
            <div className="mb-[.875rem] grid grid-cols-2 gap-[.875rem]">
              <div className="glass-light-soft rounded-[18px] px-5 py-[1.1rem]">
                <p className="mb-[6px] text-[.62rem] font-extrabold uppercase tracking-[.12em] text-slate-600">In progress</p>
                <p className="text-[2rem] font-extrabold leading-none text-slate-950">12</p>
                <svg className="mt-[6px] w-full" height="20" viewBox="0 0 80 20">
                  <polyline
                    points="0,16 15,12 30,14 45,8 60,10 80,5"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </div>

              <div className="glass-light-soft rounded-[18px] px-5 py-[1.1rem]">
                <p className="mb-[6px] text-[.62rem] font-extrabold uppercase tracking-[.12em] text-slate-600">Done this week</p>
                <p className="text-[2rem] font-extrabold leading-none text-slate-950">27</p>
                <div className="mt-2 h-[4px] overflow-hidden rounded-full bg-slate-900/10">
                  <div className="animate-shimmer h-full w-[73%] rounded-full bg-[#2563EB]" />
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="glass-light-soft rounded-[14px] px-[.875rem] py-[.875rem]">
              <p className="mb-[.6rem] text-[.62rem] font-extrabold uppercase tracking-[.1em] text-slate-500">Recent activity</p>
              <div className="flex flex-col gap-[7px]">
                {[
                  {
                    color: "bg-[#2563EB]",
                    icon: <polyline points="20 6 9 17 4 12" />,
                    label: "Design review completed",
                    time: "2m ago",
                  },
                  {
                    color: "bg-slate-400",
                    icon: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </>
                    ),
                    label: "API integration overdue",
                    time: "1h ago",
                  },
                  {
                    color: "bg-emerald-500",
                    icon: <polyline points="20 6 9 17 4 12" />,
                    label: "Sprint goals updated",
                    time: "3h ago",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-[10px]">
                    <div className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] ${item.color}`}>
                      <svg className="h-[10px] w-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        {item.icon}
                      </svg>
                    </div>
                    <span className="flex-1 text-[.75rem] font-medium text-slate-950">{item.label}</span>
                    <span className="text-[.65rem] text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Feature Cards ── */}
      <div className="relative z-10 mx-auto mb-14 grid max-w-[1080px] grid-cols-1 gap-4 px-10 sm:grid-cols-3">
        {[
          {
            iconBg: "bg-[#2563EB]/10",
            iconColor: "#2563EB",
            title: "Smart Scheduling",
            desc: "Auto-assign deadlines based on team capacity and priority levels.",
            icon: (
              <>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </>
            ),
          },
          {
            iconBg: "bg-[#2563EB]/10",
            iconColor: "#2563EB",
            title: "Role Controls",
            desc: "Granular Admin / Member permissions so everyone sees exactly what they need.",
            icon: (
              <>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </>
            ),
          },
          {
            iconBg: "bg-[#2563EB]/10",
            iconColor: "#2563EB",
            title: "Live Progress",
            desc: "Real-time dashboards and sprint tracking so nothing falls through the cracks.",
            icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="glass-light-soft rounded-[20px] p-[1.3rem] transition hover:-translate-y-0.5 hover:bg-white/75"
          >
            <div className={`mb-[.875rem] flex h-[38px] w-[38px] items-center justify-center rounded-[11px] ${card.iconBg}`}>
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke={card.iconColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                {card.icon}
              </svg>
            </div>
            <p className="mb-[5px] text-[.9rem] font-bold text-slate-950">{card.title}</p>
            <p className="text-[.78rem] leading-[1.65] text-slate-600">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}