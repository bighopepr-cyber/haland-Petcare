import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { success, error, unauthorized, forbidden } from "@/lib/utils/api-response";

export async function GET() {
  try {
    await requireAuth(["owner"]);
    const list = await db.select().from(products)
      .where(sql`${products.stock} <= ${products.minStock}`)
      .orderBy(sql`${products.stock}::float / nullif(${products.minStock},0) asc`);
    return success(list);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}