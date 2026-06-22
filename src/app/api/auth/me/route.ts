import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { success, error, unauthorized } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return unauthorized();
    }

    // Re-query user from DB to verify they're still active
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!user) {
      return unauthorized();
    }

    if (!user.isActive) {
      return error("Akun Anda telah dinonaktifkan", 403);
    }

    return success({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return error("Terjadi kesalahan internal server", 500);
  }
}