import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, verifyPassword, authCookieOptions } from "@/lib/auth";
import { withApi } from "@/lib/api-handler";
import { AUTH_COOKIE } from "@/lib/constants";
import { jsonError } from "@/lib/errors";
import { parseJson, loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  return withApi("POST /api/auth/login", async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(loginSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await signToken({ sub: user.id, email: user.email });
    const week = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions(week));
    return res;
  });
}
