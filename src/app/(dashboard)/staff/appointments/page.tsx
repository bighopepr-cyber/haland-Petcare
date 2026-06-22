"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus } from "lucide-react";

interface Appointment { id: string; petId: string; doctorId: string; serviceId: string | null; scheduledAt: string; status: string; chiefComplaint: string | null; }

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [fPetId, setFPetId] = useState(""); const [fDoctorId, setFDoctorId] = useState(""); const [fServiceId, setFServiceId] = useState("");
  const [fDate, setFDate] = useState(""); const [fTime, setFTime] = useState(""); const [fComplaint, setFComplaint] = useState("");
  const [formLoading, setFormLoading] = useState(false); const [formError, setFormError] = useState<string | null>(null);

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

  const fetchOptions = useCallback(async () => {
    try {
      const [pRes, dRes, sRes] = await Promise.all([
        fetch("/api/pets"), fetch("/api/users?role=dokter&limit=50"), fetch("/api/inventory/services?limit=50"),
      ]);
      const pJson = await pRes.json(); const dJson = await dRes.json(); const sJson = await sRes.json();
      if (pRes.ok) setPets((pJson.data ?? []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
      if (dRes.ok) setDoctors((dJson.data?.users ?? []).map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
      if (sRes.ok) setServices((sJson.data?.services ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
    } catch {}
  }, []);

  useEffect(() => { fetchAppointments(); fetchOptions(); }, [fetchAppointments, fetchOptions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(null); setFormLoading(true);
    try {
      const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ petId: fPetId, doctorId: fDoctorId, serviceId: fServiceId || undefined, scheduledAt: `${fDate}T${fTime}`, chiefComplaint: fComplaint }) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Appointment berhasil dibuat"); setShowCreate(false); setFPetId(""); setFDoctorId(""); setFServiceId(""); setFDate(""); setFTime(""); setFComplaint(""); fetchAppointments();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const columns = [
    { key: "scheduledAt", header: "Waktu", render: (item: Appointment) => new Date(item.scheduledAt).toLocaleString("id-ID") },
    { key: "status", header: "Status", render: (item: Appointment) => <Badge value={item.status} /> },
    { key: "chiefComplaint", header: "Keluhan" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Janji Temu" subtitle="Kelola jadwal appointment" actions={
        <button onClick={() => { setFPetId(""); setFDoctorId(""); setFServiceId(""); setFDate(""); setFTime(""); setFComplaint(""); setShowCreate(true); }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Buat Appointment
        </button>
      } />
      <div className="flex gap-3 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Semua Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <DataTable columns={columns} data={appointments} loading={loading} />
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Buat Appointment" size="md" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Hewan" value={fPetId} onChange={e => setFPetId(e.target.value)} options={pets.map(p => ({ value: p.id, label: p.name }))} required placeholder="Pilih hewan" />
          <Select label="Dokter" value={fDoctorId} onChange={e => setFDoctorId(e.target.value)} options={doctors.map(d => ({ value: d.id, label: d.name }))} required placeholder="Pilih dokter" />
          <Select label="Layanan" value={fServiceId} onChange={e => setFServiceId(e.target.value)} options={services.map(s => ({ value: s.id, label: s.name }))} placeholder="Pilih layanan" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" value={fDate} onChange={e => setFDate(e.target.value)} required />
            <Input label="Jam" type="time" value={fTime} onChange={e => setFTime(e.target.value)} required />
          </div>
          <Input label="Keluhan" value={fComplaint} onChange={e => setFComplaint(e.target.value)} />
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}