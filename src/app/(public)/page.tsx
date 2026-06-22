"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, Syringe, Heart, Clock, Phone, MapPin, ChevronRight, Menu, X, PawPrint, Shield, Star, ArrowRight } from "lucide-react";

interface Doctor { id: string; name: string; role: string; }

export default function LandingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/users?role=dokter&limit=10").then(r => r.json()).then(json => {
      if (json.data?.users) setDoctors(json.data.users);
    }).catch(() => {});

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    { icon: "🩺", title: "Pemeriksaan Umum", desc: "Pemeriksaan kesehatan rutin, vaksinasi, dan konsultasi medis untuk hewan kesayangan Anda" },
    { icon: "🏥", title: "Rawat Inap", desc: "Fasilitas rawat inap 24 jam dengan monitoring kondisi pasien secara intensif" },
    { icon: "💉", title: "Vaksinasi", desc: "Program vaksinasi lengkap sesuai jadwal yang direkomendasikan dokter" },
    { icon: "🔬", title: "Laboratorium", desc: "Pemeriksaan laboratorium lengkap untuk diagnosis yang akurat dan cepat" },
    { icon: "🦷", title: "Gigi & Mulut", desc: "Perawatan gigi dan kesehatan mulut hewan oleh dokter berpengalaman" },
    { icon: "✂️", title: "Grooming", desc: "Perawatan bulu, kuku, dan kebersihan hewan dengan tenaga profesional" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white/80 backdrop-blur-md"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-teal-200">
              V
            </div>
            <span className="text-lg font-bold text-slate-900">VetCare</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#services" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Layanan</Link>
            <Link href="#doctors" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Dokter</Link>
            <Link href="#info" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Informasi</Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/booking" className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-200 hover:shadow-xl hover:from-teal-600 hover:to-emerald-600 transition-all">
              Booking Sekarang
            </Link>
            <Link href="/login" className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all">
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden animate-fade-in">
            <div className="space-y-3">
              <Link href="#services" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-600">Layanan</Link>
              <Link href="#doctors" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-600">Dokter</Link>
              <Link href="#info" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-600">Informasi</Link>
              <div className="pt-2 space-y-2">
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)} className="block w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-white">Booking Sekarang</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700">Login</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-center lg:gap-16">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-xs font-semibold text-teal-700 mb-6">
                <Shield className="h-3 w-3" />
                Klinik Hewan Terpercaya Sejak 2020
              </div>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight md:text-5xl lg:text-6xl">
                Klinik Hewan{' '}
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  Terpercaya
                </span>{' '}
                untuk Sahabat Anda
              </h1>
              <p className="mt-6 text-base text-slate-600 leading-relaxed md:text-lg max-w-xl mx-auto lg:mx-0">
                Layanan kesehatan hewan profesional dengan dokter berpengalaman. 
                Booking online mudah, cepat, dan nyaman. Kami siap merawat hewan kesayangan Anda.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/booking"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-200 hover:shadow-xl hover:from-teal-600 hover:to-emerald-600 transition-all"
                >
                  Booking Sekarang
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#services"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-8 py-3.5 text-base font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all"
                >
                  Lihat Layanan
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>4.9 Rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>500+ Pasien</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="h-4 w-4 text-teal-500" />
                  <span>Dokter Profesional</span>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="mt-12 lg:mt-0 lg:flex-1">
              <div className="relative mx-auto w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-200 to-emerald-200 opacity-30 animate-pulse" />
                <div className="relative flex items-center justify-center h-full">
                  <svg className="w-64 h-64 text-teal-300 md:w-72 md:h-72 lg:w-80 lg:h-80" viewBox="0 0 200 200" fill="currentColor">
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
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Layanan Kami</h2>
            <p className="mt-3 text-base text-slate-500">Perawatan lengkap untuk hewan kesayangan Anda dengan standar medis terbaik</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-teal-100 transition-all duration-200"
              >
                <span className="text-5xl">{svc.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">{svc.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Dokter Kami</h2>
            <p className="mt-3 text-base text-slate-500">Tim dokter profesional dan berpengalaman di bidangnya</p>
          </div>
          <div className="mt-12">
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 lg:hidden">
              {doctors.map(doc => (
                <div key={doc.id} className="min-w-[260px] snap-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-3xl font-bold text-teal-600 shadow-inner">
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{doc.name}</h3>
                  <p className="text-sm text-teal-600 font-medium">Dokter Hewan</p>
                  <p className="mt-2 text-xs text-slate-400">Berpengalaman dalam perawatan hewan kecil</p>
                </div>
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.map(doc => (
                <div key={doc.id} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-3xl font-bold text-teal-600 shadow-inner">
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{doc.name}</h3>
                  <p className="text-sm text-teal-600 font-medium">Dokter Hewan</p>
                  <p className="mt-2 text-xs text-slate-400">Berpengalaman dalam perawatan hewan kecil</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 text-center md:text-3xl">Informasi Klinik</h2>
            <p className="mt-2 text-center text-slate-500">Kunjungi kami untuk konsultasi langsung</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Jam Buka</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Sen - Sab: 08:00 - 20:00<br />
                    Minggu: 10:00 - 16:00
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Alamat</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Jl. Contoh No. 123<br />
                    Jakarta Selatan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Kontak</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Telp: 021-12345678<br />
                    WA: 0812-3456-7890
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Siap Merawat Hewan Kesayangan Anda?</h2>
          <p className="mt-3 text-teal-100">Booking sekarang dan dapatkan pelayanan terbaik dari kami</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/booking"
              className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-teal-600 hover:bg-teal-50 shadow-lg transition-all"
            >
              Booking Sekarang
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-900 py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-xs font-bold text-white">
                V
              </div>
              <span className="text-sm font-semibold text-white">VetCare Klinik Hewan</span>
            </div>
            <p className="text-sm text-slate-400">© 2026 VetCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}