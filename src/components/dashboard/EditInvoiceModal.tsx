import React, { useState, useMemo } from 'react';
import { 
  X, 
  ReceiptText, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Package, 
  CircleDollarSign,
  Truck
} from 'lucide-react';
import { Invoice } from '../../types';
import { rupiah, CITIES } from '../../data/logisticData';
import { getStoredPricelistRoutes, DEFAULT_PRICELIST_ROUTES } from '../../data/pricelistData';

interface EditInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice;
  onClose: () => void;
  onSave: (updated: Invoice) => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSave
}) => {
  const [customerName, setCustomerName] = useState(invoice.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(invoice.customerPhone || '');
  const [resi, setResi] = useState(invoice.resi || '');
  const [itemDescription, setItemDescription] = useState(invoice.itemDescription || 'Jasa Pengiriman Kargo & Logistik');
  const [colly, setColly] = useState<number>(invoice.colly || 1);
  const [weight, setWeight] = useState<number>(invoice.weight || 1);
  const [senderCity, setSenderCity] = useState(invoice.senderCity || 'Jakarta');
  const [senderAddress, setSenderAddress] = useState(invoice.senderAddress || '');
  const [recipientCity, setRecipientCity] = useState(invoice.recipientCity || 'Surabaya, Jawa Timur');
  const [recipientAddress, setRecipientAddress] = useState(invoice.recipientAddress || '');
  
  const [amount, setAmount] = useState<number>(invoice.ongkirCargo ?? invoice.amount ?? 0);
  const [biayaPacking, setBiayaPacking] = useState<number>(invoice.biayaPacking || 0);
  const [asuransi, setAsuransi] = useState<number>(invoice.asuransi || 0);
  const [usePpn, setUsePpn] = useState<boolean>((invoice.ppnPercent ?? 12) > 0);
  const [ppnPercent, setPpnPercent] = useState<number>(invoice.ppnPercent ?? 12);
  const [dueDate, setDueDate] = useState<string>(invoice.dueDate || '');
  const [status, setStatus] = useState<Invoice['status']>(invoice.status || 'Belum Dibayar');
  const [notification, setNotification] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAutoHarga = () => {
    const qAsal = (senderCity || '').trim().toLowerCase();
    const qTujuan = (recipientCity || '').trim().toLowerCase();

    if (!qTujuan) {
      showToast('Pilih atau ketik Kota Tujuan terlebih dahulu.');
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
      showToast(`⚡ Auto Harga Diterapkan: Rp ${calcAmount.toLocaleString('id-ID')} (${match.kotaAsal} → ${match.kotaTujuan}, @Rp ${match.tarifKg.toLocaleString('id-ID')}/kg)`);
    } else {
      showToast(`⚠️ Rute "${senderCity} → ${recipientCity}" belum ditemukan di master pricelist.`);
    }
  };

  const calculatedTax = usePpn ? Math.round((amount + biayaPacking + asuransi) * (ppnPercent / 100)) : 0;
  const grandTotal = amount + biayaPacking + asuransi + calculatedTax;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Nama Pelanggan tidak boleh kosong!');
      return;
    }

    const paymentStatus = status === 'Dibayar' ? 'LUNAS' : status === 'Jatuh Tempo' ? 'JATUH TEMPO' : 'BELUM LUNAS';

    const updated: Invoice = {
      ...invoice,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      resi: resi.trim() || invoice.resi,
      itemDescription: itemDescription.trim() || 'Jasa Pengiriman Kargo & Logistik',
      colly: Math.max(1, colly),
      weight: Math.max(1, weight),
      senderCity,
      senderAddress: senderAddress.trim() || invoice.senderAddress,
      recipientCity,
      recipientAddress: recipientAddress.trim() || invoice.recipientAddress,
      amount,
      ongkirCargo: amount,
      biayaPacking,
      asuransi,
      tax: calculatedTax,
      ppnPercent: usePpn ? ppnPercent : 0,
      total: grandTotal,
      dueDate: dueDate.trim() || invoice.dueDate,
      status,
      paymentStatus
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1B4D] to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Edit Faktur Tagihan / Resi #{invoice.id}</h3>
              <p className="text-xs text-blue-200 font-mono">
                {invoice.resi ? `Resi: ${invoice.resi} • ` : ''}Terbit: {invoice.issueDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold flex items-center gap-2 border-b border-amber-500">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Data Pelanggan */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <User className="w-4 h-4 text-blue-700" />
              <span>Data Pelanggan &amp; Identitas Pengiriman</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  NAMA PELANGGAN / MITRA *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  NO. WHATSAPP / TELEPON
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  NO RESI TERKAIT
                </label>
                <input
                  type="text"
                  value={resi}
                  onChange={(e) => setResi(e.target.value)}
                  placeholder="e.g. TL-2026-9912"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono font-bold text-blue-900 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Rute & Alamat */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>Rute Asal &amp; Tujuan Kargo</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Asal */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    KOTA ASAL PENGIRIM
                  </label>
                  <input
                    type="text"
                    list="edit-origin-list"
                    value={senderCity}
                    onChange={(e) => setSenderCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  />
                  <datalist id="edit-origin-list">
                    {originCities.map((c, i) => <option key={i} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-0.5">
                    ALAMAT DETAIL GUDANG / PENGIRIM
                  </label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="Gudang Hub Trens Jakarta..."
                    className="w-full px-2.5 py-1 text-[11px] border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Tujuan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    KOTA TUJUAN PENERIMA
                  </label>
                  <input
                    type="text"
                    list="edit-dest-list"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  />
                  <datalist id="edit-dest-list">
                    {destinationCities.map((c, i) => <option key={i} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-0.5">
                    ALAMAT DETAIL PENERIMA (DO / SURAT JALAN)
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Alamat lengkap penerima..."
                    className="w-full px-2.5 py-1 text-[11px] border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Kargo & Fisik */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <Package className="w-4 h-4 text-blue-700" />
              <span>Deskripsi Barang &amp; Fisik Muatan</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  URAIAN / DESKRIPSI BARANG
                </label>
                <input
                  type="text"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  JUMLAH COLLY / KOLI
                </label>
                <input
                  type="number"
                  min="1"
                  value={colly}
                  onChange={(e) => setColly(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  BERAT TOTAL (KG)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Nilai Ongkir & Biaya Tambahan */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CircleDollarSign className="w-4 h-4 text-amber-600" />
                <span>Rincian Nilai Ongkir &amp; Biaya</span>
              </h4>
              <button
                type="button"
                onClick={handleAutoHarga}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                title="Hitung ongkir otomatis dari master tarif pricelist"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>⚡ AUTO HARGA PRICELIST</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  NILAI ONGKIR CARGO POKOK (RP) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  BIAYA PACKING (RP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={biayaPacking}
                  onChange={(e) => setBiayaPacking(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  ASURANSI (RP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={asuransi}
                  onChange={(e) => setAsuransi(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold"
                />
              </div>
            </div>

            {/* PPN Switch */}
            <div className="flex items-center justify-between p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
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
          </div>

          {/* Status Pembayaran & Jatuh Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                STATUS PEMBAYARAN FAKTUR
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Invoice['status'])}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold cursor-pointer"
              >
                <option value="Belum Dibayar">Belum Dibayar (Unpaid)</option>
                <option value="Dibayar">Dibayar (Lunas)</option>
                <option value="Jatuh Tempo">Jatuh Tempo (Overdue)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                TANGGAL JATUH TEMPO
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. 20/09/2026"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
              />
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">TOTAL TAGIHAN AKHIR</span>
              <span className="text-xl font-black font-mono text-amber-400">{rupiah(grandTotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan Invoice</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
