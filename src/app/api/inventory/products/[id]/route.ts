import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  price: z.string().min(1).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  unit: z.string().min(1).optional(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["owner", "staff"]);
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const updateData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(parsed.data)) {
      if (val !== undefined) updateData[key] = val;
    }
    if (Object.keys(updateData).length === 0) return error("Tidak ada data yang diupdate", 400);

    const [updated] = await db.update(products).set(updateData).where(eq(products.id, params.id)).returning({
      id: products.id, name: products.name, categoryId: products.categoryId, price: products.price,
      stock: products.stock, minStock: products.minStock, unit: products.unit, imageUrl: products.imageUrl, isActive: products.isActive,
    });
    if (!updated) return error("Produk tidak ditemukan", 404);
    return success(updated);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    console.error("PATCH /api/inventory/products/[id] error:", err);
    return error("Terjadi kesalahan internal server");
  }
}