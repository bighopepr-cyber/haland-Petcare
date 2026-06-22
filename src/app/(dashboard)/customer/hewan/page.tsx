"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Syringe, Calendar } from "lucide-react";

interface Pet { id: string; name: string; species: string; breed: string | null; gender: string | null; birthDate: string | null; avatarUrl: string | null; }

export default function CustomerPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<{ id: string; vaccineName: string; vaccinatedAt: string; nextDue: string | null }[]>([]);
  const [fName, setFName] = useState(""); const [fSpecies, setFSpecies] = useState(""); const [fBreed, setFBreed] = useState(""); const [fGender, setFGender] = useState(""); const [fBirthDate, setFBirthDate] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/pets"); const json = await res.json(); if (res.ok) setPets(json.data ?? []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const res = await fetch("/api/pets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fName, species: fSpecies, breed: fBreed || undefined, gender: fGender || undefined, birthDate: fBirthDate || undefined }) });
      if (res.ok) { toast.success("Hewan ditambahkan"); setShowCreate(false); setFName(""); setFSpecies(""); setFBreed(""); setFGender(""); setFBirthDate(""); fetchPets(); }
      else { const j = await res.json(); toast.error(j.error ?? "Gagal"); }
    } catch { toast.error("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const openDetail = async (pet: Pet) => {
    setShowDetail(pet);
    try { const res = await fetch(`/api/pets/${pet.id}/vaccines`); const json = await res.json(); if (res.ok) setVaccines(json.data ?? []); }
    catch { setVaccines([]); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Hewan Saya" subtitle="Data hewan peliharaan Anda" actions={
        <button onClick={() => { setFName(""); setFSpecies(""); setFBreed(""); setFGender(""); setFBirthDate(""); setShowCreate(true); }}
          className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Tambah Hewan
        </button>
      } />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map(pet => (
          <button key={pet.id} onClick={() => openDetail(pet)} className="rounded-xl border bg-white p-6 text-left shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-600">
                {pet.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500">{pet.species}{pet.breed ? ` - ${pet.breed}` : ""}</p>
                {pet.gender && <p className="text-xs text-gray-400">{pet.gender}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tambah Hewan" size="md" variant="friendly" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-full border px-4 py-2 text-sm text-gray-700">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-full bg-teal-600 px-4 py-2 text-sm text-white disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama Hewan" value={fName} onChange={e => setFName(e.target.value)} required variant="friendly" />
          <Select label="Jenis" value={fSpecies} onChange={e => setFSpecies(e.target.value)} options={[{ value: "dog", label: "Anjing" }, { value: "cat", label: "Kucing" }, { value: "bird", label: "Burung" }, { value: "fish", label: "Ikan" }, { value: "reptile", label: "Reptil" }, { value: "other", label: "Lainnya" }]} required variant="friendly" />
          <Input label="Ras" value={fBreed} onChange={e => setFBreed(e.target.value)} variant="friendly" />
          <Select label="Jenis Kelamin" value={fGender} onChange={e => setFGender(e.target.value)} options={[{ value: "jantan", label: "Jantan" }, { value: "betina", label: "Betina" }]} variant="friendly" />
          <Input label="Tanggal Lahir" type="date" value={fBirthDate} onChange={e => setFBirthDate(e.target.value)} variant="friendly" />
        </form>
      </Modal>

      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name ?? ""} size="lg" variant="friendly">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Jenis:</span> <span className="font-medium">{showDetail?.species}</span></div>
            <div><span className="text-gray-500">Ras:</span> <span className="font-medium">{showDetail?.breed ?? "-"}</span></div>
            <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{showDetail?.gender ?? "-"}</span></div>
            <div><span className="text-gray-500">Lahir:</span> <span className="font-medium">{showDetail?.birthDate ?? "-"}</span></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Syringe className="h-4 w-4" /> Riwayat Vaksin</h4>
            {vaccines.length === 0 ? <p className="text-sm text-gray-500">Belum ada vaksin</p> : (
              <div className="space-y-2">
                {vaccines.map(v => <div key={v.id} className="rounded-lg border p-3 text-sm"><p className="font-medium">{v.vaccineName}</p><p className="text-xs text-gray-500">Tanggal: {new Date(v.vaccinatedAt).toLocaleDateString("id-ID")}{v.nextDue ? ` | Berikutnya: ${new Date(v.nextDue).toLocaleDateString("id-ID")}` : ""}</p></div>)}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}