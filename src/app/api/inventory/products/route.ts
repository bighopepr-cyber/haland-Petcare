import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, like, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const createProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid(),
  price: z.string().min(1),
  stock: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(5),
  unit: z.string().min(1),
  imageUrl: z.string().optional(),
});

const querySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["owner", "staff"]);
    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });
    if (!query.success) return validationError(query.error.flatten());

    const { search, categoryId, isActive, page, limit } = query.data;
    const offset = (page - 1) * limit;
    const conds: (ReturnType<typeof eq> | ReturnType<typeof like>)[] = [];

    if (search) conds.push(like(products.name, `%${search}%`));
    if (categoryId) conds.push(eq(products.categoryId, categoryId));
    if (isActive === "true") conds.push(eq(products.isActive, true));
    if (isActive === "false") conds.push(eq(products.isActive, false));

    const whereClause = conds.length > 0 ? and(...conds) : undefined;

    const [totalResult, productList] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause).then(r => Number(r[0]?.count ?? 0)),
      db.select({
        id: products.id, name: products.name, categoryId: products.categoryId, price: products.price,
        stock: products.stock, minStock: products.minStock, unit: products.unit, imageUrl: products.imageUrl,
        isActive: products.isActive, createdAt: products.createdAt,
      }).from(products).where(whereClause).orderBy(products.name).limit(limit).offset(offset),
    ]);

    return success({ products: productList, pagination: { page, limit, total: totalResult, totalPages: Math.ceil(totalResult / limit) } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    console.error("GET /api/inventory/products error:", err);
    return error("Terjadi kesalahan internal server");
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth(["owner", "staff"]);
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const { name, categoryId, price, stock, minStock, unit, imageUrl } = parsed.data;
    const [newProduct] = await db.insert(products).values({ name, categoryId, price, stock, minStock, unit, imageUrl: imageUrl ?? null }).returning({
      id: products.id, name: products.name, categoryId: products.categoryId, price: products.price,
      stock: products.stock, minStock: products.minStock, unit: products.unit, imageUrl: products.imageUrl, isActive: products.isActive,
    });
    return success(newProduct, 201);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    console.error("POST /api/inventory/products error:", err);
    return error("Terjadi kesalahan internal server");
  }
}