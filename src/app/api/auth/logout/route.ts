import { NextResponse } from "next/server";
import { success } from "@/lib/utils/api-response";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: { message: "Logout berhasil" },
  });

  response.cookies.set("vetcare_session", "", {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}