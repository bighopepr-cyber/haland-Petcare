import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { petVaccines, pets } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const createSchema = z.object({
  vaccineName: z.string().min(1),
  vaccinatedAt: z.string().min(1),
  nextDue: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const list = await db.select().from(petVaccines).where(eq(petVaccines.petId, params.id)).orderBy(petVaccines.vaccinatedAt);
    return success(list);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [vax] = await db.insert(petVaccines).values({
      petId: params.id,
      vaccineName: parsed.data.vaccineName,
      vaccinatedAt: new Date(parsed.data.vaccinatedAt),
      nextDue: parsed.data.nextDue ? new Date(parsed.data.nextDue) : null,
      notes: parsed.data.notes ?? null,
    }).returning();
    return success(vax, 201);
  } catch { return error("Terjadi kesalahan"); }
}