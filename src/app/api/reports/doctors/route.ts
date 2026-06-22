import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { appointments, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { success, error, unauthorized, forbidden } from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["owner"]);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? new Date(new Date().setDate(1)).toISOString().split("T")[0];
    const to = searchParams.get("to") ?? new Date().toISOString().split("T")[0];

    const result = await db.execute(sql`
      SELECT u.id, u.name, count(a.id) as total_pasien
      FROM appointments a JOIN users u ON a.doctor_id = u.id
      WHERE a.status = 'done' AND a.scheduled_at >= ${new Date(from)} AND a.scheduled_at <= ${new Date(to + "T23:59:59")}
      GROUP BY u.id, u.name ORDER BY total_pasien desc
    `);
    return success(result.rows ?? []);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}