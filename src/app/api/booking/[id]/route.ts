import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { bookings, bookingSlots, appointments } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "rejected"]),
  rejectionReason: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || !["owner", "staff"].includes(session.role)) return unauthorized();

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    // If confirming, auto-create appointment
    if (parsed.data.status === "confirmed") {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.id)).limit(1);
      if (booking) {
        const [slot] = await db.select().from(bookingSlots).where(eq(bookingSlots.id, booking.slotId)).limit(1);
        if (slot) {
          const dateStr = slot.date instanceof Date ? slot.date.toISOString().split("T")[0] : String(slot.date).split("T")[0];
          await db.insert(appointments).values({
            petId: "00000000-0000-0000-0000-000000000000",
            doctorId: slot.doctorId,
            scheduledAt: new Date(`${dateStr}T${slot.startTime}`),
            chiefComplaint: booking.chiefComplaint,
            notes: `Booking online: ${booking.customerName} - ${booking.petName}`,
          });
        }
      }
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status: parsed.data.status,
        rejectionReason: parsed.data.rejectionReason ?? null,
      } as any)
      .where(eq(bookings.id, params.id))
      .returning();
    if (!updated) return error("Booking tidak ditemukan", 404);
    return success(updated);
  } catch { return error("Terjadi kesalahan"); }
}