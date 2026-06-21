Ini 10 instruksi lengkap untuk GitHub Copilot Chat, spesifik Vercel + Supabase + GitHub Actions:

---

## INSTRUKSI 1 — PROJECT SETUP & FONDASI

**Prompt untuk Copilot:**

```
Buat project Next.js 14 fullstack dari nol dengan spesifikasi berikut:

SETUP:
- Next.js 14 dengan App Router + TypeScript strict (no "any")
- TailwindCSS + shadcn/ui
- Drizzle ORM + PostgreSQL (Supabase)
- Folder structure:
  src/app/(auth)/
  src/app/(dashboard)/owner/
  src/app/(dashboard)/dokter/
  src/app/(dashboard)/staff/
  src/app/(dashboard)/customer/
  src/app/(public)/
  src/app/api/
  src/db/
  src/lib/auth/
  src/lib/validations/
  src/lib/utils/
  src/components/ui/
  src/components/modules/
  src/hooks/
  .github/workflows/

INSTALL DEPENDENCIES:
- drizzle-orm, drizzle-kit
- postgres (postgres-js)
- @supabase/supabase-js
- bcryptjs + @types/bcryptjs
- jose (JWT)
- zod
- recharts
- date-fns
- sonner (toast)
- @types/node, tsx (devDependencies)

PACKAGE.JSON SCRIPTS:
"dev": "next dev"
"build": "next build"
"start": "next start"
"lint": "next lint"
"type-check": "tsc --noEmit"
"db:generate": "drizzle-kit generate"
"db:migrate": "npx tsx src/db/migrate.ts"
"db:seed": "npx tsx src/db/seed.ts"
"db:studio": "drizzle-kit studio"

DRIZZLE.CONFIG.TS di root:
- schema: src/db/schema.ts
- out: drizzle/migrations
- dialect: postgresql
- dbCredentials: { url: process.env.DATABASE_URL! }

NEXT.CONFIG.JS:
- images domain: supabase project url
- experimental serverActions: true

TARGET: "npm run dev" jalan tanpa error, struktur folder lengkap, tsconfig strict aktif, semua dependency terinstall.
```

---

## INSTRUKSI 2 — DATABASE SCHEMA LENGKAP

**Prompt untuk Copilot:**

```
Buat file src/db/schema.ts dengan Drizzle ORM untuk platform klinik hewan:

TABEL:
1. users → id (uuid), name, email, password, role (owner|dokter|staff|customer), phone, avatar_url, is_active (default true), created_at
2. pets → id, owner_id (FK users), name, species, breed, gender, birth_date, weight, avatar_url, notes, is_active, created_at
3. pet_vaccines → id, pet_id (FK pets), vaccine_name, vaccinated_at, next_due, notes, created_at
4. appointments → id, pet_id, doctor_id (FK users), staff_id (FK users), service_id, scheduled_at, status (scheduled|in_progress|done|cancelled), chief_complaint, notes, created_at
5. medical_records → id, appointment_id, pet_id, doctor_id, diagnosis, treatment, prescription, notes, is_visible_customer (default false), created_at
6. inpatients → id, pet_id, doctor_id, cage_number, admitted_at, discharged_at, status (active|discharged), diagnosis, notes, created_at
7. inpatient_logs → id, inpatient_id, condition (stable|improving|critical), notes, photos (json array string[]), is_visible_customer (default false), logged_by (FK users), logged_at
8. categories → id, name, type (product|service), is_active (default true), created_at
9. products → id, name, category_id (FK categories), price, stock (default 0), min_stock (default 5), unit, image_url, is_active (default true), created_at
10. services → id, name, category_id (FK categories), price, duration_minutes, requires_doctor (default false), is_active (default true), created_at
11. stock_mutations → id, product_id (FK products), type (in|out|adjustment), qty_before, qty_change, qty_after, reference, notes, created_by (FK users), created_at
12. transactions → id, invoice_no (unique), customer_id (FK users nullable), customer_name_snapshot, staff_id (FK users), total, payment_method (cash|qris|transfer), status (paid|cancelled), notes, created_at
13. transaction_items → id, transaction_id (FK transactions), item_type (product|service), item_id, item_name (snapshot), item_price (snapshot), qty, subtotal
14. expenses → id, category, description, amount, date, receipt_url, created_by (FK users), created_at
15. bookings → id, slot_id (FK booking_slots nullable), doctor_id (FK users nullable), customer_name, customer_phone, customer_email, pet_name, pet_species, chief_complaint, status (pending|confirmed|rejected), rejection_reason, created_at
16. booking_slots → id, doctor_id (FK users), date, start_time, max_quota (default 10), booked_count (default 0), is_active (default true), created_at
17. clinic_settings → id (default 1), clinic_name, address, phone, email, logo_url, open_days (json array), open_time, close_time, updated_at

ATURAN:
- Semua id pakai pgTable + uuid("id").defaultRandom().primaryKey()
- created_at: timestamp("created_at").defaultNow().notNull()
- Foreign key pakai references(() => table.id)
- Export semua tabel
- Buat dan export semua relasi dengan Drizzle relations()
- Buat dan export TypeScript types: type User = typeof users.$inferSelect, dst untuk semua tabel

TARGET: Schema compile tanpa error TypeScript, semua relasi terdefinisi, types ter-export.
```

