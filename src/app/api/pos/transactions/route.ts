import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { transactions, transactionItems, products, stockMutations, services } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const cartItemSchema = z.object({
  itemType: z.enum(["product", "service"]),
  itemId: z.string().uuid(),
  itemName: z.string(),
  itemPrice: z.string(),
  qty: z.coerce.number().int().min(1),
});

const transactionSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  customerNameSnapshot: z.string().optional().nullable(),
  items: z.array(cartItemSchema).min(1, "Minimal 1 item"),
  total: z.string().min(1),
  paymentMethod: z.enum(["cash", "qris", "transfer"]),
  amountPaid: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

function generateInvoiceNo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${y}${m}${d}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["owner", "staff"]);

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const { customerId, customerNameSnapshot, items, total, paymentMethod, amountPaid, notes } = parsed.data;
    const invoiceNo = generateInvoiceNo();

    const result = await db.transaction(async (tx) => {
      // 1. Insert transaction
      const [txn] = await tx.insert(transactions).values({
        invoiceNo,
        customerId: customerId ?? null,
        customerNameSnapshot: customerNameSnapshot ?? null,
        staffId: session.id,
        total,
        paymentMethod,
        status: "paid",
        notes: notes ?? null,
      }).returning();

      if (!txn) throw new Error("FAILED_CREATE_TRANSACTION");

      // 2. Insert transaction items & handle stock
      for (const item of items) {
        await tx.insert(transactionItems).values({
          transactionId: txn.id,
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          qty: item.qty,
          subtotal: String(Number(item.itemPrice) * item.qty),
        });

        // If product, deduct stock
        if (item.itemType === "product") {
          const [prod] = await tx.select({ stock: products.stock }).from(products).where(eq(products.id, item.itemId)).for("update").limit(1);
          if (!prod) throw new Error(`PRODUCT_NOT_FOUND: ${item.itemId}`);
          if (prod.stock < item.qty) throw new Error(`INSUFFICIENT_STOCK: ${item.itemName} (stok: ${prod.stock}, diminta: ${item.qty})`);

          const qtyBefore = prod.stock;
          const qtyAfter = qtyBefore - item.qty;

          await tx.insert(stockMutations).values({
            productId: item.itemId,
            type: "out",
            qtyBefore,
            qtyChange: -item.qty,
            qtyAfter,
            reference: invoiceNo,
            notes: `Penjualan ${invoiceNo}`,
            createdBy: session.id,
          });

          await tx.update(products).set({ stock: qtyAfter }).where(eq(products.id, item.itemId));
        }
      }

      return txn;
    });

    return success({
      id: result.id,
      invoiceNo: result.invoiceNo,
      total: result.total,
      paymentMethod: result.paymentMethod,
      amountPaid: amountPaid ?? 0,
      change: amountPaid ? Math.max(0, amountPaid - Number(result.total)) : 0,
    }, 201);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") return unauthorized();
      if (err.message === "FORBIDDEN") return forbidden();
      if (err.message.startsWith("INSUFFICIENT_STOCK")) return error(err.message.replace("INSUFFICIENT_STOCK: ", ""), 400);
      if (err.message.startsWith("PRODUCT_NOT_FOUND")) return error("Produk tidak ditemukan", 404);
    }
    console.error("POST /api/pos/transactions error:", err);
    return error("Terjadi kesalahan internal server");
  }
}