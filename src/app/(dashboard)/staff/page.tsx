"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Calendar, DollarSign, Clock, Bed, Plus, ShoppingCart, Stethoscope, ClipboardList, CheckCircle, XCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Appointment {
  id: string;
  petId: string;
  doctorId: string;
  scheduledAt: string;
  status: string;
  chiefComplaint: string | null;
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({ todayAppointments: 0, todayTransactions: 0, pendingBookings: 0, activeInpatients: 0 });
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes] = await Promise.all([
        fetch("/api/reports/summary"),
        fetch("/api/appointments?limit=20&today=true"),
      ]);
      const statsJson = await statsRes.json();
      const queueJson = await queueRes.json();
      if (statsRes.ok) setStats(statsJson.data ?? stats);
      if (queueRes.ok) setQueue(queueJson.data?.appointments ?? []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Status diubah ke ${status}`);
        fetchData();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Gagal update");
      }
    } catch { toast.error("Terjadi kesalahan"); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "border-l-amber-400 bg-amber-50";
      case "in_progress": return "border-l-blue-400 bg-blue-50";
      case "done": return "border-l-emerald-400 bg-emerald-50";
      case "cancelled": return "border-l-red-400 bg-red-50";
      default: return "border-l-slate-400 bg-slate-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled": return "Belum Datang";
      case "in_progress": return "Dalam Proses";
      case "done": return "Selesai";
      case "cancelled": return "Batal";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Staff"
        subtitle="Manajemen janji temu dan pembayaran"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Appointment Hari Ini"
          value={stats.todayAppointments}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Transaksi Hari Ini"
          value={stats.todayTransactions}
          icon={<DollarSign className="h-5 w-5" />}
          color="teal"
        />
        <StatsCard
          title="Booking Pending"
          value={stats.pendingBookings}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard
          title="Rawat Inap Aktif"
          value={stats.activeInpatients}
          icon={<Bed className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link
          href="/staff/appointments"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Appointment</p>
            <p className="text-xs text-slate-500">Buat baru</p>
          </div>
        </Link>
        <Link
          href="/staff/pos"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">POS / Kasir</p>
            <p className="text-xs text-slate-500">Transaksi baru</p>
          </div>
        </Link>
        <Link
          href="/staff/rawat-inap"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Rawat Inap</p>
            <p className="text-xs text-slate-500">Kelola pasien</p>
          </div>
        </Link>
        <Link
          href="/staff/booking"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Booking</p>
            <p className="text-xs text-slate-500">Kelola booking</p>
          </div>
        </Link>
      </div>

      {/* Antrian Hari Ini */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Antrian Hari Ini</h3>
          <Link href="/staff/appointments" className="text-xs font-medium text-teal-600 hover:text-teal-700">
            Lihat Semua
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-lg bg-slate-200 animate-skeleton-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200 animate-skeleton-pulse" />
                  <div className="h-3 w-24 rounded bg-slate-200 animate-skeleton-pulse" />
                </div>
              </div>
            ))
          ) : queue.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              Tidak ada antrian hari ini
            </div>
          ) : (
            queue.map((apt) => {
              const time = apt.scheduledAt
                ? new Date(apt.scheduledAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";
              return (
                <div
                  key={apt.id}
                  className={`border-l-4 px-5 py-4 transition-colors hover:bg-slate-50 ${getStatusColor(apt.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            Appointment #{apt.id.slice(0, 8)}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            apt.status === "scheduled" ? "bg-amber-100 text-amber-700" :
                            apt.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                            apt.status === "done" ? "bg-emerald-100 text-emerald-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              apt.status === "scheduled" ? "bg-amber-500" :
                              apt.status === "in_progress" ? "bg-blue-500" :
                              apt.status === "done" ? "bg-emerald-500" : "bg-red-500"
                            }`} />
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                        {apt.chiefComplaint && (
                          <p className="mt-0.5 text-xs text-slate-500">{apt.chiefComplaint}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {apt.status === "scheduled" && (
                        <button
                          onClick={() => updateStatus(apt.id, "in_progress")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Tandai datang"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      {apt.status === "in_progress" && (
                        <button
                          onClick={() => updateStatus(apt.id, "done")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Selesai"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {(apt.status === "scheduled" || apt.status === "in_progress") && (
                        <button
                          onClick={() => updateStatus(apt.id, "cancelled")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                          title="Batalkan"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}