---

## INSTRUKSI 3 — DATABASE CLIENT, MIGRATE & SEED

**Prompt untuk Copilot:**

```
Buat file-file database setup untuk Supabase + Vercel serverless:

FILE: src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { db: ReturnType<typeof drizzle> }

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    ssl: 'require',
    idle_timeout: 20,
    connect_timeout: 10,
  })
  return drizzle(client, { schema })
}

export const db = globalForDb.db ?? createDb()
if (process.env.NODE_ENV !== 'production') globalForDb.db = db

FILE: src/db/migrate.ts
- Import migrate dari drizzle-orm/postgres-js/migrator
- Gunakan DATABASE_URL_DIRECT dari env (port 5432, bukan pooler)
- Log setiap step ke console
- Process.exit(0) setelah selesai, exit(1) jika error

FILE: src/db/seed.ts
Buat data awal:
- Owner: { name: "Admin VetCare", email: "admin@vetcare.com", password: "Admin123!", role: "owner" }
- Dokter: { name: "Dr. Sarah", email: "dokter@vetcare.com", password: "Dokter123!", role: "dokter" }
- Staff: { name: "Budi Staff", email: "staff@vetcare.com", password: "Staff123!", role: "staff" }
- Customer: { name: "Andi Pelanggan", email: "customer@vetcare.com", password: "Customer123!", role: "customer" }
- 5 kategori produk: Obat-obatan, Vitamin, Aksesoris, Makanan, Perawatan
- 3 kategori layanan: Konsultasi, Grooming, Perawatan
- 10 produk dengan stok dan min_stock
- 5 layanan: Konsultasi Umum, Vaksinasi, Grooming Basic, Grooming Full, Rawat Inap
- clinic_settings default dengan nama "VetCare Klinik Hewan"
- Semua password hash dengan bcryptjs rounds 12
- Cek apakah data sudah ada sebelum insert (idempotent)

FILE: .env.example
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgmode=transaction
DATABASE_URL_DIRECT=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=ganti-dengan-random-string-minimal-32-karakter
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app

TARGET: "npm run db:migrate" dan "npm run db:seed" jalan dari lokal pointing ke Supabase tanpa error.
```

---

## INSTRUKSI 4 — SISTEM AUTH LENGKAP

**Prompt untuk Copilot:**

```
Buat sistem autentikasi custom JWT + httpOnly cookie untuk Next.js 14 + Vercel:

FILE: src/lib/auth/password.ts
- hashPassword(password: string): Promise<string> → bcryptjs, rounds 12
- verifyPassword(plain: string, hash: string): Promise<boolean>

FILE: src/lib/auth/session.ts
- Gunakan jose (bukan jsonwebtoken, tidak support Edge Runtime)
- JWT_SECRET dari env, encode ke TextEncoder
- SessionPayload type: { id: string, email: string, role: string, name: string }
- createSession(payload: SessionPayload): Promise<string> → JWT expire 7 hari
- getSession(): Promise<SessionPayload | null> → baca dari cookies() Next.js
- setSessionCookie(token: string): void → httpOnly, secure, sameSite strict, path /
- clearSessionCookie(): void → delete cookie

FILE: src/lib/auth/guard.ts
- requireAuth(allowedRoles?: string[]): Promise<SessionPayload> 
- Re-query user dari DB: cek is_active=true, bukan hanya percaya token
- Jika tidak ada session → throw new Error('UNAUTHORIZED')
- Jika is_active=false → throw new Error('ACCOUNT_DISABLED')  
- Jika role tidak sesuai → throw new Error('FORBIDDEN')

FILE: src/lib/utils/api-response.ts
- success<T>(data: T, status = 200): Response
- error(message: string, status = 500): Response
- validationError(errors: unknown): Response → status 400
- unauthorized(): Response → status 401
- forbidden(): Response → status 403

API ROUTES:
POST /api/auth/login:
- Validasi Zod: email, password
- Cek user exist + is_active + verifyPassword
- createSession → setSessionCookie
- Return user data (tanpa password)

POST /api/auth/logout:
- clearSessionCookie
- Return success

GET /api/auth/me:
- getSession → re-query DB
- Return user data lengkap

FILE: src/middleware.ts
- Protect: /owner/*, /dokter/*, /staff/*, /customer/*
- Baca cookie vetcare_session
- Verify JWT dengan jose
- Jika invalid/expired → redirect /login
- Jika valid → cek role cocok dengan path prefix
- Role mismatch → redirect ke dashboard role yang benar:
  owner → /owner/dashboard
  dokter → /dokter/dashboard
  staff → /staff/dashboard
  customer → /customer/dashboard
- Public routes yang tidak diprotect: /, /login, /layanan, /dokter (public), /booking, /api/auth/*, /api/booking/slots, /api/users?role=dokter

HALAMAN LOGIN: src/app/(auth)/login/page.tsx
- UI friendly, centered card, logo klinik
- Form: email, password, tombol Login
- Error state ditampilkan di bawah form
- Loading state pada tombol
- Redirect otomatis sesuai role setelah login

TARGET: Login set cookie, middleware redirect benar per role, logout clear cookie, re-validasi is_active dari DB di setiap request protected.
```

