import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireAuth, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(["owner", "dokter", "staff", "customer"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(["owner"]);

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);

    if (!user) {
      return error("User tidak ditemukan", 404);
    }

    return success(user);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return unauthorized();
    if (err instanceof Error && err.message === "FORBIDDEN") return forbidden();
    console.error("GET /api/users/[id] error:", err);
    return error("Terjadi kesalahan internal server");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(["owner"]);

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const { name, phone, role, isActive, password } = parsed.data;

    if (!name && !phone && !role && isActive === undefined && !password) {
      return error("Tidak ada data yang diupdate", 400);
    }

    const updateData: Partial<{
      name: string;
      phone: string | null;
      role: "owner" | "dokter" | "staff" | "customer";
      isActive: boolean;
      password: string;
    }> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password !== undefined) {
      updateData.password = await hashPassword(password);
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, params.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    if (!updated) {
      return error("User tidak ditemukan", 404);
    }

    return success(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return unauthorized();
    if (err instanceof Error && err.message === "FORBIDDEN") return forbidden();
    console.error("PATCH /api/users/[id] error:", err);
    return error("Terjadi kesalahan internal server");
  }
}