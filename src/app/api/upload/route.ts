import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage/client";
import { success, error, unauthorized } from "@/lib/utils/api-response";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) ?? "products";

    if (!file) return error("File tidak ditemukan", 400);
    if (!ALLOWED_TYPES.includes(file.type)) return error("Tipe file harus JPG, PNG, WebP, atau PDF", 400);
    if (file.size > MAX_SIZE) return error("Ukuran file maksimal 5MB", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const url = await uploadFile(bucket, path, buffer, file.type);
    return success({ url });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return error("Gagal upload file");
  }
}