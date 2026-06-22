import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { success, error, unauthorized, forbidden } from "@/lib/utils/api-response";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["owner"]);
    const [deleted] = await db.delete(expenses).where(eq(expenses.id, params.id)).returning();
    if (!deleted) return error("Pengeluaran tidak ditemukan", 404);
    return success({ deleted: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) return err.message === "UNAUTHORIZED" ? unauthorized() : forbidden();
    return error("Terjadi kesalahan");
  }
}