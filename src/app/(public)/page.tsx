"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, Syringe, Heart, Clock, Phone, MapPin, ChevronRight } from "lucide-react";

interface Doctor { id: string; name: string; role: string; }

export default function LandingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetch("/api/users?role=dokter&limit=10").then(r => r.json()).then(json => {
      if (json.data?.users) setDoctors(json.data.users);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">V</div>
            <span className="text-lg font-bold text-gray-900">VetCare</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/booking" className="rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors">Booking</Link>
            <Link href="/login" className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 lg:text-5xl leading-tight">
                Klinik Hewan <span className="text-teal-500">Terpercaya</span> untuk Sahabat Anda
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-lg">
                Layanan kesehatan hewan profesional dengan dokter berpengalaman. Booking online mudah, cepat, dan nyaman.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/booking" className="rounded-full bg-teal-500 px-8 py-3 text-base font-semibold text-white hover:bg-teal-600 shadow-lg shadow-teal-200 transition-all">
                  Booking Sekarang <ChevronRight className="inline h-4 w-4 ml-1" />
                </Link>
                <Link href="#services" className="rounded-full border-2 border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 hover:border-teal-500 hover:text-teal-600 transition-colors">
                  Lihat Layanan
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:ml-10">
              <svg className="h-64 w-64 text-teal-200" viewBox="0 0 200 200" fill="currentColor">
                <circle cx="100" cy="80" r="40" />
                <ellipse cx="100" cy="140" rx="50" ry="30" />
                <circle cx="80" cy="70" r="5" fill="white" />
                <circle cx="120" cy="70" r="5" fill="white" />
                <ellipse cx="100" cy="85" rx="8" ry="5" fill="white" />
                <path d="M60 50 Q50 30 70 20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M140 50 Q150 30 130 20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M70 160 Q60 180 40 170" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M130 160 Q140 180 160 170" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900">Layanan Kami</h2>
          <p className="mt-2 text-center text-gray-500">Perawatan lengkap untuk hewan kesayangan Anda</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: "🩺", title: "Pemeriksaan Umum", desc: "Pemeriksaan kesehatan rutin, vaksinasi, dan konsultasi medis" },
              { icon: "🏥", title: "Rawat Inap", desc: "Fasilitas rawat inap 24 jam dengan monitoring kondisi pasien" },
              { icon: "💉", title: "Vaksinasi", desc: "Program vaksinasi lengkap sesuai jadwal yang direkomendasikan" },
              { icon: "🔬", title: "Laboratorium", desc: "Pemeriksaan laboratorium untuk diagnosis yang akurat" },
              { icon: "🦷", title: "Gigi & Mulut", desc: "Perawatan gigi dan kesehatan mulut hewan" },
              { icon: "✂️", title: "Grooming", desc: "Perawatan bulu, kuku, dan kebersihan hewan" },
            ].map((svc, i) => (
              <div key={i} className="rounded-xl border bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
                <span className="text-3xl">{svc.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{svc.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900">Dokter Kami</h2>
          <p className="mt-2 text-center text-gray-500">Tim dokter profesional dan berpengalaman</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {doctors.map(doc => (
              <div key={doc.id} className="rounded-xl border bg-white p-6 text-center shadow-md">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-600">
                  {doc.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{doc.name}</h3>
                <p className="text-sm text-teal-600 font-medium">Dokter Hewan</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-xl bg-teal-50 p-8 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 text-center">Informasi Klinik</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-teal-500" />
                <div><p className="font-semibold text-gray-900">Jam Buka</p><p className="text-sm text-gray-500">Sen-Sab: 08:00 - 20:00<br/>Min: 10:00 - 16:00</p></div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-8 w-8 text-teal-500" />
                <div><p className="font-semibold text-gray-900">Alamat</p><p className="text-sm text-gray-500">Jl. Contoh No. 123<br/>Jakarta Selatan</p></div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-8 w-8 text-teal-500" />
                <div><p className="font-semibold text-gray-900">Kontak</p><p className="text-sm text-gray-500">Telp: 021-12345678<br/>WA: 0812-3456-7890</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 py-8 text-center text-sm text-gray-400">
        <p>© 2026 VetCare Klinik Hewan. All rights reserved.</p>
      </footer>
    </div>
  );
}