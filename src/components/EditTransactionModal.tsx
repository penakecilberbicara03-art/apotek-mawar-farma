import React, { useState, useEffect } from 'react';
import { X, Save, Edit, AlertCircle } from 'lucide-react';
import { Transaction } from '../types/pharmacy';
import { formatRupiah } from '../utils/pharmacyUtils';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, partial: Partial<Transaction>) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer' | 'debit'>('cash');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'completed' | 'cancelled' | 'refunded'>('completed');

  useEffect(() => {
    if (transaction) {
      setCustomerName(transaction.customerName || '');
      setPaymentMethod(transaction.paymentMethod);
      setNotes(transaction.notes || '');
      setStatus(transaction.status);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(transaction.id, {
      customerName: customerName.trim(),
      paymentMethod,
      notes: notes.trim(),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Edit Data Transaksi / Struk</h3>
              <p className="text-xs text-slate-400">{transaction.invoiceNumber}</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Info Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Total Nilai Transaksi:</span>
              <span className="font-bold text-slate-900">{formatRupiah(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Kasir:</span>
              <span className="font-semibold text-slate-700">
                {transaction.cashierName} ({transaction.cashierRole})
              </span>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Pasien / Pelanggan:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Metode Pembayaran:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
            >
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS</option>
              <option value="transfer">Transfer Bank</option>
              <option value="debit">Kartu Debit</option>
            </select>
          </div>

          {/* Transaction Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Transaksi:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
            >
              <option value="completed">Selesai (Completed)</option>
              <option value="cancelled">Dibatalkan / Void</option>
              <option value="refunded">Direfund / Retur</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Transaksi:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan khusus transaksi..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
