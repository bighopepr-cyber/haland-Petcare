import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["product", "service"]),
});

export async function GET() {
  try {
    await requireAuth(["owner", "staff"]);
    const list = await db.select().from(categories).orderBy(categories.name);
    return success(list);
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
    const [cat] = await db.insert(categories).values(parsed.data).returning();
    return success(cat, 201);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan internal server");
  }
}