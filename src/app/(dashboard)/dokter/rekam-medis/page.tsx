"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Eye, EyeOff, Search, Calendar, ArrowRight, Syringe, User } from "lucide-react";

interface MedicalRecord {
  id: string;
  petId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string | null;
  isVisibleCustomer: boolean;
  createdAt: string;
  petName?: string;
  petSpecies?: string;
  ownerName?: string;
  doctorName?: string;
}

export default function DokterMedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const router = useRouter();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (dateFilter) params.set("date", dateFilter);
      const res = await fetch(`/api/medical-records?${params}`);
      const json = await res.json();
      if (res.ok) setRecords(json.data ?? []);
    } catch {} finally { setLoading(false); }
  }, [search, dateFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekam Medis"
        subtitle="Semua catatan medis pasien"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari hewan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="block h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 md:w-64"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white"
            />
          </div>
        }
      />

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 animate-skeleton-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-200 animate-skeleton-pulse" />
                  <div className="h-3 w-32 rounded bg-slate-200 animate-skeleton-pulse" />
                  <div className="h-3 w-64 rounded bg-slate-200 animate-skeleton-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Syringe className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Belum ada rekam medis</h3>
          <p className="mt-1 text-sm text-slate-500">Rekam medis akan muncul setelah pemeriksaan</p>
        </div>
      )}

      {/* Card list */}
      {!loading && records.length > 0 && (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dokter/rekam-medis/${record.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg">
                  🐾
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {record.petName ?? `Hewan #${record.petId?.slice(0, 8)}`}
                        {record.petSpecies && (
                          <span className="font-normal text-slate-500 ml-1">
                            ({record.petSpecies})
                          </span>
                        )}
                      </h4>
                      {record.ownerName && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          <User className="inline h-3 w-3 mr-1" />
                          {record.ownerName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-slate-400">
                        {new Date(record.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {record.isVisibleCustomer ? (
                        <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-600">
                          <Eye className="h-3 w-3" /> Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Diagnosis</p>
                    <p className="text-sm text-slate-700 line-clamp-2">{record.diagnosis}</p>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between">
                    {record.doctorName && (
                      <p className="text-xs text-slate-400">Dokter: {record.doctorName}</p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dokter/rekam-medis/${record.id}`);
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Lihat Detail <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}