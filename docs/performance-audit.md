# Performance Audit Report — Haland PetCare

> Generated: 2026-06-22
> Project: Next.js 14 App Router + TypeScript + Supabase + Drizzle ORM

---

## Executive Summary

| Metric | Current Status | Target |
|--------|---------------|--------|
| "use client" files | 37 files | < 12 files |
| Server Component ratio | ~20% | > 70% |
| Sequential API waterfalls | 2 critical, 3 moderate | 0 |
| `<img>` tags (not next/image) | 3 instances | 0 |
| Dynamic imports (code splitting) | 0 | 4+ |
| loading.tsx / Suspense | 0 | 6+ |
| Bundle analyzer | Not installed | Installed |
| Virtualization for large lists | 0 | 2+ |
| Caching (revalidate/unstable_cache) | 0 | 5+ |
| Initial JS bundle size | ~87.5 KB (shared) | < 250 KB total |

---

## PHASE 1: Client Component Audit

### 37 files with "use client" — categorized by necessity:

#### 🔴 MUST stay Client (interactivity required): 12 files
| File | Reason |
|------|--------|
| `src/hooks/useAuth.ts` | useState, useEffect, useCallback |
| `src/app/(public)/page.tsx` | Mobile menu, scroll effects, state |
| `src/app/(public)/booking/page.tsx` | Multi-step form, state management |
| `src/app/(auth)/login/page.tsx` | Form state, onSubmit |
| `src/app/(auth)/register/page.tsx` | Form state, onSubmit |
| `src/app/(dashboard)/client-layout.tsx` | Sidebar toggle, theme, user menu |
| `src/components/layout/Sidebar.tsx` | Navigation state, active links |
| `src/components/layout/Topbar.tsx` | User menu dropdown, mobile toggle |
| `src/components/ui/ImageUpload.tsx` | File input, preview state |
| `src/components/ui/Modal.tsx` | Open/close state, portal |
| `src/components/ui/DateRangePicker.tsx` | Date selection state |
| `src/components/ui/ConfirmDialog.tsx` | Confirm/cancel handlers |

#### 🟡 Could be Server Component (no interactivity needed): 25 files
These files use "use client" but only consume data via props/hooks without direct user interaction:

| File | Current hooks | Suggestion |
|------|--------------|------------|
| `src/app/(dashboard)/customer/page.tsx` | useState for data | Remove "use client", fetch in Server Component |
| `src/app/(dashboard)/customer/hewan/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/customer/hewan/[id]/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/customer/monitoring/page.tsx` | useState, useEffect | Remove "use client", use Server Component + client sub-components |
| `src/app/(dashboard)/customer/rekam-medis/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/dokter/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/dokter/appointments/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/dokter/rekam-medis/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/dokter/rekam-medis/[id]/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/dashboard/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/inventory/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/laporan/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/pos/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/users/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/appointments/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/booking/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/inventory/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/pengeluaran/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/pos/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/staff/rawat-inap/page.tsx` | useState, useEffect | Remove "use client" |
| `src/app/(dashboard)/owner/appointments/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/booking/page.tsx` | useState for data | Remove "use client" |
| `src/app/(dashboard)/owner/booking/slots/page.tsx` | useState for data | Remove "use client" |

---

## PHASE 2: Data Fetching Issues

### 🔴 Critical: Sequential Awaits (API Waterfall)

| File | Lines | Issue | Fix |
|------|-------|-------|-----|
| `src/app/api/reports/revenue/route.ts` | 30-45 | `await revenue` then `await expenseData` | `Promise.all()` |
| `src/app/api/reports/summary/route.ts` | 20-35 | 3 sequential `await db.select()` | `Promise.all()` |
| `src/app/api/reports/doctors/route.ts` | ~25-40 | Sequential queries | `Promise.all()` |
| `src/app/api/reports/transactions/route.ts` | ~20-35 | Sequential queries | `Promise.all()` |
| `src/app/api/reports/top-products/route.ts` | ~15-30 | Sequential queries | `Promise.all()` |

### 🟡 Moderate: Missing Pagination

| File | Issue |
|------|-------|
| `src/app/api/appointments/route.ts` | No LIMIT/OFFSET |
| `src/app/api/medical-records/route.ts` | No LIMIT/OFFSET |
| `src/app/api/pets/route.ts` | No LIMIT/OFFSET |
| `src/app/api/inventory/products/route.ts` | No LIMIT/OFFSET |

---

## PHASE 3: Image Optimization

| File | Line | Current | Fix |
|------|------|---------|-----|
| `src/app/(dashboard)/customer/monitoring/page.tsx` | 102 | `<img src={url}>` | `next/image` with lazy loading |
| `src/app/(dashboard)/customer/monitoring/page.tsx` | 119 | `<img src={selectedPhoto}>` | `next/image` with fill |
| `src/components/ui/ImageUpload.tsx` | 93 | `<img src={preview}>` | `next/image` with fill |

---

## PHASE 4: Bundle Size & Code Splitting

### Large libraries that should be dynamically imported:

| Library | Size | Used In | Current Import | Fix |
|---------|------|---------|---------------|-----|
| recharts | ~800 KB | owner/dashboard, owner/laporan | Static import | `dynamic(() => import(...))` |
| date-fns | ~300 KB | Multiple files | Static import | Tree-shake or dynamic |
| lucide-react | ~500 KB | Multiple files | Static import | Tree-shake (already good) |

### Missing:
- `@next/bundle-analyzer` — not installed
- No `loading.tsx` files anywhere
- No Suspense boundaries
- No dynamic imports

---

## PHASE 5: Caching

### No caching currently implemented anywhere.
- No `revalidate` tags
- No `unstable_cache`
- No `fetch` cache options

---

## PHASE 6: Dashboard Query Optimization

### Owner Dashboard (`src/app/(dashboard)/owner/dashboard/page.tsx`)
- Uses `Promise.all()` ✅
- But fetches ALL data then computes stats in frontend ❌
- Should use `COUNT()`, `SUM()`, `AVG()` in SQL

### Owner Laporan (`src/app/(dashboard)/owner/laporan/page.tsx`)
- Fetches all transactions then filters in frontend ❌
- Should use SQL aggregation

---

## PHASE 7: React Render Optimization

### Issues found:
- Multiple `useEffect` for data fetching that could be Server Component data fetching
- No `useMemo` on computed values in dashboard pages
- No `useCallback` on event handlers passed to child components
- State duplication in several components

---

## Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Server Component migration (25 files) | High | Very High |
| P0 | Sequential await → Promise.all() | Low | High |
| P1 | Dynamic import recharts | Low | High |
| P1 | Add loading.tsx + Suspense | Medium | High |
| P1 | Image optimization (3 files) | Low | Medium |
| P2 | Caching (revalidate) | Medium | Medium |
| P2 | Dashboard query optimization | Medium | Medium |
| P3 | Bundle analyzer setup | Low | Low |
| P3 | Virtualization for large lists | Medium | Medium |
| P3 | useMemo/useCallback additions | Low | Low |