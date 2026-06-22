import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { products, stockMutations } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const addStockSchema = z.object({
  qtyChange: z.coerce.number().int().positive("Jumlah harus positif"),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

const adjustStockSchema = z.object({
  targetStock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  reason: z.string().min(1, "Alasan wajib diisi"),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["owner", "staff"]);
    const body = await request.json();

    // Determine if this is add-stock or adjustment
    if (body.targetStock !== undefined) {
      return handleAdjustment(params.id, body);
    }
    return handleAddStock(params.id, body);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    console.error("POST /api/inventory/products/[id]/stock error:", err);
    return error("Terjadi kesalahan internal server");
  }
}

async function handleAddStock(productId: string, body: unknown) {
  const parsed = addStockSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const { qtyChange, notes, reference } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [current] = await tx.select({ stock: products.stock }).from(products).where(eq(products.id, productId)).for("update").limit(1);
    if (!current) throw new Error("PRODUCT_NOT_FOUND");

    const qtyBefore = current.stock;
    const qtyAfter = qtyBefore + qtyChange;

    await tx.insert(stockMutations).values({
      productId, type: "in", qtyBefore, qtyChange, qtyAfter, reference: reference ?? null, notes: notes ?? null, createdBy: "",
    });

    await tx.update(products).set({ stock: qtyAfter }).where(eq(products.id, productId));

    return { qtyBefore, qtyChange, qtyAfter };
  }).catch((e: Error) => {
    if (e.message === "PRODUCT_NOT_FOUND") throw e;
    throw e;
  });

  return success(result);
}

async function handleAdjustment(productId: string, body: unknown) {
  const parsed = adjustStockSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const { targetStock, reason } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [current] = await tx.select({ stock: products.stock }).from(products).where(eq(products.id, productId)).for("update").limit(1);
    if (!current) throw new Error("PRODUCT_NOT_FOUND");

    const qtyBefore = current.stock;
    const qtyChange = targetStock - qtyBefore;

    await tx.insert(stockMutations).values({
      productId, type: "adjustment", qtyBefore, qtyChange, qtyAfter: targetStock, reference: null, notes: reason, createdBy: "",
    });

    await tx.update(products).set({ stock: targetStock }).where(eq(products.id, productId));

    return { qtyBefore, qtyChange, qtyAfter: targetStock };
  }).catch((e: Error) => {
    if (e.message === "PRODUCT_NOT_FOUND") throw e;
    throw e;
  });

  return success(result);
}