---

## INSTRUKSI 5 — UI DESIGN SYSTEM

**Prompt untuk Copilot:**

```
Buat design system dengan 2 tema UI berbeda di src/components/ui/:

TEMA PROFESIONAL (untuk Staff, Inventory, POS, Owner, Dokter):
Prinsip: dense information, efisiensi tinggi, minim dekorasi
- Primary: slate-900 (sidebar), emerald-600 (accent/CTA)
- Background: slate-50, white untuk cards
- Text: slate-900 (primary), slate-500 (secondary)
- Border: slate-200
- Font size default: text-sm
- Border radius: rounded-md
- Shadow: shadow-sm
- Table row: hover:bg-slate-50, border-b border-slate-100
- Input: border-slate-300, focus:border-emerald-500, focus:ring-emerald-500

TEMA FRIENDLY (untuk Customer, Public/Landing):
Prinsip: spacious, warm, mudah dipahami orang awam
- Primary: teal-600, accent: orange-400
- Background: white, gray-50 untuk sections
- Font size default: text-base
- Border radius: rounded-xl
- Shadow: shadow-md
- Padding lebih besar, whitespace lebih lega
- Button: rounded-full

KOMPONEN (semua support kedua tema via props variant="professional"|"friendly"):

Input.tsx:
- Props: label, error, hint, required, icon?, ...HTMLInputAttributes
- Show asterisk jika required
- Error message merah di bawah input
- Hint text abu di bawah input

Select.tsx:
- Props: label, options: {value: string, label: string}[], error, placeholder, ...
- Gunakan native select atau Radix UI Select

Modal.tsx:
- Props: open, onClose, title, size: "sm"|"md"|"lg"|"xl", children, footer?
- Backdrop blur, animasi fade+scale
- Close button di pojok kanan atas
- Trap focus saat modal terbuka

DataTable.tsx:
- Props: columns: {key, header, render?}[], data, loading, pagination?, searchable?
- Loading state: skeleton 5 baris
- Empty state: tampilkan EmptyState component
- Search bar di atas kiri jika searchable=true
- Pagination di bawah kanan

Badge.tsx:
- Auto warna berdasarkan value:
  active/paid/confirmed/done/stable → emerald
  pending/scheduled → amber  
  inactive/cancelled/rejected → red
  in_progress/improving → blue
  critical → red bold

StatsCard.tsx:
- Props: title, value, icon, trend?: {value: number, label: string}, color
- Compact untuk dashboard profesional

PageHeader.tsx:
- Props: title, subtitle?, actions?: ReactNode
- Breadcrumb opsional

ConfirmDialog.tsx:
- Props: open, onConfirm, onCancel, title, description, confirmLabel, danger?
- Danger mode: tombol konfirmasi warna red

ImageUpload.tsx:
- Drag & drop area
- Preview gambar setelah upload
- Validasi tipe: jpg, png, webp, max 5MB
- Progress indicator saat upload
- Props: onUpload(url: string), currentUrl?, multiple?

DateRangePicker.tsx:
- Preset buttons: Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini
- Custom range dengan 2 date input
- Props: from, to, onChange(from, to)

LoadingSkeleton.tsx:
- variant: "table" | "card" | "page" | "stats"
- Animate pulse

EmptyState.tsx:
- SVG ilustrasi sederhana (inline, bukan gambar eksternal)
- Props: title, description, action?: {label: string, onClick: () => void}

PrintWrapper.tsx:
- Wrap konten yang bisa diprint
- @media print: hide semua kecuali children
- Props: children, paperSize: "thermal"|"a4"

LAYOUT DASHBOARD (src/components/layout/):

Sidebar.tsx (profesional):
- Width: 240px desktop, overlay mobile
- Logo + nama klinik di atas
- Menu navigasi dengan ikon (gunakan lucide-react)
- Active state: bg-emerald-50 text-emerald-700
- User info + tombol logout di bawah
- Collapsible di tablet

Topbar.tsx:
- Breadcrumb kiri
- Nama klinik tengah (mobile)
- Avatar + nama user kanan
- Hamburger menu untuk mobile

TARGET: Semua komponen render tanpa error, import dari "@/components/ui/[nama]" berhasil, tema profesional dan friendly terlihat berbeda jelas.
```

