import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, AlertCircle, Percent } from 'lucide-react';
import { MedicineItem, MedicineCategory } from '../types/pharmacy';
import { formatRupiah } from '../utils/pharmacyUtils';

interface EditMedicineModalProps {
  medicine: MedicineItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: Partial<MedicineItem>) => void;
}

const CATEGORIES: MedicineCategory[] = [
  'Analgesik & Antipiretik',
  'Flu, Batuk & Alergi',
  'Antibiotik & Antivirus',
  'Lambung & Pencernaan',
  'Vitamin & Suplemen',
  'Mata, Telinga & Hidung',
  'Kulit, Jamur & Luka',
  'Kardiovaskular & Hipertensi',
  'Diabetes & Kolesterol',
  'Herbal & Jamu',
  'Ibu, Bayi & Anak',
  'Alat Kesehatan & P3K',
];

const DOSAGE_FORMS = [
  'Tablet',
  'Kaplet',
  'Kapsul',
  'Strip',
  'Sirup/Botol',
  'Salep/Tube',
  'Sachet',
  'Tetes',
  'Box',
  'Pcs',
];

const UNITS = ['Strip', 'Botol', 'Tube', 'Box', 'Tablet', 'Sachet', 'Pcs'];

export const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  medicine,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<MedicineItem>>({});

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        dosageForm: medicine.dosageForm,
        unit: medicine.unit,
        buyPrice: medicine.buyPrice,
        sellPrice: medicine.sellPrice,
        stock: medicine.stock,
        minStock: medicine.minStock,
        expiryDate: medicine.expiryDate,
        batchNumber: medicine.batchNumber,
        shelfLocation: medicine.shelfLocation,
        requiresPrescription: medicine.requiresPrescription,
        manufacturer: medicine.manufacturer,
      });
    }
  }, [medicine]);

  if (!isOpen || !medicine) return null;

  const buy = Number(formData.buyPrice) || 0;
  const sell = Number(formData.sellPrice) || 0;
  const profitMargin = buy > 0 ? (((sell - buy) / buy) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Nama obat tidak boleh kosong!');
      return;
    }
    if ((formData.sellPrice || 0) < 0) {
      alert('Harga jual tidak boleh minus!');
      return;
    }

    onSave(medicine.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Edit Data Obat Farmasi</h3>
              <p className="text-xs text-slate-400">Kode: {medicine.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Obat */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Dagang Obat *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Nama Generik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Komposisi / Nama Generik
              </label>
              <input
                type="text"
                value={formData.genericName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, genericName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Produsen / Pabrik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produsen / Industri Farmasi
              </label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Obat
              </label>
              <select
                value={formData.category || 'Analgesik & Antipiretik'}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as MedicineCategory })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Bentuk & Satuan */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bentuk Sediaan
                </label>
                <select
                  value={formData.dosageForm || 'Tablet'}
                  onChange={(e) =>
                    setFormData({ ...formData, dosageForm: e.target.value })
                  }
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {DOSAGE_FORMS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan Jual
                </label>
                <select
                  value={formData.unit || 'Strip'}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Harga Beli */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Modal Beli (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={formData.buyPrice ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, buyPrice: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Harga Jual & Margin */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Harga Jual Apotek (Rp)
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Margin: +{profitMargin}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={formData.sellPrice ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, sellPrice: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Stok Sekarang */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Stok Saat Ini ({formData.unit || 'Unit'})
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Minimum Stok Alert */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Minimum Stok Menipis
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStock ?? 10}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: Number(e.target.value) || 10 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Tanggal Kadaluarsa (Expired Date) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Kadaluarsa (Expired Date) *
              </label>
              <input
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* No. Batch & Rak */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Batch
                </label>
                <input
                  type="text"
                  value={formData.batchNumber || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Rak Obat
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rak A-02"
                  value={formData.shelfLocation || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, shelfLocation: e.target.value })
                  }
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Prescription Toggle */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.requiresPrescription || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresPrescription: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">
                  Obat Keras / Harus Menggunakan Resep Dokter (Lingkaran Merah Huruf K)
                </span>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Obat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
