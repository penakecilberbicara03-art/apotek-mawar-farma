import React, { useRef } from 'react';
import {
  Printer,
  X,
  CheckCircle,
  Copy,
  Download,
  Share2,
} from 'lucide-react';
import { Transaction, PharmacySettings } from '../types/pharmacy';
import { formatDateTimeIndo, formatRupiah } from '../utils/pharmacyUtils';

interface ReceiptModalProps {
  transaction: Transaction | null;
  settings: PharmacySettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  settings,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!transaction) return;
    const lines = [
      `==============================`,
      `       ${settings.pharmacyName.toUpperCase()}`,
      `   ${settings.address}`,
      `   Telp: ${settings.phone}`,
      `   ${settings.sipaNumber}`,
      `==============================`,
      `No. Struk : ${transaction.invoiceNumber}`,
      `Waktu     : ${formatDateTimeIndo(transaction.date)}`,
      `Kasir     : ${transaction.cashierName} (${transaction.cashierRole})`,
      transaction.customerName ? `Pelanggan : ${transaction.customerName}` : '',
      `Metode    : ${transaction.paymentMethod.toUpperCase()}`,
      `------------------------------`,
      ...transaction.items.map(
        (it) =>
          `${it.medicine.name}\n  ${it.quantity} x ${formatRupiah(it.medicine.sellPrice)} = ${formatRupiah(it.quantity * it.medicine.sellPrice)}${it.note ? `\n  [Aturan: ${it.note}]` : ''}`
      ),
      `------------------------------`,
      `Subtotal  : ${formatRupiah(transaction.subtotal)}`,
      transaction.discountTotal > 0
        ? `Diskon    : -${formatRupiah(transaction.discountTotal)}`
        : '',
      `TOTAL     : ${formatRupiah(transaction.total)}`,
      `Bayar     : ${formatRupiah(transaction.paidAmount)}`,
      `Kembali   : ${formatRupiah(transaction.changeAmount)}`,
      `==============================`,
      `      ${settings.receiptFooter}`,
      `==============================`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Struk Transaksi Selesai</h3>
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

        {/* Thermal Receipt Paper Container */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 flex-1 flex justify-center">
          <div
            ref={receiptRef}
            className="receipt-paper w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-slate-800 font-mono text-xs leading-relaxed"
          >
            {/* Pharmacy Branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-bold text-base tracking-wide text-slate-900">
                {settings.pharmacyName}
              </h2>
              <p className="text-[11px] text-slate-600 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-slate-600">Telp: {settings.phone}</p>
              <p className="text-[10px] text-slate-500 mt-1">{settings.sipaNumber}</p>
              <p className="text-[10px] text-slate-500">
                Apoteker: {settings.ownerName}
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Invoice:</span>
                <span className="font-semibold text-slate-900">
                  {transaction.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span>{formatDateTimeIndo(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>
                  {transaction.cashierName} ({transaction.cashierRole})
                </span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span className="font-semibold text-slate-900">
                    {transaction.customerName}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="uppercase font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                  {transaction.paymentMethod}
                </span>
              </div>
            </div>

            {/* Itemized medicines */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                <span>Nama Item</span>
                <span>Total</span>
              </div>
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-slate-900 font-semibold text-[11px]">
                    <span className="truncate pr-2">{item.medicine.name}</span>
                    <span className="shrink-0">
                      {formatRupiah(item.quantity * item.medicine.sellPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      {item.quantity} x {formatRupiah(item.medicine.sellPrice)}
                      {item.discountPercent > 0 && ` (-${item.discountPercent}%)`}
                    </span>
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-rose-700 bg-rose-50 px-1 py-0.5 rounded italic">
                      Aturan: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Bayar:</span>
                <span>{formatRupiah(transaction.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>
            </div>

            {/* Barcode Mock & Footer Note */}
            <div className="text-center pt-3 space-y-2">
              <div className="inline-block py-1 px-3 bg-slate-100 rounded text-[9px] text-slate-500 tracking-widest font-mono border border-slate-200">
                |||||| | |||||||||| |||| | ||||||||
              </div>
              <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto leading-normal">
                "{settings.receiptFooter}"
              </p>
              <p className="text-[9px] text-slate-400">
                Layanan Konsultasi Obat: {settings.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
