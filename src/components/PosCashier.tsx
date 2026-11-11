import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  QrCode,
  Tag,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Pill,
  Check,
  Percent,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { CartItem, MedicineCategory, MedicineItem, Transaction } from '../types/pharmacy';
import { calculateExpiryStatus, formatRupiah } from '../utils/pharmacyUtils';

const DOSAGE_PRESETS = [
  '3x1 sehari sesudah makan',
  '3x1 sehari sebelum makan',
  '2x1 sehari sesudah makan (Pagi-Malam)',
  '1x1 sehari sesudah makan (Malam)',
  '1x1 sehari sebelum tidur',
  'Bila demam / nyeri terasa sakit',
  'Bila batuk kambuh',
  'Oleskan tipis 2-3x sehari pada area sakit',
  'Teteskan 1-2 tetes 3x sehari',
  '1 sachet larutkan dalam 200ml air',
];

interface PosCashierProps {
  onCompleteTransaction: (transaction: Transaction) => void;
}

export const PosCashier: React.FC<PosCashierProps> = ({ onCompleteTransaction }) => {
  const { medicines, addTransaction, currentUser } = usePharmacy();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [onlyPrescription, setOnlyPrescription] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [cartDiscountPercent, setCartDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer' | 'debit'>('cash');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [activePresetItemIndex, setActivePresetItemIndex] = useState<number | null>(null);

  // Categories list
  const categories: string[] = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach((m) => set.add(m.category));
    return ['Semua', ...Array.from(set)];
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return medicines.filter((med) => {
      const matchCat =
        selectedCategory === 'Semua' || med.category === selectedCategory;
      const matchPrescription = !onlyPrescription || med.requiresPrescription;
      const matchSearch =
        !term ||
        med.name.toLowerCase().includes(term) ||
        med.genericName.toLowerCase().includes(term) ||
        med.code.toLowerCase().includes(term) ||
        med.shelfLocation.toLowerCase().includes(term);

      return matchCat && matchPrescription && matchSearch;
    });
  }, [medicines, searchTerm, selectedCategory, onlyPrescription]);

  // Add to cart action (Direct Click on medicine button)
  const handleAddToCart = (medicine: MedicineItem) => {
    // Check expiry
    const expiry = calculateExpiryStatus(medicine.expiryDate);
    if (expiry.status === 'expired') {
      const confirmSell = window.confirm(
        `PERINGATAN: Obat "${medicine.name}" telah KADALUARSA (${expiry.label}). Tetap tambahkan ke keranjang?`
      );
      if (!confirmSell) return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.medicine.id === medicine.id);
      if (existingIndex > -1) {
        // Increment quantity if available
        const currentQty = prevCart[existingIndex].quantity;
        if (currentQty >= medicine.stock) {
          alert(`Peringatan: Stok ${medicine.name} hanya tersisa ${medicine.stock} ${medicine.unit}!`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1,
        };
        return updated;
      } else {
        // New item
        if (medicine.stock <= 0) {
          alert(`Stok ${medicine.name} saat ini KOSONG (0)!`);
          return prevCart;
        }
        return [
          ...prevCart,
          {
            medicine,
            quantity: 1,
            discountPercent: 0,
            note: '3x1 sehari sesudah makan',
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = cart[index];
    if (newQty > item.medicine.stock) {
      alert(`Stok tidak mencukupi! Tersisa ${item.medicine.stock} ${item.medicine.unit}`);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateNote = (index: number, note: string) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], note };
      return updated;
    });
  };

  const handleUpdateItemDiscount = (index: number, discountPercent: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], discountPercent: Math.min(100, Math.max(0, discountPercent)) };
      return updated;
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Kosongkan semua item di keranjang kasir?')) {
      setCart([]);
      setPaidAmountInput('');
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const itemPrice = item.medicine.sellPrice;
      const itemDiscount = (itemPrice * item.discountPercent) / 100;
      return acc + (itemPrice - itemDiscount) * item.quantity;
    }, 0);
  }, [cart]);

  const globalDiscountAmount = useMemo(() => {
    return (subtotal * cartDiscountPercent) / 100;
  }, [subtotal, cartDiscountPercent]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - globalDiscountAmount);
  }, [subtotal, globalDiscountAmount]);

  const paidAmount = useMemo(() => {
    if (paymentMethod !== 'cash') return total;
    const num = parseFloat(paidAmountInput.replace(/\D/g, ''));
    return isNaN(num) ? 0 : num;
  }, [paidAmountInput, paymentMethod, total]);

  const changeAmount = useMemo(() => {
    return Math.max(0, paidAmount - total);
  }, [paidAmount, total]);

  // Quick cash buttons
  const setQuickCash = (amount: number) => {
    setPaidAmountInput(String(amount));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang kasir masih kosong. Silakan klik obat terlebih dahulu!');
      return;
    }

    if (paymentMethod === 'cash' && paidAmount < total) {
      alert(`Uang pembayaran kurang! Total belanja: ${formatRupiah(total)}, Diterima: ${formatRupiah(paidAmount)}`);
      return;
    }

    const newTx = addTransaction({
      cashierName: currentUser.name,
      cashierRole: currentUser.role,
      customerName: customerName.trim() || 'Umum (Non-Member)',
      items: cart,
      subtotal,
      discountTotal: globalDiscountAmount,
      total,
      paymentMethod,
      paidAmount: paymentMethod === 'cash' ? paidAmount : total,
      changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
      status: 'completed',
      notes: 'Penjualan langsung kasir',
    });

    // Reset cashier cart
    setCart([]);
    setCustomerName('');
    setCartDiscountPercent(0);
    setPaidAmountInput('');

    // Trigger receipt modal
    onCompleteTransaction(newTx);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Kasir Top Banner / Stats */}
      <div className="mb-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-4 text-white border border-rose-900/40 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <span>Menu Kasir Cepat (Direct-Click POS)</span>
              <span className="text-xs font-normal text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                Katalog {medicines.length} Obat Siap Klik
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Klik pada nama obat untuk langsung menambahkan ke struk belanja.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Petugas Kasir:</span>
          <span className="bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-lg border border-slate-700">
            Wildan Soleh
          </span>
          <span className="bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Main Cashier Layout: Left Grid Catalog, Right Cart Bill */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================
            LEFT COLUMN: Direct Click Medicine Catalog (7 Cols)
            ========================================= */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search and Category Filter Bar */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari obat langsung: Paracetamol, Bodrex, Promag, Amoxicillin, dll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills (Horizontal Scroll) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Prescription toggle and count indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPrescription}
                  onChange={(e) => setOnlyPrescription(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                />
                <span>Hanya Obat Keras / Resep Dokter (Etiket Merah K)</span>
              </label>

              <span>
                Menampilkan <strong>{filteredMedicines.length}</strong> dari{' '}
                <strong>{medicines.length}</strong> obat
              </span>
            </div>
          </div>

          {/* Quick-Click Medicines Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredMedicines.map((med) => {
              const expiry = calculateExpiryStatus(med.expiryDate);
              const inCart = cart.find((it) => it.medicine.id === med.id);
              const isOutOfStock = med.stock <= 0;
              const isExpired = expiry.status === 'expired';

              return (
                <button
                  key={med.id}
                  onClick={() => handleAddToCart(med)}
                  disabled={isOutOfStock}
                  className={`relative text-left p-3 rounded-xl border transition-all flex flex-col justify-between group active:scale-[0.98] ${
                    inCart
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-1 ring-rose-400'
                      : isOutOfStock
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : isExpired
                      ? 'bg-red-50/60 border-red-200 hover:border-red-400 hover:shadow-sm'
                      : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-sm'
                  }`}
                  title={`${med.name} - Klik untuk tambah ke kasir`}
                >
                  {/* Cart Quantity Badge if selected */}
                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold text-[11px] w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                      {inCart.quantity}
                    </span>
                  )}

                  {/* Header: Code & Shelf */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 w-full">
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                      {med.code}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                      {med.shelfLocation}
                    </span>
                  </div>

                  {/* Medicine Name (Highlighted for fast readability) */}
                  <div className="mb-2">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-rose-700 transition-colors">
                      {med.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                      {med.genericName}
                    </p>
                  </div>

                  {/* Price and Stock Status */}
                  <div className="mt-auto pt-2 border-t border-slate-100/80 w-full flex items-end justify-between">
                    <div>
                      <div className="font-bold text-rose-600 text-xs sm:text-sm">
                        {formatRupiah(med.sellPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        per {med.unit}
                      </div>
                    </div>

                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                          Habis
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            med.stock <= med.minStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          Stok: {med.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expiry Warning Pill if critical/expired */}
                  {(isExpired || expiry.status === 'critical') && (
                    <div
                      className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        isExpired
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{expiry.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Tidak ada obat yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">
                Coba gunakan kata kunci pencarian yang lain atau ganti kategori.
              </p>
            </div>
          )}
        </div>

        {/* =========================================
            RIGHT COLUMN: Interactive Kasir Cart / Invoice (5 Cols)
            ========================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4 sticky top-24">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-rose-600" />
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Keranjang Transaksi</h2>
                <p className="text-xs text-slate-400">
                  {cart.length} jenis item ({cart.reduce((a, b) => a + b.quantity, 0)} total obat)
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                title="Kosongkan Keranjang"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Customer Name Input (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Pasien / Pelanggan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Ibu Siti / Umum"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Cart Items List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {cart.map((item, index) => (
              <div
                key={item.medicine.id}
                className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/90 text-xs space-y-2"
              >
                {/* Item title & subtotal */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block leading-tight">
                      {item.medicine.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatRupiah(item.medicine.sellPrice)} / {item.medicine.unit}
                    </span>
                  </div>

                  <span className="font-bold text-slate-900 shrink-0">
                    {formatRupiah(item.quantity * item.medicine.sellPrice)}
                  </span>
                </div>

                {/* Stepper & Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Dosage Note Trigger */}
                  <button
                    onClick={() =>
                      setActivePresetItemIndex(
                        activePresetItemIndex === index ? null : index
                      )
                    }
                    className={`px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 ${
                      item.note
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.note || 'Aturan Pakai'}</span>
                  </button>

                  {/* Delete Item */}
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Dosage Presets Selector Drawer */}
                {activePresetItemIndex === index && (
                  <div className="bg-white p-2.5 rounded-lg border border-rose-200 shadow-inner space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] font-bold text-rose-700 block">
                      Pilih Aturan Pakai (Etiket):
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {DOSAGE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            handleUpdateNote(index, preset);
                            setActivePresetItemIndex(null);
                          }}
                          className={`text-left px-2 py-1 rounded text-[11px] transition-colors ${
                            item.note === preset
                              ? 'bg-rose-600 text-white font-semibold'
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-700'
                          }`}
                        >
                          • {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Atau ketik aturan pakai kustom..."
                      value={item.note || ''}
                      onChange={(e) => handleUpdateNote(index, e.target.value)}
                      className="w-full text-[11px] px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 mt-1"
                    />
                  </div>
                )}
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Keranjang Masih Kosong</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik nama obat di sebelah kiri untuk memasukkannya ke nota kasir.
                </p>
              </div>
            )}
          </div>

          {/* Pricing & Discount Controls */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              {/* Global Discount */}
              <div className="flex items-center justify-between">
                <label className="text-slate-600 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-slate-400" />
                  <span>Diskon Transaksi (%):</span>
                </label>
                <div className="flex items-center gap-1">
                  {[0, 5, 10].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setCartDiscountPercent(pct)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cartDiscountPercent === pct
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cartDiscountPercent}
                    onChange={(e) =>
                      setCartDiscountPercent(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className="w-12 text-center py-0.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* Subtotal & Discount rows */}
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {globalDiscountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Potongan Diskon ({cartDiscountPercent}%):</span>
                  <span>-{formatRupiah(globalDiscountAmount)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-center py-2 border-y border-slate-200 text-sm font-bold text-slate-900">
                <span>TOTAL AKHIR:</span>
                <span className="text-xl text-rose-600">{formatRupiah(total)}</span>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-1 space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'cash', label: 'Tunai', icon: DollarSign },
                    { id: 'qris', label: 'QRIS', icon: QrCode },
                    { id: 'transfer', label: 'Transfer', icon: CreditCard },
                    { id: 'debit', label: 'Debit', icon: CreditCard },
                  ].map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => {
                          setPaymentMethod(pm.id as any);
                          if (pm.id !== 'cash') {
                            setPaidAmountInput(String(total));
                          }
                        }}
                        className={`flex flex-col items-center py-1.5 px-1 rounded-lg border text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-0.5" />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Input & Quick Cash Buttons */}
              {paymentMethod === 'cash' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 font-medium">Uang Diterima:</span>
                    <input
                      type="number"
                      placeholder="Rp..."
                      value={paidAmountInput}
                      onChange={(e) => setPaidAmountInput(e.target.value)}
                      className="w-32 text-right px-2 py-1 font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-1 justify-end">
                    <button
                      onClick={() => setQuickCash(total)}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Uang Pas
                    </button>
                    {[10000, 20000, 50000, 100000, 200000].map((amt) => {
                      if (amt < total && total > 200000) return null;
                      return (
                        <button
                          key={amt}
                          onClick={() => setQuickCash(amt)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          {amt / 1000}rb
                        </button>
                      );
                    })}
                  </div>

                  {/* Kembalian */}
                  <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-100">
                    <span className="text-slate-600">Kembalian:</span>
                    <span
                      className={`text-sm font-bold ${
                        paidAmount < total
                          ? 'text-red-500'
                          : 'text-emerald-600'
                      }`}
                    >
                      {paidAmount < total
                        ? `Kurang ${formatRupiah(total - paidAmount)}`
                        : formatRupiah(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Final Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={paymentMethod === 'cash' && paidAmount < total}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>Bayar & Cetak Struk ({formatRupiah(total)})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
