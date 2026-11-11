import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  PackageCheck,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pill,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { MedicineItem, MedicineCategory } from '../types/pharmacy';
import {
  calculateExpiryStatus,
  formatDateIndo,
  formatRupiah,
  getStockStatus,
} from '../utils/pharmacyUtils';
import { EditMedicineModal } from './EditMedicineModal';
import { AddMedicineModal } from './AddMedicineModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';

export const MedicineInventory: React.FC = () => {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    adjustStock,
    currentUser,
    stats,
  } = usePharmacy();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'safe'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'critical' | 'safe'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'expiry' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);
  const [adjustingMedicine, setAdjustingMedicine] = useState<MedicineItem | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach((m) => set.add(m.category));
    return ['Semua', ...Array.from(set)];
  }, [medicines]);

  // Filtered & Sorted items
  const filteredMedicines = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return medicines
      .filter((med) => {
        const matchCategory =
          selectedCategory === 'Semua' || med.category === selectedCategory;

        const matchSearch =
          !term ||
          med.name.toLowerCase().includes(term) ||
          med.genericName.toLowerCase().includes(term) ||
          med.code.toLowerCase().includes(term) ||
          med.shelfLocation.toLowerCase().includes(term) ||
          med.batchNumber.toLowerCase().includes(term);

        // Stock filter
        let matchStock = true;
        if (stockFilter === 'out') matchStock = med.stock <= 0;
        else if (stockFilter === 'low') matchStock = med.stock > 0 && med.stock <= med.minStock;
        else if (stockFilter === 'safe') matchStock = med.stock > med.minStock;

        // Expiry filter
        let matchExpiry = true;
        const exp = calculateExpiryStatus(med.expiryDate);
        if (expiryFilter === 'expired') matchExpiry = exp.status === 'expired';
        else if (expiryFilter === 'critical')
          matchExpiry = exp.status === 'critical' || exp.status === 'expired';
        else if (expiryFilter === 'safe') matchExpiry = exp.status === 'safe';

        return matchCategory && matchSearch && matchStock && matchExpiry;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'stock') diff = a.stock - b.stock;
        else if (sortBy === 'price') diff = a.sellPrice - b.sellPrice;
        else if (sortBy === 'expiry')
          diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [
    medicines,
    searchTerm,
    selectedCategory,
    stockFilter,
    expiryFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(start, start + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    const headers = [
      'Kode',
      'Nama Obat',
      'Nama Generik',
      'Kategori',
      'Bentuk',
      'Satuan',
      'Harga Beli',
      'Harga Jual',
      'Stok',
      'Tgl Kadaluarsa',
      'No Batch',
      'Lokasi Rak',
    ];
    const rows = medicines.map((m) => [
      `"${m.code}"`,
      `"${m.name}"`,
      `"${m.genericName}"`,
      `"${m.category}"`,
      `"${m.dosageForm}"`,
      `"${m.unit}"`,
      m.buyPrice,
      m.sellPrice,
      m.stock,
      m.expiryDate,
      `"${m.batchNumber}"`,
      `"${m.shelfLocation}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `katalog-obat-mawar-farma-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (med: MedicineItem) => {
    if (!currentUser.permissions.canDeleteMedicine) {
      alert('Akses ditolak: Hanya Pemilik yang dapat menghapus data obat.');
      return;
    }
    if (
      window.confirm(
        `Yakin ingin menghapus obat "${med.name}" (${med.code}) dari katalog master? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      deleteMedicine(med.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Manajemen Stok & Input Data Obat</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {medicines.length} Item Terdaftar
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola inventaris obat, perbarui harga, sesuaikan stok fisik, dan input obat baru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Download CSV Katalog Obat"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {(currentUser.permissions.canAddMedicine || currentUser.role !== 'kasir') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Input Obat Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Macam Obat:</span>
          <span className="text-xl font-bold text-slate-900">{stats.totalItems}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {stats.totalStockUnits.toLocaleString('id-ID')} unit stok fisik
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Stok Menipis:</span>
          <span
            className={`text-xl font-bold ${
              stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {stats.lowStockCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {stats.outOfStockCount} obat habis (0)
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Kadaluarsa / Kritis:</span>
          <span
            className={`text-xl font-bold ${
              stats.expiredCount > 0 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {stats.expiredCount + stats.criticalCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {stats.expiredCount} kadaluarsa, {stats.criticalCount} &lt;30 hari
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Nilai Aset Apotek:</span>
          <span className="text-lg font-bold text-emerald-700 truncate block">
            {formatRupiah(stats.totalInventoryValueSell)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Modal Beli: {formatRupiah(stats.totalInventoryValueBuy)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama obat, generik, kode, batch, rak..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Kategori: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Stok: Semua</option>
              <option value="low">Stok: Menipis</option>
              <option value="out">Stok: Habis (0)</option>
              <option value="safe">Stok: Aman</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2 flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="name">Urut: Nama</option>
              <option value="stock">Urut: Stok</option>
              <option value="expiry">Urut: Kadaluarsa</option>
              <option value="price">Urut: Harga</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Balik Urutan"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Count Helper */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Ditemukan <strong>{filteredMedicines.length}</strong> obat
          </span>
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman:</span>
            {[25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setItemsPerPage(num);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-xs ${
                  itemsPerPage === num
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table for 200+ Medicines */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Kode & Nama Obat</th>
                <th className="py-3 px-3">Kategori & Sediaan</th>
                <th className="py-3 px-3">Harga Beli</th>
                <th className="py-3 px-3">Harga Jual</th>
                <th className="py-3 px-3">Stok Fisik</th>
                <th className="py-3 px-3">Kadaluarsa (ED)</th>
                <th className="py-3 px-3">Batch & Rak</th>
                <th className="py-3 px-4 text-center">Aksi (Edit/Stok)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedMedicines.map((med) => {
                const stock = getStockStatus(med);
                const expiry = calculateExpiryStatus(med.expiryDate);

                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Kode & Nama */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                          {med.code}
                        </span>
                        {med.requiresPrescription && (
                          <span
                            className="w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center"
                            title="Obat Keras Resep Dokter"
                          >
                            K
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-400 italic">
                        {med.genericName}
                      </div>
                    </td>

                    {/* Kategori & Bentuk */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block">
                        {med.category}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {med.dosageForm} ({med.unit})
                      </span>
                    </td>

                    {/* Harga Beli */}
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {formatRupiah(med.buyPrice)}
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3 px-3 font-mono font-bold text-rose-600">
                      {formatRupiah(med.sellPrice)}
                    </td>

                    {/* Stok Fisik */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${stock.badgeClass}`}
                      >
                        {med.stock} {med.unit}
                      </span>
                      {med.stock <= med.minStock && med.stock > 0 && (
                        <span className="block text-[10px] text-amber-700 mt-0.5">
                          Min: {med.minStock}
                        </span>
                      )}
                    </td>

                    {/* Tanggal Kadaluarsa */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-900 block">
                        {formatDateIndo(med.expiryDate)}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${expiry.badgeBg}`}
                      >
                        {expiry.label}
                      </span>
                    </td>

                    {/* Batch & Rak */}
                    <td className="py-3 px-3 text-[11px]">
                      <span className="font-mono text-slate-600 block">
                        {med.batchNumber}
                      </span>
                      <span className="text-slate-400">{med.shelfLocation}</span>
                    </td>

                    {/* Actions: Edit, Adjust Stock, Delete */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button - fulfills "sediakan fitur edit" */}
                        <button
                          onClick={() => setEditingMedicine(med)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                          title="Edit Data Obat & Harga"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Adjust Stock Button */}
                        <button
                          onClick={() => setAdjustingMedicine(med)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                          title="Penyesuaian Stok / Stock Opname"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Stok</span>
                        </button>

                        {/* Delete Button (Owner Only) */}
                        {currentUser.permissions.canDeleteMedicine && (
                          <button
                            onClick={() => handleDelete(med)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Obat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredMedicines.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada obat yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">
              Sesuaikan kata kunci atau filter status stok & kadaluarsa.
            </p>
          </div>
        )}

        {/* Pagination Navigation */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>{' '}
            (Menampilkan{' '}
            {Math.min(filteredMedicines.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(filteredMedicines.length, currentPage * itemsPerPage)} dari{' '}
            {filteredMedicines.length} obat)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg font-semibold text-xs transition-colors ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addMedicine}
        existingCount={medicines.length}
      />

      <EditMedicineModal
        medicine={editingMedicine}
        isOpen={!!editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSave={updateMedicine}
      />

      <StockAdjustmentModal
        medicine={adjustingMedicine}
        isOpen={!!adjustingMedicine}
        onClose={() => setAdjustingMedicine(null)}
        onAdjust={adjustStock}
      />
    </div>
  );
};
