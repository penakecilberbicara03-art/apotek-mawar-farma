import React, { useState } from 'react';
import {
  X,
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Building,
  CheckCircle,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { PharmacySettings } from '../types/pharmacy';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    resetMedicinesToDefault,
    exportDatabase,
    importDatabase,
    currentUser,
  } = usePharmacy();

  const [formData, setFormData] = useState<PharmacySettings>({ ...settings });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    alert('Pengaturan apotek berhasil disimpan!');
    onClose();
  };

  const handleResetData = () => {
    const confirm = window.confirm(
      'PERINGATAN: Ini akan mereset master obat ke 228+ data obat asli bawaan Apotek Mawar Farma. Lanjutkan?'
    );
    if (confirm) {
      resetMedicinesToDefault();
      alert('Katalog obat berhasil direset ke 228+ obat bawaan!');
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabase(content);
        if (success) {
          setImportStatus('Database berhasil diimpor!');
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Gagal membaca file JSON backup.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-base">Pengaturan Apotek & Data</h3>
              <p className="text-xs text-slate-400">{settings.pharmacyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5 text-xs">
          {/* Pharmacy Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-1.5 border-slate-200">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Profil Apotek & Surat Izin Praktik (SIPA)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Apotek:
                </label>
                <input
                  type="text"
                  value={formData.pharmacyName}
                  onChange={(e) =>
                    setFormData({ ...formData, pharmacyName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Telepon:
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Apotek:
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Apoteker Penanggung Jawab:
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor SIPA:
                </label>
                <input
                  type="text"
                  value={formData.sipaNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, sipaNumber: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Pesan Catatan Kaki Struk (Footer):
                </label>
                <input
                  type="text"
                  value={formData.receiptFooter}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptFooter: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Profil</span>
              </button>
            </div>
          </form>

          {/* Backup, Restore & Reset Section */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Cadangan Data & Reset Katalog</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">
                  Export Cadangan (Backup JSON)
                </span>
                <p className="text-[11px] text-slate-500">
                  Simpan seluruh data obat, riwayat penjualan, dan pengaturan ke file JSON.
                </p>
                <button
                  type="button"
                  onClick={exportDatabase}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Import Button */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">
                  Import / Restore Data
                </span>
                <p className="text-[11px] text-slate-500">
                  Pulihkan database dari file JSON backup sebelumnya.
                </p>
                <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih File Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {importStatus && (
                  <p className="text-[11px] text-emerald-700 font-bold text-center">
                    {importStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Reset to 228+ medicines default */}
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-rose-900 block">
                  Reset ke 228+ Obat Asli
                </span>
                <p className="text-[11px] text-rose-700">
                  Kembalikan katalog ke 228+ obat bawaan Apotek Mawar Farma.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
