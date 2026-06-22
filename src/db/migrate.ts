import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runMigrate = async () => {
  const connectionString = process.env["DATABASE_URL_DIRECT"] ?? process.env["DATABASE_URL"];

  if (!connectionString) {
    console.error("❌ DATABASE_URL_DIRECT or DATABASE_URL is not defined");
    console.error("   DATABASE_URL_DIRECT should point directly to port 5432 (not pooler)");
    process.exit(1);
  }

  console.log("⏳ Connecting to database...");
  console.log(`   Using: ${connectionString.replace(/\/\/.*@/, "//user:pass@")}`);

  const connection = postgres(connectionString, {
    max: 1,
    ssl: "require",
    connect_timeout: 30,
  });

  const db = drizzle(connection);

  console.log("⏳ Running migrations from drizzle/migrations...");

  const start = Date.now();

  try {
    await migrate(db, { migrationsFolder: "drizzle/migrations" });
    const end = Date.now();
    console.log(`✅ Migrations completed successfully in ${end - start}ms`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:");
    console.error(err);
    process.exit(1);
  }
};

runMigrate();