import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-handler";
import { getCurrentUserIdFromRequest } from "@/lib/api-auth";
import { jsonError } from "@/lib/errors";

export async function GET() {
  return withApi("GET /api/auth/me", async () => {
    const userId = await getCurrentUserIdFromRequest();
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    return Response.json({ user });
  });
}