---

## INSTRUKSI 6 — MODUL OWNER & MANAJEMEN USER

**Prompt untuk Copilot:**

```
Buat modul Owner Dashboard dengan UI profesional:

LAYOUT: src/app/(dashboard)/layout.tsx
- Import Sidebar + Topbar
- Cek session di server component
- Redirect ke /login jika tidak ada session
- Pass user data ke children via context atau props

HALAMAN: /owner/dashboard
Server component, fetch data paralel dengan Promise.all:
- Total pasien hari ini (count appointments hari ini)
- Pemasukan hari ini (sum transactions.total hari ini status=paid)
- Stok menipis (count products where stock <= min_stock)
- Booking pending (count bookings where status=pending)
- 5 appointment terbaru hari ini
- 5 transaksi terbaru

UI:
- 4 StatsCard di atas
- 2 tabel di bawah side by side (desktop) / stack (mobile)

HALAMAN: /owner/users
Client component dengan useEffect untuk fetch:

API GET /api/users:
- Query params: role?, search?, page?, limit=20
- requireAuth(['owner'])
- Return paginated list

API POST /api/users:
- requireAuth(['owner'])
- Zod validate: name, email, password, role, phone?
- Cek email sudah ada
- Hash password
- Insert user
- Return user baru (tanpa password)

API GET /api/users/[id]:
- requireAuth(['owner'])
- Return user detail

API PATCH /api/users/[id]:
- requireAuth(['owner'])
- Zod validate: name?, phone?, role?, is_active?
- Jika update password → hash dulu
- Return user updated

UI:
- PageHeader "Manajemen User" + tombol "Tambah User"
- Filter tab: Semua | Owner | Dokter | Staff | Customer
- Search bar
- DataTable: Name, Email, Role badge, Status badge, Phone, Aksi (⋮ dropdown: Edit, Nonaktifkan/Aktifkan)
- Modal tambah user: name, email, password, role, phone
- Modal edit user: name, phone, role, is_active toggle
- ConfirmDialog sebelum nonaktifkan
- Toast success/error setelah setiap aksi

TARGET: CRUD user lengkap, pagination bekerja, filter role bekerja, guard owner-only aktif.
```

---

## INSTRUKSI 7 — MODUL INVENTORY & POS

**Prompt untuk Copilot:**

