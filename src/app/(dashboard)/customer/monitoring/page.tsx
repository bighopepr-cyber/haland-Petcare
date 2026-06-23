"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Inpatient { id: string; petId: string; cageNumber: string; admittedAt: string; status: string; diagnosis: string | null; }
interface InpatientLog { id: string; condition: string; notes: string | null; photos: string[]; isVisibleCustomer: boolean; loggedAt: string; }
interface Pet { id: string; name: string; species: string; }

export default function CustomerMonitoringPage() {
  const [inpatients, setInpatients] = useState<Inpatient[]>([]);
  const [pets, setPets] = useState<Record<string, Pet>>({});
  const [logs, setLogs] = useState<Record<string, InpatientLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, iRes] = await Promise.all([fetch("/api/pets"), fetch("/api/inpatients?status=active")]);
      const pJson = await pRes.json(); const iJson = await iRes.json();
      if (pRes.ok) {
        const petMap: Record<string, Pet> = {};
        (pJson.data ?? []).forEach((p: Pet) => { petMap[p.id] = p; });
        setPets(petMap);
      }
      if (iRes.ok) {
        const list = iJson.data ?? [];
        setInpatients(list);
        // Fetch logs for each inpatient
        const logMap: Record<string, InpatientLog[]> = {};
        await Promise.all(list.map(async (ip: Inpatient) => {
          const lRes = await fetch(`/api/inpatients/${ip.id}/logs`);
          const lJson = await lRes.json();
          if (lRes.ok) logMap[ip.id] = (lJson.data ?? []).filter((l: InpatientLog) => l.isVisibleCustomer);
        }));
        setLogs(logMap);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-6"><PageHeader title="Monitoring" subtitle="Pantau hewan yang sedang dirawat" /><p className="text-sm text-gray-500">Loading...</p></div>;

  if (inpatients.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Monitoring" subtitle="Pantau hewan yang sedang dirawat" />
        <div className="rounded-xl border bg-white p-12 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
            <span className="text-3xl">🐾</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Tidak ada hewan yang sedang dirawat</h3>
          <p className="mt-2 text-sm text-gray-500">Hewan Anda akan muncul di sini jika sedang menjalani rawat inap</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring" subtitle="Pantau hewan yang sedang dirawat" />
      <div className="space-y-6">
        {inpatients.map(ip => {
          const pet = pets[ip.petId];
          const ipLogs = logs[ip.id] ?? [];
          const latestLog = ipLogs[ipLogs.length - 1];
          return (
            <div key={ip.id} className="rounded-xl border bg-white p-6 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pet?.name ?? "Unknown"}</h3>
                  <p className="text-sm text-gray-500">{pet?.species ?? ""}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>Kandang: {ip.cageNumber}</p>
                    <p>Masuk: {new Date(ip.admittedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
                    {latestLog && <p>Kondisi: <Badge value={latestLog.condition} /></p>}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {ipLogs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Perkembangan</h4>
                  <div className="space-y-3">
                    {ipLogs.map(log => (
                      <div key={log.id} className="border-l-2 border-teal-300 pl-4">
                        <div className="flex items-center gap-2">
                          <Badge value={log.condition} />
                          <span className="text-xs text-gray-400">{new Date(log.loggedAt).toLocaleString("id-ID")}</span>
                        </div>
                        {log.notes && <p className="mt-1 text-sm text-gray-600">{log.notes}</p>}
                        {log.photos && log.photos.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {log.photos.map((url, i) => (
                              <button key={i} onClick={() => setSelectedPhoto(url)} className="h-16 w-16 overflow-hidden rounded-lg border relative">
                                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="64px" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Photo Lightbox */}
      <Modal open={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title="" size="lg">
        {selectedPhoto && (
          <div className="relative max-h-[70vh] min-h-[300px] w-full">
            <Image src={selectedPhoto} alt="Foto" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        )}
      </Modal>
    </div>
  );
}