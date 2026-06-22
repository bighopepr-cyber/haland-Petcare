"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PrintWrapper } from "@/components/ui/PrintWrapper";

interface CartItem {
  id: string;
  itemType: "product" | "service";
  itemId: string;
  itemName: string;
  itemPrice: number;
  qty: number;
}

interface Product { id: string; name: string; price: string; stock: number; unit: string; imageUrl: string | null; isActive?: boolean; }
interface ServiceItem { id: string; name: string; price: string; durationMinutes: number; }

export default function StaffPOSPage() {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [tab, setTab] = useState<"products" | "services">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | "transfer">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    invoiceNo: string; total: number; paymentMethod: string; amountPaid: number; change: number;
  } | null>(null);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/products?limit=100&isActive=true");
      const json = await res.json();
      if (res.ok) setProducts(json.data.products ?? []);
    } catch {}
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/services?limit=100");
      const json = await res.json();
      if (res.ok) setServices(json.data.services ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); fetchServices(); }, [fetchProducts, fetchServices]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) && p.isActive !== false
  );
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (itemType: "product" | "service", item: Product | ServiceItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id && c.itemType === itemType);
      if (existing) {
        if (itemType === "product" && (item as Product).stock <= existing.qty) {
          toast.error("Stok tidak mencukupi");
          return prev;
        }
        return prev.map(c => c.itemId === item.id && c.itemType === itemType ? { ...c, qty: c.qty + 1 } : c);
      }
      if (itemType === "product" && (item as Product).stock <= 0) {
        toast.error("Stok habis");
        return prev;
      }
      return [...prev, { id: crypto.randomUUID(), itemType, itemId: item.id, itemName: item.name, itemPrice: Number(item.price), qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      if (newQty <= 0) return c;
      if (c.itemType === "product") {
        const prod = products.find(p => p.id === c.itemId);
        if (prod && newQty > prod.stock) { toast.error("Stok tidak mencukupi"); return c; }
      }
      return { ...c, qty: newQty };
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));

  const subtotal = cart.reduce((sum, c) => sum + c.itemPrice * c.qty, 0);
  const total = subtotal;
  const change = Math.max(0, (Number(amountPaid) || 0) - total);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(c => ({ itemType: c.itemType, itemId: c.itemId, itemName: c.itemName, itemPrice: String(c.itemPrice), qty: c.qty })),
          total: String(total),
          paymentMethod,
          amountPaid: paymentMethod === "cash" ? Number(amountPaid) : total,
          customerNameSnapshot: customerName || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Gagal memproses"); setProcessing(false); return; }
      setLastTransaction(json.data);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      setCart([]);
      setAmountPaid("");
      fetchProducts();
    } catch { toast.error("Terjadi kesalahan"); } finally { setProcessing(false); }
  };

  if (viewportWidth > 0 && viewportWidth < 1024) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">POS Hanya Desktop</h2>
          <p className="mt-2 text-sm text-gray-500">Silakan buka halaman ini di layar yang lebih besar (minimal 1024px) untuk menggunakan POS.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Left Panel */}
      <div className="flex w-[60%] flex-col">
        <div className="sticky top-0 z-10 bg-slate-50 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari produk atau layanan..." value={search} onChange={e => setSearch(e.target.value)}
              className="block w-full border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div className="mt-2 flex gap-1">
            <button onClick={() => setTab("products")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "products" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>Produk</button>
            <button onClick={() => setTab("services")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "services" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>Layanan</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 pr-2">
            {(tab === "products" ? filteredProducts : filteredServices).map((item) => {
              const isProduct = tab === "products";
              const prod = item as Product;
              const outOfStock = isProduct && prod.stock <= 0;
              return (
                <button key={item.id} onClick={() => addToCart(isProduct ? "product" : "service", item)}
                  disabled={outOfStock}
                  className={`relative rounded-lg border bg-white p-3 text-left transition-all hover:shadow-md hover:border-emerald-300 ${outOfStock ? "opacity-50 pointer-events-none" : ""}`}>
                  {outOfStock && <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40"><span className="text-sm font-bold text-white">Habis</span></div>}
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-600">Rp {Number(item.price).toLocaleString("id-ID")}</p>
                  {isProduct && <p className="mt-0.5 text-xs text-gray-400">Stok: {prod.stock} {prod.unit}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-[40%] flex-col rounded-lg border bg-white shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Keranjang</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p className="text-sm">Keranjang kosong</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.itemName}</p>
                    <p className="text-xs text-gray-500">Rp {c.itemPrice.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(c.id, -1)} className="rounded p-1 hover:bg-gray-100"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-medium">{c.qty}</span>
                    <button onClick={() => updateQty(c.id, 1)} className="rounded p-1 hover:bg-gray-100"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="w-20 text-right text-sm font-medium">Rp {(c.itemPrice * c.qty).toLocaleString("id-ID")}</p>
                  <button onClick={() => removeFromCart(c.id)} className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 space-y-3">
          <input type="text" placeholder="Nama customer (opsional)" value={customerName} onChange={e => setCustomerName(e.target.value)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-emerald-600">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex gap-2">
            {(["cash", "qris", "transfer"] as const).map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${paymentMethod === m ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {m === "cash" ? "Tunai" : m === "qris" ? "QRIS" : "Transfer"}
              </button>
            ))}
          </div>

          <button onClick={() => { if (cart.length > 0) setShowPaymentModal(true); }}
            disabled={cart.length === 0}
            className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Proses Pembayaran
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Pembayaran" size="sm" footer={
        <><button onClick={() => setShowPaymentModal(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        <button onClick={handleCheckout} disabled={processing || (paymentMethod === "cash" && (!amountPaid || Number(amountPaid) < total))}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">{processing ? "Memproses..." : "Konfirmasi Bayar"}</button></>
      }>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Tagihan</p>
            <p className="text-3xl font-bold text-gray-900">Rp {total.toLocaleString("id-ID")}</p>
          </div>
          {paymentMethod === "cash" && (
            <>
              <Input label="Nominal Bayar" type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required />
              {Number(amountPaid) >= total && (
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-sm text-gray-500">Kembalian</p>
                  <p className="text-xl font-bold text-emerald-600">Rp {change.toLocaleString("id-ID")}</p>
                </div>
              )}
              {Number(amountPaid) > 0 && Number(amountPaid) < total && (
                <p className="text-sm text-red-500 text-center">Kurang Rp {(total - Number(amountPaid)).toLocaleString("id-ID")}</p>
              )}
            </>
          )}
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p>Metode: {paymentMethod === "cash" ? "Tunai" : paymentMethod === "qris" ? "QRIS" : "Transfer"}</p>
            <p className="mt-1">Item: {cart.length}</p>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Pembayaran Berhasil" size="md" footer={
        <div className="flex w-full gap-3">
          <button onClick={() => window.print()} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer className="inline h-4 w-4 mr-1" /> Print Struk
          </button>
          <button onClick={() => { setShowSuccessModal(false); setLastTransaction(null); setAmountPaid(""); }}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Transaksi Baru
          </button>
        </div>
      }>
        {lastTransaction && (
          <PrintWrapper paperSize="thermal">
            <div className="text-center space-y-2 p-4">
              <h2 className="text-lg font-bold">VetCare Klinik Hewan</h2>
              <p className="text-xs text-gray-500">Jl. Contoh No. 123, Jakarta</p>
              <p className="text-xs text-gray-500">Telp: 021-12345678</p>
              <hr className="border-dashed" />
              <p className="text-sm font-medium">INVOICE: {lastTransaction.invoiceNo}</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleString("id-ID")}</p>
              <hr className="border-dashed" />
              {cart.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-left flex-1">{c.itemName}</span>
                  <span className="text-right">{c.qty} x Rp {c.itemPrice.toLocaleString("id-ID")}</span>
                  <span className="text-right w-24">Rp {(c.itemPrice * c.qty).toLocaleString("id-ID")}</span>
                </div>
              ))}
              <hr className="border-dashed" />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>Rp {lastTransaction.total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Metode Bayar</span>
                <span>{lastTransaction.paymentMethod === "cash" ? "Tunai" : lastTransaction.paymentMethod === "qris" ? "QRIS" : "Transfer"}</span>
              </div>
              {lastTransaction.paymentMethod === "cash" && (
                <>
                  <div className="flex justify-between text-sm"><span>Bayar</span><span>Rp {lastTransaction.amountPaid.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between text-sm font-bold text-emerald-600"><span>Kembalian</span><span>Rp {lastTransaction.change.toLocaleString("id-ID")}</span></div>
                </>
              )}
              <hr className="border-dashed" />
              <p className="text-xs text-gray-500">Terima kasih!</p>
            </div>
          </PrintWrapper>
        )}
      </Modal>
    </div>
  );
}