import React, { useState } from 'react';
import { X, PackageCheck, AlertCircle } from 'lucide-react';
import { MedicineItem } from '../types/pharmacy';

interface StockAdjustmentModalProps {
  medicine: MedicineItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (id: string, newStock: number, reason: string) => void;
}

const REASONS = [
  'Penerimaan Barang Baru dari PBF / Distributor',
  'Hasil Stock Opname / Penyesuaian Fisik',
  'Obat Rusak / Kemasan Basah atau Pecah',
  'Retur Obat ke PBF Distributor',
  'Karantina Obat Kadaluarsa',
  'Koreksi Salah Input Sebelumnya',
];

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  medicine,
  isOpen,
  onClose,
  onAdjust,
}) => {
  if (!isOpen || !medicine) return null;

  const [mode, setMode] = useState<'set' | 'add' | 'subtract'>('set');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(medicine.stock);
  const [reason, setReason] = useState<string>(REASONS[1]);
  const [customNote, setCustomNote] = useState<string>('');

  const calculateTargetStock = () => {
    const val = Number(adjustmentValue) || 0;
    if (mode === 'set') return Math.max(0, val);
    if (mode === 'add') return medicine.stock + val;
    if (mode === 'subtract') return Math.max(0, medicine.stock - val);
    return medicine.stock;
  };

  const finalStock = calculateTargetStock();
  const diff = finalStock - medicine.stock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullReason = customNote ? `${reason} - ${customNote}` : reason;
    onAdjust(medicine.id, finalStock, fullReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Penyesuaian Stok (Stock Opname)</h3>
              <p className="text-xs text-slate-400">{medicine.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Stock Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Stok Tercatat Sistem:</span>
              <span className="font-bold text-base text-slate-900">
                {medicine.stock} {medicine.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Lokasi:</span>
              <span className="font-medium text-xs text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {medicine.shelfLocation}
              </span>
            </div>
          </div>

          {/* Adjustment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Metode Penyesuaian:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'set', label: 'Ubah Jadi' },
                { id: 'add', label: '+ Tambah' },
                { id: 'subtract', label: '- Kurangi' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as any);
                    if (m.id === 'set') setAdjustmentValue(medicine.stock);
                    else setAdjustmentValue(10);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    mode === m.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {mode === 'set'
                ? `Jumlah Stok Fisik Sebenarnya (${medicine.unit})`
                : mode === 'add'
                ? `Jumlah Unit yang Ditambahkan (${medicine.unit})`
                : `Jumlah Unit yang Dikurangi (${medicine.unit})`}
            </label>
            <input
              type="number"
              min="0"
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Difference Summary */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">Stok Baru Akhir:</span>
            <span className="font-bold text-emerald-800 text-sm">
              {finalStock} {medicine.unit}{' '}
              <span className="text-xs font-normal">
                ({diff >= 0 ? `+${diff}` : diff})
              </span>
            </span>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Penyesuaian:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Note */}
          <div>
            <input
              type="text"
              placeholder="Catatan tambahan (e.g. No. Faktur / Keterangan)"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Simpan Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
