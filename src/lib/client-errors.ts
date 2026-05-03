/** Read body as JSON; never throws (HTML error pages become a marker object). */
export async function readJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      __nonJson: true,
      __status: res.status,
      __preview: text.replace(/\s+/g, " ").slice(0, 120),
    };
  }
}

/** Build a user-visible string from `/api` error bodies (strings, Zod flatten, etc.). */
export function messageFromApiError(data: unknown, fallback: string, status?: number): string {
  if (data && typeof data === "object" && "__nonJson" in data) {
    const st = (data as { __status?: number }).__status ?? status;
    if (st && st >= 500) {
      return "Server error — check DATABASE_URL, JWT_SECRET, and that migrations ran (prisma migrate deploy).";
    }
    return "Unexpected response from server. Try again.";
  }

  if (!data || typeof data !== "object") {
    if (status && status >= 500) {
      return "Server error — check deployment logs and database configuration.";
    }
    return fallback;
  }

  const d = data as { error?: unknown };
  const err = d.error;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (!err || typeof err !== "object") {
    if (status && status >= 500) {
      return "Server error — check deployment logs and database configuration.";
    }
    return fallback;
  }

  const typed = err as { formErrors?: unknown; fieldErrors?: Record<string, unknown> };
  const segments: string[] = [];

  if (Array.isArray(typed.formErrors)) {
    for (const x of typed.formErrors) {
      if (typeof x === "string" && x.trim()) segments.push(x.trim());
    }
  }
  if (typed.fieldErrors && typeof typed.fieldErrors === "object") {
    for (const msgs of Object.values(typed.fieldErrors)) {
      if (Array.isArray(msgs)) {
        for (const x of msgs) {
          if (typeof x === "string" && x.trim()) segments.push(x.trim());
        }
      }
    }
  }

  if (segments.length) return segments.join(" ");
  if (status && status >= 500) {
    return "Server error — check deployment logs and database configuration.";
  }
  return fallback;
}
