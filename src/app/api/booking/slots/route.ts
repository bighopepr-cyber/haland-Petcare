import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { bookingSlots, bookings } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError } from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const doctorId = searchParams.get("doctor_id");

    if (!date) return error("Parameter date wajib diisi", 400);

    const conditions: ReturnType<typeof sql>[] = [
      sql`date(${bookingSlots.date}) = ${date}`,
      eq(bookingSlots.isActive, true),
    ];
    if (doctorId) conditions.push(eq(bookingSlots.doctorId, doctorId));

    const slots = await db.select().from(bookingSlots).where(and(...conditions)).orderBy(bookingSlots.startTime);
    return success(slots);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = z.object({
      doctorId: z.string().uuid(),
      date: z.string().min(1),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      maxQuota: z.coerce.number().int().min(1).default(5),
    }).safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [slot] = await db.insert(bookingSlots).values({
      doctorId: parsed.data.doctorId,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      maxQuota: parsed.data.maxQuota,
    }).returning();
    return success(slot, 201);
  } catch { return error("Terjadi kesalahan"); }
}