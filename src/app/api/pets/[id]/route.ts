import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { pets } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().min(1).optional(),
  breed: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    // Check ownership for customer
    if (session.role === "customer") {
      const [pet] = await db.select().from(pets).where(and(eq(pets.id, params.id), eq(pets.ownerId, session.id))).limit(1);
      if (!pet) return error("Hewan tidak ditemukan", 404);
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(parsed.data)) {
      if (val !== undefined) updateData[key] = val;
    }
    if (Object.keys(updateData).length === 0) return error("Tidak ada data yang diupdate", 400);

    const [updated] = await db.update(pets).set(updateData).where(eq(pets.id, params.id)).returning();
    if (!updated) return error("Hewan tidak ditemukan", 404);
    return success(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/pets/[id] error:", err);
    return error("Terjadi kesalahan internal server");
  }
}