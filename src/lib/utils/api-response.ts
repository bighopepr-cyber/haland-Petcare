import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200): Response {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 500): Response {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function validationError(errors: unknown): Response {
  return NextResponse.json(
    { success: false, error: "Validasi gagal", details: errors },
    { status: 400 }
  );
}

export function unauthorized(): Response {
  return NextResponse.json(
    { success: false, error: "Tidak terautentikasi" },
    { status: 401 }
  );
}

export function forbidden(): Response {
  return NextResponse.json(
    { success: false, error: "Akses ditolak" },
    { status: 403 }
  );
}