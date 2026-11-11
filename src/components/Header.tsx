import React from 'react';
import {
  Store,
  ShieldCheck,
  User,
  Clock,
  AlertTriangle,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Settings,
  Sparkles,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { UserRole } from '../types/pharmacy';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  openSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openSettings,
}) => {
  const { activeRole, setActiveRole, settings, stats } = usePharmacy();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roles: { role: UserRole; title: string; color: string }[] = [
    { role: 'kasir', title: 'Kasir', color: 'from-blue-600 to-indigo-600' },
    { role: 'manajer', title: 'Manajer', color: 'from-emerald-600 to-teal-700' },
    { role: 'pemilik', title: 'Pemilik', color: 'from-rose-600 to-pink-700' },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-rose-100 to-emerald-200 bg-clip-text text-transparent">
                {settings.pharmacyName}
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                Sistem Apotek
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{settings.sipaNumber}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{settings.phone}</span>
            </p>
          </div>
        </div>

        {/* Live Clock & Alerts */}
        <div className="flex items-center gap-3">
          {/* Expiry Alert quick button */}
          {(stats.expiredCount > 0 || stats.criticalCount > 0) && (
            <button
              onClick={() => setActiveTab('expiry')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium border border-red-500/30 transition-all animate-pulse"
              title="Obat kadaluarsa & mendekati kadaluarsa butuh perhatian!"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>
                {stats.expiredCount > 0
                  ? `${stats.expiredCount} Kadaluarsa`
                  : `${stats.criticalCount} Kritis <30h`}
              </span>
            </button>
          )}

          {/* Low stock alert */}
          {stats.lowStockCount > 0 && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-all"
              title="Stok menipis"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.lowStockCount} Stok Tipis</span>
            </button>
          )}

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* User Role Switcher - Wildan Soleh */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 shadow-inner">
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-300 mr-1 border-r border-slate-700">
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-semibold text-white">Wildan Soleh</span>
            </div>

            <div className="flex gap-1">
              {roles.map(({ role, title, color }) => {
                const isActive = activeRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      isActive
                        ? `bg-gradient-to-r ${color} text-white shadow-sm ring-1 ring-white/30`
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title={`Masuk sebagai ${title}: Wildan Soleh`}
                  >
                    {isActive && <ShieldCheck className="w-3 h-3" />}
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings / Info Button */}
          <button
            onClick={openSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Pengaturan & Backup Data"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1.5 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('cashier')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'cashier'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-rose-300" />
              <span>Kasir POS</span>
              {cartCount > 0 && (
                <span className="ml-1 bg-white text-rose-700 font-bold px-1.5 py-0.2 text-[11px] rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-300" />
              <span>Manajemen Stok & Obat ({stats.totalItems})</span>
            </button>

            <button
              onClick={() => setActiveTab('expiry')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'expiry'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Pelacakan Kadaluarsa</span>
              {stats.expiredCount + stats.criticalCount > 0 && (
                <span className="ml-0.5 bg-red-600 text-white font-bold px-1.5 py-0.2 text-[10px] rounded-full animate-pulse">
                  {stats.expiredCount + stats.criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Riwayat Penjualan</span>
            </button>

            {(activeRole === 'pemilik' || activeRole === 'manajer') && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-purple-300" />
                <span>Dashboard & Laporan</span>
              </button>
            )}
          </div>

          {/* Quick role info pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              Aktif: <strong className="text-white">Wildan Soleh</strong> (
              <span className="capitalize text-rose-400 font-semibold">{activeRole}</span>)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
