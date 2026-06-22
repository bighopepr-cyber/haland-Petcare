"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Eye, EyeOff } from "lucide-react";

interface MedicalRecord { id: string; petId: string; doctorId: string; diagnosis: string; treatment: string | null; isVisibleCustomer: boolean; createdAt: string; }

export default function DokterMedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/medical-records"); const json = await res.json(); if (res.ok) setRecords(json.data ?? []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const columns = [
    { key: "createdAt", header: "Tanggal", render: (item: MedicalRecord) => new Date(item.createdAt).toLocaleDateString("id-ID") },
    { key: "diagnosis", header: "Diagnosis" },
    { key: "isVisibleCustomer", header: "Visible", render: (item: MedicalRecord) => item.isVisibleCustomer ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-gray-400" /> },
    { key: "actions", header: "Aksi", render: (item: MedicalRecord) => (
      <button onClick={() => router.push(`/dokter/rekam-medis/${item.id}`)} className="text-sm text-emerald-600 hover:underline">Lihat/Edit</button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Rekam Medis" subtitle="Semua catatan medis pasien" />
      <DataTable columns={columns} data={records} loading={loading} searchable />
    </div>
  );
}