```
Buat modul Inventory dan POS dengan UI SANGAT PROFESIONAL (dense, efisien):

INVENTORY: /staff/inventory (juga bisa diakses owner)

API:
GET /api/inventory/products → list + search + filter category + filter is_active + pagination
POST /api/inventory/products → requireAuth(['owner','staff'])
PATCH /api/inventory/products/[id] → requireAuth(['owner','staff'])
POST /api/inventory/products/[id]/stock → tambah stok, catat mutation, atomic transaction
GET /api/inventory/mutations → list mutasi + filter product + filter type + filter date range
CRUD /api/inventory/services → requireAuth(['owner','staff'])
CRUD /api/inventory/categories → requireAuth(['owner','staff'])

STOCK OPERATION (wajib atomic Drizzle tx()):
Tambah Stok:
  tx(() => {
    1. Get current stock
    2. Insert stock_mutation (type: in, qty_before, qty_change, qty_after)
    3. Update products.stock += qty_change
  })

Adjustment:
  tx(() => {
    1. Get current stock
    2. Hitung selisih (target - current)
    3. Insert stock_mutation (type: adjustment)
    4. Update products.stock = target
  })

UI INVENTORY:
- Tab: [Produk] [Mutasi Stok] [Layanan] [Kategori]

TAB PRODUK:
- Toolbar: search kiri, filter kategori + status dropdown, tombol "Tambah Produk" kanan
- DataTable compact: No, Gambar (40x40), Nama, Kategori, Harga, Stok (merah bold jika ≤ min_stock), Min Stok, Status badge, Aksi ⋮
- Dropdown aksi: Edit Produk | Tambah Stok | Adjustment Stok | Riwayat Mutasi | Nonaktifkan
- Baris stok kritis: bg-red-50
- Modal Tambah/Edit Produk: nama, kategori, harga, min_stok, unit, upload gambar
- Modal Tambah Stok: produk readonly, stok sekarang readonly, jumlah masuk, stok sesudah (auto), catatan
- Modal Adjustment: stok sekarang readonly, stok seharusnya input, selisih auto (hijau/merah), alasan wajib
- Drawer/Modal Riwayat Mutasi: tabel tanggal, tipe, sebelum, perubahan, sesudah, referensi

TAB MUTASI STOK:
- Filter: produk, tipe (in/out/adjustment), date range
- DataTable: Tanggal, Produk, Tipe badge, Sebelum, Perubahan (+/-), Sesudah, Referensi, Catatan

POS: /staff/pos (HANYA DESKTOP ≥ 1024px, tampilkan pesan di mobile)

LAYOUT 2 PANEL SIDE BY SIDE (tidak boleh scroll vertikal, fit viewport):

PANEL KIRI (60%):
- Search produk/layanan (sticky atas)
- Tab: [Produk] [Layanan]
- Grid 3-4 kolom card: gambar, nama, harga, badge stok
- Card stok 0: overlay abu "Habis", pointer-events none
- Click card → tambah ke cart

PANEL KANAN (40%, sticky):
- Header "Keranjang"
- List cart item: nama, stepper qty (−/+), harga satuan, subtotal, tombol hapus
- Divider
- Pilih Customer (search/autocomplete, opsional)
- Subtotal, diskon (input Rp), Total
- Pilih metode bayar: [Tunai] [QRIS] [Transfer] (toggle button)
- Tombol "Proses Pembayaran" (disabled jika cart kosong)

MODAL PEMBAYARAN:
- Total tagihan (besar, bold)
- Jika Tunai: input nominal bayar → tampilkan kembalian auto
- Tombol "Konfirmasi Bayar"
- Loading state saat proses

API POST /api/pos/transactions (ATOMIC DRIZZLE TX):
tx(() => {
  1. Generate invoice_no: INV-YYYYMMDD-XXXX
  2. Insert transactions
  3. Loop transaction_items: insert dengan snapshot nama+harga
  4. Loop item produk: 
     a. Get current stock, validasi cukup
     b. Update products.stock -= qty
     c. Insert stock_mutation type "out", reference: invoice_no
})
Rollback otomatis jika ada error di step manapun

SETELAH BAYAR:
- Modal berhasil: nomor invoice, total, kembalian
- Tombol "Print Struk" → PrintWrapper thermal 80mm
- Tombol "Transaksi Baru" → reset cart

STRUK PRINT (80mm thermal):
- Nama klinik, alamat, telpon
- No invoice, tanggal, kasir
- List item: nama qty x harga = subtotal
- Garis pembatas
- Total, metode bayar, bayar, kembalian
- Footer: "Terima kasih!"

TARGET: POS bisa proses transaksi end-to-end, stok berkurang otomatis di DB, struk bisa print, inventory update real-time setelah transaksi.
```

---

## INSTRUKSI 8 — MODUL KLINIK (APPOINTMENT, REKAM MEDIS, RAWAT INAP, HEWAN)

**Prompt untuk Copilot:**

