"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, X, Check, CreditCard, Landmark, Smartphone } from "lucide-react";

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
  const [categoryFilter, setCategoryFilter] = useState("");

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

  // Mobile/tablet notice
  if (viewportWidth > 0 && viewportWidth < 1024) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
            <ShoppingCart className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">POS membutuhkan layar lebih besar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Gunakan laptop atau PC dengan resolusi minimal 1024px untuk menggunakan POS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]" style={{ height: "calc(100vh - 64px)" }}>
      {/* Left Panel - Catalog */}
      <div className="flex w-3/5 flex-col border-r border-slate-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-surface-1 px-4 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk atau layanan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setTab("products")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === "products" ? "bg-teal-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Produk
            </button>
            <button
              onClick={() => setTab("services")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === "services" ? "bg-teal-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Layanan
            </button>
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
            {(tab === "products" ? filteredProducts : filteredServices).map((item) => {
              const isProduct = tab === "products";
              const prod = item as Product;
              const outOfStock = isProduct && prod.stock <= 0;
              const isLowStock = isProduct && prod.stock > 0 && prod.stock <= (prod as any).minStock;
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(isProduct ? "product" : "service", item)}
                  disabled={outOfStock}
                  className={`relative rounded-xl border bg-white p-3 text-left transition-all duration-150 hover:border-teal-500 hover:shadow-md hover:scale-[1.02] ${
                    outOfStock ? "opacity-50 cursor-not-allowed" : "border-slate-200"
                  }`}
                >
                  {/* Product image placeholder */}
                  <div className="mx-auto mb-2 flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-slate-100 text-2xl">
                    {isProduct ? "📦" : "🩺"}
                  </div>
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                      <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow">Habis</span>
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="mt-1 text-sm font-bold text-teal-600">Rp {Number(item.price).toLocaleString("id-ID")}</p>
                  {isProduct && (
                    <p className={`mt-0.5 text-xs ${isLowStock ? "text-red-500 font-medium" : "text-slate-400"}`}>
                      Stok: {prod.stock} {prod.unit}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="flex w-2/5 flex-col bg-white">
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Keranjang</h3>
            {cart.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ShoppingCart className="h-16 w-16 mb-3" />
              <p className="text-sm font-medium">Keranjang kosong</p>
              <p className="text-xs mt-1">Pilih produk atau layanan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.itemName}</p>
                    <p className="text-xs text-slate-500">Rp {c.itemPrice.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(c.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex h-7 w-8 items-center justify-center text-sm font-semibold text-slate-900">
                      {c.qty}
                    </span>
                    <button
                      onClick={() => updateQty(c.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="w-24 text-right text-sm font-semibold text-slate-900">
                    Rp {(c.itemPrice * c.qty).toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={() => removeFromCart(c.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-slate-200 px-4 py-4 space-y-3">
          {/* Customer */}
          <input
            type="text"
            placeholder="Nama customer (opsional)"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="block h-10 w-full rounded-lg border border-slate-300 px-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />

          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-900">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">Total</span>
            <span className="text-xl font-bold text-teal-600">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          {/* Payment Method */}
          <div className="flex gap-2">
            {(["cash", "qris", "transfer"] as const).map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-colors ${
                  paymentMethod === m
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m === "cash" ? <CreditCard className="h-4 w-4" /> : m === "qris" ? <Smartphone className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                {m === "cash" ? "Tunai" : m === "qris" ? "QRIS" : "Transfer"}
              </button>
            ))}
          </div>

          {/* Pay Button */}
          <button
            onClick={() => { if (cart.length > 0) setShowPaymentModal(true); }}
            disabled={cart.length === 0}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-lg font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Bayar Rp {total.toLocaleString("id-ID")}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-scale-in">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Pembayaran</h3>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="text-center">
                <p className="text-sm text-slate-500">Total Tagihan</p>
                <p className="text-4xl font-bold text-slate-900 mt-1">Rp {total.toLocaleString("id-ID")}</p>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nominal Bayar</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={e => setAmountPaid(e.target.value)}
                      autoFocus
                      className="block h-12 w-full rounded-xl border border-slate-300 px-4 text-xl text-center font-bold focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="0"
                    />
                  </div>
                  {Number(amountPaid) >= total && (
                    <div className="rounded-xl bg-emerald-50 p-4 text-center">
                      <p className="text-sm text-slate-500">Kembalian</p>
                      <p className="text-2xl font-bold text-emerald-600">Rp {change.toLocaleString("id-ID")}</p>
                    </div>
                  )}
                  {Number(amountPaid) > 0 && Number(amountPaid) < total && (
                    <p className="text-sm text-red-500 text-center">
                      Kurang Rp {(total - Number(amountPaid)).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 space-y-1">
                <p>Metode: {paymentMethod === "cash" ? "Tunai" : paymentMethod === "qris" ? "QRIS" : "Transfer"}</p>
                <p>Item: {cart.length} jenis</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCheckout}
                disabled={processing || (paymentMethod === "cash" && (!amountPaid || Number(amountPaid) < total))}
                className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </span>
                ) : "Konfirmasi Bayar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-scale-in">
            <div className="px-6 py-8 text-center">
              {/* Checkmark animation */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <svg className="h-10 w-10 text-emerald-600 animate-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pembayaran Berhasil!</h3>
              <p className="text-sm text-slate-500 mt-1">Invoice: {lastTransaction.invoiceNo}</p>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-slate-900">Rp {lastTransaction.total.toLocaleString("id-ID")}</span>
                </div>
                {lastTransaction.paymentMethod === "cash" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bayar</span>
                      <span className="font-medium">Rp {lastTransaction.amountPaid.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kembalian</span>
                      <span className="font-bold text-emerald-600">Rp {lastTransaction.change.toLocaleString("id-ID")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Struk
              </button>
              <button
                onClick={() => { setShowSuccessModal(false); setLastTransaction(null); setAmountPaid(""); }}
                className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors"
              >
                + Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}