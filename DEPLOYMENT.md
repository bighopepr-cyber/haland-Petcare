# Panduan Deployment — Haland Petcare

Proyek ini adalah aplikasi **Next.js 14** dengan **Supabase** (PostgreSQL + Storage) dan **Drizzle ORM**. Berikut panduan deployment ke production.

---

## Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Environment Variables](#environment-variables)
3. [Database Migration](#database-migration)
4. [Deploy ke Vercel](#deploy-ke-vercel)
5. [Deploy ke VPS / Docker](#deploy-ke-vps--docker)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prasyarat

- **Node.js** ≥ 18.x
- **Akun Supabase** (sudah ada project)
- **Akun Vercel** (untuk hosting) atau **VPS** dengan Docker
- **Git** repository terhubung ke GitHub

---

## Environment Variables

Salin `.env.example` ke `.env.local` (development) atau `.env.production` (production). Berikut semua variabel yang dibutuhkan:

| Variable | Deskripsi | Wajib |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_JWT_SECRET` | JWT secret untuk auth token | ✅ |
| `SUPABASE_SECRET_KEY` | Supabase secret key | ✅ |
| `POSTGRES_URL` | Connection string pooling (port 6543) | ✅ |
| `POSTGRES_URL_NON_POOLING` | Connection string non-pooling (port 5432) | ✅ |
| `POSTGRES_PRISMA_URL` | Connection string untuk Prisma/Drizzle | ✅ |
| `POSTGRES_HOST` | Host database | ✅ |
| `POSTGRES_DATABASE` | Nama database | ✅ |
| `POSTGRES_USER` | Username database | ✅ |
| `POSTGRES_PASSWORD` | Password database | ✅ |

> **⚠️ PENTING:** Jangan commit `.env.local` atau `.env.production` ke Git. File `.env.local` sudah ada di `.gitignore`.

---

## Database Migration

### 1. Generate Migration (jika ada perubahan schema)

```bash
npm run db:generate
```

Perintah ini membaca `src/db/schema.ts` dan menghasilkan file SQL migration di `drizzle/migrations/`.

### 2. Jalankan Migration ke Database

```bash
npm run db:migrate
```

Perintah ini mengeksekusi file migration ke database Supabase menggunakan `POSTGRES_URL` dari environment.

### 3. Seed Data Awal (opsional)

```bash
npm run db:seed
```

Seed data mencakup: user admin, kategori default, produk, layanan, dan slot booking.

---

## Deploy ke Vercel

### Langkah 1: Push ke GitHub

```bash
git add .
git commit -m "ready for production"
git push origin main
```

### Langkah 2: Import Project di Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Pilih repository `haland-Petcare`
3. Framework akan otomatis terdeteksi sebagai **Next.js**

### Langkah 3: Set Environment Variables

Di dashboard Vercel, buka **Settings → Environment Variables** dan tambahkan semua variabel dari [tabel di atas](#environment-variables).

### Langkah 4: Deploy

Klik **Deploy**. Vercel akan:
1. `npm install`
2. `npm run build` (termasuk `next build`)
3. Deploy ke production

### Langkah 5: Jalankan Migration di Production

Setelah deploy pertama, jalankan migration ke database production:

```bash
# Set environment variables production dulu, lalu:
npm run db:migrate
```

> **Catatan:** Migration hanya perlu dijalankan sekali saat pertama deploy atau saat ada perubahan schema.

---

## Deploy ke VPS / Docker

### Struktur Dockerfile

Buat `Dockerfile` di root project:

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t haland-petcare .

# Run container
docker run -d \
  --name haland-petcare \
  -p 3000:3000 \
  --env-file .env.production \
  haland-petcare
```

### Docker Compose (opsional)

```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

```bash
docker compose up -d
```

---

## Post-Deployment Checklist

- [ ] Semua environment variable sudah di-set di platform hosting
- [ ] `npm run db:migrate` sudah dijalankan ke database production
- [ ] `npm run db:seed` sudah dijalankan (jika butuh data awal)
- [ ] Domain kustom sudah dikonfigurasi (jika ada)
- [ ] SSL/HTTPS aktif
- [ ] Supabase Storage bucket sudah dibuat (untuk upload file)
- [ ] Supabase Row Level Security (RLS) sudah dikonfigurasi
- [ ] Test login, register, dan fitur utama
- [ ] Monitoring / logging sudah aktif (Vercel Analytics, Sentry, dsb)

---

## Troubleshooting

### Build gagal: TypeScript errors

```bash
npm run type-check
```

Pastikan 0 errors sebelum deploy. Jika ada error, perbaiki dulu.

### Koneksi database gagal

1. Cek `POSTGRES_URL` di environment variables
2. Pastikan IP server diizinkan di Supabase → **Project Settings → Database → Network Restrictions**
3. Untuk Vercel, gunakan connection string pooling (port 6543)

### Supabase Storage upload gagal

1. Pastikan bucket sudah dibuat di Supabase dashboard
2. Cek `SUPABASE_SERVICE_ROLE_KEY` sudah benar
3. Cek RLS policy untuk bucket tersebut

### Migration gagal

```bash
# Cek status koneksi
npx tsx -e "import { db } from './src/db/client'; console.log(await db.execute('SELECT 1'))"

# Drop dan re-create (development only!)
# Hapus semua tabel lalu jalankan ulang migration
```

---

## Perintah Berguna

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Build production |
| `npm start` | Jalankan production build |
| `npm run type-check` | Cek TypeScript errors |
| `npm run lint` | Cek ESLint |
| `npm run db:generate` | Generate migration SQL |
| `npm run db:migrate` | Jalankan migration |
| `npm run db:seed` | Seed data awal |
| `npm run db:studio` | Buka Drizzle Studio (GUI database) |