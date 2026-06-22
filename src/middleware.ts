import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env["JWT_SECRET"] ?? "fallback-secret-change-me-in-production"
);

const COOKIE_NAME = "vetcare_session";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/layanan",
  "/dokter",
  "/booking",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/booking/slots",
];

// Role-to-path mapping for redirect
const rolePaths: Record<string, string> = {
  owner: "/owner",
  dokter: "/dokter",
  staff: "/staff",
  customer: "/customer",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (pathname.startsWith("/api/users?role=dokter") || pathname === "/api/users") {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify JWT
  let payload: { id: string; email: string; role: string; name: string };
  try {
    const result = await jwtVerify(token, JWT_SECRET);
    payload = result.payload as unknown as typeof payload;
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role;

  // Check if the route matches the user's role
  const isOwnerRoute = pathname.startsWith("/owner");
  const isDokterRoute = pathname.startsWith("/dokter");
  const isStaffRoute = pathname.startsWith("/staff");
  const isCustomerRoute = pathname.startsWith("/customer");

  // If user is on a route that doesn't match their role, redirect to their dashboard
  if (
    (isOwnerRoute && role !== "owner") ||
    (isDokterRoute && role !== "dokter") ||
    (isStaffRoute && role !== "staff") ||
    (isCustomerRoute && role !== "customer")
  ) {
    const dashboardPath = rolePaths[role] ?? "/";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};