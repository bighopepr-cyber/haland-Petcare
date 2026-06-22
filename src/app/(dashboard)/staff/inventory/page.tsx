"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Plus, Search, MoreVertical, Edit2, PackagePlus, TrendingUp, History, Eye } from "lucide-react";

type Tab = "products" | "mutations" | "services" | "categories";

interface Product { id: string; name: string; categoryId: string; price: string; stock: number; minStock: number; unit: string; imageUrl: string | null; isActive: boolean; }
interface Mutation { id: string; productId: string; type: string; qtyBefore: number; qtyChange: number; qtyAfter: number; reference: string | null; notes: string | null; createdAt: string; }
interface ServiceItem { id: string; name: string; categoryId: string; price: string; durationMinutes: number; requiresDoctor: boolean; isActive: boolean; }
interface Category { id: string; name: string; type: string; isActive: boolean; }

export default function StaffInventoryPage() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className="space-y-6">
      <PageHeader title="Inventori" subtitle="Kelola produk, stok, layanan, dan kategori" />

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(["products", "mutations", "services", "categories"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "bg-white border border-b-white -mb-[3px] text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "products" ? "Produk" : t === "mutations" ? "Mutasi Stok" : t === "services" ? "Layanan" : "Kategori"}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsTab />}
      {tab === "mutations" && <MutationsTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "categories" && <CategoriesTab />}
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("true");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showMutations, setShowMutations] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [mutationList, setMutationList] = useState<Mutation[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [fName, setFName] = useState(""); const [fCategoryId, setFCategoryId] = useState(""); const [fPrice, setFPrice] = useState("");
  const [fMinStock, setFMinStock] = useState("5"); const [fUnit, setFUnit] = useState(""); const [fStock, setFStock] = useState("0");
  const [fQtyChange, setFQtyChange] = useState(""); const [fNotes, setFNotes] = useState(""); const [fTargetStock, setFTargetStock] = useState(""); const [fReason, setFReason] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", isActive: statusFilter });
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      const res = await fetch(`/api/inventory/products?${params}`);
      const json = await res.json();
      if (res.ok) { setProducts(json.data.products); setPagination(json.data.pagination); }
      else toast.error(json.error ?? "Gagal memuat");
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter, page]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/inventory/categories");
    const json = await res.json();
    if (res.ok) setCategories(json.data ?? []);
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(null); setFormLoading(true);
    try {
      const res = await fetch("/api/inventory/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fName, categoryId: fCategoryId, price: fPrice, stock: Number(fStock), minStock: Number(fMinStock), unit: fUnit }) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Produk berhasil dibuat"); setShowCreate(false); resetForm(); fetchProducts();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setFormError(null); setFormLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (fName !== selected.name) body["name"] = fName;
      if (fCategoryId !== selected.categoryId) body["categoryId"] = fCategoryId;
      if (fPrice !== selected.price) body["price"] = fPrice;
      if (Number(fMinStock) !== selected.minStock) body["minStock"] = Number(fMinStock);
      if (fUnit !== selected.unit) body["unit"] = fUnit;
      if (Object.keys(body).length === 0) { setFormError("Tidak ada perubahan"); setFormLoading(false); return; }
      const res = await fetch(`/api/inventory/products/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Produk diupdate"); setShowEdit(false); resetForm(); fetchProducts();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setFormError(null); setFormLoading(true);
    try {
      const res = await fetch(`/api/inventory/products/${selected.id}/stock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qtyChange: Number(fQtyChange), notes: fNotes }) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Stok berhasil ditambahkan"); setShowAddStock(false); setFQtyChange(""); setFNotes(""); fetchProducts();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setFormError(null); setFormLoading(true);
    try {
      const res = await fetch(`/api/inventory/products/${selected.id}/stock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetStock: Number(fTargetStock), reason: fReason }) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Stok disesuaikan"); setShowAdjust(false); setFTargetStock(""); setFReason(""); fetchProducts();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const fetchMutations = async (productId: string) => {
    const res = await fetch(`/api/inventory/mutations?productId=${productId}&limit=50`);
    const json = await res.json();
    if (res.ok) setMutationList(json.data.mutations ?? []);
  };

  const resetForm = () => { setFName(""); setFCategoryId(""); setFPrice(""); setFMinStock("5"); setFUnit(""); setFStock("0"); setFQtyChange(""); setFNotes(""); setFTargetStock(""); setFReason(""); setFormError(null); setSelected(null); };

  const openEdit = (p: Product) => { setSelected(p); setFName(p.name); setFCategoryId(p.categoryId); setFPrice(p.price); setFMinStock(String(p.minStock)); setFUnit(p.unit); setShowEdit(true); };
  const openAddStock = (p: Product) => { setSelected(p); setFQtyChange(""); setFNotes(""); setShowAddStock(true); };
  const openAdjust = (p: Product) => { setSelected(p); setFTargetStock(String(p.stock)); setFReason(""); setShowAdjust(true); };
  const openMutations = (p: Product) => { setSelected(p); fetchMutations(p.id); setShowMutations(true); };

  const catOptions = categories.filter(c => c.type === "product").map(c => ({ value: c.id, label: c.name }));

  const columns = [
    { key: "name", header: "Nama" },
    { key: "price", header: "Harga", render: (item: Product) => `Rp ${Number(item.price).toLocaleString("id-ID")}` },
    { key: "stock", header: "Stok", render: (item: Product) => <span className={`font-bold ${item.stock <= item.minStock ? "text-red-600" : ""}`}>{item.stock} {item.unit}</span> },
    { key: "minStock", header: "Min Stok" },
    { key: "isActive", header: "Status", render: (item: Product) => <Badge value={item.isActive ? "active" : "inactive"} /> },
    { key: "actions", header: "Aksi", render: (item: Product) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(item)} className="p-1 hover:bg-gray-100 rounded"><Edit2 className="h-4 w-4 text-gray-500" /></button>
        <button onClick={() => openAddStock(item)} className="p-1 hover:bg-gray-100 rounded"><PackagePlus className="h-4 w-4 text-emerald-500" /></button>
        <button onClick={() => openAdjust(item)} className="p-1 hover:bg-gray-100 rounded"><TrendingUp className="h-4 w-4 text-blue-500" /></button>
        <button onClick={() => openMutations(item)} className="p-1 hover:bg-gray-100 rounded"><History className="h-4 w-4 text-gray-500" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="block w-full border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Semua Kategori</option>
          {catOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <button onClick={() => { resetForm(); setShowCreate(true); }}
          className="ml-auto flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Produk
        </button>
      </div>

      <DataTable columns={columns} data={products} loading={loading} pagination pageSize={20} />

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tambah Produk" size="md" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama Produk" value={fName} onChange={e => setFName(e.target.value)} required />
          <Select label="Kategori" value={fCategoryId} onChange={e => setFCategoryId(e.target.value)} options={catOptions} required placeholder="Pilih kategori" />
          <Input label="Harga" type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stok Awal" type="number" value={fStock} onChange={e => setFStock(e.target.value)} />
            <Input label="Min Stok" type="number" value={fMinStock} onChange={e => setFMinStock(e.target.value)} />
          </div>
          <Input label="Unit" value={fUnit} onChange={e => setFUnit(e.target.value)} required placeholder="pcs, botol, kg" />
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Produk" size="md" footer={
        <><button onClick={() => setShowEdit(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleEdit} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Nama Produk" value={fName} onChange={e => setFName(e.target.value)} required />
          <Select label="Kategori" value={fCategoryId} onChange={e => setFCategoryId(e.target.value)} options={catOptions} required />
          <Input label="Harga" type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Stok" type="number" value={fMinStock} onChange={e => setFMinStock(e.target.value)} />
            <Input label="Unit" value={fUnit} onChange={e => setFUnit(e.target.value)} required />
          </div>
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>

      {/* Add Stock Modal */}
      <Modal open={showAddStock} onClose={() => setShowAddStock(false)} title="Tambah Stok" size="sm" footer={
        <><button onClick={() => setShowAddStock(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleAddStock} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Memproses..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleAddStock} className="space-y-4">
          <Input label="Produk" value={selected?.name ?? ""} disabled />
          <Input label="Stok Saat Ini" value={String(selected?.stock ?? 0)} disabled />
          <Input label="Jumlah Masuk" type="number" value={fQtyChange} onChange={e => setFQtyChange(e.target.value)} required min="1" />
          <Input label="Stok Sesudah" value={String((selected?.stock ?? 0) + (Number(fQtyChange) || 0))} disabled />
          <Input label="Catatan" value={fNotes} onChange={e => setFNotes(e.target.value)} />
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>

      {/* Adjustment Modal */}
      <Modal open={showAdjust} onClose={() => setShowAdjust(false)} title="Adjustment Stok" size="sm" footer={
        <><button onClick={() => setShowAdjust(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleAdjust} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Memproses..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleAdjust} className="space-y-4">
          <Input label="Produk" value={selected?.name ?? ""} disabled />
          <Input label="Stok Saat Ini" value={String(selected?.stock ?? 0)} disabled />
          <Input label="Stok Seharusnya" type="number" value={fTargetStock} onChange={e => setFTargetStock(e.target.value)} required min="0" />
          {selected && <div className={`text-sm font-medium ${Number(fTargetStock) > selected.stock ? "text-emerald-600" : Number(fTargetStock) < selected.stock ? "text-red-600" : "text-gray-500"}`}>
            Selisih: {Number(fTargetStock) - selected.stock > 0 ? "+" : ""}{Number(fTargetStock) - selected.stock}
          </div>}
          <Input label="Alasan" value={fReason} onChange={e => setFReason(e.target.value)} required />
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>

      {/* Mutations Drawer */}
      <Modal open={showMutations} onClose={() => setShowMutations(false)} title={`Riwayat Mutasi: ${selected?.name ?? ""}`} size="lg">
        <table className="min-w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-gray-500"><th className="pb-2">Tanggal</th><th className="pb-2">Tipe</th><th className="pb-2">Sebelum</th><th className="pb-2">Perubahan</th><th className="pb-2">Sesudah</th><th className="pb-2">Referensi</th></tr></thead>
          <tbody>{mutationList.map(m => <tr key={m.id} className="border-b hover:bg-gray-50">
            <td className="py-2">{new Date(m.createdAt).toLocaleDateString("id-ID")}</td>
            <td className="py-2"><Badge value={m.type} /></td>
            <td className="py-2">{m.qtyBefore}</td>
            <td className={`py-2 font-medium ${m.qtyChange > 0 ? "text-emerald-600" : "text-red-600"}`}>{m.qtyChange > 0 ? "+" : ""}{m.qtyChange}</td>
            <td className="py-2">{m.qtyAfter}</td>
            <td className="py-2 text-gray-500">{m.reference ?? "-"}</td>
          </tr>)}</tbody>
        </table>
      </Modal>
    </div>
  );
}

function MutationsTab() {
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");

  const fetchMutations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (productFilter) params.set("productId", productFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/inventory/mutations?${params}`);
      const json = await res.json();
      if (res.ok) setMutations(json.data.mutations ?? []);
    } catch {} finally { setLoading(false); }
  }, [productFilter, typeFilter, from, to]);

  useEffect(() => { fetchMutations(); }, [fetchMutations]);

  const columns = [
    { key: "createdAt", header: "Tanggal", render: (item: Mutation) => new Date(item.createdAt).toLocaleString("id-ID") },
    { key: "type", header: "Tipe", render: (item: Mutation) => <Badge value={item.type} /> },
    { key: "qtyBefore", header: "Sebelum" },
    { key: "qtyChange", header: "Perubahan", render: (item: Mutation) => <span className={`font-medium ${item.qtyChange > 0 ? "text-emerald-600" : "text-red-600"}`}>{item.qtyChange > 0 ? "+" : ""}{item.qtyChange}</span> },
    { key: "qtyAfter", header: "Sesudah" },
    { key: "reference", header: "Referensi" },
    { key: "notes", header: "Catatan" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Filter produk..." value={productFilter} onChange={e => setProductFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
          <option value="">Semua Tipe</option>
          <option value="in">Masuk</option>
          <option value="out">Keluar</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
        <span className="text-sm text-gray-500">s/d</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
      </div>
      <DataTable columns={columns} data={mutations} loading={loading} />
    </div>
  );
}

