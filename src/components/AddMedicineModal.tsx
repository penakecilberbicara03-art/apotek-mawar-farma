import React, { useState } from 'react';
import { X, PlusCircle, Save } from 'lucide-react';
import { MedicineItem, MedicineCategory } from '../types/pharmacy';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medicine: Omit<MedicineItem, 'id' | 'salesCount'>) => void;
  existingCount: number;
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

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingCount,
}) => {
  const defaultCode = `MF-${String(existingCount + 1).padStart(3, '0')}`;

  const [formData, setFormData] = useState({
    code: defaultCode,
    name: '',
    genericName: '',
    category: 'Analgesik & Antipiretik' as MedicineCategory,
    dosageForm: 'Tablet',
    unit: 'Strip',
    buyPrice: 5000,
    sellPrice: 7500,
    stock: 50,
    minStock: 10,
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0],
    batchNumber: `BCH-${Math.floor(2500 + Math.random() * 500)}`,
    shelfLocation: 'Rak A-01',
    requiresPrescription: false,
    manufacturer: 'Kimia Farma',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama obat wajib diisi!');
      return;
    }

    onAdd({
      code: formData.code.trim() || defaultCode,
      name: formData.name.trim(),
      genericName: formData.genericName.trim() || formData.name.trim(),
      category: formData.category,
      dosageForm: formData.dosageForm,
      unit: formData.unit,
      buyPrice: Number(formData.buyPrice) || 0,
      sellPrice: Number(formData.sellPrice) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 10,
      expiryDate: formData.expiryDate,
      batchNumber: formData.batchNumber,
      shelfLocation: formData.shelfLocation,
      requiresPrescription: formData.requiresPrescription,
      manufacturer: formData.manufacturer,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Input Data Obat Baru</h3>
              <p className="text-xs text-slate-400">
                Tambahkan obat baru ke master katalog Apotek Mawar Farma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kode Obat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Obat *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Nama Obat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Dagang Obat *
              </label>
              <input
                type="text"
                placeholder="Contoh: Paracetamol 500mg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Nama Generik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Generik / Zat Aktif
              </label>
              <input
                type="text"
                placeholder="Contoh: Paracetamol"
                value={formData.genericName}
                onChange={(e) =>
                  setFormData({ ...formData, genericName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Produsen */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produsen Farmasi
              </label>
              <input
                type="text"
                placeholder="Contoh: Kimia Farma / Kalbe"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Obat
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as MedicineCategory })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
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
                  value={formData.dosageForm}
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
                  value={formData.unit}
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

            {/* Harga Beli & Harga Jual */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Beli / Modal (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={formData.buyPrice}
                onChange={(e) =>
                  setFormData({ ...formData, buyPrice: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Jual (Rp) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.sellPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellPrice: Number(e.target.value) || 0 })
                }
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            {/* Stok Awal & Min Stok */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stok Awal Masuk
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Minimum Stok Menipis
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: Number(e.target.value) || 10 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            {/* Tanggal Kadaluarsa */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Kadaluarsa (Expired Date) *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            {/* Nomor Batch & Lokasi Rak */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Batch
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Rak
                </label>
                <input
                  type="text"
                  value={formData.shelfLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, shelfLocation: e.target.value })
                  }
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Resep Dokter */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.requiresPrescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresPrescription: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">
                  Obat Keras / Harus Dengan Resep Dokter (Tanda K Merah)
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
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
              <span>Simpan Obat Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
