import bcrypt from "bcryptjs";
import * as jose from "jose";
import { jwtSecretBytes } from "@/lib/jwt-secret";

const SALT_ROUNDS = 12;

export type JwtPayload = { sub: string; email: string };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  const key = jwtSecretBytes();
  return new jose.SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES ?? "7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const key = jwtSecretBytes();
    const { payload } = await jose.jwtVerify(token, key, { algorithms: ["HS256"] });
    const sub = payload.sub;
    const email = payload.email as string | undefined;
    if (typeof sub !== "string" || !email) return null;
    return { sub, email };
  } catch {
    return null;
  }
}

export function authCookieOptions(
  expiresAt: Date
): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  expires: Date;
  maxAge: number;
} {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  };
}
