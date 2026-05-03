import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE } from "@/lib/constants";
import { jwtSecretBytes } from "@/lib/jwt-secret";

async function verifyEdge(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, jwtSecretBytes(), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const publicAuthPaths = ["/login", "/register"];
  if (publicAuthPaths.some((p) => path.startsWith(p))) {
    if (token && (await verifyEdge(token))) {
      const to = request.nextUrl.searchParams.get("redirect") || "/dashboard";
      return NextResponse.redirect(new URL(to, request.url));
    }
    return NextResponse.next();
  }

  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/projects")
  ) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    if (await verifyEdge(token)) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    const res = NextResponse.redirect(url);
    res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/login", "/register"],
};
