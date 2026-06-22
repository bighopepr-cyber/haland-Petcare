import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { inpatientLogs } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized } from "@/lib/utils/api-response";

const createSchema = z.object({
  condition: z.enum(["stable", "improving", "critical"]),
  notes: z.string().optional(),
  photos: z.array(z.string()).default([]),
  isVisibleCustomer: z.boolean().default(false),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const list = await db.select().from(inpatientLogs).where(eq(inpatientLogs.inpatientId, params.id)).orderBy(inpatientLogs.loggedAt);
    return success(list);
  } catch { return error("Terjadi kesalahan"); }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || !["dokter", "staff"].includes(session.role)) return unauthorized();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [log] = await db.insert(inpatientLogs).values({
      inpatientId: params.id,
      condition: parsed.data.condition,
      notes: parsed.data.notes ?? null,
      photos: parsed.data.photos,
      isVisibleCustomer: parsed.data.isVisibleCustomer,
      loggedBy: session.id,
    }).returning();
    return success(log, 201);
  } catch { return error("Terjadi kesalahan"); }
}