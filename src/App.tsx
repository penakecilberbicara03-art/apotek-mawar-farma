/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/Header';
import { PosCashier } from './components/PosCashier';
import { MedicineInventory } from './components/MedicineInventory';
import { ExpiryTracker } from './components/ExpiryTracker';
import { TransactionHistory } from './components/TransactionHistory';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ReceiptModal } from './components/ReceiptModal';
import { SettingsModal } from './components/SettingsModal';
import { Transaction } from './types/pharmacy';

function PharmacyApp() {
  const [activeTab, setActiveTab] = useState<string>('cashier');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { settings, activeRole } = usePharmacy();

  const handleCompleteTransaction = (transaction: Transaction) => {
    setActiveReceipt(transaction);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 selection:bg-rose-500 selection:text-white">
      {/* App Header with Wildan Soleh 3-Role Switcher and Alerts */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={0}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'cashier' && (
          <PosCashier onCompleteTransaction={handleCompleteTransaction} />
        )}

        {activeTab === 'inventory' && <MedicineInventory />}

        {activeTab === 'expiry' && <ExpiryTracker />}

        {activeTab === 'history' && (
          <TransactionHistory onViewReceipt={(tx) => setActiveReceipt(tx)} />
        )}

        {activeTab === 'reports' && (
          <OwnerDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-4 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-white">{settings.pharmacyName}</strong> • {settings.address} (Telp: {settings.phone})
          </div>
          <div>
            Penanggung Jawab: <span className="text-white font-medium">apt. Wildan Soleh, S.Farm.</span> ({settings.sipaNumber})
          </div>
        </div>
      </footer>

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        transaction={activeReceipt}
        settings={settings}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Settings & Database Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PharmacyProvider>
      <PharmacyApp />
    </PharmacyProvider>
  );
}