```
Buat modul klinik dengan akses multi-role:

PETS API:
GET /api/pets → requireAuth semua role
  - Customer: hanya pets miliknya (where owner_id = session.id)
  - Owner/Staff/Dokter: semua pets + search nama/pemilik
POST /api/pets → requireAuth semua role
  - Customer: owner_id otomatis = session.id
  - Staff/Owner: owner_id dari body
PATCH /api/pets/[id] → cek kepemilikan untuk customer
GET /api/pets/[id]/vaccines
POST /api/pets/[id]/vaccines

APPOINTMENTS API:
GET /api/appointments → filter by role:
  - Owner: semua
  - Dokter: hanya where doctor_id = session.id
  - Staff: semua
  - Query params: date, status, doctor_id, pet_id
POST /api/appointments → requireAuth(['owner','staff'])
  - Zod validate: pet_id, doctor_id, service_id, scheduled_at, chief_complaint
PATCH /api/appointments/[id] → update status, notes

MEDICAL RECORDS API:
GET /api/medical-records → 
  - Dokter: semua atau filter pet_id
  - Customer: hanya milik hewan customer + is_visible_customer=true
POST /api/medical-records → requireAuth(['dokter'])
  - Wajib ada appointment_id
  - Set doctor_id = session.id otomatis
PATCH /api/medical-records/[id] → requireAuth(['dokter'])
  - Hanya dokter yang membuat yang bisa edit
  - Toggle is_visible_customer

INPATIENTS API:
GET /api/inpatients → 
  - Owner/Staff/Dokter: semua, filter status
  - Customer: hanya hewan miliknya yang status=active
POST /api/inpatients → requireAuth(['owner','dokter','staff'])
PATCH /api/inpatients/[id] → update status, notes (discharge: set discharged_at)
GET /api/inpatients/[id]/logs
POST /api/inpatients/[id]/logs → requireAuth(['dokter','staff'])
  - Upload foto ke Supabase Storage bucket "inpatient-photos"
  - Simpan array URL di photos field

UI HALAMAN:

/staff/appointment + /owner/appointment + /dokter/appointment:
- PageHeader dengan tombol "Buat Appointment" (staff/owner)
- Filter: date picker, status dropdown, dokter dropdown
- DataTable: Waktu, Hewan, Pemilik, Dokter, Layanan, Status badge, Aksi
- Modal buat appointment: cari hewan (autocomplete), pilih dokter, pilih layanan, datetime, keluhan
- Klik baris → detail appointment + tombol update status

/dokter/rekam-medis:
- List rekam medis dengan filter hewan, tanggal
- Card per rekam medis: hewan, pemilik, tanggal, diagnosis singkat, [Lihat/Edit]
- Form rekam medis (/dokter/rekam-medis/[id]):
  Diagnosis (textarea), Treatment (textarea), Prescription (textarea rich), Notes
  Toggle "Tampilkan ke Pemilik Hewan"
  Tombol Simpan

/staff/rawat-inap + /dokter/rawat-inap:
- Grid card pasien aktif: foto hewan, nama, pemilik, no kandang, masuk sejak, kondisi terakhir
- Badge kondisi: Stabil (hijau), Membaik (biru), Kritis (merah)
- Tombol "Tambah Log" per card
- Modal tambah log: kondisi (select), catatan (textarea), upload foto multiple
- Detail (/rawat-inap/[id]): timeline semua log, foto grid dengan lightbox

/customer/hewan:
- UI FRIENDLY (rounded-xl, spacious, teal accent)
- Grid card hewan milik customer
- Tombol "Tambah Hewan", "Lihat Detail"
- Detail hewan: info, riwayat vaksin, tombol tambah vaksin

/customer/rekam-medis:
- Tab per hewan yang dimiliki
- Card rekam medis yang is_visible_customer=true saja
- Detail: diagnosis, treatment (tanpa dosis resep detail)

/customer/monitoring:
- Banner jika tidak ada hewan rawat inap: "Tidak ada hewan yang sedang dirawat"
- Card hewan rawat inap: nama, kandang, masuk sejak, kondisi terakhir + waktu update
- Timeline log: hanya is_visible_customer=true
- Foto tap → lightbox fullscreen

TARGET: Semua role bisa akses sesuai hak, rekam medis visible toggle bekerja, upload foto rawat inap tersimpan ke Supabase Storage, monitoring customer realtime dari DB.
```

---

## INSTRUKSI 9 — BOOKING ONLINE, LAPORAN & PENGELUARAN

**Prompt untuk Copilot:**

