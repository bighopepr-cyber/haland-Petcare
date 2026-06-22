import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Dokter - Haland Petcare",
};

export default function DokterDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Dokter</h1>
      <p className="text-muted-foreground">Jadwal periksa dan rekam medis pasien</p>
    </div>
  );
}