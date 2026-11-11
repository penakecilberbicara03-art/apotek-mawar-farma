import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Package,
  Edit2,
  Trash2,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { MedicineItem } from '../types/pharmacy';
import {
  calculateExpiryStatus,
  formatDateIndo,
  formatRupiah,
} from '../utils/pharmacyUtils';
import { EditMedicineModal } from './EditMedicineModal';

export const ExpiryTracker: React.FC = () => {
  const { medicines, updateMedicine, adjustStock, stats } = usePharmacy();
  const [filterTab, setFilterTab] = useState<'all_risk' | 'expired' | 'critical' | 'warning' | 'safe'>('all_risk');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);

  // Grouped items
  const categorizedList = useMemo(() => {
    const expired: MedicineItem[] = [];
    const critical: MedicineItem[] = [];
    const warning: MedicineItem[] = [];
    const safe: MedicineItem[] = [];

    medicines.forEach((med) => {
      const exp = calculateExpiryStatus(med.expiryDate);
      if (exp.status === 'expired') expired.push(med);
      else if (exp.status === 'critical') critical.push(med);
      else if (exp.status === 'warning') warning.push(med);
      else safe.push(med);
    });

    return { expired, critical, warning, safe };
  }, [medicines]);

  // Items to display based on tab
  const displayItems = useMemo(() => {
    let list: MedicineItem[] = [];
    if (filterTab === 'all_risk') {
      list = [
        ...categorizedList.expired,
        ...categorizedList.critical,
        ...categorizedList.warning,
      ];
    } else if (filterTab === 'expired') {
      list = categorizedList.expired;
    } else if (filterTab === 'critical') {
      list = categorizedList.critical;
    } else if (filterTab === 'warning') {
      list = categorizedList.warning;
    } else {
      list = categorizedList.safe;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.genericName.toLowerCase().includes(term) ||
          m.code.toLowerCase().includes(term) ||
          m.shelfLocation.toLowerCase().includes(term)
      );
    }

    // Sort by expiry date ascending
    return list.sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  }, [filterTab, categorizedList, searchTerm]);

  // Quick action: Karantina / Tarik dari Rak (Zero stock with reason)
  const handleQuarantine = (med: MedicineItem) => {
    const confirm = window.confirm(
      `Tarik obat "${med.name}" dari rak dan pindahkan ke ruang karantina/retur? Sisa stok (${med.stock} ${med.unit}) akan dinolkan dari kasir.`
    );
    if (confirm) {
      adjustStock(
        med.id,
        0,
        `Ditarik dari rak / Karantina Kadaluarsa (${formatDateIndo(med.expiryDate)})`
      );
    }
  };

  // Quick action: Terapkan Diskon Cuci Gudang 50%
  const handleApplyDiscountPrice = (med: MedicineItem) => {
    const discountedPrice = Math.round((med.sellPrice * 0.5) / 500) * 500;
    const confirm = window.confirm(
      `Aktifkan harga diskon cuci gudang untuk "${med.name}" dari ${formatRupiah(
        med.sellPrice
      )} menjadi ${formatRupiah(discountedPrice)}?`
    );
    if (confirm) {
      updateMedicine(med.id, {
        sellPrice: Math.max(med.buyPrice, discountedPrice),
        description: `${med.description ? med.description + '. ' : ''}[Diskon Cuci Gudang Dekat Kadaluarsa]`,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-amber-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <span>Sistem Pelacakan Kadaluarsa Otomatis</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Otomatis Real-Time
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Pantau masa simpan obat secara presisi untuk menjamin keamanan pasien dan standar BPOM Apotek.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Total Berisiko:</span>
          <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded-lg shadow-xs">
            {stats.expiredCount + stats.criticalCount + stats.warningCount} Obat
          </span>
        </div>
      </div>

      {/* 4 Stat Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Expired */}
        <button
          onClick={() => setFilterTab('expired')}
          className={`p-4 rounded-xl text-left border transition-all ${
            filterTab === 'expired'
              ? 'ring-2 ring-red-500 bg-red-50/70 border-red-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-bold uppercase">Sudah Kadaluarsa</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-red-700">
            {categorizedList.expired.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Harus segera ditarik dari rak apotek
          </p>
        </button>

        {/* Critical < 30 days */}
        <button
          onClick={() => setFilterTab('critical')}
          className={`p-4 rounded-xl text-left border transition-all ${
            filterTab === 'critical'
              ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase">Kritis (&lt; 30 Hari)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-700">
            {categorizedList.critical.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Prioritas jual / diskon cuci gudang
          </p>
        </button>

        {/* Warning 31 - 90 days */}
        <button
          onClick={() => setFilterTab('warning')}
          className={`p-4 rounded-xl text-left border transition-all ${
            filterTab === 'warning'
              ? 'ring-2 ring-yellow-500 bg-yellow-50/70 border-yellow-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between text-yellow-700 mb-1">
            <span className="text-xs font-bold uppercase">Perhatian (31-90 Hari)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-yellow-800">
            {categorizedList.warning.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Mulai pantau & batasi restock baru
          </p>
        </button>

        {/* Safe > 90 days */}
        <button
          onClick={() => setFilterTab('safe')}
          className={`p-4 rounded-xl text-left border transition-all ${
            filterTab === 'safe'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/70 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase">Aman (&gt; 90 Hari)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {categorizedList.safe.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Masa kadaluarsa panjang & aman
          </p>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setFilterTab('all_risk')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === 'all_risk'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Berisiko (
              {categorizedList.expired.length +
                categorizedList.critical.length +
                categorizedList.warning.length}
              )
            </button>
            <button
              onClick={() => setFilterTab('expired')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === 'expired'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-700'
              }`}
            >
              Kadaluarsa ({categorizedList.expired.length})
            </button>
            <button
              onClick={() => setFilterTab('critical')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === 'critical'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
              }`}
            >
              Kritis &lt;30h ({categorizedList.critical.length})
            </button>
            <button
              onClick={() => setFilterTab('warning')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800'
              }`}
            >
              Perhatian 31-90h ({categorizedList.warning.length})
            </button>
            <button
              onClick={() => setFilterTab('safe')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTab === 'safe'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
            >
              Aman ({categorizedList.safe.length})
            </button>
          </div>

          {/* Search */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari obat dalam daftar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Expiry Items List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Obat & Lokasi</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Sisa Stok</th>
                <th className="py-3 px-3">Tgl Kadaluarsa</th>
                <th className="py-3 px-3">Status Hitung Mundur</th>
                <th className="py-3 px-3">Nilai Sisa Stok</th>
                <th className="py-3 px-4 text-center">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayItems.map((med) => {
                const exp = calculateExpiryStatus(med.expiryDate);
                const isExpired = exp.status === 'expired';
                const isCritical = exp.status === 'critical';

                return (
                  <tr
                    key={med.id}
                    className={`transition-colors ${
                      isExpired
                        ? 'bg-red-50/50 hover:bg-red-50'
                        : isCritical
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Nama Obat & Lokasi */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {med.category} •{' '}
                        <span className="font-semibold text-slate-700">
                          {med.shelfLocation}
                        </span>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {med.batchNumber}
                    </td>

                    {/* Sisa Stok */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">
                        {med.stock} {med.unit}
                      </span>
                    </td>

                    {/* Tanggal Kadaluarsa */}
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {formatDateIndo(med.expiryDate)}
                    </td>

                    {/* Status Hitung Mundur */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${exp.badgeBg}`}
                      >
                        {exp.label}
                      </span>
                    </td>

                    {/* Nilai Stok */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {formatRupiah(med.stock * med.buyPrice)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tarik dari rak (Karantina) if expired or critical */}
                        {(isExpired || isCritical) && med.stock > 0 && (
                          <button
                            onClick={() => handleQuarantine(med)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 transition-colors"
                            title="Tarik dari rak / Karantina"
                          >
                            Tarik / Karantina
                          </button>
                        )}

                        {/* Diskon Cuci Gudang if critical or warning */}
                        {!isExpired && med.stock > 0 && (
                          <button
                            onClick={() => handleApplyDiscountPrice(med)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                            title="Terapkan Harga Diskon Cuci Gudang 50%"
                          >
                            Diskon 50%
                          </button>
                        )}

                        {/* Edit Expiry Date / Data - fulfills "sediakan fitur edit" */}
                        <button
                          onClick={() => setEditingMedicine(med)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Edit Tanggal Kadaluarsa"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayItems.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">
              Tidak ada obat dalam kategori ini
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Kondisi masa simpan obat terpantau terkendali dengan baik.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditMedicineModal
        medicine={editingMedicine}
        isOpen={!!editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSave={updateMedicine}
      />
    </div>
  );
};
