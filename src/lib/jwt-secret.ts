/**
 * Shared secret for signing/verifying JWTs. Keep this module Edge-safe (no Node-only deps).
 * Must match across API routes and middleware.
 */
export function jwtSecretBytes(): Uint8Array {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv?.length) {
    return new TextEncoder().encode(fromEnv);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("ethara-development-jwt-secret-change-in-.env");
  }
  throw new Error("JWT_SECRET is not set");
}
