import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { appointments } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const createSchema = z.object({
  petId: z.string().uuid(),
  doctorId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  scheduledAt: z.string().min(1),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const doctorId = searchParams.get("doctorId");
    const petId = searchParams.get("petId");

    let whereClause = sql`1=1`;
    if (session.role === "dokter") whereClause = sql`${whereClause} AND ${appointments.doctorId} = ${session.id}`;
    if (date) whereClause = sql`${whereClause} AND date(${appointments.scheduledAt}) = ${date}`;
    if (status) whereClause = sql`${whereClause} AND ${appointments.status} = ${status}`;
    if (doctorId) whereClause = sql`${whereClause} AND ${appointments.doctorId} = ${doctorId}`;
    if (petId) whereClause = sql`${whereClause} AND ${appointments.petId} = ${petId}`;

    const list = await db.select().from(appointments).where(whereClause).orderBy(appointments.scheduledAt);
    return success(list);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["owner", "staff"].includes(session.role)) return unauthorized();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [apt] = await db.insert(appointments).values({
      petId: parsed.data.petId,
      doctorId: parsed.data.doctorId,
      serviceId: parsed.data.serviceId ?? null,
      scheduledAt: new Date(parsed.data.scheduledAt),
      chiefComplaint: parsed.data.chiefComplaint ?? null,
      notes: parsed.data.notes ?? null,
    }).returning();
    return success(apt, 201);
  } catch { return error("Terjadi kesalahan"); }
}