```
Buat modul Booking Online (public friendly) dan Laporan (owner profesional):

SUPABASE STORAGE SETUP:
Buat src/lib/storage/client.ts:
- Init Supabase client dengan SUPABASE_SERVICE_ROLE_KEY
- uploadFile(bucket, path, buffer, mimetype): Promise<string> → return public URL
- deleteFile(bucket, path): Promise<void>
- Bucket yang dipakai: "avatars", "products", "inpatient-photos", "receipts"

API UPLOAD:
POST /api/upload:
- requireAuth()
- Accept multipart/form-data
- Validasi: tipe file (jpg|png|webp|pdf), max size 5MB
- Upload ke Supabase Storage sesuai bucket param
- Return { url: string }

BOOKING ONLINE — PUBLIC:

API PUBLIC (tanpa requireAuth):
GET /api/booking/slots?date=&doctor_id= → slot aktif dengan booked_count < max_quota
GET /api/users?role=dokter&public=true → list dokter aktif untuk landing page
POST /api/booking → buat booking baru, increment booked_count pada slot, validasi slot masih tersedia

HALAMAN / (landing, tema FRIENDLY):
- Navbar: logo, menu, tombol Booking (teal) + Login (outline)
- Hero: headline besar, 2 CTA button, ilustrasi SVG inline sederhana (dokter + hewan)
- Section layanan: grid 3 kolom, emoji icon, nama, deskripsi singkat
- Section dokter: card grid dari DB (foto, nama, spesialisasi)
- Section info klinik: jam buka, alamat, kontak (dari clinic_settings)
- Footer: copyright, social links placeholder

HALAMAN /booking (tema FRIENDLY, step wizard):
Step indicator visual di atas (3 langkah dengan garis penghubung)

Step 1 — Pilih Jadwal:
- Dropdown pilih dokter (opsional, "Semua Dokter")
- Date picker (highlight hari yang punya slot tersedia)
- Grid slot: card rounded-xl, jam, status tersedia/penuh
- Slot penuh → disabled + overlay "Penuh"
- Slot terpilih → border teal-500 + checkmark

Step 2 — Data Hewan:
- Jika customer login → nama & HP auto-fill
- Input: Nama Pemilik*, No HP*, Email, Nama Hewan*, Spesies*, Keluhan (textarea)

Step 3 — Konfirmasi:
- Summary card: dokter, tanggal, jam, nama hewan, keluhan
- Tombol "Kirim Booking" dengan loading state
- Success screen: ilustrasi SVG, pesan konfirmasi, "Kami akan menghubungi Anda"

/staff/booking — Manajemen Booking:
- Tab filter: Menunggu | Dikonfirmasi | Ditolak | Semua
- DataTable: Tgl Booking, Nama, No HP, Hewan, Spesies, Slot/Waktu, Keluhan, Status badge, Aksi
- Aksi ✅ Konfirmasi → ConfirmDialog → update status=confirmed → auto create appointment
- Aksi ❌ Tolak → Modal wajib isi alasan → update status=rejected + simpan rejection_reason

/owner/booking/slots — Manajemen Slot:
- Tampilan kalender mingguan
- Klik tanggal → lihat slot hari itu
- Tambah slot: pilih dokter, tanggal, jam mulai, max kuota
- Toggle aktif/nonaktif per slot

LAPORAN: /owner/laporan (tema PROFESIONAL)

API SEMUA requireAuth(['owner']):
GET /api/reports/summary?from=&to= → { pemasukan, pengeluaran, laba, total_transaksi }
  pemasukan = sum transactions.total where status=paid
  pengeluaran = sum expenses.amount
  laba = pemasukan - pengeluaran

GET /api/reports/revenue?from=&to=&group_by=day|week|month
  → array { date, pemasukan, pengeluaran } untuk line chart

GET /api/reports/breakdown?from=&to=
  → pemasukan per kategori (produk vs layanan) untuk bar chart

GET /api/reports/top-products?from=&to=&limit=10
  → top produk/layanan terlaris berdasarkan qty terjual

GET /api/reports/payment-methods?from=&to=
  → { cash: N, qris: N, transfer: N } untuk pie chart

GET /api/reports/transactions?from=&to=&page=&limit=20
  → paginated list transaksi detail untuk tabel + export CSV

GET /api/reports/stock-alert
  → produk dengan stock <= min_stock, order by (stock/min_stock) ASC

GET /api/reports/doctors?from=&to=
  → jumlah pasien per dokter dalam periode

UI LAPORAN:
- Filter periode: [Hari Ini] [Minggu Ini] [Bulan Ini] [Tahun Ini] [Custom]
- Semua chart re-fetch saat periode berubah

Row 1: 4 StatsCard (Pemasukan, Pengeluaran, Laba, Total Transaksi)
Row 2: Line chart (Pemasukan vs Pengeluaran) | Pie chart (Metode Pembayaran) — Recharts
Row 3: Bar chart (Top 10 Produk) | Bar chart (Per Kategori) — Recharts
Row 4: Tabel transaksi + tombol Export CSV (generate di client dari data)
Row 5: Tabel Stok Menipis | Tabel Performa Dokter

PENGELUARAN: /staff/pengeluaran
API CRUD /api/expenses → requireAuth(['owner','staff'])
- Tabel: Tanggal, Kategori, Deskripsi, Nominal, Bukti, Aksi
- Modal tambah/edit: kategori (dropdown: Operasional|Obat|Gaji|Lainnya), deskripsi, nominal, tanggal, upload bukti
- Hapus: requireAuth(['owner']), ConfirmDialog

TARGET: Booking online bisa diakses tanpa login, slot decrement saat booking, laporan akurat dari DB dengan date filter, chart render dengan Recharts, export CSV berfungsi.
```

---

## INSTRUKSI 10 — GITHUB ACTIONS CI/CD + FINALISASI

**Prompt untuk Copilot:**

