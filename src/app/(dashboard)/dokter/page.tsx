import { getSession } from "@/lib/auth";
import { db } from "@/db/client";
import { appointments, inpatients, inpatientLogs, users, pets } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Calendar, Users, Bed, Clock, CheckCircle, ArrowRight, Stethoscope } from "lucide-react";
import Link from "next/link";

async function getDokterDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const [todayCount, monthCount, activeInpatients, todayAppointments, inpatientList] = await Promise.all([
    // Pasien hari ini
    db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, session.id),
          gte(appointments.scheduledAt, new Date(todayStr)),
          lte(appointments.scheduledAt, new Date(tomorrowStr))
        )
      )
      .then((r) => Number(r[0]?.count ?? 0)),

    // Total bulan ini
    db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, session.id),
          gte(appointments.scheduledAt, monthStart),
          lte(appointments.scheduledAt, monthEnd)
        )
      )
      .then((r) => Number(r[0]?.count ?? 0)),

    // Rawat inap aktif
    db
      .select({ count: sql<number>`count(*)` })
      .from(inpatients)
      .where(
        and(
          eq(inpatients.doctorId, session.id),
          eq(inpatients.status, "active")
        )
      )
      .then((r) => Number(r[0]?.count ?? 0)),

    // Jadwal hari ini
    db
      .select({
        id: appointments.id,
        petId: appointments.petId,
        scheduledAt: appointments.scheduledAt,
        status: appointments.status,
        chiefComplaint: appointments.chiefComplaint,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, session.id),
          gte(appointments.scheduledAt, new Date(todayStr)),
          lte(appointments.scheduledAt, new Date(tomorrowStr))
        )
      )
      .orderBy(appointments.scheduledAt)
      .limit(10),

    // Rawat inap aktif dengan detail
    db
      .select({
        id: inpatients.id,
        petId: inpatients.petId,
        cageNumber: inpatients.cageNumber,
        status: inpatients.status,
        admittedAt: inpatients.admittedAt,
      })
      .from(inpatients)
      .where(
        and(
          eq(inpatients.doctorId, session.id),
          eq(inpatients.status, "active")
        )
      )
      .limit(6),
  ]);

  return { todayCount, monthCount, activeInpatients, todayAppointments, inpatientList };
}

function StatusIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  if (status === "in_progress") return <Clock className="h-5 w-5 text-blue-500" />;
  return <Clock className="h-5 w-5 text-amber-500" />;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    done: { label: "Selesai", color: "bg-emerald-100 text-emerald-700" },
    in_progress: { label: "Proses", color: "bg-blue-100 text-blue-700" },
    scheduled: { label: "Jadwal", color: "bg-amber-100 text-amber-700" },
    cancelled: { label: "Batal", color: "bg-red-100 text-red-700" },
  };
  const c = config[status] ?? { label: status, color: "bg-slate-100 text-slate-700" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "done" ? "bg-emerald-500" : status === "in_progress" ? "bg-blue-500" : "bg-amber-500"}`} />
      {c.label}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const config: Record<string, { label: string; color: string }> = {
    stable: { label: "Stabil", color: "bg-emerald-100 text-emerald-700" },
    improving: { label: "Membaik", color: "bg-blue-100 text-blue-700" },
    critical: { label: "Kritis", color: "bg-red-100 text-red-700" },
    observed: { label: "Observasi", color: "bg-amber-100 text-amber-700" },
  };
  const c = config[condition] ?? { label: condition, color: "bg-slate-100 text-slate-700" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${condition === "stable" ? "bg-emerald-500" : condition === "improving" ? "bg-blue-500" : condition === "critical" ? "bg-red-500" : "bg-amber-500"}`} />
      {c.label}
    </span>
  );
}

export default async function DokterDashboardPage() {
  const data = await getDokterDashboard();
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = new Date();
  const dayName = dayNames[today.getDay()];
  const dateStr = today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Dokter</h1>
        <p className="text-sm text-slate-500 mt-1">Jadwal periksa dan rekam medis pasien</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pasien Hari Ini</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">{data.todayCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 md:h-12 md:w-12">
              <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Pasien Bulan Ini</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">{data.monthCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 md:h-12 md:w-12">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Rawat Inap Aktif</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 md:text-3xl">{data.activeInpatients}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 md:h-12 md:w-12">
              <Bed className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Jadwal Hari Ini - Timeline style (60%) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Jadwal Hari Ini — {dayName}, {dateStr}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.todayAppointments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Tidak ada jadwal hari ini</p>
              </div>
            ) : (
              data.todayAppointments.map((apt, idx) => {
                const time = apt.scheduledAt
                  ? new Date(apt.scheduledAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";
                const isDone = apt.status === "done";
                return (
                  <div key={apt.id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${isDone ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isDone ? "bg-emerald-100" : apt.status === "in_progress" ? "bg-blue-100" : "bg-amber-100"
                        }`}>
                          <StatusIcon status={apt.status} />
                        </div>
                        {idx < data.todayAppointments.length - 1 && (
                          <div className="mt-1 h-full w-0.5 bg-slate-200" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{time}</span>
                            <StatusBadge status={apt.status} />
                          </div>
                        </div>
                        {apt.chiefComplaint && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                            Keluhan: {apt.chiefComplaint}
                          </p>
                        )}
                        {!isDone && (
                          <div className="mt-2">
                            <Link
                              href={`/dokter/appointments`}
                              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
                            >
                              <Stethoscope className="h-3 w-3" />
                              Mulai Periksa
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {data.todayAppointments.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <Link href="/dokter/appointments" className="flex items-center justify-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                  Lihat Semua Jadwal <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Rawat Inap Aktif (40%) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Pasien Rawat Inap</h3>
              <Link href="/dokter/rawat-inap" className="text-xs font-medium text-teal-600 hover:text-teal-700">
                Lihat Semua
              </Link>
            </div>
            <div className="p-5">
              {data.inpatientList.length === 0 ? (
                <div className="py-8 text-center">
                  <Bed className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Tidak ada pasien rawat inap</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {data.inpatientList.map((ip) => {
                    const daysAdmitted = Math.floor(
                      (Date.now() - new Date(ip.admittedAt).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={ip.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-lg">
                            🐾
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              Pasien #{ip.petId?.slice(0, 8) ?? "-"}
                            </p>
                            <p className="text-xs text-slate-500">Kandang {ip.cageNumber ?? "-"}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <ConditionBadge condition={ip.status === "active" ? "stable" : ip.status} />
                          <p className="text-xs text-slate-500">
                            Masuk {daysAdmitted > 0 ? `${daysAdmitted} hari` : "Hari ini"}
                          </p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/dokter/rawat-inap`}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Lihat Log
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}