import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  MedicineItem,
  PharmacySettings,
  Transaction,
  UserProfile,
  UserRole,
} from '../types/pharmacy';
import {
  INITIAL_MEDICINES,
  INITIAL_SETTINGS,
  USER_PROFILES,
} from '../data/initialMedicines';
import { calculateExpiryStatus, generateInvoiceNumber } from '../utils/pharmacyUtils';

interface PharmacyContextType {
  medicines: MedicineItem[];
  transactions: Transaction[];
  activeRole: UserRole;
  currentUser: UserProfile;
  settings: PharmacySettings;
  setActiveRole: (role: UserRole) => void;
  addMedicine: (medicine: Omit<MedicineItem, 'id' | 'salesCount'>) => MedicineItem;
  updateMedicine: (id: string, partial: Partial<MedicineItem>) => void;
  deleteMedicine: (id: string) => void;
  adjustStock: (id: string, newStock: number, reason?: string) => void;
  addTransaction: (txData: Omit<Transaction, 'id' | 'invoiceNumber' | 'date'>) => Transaction;
  updateTransaction: (id: string, partial: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  resetMedicinesToDefault: () => void;
  updateSettings: (newSettings: Partial<PharmacySettings>) => void;
  exportDatabase: () => void;
  importDatabase: (jsonString: string) => boolean;
  stats: {
    totalItems: number;
    totalStockUnits: number;
    expiredCount: number;
    criticalCount: number;
    warningCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    todaySales: number;
    todayProfit: number;
    todayTxCount: number;
    totalInventoryValueBuy: number;
    totalInventoryValueSell: number;
  };
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

const STORAGE_MEDICINES_KEY = 'mawar_farma_medicines_v2';
const STORAGE_TRANSACTIONS_KEY = 'mawar_farma_transactions_v2';
const STORAGE_ROLE_KEY = 'mawar_farma_role_v2';
const STORAGE_SETTINGS_KEY = 'mawar_farma_settings_v2';

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEDICINES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 200) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved medicines', e);
    }
    return INITIAL_MEDICINES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved transactions', e);
    }
    // Initial sample transaction for demonstration
    const sampleTx: Transaction = {
      id: 'tx-init-01',
      invoiceNumber: 'MF-261111-8842',
      date: new Date().toISOString(),
      cashierName: 'Wildan Soleh',
      cashierRole: 'kasir',
      customerName: 'Ibu Ratna',
      items: [
        {
          medicine: INITIAL_MEDICINES[0], // Paracetamol
          quantity: 2,
          discountPercent: 0,
          note: '3x1 tablet sesudah makan',
        },
        {
          medicine: INITIAL_MEDICINES[3], // Bodrex
          quantity: 1,
          discountPercent: 0,
          note: 'Bila sakit kepala kambuh',
        },
      ],
      subtotal: 16000,
      discountTotal: 0,
      total: 16000,
      paymentMethod: 'cash',
      paidAmount: 20000,
      changeAmount: 4000,
      status: 'completed',
      notes: 'Pelanggan reguler',
    };
    return [sampleTx];
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLE_KEY) as UserRole;
      if (saved && ['pemilik', 'manajer', 'kasir'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'kasir';
  });

  const [settings, setSettings] = useState<PharmacySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEDICINES_KEY, JSON.stringify(medicines));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROLE_KEY, activeRole);
    } catch {}
  }, [activeRole]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const currentUser = useMemo(() => {
    return USER_PROFILES[activeRole] || USER_PROFILES.kasir;
  }, [activeRole]);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
  };

  const addMedicine = (data: Omit<MedicineItem, 'id' | 'salesCount'>): MedicineItem => {
    const newId = `MED-${String(Date.now()).slice(-6)}`;
    const newItem: MedicineItem = {
      ...data,
      id: newId,
      salesCount: 0,
    };
    setMedicines((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateMedicine = (id: string, partial: Partial<MedicineItem>) => {
    setMedicines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const deleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((item) => item.id !== id));
  };

  const adjustStock = (id: string, newStock: number, reason?: string) => {
    setMedicines((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            stock: Math.max(0, newStock),
            description: reason
              ? `${item.description ? item.description + '. ' : ''}[Penyesuaian stok: ${newStock} (${reason})]`
              : item.description,
          };
        }
        return item;
      })
    );
  };

  const addTransaction = (
    txData: Omit<Transaction, 'id' | 'invoiceNumber' | 'date'>
  ): Transaction => {
    const invoiceNumber = generateInvoiceNumber();
    const newTransaction: Transaction = {
      ...txData,
      id: `TX-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      cashierName: 'Wildan Soleh',
      cashierRole: activeRole,
    };

    // Deduct medicine stock and increment sales count
    setMedicines((prev) =>
      prev.map((med) => {
        const soldItem = txData.items.find((it) => it.medicine.id === med.id);
        if (soldItem) {
          const newStock = Math.max(0, med.stock - soldItem.quantity);
          const newSalesCount = (med.salesCount || 0) + soldItem.quantity;
          return {
            ...med,
            stock: newStock,
            salesCount: newSalesCount,
          };
        }
        return med;
      })
    );

    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = (id: string, partial: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...partial } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const resetMedicinesToDefault = () => {
    setMedicines(INITIAL_MEDICINES);
    localStorage.removeItem(STORAGE_MEDICINES_KEY);
  };

  const updateSettings = (newSettings: Partial<PharmacySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const exportDatabase = () => {
    const data = {
      appName: 'Apotek Mawar Farma',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      medicines,
      transactions,
      settings,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-apotek-mawar-farma-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.medicines)) {
        setMedicines(data.medicines);
      }
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // Compute live statistics
  const stats = useMemo(() => {
    let expiredCount = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;
    let totalInventoryValueBuy = 0;
    let totalInventoryValueSell = 0;

    medicines.forEach((med) => {
      totalStockUnits += med.stock;
      totalInventoryValueBuy += med.stock * med.buyPrice;
      totalInventoryValueSell += med.stock * med.sellPrice;

      if (med.stock === 0) {
        outOfStockCount++;
      } else if (med.stock <= med.minStock) {
        lowStockCount++;
      }

      const exp = calculateExpiryStatus(med.expiryDate);
      if (exp.status === 'expired') {
        expiredCount++;
      } else if (exp.status === 'critical') {
        criticalCount++;
      } else if (exp.status === 'warning') {
        warningCount++;
      }
    });

    // Today's transaction stats
    const today = new Date().toDateString();
    let todaySales = 0;
    let todayProfit = 0;
    let todayTxCount = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date).toDateString();
      if (txDate === today && tx.status === 'completed') {
        todaySales += tx.total;
        todayTxCount++;

        // Calculate approximate gross profit based on buy price of items
        let costTotal = 0;
        tx.items.forEach((item) => {
          costTotal += (item.medicine.buyPrice || 0) * item.quantity;
        });
        todayProfit += Math.max(0, tx.total - costTotal);
      }
    });

    return {
      totalItems: medicines.length,
      totalStockUnits,
      expiredCount,
      criticalCount,
      warningCount,
      lowStockCount,
      outOfStockCount,
      todaySales,
      todayProfit,
      todayTxCount,
      totalInventoryValueBuy,
      totalInventoryValueSell,
    };
  }, [medicines, transactions]);

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        transactions,
        activeRole,
        currentUser,
        settings,
        setActiveRole,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        adjustStock,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        resetMedicinesToDefault,
        updateSettings,
        exportDatabase,
        importDatabase,
        stats,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
