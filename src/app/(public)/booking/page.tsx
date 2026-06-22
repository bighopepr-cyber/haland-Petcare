"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Calendar, Clock, Syringe, CheckCircle, ArrowRight, PawPrint, User, Phone, Mail, MessageSquare } from "lucide-react";
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
        <div className="max-w-md w-full text-center">
          {/* Animated checkmark */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 mb-6">
            <svg className="h-12 w-12 text-teal-600 animate-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Berhasil!</h2>
          <p className="mt-3 text-slate-600">Terima kasih! Permintaan booking Anda telah kami terima. Tim kami akan menghubungi Anda untuk konfirmasi.</p>

          <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-teal-500" />
              <span className="text-slate-600">Tanggal: <strong className="text-slate-900">{selectedDate}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-teal-500" />
              <span className="text-slate-600">Waktu: <strong className="text-slate-900">{selectedSlotData?.startTime} - {selectedSlotData?.endTime}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <PawPrint className="h-4 w-4 text-teal-500" />
              <span className="text-slate-600">Hewan: <strong className="text-slate-900">{petName} ({petSpecies})</strong></span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all">
              Kembali ke Beranda
            </Link>
            <button
              onClick={() => { setStep(1); setSelectedSlot(null); setOwnerName(""); setOwnerPhone(""); setOwnerEmail(""); setPetName(""); setPetSpecies(""); setComplaint(""); setSuccess(false); }}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 hover:shadow-xl transition-all"
            >
              Booking Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white">
              V
            </div>
            <span className="font-bold text-slate-900">VetCare</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  step > s
                    ? "bg-teal-500 text-white shadow-md"
                    : step === s
                    ? "bg-teal-500 text-white shadow-md ring-4 ring-teal-100"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                <span className={`mt-1.5 text-xs font-medium ${
                  step >= s ? "text-teal-600" : "text-slate-400"
                }`}>
                  {s === 1 ? "Jadwal" : s === 2 ? "Data" : "Konfirmasi"}
                </span>
              </div>
              {s < 3 && (
                <div className={`mx-2 mt-[-1.5rem] h-0.5 w-12 sm:w-20 transition-colors duration-300 ${
                  step > s ? "bg-teal-500" : "bg-slate-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 - Pilih Jadwal */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pilih Jadwal</h2>
              <p className="text-sm text-slate-500 mt-1">Pilih dokter dan waktu yang tersedia</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Dokter</label>
                <select
                  value={selectedDoctor}
                  onChange={e => setSelectedDoctor(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">Semua Dokter</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Waktu</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {slots.map(slot => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? "border-teal-500 bg-teal-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${isSelected ? "text-teal-500" : "text-slate-400"}`} />
                          <span className={`font-medium text-sm ${isSelected ? "text-teal-700" : "text-slate-900"}`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white shadow">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {slots.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">Tidak ada slot tersedia untuk tanggal ini</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => selectedSlot && setStep(2)}
              disabled={!selectedSlot}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-teal-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              Selanjutnya <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 - Data Hewan & Pemilik */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Hewan & Pemilik</h2>
              <p className="text-sm text-slate-500 mt-1">Lengkapi informasi untuk booking</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <User className="inline h-3.5 w-3.5 mr-1" /> Nama Pemilik *
                  </label>
                  <input value={ownerName} onChange={e => setOwnerName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Phone className="inline h-3.5 w-3.5 mr-1" /> No HP *
                  </label>
                  <input value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Mail className="inline h-3.5 w-3.5 mr-1" /> Email
                </label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <PawPrint className="inline h-3.5 w-3.5 mr-1" /> Nama Hewan *
                  </label>
                  <input value={petName} onChange={e => setPetName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Spesies *</label>
                  <select value={petSpecies} onChange={e => setPetSpecies(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" required>
                    <option value="">Pilih spesies</option>
                    <option value="Anjing">Anjing</option>
                    <option value="Kucing">Kucing</option>
                    <option value="Burung">Burung</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <MessageSquare className="inline h-3.5 w-3.5 mr-1" /> Keluhan
                </label>
                <textarea value={complaint} onChange={e => setComplaint(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
              <button onClick={() => { if (ownerName && ownerPhone && petName && petSpecies) setStep(3); else toast.error("Lengkapi data wajib"); }}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-teal-200 hover:shadow-xl transition-all flex items-center justify-center gap-1">
                Selanjutnya <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Konfirmasi */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Konfirmasi Booking</h2>
              <p className="text-sm text-slate-500 mt-1">Periksa kembali data booking Anda</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tanggal</p>
                  <p className="font-medium text-slate-900">{selectedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Waktu</p>
                  <p className="font-medium text-slate-900">{selectedSlotData?.startTime} - {selectedSlotData?.endTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hewan</p>
                  <p className="font-medium text-slate-900">{petName} ({petSpecies})</p>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pemilik</p>
                  <p className="font-medium text-slate-900">{ownerName} ({ownerPhone})</p>
                </div>
              </div>
              {complaint && (
                <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="text-xs font-medium text-amber-600 mb-1">Keluhan</p>
                  <p>{complaint}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-teal-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengirim...
                  </>
                ) : "Kirim Booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}