"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Booking { id: string; slotId: string; ownerName: string; ownerPhone: string; petName: string; petSpecies: string; status: string; chiefComplaint: string | null; createdAt: string; }

export default function StaffBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [showReject, setShowReject] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking");
      const json = await res.json();
      if (res.ok) setBookings(json.data ?? []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const handleConfirm = async (booking: Booking) => {
    const res = await fetch(`/api/booking/${booking.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "confirmed" }) });
    if (res.ok) { toast.success("Booking dikonfirmasi"); fetchBookings(); }
    else toast.error("Gagal");
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectReason) return;
    const res = await fetch(`/api/booking/${selectedBooking.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected", rejectionReason: rejectReason }) });
    if (res.ok) { toast.success("Booking ditolak"); setShowReject(false); setSelectedBooking(null); setRejectReason(""); fetchBookings(); }
    else toast.error("Gagal");
  };

  const columns = [
    { key: "createdAt", header: "Tgl Booking", render: (item: Booking) => new Date(item.createdAt).toLocaleDateString("id-ID") },
    { key: "ownerName", header: "Nama" },
    { key: "ownerPhone", header: "No HP" },
    { key: "petName", header: "Hewan" },
    { key: "petSpecies", header: "Spesies" },
    { key: "status", header: "Status", render: (item: Booking) => <Badge value={item.status} /> },
    { key: "actions", header: "Aksi", render: (item: Booking) => item.status === "pending" ? (
      <div className="flex gap-1">
        <button onClick={() => handleConfirm(item)} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">✅ Konfirmasi</button>
        <button onClick={() => { setSelectedBooking(item); setRejectReason(""); setShowReject(true); }} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">❌ Tolak</button>
      </div>
    ) : null },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Manajemen Booking" subtitle="Kelola permintaan booking online" />
      <div className="flex gap-2">
        {["pending", "confirmed", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${filter === f ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f === "pending" ? "Menunggu" : f === "confirmed" ? "Dikonfirmasi" : f === "rejected" ? "Ditolak" : "Semua"}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={filtered} loading={loading} />

      <Modal open={showReject} onClose={() => setShowReject(false)} title="Tolak Booking" size="sm" footer={
        <><button onClick={() => setShowReject(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700">Batal</button>
        <button onClick={handleReject} disabled={!rejectReason} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50">Tolak</button></>
      }>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Alasan penolakan untuk booking {selectedBooking?.ownerName} ({selectedBooking?.petName})</p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Wajib diisi..." />
        </div>
      </Modal>
    </div>
  );
}