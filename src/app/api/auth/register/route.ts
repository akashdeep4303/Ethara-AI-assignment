import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, authCookieOptions } from "@/lib/auth";
import { withApi } from "@/lib/api-handler";
import { AUTH_COOKIE } from "@/lib/constants";
import { jsonError } from "@/lib/errors";
import { parseJson, registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  return withApi("POST /api/auth/register", async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = parseJson(registerSchema, body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true },
    });

    const token = await signToken({ sub: user.id, email: user.email });
    const week = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions(week));
    return res;
  });
}
