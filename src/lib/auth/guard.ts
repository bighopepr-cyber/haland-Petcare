import { getSession, type SessionPayload } from "./session";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthErrors = {
  UNAUTHORIZED: new AuthError("UNAUTHORIZED", 401),
  ACCOUNT_DISABLED: new AuthError("ACCOUNT_DISABLED", 403),
  FORBIDDEN: new AuthError("FORBIDDEN", 403),
} as const;

/**
 * Require authentication and optionally check role.
 * Re-queries the database to verify the user is still active.
 */
export async function requireAuth(
  allowedRoles?: string[]
): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw AuthErrors.UNAUTHORIZED;
  }

  // Re-query user from DB to verify they're still active
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      name: users.name,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  if (!user) {
    throw AuthErrors.UNAUTHORIZED;
  }

  if (!user.isActive) {
    throw AuthErrors.ACCOUNT_DISABLED;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      throw AuthErrors.FORBIDDEN;
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}