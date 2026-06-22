import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { success, error, validationError } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const { email, password, name, phone } = parsed.data;

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return error("Email sudah terdaftar", 409);
    }

    const hashed = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashed,
        name,
        phone: phone ?? null,
        role: "customer",
      })
      .returning();

    if (!user) {
      return error("Gagal membuat user", 500);
    }

    const token = await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("vetcare_session", token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return error("Terjadi kesalahan internal server", 500);
  }
}