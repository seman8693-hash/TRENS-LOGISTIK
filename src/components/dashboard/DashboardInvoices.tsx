import React, { useEffect, useMemo, useState } from 'react';
import { 
  CircleDollarSign, 
  FilePlus2, 
  ReceiptText, 
  Search, 
  WalletCards, 
  FileText, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Printer, 
  Truck,
  Plus
} from 'lucide-react';
import { Invoice, OrderRequest, TrackingItem } from '../../types';
import { rupiah, CITIES } from '../../data/logisticData';
import { getStoredPricelistRoutes, DEFAULT_PRICELIST_ROUTES } from '../../data/pricelistData';
import { InvoiceDocumentModal } from './InvoiceDocumentModal';
import {
  getStoredInvoices,
  saveStoredInvoices,
  upsertInvoice,
  subscribeToInvoiceUpdates,
  DEFAULT_TRENS_INVOICES
} from '../../utils/invoiceStore';

interface DashboardInvoicesProps {
  tracks: Record<string, TrackingItem>;
  orders: OrderRequest[];
}

const formatDate = (date: Date) => date.toLocaleDateString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric'
});

export const DashboardInvoices: React.FC<DashboardInvoicesProps> = ({ tracks, orders }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());

  useEffect(() => {
    const unsubscribe = subscribeToInvoiceUpdates((updated) => {
      setInvoices(updated);
    });
    return unsubscribe;
  }, []);

  const [search, setSearch] = useState('');
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [resi, setResi] = useState('');
  const [itemDescription, setItemDescription] = useState('Jasa Pengiriman Kargo & Logistik');
  const [colly, setColly] = useState<number>(1);
  const [weight, setWeight] = useState<number>(5);
  const [senderCity, setSenderCity] = useState('Jakarta');
  const [recipientCity, setRecipientCity] = useState('Surabaya, Jawa Timur');
  const [amount, setAmount] = useState<number>(0);
  const [biayaPacking, setBiayaPacking] = useState<number>(0);
  const [asuransi, setAsuransi] = useState<number>(0);
  const [usePpn, setUsePpn] = useState<boolean>(true);
  const [ppnPercent, setPpnPercent] = useState<number>(12);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Routes for auto-complete & auto-harga
  const routes = useMemo(() => {
    const stored = getStoredPricelistRoutes();
    return stored.length > 0 ? stored : DEFAULT_PRICELIST_ROUTES;
  }, []);

  const originCities = useMemo(() => {
    const list = ['Jakarta', 'Jakarta Barat', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Tangerang', 'Bekasi', 'Bogor', 'Depok', 'Bandung', 'Semarang', 'Surabaya'];
    routes.forEach(r => {
      if (r.kotaAsal && !list.includes(r.kotaAsal)) list.push(r.kotaAsal);
    });
    return list;
  }, [routes]);

  const destinationCities = useMemo(() => {
    const list: string[] = [];
    routes.forEach(r => {
      if (r.kotaTujuan && !list.includes(r.kotaTujuan)) list.push(r.kotaTujuan);
    });
    Object.values(CITIES).forEach(c => {
      if (!list.includes(c.n)) list.push(c.n);
    });
    return list;
  }, [routes]);

  // Handler for Auto Harga Ongkir in Create Invoice form
  const handleAutoHarga = () => {
    const qAsal = (senderCity || '').trim().toLowerCase();
    const qTujuan = (recipientCity || '').trim().toLowerCase();

    if (!qTujuan) {
      showNotification('Pilih atau ketik Kota Tujuan terlebih dahulu.');
      return;
    }

    let match = routes.find(r => {
      const rAsal = r.kotaAsal.toLowerCase();
      const rTujuan = r.kotaTujuan.toLowerCase();
      const asalMatch = !qAsal || rAsal.includes(qAsal) || qAsal.includes(rAsal);
      const tujuanMatch = rTujuan.includes(qTujuan) || qTujuan.includes(rTujuan);
      return asalMatch && tujuanMatch;
    });

    if (!match) {
      match = routes.find(r => {
        const rTujuan = r.kotaTujuan.toLowerCase();
        return rTujuan.includes(qTujuan) || qTujuan.includes(rTujuan);
      });
    }

    if (match) {
      const calcAmount = Math.round(match.tarifKg * Math.max(1, weight));
      setAmount(calcAmount);
      setSenderCity(match.kotaAsal);
      setRecipientCity(match.kotaTujuan);
      showNotification(`⚡ Auto Harga Diterapkan: Rp ${calcAmount.toLocaleString('id-ID')} (${match.kotaAsal} → ${match.kotaTujuan}, @Rp ${match.tarifKg.toLocaleString('id-ID')}/kg)`);
    } else {
      showNotification(`⚠️ Rute "${senderCity} → ${recipientCity}" belum ditemukan di master pricelist.`);
    }
  };

  const filteredInvoices = useMemo(() => {
    const keyword = search.toLowerCase();
    return invoices.filter((invoice) => 
      `${invoice.id} ${invoice.customerName} ${invoice.resi} ${invoice.recipientCity || ''} ${invoice.itemDescription || ''}`.toLowerCase().includes(keyword)
    );
  }, [invoices, search]);

  const totalOutstanding = invoices.filter((invoice) => invoice.status !== 'Dibayar').reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = invoices.filter((invoice) => invoice.status === 'Dibayar').reduce((sum, invoice) => sum + invoice.total, 0);

  const handleResiChange = (value: string) => {
    setResi(value);
    const track = tracks[value];
    const order = orders.find((item) => item.resi === value);
    if (track) {
      setCustomerName(track.recipient || track.sender || '');
      setCustomerPhone(track.recipientPhone || track.senderPhone || '');
      setItemDescription(track.nama || 'Pengiriman Kargo');
      setWeight(track.berat || 5);
      setColly(track.colly || 1);
      if (track.senderCity) setSenderCity(track.senderCity);
      if (track.recipientCity) setRecipientCity(track.recipientCity);
      else if (track.rute) {
        const parts = track.rute.split(/→|-|ke/);
        if (parts.length >= 2) {
          setSenderCity(parts[0].trim());
          setRecipientCity(parts[1].trim());
        }
      }
      setAmount(track.cost || track.ongkirPokok || 0);
      setBiayaPacking(track.biayaPacking || 0);
      setAsuransi(track.asuransi || 0);
    } else if (order) {
      setCustomerName(order.nama);
      setCustomerPhone(order.hp);
      setItemDescription(order.barang || 'Order Pickup Kargo');
      setWeight(order.berat || 5);
      setColly(1);
      setAmount(order.estimasiBiaya || 0);
    }
  };

  const calculatedTax = usePpn ? Math.round((amount + biayaPacking + asuransi) * (ppnPercent / 100)) : 0;
  const grandTotal = amount + biayaPacking + asuransi + calculatedTax;

  const handleCreateInvoice = () => {
    if (!customerName.trim() || amount <= 0) {
      showNotification('Mohon lengkapi Nama Pelanggan dan Nilai Tagihan/Ongkir.');
      return;
    }

    const issue = new Date();
    const due = new Date(issue);
    due.setDate(due.getDate() + 7);

    const nowString = issue.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '/');

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-${randomDigits}`;

    const newInv: Invoice = {
      id: invoiceId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      resi: resi.trim() || `RESI-${invoiceId}`,
      amount,
      tax: calculatedTax,
      total: grandTotal,
      issueDate: nowString,
      dueDate: formatDate(due),
      status: 'Belum Dibayar',
      senderName: 'TRENS LOGISTIK WAREHOUSE',
      senderAddress: `Gudang Utama Trens Logistik (${senderCity})`,
      senderCity,
      recipientAddress: `Alamat Terdaftar Klien Mitra (${recipientCity})`,
      recipientCity,
      itemDescription: itemDescription.trim() || 'Layanan Kargo Logistik Trens',
      colly,
      weight,
      ongkirCargo: amount,
      biayaPacking,
      asuransi,
      ppnPercent: usePpn ? ppnPercent : 0,
      deliveryOrderNo: `DO-${invoiceId}`
    };

    upsertInvoice(newInv);
    setInvoices((current) => [newInv, ...current]);
    showNotification(`Invoice ${invoiceId} berhasil diterbitkan dan disinkronkan ke seluruh sistem!`);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setResi('');
    setItemDescription('Jasa Pengiriman Kargo & Logistik');
    setAmount(0);
    setBiayaPacking(0);
    setAsuransi(0);
  };

  const updateStatus = (id: string, status: Invoice['status']) => {
    const paymentStatus = status === 'Dibayar' ? 'LUNAS' : status === 'Jatuh Tempo' ? 'JATUH TEMPO' : 'BELUM LUNAS';
    setInvoices((current) => {
      const updated = current.map((inv) => inv.id === id ? { ...inv, status, paymentStatus } : inv);
      saveStoredInvoices(updated);
      return updated;
    });
    showNotification(`Status invoice & stempel diperbarui ke: ${status}`);
  };

  const handleSaveInvoiceModal = (updated: Invoice) => {
    upsertInvoice(updated);
    setInvoices((current) => current.map((inv) => inv.id === updated.id ? updated : inv));
    setSelectedInvoiceForModal(updated);
  };

  const handleSendWA = (invoice: Invoice) => {
    const phone = (invoice.customerPhone || '').replace(/[^0-9]/g, '');
    const targetPhone = phone.startsWith('0') ? '62' + phone.slice(1) : (phone || '6285694310979');
    
    const text = `Halo *${invoice.customerName}*, berikut adalah rincian Faktur Tagihan Anda:%0A%0A` +
      `• No Invoice: *#${invoice.id}*%0A` +
      `• Resi: *${invoice.resi || '-'}*%0A` +
      `• Layanan: ${encodeURIComponent(invoice.itemDescription || 'Pengiriman Kargo')}%0A` +
      `• Rute: ${invoice.senderCity || 'Jakarta'} → ${invoice.recipientCity || 'Tujuan'}%0A` +
      `• Total Tagihan: *Rp ${invoice.total.toLocaleString('id-ID')}*%0A` +
      `• Status: *${invoice.status}*%0A%0A` +
      `Silakan hubungi kami untuk konfirmasi pembayaran. Terima kasih.`;

    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-60 bg-[#0B1B4D] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-400 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-700" />
            <span>Faktur Invoice, Resi Penjualan &amp; Surat Jalan (DO)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penerbitan dokumen legal tagihan ekspedisi real-time dengan pengaturan pajak, packing, asuransi, dan auto-harga.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            value={search} 
            onChange={(event) => setSearch(event.target.value)} 
            placeholder="Cari nomor invoice, nama, resi..." 
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium" 
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <CircleDollarSign className="w-5 h-5 text-amber-600" />
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-3">Total Seluruh Invoice</p>
          <p className="text-xl font-black text-slate-900">{rupiah(invoices.reduce((sum, invoice) => sum + invoice.total, 0))}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <WalletCards className="w-5 h-5 text-red-600" />
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-3">Belum Tertagih / Unpaid</p>
          <p className="text-xl font-black text-slate-900">{rupiah(totalOutstanding)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <ReceiptText className="w-5 h-5 text-emerald-600" />
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-3">Sudah Lunas Terbayar</p>
          <p className="text-xl font-black text-slate-900">{rupiah(totalPaid)}</p>
        </div>
      </div>

      {/* Main Grid: Form Left, Table Right */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-6">
        
        {/* FORM BUAT INVOICE BARU WITH AUTO HARGA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <FilePlus2 className="w-4 h-4 text-blue-700" />
              <span>Buat Faktur &amp; Dokumen Baru</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Live Auto-Calculate
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Resi Terkait */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                PILIH RESI TERKAIT (OPSIONAL AUTO-FILL)
              </label>
              <select 
                value={resi} 
                onChange={(event) => handleResiChange(event.target.value)} 
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:border-blue-600 font-medium cursor-pointer"
              >
                <option value="">-- Buat Manual atau Pilih Resi --</option>
                {Object.keys(tracks).map((item) => (
                  <option key={item} value={item}>
                    {item} — {tracks[item].recipient || tracks[item].nama} ({tracks[item].rute})
                  </option>
                ))}
                {orders.filter((order) => !tracks[order.resi]).map((order) => (
                  <option key={order.resi} value={order.resi}>
                    {order.resi} — {order.nama} ({order.barang})
                  </option>
                ))}
              </select>
            </div>

            {/* Nama & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  NAMA PELANGGAN / INSTANSI
                </label>
                <input 
                  value={customerName} 
                  onChange={(event) => setCustomerName(event.target.value)} 
                  placeholder="e.g. IWAN / PT Maju Jaya" 
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  NOMOR WHATSAPP
                </label>
                <input 
                  value={customerPhone} 
                  onChange={(event) => setCustomerPhone(event.target.value)} 
                  placeholder="e.g. 085694310979" 
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600" 
                />
              </div>
            </div>

            {/* Uraian Barang */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                URAIAN TRANSAKSI / BARANG
              </label>
              <input 
                value={itemDescription} 
                onChange={(event) => setItemDescription(event.target.value)} 
                placeholder="e.g. UNDANGAN HC-9912 X1" 
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600" 
              />
            </div>

            {/* Rute Asal & Tujuan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 mb-1">
                  KOTA ASAL (PENGIRIM)
                </label>
                <input 
                  list="inv-list-asal"
                  value={senderCity} 
                  onChange={(event) => setSenderCity(event.target.value)} 
                  placeholder="e.g. Jakarta" 
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white rounded-lg font-bold text-slate-800" 
                />
                <datalist id="inv-list-asal">
                  {originCities.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 mb-1">
                  KOTA TUJUAN (PENERIMA)
                </label>
                <input 
                  list="inv-list-tujuan"
                  value={recipientCity} 
                  onChange={(event) => setRecipientCity(event.target.value)} 
                  placeholder="e.g. Surabaya, Jawa Timur" 
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white rounded-lg font-bold text-slate-800" 
                />
                <datalist id="inv-list-tujuan">
                  {destinationCities.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            {/* Berat & Colly */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  BERAT (KG)
                </label>
                <input 
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={weight || ''} 
                  onChange={(event) => setWeight(parseFloat(event.target.value) || 1)} 
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-bold" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  JUMLAH COLLY
                </label>
                <input 
                  type="number"
                  min="1"
                  value={colly || ''} 
                  onChange={(event) => setColly(parseInt(event.target.value) || 1)} 
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-bold" 
                />
              </div>
            </div>

            {/* Ongkir Cargo with AUTO HARGA */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-black uppercase text-slate-800">
                  NILAI TAGIHAN / ONGKIR CARGO (RP)
                </label>
                <button
                  type="button"
                  onClick={handleAutoHarga}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                  title="Hitung ongkir otomatis dari master tarif pricelist"
                >
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>⚡ AUTO HARGA</span>
                </button>
              </div>

              <input 
                type="number" 
                min="0" 
                step="500"
                value={amount || ''} 
                onChange={(event) => setAmount(Number(event.target.value))} 
                placeholder="e.g. 3700 atau hitung otomatis" 
                className="w-full px-3 py-2 text-xs border border-slate-300 bg-white rounded-xl font-mono font-bold text-slate-900" 
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Bisa diisi manual atau klik <span className="font-bold text-amber-700">⚡ AUTO HARGA</span> untuk mencocokkan rute &amp; berat.
              </p>
            </div>

            {/* Biaya Tambahan & Pajak */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                  BIAYA PACKING (RP)
                </label>
                <input 
                  type="number" 
                  min="0" 
                  value={biayaPacking || ''} 
                  onChange={(event) => setBiayaPacking(Number(event.target.value))} 
                  placeholder="0" 
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold" 
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                  ASURANSI (RP)
                </label>
                <input 
                  type="number" 
                  min="0" 
                  value={asuransi || ''} 
                  onChange={(event) => setAsuransi(Number(event.target.value))} 
                  placeholder="0" 
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold" 
                />
              </div>
            </div>

            {/* PPN Switch */}
            <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={usePpn}
                  onChange={(e) => setUsePpn(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">Hitung PPN ({ppnPercent}%)</span>
              </label>
              <span className="font-mono font-bold text-slate-800 text-xs">
                + {rupiah(calculatedTax)}
              </span>
            </div>

            {/* Summary Bar */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">TOTAL TAGIHAN</span>
                <span className="text-base font-black font-mono text-amber-400">{rupiah(grandTotal)}</span>
              </div>
              <button 
                type="button"
                onClick={handleCreateInvoice} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Terbitkan Invoice</span>
              </button>
            </div>
          </div>
        </div>

        {/* DAFTAR INVOICE TABLE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Daftar Faktur &amp; Dokumen Penjualan</h3>
              <p className="text-xs text-slate-500">Klik "Buka Dokumen" untuk melihat Faktur Invoice, Resi Penjualan &amp; Surat Jalan (DO).</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {filteredInvoices.length} Dokumen
            </span>
          </div>

          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 bg-slate-50/50">
                <th className="pb-3 pt-2 px-3">Invoice &amp; Resi</th>
                <th className="pb-3 pt-2 px-3">Pelanggan &amp; Rute</th>
                <th className="pb-3 pt-2 px-3">Uraian Transaksi</th>
                <th className="pb-3 pt-2 px-3 text-right">Total Tagihan</th>
                <th className="pb-3 pt-2 px-3 text-center">Status</th>
                <th className="pb-3 pt-2 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Invoice & Resi */}
                  <td className="py-3 px-3">
                    <p className="font-black text-blue-950 font-mono">#{invoice.id}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{invoice.resi || '-'}</p>
                    <span className="text-[9px] text-slate-400 block">{invoice.issueDate}</span>
                  </td>

                  {/* Pelanggan */}
                  <td className="py-3 px-3">
                    <p className="font-extrabold text-slate-800">{invoice.customerName}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>📍</span>
                      <span>{invoice.senderCity || 'Jakarta'} → {invoice.recipientCity || 'Surabaya'}</span>
                    </p>
                  </td>

                  {/* Uraian */}
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-700 line-clamp-1">
                      {invoice.itemDescription || 'Jasa Pengiriman Kargo'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {invoice.colly ? `${invoice.colly} Colly` : '1 Colly'} • {invoice.weight ? `${invoice.weight} Kg` : ''}
                    </p>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                    {rupiah(invoice.total)}
                    {invoice.tax > 0 && (
                      <span className="block text-[9px] text-slate-400 font-normal">
                        PPN {rupiah(invoice.tax)}
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3 text-center">
                    <select 
                      value={invoice.status} 
                      onChange={(event) => updateStatus(invoice.id, event.target.value as Invoice['status'])} 
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border-0 cursor-pointer shadow-2xs ${
                        invoice.status === 'Dibayar' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : invoice.status === 'Jatuh Tempo' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <option value="Belum Dibayar">Belum Dibayar</option>
                      <option value="Dibayar">Dibayar</option>
                      <option value="Jatuh Tempo">Jatuh Tempo</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForModal(invoice)}
                        className="px-2.5 py-1.5 bg-[#0B1B4D] hover:bg-blue-900 text-white font-extrabold rounded-xl text-[10px] flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                        title="Buka Faktur Invoice, Resi Penjualan & Surat Jalan (DO)"
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>Dokumen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendWA(invoice)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
                        title="Kirim Ringkasan Invoice via WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center text-xs text-slate-500 py-12 space-y-2">
              <ReceiptText className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Invoice atau dokumen tagihan tidak ditemukan.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 3-IN-1: FAKTUR INVOICE, RESI PENJUALAN & SURAT JALAN DO */}
      {selectedInvoiceForModal && (
        <InvoiceDocumentModal
          isOpen={true}
          invoice={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
          onSaveInvoice={handleSaveInvoiceModal}
        />
      )}
    </div>
  );
};
