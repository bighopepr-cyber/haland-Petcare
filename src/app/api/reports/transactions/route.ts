import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
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
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const offset = (page - 1) * limit;

    const [total, list] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(transactions)
        .where(and(eq(transactions.status, "paid"), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
        .then(r => Number(r[0]?.count ?? 0)),
      db.select().from(transactions)
        .where(and(eq(transactions.status, "paid"), gte(transactions.createdAt, from), lte(transactions.createdAt, to)))
        .orderBy(sql`${transactions.createdAt} desc`).limit(limit).offset(offset),
    ]);
    return success({ transactions: list, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}