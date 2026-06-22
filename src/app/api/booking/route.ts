import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { bookings, bookingSlots } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const createSchema = z.object({
  slotId: z.string().uuid(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  petName: z.string().min(1),
  petSpecies: z.string().min(1),
  chiefComplaint: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["owner", "staff"].includes(session.role)) return unauthorized();
    const list = await db.select().from(bookings).orderBy(sql`${bookings.createdAt} desc`);
    return success(list);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [slot] = await db.select().from(bookingSlots).where(eq(bookingSlots.id, parsed.data.slotId)).limit(1);
    if (!slot) return error("Slot tidak ditemukan", 404);
    if (!slot.isActive) return error("Slot sudah tidak aktif", 400);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(eq(bookings.slotId, parsed.data.slotId), sql`${bookings.status} != 'rejected'`));
    const bookedCount = Number(countResult?.count ?? 0);

    if (bookedCount >= slot.maxQuota) return error("Slot sudah penuh", 400);

    const [booking] = await db.insert(bookings).values({
      slotId: parsed.data.slotId,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      petName: parsed.data.petName,
      petSpecies: parsed.data.petSpecies,
      chiefComplaint: parsed.data.chiefComplaint || null,
    }).returning();

    return success(booking, 201);
  } catch { return error("Terjadi kesalahan"); }
}