export type UserRole = 'pemilik' | 'manajer' | 'kasir';

export interface UserProfile {
  id: string;
  name: string; // 'Wildan Soleh'
  role: UserRole;
  avatarColor: string;
  badge: string;
  permissions: {
    canSell: boolean;
    canEditMedicine: boolean;
    canAddMedicine: boolean;
    canDeleteMedicine: boolean;
    canAdjustStock: boolean;
    canViewReports: boolean;
    canViewProfit: boolean;
    canEditSettings: boolean;
    canEditTransaction: boolean;
  };
}

export type MedicineCategory =
  | 'Analgesik & Antipiretik'
  | 'Flu, Batuk & Alergi'
  | 'Antibiotik & Antivirus'
  | 'Lambung & Pencernaan'
  | 'Vitamin & Suplemen'
  | 'Mata, Telinga & Hidung'
  | 'Kulit, Jamur & Luka'
  | 'Kardiovaskular & Hipertensi'
  | 'Diabetes & Kolesterol'
  | 'Herbal & Jamu'
  | 'Ibu, Bayi & Anak'
  | 'Alat Kesehatan & P3K';

export interface MedicineItem {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: string; // Tablet, Kaplet, Kapsul, Strip, Sirup/Botol, Salep/Tube, Sachet, Tetes, Pcs
  unit: string; // Strip, Botol, Tube, Box, Tablet, Sachet, Pcs
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  shelfLocation: string; // e.g. "Rak A-01"
  requiresPrescription: boolean;
  description?: string;
  salesCount: number;
  manufacturer?: string;
}

export interface CartItem {
  medicine: MedicineItem;
  quantity: number;
  discountPercent: number; // 0 - 100
  note?: string; // e.g. "3x1 sehari sesudah makan"
  customPrice?: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierName: string;
  cashierRole: UserRole;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal?: number;
  total: number;
  paymentMethod: 'cash' | 'qris' | 'transfer' | 'debit';
  paidAmount: number;
  changeAmount: number;
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
}

export interface PharmacySettings {
  pharmacyName: string;
  ownerName: string;
  managerName: string;
  cashierName: string;
  sipaNumber: string;
  address: string;
  phone: string;
  receiptFooter: string;
  taxPercent: number;
}

export interface ExpiryStatus {
  status: 'expired' | 'critical' | 'warning' | 'safe';
  daysLeft: number;
  label: string;
  colorClass: string;
  badgeBg: string;
}
