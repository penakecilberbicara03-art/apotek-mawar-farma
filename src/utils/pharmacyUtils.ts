import { ExpiryStatus, MedicineItem } from '../types/pharmacy';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeIndo(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function calculateExpiryStatus(expiryDateStr: string): ExpiryStatus {
  if (!expiryDateStr) {
    return {
      status: 'safe',
      daysLeft: 9999,
      label: 'Tidak Diketahui',
      colorClass: 'text-gray-600 bg-gray-100 border-gray-200',
      badgeBg: 'bg-gray-100 text-gray-700',
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'expired',
      daysLeft,
      label: `Kadaluarsa (${Math.abs(daysLeft)} hari lalu)`,
      colorClass: 'text-red-700 bg-red-50 border-red-200',
      badgeBg: 'bg-red-500 text-white',
    };
  }

  if (daysLeft === 0) {
    return {
      status: 'expired',
      daysLeft: 0,
      label: 'Kadaluarsa Hari Ini!',
      colorClass: 'text-red-700 bg-red-100 border-red-300 font-bold',
      badgeBg: 'bg-red-600 text-white',
    };
  }

  if (daysLeft <= 30) {
    return {
      status: 'critical',
      daysLeft,
      label: `Kritis (${daysLeft} hari lagi)`,
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-500 text-white',
    };
  }

  if (daysLeft <= 90) {
    return {
      status: 'warning',
      daysLeft,
      label: `Mendekati (${daysLeft} hari lagi)`,
      colorClass: 'text-yellow-800 bg-yellow-50 border-yellow-200',
      badgeBg: 'bg-yellow-500 text-slate-900',
    };
  }

  return {
    status: 'safe',
    daysLeft,
    label: `Aman (${daysLeft} hari)`,
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-500 text-white',
  };
}

export function getStockStatus(item: MedicineItem): {
  status: 'out' | 'low' | 'good';
  label: string;
  badgeClass: string;
} {
  if (item.stock <= 0) {
    return {
      status: 'out',
      label: 'Habis (0)',
      badgeClass: 'bg-red-100 text-red-700 border border-red-200',
    };
  }
  if (item.stock <= item.minStock) {
    return {
      status: 'low',
      label: `Menipis (${item.stock} ${item.unit})`,
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300',
    };
  }
  return {
    status: 'good',
    label: `${item.stock} ${item.unit}`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MF-${year}${month}${day}-${random}`;
}
