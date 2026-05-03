"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { messageFromApiError, readJsonResponse } from "@/lib/client-errors";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) {
        setError(messageFromApiError(data, `Registration failed (${res.status})`, res.status));
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(`Registration failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0f172a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Background SVG ── */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="bg-g1" cx="80%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-g2" cx="20%" cy="75%" r="55%">
            <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-g3" cx="50%" cy="95%" r="45%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="#0f172a" />
        <rect width="1440" height="900" fill="url(#bg-g1)" />
        <rect width="1440" height="900" fill="url(#bg-g2)" />
        <rect width="1440" height="900" fill="url(#bg-g3)" />
        {/* Rings */}
        <circle cx="1260" cy="750" r="280" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="1" />
        <circle cx="1260" cy="750" r="200" fill="none" stroke="rgba(99,102,241,0.07)" strokeWidth="1" />
        <circle cx="180" cy="150" r="240" fill="none" stroke="rgba(14,165,233,0.1)" strokeWidth="1" />
        <circle cx="180" cy="150" r="160" fill="none" stroke="rgba(14,165,233,0.07)" strokeWidth="1" />
        <circle cx="720" cy="450" r="420" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        {/* Stars */}
        <circle cx="1100" cy="200" r="2.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="320" cy="100" r="2" fill="rgba(255,255,255,0.2)" />
        <circle cx="80" cy="600" r="2.5" fill="rgba(255,255,255,0.15)" />
        <circle cx="1340" cy="480" r="2" fill="rgba(255,255,255,0.2)" />
        <circle cx="520" cy="820" r="1.5" fill="rgba(255,255,255,0.18)" />
        <circle cx="900" cy="70" r="2" fill="rgba(255,255,255,0.15)" />
        <circle cx="200" cy="700" r="1.5" fill="rgba(255,255,255,0.2)" />
        <circle cx="1050" cy="830" r="2" fill="rgba(255,255,255,0.12)" />
        <circle cx="1390" cy="140" r="1.5" fill="rgba(255,255,255,0.18)" />
        <circle cx="60" cy="300" r="2" fill="rgba(255,255,255,0.15)" />
        {/* Geometric shapes */}
        <rect x="1320" y="80" width="70" height="70" rx="10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" transform="rotate(15 1355 115)" />
        <rect x="60" y="720" width="60" height="60" rx="8" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" transform="rotate(-20 90 750)" />
        <rect x="140" y="260" width="50" height="50" rx="6" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="1" transform="rotate(30 165 285)" />
        <line x1="0" y1="900" x2="1440" y2="0" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
        <line x1="1440" y1="900" x2="0" y2="0" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
      </svg>

      {/* ── Mobile brand header ── */}
      <div className="mb-6 flex items-center gap-2.5 md:hidden" style={{ position: "relative", zIndex: 2 }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: "#3B7EF8" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <span className="text-[18px] font-bold tracking-tight" style={{ color: "#ffffff" }}>TaskFlow</span>
      </div>

      {/* ── Card wrapper ── */}
      <div
        className="w-full max-w-[860px] overflow-hidden rounded-[20px]"
        style={{
          position: "relative",
          zIndex: 2,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex min-h-[620px] flex-col md:flex-row">

          {/* ════ Left decorative panel ════ */}
          <div
            className="hidden md:flex md:w-[42%] md:flex-col md:justify-between md:p-10"
            style={{
              background: "linear-gradient(155deg, #1032A0 0%, #0B1D6E 55%, #081648 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

            {/* Brand */}
            <div className="relative z-10 flex items-center gap-2.5">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px]" style={{ background: "#3B7EF8" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <span className="text-[18px] font-bold tracking-[-0.3px] text-white">TaskFlow</span>
            </div>

            {/* Tagline */}
            <div className="relative z-10 py-6">
              <h2 className="mb-3 text-[26px] font-bold leading-[1.3] tracking-[-0.4px] text-white">
                Join thousands of<br />teams shipping faster.
              </h2>
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Get started for free — no credit card required.<br />Set up your workspace in under 2 minutes.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="relative z-10 flex flex-col gap-3">
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  text: "Unlimited tasks & projects",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  text: "Real-time team collaboration",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  text: "Integrations with 50+ tools",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  text: "Advanced analytics & reporting",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(59,126,248,0.25)", color: "#7cb9ff" }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div
              className="relative z-10 mt-4 flex items-center gap-3 rounded-[12px] border border-white/10 px-4 py-3"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              {/* Avatar stack */}
              <div className="flex flex-shrink-0">
                {["#34d399", "#7cb9ff", "#fabd4b", "#f87171"].map((color, i) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0B1D6E] text-[9px] font-bold text-white"
                    style={{ background: color, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white">12,000+ teams onboard</p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Joined in the last 30 days</p>
              </div>
            </div>
          </div>

          {/* ════ Right form panel ════ */}
          <div
            className="flex flex-1 flex-col justify-center px-7 py-10 sm:px-10"
            style={{ backgroundColor: "#ffffff", position: "relative", zIndex: 1 }}
          >
            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-[24px] font-bold tracking-[-0.4px]" style={{ color: "#0B1540" }}>
                Create your account
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: "#8492a6" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold" style={{ color: "#3B7EF8" }}>
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <p className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-700" role="alert">
                {error}
              </p>
            )}

            {/* ── Social signup (top) ── */}
            <div className="mb-5 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Google",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ),
                },
                {
                  label: "GitHub",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#24292e">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  ),
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-[10px] py-[10px] text-[13px] font-semibold transition-all"
                  style={{ border: "1.5px solid #E4EAF2", backgroundColor: "#ffffff", color: "#3D4A5C" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B7EF8";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F7FAFF";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E4EAF2";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
                  }}
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>

            {/* ── Divider ── */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "#EDF1F7" }} />
              <span className="text-[11px] font-medium" style={{ color: "#C4CEDB" }}>or sign up with email</span>
              <div className="h-px flex-1" style={{ background: "#EDF1F7" }} />
            </div>

            {/* ── Full Name ── */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.5px]" style={{ color: "#3D4A5C" }}>
                Full name
              </label>
              <div
                className="flex items-center overflow-hidden rounded-[10px] transition-all"
                style={{ border: "1.5px solid #E4EAF2", backgroundColor: "#F7FAFF" }}
                onFocusCapture={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#3B7EF8";
                  el.style.backgroundColor = "#ffffff";
                }}
                onBlurCapture={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#E4EAF2";
                  el.style.backgroundColor = "#F7FAFF";
                }}
              >
                <div className="flex h-[44px] w-[42px] flex-shrink-0 items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8C4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    padding: "10px 12px 10px 0", fontSize: "13.5px",
                    color: "#0B1540", outline: "none",
                  }}
                />
              </div>
            </div>

            {/* ── Email ── */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.5px]" style={{ color: "#3D4A5C" }}>
                Email address
              </label>
              <div
                className="flex items-center overflow-hidden rounded-[10px] transition-all"
                style={{ border: "1.5px solid #E4EAF2", backgroundColor: "#F7FAFF" }}
                onFocusCapture={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#3B7EF8";
                  el.style.backgroundColor = "#ffffff";
                }}
                onBlurCapture={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#E4EAF2";
                  el.style.backgroundColor = "#F7FAFF";
                }}
              >
                <div className="flex h-[44px] w-[42px] flex-shrink-0 items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8C4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    padding: "10px 12px 10px 0", fontSize: "13.5px",
                    color: "#0B1540", outline: "none",
                  }}
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[12px] font-semibold uppercase tracking-[0.5px]" style={{ color: "#3D4A5C" }}>
                  Password
                </label>
                <span className="text-[11px]" style={{ color: "#B8C4D4" }}>Minimum 8 characters</span>
              </div>
              <div
                className="flex items-center overflow-hidden rounded-[10px] transition-all"
                style={{ border: "1.5px solid #E4EAF2", backgroundColor: "#F7FAFF" }}
                onFocusCapture={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#3B7EF8";
                  el.style.backgroundColor = "#ffffff";
                }}
                onBlurCapture={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#E4EAF2";
                  el.style.backgroundColor = "#F7FAFF";
                }}
              >
                <div className="flex h-[44px] w-[42px] flex-shrink-0 items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8C4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    padding: "10px 12px 10px 0", fontSize: "13.5px",
                    color: "#0B1540", outline: "none",
                  }}
                />
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              onClick={onSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] py-[11px] text-[14px] font-bold text-white transition-all hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              style={{
                background: "#3B7EF8",
                boxShadow: "0 4px 18px rgba(59,126,248,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#3B7EF8";
              }}
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Create account
                </>
              )}
            </button>

            {/* Terms */}
            <p className="mt-4 text-center text-[11.5px]" style={{ color: "#B8C4D4" }}>
              By creating an account you agree to our{" "}
              <Link href="/terms" className="font-medium" style={{ color: "#3B7EF8" }}>Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="font-medium" style={{ color: "#3B7EF8" }}>Privacy Policy</Link>
            </p>

            {/* ── Back link ── */}
            <p className="mt-4 text-center text-[12.5px]">
              <Link href="/" className="font-medium" style={{ color: "#3B7EF8" }}>
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#0f172a" }}>
          <div className="text-[13px]" style={{ color: "#8492a6" }}>Loading…</div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}