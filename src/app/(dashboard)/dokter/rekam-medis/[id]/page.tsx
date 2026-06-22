"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";

export default function EditMedicalRecordPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/medical-records?petId=${id}`).then(r => r.json()).then(json => {
      if (json.data?.length > 0) {
        const r = json.data[0];
        setDiagnosis(r.diagnosis); setTreatment(r.treatment ?? ""); setPrescription(r.prescription ?? ""); setNotes(r.notes ?? ""); setIsVisible(r.isVisibleCustomer);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/medical-records/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ diagnosis, treatment, prescription, notes, isVisibleCustomer: isVisible }) });
    if (res.ok) { toast.success("Rekam medis diupdate"); router.push("/dokter/rekam-medis"); }
    else { toast.error("Gagal update"); }
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Edit Rekam Medis" subtitle={`ID: ${id}`} actions={
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan"}</button>
      } />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Diagnosis</label><textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={3} className="block w-full border rounded-md px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Treatment</label><textarea value={treatment} onChange={e => setTreatment(e.target.value)} rows={3} className="block w-full border rounded-md px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Prescription</label><textarea value={prescription} onChange={e => setPrescription(e.target.value)} rows={3} className="block w-full border rounded-md px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="block w-full border rounded-md px-3 py-2 text-sm" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} className="rounded" /> Tampilkan ke Pemilik Hewan</label>
      </div>
    </div>
  );
}