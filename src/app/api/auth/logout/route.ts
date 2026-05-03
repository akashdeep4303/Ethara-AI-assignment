import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-handler";
import { AUTH_COOKIE } from "@/lib/constants";

export async function POST() {
  return withApi("POST /api/auth/logout", async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  });
}
