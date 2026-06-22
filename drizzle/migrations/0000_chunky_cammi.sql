CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'in_progress', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('product', 'service');--> statement-breakpoint
CREATE TYPE "public"."inpatient_condition" AS ENUM('stable', 'improving', 'critical');--> statement-breakpoint
CREATE TYPE "public"."inpatient_status" AS ENUM('active', 'discharged');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('product', 'service');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'qris', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'dokter', 'staff', 'customer');--> statement-breakpoint
CREATE TYPE "public"."stock_mutation_type" AS ENUM('in', 'out', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"staff_id" uuid,
	"service_id" uuid,
	"scheduled_at" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"chief_complaint" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"max_quota" integer DEFAULT 10 NOT NULL,
	"booked_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid,
	"doctor_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"customer_email" varchar(255),
	"pet_name" varchar(255) NOT NULL,
	"pet_species" varchar(100) NOT NULL,
	"chief_complaint" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "category_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"clinic_name" varchar(255) NOT NULL,
	"address" text,
	"phone" varchar(20),
	"email" varchar(255),
	"logo_url" text,
	"open_days" json NOT NULL,
	"open_time" time NOT NULL,
	"close_time" time NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"receipt_url" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inpatient_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inpatient_id" uuid NOT NULL,
	"condition" "inpatient_condition" NOT NULL,
	"notes" text,
	"photos" json DEFAULT '[]'::json,
	"is_visible_customer" boolean DEFAULT false NOT NULL,
	"logged_by" uuid NOT NULL,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inpatients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"cage_number" varchar(50) NOT NULL,
	"admitted_at" timestamp NOT NULL,
	"discharged_at" timestamp,
	"status" "inpatient_status" DEFAULT 'active' NOT NULL,
	"diagnosis" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"diagnosis" text NOT NULL,
	"treatment" text,
	"prescription" text,
	"notes" text,
	"is_visible_customer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_vaccines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"vaccine_name" varchar(255) NOT NULL,
	"vaccinated_at" timestamp NOT NULL,
	"next_due" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"species" varchar(100) NOT NULL,
	"breed" varchar(255),
	"gender" varchar(10),
	"birth_date" date,
	"weight" numeric(5, 2),
	"avatar_url" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 5 NOT NULL,
	"unit" varchar(50) NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"requires_doctor" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_mutations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "stock_mutation_type" NOT NULL,
	"qty_before" integer NOT NULL,
	"qty_change" integer NOT NULL,
	"qty_after" integer NOT NULL,
	"reference" varchar(255),
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"item_type" "item_type" NOT NULL,
	"item_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"item_price" numeric(10, 2) NOT NULL,
	"qty" integer NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_no" varchar(50) NOT NULL,
	"customer_id" uuid,
	"customer_name_snapshot" varchar(255),
	"staff_id" uuid NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "transaction_status" DEFAULT 'paid' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_invoice_no_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"phone" varchar(20),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_slots" ADD CONSTRAINT "booking_slots_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_booking_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."booking_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inpatient_logs" ADD CONSTRAINT "inpatient_logs_inpatient_id_inpatients_id_fk" FOREIGN KEY ("inpatient_id") REFERENCES "public"."inpatients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inpatient_logs" ADD CONSTRAINT "inpatient_logs_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inpatients" ADD CONSTRAINT "inpatients_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inpatients" ADD CONSTRAINT "inpatients_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_vaccines" ADD CONSTRAINT "pet_vaccines_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;