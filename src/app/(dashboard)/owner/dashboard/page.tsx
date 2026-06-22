import { getSession } from "@/lib/auth";
import { db } from "@/db/client";
import { appointments, transactions, products, bookings } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/ui/StatsCard";
import { Calendar, DollarSign, Package, Clock } from "lucide-react";

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
  ] = await Promise.all([
    // Total pasien hari ini
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

    // Pemasukan hari ini
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

    // Stok menipis
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.stock} <= ${products.minStock}`)
      .then((r) => Number(r[0]?.count ?? 0)),

    // Booking pending
    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "pending"))
      .then((r) => Number(r[0]?.count ?? 0)),

    // 5 appointment terbaru
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

    // 5 transaksi terbaru
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
  ]);

  return {
    todayAppointments,
    todayRevenue,
    lowStockProducts,
    pendingBookings,
    recentAppointments,
    recentTransactions,
  };
}

export default async function OwnerDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Owner</h1>
        <p className="text-sm text-gray-500">Overview bisnis hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pasien Hari Ini"
          value={data.todayAppointments}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Pemasukan Hari Ini"
          value={`Rp ${data.todayRevenue.toLocaleString("id-ID")}`}
          icon={<DollarSign className="h-5 w-5" />}
          color="emerald"
        />
        <StatsCard
          title="Stok Menipis"
          value={data.lowStockProducts}
          icon={<Package className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard
          title="Booking Pending"
          value={data.pendingBookings}
          icon={<Clock className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Janji Temu Hari Ini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Waktu</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada janji temu hari ini
                    </td>
                  </tr>
                ) : (
                  data.recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                        {apt.scheduledAt
                          ? new Date(apt.scheduledAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            apt.status === "done"
                              ? "bg-emerald-100 text-emerald-700"
                              : apt.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : apt.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Transaksi Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Invoice</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Metode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada transaksi hari ini
                    </td>
                  </tr>
                ) : (
                  data.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                        {tx.invoiceNo}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                        Rp {Number(tx.total).toLocaleString("id-ID")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
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
    </div>
  );
}