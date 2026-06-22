import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { inpatients } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const updateSchema = z.object({
  status: z.enum(["active", "discharged"]).optional(),
  cageNumber: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || !["owner", "dokter", "staff"].includes(session.role)) return unauthorized();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === "discharged") updateData["dischargedAt"] = new Date();

    const [updated] = await db.update(inpatients).set(updateData).where(eq(inpatients.id, params.id)).returning();
    if (!updated) return error("Rawat inap tidak ditemukan", 404);
    return success(updated);
  } catch { return error("Terjadi kesalahan"); }
}