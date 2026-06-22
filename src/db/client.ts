import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getDb(): ReturnType<typeof drizzle> {
  if (cachedDb) return cachedDb;
  if (globalForDb.db) return globalForDb.db;

  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }

  const client = postgres(connectionString, {
    max: 1,
    ssl: "require",
    idle_timeout: 20,
    connect_timeout: 10,
  });

  const db = drizzle(client, { schema });
  cachedDb = db;

  if (process.env["NODE_ENV"] !== "production") {
    globalForDb.db = db;
  }

  return db;
}

// Lazy singleton — only initializes when first accessed
export const db = new Proxy<ReturnType<typeof drizzle>>({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

export type Db = ReturnType<typeof drizzle>;