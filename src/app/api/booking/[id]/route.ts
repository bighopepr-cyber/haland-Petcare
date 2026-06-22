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

    const updateData: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.rejectionReason) updateData["rejectionReason"] = parsed.data.rejectionReason;

    // If confirming, auto-create appointment
    if (parsed.data.status === "confirmed") {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.id)).limit(1);
      if (booking) {
        const [slot] = await db.select().from(bookingSlots).where(eq(bookingSlots.id, booking.slotId)).limit(1);
        if (slot) {
          await db.insert(appointments).values({
            petId: "", // Will need pet lookup or creation
            doctorId: slot.doctorId,
            scheduledAt: new Date(`${slot.date.toISOString().split("T")[0]}T${slot.startTime}`),
            chiefComplaint: booking.chiefComplaint,
            notes: `Booking online: ${booking.ownerName} - ${booking.petName}`,
          });
        }
      }
    }

    const [updated] = await db.update(bookings).set(updateData).where(eq(bookings.id, params.id)).returning();
    if (!updated) return error("Booking tidak ditemukan", 404);
    return success(updated);
  } catch { return error("Terjadi kesalahan"); }
}