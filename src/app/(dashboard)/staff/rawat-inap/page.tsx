"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Activity } from "lucide-react";

interface Inpatient { id: string; petId: string; doctorId: string; cageNumber: string; admittedAt: string; status: string; diagnosis: string | null; }
interface InpatientLog { id: string; condition: string; notes: string | null; photos: string[]; loggedAt: string; }
interface Pet { id: string; name: string; species: string; }

export default function StaffInpatientPage() {
  const [inpatients, setInpatients] = useState<Inpatient[]>([]);
  const [pets, setPets] = useState<Record<string, Pet>>({});
  const [logs, setLogs] = useState<Record<string, InpatientLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showLogModal, setShowLogModal] = useState<string | null>(null);
  const [fPetId, setFPetId] = useState(""); const [fDoctorId, setFDoctorId] = useState(""); const [fCage, setFCage] = useState(""); const [fDiagnosis, setFDiagnosis] = useState("");
  const [fCondition, setFCondition] = useState("stable"); const [fNotes, setFNotes] = useState(""); const [fVisible, setFVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [petsList, setPetsList] = useState<Pet[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, pRes, dRes] = await Promise.all([
        fetch("/api/inpatients"), fetch("/api/pets"), fetch("/api/users?role=dokter&limit=50"),
      ]);
      const iJson = await iRes.json(); const pJson = await pRes.json(); const dJson = await dRes.json();
      if (iRes.ok) {
        const list = iJson.data ?? [];
        setInpatients(list);
        const logMap: Record<string, InpatientLog[]> = {};
        await Promise.all(list.map(async (ip: Inpatient) => {
          const lRes = await fetch(`/api/inpatients/${ip.id}/logs`);
          const lJson = await lRes.json();
          if (lRes.ok) logMap[ip.id] = lJson.data ?? [];
        }));
        setLogs(logMap);
      }
      if (pRes.ok) {
        const petMap: Record<string, Pet> = {};
        (pJson.data ?? []).forEach((p: Pet) => { petMap[p.id] = p; });
        setPets(petMap);
        setPetsList(pJson.data ?? []);
      }
      if (dRes.ok) setDoctors((dJson.data?.users ?? []).map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const res = await fetch("/api/inpatients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ petId: fPetId, doctorId: fDoctorId, cageNumber: fCage, diagnosis: fDiagnosis }) });
      if (res.ok) { toast.success("Rawat inap dimulai"); setShowCreate(false); setFPetId(""); setFDoctorId(""); setFCage(""); setFDiagnosis(""); fetchData(); }
      else { const j = await res.json(); toast.error(j.error ?? "Gagal"); }
    } catch { toast.error("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const handleAddLog = async (inpatientId: string) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/inpatients/${inpatientId}/logs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ condition: fCondition, notes: fNotes, isVisibleCustomer: fVisible }) });
      if (res.ok) { toast.success("Log ditambahkan"); setShowLogModal(null); setFCondition("stable"); setFNotes(""); setFVisible(false); fetchData(); }
      else { const j = await res.json(); toast.error(j.error ?? "Gagal"); }
    } catch { toast.error("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const handleDischarge = async (id: string) => {
    const res = await fetch(`/api/inpatients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "discharged" }) });
    if (res.ok) { toast.success("Pasien dipulangkan"); fetchData(); }
    else toast.error("Gagal");
  };

  const conditionColor = (c: string) => c === "stable" ? "emerald" : c === "improving" ? "blue" : "red";

  return (
    <div className="space-y-6">
      <PageHeader title="Rawat Inap" subtitle="Kelola pasien rawat inap" actions={
        <button onClick={() => { setFPetId(""); setFDoctorId(""); setFCage(""); setFDiagnosis(""); setShowCreate(true); }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Rawat Inap Baru
        </button>
      } />
      {loading ? <p className="text-sm text-gray-500">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inpatients.filter(ip => ip.status === "active").map(ip => {
            const pet = pets[ip.petId];
            const ipLogs = logs[ip.id] ?? [];
            const latestLog = ipLogs[ipLogs.length - 1];
            return (
              <div key={ip.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{pet?.name ?? "Unknown"}</h3>
                    <p className="text-xs text-gray-500">{pet?.species ?? ""}</p>
                  </div>
                  {latestLog && <Badge value={latestLog.condition} />}
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>Kandang: {ip.cageNumber}</p>
                  <p>Masuk: {new Date(ip.admittedAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setShowLogModal(ip.id); setFCondition("stable"); setFNotes(""); setFVisible(false); }} className="flex-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"><Activity className="inline h-3 w-3 mr-1" />Tambah Log</button>
                  <button onClick={() => handleDischarge(ip.id)} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200">Pulangkan</button>
                </div>
                {ipLogs.length > 0 && (
                  <div className="mt-3 space-y-1 border-t pt-2">
                    {ipLogs.slice(-3).reverse().map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-xs">
                        <Badge value={log.condition} />
                        <span className="text-gray-400 truncate">{log.notes ?? ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Rawat Inap Baru" size="md" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Hewan" value={fPetId} onChange={e => setFPetId(e.target.value)} options={petsList.map(p => ({ value: p.id, label: p.name }))} required placeholder="Pilih hewan" />
          <Select label="Dokter" value={fDoctorId} onChange={e => setFDoctorId(e.target.value)} options={doctors.map(d => ({ value: d.id, label: d.name }))} required placeholder="Pilih dokter" />
          <Input label="No Kandang" value={fCage} onChange={e => setFCage(e.target.value)} required />
          <Input label="Diagnosis" value={fDiagnosis} onChange={e => setFDiagnosis(e.target.value)} />
        </form>
      </Modal>

      <Modal open={!!showLogModal} onClose={() => setShowLogModal(null)} title="Tambah Log Perkembangan" size="sm" footer={
        <><button onClick={() => setShowLogModal(null)} className="rounded-lg border px-4 py-2 text-sm text-gray-700">Batal</button>
        <button onClick={() => showLogModal && handleAddLog(showLogModal)} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <div className="space-y-4">
          <Select label="Kondisi" value={fCondition} onChange={e => setFCondition(e.target.value)} options={[{ value: "stable", label: "Stabil" }, { value: "improving", label: "Membaik" }, { value: "critical", label: "Kritis" }]} required />
          <div><label className="block text-sm font-medium mb-1">Catatan</label><textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={3} className="block w-full border rounded-md px-3 py-2 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fVisible} onChange={e => setFVisible(e.target.checked)} className="rounded" /> Tampilkan ke Pemilik</label>
        </div>
      </Modal>
    </div>
  );
}