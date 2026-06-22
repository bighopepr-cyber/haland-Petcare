"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Calendar, Clock, Syringe, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Slot { id: string; doctorId: string; date: string; startTime: string; endTime: string; maxQuota: number; isActive: boolean; }
interface Doctor { id: string; name: string; }

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState(""); const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState(""); const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState(""); const [complaint, setComplaint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/users?role=dokter&limit=50").then(r => r.json()).then(json => {
      if (json.data?.users) setDoctors(json.data.users);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedDoctor) params.set("doctor_id", selectedDoctor);
      fetch(`/api/booking/slots?${params}`).then(r => r.json()).then(json => {
        if (json.data) setSlots(json.data);
      }).catch(() => {});
    }
  }, [selectedDate, selectedDoctor]);

  const selectedSlotData = slots.find(s => s.id === selectedSlot);

  const handleSubmit = async () => {
    if (!selectedSlot || !ownerName || !ownerPhone || !petName || !petSpecies) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot, customerName: ownerName, customerPhone: ownerPhone, customerEmail: ownerEmail || undefined, petName, petSpecies, chiefComplaint: complaint || undefined }),
      });
      const json = await res.json();
      if (res.ok) { setSuccess(true); toast.success("Booking berhasil dikirim!"); }
      else toast.error(json.error ?? "Gagal booking");
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-100">
            <CheckCircle className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Booking Berhasil!</h2>
          <p className="mt-3 text-gray-600">Terima kasih! Permintaan booking Anda telah kami terima. Tim kami akan menghubungi Anda untuk konfirmasi.</p>
          <div className="mt-6 space-y-2 text-sm text-gray-500 bg-white rounded-xl p-4 border">
            <p>📅 Tanggal: {selectedDate}</p>
            <p>⏰ Waktu: {selectedSlotData?.startTime} - {selectedSlotData?.endTime}</p>
            <p>🐾 Hewan: {petName} ({petSpecies})</p>
          </div>
          <div className="mt-8 flex gap-3 justify-center">
            <Link href="/" className="rounded-full border px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">Kembali ke Beranda</Link>
            <button onClick={() => { setStep(1); setSelectedSlot(null); setOwnerName(""); setOwnerPhone(""); setOwnerEmail(""); setPetName(""); setPetSpecies(""); setComplaint(""); setSuccess(false); }}
              className="rounded-full bg-teal-500 px-6 py-2 text-sm text-white hover:bg-teal-600">Booking Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <nav className="border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">V</div>
            <span className="font-bold text-gray-900">VetCare</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= s ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
              <span className={`text-sm ${step >= s ? "text-teal-600 font-medium" : "text-gray-400"}`}>{s === 1 ? "Jadwal" : s === 2 ? "Data" : "Konfirmasi"}</span>
              {s < 3 && <div className={`h-0.5 w-8 ${step > s ? "bg-teal-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Pilih Jadwal</h2>
            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white">
              <option value="">Semua Dokter</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              {slots.map(slot => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <button key={slot.id} onClick={() => setSelectedSlot(slot.id)}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all ${isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    {isSelected && <Check className="absolute right-3 top-3 h-5 w-5 text-teal-500" />}
                  </button>
                );
              })}
              {slots.length === 0 && <p className="col-span-2 text-center text-sm text-gray-500 py-8">Tidak ada slot tersedia untuk tanggal ini</p>}
            </div>
            <button onClick={() => selectedSlot && setStep(2)} disabled={!selectedSlot}
              className="w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50">
              Selanjutnya <ChevronRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Data Hewan & Pemilik</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nama Pemilik *</label><input value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" required /></div>
              <div><label className="block text-sm font-medium mb-1">No HP *</label><input value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" required /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Nama Hewan *</label><input value={petName} onChange={e => setPetName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" required /></div>
              <div><label className="block text-sm font-medium mb-1">Spesies *</label>
                <select value={petSpecies} onChange={e => setPetSpecies(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white" required>
                  <option value="">Pilih spesies</option>
                  <option value="Anjing">Anjing</option><option value="Kucing">Kucing</option><option value="Burung">Burung</option><option value="Reptil">Reptil</option><option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Keluhan</label><textarea value={complaint} onChange={e => setComplaint(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-gray-300 py-3 text-sm text-gray-700 hover:bg-gray-50"><ChevronLeft className="inline h-4 w-4 mr-1" />Kembali</button>
              <button onClick={() => { if (ownerName && ownerPhone && petName && petSpecies) setStep(3); else toast.error("Lengkapi data wajib"); }}
                className="flex-1 rounded-full bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-600">Selanjutnya <ChevronRight className="inline h-4 w-4 ml-1" /></button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Konfirmasi Booking</h2>
            <div className="rounded-xl border bg-white p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-teal-500" /> <span className="font-medium">Tanggal:</span> {selectedDate}</div>
              <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-teal-500" /> <span className="font-medium">Waktu:</span> {selectedSlotData?.startTime} - {selectedSlotData?.endTime}</div>
              <div className="flex items-center gap-2 text-sm"><Syringe className="h-4 w-4 text-teal-500" /> <span className="font-medium">Hewan:</span> {petName} ({petSpecies})</div>
              <hr />
              <p className="text-sm"><span className="font-medium">Pemilik:</span> {ownerName} ({ownerPhone})</p>
              {complaint && <p className="text-sm"><span className="font-medium">Keluhan:</span> {complaint}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-full border border-gray-300 py-3 text-sm text-gray-700 hover:bg-gray-50"><ChevronLeft className="inline h-4 w-4 mr-1" />Kembali</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 rounded-full bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50">
                {submitting ? "Mengirim..." : "Kirim Booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}