```
Buat pipeline CI/CD lengkap dengan GitHub Actions untuk auto-deploy ke Vercel + Supabase:

FILE: .github/workflows/ci.yml
Trigger: push ke branch main dan pull_request ke main

Jobs:

JOB 1: type-check
runs-on: ubuntu-latest
steps:
  - checkout
  - setup Node.js 20
  - npm ci
  - npm run type-check (tsc --noEmit)

JOB 2: lint
runs-on: ubuntu-latest
steps:
  - checkout
  - setup Node.js 20
  - npm ci
  - npm run lint

JOB 3: build
needs: [type-check, lint]
runs-on: ubuntu-latest
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
steps:
  - checkout
  - setup Node.js 20
  - npm ci
  - npm run build

FILE: .github/workflows/deploy.yml
Trigger: push ke branch main SAJA (bukan PR)
needs: semua job di ci.yml harus lulus dulu

Jobs:

JOB 1: migrate
runs-on: ubuntu-latest
env:
  DATABASE_URL_DIRECT: ${{ secrets.DATABASE_URL_DIRECT }}
steps:
  - checkout
  - setup Node.js 20
  - npm ci
  - name: Run database migrations
    run: npm run db:migrate
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL_DIRECT }}

JOB 2: deploy-vercel
needs: [migrate]
runs-on: ubuntu-latest
steps:
  - checkout
  - setup Node.js 20
  - npm install --global vercel@latest
  - name: Pull Vercel environment
    run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
  - name: Build project
    run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
  - name: Deploy to Vercel
    run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
  env:
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

GITHUB SECRETS YANG HARUS DISET (buat list di README):
DATABASE_URL          → Supabase pooler URL (port 6543)
DATABASE_URL_DIRECT   → Supabase direct URL (port 5432, untuk migrate)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
NEXT_PUBLIC_APP_URL
VERCEL_TOKEN          → dari vercel.com/account/tokens
VERCEL_ORG_ID         → dari .vercel/project.json setelah "vercel link"
VERCEL_PROJECT_ID     → dari .vercel/project.json setelah "vercel link"

FINALISASI ERROR HANDLING:

src/app/global-error.tsx:
- Catch semua unhandled error di UI
- Tampilkan pesan error friendly + tombol "Muat Ulang"

src/app/not-found.tsx:
- Pesan 404 friendly
- Tombol kembali ke dashboard sesuai role atau ke /

VALIDASI ZOD LENGKAP di src/lib/validations/:
Setiap file export createSchema dan updateSchema:
- auth.ts: loginSchema
- user.ts: createUserSchema, updateUserSchema
- pet.ts: createPetSchema, updatePetSchema
- appointment.ts: createAppointmentSchema, updateAppointmentSchema
- medical-record.ts: createMedicalRecordSchema, updateMedicalRecordSchema
- inpatient.ts: createInpatientSchema, updateInpatientSchema, createLogSchema
- pos.ts: createTransactionSchema
- inventory.ts: createProductSchema, updateProductSchema, stockMutationSchema, adjustmentSchema
- expense.ts: createExpenseSchema, updateExpenseSchema
- booking.ts: createBookingSchema, updateBookingStatusSchema, createSlotSchema
- settings.ts: updateClinicSettingsSchema

PRINT CSS di src/app/globals.css:
@media print {
  nav, aside, header, [data-no-print] { display: none !important; }
  body { background: white; }
}

src/components/ui/PrintWrapper.tsx:
- Tombol "Print" → window.print()
- data-no-print di semua elemen yang tidak perlu diprint
- Slot konten untuk struk (80mm) dan rekam medis (A4)

SETTINGS KLINIK: /owner/settings
API GET + PATCH /api/settings/clinic → requireAuth(['owner'])
- Form: nama klinik, alamat, phone, email, upload logo
- Preview logo

FINAL CHECKLIST (Copilot wajib verifikasi sebelum selesai):
□ npm run type-check → 0 error
□ npm run lint → 0 error  
□ npm run build → sukses
□ Semua API route ada requireAuth kecuali yang public
□ Semua form ada Zod validation
□ Semua DB operation ada try-catch + rollback
□ Tidak ada hardcoded secret atau API key di kode
□ Semua gambar dari Supabase Storage, tidak ada domain eksternal lain
□ Mobile responsive semua halaman kecuali POS
□ POS tampilkan pesan "Gunakan perangkat desktop" di layar < 1024px
□ Print CSS berfungsi untuk struk thermal dan rekam medis A4
□ GitHub Actions workflow valid YAML (tidak ada syntax error)
□ .env.example lengkap dengan semua variable yang dibutuhkan
□ README.md berisi: cara setup lokal, daftar GitHub Secrets, cara deploy manual

TARGET AKHIR: Push ke main → GitHub Actions otomatis type-check + lint + build + migrate DB + deploy ke Vercel. Zero downtime, rollback otomatis jika build gagal.
```

---

**Cara pakainya:**
Jalankan **satu instruksi per sesi** Copilot Chat secara berurutan. Setelah setiap instruksi selesai, jalankan `npm run type-check` dan `npm run build` dulu — kalau ada error, fix di sesi yang sama sebelum lanjut ke instruksi berikutnya.
