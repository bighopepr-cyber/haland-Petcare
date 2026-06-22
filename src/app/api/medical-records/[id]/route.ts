import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { medicalRecords } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const updateSchema = z.object({
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  isVisibleCustomer: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "dokter") return unauthorized();

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    // Only the doctor who created it can edit
    const [existing] = await db.select().from(medicalRecords).where(and(eq(medicalRecords.id, params.id), eq(medicalRecords.doctorId, session.id))).limit(1);
    if (!existing) return error("Rekam medis tidak ditemukan atau bukan milik Anda", 404);

    const [updated] = await db.update(medicalRecords).set(parsed.data).where(eq(medicalRecords.id, params.id)).returning();
    return success(updated);
  } catch { return error("Terjadi kesalahan"); }
}