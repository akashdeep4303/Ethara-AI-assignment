"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [router]);

  const link = (href: string, label: string) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
          active
            ? "bg-blue-600/10 text-slate-950 ring-1 ring-blue-600/20"
            : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/10 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-950">
            Ethara <span className="text-blue-600">•</span>
          </Link>
          <nav className="hidden gap-2 sm:flex">
            {link("/dashboard", "Dashboard")}
            {link("/projects", "Projects")}
          </nav>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={logout}
          className="rounded-lg border border-slate-900/10 bg-white/70 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 disabled:opacity-50"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
