import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { appointments } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const updateSchema = z.object({
  status: z.enum(["scheduled", "in_progress", "done", "cancelled"]).optional(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [updated] = await db.update(appointments).set(parsed.data).where(eq(appointments.id, params.id)).returning();
    if (!updated) return error("Appointment tidak ditemukan", 404);
    return success(updated);
  } catch { return error("Terjadi kesalahan"); }
}