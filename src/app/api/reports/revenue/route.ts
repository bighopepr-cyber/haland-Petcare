import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { transactions, expenses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { success, error, unauthorized, forbidden } from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["owner"]);
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    if (!fromParam || !toParam) return error("Parameter from dan to wajib diisi", 400);
    const from = new Date(fromParam);
    const to = new Date(toParam + "T23:59:59");
    const groupBy = searchParams.get("group_by") ?? "day";

    const dateTrunc = groupBy === "month" ? "date_trunc('month', created_at)" : groupBy === "week" ? "date_trunc('week', created_at)" : "date_trunc('day', created_at)";

    const revenue = await db.execute(sql`
      SELECT ${sql.raw(dateTrunc)} as date, coalesce(sum(total),0) as pemasukan
      FROM transactions WHERE status='paid' AND created_at >= ${from} AND created_at <= ${to}
      GROUP BY 1 ORDER BY 1
    `);
    const expenseData = await db.execute(sql`
      SELECT ${sql.raw(dateTrunc)} as date, coalesce(sum(amount),0) as pengeluaran
      FROM expenses WHERE date >= ${fromParam} AND date <= ${toParam}
      GROUP BY 1 ORDER BY 1
    `);

    return success({ revenue: revenue as unknown as Record<string, unknown>[], expenses: expenseData as unknown as Record<string, unknown>[] });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}