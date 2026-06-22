import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { stockMutations } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, and, type SQL } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const querySchema = z.object({
  productId: z.string().optional(),
  type: z.enum(["in", "out", "adjustment"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["owner", "staff"]);
    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      productId: searchParams.get("productId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });
    if (!query.success) return validationError(query.error.flatten());

    const { productId, type, from, to, page, limit } = query.data;
    const offset = (page - 1) * limit;

    // Build where clause
    const conditions: SQL[] = [];
    if (productId) conditions.push(eq(stockMutations.productId, productId));
    if (type) conditions.push(eq(stockMutations.type, type));
    if (from) conditions.push(sql`${stockMutations.createdAt} >= ${new Date(from)}`);
    if (to) conditions.push(sql`${stockMutations.createdAt} <= ${new Date(to)}`);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult, mutationList] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(stockMutations).where(whereClause).then(r => Number(r[0]?.count ?? 0)),
      db.select().from(stockMutations).where(whereClause).orderBy(sql`${stockMutations.createdAt} desc`).limit(limit).offset(offset),
    ]);

    return success({ mutations: mutationList, pagination: { page, limit, total: totalResult, totalPages: Math.ceil(totalResult / limit) } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    console.error("GET /api/inventory/mutations error:", err);
    return error("Terjadi kesalahan internal server");
  }
}