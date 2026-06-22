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

    const [revenueResult] = await db.select({ total: sql<string>`coalesce(sum(total),'0')` }).from(transactions)
      .where(and(eq(transactions.status, "paid"), gte(transactions.createdAt, from), lte(transactions.createdAt, to)));
    const [expenseResult] = await db.select({ total: sql<string>`coalesce(sum(amount),'0')` }).from(expenses)
      .where(and(gte(expenses.date, fromParam), lte(expenses.date, toParam)));
    const [txCount] = await db.select({ count: sql<number>`count(*)` }).from(transactions)
      .where(and(eq(transactions.status, "paid"), gte(transactions.createdAt, from), lte(transactions.createdAt, to)));

    const pemasukan = Number(revenueResult?.total ?? 0);
    const pengeluaran = Number(expenseResult?.total ?? 0);
    return success({ pemasukan, pengeluaran, laba: pemasukan - pengeluaran, totalTransaksi: Number(txCount?.count ?? 0) });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}