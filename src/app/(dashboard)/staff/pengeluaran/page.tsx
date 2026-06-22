"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, Trash2 } from "lucide-react";

interface Expense { id: string; category: string; description: string; amount: string; date: string; receiptUrl: string | null; }

export default function StaffExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [fCategory, setFCategory] = useState("Operasional"); const [fDesc, setFDesc] = useState(""); const [fAmount, setFAmount] = useState(""); const [fDate, setFDate] = useState(new Date().toISOString().split("T")[0]);
  const [formLoading, setFormLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/expenses"); const json = await res.json(); if (res.ok) setExpenses(json.data ?? []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: fCategory, description: fDesc, amount: fAmount, date: fDate }) });
      if (res.ok) { toast.success("Pengeluaran dicatat"); setShowCreate(false); setFDesc(""); setFAmount(""); fetchExpenses(); }
      else { const j = await res.json(); toast.error(j.error ?? "Gagal"); }
    } catch { toast.error("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    const res = await fetch(`/api/expenses/${showDelete}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dihapus"); setShowDelete(null); fetchExpenses(); }
    else toast.error("Gagal");
  };

  const columns = [
    { key: "date", header: "Tanggal", render: (item: Expense) => new Date(item.date).toLocaleDateString("id-ID") },
    { key: "category", header: "Kategori" },
    { key: "description", header: "Deskripsi" },
    { key: "amount", header: "Nominal", render: (item: Expense) => `Rp ${Number(item.amount).toLocaleString("id-ID")}` },
    { key: "actions", header: "Aksi", render: (item: Expense) => (
      <button onClick={() => setShowDelete(item.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Pengeluaran" subtitle="Catat pengeluaran klinik" actions={
        <button onClick={() => { setFDesc(""); setFAmount(""); setFCategory("Operasional"); setShowCreate(true); }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Pengeluaran
        </button>
      } />
      <DataTable columns={columns} data={expenses} loading={loading} />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tambah Pengeluaran" size="md" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Kategori" value={fCategory} onChange={e => setFCategory(e.target.value)} options={[{ value: "Operasional", label: "Operasional" }, { value: "Obat", label: "Obat" }, { value: "Gaji", label: "Gaji" }, { value: "Lainnya", label: "Lainnya" }]} required />
          <Input label="Deskripsi" value={fDesc} onChange={e => setFDesc(e.target.value)} required />
          <Input label="Nominal" type="number" value={fAmount} onChange={e => setFAmount(e.target.value)} required />
          <Input label="Tanggal" type="date" value={fDate} onChange={e => setFDate(e.target.value)} required />
        </form>
      </Modal>

      <ConfirmDialog open={!!showDelete} onConfirm={handleDelete} onCancel={() => setShowDelete(null)} title="Hapus Pengeluaran" description="Apakah Anda yakin ingin menghapus pengeluaran ini?" confirmLabel="Hapus" danger />
    </div>
  );
}