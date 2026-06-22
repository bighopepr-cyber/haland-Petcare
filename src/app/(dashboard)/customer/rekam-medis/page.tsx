"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Syringe } from "lucide-react";

interface MedicalRecord { id: string; petId: string; diagnosis: string; treatment: string | null; createdAt: string; }
interface Pet { id: string; name: string; }

export default function CustomerMedicalRecordsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    try { const res = await fetch("/api/pets"); const json = await res.json(); if (res.ok) setPets(json.data ?? []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const fetchRecords = useCallback(async (petId: string) => {
    setLoading(true);
    try { const res = await fetch(`/api/medical-records?petId=${petId}`); const json = await res.json(); if (res.ok) setRecords(json.data ?? []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (pets.length > 0 && !activePet) { setActivePet(pets[0]!.id); fetchRecords(pets[0]!.id); }
  }, [pets, activePet, fetchRecords]);

  const selectPet = (petId: string) => { setActivePet(petId); fetchRecords(petId); };

  return (
    <div className="space-y-6">
      <PageHeader title="Rekam Medis" subtitle="Riwayat kesehatan hewan Anda" />
      <div className="flex gap-2 flex-wrap">
        {pets.map(pet => (
          <button key={pet.id} onClick={() => selectPet(pet.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activePet === pet.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <Syringe className="inline h-4 w-4 mr-1" />{pet.name}
          </button>
        ))}
      </div>
      {loading ? <p className="text-sm text-gray-500">Loading...</p> : records.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-md">
          <p className="text-gray-500">Belum ada rekam medis untuk hewan ini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(r => (
            <div key={r.id} className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-xs text-gray-400 mb-2">{new Date(r.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
              <h4 className="font-semibold text-gray-900">Diagnosis</h4>
              <p className="text-sm text-gray-700 mt-1">{r.diagnosis}</p>
              {r.treatment && <><h4 className="font-semibold text-gray-900 mt-3">Treatment</h4><p className="text-sm text-gray-700 mt-1">{r.treatment}</p></>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}