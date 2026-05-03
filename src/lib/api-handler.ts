import { Prisma } from "@prisma/client";
import { jsonError } from "@/lib/errors";

/** Turn uncaught exceptions into JSON — avoids Next/HTML "Internal Server Error" on API routes. */
export function apiErrorResponse(e: unknown, label: string): Response {
  console.error(`[api ${label}]`, e);

  if (e instanceof Prisma.PrismaClientInitializationError) {
    return jsonError(
      "Cannot reach the database. Run npm run setup:local (Postgres on localhost), or npm run db:up (Docker), then check DATABASE_URL in .env.",
      503
    );
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021") {
      return jsonError("Database tables are missing. Deploy must run prisma migrate deploy.", 503);
    }
    if (e.code === "P2002") {
      return jsonError("That email or value is already taken.", 409);
    }
    if (e.code === "P2003") {
      return jsonError("Invalid reference — related record does not exist.", 400);
    }
    return jsonError(`Database error (${e.code}).`, 400);
  }

  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Error).message === "string"
  ) {
    const msg = (e as Error).message;

    if (msg === "JWT_SECRET is not set") {
      return jsonError(
        "Server missing JWT_SECRET. Add it to environment variables on your host.",
        500
      );
    }

    if (process.env.NODE_ENV !== "production" && msg.length > 0 && msg.length < 300) {
      return jsonError(`[dev] ${msg}`, 500);
    }
  }

  return jsonError("Something went wrong. Please try again.", 500);
}

export async function withApi(label: string, run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (e) {
    return apiErrorResponse(e, label);
  }
}
