import { getSession } from "@/lib/auth";
import { db } from "@/db/client";
import { appointments, transactions, products, bookings } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Calendar, DollarSign, Package, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
export const revalidate = 60;

async function getDashboardData() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();

  const [
    todayAppointments,
    todayRevenue,
    lowStockProducts,
    pendingBookings,
    recentAppointments,
    recentTransactions,
    lowStockList,
    recentBookings,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledAt, new Date(todayStr)),
          lte(appointments.scheduledAt, new Date(tomorrowStr))
        )
      )
      .then((r) => Number(r[0]?.count ?? 0)),

    db
      .select({ total: sql<string>`coalesce(sum(total), '0')` })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "paid"),
          gte(transactions.createdAt, new Date(todayStr)),
          lte(transactions.createdAt, new Date(tomorrowStr))
        )
      )
      .then((r) => Number(r[0]?.total ?? 0)),

    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.stock} <= ${products.minStock}`)
      .then((r) => Number(r[0]?.count ?? 0)),

    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "pending"))
      .then((r) => Number(r[0]?.count ?? 0)),

    db
      .select({
        id: appointments.id,
        petId: appointments.petId,
        doctorId: appointments.doctorId,
        scheduledAt: appointments.scheduledAt,
        status: appointments.status,
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledAt, new Date(todayStr)),
          lte(appointments.scheduledAt, new Date(tomorrowStr))
        )
      )
      .orderBy(appointments.scheduledAt)
      .limit(5),

    db
      .select({
        id: transactions.id,
        invoiceNo: transactions.invoiceNo,
        total: transactions.total,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(eq(transactions.status, "paid"))
      .orderBy(sql`${transactions.createdAt} desc`)
      .limit(5),

    db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        minStock: products.minStock,
        unit: products.unit,
      })
      .from(products)
      .where(sql`${products.stock} <= ${products.minStock}`)
      .orderBy(sql`${products.stock} asc`)
      .limit(5),

    db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        petName: bookings.petName,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(eq(bookings.status, "pending"))
      .orderBy(sql`${bookings.createdAt} desc`)
      .limit(5),
  ]);

  return {
    todayAppointments,
    todayRevenue,
    lowStockProducts,
    pendingBookings,
    recentAppointments,
    recentTransactions,
    lowStockList,
    recentBookings,
  };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    scheduled: "bg-amber-100 text-amber-700",
  };
  const labels: Record<string, string> = {
    done: "Selesai",
    in_progress: "Proses",
    cancelled: "Batal",
    scheduled: "Jadwal",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-slate-100 text-slate-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "done" ? "bg-emerald-500" : status === "in_progress" ? "bg-blue-500" : status === "cancelled" ? "bg-red-500" : "bg-amber-500"}`} />
      {labels[status] ?? status}
    </span>
  );
}

export default async function OwnerDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Owner</h1>
        <p className="text-sm text-slate-500 mt-1">Overview bisnis hari ini</p>
      </div>

      {/* Stats Cards - 2x2 mobile, 4 columns desktop */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pasien Hari Ini</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">{data.todayAppointments}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 md:h-12 md:w-12">
              <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pemasukan Hari Ini</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">Rp {data.todayRevenue.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 md:h-12 md:w-12">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Stok Menipis</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">{data.lowStockProducts}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 md:h-12 md:w-12">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Booking Pending</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">{data.pendingBookings}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 md:h-12 md:w-12">
              <Clock className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Row - 2 columns desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Appointments Today (60%) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Appointment Hari Ini</h3>
            <Link href="/owner/appointments" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Jam</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-sm text-slate-500">
                      Belum ada janji temu hari ini
                    </td>
                  </tr>
                ) : (
                  data.recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-700">
                        {apt.scheduledAt
                          ? new Date(apt.scheduledAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Transactions (40%) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Transaksi Terbaru</h3>
            <Link href="/owner/laporan" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Metode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">
                      Belum ada transaksi hari ini
                    </td>
                  </tr>
                ) : (
                  data.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-700">
                        {tx.invoiceNo}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900">
                        Rp {Number(tx.total).toLocaleString("id-ID")}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-500">
                        {tx.paymentMethod}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row - 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Alert */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Stok Menipis</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.lowStockList.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                Semua stok aman
              </div>
            ) : (
              data.lowStockList.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{item.stock}</p>
                    <p className="text-xs text-slate-500">Min: {item.minStock}</p>
                  </div>
                </div>
              ))
            )}
            <div className="border-t border-slate-100 px-5 py-3">
              <Link href="/owner/inventory" className="flex items-center justify-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                Kelola Inventori <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* New Bookings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Clock className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Booking Baru</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                Tidak ada booking baru
              </div>
            ) : (
              data.recentBookings.map((bk) => (
                <div key={bk.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{bk.customerName}</p>
                      <p className="text-xs text-slate-500">{bk.petName}</p>
                    </div>
                  </div>
                  <Link
                    href={`/owner/booking`}
                    className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
                  >
                    Proses
                  </Link>
                </div>
              ))
            )}
            <div className="border-t border-slate-100 px-5 py-3">
              <Link href="/owner/booking" className="flex items-center justify-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                Kelola Booking <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}