import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUserIdFromRequest(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.sub ?? null;
}