function ServicesTab() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [fName, setFName] = useState(""); const [fCategoryId, setFCategoryId] = useState(""); const [fPrice, setFPrice] = useState("");
  const [fDuration, setFDuration] = useState("30"); const [fRequiresDoctor, setFRequiresDoctor] = useState(false);
  const [formLoading, setFormLoading] = useState(false); const [formError, setFormError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([fetch("/api/inventory/services"), fetch("/api/inventory/categories")]);
      const sJson = await sRes.json(); const cJson = await cRes.json();
      if (sRes.ok) setServices(sJson.data.services ?? []);
      if (cRes.ok) setCategories(cJson.data ?? []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(null); setFormLoading(true);
    try {
      const res = await fetch("/api/inventory/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fName, categoryId: fCategoryId, price: fPrice, durationMinutes: Number(fDuration), requiresDoctor: fRequiresDoctor }) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Layanan berhasil dibuat"); setShowCreate(false); setFName(""); setFCategoryId(""); setFPrice(""); setFDuration("30"); setFRequiresDoctor(false); fetchServices();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const svcCatOptions = categories.filter(c => c.type === "service").map(c => ({ value: c.id, label: c.name }));

  const columns = [
    { key: "name", header: "Nama" },
    { key: "price", header: "Harga", render: (item: ServiceItem) => `Rp ${Number(item.price).toLocaleString("id-ID")}` },
    { key: "durationMinutes", header: "Durasi (menit)" },
    { key: "requiresDoctor", header: "Perlu Dokter", render: (item: ServiceItem) => item.requiresDoctor ? "Ya" : "Tidak" },
    { key: "isActive", header: "Status", render: (item: ServiceItem) => <Badge value={item.isActive ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setFName(""); setFCategoryId(""); setFPrice(""); setFDuration("30"); setFRequiresDoctor(false); setShowCreate(true); }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Layanan
        </button>
      </div>
      <DataTable columns={columns} data={services} loading={loading} />
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tambah Layanan" size="md" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama Layanan" value={fName} onChange={e => setFName(e.target.value)} required />
          <Select label="Kategori" value={fCategoryId} onChange={e => setFCategoryId(e.target.value)} options={svcCatOptions} required placeholder="Pilih kategori" />
          <Input label="Harga" type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} required />
          <Input label="Durasi (menit)" type="number" value={fDuration} onChange={e => setFDuration(e.target.value)} required />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fRequiresDoctor} onChange={e => setFRequiresDoctor(e.target.checked)} className="rounded" /> Membutuhkan Dokter</label>
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [fName, setFName] = useState(""); const [fType, setFType] = useState<"product" | "service">("product");
  const [formLoading, setFormLoading] = useState(false); const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/inventory/categories"); const json = await res.json(); if (res.ok) setCategories(json.data ?? []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(null); setFormLoading(true);
    try {
      const res = await fetch("/api/inventory/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fName, type: fType }) });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "Gagal"); setFormLoading(false); return; }
      toast.success("Kategori berhasil dibuat"); setShowCreate(false); setFName(""); fetchCategories();
    } catch { setFormError("Terjadi kesalahan"); } finally { setFormLoading(false); }
  };

  const columns = [
    { key: "name", header: "Nama" },
    { key: "type", header: "Tipe", render: (item: Category) => <Badge value={item.type} /> },
    { key: "isActive", header: "Status", render: (item: Category) => <Badge value={item.isActive ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setFName(""); setFType("product"); setShowCreate(true); }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </button>
      </div>
      <DataTable columns={columns} data={categories} loading={loading} />
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tambah Kategori" size="sm" footer={
        <><button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleCreate} disabled={formLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{formLoading ? "Menyimpan..." : "Simpan"}</button></>
      }>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama Kategori" value={fName} onChange={e => setFName(e.target.value)} required />
          <Select label="Tipe" value={fType} onChange={e => setFType(e.target.value as "product" | "service")} options={[{ value: "product", label: "Produk" }, { value: "service", label: "Layanan" }]} required />
          {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}