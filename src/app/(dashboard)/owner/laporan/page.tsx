"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { DataTable } from "@/components/ui/DataTable";
import { DollarSign, TrendingUp, TrendingDown, Receipt, Download } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

const presets = [
  { label: "Hari Ini", getValue: () => { const d = new Date().toISOString().split("T")[0]!; return { from: d, to: d }; } },
  { label: "Minggu Ini", getValue: () => { const now = new Date(); const day = now.getDay(); const monday = new Date(now); monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); return { from: monday.toISOString().split("T")[0]!, to: now.toISOString().split("T")[0]! }; } },
  { label: "Bulan Ini", getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); return { from: first.toISOString().split("T")[0]!, to: now.toISOString().split("T")[0]! }; } },
  { label: "Tahun Ini", getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), 0, 1); return { from: first.toISOString().split("T")[0]!, to: now.toISOString().split("T")[0]! }; } },
];

const ChartSection = lazy(() => import("./ChartSection"));

function ChartSkeleton() {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="h-[350px] animate-pulse rounded-lg bg-gray-100" />
    <div className="h-[350px] animate-pulse rounded-lg bg-gray-100" />
  </div>;
}

export default function OwnerLaporanPage() {
  const [from, setFrom] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]!; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]!);
  const [summary, setSummary] = useState({ pemasukan: 0, pengeluaran: 0, laba: 0, totalTransaksi: 0 });
  const [revenueData, setRevenueData] = useState<{ date: string; pemasukan: number; pengeluaran: number }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ name: string; value: number }[]>([]);
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [stockAlerts, setStockAlerts] = useState<Record<string, unknown>[]>([]);
  const [doctors, setDoctors] = useState<{ name: string; total_pasien: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      const [sRes, rRes, tRes, stRes, dRes] = await Promise.all([
        fetch(`/api/reports/summary?${params}`),
        fetch(`/api/reports/revenue?${params}&group_by=day`),
        fetch(`/api/reports/transactions?${params}&limit=20`),
        fetch("/api/reports/stock-alert"),
        fetch(`/api/reports/doctors?${params}`),
      ]);
      const sJson = await sRes.json(); const rJson = await rRes.json(); const tJson = await tRes.json(); const stJson = await stRes.json(); const dJson = await dRes.json();
      if (sRes.ok) setSummary(sJson.data);
      if (rRes.ok) {
        const rev = rJson.data?.revenue ?? []; const exp = rJson.data?.expenses ?? [];
        const merged: Record<string, { date: string; pemasukan: number; pengeluaran: number }> = {};
        rev.forEach((r: { date: string; pemasukan: string }) => { const d = new Date(r.date).toISOString().split("T")[0]!; if (!merged[d]) merged[d] = { date: d, pemasukan: 0, pengeluaran: 0 }; merged[d]!.pemasukan += Number(r.pemasukan); });
        exp.forEach((r: { date: string; pengeluaran: string }) => { const d = new Date(r.date).toISOString().split("T")[0]!; if (!merged[d]) merged[d] = { date: d, pemasukan: 0, pengeluaran: 0 }; merged[d]!.pengeluaran += Number(r.pengeluaran); });
        setRevenueData(Object.values(merged).sort((a, b) => a.date.localeCompare(b.date)));
      }
      if (tRes.ok) setTransactions(tJson.data?.transactions ?? []);
      if (stRes.ok) setStockAlerts(stJson.data ?? []);
      if (dRes.ok) setDoctors(dJson.data ?? []);
    } catch {} finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePreset = (preset: typeof presets[number]) => { const v = preset.getValue(); setFrom(v.from); setTo(v.to); };

  const exportCSV = () => {
    const headers = ["Invoice", "Total", "Metode", "Tanggal"];
    const rows = transactions.map((t: Record<string, unknown>) => [String(t["invoiceNo"] ?? ""), String(t["total"] ?? ""), String(t["paymentMethod"] ?? ""), t["createdAt"] ? new Date(t["createdAt"] as string).toLocaleDateString("id-ID") : ""]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `laporan-${from}-${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Keuangan" subtitle="Analisis bisnis dan performa klinik" actions={
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Download className="h-4 w-4" /> Export CSV</button>
      } />

      {/* Date Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        {presets.map(p => <button key={p.label} onClick={() => handlePreset(p)} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200">{p.label}</button>)}
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm ml-2" />
        <span className="text-sm text-gray-500">s/d</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm" />
      </div>

      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pemasukan" value={`Rp ${summary.pemasukan.toLocaleString("id-ID")}`} icon={<TrendingUp className="h-5 w-5" />} color="teal" />
        <StatsCard title="Pengeluaran" value={`Rp ${summary.pengeluaran.toLocaleString("id-ID")}`} icon={<TrendingDown className="h-5 w-5" />} color="red" />
        <StatsCard title="Laba" value={`Rp ${summary.laba.toLocaleString("id-ID")}`} icon={<DollarSign className="h-5 w-5" />} color={summary.laba >= 0 ? "teal" : "red"} />
        <StatsCard title="Total Transaksi" value={summary.totalTransaksi} icon={<Receipt className="h-5 w-5" />} color="blue" />
      </div>

      {/* Row 2: Charts (dynamically loaded) */}
      <Suspense fallback={<ChartSkeleton />}>
        <ChartSection revenueData={revenueData} paymentMethods={paymentMethods} />
      </Suspense>

      {/* Row 3: Top Products + Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Stok Menipis</h3>
          <DataTable columns={[
            { key: "name", header: "Produk" },
            { key: "stock", header: "Stok" },
            { key: "minStock", header: "Min Stok" },
          ]} data={stockAlerts} loading={loading} />
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Performa Dokter</h3>
          <DataTable columns={[
            { key: "name", header: "Dokter" },
            { key: "total_pasien", header: "Pasien" },
          ]} data={doctors} loading={loading} />
        </div>
      </div>

      {/* Row 4: Transactions Table */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
        <DataTable columns={[
          { key: "invoiceNo", header: "Invoice", render: (item: Record<string, unknown>) => String(item["invoiceNo"] ?? "") },
          { key: "total", header: "Total", render: (item: Record<string, unknown>) => `Rp ${Number(item["total"]).toLocaleString("id-ID")}` },
          { key: "paymentMethod", header: "Metode", render: (item: Record<string, unknown>) => String(item["paymentMethod"] ?? "") },
          { key: "createdAt", header: "Tanggal", render: (item: Record<string, unknown>) => item["createdAt"] ? new Date(item["createdAt"] as string).toLocaleDateString("id-ID") : "-" },
        ]} data={transactions} loading={loading} pagination />
      </div>
    </div>
  );
}