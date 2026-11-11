import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Printer,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Transaction } from '../types/pharmacy';
import { formatDateTimeIndo, formatRupiah } from '../utils/pharmacyUtils';
import { EditTransactionModal } from './EditTransactionModal';

interface TransactionHistoryProps {
  onViewReceipt: (transaction: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onViewReceipt,
}) => {
  const { transactions, updateTransaction, deleteTransaction, currentUser } =
    usePharmacy();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return transactions.filter((tx) => {
      const matchStatus =
        statusFilter === 'all' || tx.status === statusFilter;
      const matchSearch =
        !term ||
        tx.invoiceNumber.toLowerCase().includes(term) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(term)) ||
        tx.paymentMethod.toLowerCase().includes(term) ||
        tx.items.some((it) => it.medicine.name.toLowerCase().includes(term));

      return matchStatus && matchSearch;
    });
  }, [transactions, searchTerm, statusFilter]);

  const totalOmzet = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.total, 0);
  }, [filteredTransactions]);

  const handleDelete = (tx: Transaction) => {
    if (!currentUser.permissions.canDeleteMedicine && currentUser.role === 'kasir') {
      alert('Akses ditolak: Hanya Manajer dan Pemilik yang dapat menghapus riwayat transaksi.');
      return;
    }
    if (
      window.confirm(
        `Yakin ingin menghapus permanen data transaksi ${tx.invoiceNumber}?`
      )
    ) {
      deleteTransaction(tx.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Riwayat Transaksi Penjualan Apotek</span>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {transactions.length} Total Transaksi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh nota penjualan, cetak ulang struk, dan koreksi/edit data transaksi.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Total Omzet Filter:</span>
          <span className="text-xl font-bold text-slate-900">
            {formatRupiah(totalOmzet)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari no. invoice, nama pelanggan, obat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Selesai (
            {transactions.filter((t) => t.status === 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 hover:bg-red-100 text-red-800'
            }`}
          >
            Dibatalkan (
            {transactions.filter((t) => t.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">No. Invoice & Waktu</th>
                <th className="py-3 px-3">Kasir</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-4">Daftar Obat yang Dibeli</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3">Total Belanja</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi (Cetak/Edit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  {/* Invoice & Date */}
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-900 block">
                      {tx.invoiceNumber}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatDateTimeIndo(tx.date)}
                    </span>
                  </td>

                  {/* Kasir */}
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 block">
                      {tx.cashierName}
                    </span>
                    <span className="text-[10px] uppercase text-slate-400">
                      {tx.cashierRole}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {tx.customerName || 'Umum'}
                  </td>

                  {/* Medicines purchased */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="space-y-0.5">
                      {tx.items.slice(0, 3).map((it, i) => (
                        <div key={i} className="truncate text-[11px] text-slate-600">
                          • {it.quantity}x {it.medicine.name}
                        </div>
                      ))}
                      {tx.items.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{tx.items.length - 3} obat lainnya...
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3 px-3">
                    <span className="uppercase font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {tx.paymentMethod}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {formatRupiah(tx.total)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.status === 'completed' ? 'Selesai' : 'Batal'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View & Re-print Receipt */}
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors"
                        title="Lihat & Cetak Ulang Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>

                      {/* Edit Transaction - fulfills "sediakan fitur edit" */}
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                        title="Edit Data Transaksi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete (Manajer / Pemilik) */}
                      {currentUser.role !== 'kasir' && (
                        <button
                          onClick={() => handleDelete(tx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 mt-1">
              Transaksi yang diproses di menu Kasir POS akan tampil di sini.
            </p>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTx}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        onSave={updateTransaction}
      />
    </div>
  );
};
