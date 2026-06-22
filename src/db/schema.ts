import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  time,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["owner", "dokter", "staff", "customer"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "in_progress",
  "done",
  "cancelled",
]);
export const inpatientStatusEnum = pgEnum("inpatient_status", ["active", "discharged"]);
export const inpatientConditionEnum = pgEnum("inpatient_condition", [
  "stable",
  "improving",
  "critical",
]);
export const stockMutationTypeEnum = pgEnum("stock_mutation_type", ["in", "out", "adjustment"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "qris", "transfer"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["paid", "cancelled"]);
export const itemTypeEnum = pgEnum("item_type", ["product", "service"]);
export const categoryTypeEnum = pgEnum("category_type", ["product", "service"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "rejected"]);

// ─── 1. Users ────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("customer"),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 2. Pets ─────────────────────────────────────────────────────────────────

export const pets = pgTable("pets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 255 }),
  gender: varchar("gender", { length: 10 }),
  birthDate: date("birth_date"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  avatarUrl: text("avatar_url"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 3. Pet Vaccines ─────────────────────────────────────────────────────────

export const petVaccines = pgTable("pet_vaccines", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  vaccineName: varchar("vaccine_name", { length: 255 }).notNull(),
  vaccinatedAt: timestamp("vaccinated_at").notNull(),
  nextDue: timestamp("next_due"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 4. Appointments ─────────────────────────────────────────────────────────

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.id),
  staffId: uuid("staff_id").references(() => users.id),
  serviceId: uuid("service_id").references(() => services.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  chiefComplaint: text("chief_complaint"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 5. Medical Records ──────────────────────────────────────────────────────

export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.id),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment"),
  prescription: text("prescription"),
  notes: text("notes"),
  isVisibleCustomer: boolean("is_visible_customer").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 6. Inpatients ───────────────────────────────────────────────────────────

export const inpatients = pgTable("inpatients", {
  id: uuid("id").defaultRandom().primaryKey(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.id),
  cageNumber: varchar("cage_number", { length: 50 }).notNull(),
  admittedAt: timestamp("admitted_at").notNull(),
  dischargedAt: timestamp("discharged_at"),
  status: inpatientStatusEnum("status").notNull().default("active"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 7. Inpatient Logs ───────────────────────────────────────────────────────

export const inpatientLogs = pgTable("inpatient_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  inpatientId: uuid("inpatient_id")
    .notNull()
    .references(() => inpatients.id),
  condition: inpatientConditionEnum("condition").notNull(),
  notes: text("notes"),
  photos: json("photos").$type<string[]>().default([]),
  isVisibleCustomer: boolean("is_visible_customer").notNull().default(false),
  loggedBy: uuid("logged_by")
    .notNull()
    .references(() => users.id),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
});

// ─── 8. Categories ───────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: categoryTypeEnum("type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 9. Products ─────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(5),
  unit: varchar("unit", { length: 50 }).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 10. Services ────────────────────────────────────────────────────────────

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  requiresDoctor: boolean("requires_doctor").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 11. Stock Mutations ─────────────────────────────────────────────────────

export const stockMutations = pgTable("stock_mutations", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  type: stockMutationTypeEnum("type").notNull(),
  qtyBefore: integer("qty_before").notNull(),
  qtyChange: integer("qty_change").notNull(),
  qtyAfter: integer("qty_after").notNull(),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 12. Transactions ────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id").references(() => users.id),
  customerNameSnapshot: varchar("customer_name_snapshot", { length: 255 }),
  staffId: uuid("staff_id")
    .notNull()
    .references(() => users.id),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: transactionStatusEnum("status").notNull().default("paid"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 13. Transaction Items ───────────────────────────────────────────────────

export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => transactions.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemPrice: decimal("item_price", { precision: 10, scale: 2 }).notNull(),
  qty: integer("qty").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// ─── 14. Expenses ────────────────────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: varchar("category", { length: 255 }).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  receiptUrl: text("receipt_url"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 15. Bookings ────────────────────────────────────────────────────────────

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  slotId: uuid("slot_id").references(() => bookingSlots.id),
  doctorId: uuid("doctor_id").references(() => users.id),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  petName: varchar("pet_name", { length: 255 }).notNull(),
  petSpecies: varchar("pet_species", { length: 100 }).notNull(),
  chiefComplaint: text("chief_complaint"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 16. Booking Slots ───────────────────────────────────────────────────────

export const bookingSlots = pgTable("booking_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  maxQuota: integer("max_quota").notNull().default(10),
  bookedCount: integer("booked_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 17. Clinic Settings ─────────────────────────────────────────────────────

export const clinicSettings = pgTable("clinic_settings", {
  id: integer("id").primaryKey().default(1),
  clinicName: varchar("clinic_name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  logoUrl: text("logo_url"),
  openDays: json("open_days").$type<string[]>().notNull(),
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  pets: many(pets),
  doctorAppointments: many(appointments, { relationName: "doctorAppointments" }),
  staffAppointments: many(appointments, { relationName: "staffAppointments" }),
  medicalRecords: many(medicalRecords),
  inpatients: many(inpatients),
  inpatientLogs: many(inpatientLogs),
  stockMutations: many(stockMutations),
  transactions: many(transactions),
  expenses: many(expenses),
  bookingSlots: many(bookingSlots),
  bookings: many(bookings),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id],
  }),
  vaccines: many(petVaccines),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  inpatients: many(inpatients),
}));

export const petVaccinesRelations = relations(petVaccines, ({ one }) => ({
  pet: one(pets, {
    fields: [petVaccines.petId],
    references: [pets.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  pet: one(pets, {
    fields: [appointments.petId],
    references: [pets.id],
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
    relationName: "doctorAppointments",
  }),
  staff: one(users, {
    fields: [appointments.staffId],
    references: [users.id],
    relationName: "staffAppointments",
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  medicalRecords: many(medicalRecords),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
  pet: one(pets, {
    fields: [medicalRecords.petId],
    references: [pets.id],
  }),
  doctor: one(users, {
    fields: [medicalRecords.doctorId],
    references: [users.id],
  }),
}));

export const inpatientsRelations = relations(inpatients, ({ one, many }) => ({
  pet: one(pets, {
    fields: [inpatients.petId],
    references: [pets.id],
  }),
  doctor: one(users, {
    fields: [inpatients.doctorId],
    references: [users.id],
  }),
  logs: many(inpatientLogs),
}));

export const inpatientLogsRelations = relations(inpatientLogs, ({ one }) => ({
  inpatient: one(inpatients, {
    fields: [inpatientLogs.inpatientId],
    references: [inpatients.id],
  }),
  loggedByUser: one(users, {
    fields: [inpatientLogs.loggedBy],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  services: many(services),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stockMutations: many(stockMutations),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  appointments: many(appointments),
}));

export const stockMutationsRelations = relations(stockMutations, ({ one }) => ({
  product: one(products, {
    fields: [stockMutations.productId],
    references: [products.id],
  }),
  createdByUser: one(users, {
    fields: [stockMutations.createdBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  customer: one(users, {
    fields: [transactions.customerId],
    references: [users.id],
  }),
  staff: one(users, {
    fields: [transactions.staffId],
    references: [users.id],
  }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  createdByUser: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  slot: one(bookingSlots, {
    fields: [bookings.slotId],
    references: [bookingSlots.id],
  }),
  doctor: one(users, {
    fields: [bookings.doctorId],
    references: [users.id],
  }),
}));

export const bookingSlotsRelations = relations(bookingSlots, ({ one, many }) => ({
  doctor: one(users, {
    fields: [bookingSlots.doctorId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;

export type PetVaccine = typeof petVaccines.$inferSelect;
export type NewPetVaccine = typeof petVaccines.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;

export type Inpatient = typeof inpatients.$inferSelect;
export type NewInpatient = typeof inpatients.$inferInsert;

export type InpatientLog = typeof inpatientLogs.$inferSelect;
export type NewInpatientLog = typeof inpatientLogs.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type StockMutation = typeof stockMutations.$inferSelect;
export type NewStockMutation = typeof stockMutations.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type BookingSlot = typeof bookingSlots.$inferSelect;
export type NewBookingSlot = typeof bookingSlots.$inferInsert;

export type ClinicSetting = typeof clinicSettings.$inferSelect;
export type NewClinicSetting = typeof clinicSettings.$inferInsert;