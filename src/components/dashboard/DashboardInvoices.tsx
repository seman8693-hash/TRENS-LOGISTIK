import React, { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, FilePlus2, ReceiptText, Search, WalletCards } from 'lucide-react';
import { Invoice, OrderRequest, TrackingItem } from '../../types';
import { rupiah } from '../../data/logisticData';

interface DashboardInvoicesProps {
  tracks: Record<string, TrackingItem>;
  orders: OrderRequest[];
}

const STORAGE_KEY = 'trens-logistic-invoices-v2';

const formatDate = (date: Date) => date.toLocaleDateString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric'
});

export const DashboardInvoices: React.FC<DashboardInvoicesProps> = ({ tracks, orders }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [resi, setResi] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices)), [invoices]);

  const filteredInvoices = useMemo(() => {
    const keyword = search.toLowerCase();
    return invoices.filter((invoice) => `${invoice.id} ${invoice.customerName} ${invoice.resi}`.toLowerCase().includes(keyword));
  }, [invoices, search]);

  const totalOutstanding = invoices.filter((invoice) => invoice.status !== 'Dibayar').reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = invoices.filter((invoice) => invoice.status === 'Dibayar').reduce((sum, invoice) => sum + invoice.total, 0);

  const handleResiChange = (value: string) => {
    setResi(value);
    const track = tracks[value];
    const order = orders.find((item) => item.resi === value);
    if (track) {
      setCustomerName(track.sender || ''); setCustomerPhone(track.senderPhone || ''); setAmount(track.cost || 0);
    } else if (order) {
      setCustomerName(order.nama); setCustomerPhone(order.hp); setAmount(order.estimasiBiaya || 0);
    }
  };

  const handleCreateInvoice = () => {
    if (!customerName.trim() || !resi || amount <= 0) return;
    const issue = new Date();
    const due = new Date(issue);
    due.setDate(due.getDate() + 7);
    const tax = Math.round(amount * 0.11);
    const sequence = String(invoices.length + 1).padStart(4, '0');
    setInvoices((current) => [{
      id: `INV-${issue.getFullYear()}-${sequence}`, customerName: customerName.trim(), customerPhone: customerPhone.trim(), resi,
      amount, tax, total: amount + tax, issueDate: formatDate(issue), dueDate: formatDate(due), status: 'Belum Dibayar'
    }, ...current]);
    setCustomerName(''); setCustomerPhone(''); setResi(''); setAmount(0);
  };

  const updateStatus = (id: string, status: Invoice['status']) => {
    setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status } : invoice));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ReceiptText className="w-5 h-5 text-blue-700" />Invoice &amp; Pembayaran</h2><p className="text-xs text-slate-500 mt-1">Buat tagihan pengiriman dan pantau status pembayaran pelanggan.</p></div>
        <div className="relative w-full lg:w-72"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari invoice, pelanggan, resi..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200"><CircleDollarSign className="w-5 h-5 text-amber-600" /><p className="text-[10px] uppercase font-bold text-slate-500 mt-3">Total invoice</p><p className="text-xl font-black text-slate-900">{rupiah(invoices.reduce((sum, invoice) => sum + invoice.total, 0))}</p></div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200"><WalletCards className="w-5 h-5 text-red-600" /><p className="text-[10px] uppercase font-bold text-slate-500 mt-3">Belum tertagih</p><p className="text-xl font-black text-slate-900">{rupiah(totalOutstanding)}</p></div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200"><ReceiptText className="w-5 h-5 text-emerald-600" /><p className="text-[10px] uppercase font-bold text-slate-500 mt-3">Sudah dibayar</p><p className="text-xl font-black text-slate-900">{rupiah(totalPaid)}</p></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"><h3 className="font-bold text-slate-900 flex items-center gap-2"><FilePlus2 className="w-4 h-4 text-blue-700" />Buat Invoice Baru</h3><div className="space-y-3 mt-4">
          <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nama pelanggan" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
          <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Nomor WhatsApp" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
          <select value={resi} onChange={(event) => handleResiChange(event.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"><option value="">Pilih resi terkait</option>{Object.keys(tracks).map((item) => <option key={item} value={item}>{item}</option>)}{orders.filter((order) => !tracks[order.resi]).map((order) => <option key={order.resi} value={order.resi}>{order.resi}</option>)}</select>
          <input type="number" min="1" value={amount || ''} onChange={(event) => setAmount(Number(event.target.value))} placeholder="Subtotal pengiriman" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" /><p className="text-[11px] text-slate-500">PPN 11% dihitung otomatis.</p>
          <button onClick={handleCreateInvoice} className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-2.5 text-xs font-bold">Simpan Invoice</button>
        </div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto"><h3 className="font-bold text-slate-900 mb-4">Daftar Invoice</h3><table className="w-full text-left text-xs min-w-[650px]"><thead><tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500"><th className="pb-3">Invoice</th><th className="pb-3">Pelanggan</th><th className="pb-3">Total</th><th className="pb-3">Jatuh tempo</th><th className="pb-3">Status</th></tr></thead><tbody>{filteredInvoices.map((invoice) => <tr key={invoice.id} className="border-b border-slate-100"><td className="py-3"><p className="font-bold text-slate-800">{invoice.id}</p><p className="text-[10px] text-slate-500">{invoice.resi}</p></td><td className="py-3">{invoice.customerName}</td><td className="py-3 font-bold">{rupiah(invoice.total)}</td><td className="py-3">{invoice.dueDate}</td><td className="py-3"><select value={invoice.status} onChange={(event) => updateStatus(invoice.id, event.target.value as Invoice['status'])} className={`px-2 py-1 rounded-lg text-[10px] font-bold border-0 ${invoice.status === 'Dibayar' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'Jatuh Tempo' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}><option>Belum Dibayar</option><option>Dibayar</option><option>Jatuh Tempo</option></select></td></tr>)}</tbody></table>{filteredInvoices.length === 0 && <p className="text-center text-xs text-slate-500 py-8">Invoice tidak ditemukan.</p>}</div>
      </div>
    </div>
  );
};