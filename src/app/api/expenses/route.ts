import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const createSchema = z.object({
  category: z.enum(["Operasional", "Obat", "Gaji", "Lainnya"]),
  description: z.string().min(1),
  amount: z.string().min(1),
  date: z.string().min(1),
  receiptUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["owner", "staff"]);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from"); const to = searchParams.get("to");
    const conditions: ReturnType<typeof sql>[] = [];
    if (from) conditions.push(gte(expenses.date, new Date(from)));
    if (to) conditions.push(lte(expenses.date, new Date(to)));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const list = await db.select().from(expenses).where(whereClause).orderBy(sql`${expenses.date} desc`);
    return success(list);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth(["owner", "staff"]);
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());
    const [exp] = await db.insert(expenses).values({ ...parsed.data, date: new Date(parsed.data.date), receiptUrl: parsed.data.receiptUrl ?? null }).returning();
    return success(exp, 201);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}