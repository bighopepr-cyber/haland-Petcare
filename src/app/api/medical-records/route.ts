import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { medicalRecords, pets } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const createSchema = z.object({
  appointmentId: z.string().uuid(),
  petId: z.string().uuid(),
  diagnosis: z.string().min(1),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  isVisibleCustomer: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (session.role === "customer") {
      const userPets = await db.select({ id: pets.id }).from(pets).where(eq(pets.ownerId, session.id));
      const petIds = userPets.map(p => p.id);
      if (petIds.length === 0) return success([]);
      const list = await db.select().from(medicalRecords)
        .where(and(sql`${medicalRecords.petId} IN (${sql.join(petIds.map(id => sql`${id}`), sql`, `)})`, eq(medicalRecords.isVisibleCustomer, true)))
        .orderBy(sql`${medicalRecords.createdAt} desc`);
      return success(list);
    }

    const conditions: ReturnType<typeof sql>[] = [];
    if (petId) conditions.push(eq(medicalRecords.petId, petId));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const list = await db.select().from(medicalRecords).where(whereClause).orderBy(sql`${medicalRecords.createdAt} desc`);
    return success(list);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "dokter") return unauthorized();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [record] = await db.insert(medicalRecords).values({
      ...parsed.data,
      doctorId: session.id,
    }).returning();
    return success(record, 201);
  } catch { return error("Terjadi kesalahan"); }
}