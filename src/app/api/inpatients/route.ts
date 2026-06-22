import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { inpatients, pets } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const createSchema = z.object({
  petId: z.string().uuid(),
  doctorId: z.string().uuid(),
  cageNumber: z.string().min(1),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (session.role === "customer") {
      const userPets = await db.select({ id: pets.id }).from(pets).where(eq(pets.ownerId, session.id));
      const petIds = userPets.map(p => p.id);
      if (petIds.length === 0) return success([]);
      const list = await db.select().from(inpatients)
        .where(and(sql`${inpatients.petId} IN (${sql.join(petIds.map(id => sql`${id}`), sql`, `)})`, eq(inpatients.status, "active")))
        .orderBy(sql`${inpatients.admittedAt} desc`);
      return success(list);
    }

    let whereClause = sql`1=1`;
    if (status) whereClause = sql`${whereClause} AND ${inpatients.status} = ${status}`;
    const list = await db.select().from(inpatients).where(whereClause).orderBy(sql`${inpatients.admittedAt} desc`);
    return success(list);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["owner", "dokter", "staff"].includes(session.role)) return unauthorized();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [ip] = await db.insert(inpatients).values({
      petId: parsed.data.petId,
      doctorId: parsed.data.doctorId,
      cageNumber: parsed.data.cageNumber,
      diagnosis: parsed.data.diagnosis ?? null,
      notes: parsed.data.notes ?? null,
      admittedAt: new Date(),
    }).returning();
    return success(ip, 201);
  } catch { return error("Terjadi kesalahan"); }
}