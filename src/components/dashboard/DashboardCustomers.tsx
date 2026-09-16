import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  Building2,
  Store,
  Trash2,
  Pencil,
  Download,
  Package,
  Wallet,
  X,
  History,
  MapPin,
  Mail,
  Handshake
} from 'lucide-react';
import {
  Customer,
  CustomerSegment,
  CustomerWithStats,
  Invoice,
  OrderRequest,
  TrackingItem
} from '../../types';
import { rupiah } from '../../data/logisticData';
import { getStoredInvoices, subscribeToInvoiceUpdates } from '../../utils/invoiceStore';
import {
  CUSTOMER_SEGMENTS,
  buildCustomerSummary,
  buildCustomersWithStats,
  exportCustomersToExcel,
  generateCustomerId
} from '../../utils/customerStore';

interface DashboardCustomersProps {
  tracks: Record<string, TrackingItem>;
  orders: OrderRequest[];
  customers: Customer[];
  canEdit: boolean;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

interface CustomerFormState {
  nama: string;
  perusahaan: string;
  telepon: string;
  email: string;
  kota: string;
  alamat: string;
  segmen: CustomerSegment;
  catatan: string;
}

const emptyForm = (): CustomerFormState => ({
  nama: '',
  perusahaan: '',
  telepon: '',
  email: '',
  kota: '',
  alamat: '',
  segmen: 'Retail',
  catatan: ''
});

const normalizePhone = (value?: string): string => (value || '').replace(/[^0-9]/g, '');

export const DashboardCustomers: React.FC<DashboardCustomersProps> = ({
  tracks,
  orders,
  customers,
  canEdit,
  onSaveCustomer,
  onDeleteCustomer
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'Semua' | CustomerSegment>('Semua');
  const [cityFilter, setCityFilter] = useState('Semua');
  const [sortBy, setSortBy] = useState<'spend' | 'shipments' | 'name'>('spend');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);
  const [detailTarget, setDetailTarget] = useState<CustomerWithStats | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToInvoiceUpdates((updated) => setInvoices(updated));
    return unsubscribe;
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows = useMemo(
    () => buildCustomersWithStats(customers, tracks, orders, invoices),
    [customers, tracks, orders, invoices]
  );

  const summary = useMemo(() => buildCustomerSummary(rows), [rows]);

  const cities = useMemo(() => {
    const list = Array.from(new Set(rows.map((c) => c.kota).filter(Boolean)));
    return ['Semua', ...list.sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = rows.filter((c) => {
      const matchSearch =
        !q ||
        c.nama.toLowerCase().includes(q) ||
        (c.perusahaan || '').toLowerCase().includes(q) ||
        c.telepon.includes(q) ||
        c.kota.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q);
      const matchSegment = segmentFilter === 'Semua' || c.segmen === segmentFilter;
      const matchCity = cityFilter === 'Semua' || c.kota === cityFilter;
      return matchSearch && matchSegment && matchCity;
    });

    return result.sort((a, b) => {
      if (sortBy === 'name') return a.nama.localeCompare(b.nama);
      if (sortBy === 'shipments') return b.totalShipments - a.totalShipments;
      return b.totalSpend - a.totalSpend;
    });
  }, [rows, search, segmentFilter, cityFilter, sortBy]);

  const customerShipments = useMemo(() => {
    if (!detailTarget) return [] as { resi: string; item: TrackingItem }[];
    const phone = normalizePhone(detailTarget.telepon);
    return Object.entries(tracks)
      .filter(([, item]) => {
        const itemPhone = normalizePhone(item.senderPhone);
        if (phone.length >= 8 && itemPhone.length >= 8) return itemPhone === phone;
        return (item.sender || '').toLowerCase() === detailTarget.nama.toLowerCase();
      })
      .map(([resi, item]) => ({ resi, item }))
      .sort((a, b) => a.resi.localeCompare(b.resi));
  }, [detailTarget, tracks]);

  const statsCards = [
    {
      label: 'Total Pelanggan',
      value: summary.totalCustomers.toLocaleString('id-ID'),
      note: `${summary.activeCustomers} pelanggan aktif bertransaksi`,
      icon: Users,
      color: 'text-blue-700'
    },
    {
      label: 'Pelanggan B2B',
      value: summary.b2bCount.toLocaleString('id-ID'),
      note: `${summary.partnerCount} mitra agen terdaftar`,
      icon: Building2,
      color: 'text-indigo-700'
    },
    {
      label: 'Total Kiriman',
      value: summary.totalShipments.toLocaleString('id-ID'),
      note: `${summary.retailCount} pelanggan retail`,
      icon: Package,
      color: 'text-emerald-700'
    },
    {
      label: 'Nilai Transaksi',
      value: rupiah(summary.totalRevenue),
      note: 'Akumulasi seluruh periode',
      icon: Wallet,
      color: 'text-amber-700'
    }
  ];

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (customer: CustomerWithStats) => {
    setEditingId(customer.id);
    setForm({
      nama: customer.nama,
      perusahaan: customer.perusahaan || '',
      telepon: customer.telepon,
      email: customer.email || '',
      kota: customer.kota,
      alamat: customer.alamat || '',
      segmen: customer.segmen,
      catatan: customer.catatan || ''
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) {
      setFormError('Nama pelanggan wajib diisi.');
      return;
    }
    if (!form.telepon.trim()) {
      setFormError('Nomor telepon / WhatsApp wajib diisi.');
      return;
    }

    const payload: Customer = {
      id: editingId || generateCustomerId(),
      nama: form.nama.trim(),
      perusahaan: form.perusahaan.trim() || undefined,
      telepon: form.telepon.trim(),
      email: form.email.trim() || undefined,
      kota: form.kota.trim() || 'Tidak diketahui',
      alamat: form.alamat.trim() || undefined,
      segmen: form.segmen,
      catatan: form.catatan.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onSaveCustomer(payload);
    showToast(
      editingId
        ? `Data pelanggan ${payload.nama} berhasil diperbarui.`
        : `Pelanggan ${payload.nama} berhasil ditambahkan ke master pelanggan.`
    );
    setShowForm(false);
    setEditingId(null);
  };

  const handleWhatsApp = (customer: CustomerWithStats) => {
    const phone = normalizePhone(customer.telepon);
    const waNumber = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    const text = encodeURIComponent(
      `Halo ${customer.nama}, kami dari TRENS-LOGISTIC ingin menindaklanjuti kebutuhan pengiriman Anda.` +
        (customer.totalShipments > 0
          ? ` Saat ini tercatat ${customer.totalShipments} kiriman dengan total nilai ${rupiah(customer.totalSpend)}.`
          : '') +
        ' Ada yang bisa kami bantu hari ini?'
    );
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const segmentBadge = (segment: CustomerSegment) => {
    switch (segment) {
      case 'B2B / Korporat':
        return { icon: Building2, className: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'Mitra Agen':
        return { icon: Handshake, className: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { icon: Store, className: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  return (
    <div className="space-y-5">

      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" />
              <span>Master Pelanggan &amp; Riwayat Kiriman</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Database pelanggan otomatis tersinkron dari data resi, order pickup, dan invoice yang terbit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                exportCustomersToExcel(filtered);
                showToast(`Export ${filtered.length} data pelanggan ke Excel berhasil.`);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Pelanggan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="mt-3 text-xl font-black text-slate-900 break-words">{card.value}</div>
              <p className="text-[11px] text-slate-500 mt-1">{card.note}</p>
            </div>
          );
        })}
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, perusahaan, telepon, kota, atau email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value as 'Semua' | CustomerSegment)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="Semua">Semua Segmen</option>
            {CUSTOMER_SEGMENTS.map((seg) => (
              <option key={seg} value={seg}>{seg}</option>
            ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {cities.map((city) => (
              <option key={city} value={city}>{city === 'Semua' ? 'Semua Kota' : city}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Urutkan:</span>
            {([
              { id: 'spend', label: 'Nilai Transaksi' },
              { id: 'shipments', label: 'Jumlah Kiriman' },
              { id: 'name', label: 'Nama A-Z' }
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  sortBy === opt.id
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {filtered.length} pelanggan
          </span>
        </div>
      </div>


      {/* Tabel Pelanggan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wide text-[10px]">
              <tr>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Kota</th>
                <th className="py-3 px-4 text-center">Kiriman</th>
                <th className="py-3 px-4 text-center">Booking</th>
                <th className="py-3 px-4 text-right">Berat (Kg)</th>
                <th className="py-3 px-4 text-right">Nilai Transaksi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Belum ada data pelanggan yang cocok.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Data pelanggan akan muncul otomatis dari resi, order pickup, dan invoice yang terbit.
                    </p>
                  </td>
                </tr>
              )}
              {filtered.map((customer) => {
                const badge = segmentBadge(customer.segmen);
                const BadgeIcon = badge.icon;
                return (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                          {customer.nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{customer.nama}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {customer.perusahaan || customer.email || 'Pelanggan individu'}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${badge.className}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {customer.segmen}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-mono font-semibold text-blue-900">{customer.telepon}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {customer.email || '-'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {customer.kota}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Terakhir: {customer.lastShipmentDate || '-'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {customer.totalShipments}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                        {customer.bookingCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {customer.totalWeight.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                      {rupiah(customer.totalSpend)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailTarget(customer)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat riwayat kiriman"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(customer)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(customer)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Ubah data pelanggan"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus data pelanggan ${customer.nama} dari master pelanggan?`)) {
                                  onDeleteCustomer(customer.id);
                                  showToast(`Pelanggan ${customer.nama} dihapus dari master.`);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus pelanggan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    {/* Modal: Form Pelanggan */}
      {showForm && (
        <CustomerFormModal
          editingId={editingId}
          form={form}
          error={formError}
          onChange={setForm}
          onSubmit={handleSubmitForm}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Modal: Riwayat Kiriman Pelanggan */}
      {detailTarget && (
        <CustomerDetailModal
          customer={detailTarget}
          shipments={customerShipments}
          canEdit={canEdit}
          onClose={() => setDetailTarget(null)}
          onWhatsApp={() => handleWhatsApp(detailTarget)}
          onEdit={() => {
            handleOpenEdit(detailTarget);
            setDetailTarget(null);
          }}
        />
      )}

      {/* Toast Notifikasi */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-70 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Package className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
 * Sub-komponen: Modal Form Pelanggan
 * ========================================================================== */
interface CustomerFormModalProps {
  editingId: string | null;
  form: CustomerFormState;
  error: string | null;
  onChange: React.Dispatch<React.SetStateAction<CustomerFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  editingId,
  form,
  error,
  onChange,
  onSubmit,
  onClose
}) => {
  const inputClass =
    'w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600';

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0B1B4D] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-extrabold">
                {editingId ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <p className="text-[11px] text-blue-200">
                Dipakai untuk follow-up, analisa pelanggan, dan rekam tagihan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pelanggan <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.nama}
                onChange={(e) => onChange((prev) => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: Budi Santoso / PT Sinar Abadi"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Perusahaan / Usaha</label>
              <input
                value={form.perusahaan}
                onChange={(e) => onChange((prev) => ({ ...prev, perusahaan: e.target.value }))}
                placeholder="Opsional"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telepon / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.telepon}
                onChange={(e) => onChange((prev) => ({ ...prev, telepon: e.target.value }))}
                placeholder="0812xxxxxxxx"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => onChange((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="opsional@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kota</label>
              <input
                value={form.kota}
                onChange={(e) => onChange((prev) => ({ ...prev, kota: e.target.value }))}
                placeholder="Contoh: Jakarta Barat"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Segmen Pelanggan</label>
              <select
                value={form.segmen}
                onChange={(e) => onChange((prev) => ({ ...prev, segmen: e.target.value as CustomerSegment }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {CUSTOMER_SEGMENTS.map((seg) => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                value={form.alamat}
                onChange={(e) => onChange((prev) => ({ ...prev, alamat: e.target.value }))}
                placeholder="Alamat pickup / penagihan"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Internal</label>
              <textarea
                rows={2}
                value={form.catatan}
                onChange={(e) => onChange((prev) => ({ ...prev, catatan: e.target.value }))}
                placeholder="Preferensi layanan, jadwal pickup, termin pembayaran, dsb."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
            >
              {editingId ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================================
 * Sub-komponen: Modal Riwayat Kiriman Pelanggan
 * ========================================================================== */
interface CustomerDetailModalProps {
  customer: CustomerWithStats;
  shipments: { resi: string; item: TrackingItem }[];
  canEdit: boolean;
  onClose: () => void;
  onWhatsApp: () => void;
  onEdit: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  shipments,
  canEdit,
  onClose,
  onWhatsApp,
  onEdit
}) => {
  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Riwayat Kiriman — {customer.nama}
            </h3>
            <p className="text-[11px] text-slate-300">
              {customer.telepon} • {customer.kota} • Segmen {customer.segmen}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500">Resi Terhubung</p>
              <p className="text-lg font-black text-slate-900">{customer.totalShipments}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500">Booking Pickup</p>
              <p className="text-lg font-black text-slate-900">{customer.bookingCount}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500">Total Berat</p>
              <p className="text-lg font-black text-slate-900">{customer.totalWeight} Kg</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500">Nilai Transaksi</p>
              <p className="text-sm font-black text-emerald-700">{rupiah(customer.totalSpend)}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">No. Resi</th>
                    <th className="py-2.5 px-3">Rute</th>
                    <th className="py-2.5 px-3">Moda</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ongkir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-[11px]">
                        Belum ada resi terhubung dengan pelanggan ini.
                      </td>
                    </tr>
                  )}
                  {shipments.map(({ resi, item }) => (
                    <tr key={resi} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{resi}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.rute}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.moda}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {rupiah(Number(item.cost || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Kontak &amp; Alamat</p>
              <p className="text-xs text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {customer.email || 'Email belum diisi'}
              </p>
              <p className="text-xs text-slate-700 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {customer.alamat || 'Alamat belum diisi'}
              </p>
              <p className="text-xs text-slate-700 flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {customer.perusahaan || 'Perusahaan belum diisi'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Catatan Internal</p>
              <p className="text-xs text-slate-700">{customer.catatan || 'Belum ada catatan.'}</p>
              <p className="text-[11px] text-slate-500 mt-2">
                Kiriman terakhir: {customer.lastShipmentDate || '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onWhatsApp}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi via WhatsApp</span>
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                <span>Ubah Data Pelanggan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};