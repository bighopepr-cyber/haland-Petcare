import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, like, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const createSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid(),
  price: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(1),
  requiresDoctor: z.boolean().default(false),
});

const querySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["owner", "staff"]);
    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });
    if (!query.success) return validationError(query.error.flatten());

    const { search, page, limit } = query.data;
    const offset = (page - 1) * limit;
    const conds: ReturnType<typeof like>[] = [];
    if (search) conds.push(like(services.name, `%${search}%`));
    const whereClause = conds.length > 0 ? and(...conds) : undefined;

    const [total, list] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(services).where(whereClause).then(r => Number(r[0]?.count ?? 0)),
      db.select().from(services).where(whereClause).orderBy(services.name).limit(limit).offset(offset),
    ]);
    return success({ services: list, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan internal server");
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth(["owner", "staff"]);
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const [svc] = await db.insert(services).values(parsed.data).returning();
    return success(svc, 201);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan internal server");
  }
}