import { db } from "./client";
import {
  users,
  categories,
  products,
  services,
  clinicSettings,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

const seed = async () => {
  console.log("⏳ Seeding database...\n");

  // ─── Users ───────────────────────────────────────────────────────────────

  const usersData = [
    {
      name: "Admin VetCare",
      email: "admin@vetcare.com",
      password: await bcrypt.hash("Admin123!", 12),
      role: "owner" as const,
    },
    {
      name: "Dr. Sarah",
      email: "dokter@vetcare.com",
      password: await bcrypt.hash("Dokter123!", 12),
      role: "dokter" as const,
    },
    {
      name: "Budi Staff",
      email: "staff@vetcare.com",
      password: await bcrypt.hash("Staff123!", 12),
      role: "staff" as const,
    },
    {
      name: "Andi Pelanggan",
      email: "customer@vetcare.com",
      password: await bcrypt.hash("Customer123!", 12),
      role: "customer" as const,
    },
  ];

  for (const userData of usersData) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(users).values(userData);
      console.log(`✅ User created: ${userData.email} (${userData.role})`);
    } else {
      console.log(`⏭️  User skipped (already exists): ${userData.email}`);
    }
  }

  // ─── Categories ──────────────────────────────────────────────────────────

  const productCategories = [
    { name: "Obat-obatan", type: "product" as const },
    { name: "Vitamin", type: "product" as const },
    { name: "Aksesoris", type: "product" as const },
    { name: "Makanan", type: "product" as const },
    { name: "Perawatan", type: "product" as const },
  ];

  const serviceCategories = [
    { name: "Konsultasi", type: "service" as const },
    { name: "Grooming", type: "service" as const },
    { name: "Perawatan", type: "service" as const },
  ];

  const allCategoryData = [...productCategories, ...serviceCategories];
  const categoryMap: Record<string, string> = {};

  for (const catData of allCategoryData) {
    const existing = await db
      .select()
      .from(categories)
      .where(
        sql`${categories.name} = ${catData.name} AND ${categories.type} = ${catData.type}`
      )
      .limit(1);

    if (existing.length === 0) {
      const [inserted] = await db.insert(categories).values(catData).returning();
      if (inserted) {
        categoryMap[catData.name] = inserted.id;
        console.log(`✅ Category created: ${catData.name} (${catData.type})`);
      }
    } else {
      const existingCat = existing[0];
      if (existingCat) {
        categoryMap[catData.name] = existingCat.id;
        console.log(`⏭️  Category skipped (already exists): ${catData.name}`);
      }
    }
  }

  // ─── Products ────────────────────────────────────────────────────────────

  const productsData = [
    { name: "Amoxicillin 500mg", categoryName: "Obat-obatan", price: "50000", stock: 100, minStock: 20, unit: "strip" },
    { name: "Paracetamol Sirup", categoryName: "Obat-obatan", price: "35000", stock: 80, minStock: 15, unit: "botol" },
    { name: "Antibiotik Salep", categoryName: "Obat-obatan", price: "45000", stock: 60, minStock: 10, unit: "tube" },
    { name: "Vitamin C Tablet", categoryName: "Vitamin", price: "25000", stock: 150, minStock: 30, unit: "strip" },
    { name: "Multivitamin Sirup", categoryName: "Vitamin", price: "55000", stock: 40, minStock: 10, unit: "botol" },
    { name: "Kalung Hewan", categoryName: "Aksesoris", price: "75000", stock: 30, minStock: 5, unit: "pcs" },
    { name: "Tali Leash", categoryName: "Aksesoris", price: "50000", stock: 25, minStock: 5, unit: "pcs" },
    { name: "Makanan Kucing Dewasa", categoryName: "Makanan", price: "85000", stock: 50, minStock: 10, unit: "kg" },
    { name: "Makanan Anjing Dewasa", categoryName: "Makanan", price: "95000", stock: 45, minStock: 10, unit: "kg" },
    { name: "Shampo Hewan", categoryName: "Perawatan", price: "65000", stock: 35, minStock: 8, unit: "botol" },
  ];

  for (const prodData of productsData) {
    const categoryId = categoryMap[prodData.categoryName];
    if (!categoryId) {
      console.error(`❌ Category not found: ${prodData.categoryName}`);
      continue;
    }

    const existing = await db
      .select()
      .from(products)
      .where(eq(products.name, prodData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(products).values({
        name: prodData.name,
        categoryId,
        price: prodData.price,
        stock: prodData.stock,
        minStock: prodData.minStock,
        unit: prodData.unit,
      });
      console.log(`✅ Product created: ${prodData.name}`);
    } else {
      console.log(`⏭️  Product skipped (already exists): ${prodData.name}`);
    }
  }

  // ─── Services ────────────────────────────────────────────────────────────

  const servicesData = [
    { name: "Konsultasi Umum", categoryName: "Konsultasi", price: "100000", durationMinutes: 30, requiresDoctor: true },
    { name: "Vaksinasi", categoryName: "Konsultasi", price: "200000", durationMinutes: 20, requiresDoctor: true },
    { name: "Grooming Basic", categoryName: "Grooming", price: "150000", durationMinutes: 60, requiresDoctor: false },
    { name: "Grooming Full", categoryName: "Grooming", price: "250000", durationMinutes: 90, requiresDoctor: false },
    { name: "Rawat Inap", categoryName: "Perawatan", price: "350000", durationMinutes: 1440, requiresDoctor: true },
  ];

  for (const svcData of servicesData) {
    const categoryId = categoryMap[svcData.categoryName];
    if (!categoryId) {
      console.error(`❌ Category not found: ${svcData.categoryName}`);
      continue;
    }

    const existing = await db
      .select()
      .from(services)
      .where(eq(services.name, svcData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(services).values({
        name: svcData.name,
        categoryId,
        price: svcData.price,
        durationMinutes: svcData.durationMinutes,
        requiresDoctor: svcData.requiresDoctor,
      });
      console.log(`✅ Service created: ${svcData.name}`);
    } else {
      console.log(`⏭️  Service skipped (already exists): ${svcData.name}`);
    }
  }

  // ─── Clinic Settings ─────────────────────────────────────────────────────

  const existingSettings = await db
    .select()
    .from(clinicSettings)
    .where(eq(clinicSettings.id, 1))
    .limit(1);

  if (existingSettings.length === 0) {
    await db.insert(clinicSettings).values({
      id: 1,
      clinicName: "VetCare Klinik Hewan",
      address: "Jl. Contoh No. 123, Jakarta",
      phone: "021-12345678",
      email: "info@vetcare.com",
      openDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
      openTime: "08:00",
      closeTime: "20:00",
    });
    console.log("✅ Clinic settings created: VetCare Klinik Hewan");
  } else {
    console.log("⏭️  Clinic settings skipped (already exists)");
  }

  console.log("\n✅ Seeding completed!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("\n❌ Seeding failed:");
  console.error(err);
  process.exit(1);
});