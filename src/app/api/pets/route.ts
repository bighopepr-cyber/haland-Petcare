import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { pets } from "@/db/schema";
import { requireAuth, getSession } from "@/lib/auth";
import { eq, sql, like, and, or } from "drizzle-orm";
import { z } from "zod";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/utils/api-response";

const createSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  weight: z.string().optional(),
  notes: z.string().optional(),
  ownerId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";

    if (session.role === "customer") {
      const list = await db.select().from(pets).where(eq(pets.ownerId, session.id)).orderBy(pets.name);
      return success(list);
    }

    // Owner/Staff/Dokter: all pets with search
    const list = await db.select().from(pets)
      .where(search ? or(like(pets.name, `%${search}%`), like(pets.species, `%${search}%`)) : undefined)
      .orderBy(pets.name);
    return success(list);
  } catch (err: unknown) {
    console.error("GET /api/pets error:", err);
    return error("Terjadi kesalahan internal server");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const ownerId = session.role === "customer" ? session.id : (parsed.data.ownerId ?? session.id);

    const [pet] = await db.insert(pets).values({
      name: parsed.data.name,
      species: parsed.data.species,
      breed: parsed.data.breed ?? null,
      gender: parsed.data.gender ?? null,
      birthDate: parsed.data.birthDate ?? null,
      weight: parsed.data.weight ?? null,
      notes: parsed.data.notes ?? null,
      ownerId,
    }).returning();

    return success(pet, 201);
  } catch (err: unknown) {
    console.error("POST /api/pets error:", err);
    return error("Terjadi kesalahan internal server");
  }
}