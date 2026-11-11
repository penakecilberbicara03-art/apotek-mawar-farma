import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Award,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatRupiah } from '../utils/pharmacyUtils';

export const OwnerDashboard: React.FC = () => {
  const { medicines, transactions, stats, settings, activeRole } = usePharmacy();

  // Top 10 Best Seller Medicines
  const topSellers = useMemo(() => {
    return [...medicines]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 10);
  }, [medicines]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; totalStock: number; value: number }>();
    medicines.forEach((med) => {
      const existing = map.get(med.category) || { count: 0, totalStock: 0, value: 0 };
      map.set(med.category, {
        count: existing.count + 1,
        totalStock: existing.totalStock + med.stock,
        value: existing.value + med.stock * med.sellPrice,
      });
    });
    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      ...data,
    }));
  }, [medicines]);

  // Overall Financial Calculations
  const allTimeSales = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'completed')
      .reduce((acc, t) => acc + t.total, 0);
  }, [transactions]);

  const allTimeProfit = useMemo(() => {
    let profit = 0;
    transactions
      .filter((t) => t.status === 'completed')
      .forEach((tx) => {
        let cost = 0;
        tx.items.forEach((it) => {
          cost += (it.medicine.buyPrice || 0) * it.quantity;
        });
        profit += Math.max(0, tx.total - cost);
      });
    return profit;
  }, [transactions]);

  const potentialProfitOnInventory = stats.totalInventoryValueSell - stats.totalInventoryValueBuy;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-white">
                Dashboard Eksekutif & Finansial
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Mode: {activeRole.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Laporan performa omzet penjualan, marjin laba bersih apotek, dan audit nilai aset obat.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 text-right">
          <span className="text-[11px] text-slate-400 block">Penanggung Jawab Apoteker:</span>
          <span className="font-bold text-sm text-white">Wildan Soleh</span>
          <span className="text-[10px] text-purple-300 block">{settings.sipaNumber}</span>
        </div>
      </div>

      {/* 4 Main Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1">
            <span>Omzet Hari Ini</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatRupiah(stats.todaySales)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{stats.todayTxCount} transaksi hari ini</span>
            <span className="text-emerald-600 font-semibold">Aktif</span>
          </div>
        </div>

        {/* Laba Kotor Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1">
            <span>Estimasi Laba Kotor Hari Ini</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">
            {formatRupiah(stats.todayProfit)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Marjin rata-rata</span>
            <span className="text-purple-600 font-semibold">
              {stats.todaySales > 0
                ? `${((stats.todayProfit / stats.todaySales) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Total Nilai Aset Stok */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1">
            <span>Nilai Aset Stok (Jual)</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 truncate">
            {formatRupiah(stats.totalInventoryValueSell)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Modal: {formatRupiah(stats.totalInventoryValueBuy)}</span>
            <span className="text-blue-600 font-semibold">
              +{((potentialProfitOnInventory / (stats.totalInventoryValueBuy || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Total Omzet Akumulatif */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1">
            <span>Total Akumulasi Omzet</span>
            <ShoppingCart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 truncate">
            {formatRupiah(allTimeSales)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Akumulasi Laba:</span>
            <span className="text-rose-600 font-bold">{formatRupiah(allTimeProfit)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Left Top Sellers, Right Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top 10 Best Seller Medicines (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">
                10 Obat Terlaris (Top Selling Medicines)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Berdasarkan total penjualan</span>
          </div>

          <div className="space-y-2.5">
            {topSellers.map((med, index) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] ${
                      index === 0
                        ? 'bg-amber-400 text-slate-900 shadow-xs'
                        : index === 1
                        ? 'bg-slate-300 text-slate-900'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {med.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {med.category} • {formatRupiah(med.sellPrice)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">
                    {med.salesCount || 0} Terjual
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Sisa Stok: {med.stock} {med.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Distribusi Inventaris Kategori
              </h3>
            </div>
            <span className="text-xs text-slate-400">12 Kategori</span>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 text-xs">
            {categoryStats.map((cat) => (
              <div
                key={cat.category}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1"
              >
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <span>{cat.category}</span>
                  <span className="font-mono text-slate-900">
                    {formatRupiah(cat.value)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{cat.count} Macam Obat</span>
                  <span>{cat.totalStock.toLocaleString('id-ID')} Total Stok</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
