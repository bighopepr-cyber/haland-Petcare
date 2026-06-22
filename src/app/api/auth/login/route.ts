import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { success, error, validationError } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return error("Email atau password salah", 401);
    }

    if (!user.isActive) {
      return error("Akun Anda telah dinonaktifkan. Hubungi administrator.", 403);
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return error("Email atau password salah", 401);
    }

    const token = await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });

    // Set cookie via NextResponse (works in API routes)
    response.cookies.set("vetcare_session", token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return error("Terjadi kesalahan internal server", 500);
  }
}