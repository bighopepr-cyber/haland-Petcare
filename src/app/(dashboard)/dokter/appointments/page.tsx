"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

interface Appointment { id: string; petId: string; doctorId: string; scheduledAt: string; status: string; chiefComplaint: string | null; }

export default function DokterAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (status) params.set("status", status);
      const res = await fetch(`/api/appointments?${params}`);
      const json = await res.json();
      if (res.ok) setAppointments(json.data ?? []);
    } catch {} finally { setLoading(false); }
  }, [date, status]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { toast.success("Status diupdate"); fetchAppointments(); }
    else toast.error("Gagal update status");
  };

  const columns = [
    { key: "scheduledAt", header: "Waktu", render: (item: Appointment) => new Date(item.scheduledAt).toLocaleString("id-ID") },
    { key: "status", header: "Status", render: (item: Appointment) => <Badge value={item.status} /> },
    { key: "chiefComplaint", header: "Keluhan" },
    { key: "actions", header: "Aksi", render: (item: Appointment) => (
      <div className="flex gap-1">
        {item.status === "scheduled" && <button onClick={() => updateStatus(item.id, "in_progress")} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Mulai</button>}
        {item.status === "in_progress" && <button onClick={() => updateStatus(item.id, "done")} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">Selesai</button>}
        {item.status !== "cancelled" && item.status !== "done" && <button onClick={() => updateStatus(item.id, "cancelled")} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Batal</button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Jadwal Periksa" subtitle="Appointment yang dijadwalkan untuk Anda" />
      <div className="flex gap-3 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Semua Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <DataTable columns={columns} data={appointments} loading={loading} />
    </div>
  );
}