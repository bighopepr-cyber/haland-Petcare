import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { eq, sql, like, or, and } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const createUserSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["owner", "dokter", "staff", "customer"]),
  phone: z.string().optional(),
});

const querySchema = z.object({
  role: z.enum(["owner", "dokter", "staff", "customer"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["owner"]);

    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      role: searchParams.get("role") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    if (!query.success) {
      return validationError(query.error.flatten());
    }

    const { role, search, page, limit } = query.data;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (role) {
      conditions.push(eq(users.role, role));
    }
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult, userList] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause)
        .then((r) => Number(r[0]?.count ?? 0)),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(users.createdAt)
        .limit(limit)
        .offset(offset),
    ]);

    return success({
      users: userList,
      pagination: {
        page,
        limit,
        total: totalResult,
        totalPages: Math.ceil(totalResult / limit),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return unauthorized();
    if (err instanceof Error && err.message === "FORBIDDEN") return forbidden();
    console.error("GET /api/users error:", err);
    return error("Terjadi kesalahan internal server");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["owner"]);

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const { name, email, password, role, phone } = parsed.data;

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return error("Email sudah terdaftar", 409);
    }

    const hashed = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashed,
        role,
        phone: phone ?? null,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return success(newUser, 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return unauthorized();
    if (err instanceof Error && err.message === "FORBIDDEN") return forbidden();
    console.error("POST /api/users error:", err);
    return error("Terjadi kesalahan internal server");
  }
}