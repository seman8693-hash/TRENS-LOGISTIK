import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  Receipt, 
  Truck, 
  X, 
  Printer, 
  Download, 
  Image as ImageIcon, 
  Share2, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  User,
  ShieldAlert,
  Send,
  Stamp,
  Clock,
  AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { Invoice, TrackingItem, ShipmentMode } from '../../types';
import { rupiah, CITIES } from '../../data/logisticData';
import { getStoredPricelistRoutes, DEFAULT_PRICELIST_ROUTES } from '../../data/pricelistData';
import { upsertInvoice } from '../../utils/invoiceStore';

interface InvoiceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSaveInvoice?: (updated: Invoice) => void;
}

type DocumentTab = 'invoice' | 'resi' | 'surat_jalan';

export const InvoiceDocumentModal: React.FC<InvoiceDocumentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSaveInvoice
}) => {
  const [activeTab, setActiveTab] = useState<DocumentTab>('invoice');
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Document & Tax Settings
  const [ongkirCargo, setOngkirCargo] = useState<number>(invoice.ongkirCargo ?? 0);
  const [biayaPacking, setBiayaPacking] = useState<number>(invoice.biayaPacking ?? 0);
  const [asuransi, setAsuransi] = useState<number>(invoice.asuransi ?? 0);
  
  const [usePpn, setUsePpn] = useState<boolean>((invoice.ppnPercent ?? 12) > 0);
  const [ppnPercent, setPpnPercent] = useState<number>(invoice.ppnPercent ?? 12);
  const [manualPpnNominal, setManualPpnNominal] = useState<number | null>(null);

  const [usePph, setUsePph] = useState<boolean>((invoice.pphPercent ?? 0) > 0);
  const [pphPercent, setPphPercent] = useState<number>(invoice.pphPercent ?? 2);

  // Route for Auto Harga
  const [kotaAsal, setKotaAsal] = useState<string>(invoice.senderCity || 'Jakarta');
  const [kotaTujuan, setKotaTujuan] = useState<string>(invoice.recipientCity || 'Surabaya, Jawa Timur');
  const [estimasiBerat, setEstimasiBerat] = useState<number>(invoice.weight || 1);

  // Editable Status & Stempel Watermark Settings
  const initialPaymentStatus = invoice.paymentStatus || (invoice.status === 'Dibayar' ? 'LUNAS' : invoice.status === 'Jatuh Tempo' ? 'JATUH TEMPO' : 'BELUM LUNAS');
  const [paymentStatus, setPaymentStatus] = useState<'LUNAS' | 'BELUM LUNAS' | 'DP / SEBAGIAN' | 'JATUH TEMPO' | 'BATAL' | 'CUSTOM'>(initialPaymentStatus);
  const [customStampText, setCustomStampText] = useState<string>(invoice.customStamp || '');
  const [showWatermarkStamp, setShowWatermarkStamp] = useState<boolean>(true);
  const [stampColor, setStampColor] = useState<'red' | 'emerald' | 'blue' | 'amber' | 'purple'>('red');
  const [metodePembayaran, setMetodePembayaran] = useState<string>('TRANSFER BANK / QRIS RESMI');

  const documentRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pricelist routes
  const routes = useMemo(() => {
    const stored = getStoredPricelistRoutes();
    return stored.length > 0 ? stored : DEFAULT_PRICELIST_ROUTES;
  }, []);

  // Unique list of origin and destination cities for auto-complete datalists
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

  // Handler for AUTO HARGA ONGKIR CARGO
  const handleAutoHarga = () => {
    const qAsal = (kotaAsal || '').trim().toLowerCase();
    const qTujuan = (kotaTujuan || '').trim().toLowerCase();

    if (!qTujuan) {
      showToast('Ketik atau pilih Kota Tujuan terlebih dahulu.');
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
      const calculatedOngkir = Math.round(match.tarifKg * Math.max(1, estimasiBerat));
      setOngkirCargo(calculatedOngkir);
      setKotaAsal(match.kotaAsal);
      setKotaTujuan(match.kotaTujuan);
      showToast(`⚡ Auto Harga Diterapkan: Rp ${calculatedOngkir.toLocaleString('id-ID')} (${match.kotaAsal} → ${match.kotaTujuan}, @Rp ${match.tarifKg.toLocaleString('id-ID')}/kg)`);
    } else {
      showToast(`⚠️ Rute "${kotaAsal} → ${kotaTujuan}" belum ada di pricelist.`);
    }
  };

  // Base price of goods/services (from invoice.amount)
  const baseGoodsAmount = invoice.amount || 3700;

  // Subtotal before tax
  const subtotalTagihan = baseGoodsAmount + ongkirCargo + biayaPacking + asuransi;

  // Taxes calculation
  const calculatedPpn = manualPpnNominal !== null 
    ? manualPpnNominal 
    : (usePpn ? Math.round(subtotalTagihan * (ppnPercent / 100)) : 0);

  const calculatedPph = usePph ? Math.round(subtotalTagihan * (pphPercent / 100)) : 0;

  // Grand Total
  const grandTotal = subtotalTagihan + calculatedPpn - calculatedPph;

  // Save changes when values change
  const handleApplyChanges = () => {
    const derivedStatus: Invoice['status'] = 
      paymentStatus === 'LUNAS' ? 'Dibayar' : 
      paymentStatus === 'JATUH TEMPO' ? 'Jatuh Tempo' : 'Belum Dibayar';

    const updatedInvoice: Invoice = {
      ...invoice,
      ongkirCargo,
      biayaPacking,
      asuransi,
      ppnPercent: usePpn ? ppnPercent : 0,
      pphPercent: usePph ? pphPercent : 0,
      total: grandTotal,
      senderCity: kotaAsal,
      recipientCity: kotaTujuan,
      status: derivedStatus,
      paymentStatus: paymentStatus,
      customStamp: customStampText,
      senderName: invoice.senderName && !invoice.senderName.toLowerCase().includes('solution')
        ? invoice.senderName 
        : 'TRENS LOGISTIK WAREHOUSE'
    };

    upsertInvoice(updatedInvoice);

    if (onSaveInvoice) {
      onSaveInvoice(updatedInvoice);
    }
    showToast(`Status (${paymentStatus}) & biaya faktur berhasil disimpan ke sistem!`);
  };

  // Handlers for print, image, whatsapp
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    if (!documentRef.current) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `${invoice.id || 'INVOICE'}-${activeTab.toUpperCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Gambar berhasil diunduh!');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh gambar.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSendWA = () => {
    const phone = (invoice.customerPhone || '').replace(/[^0-9]/g, '');
    const targetPhone = phone.startsWith('0') ? '62' + phone.slice(1) : (phone || '6285694310979');
    
    const docTitle = activeTab === 'invoice' 
      ? 'FAKTUR INVOICE RESMI' 
      : activeTab === 'resi' 
      ? 'RESI PENJUALAN' 
      : 'SURAT JALAN (DO)';

    const effectiveStamp = paymentStatus === 'CUSTOM' ? (customStampText || 'CUSTOM') : paymentStatus;

    const text = `Halo *${invoice.customerName}*, berikut adalah *${docTitle}* Anda:%0A%0A` +
      `• No Dokumen: *${invoice.id}*%0A` +
      `• No Resi: *${invoice.resi || '-'}*%0A` +
      `• Layanan/Barang: ${encodeURIComponent(invoice.itemDescription || 'Jasa Pengiriman Kargo')}%0A` +
      (ongkirCargo > 0 ? `• Ongkir Cargo: Rp ${ongkirCargo.toLocaleString('id-ID')}%0A` : '') +
      (biayaPacking > 0 ? `• Biaya Packing: Rp ${biayaPacking.toLocaleString('id-ID')}%0A` : '') +
      (asuransi > 0 ? `• Asuransi: Rp ${asuransi.toLocaleString('id-ID')}%0A` : '') +
      (calculatedPpn > 0 ? `• PPN (${ppnPercent}%): Rp ${calculatedPpn.toLocaleString('id-ID')}%0A` : '') +
      `• *TOTAL AKHIR: Rp ${grandTotal.toLocaleString('id-ID')}*%0A` +
      `• Status Pembayaran: *${effectiveStamp}*%0A` +
      `• Metode: *${metodePembayaran}*%0A%0A` +
      `Terima kasih telah mempercayakan pengiriman Anda kepada *TRENS LOGISTIK*.`;

    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-[#0B1B4D] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-400 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* TOP TAB CONTROLS (Hidden on Print) */}
        <div className="print:hidden bg-slate-50 border-b border-slate-200 px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="tab-faktur-invoice"
              onClick={() => setActiveTab('invoice')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'invoice'
                  ? 'bg-[#0B1B4D] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>FAKTUR INVOICE</span>
            </button>

            <button
              type="button"
              id="tab-resi-penjualan"
              onClick={() => setActiveTab('resi')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'resi'
                  ? 'bg-[#0B1B4D] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>RESI PENJUALAN</span>
            </button>

            <button
              type="button"
              id="tab-surat-jalan"
              onClick={() => setActiveTab('surat_jalan')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'surat_jalan'
                  ? 'bg-[#0B1B4D] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>SURAT JALAN (DO)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PENGATURAN PAJAK & BIAYA TAMBAHAN DOKUMEN (Hidden on Print) */}
        <div className="print:hidden p-4 sm:p-5 bg-white border-b border-slate-200">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0B1B4D] uppercase">
                <span className="text-blue-700">⚙️</span>
                <span>PENGATURAN PAJAK &amp; BIAYA TAMBAHAN DOKUMEN</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Perhitungan Real-time
              </span>
            </div>

            {/* Row 1: Rute Asal & Tujuan untuk Auto Harga */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5 pb-2.5 border-b border-blue-200/60">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                  KOTA ASAL (PENGIRIM)
                </label>
                <input
                  type="text"
                  list="modal-list-asal"
                  value={kotaAsal}
                  onChange={(e) => setKotaAsal(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                  placeholder="e.g. Jakarta"
                />
                <datalist id="modal-list-asal">
                  {originCities.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                  KOTA TUJUAN (PENERIMA)
                </label>
                <input
                  type="text"
                  list="modal-list-tujuan"
                  value={kotaTujuan}
                  onChange={(e) => setKotaTujuan(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                  placeholder="e.g. Surabaya, Jawa Timur"
                />
                <datalist id="modal-list-tujuan">
                  {destinationCities.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                  ESTIMASI BERAT (KG)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={estimasiBerat || ''}
                  onChange={(e) => setEstimasiBerat(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            {/* Row 2: Biaya & Pajak Inputs matching Image 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* ONGKIR CARGO with AUTO HARGA */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[9px] font-black uppercase text-slate-700">
                    ONGKIR CARGO (RP)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoHarga}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
                    title="Cek tarif otomatis dari master pricelist"
                  >
                    <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                    <span>AUTO</span>
                  </button>
                </div>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={ongkirCargo}
                  onChange={(e) => setOngkirCargo(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>

              {/* BIAYA PACKING (RP) */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 mb-0.5">
                  BIAYA PACKING (RP)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={biayaPacking}
                  onChange={(e) => setBiayaPacking(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>

              {/* ASURANSI (RP) */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-700 mb-0.5">
                  ASURANSI (RP)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={asuransi}
                  onChange={(e) => setAsuransi(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>

              {/* PPN (%) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePpn}
                      onChange={(e) => setUsePpn(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer w-3 h-3"
                    />
                    <span>PPN (%)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={ppnPercent}
                    onChange={(e) => setPpnPercent(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={!usePpn}
                    className="w-10 bg-white border border-slate-300 rounded px-1 text-[10px] text-center font-bold"
                  />
                </div>
                <div className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 text-center font-mono">
                  {usePpn ? `Manual Rp (${calculatedPpn.toLocaleString('id-ID')})` : 'Rp 0'}
                </div>
              </div>

              {/* PPh (%) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePph}
                      onChange={(e) => setUsePph(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer w-3 h-3"
                    />
                    <span>PPh (%)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pphPercent}
                    onChange={(e) => setPphPercent(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={!usePph}
                    className="w-10 bg-white border border-slate-300 rounded px-1 text-[10px] text-center font-bold"
                  />
                </div>
                <div className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 text-center font-mono">
                  {usePph ? `- Rp (${calculatedPph.toLocaleString('id-ID')})` : 'Rp 0'}
                </div>
              </div>
            </div>

            {/* Row 3: PENGATURAN STATUS PEMBAYARAN & STEMPEL WATERMARK */}
            <div className="mt-2.5 pt-2.5 border-t border-blue-200/60">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-[#0B1B4D] uppercase">
                  <Stamp className="w-3.5 h-3.5 text-red-600" />
                  <span>PENGATURAN STEMPEL &amp; STATUS PEMBAYARAN</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWatermarkStamp}
                      onChange={(e) => setShowWatermarkStamp(e.target.checked)}
                      className="rounded text-red-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                    />
                    <span>Tampilkan Stempel Watermark</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleApplyChanges}
                    className="bg-[#0B1B4D] hover:bg-[#0B1B4D]/90 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Pilih Status / Teks Stempel */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                    STATUS / TEKS STEMPEL
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="LUNAS">LUNAS (PAID)</option>
                    <option value="BELUM LUNAS">BELUM LUNAS (UNPAID)</option>
                    <option value="DP / SEBAGIAN">DP / PEMBAYARAN SEBAGIAN</option>
                    <option value="JATUH TEMPO">JATUH TEMPO (OVERDUE)</option>
                    <option value="BATAL">BATAL / CANCELLED</option>
                    <option value="CUSTOM">STEMPEL KUSTOM LAINNYA...</option>
                  </select>
                </div>

                {/* Input Teks Kustom jika status CUSTOM */}
                {paymentStatus === 'CUSTOM' ? (
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                      TEKS STEMPEL KUSTOM
                    </label>
                    <input
                      type="text"
                      value={customStampText}
                      onChange={(e) => setCustomStampText(e.target.value)}
                      placeholder="e.g. SAMPLE / VOID / ACC"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600 uppercase"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                      METODE PEMBAYARAN
                    </label>
                    <input
                      type="text"
                      value={metodePembayaran}
                      onChange={(e) => setMetodePembayaran(e.target.value)}
                      placeholder="e.g. TRANSFER BANK / QRIS RESMI"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600 uppercase"
                    />
                  </div>
                )}

                {/* Pilihan Warna Stempel */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-600 mb-0.5">
                    WARNA TINTA STEMPEL
                  </label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { id: 'red', name: 'Merah', bg: 'bg-red-500' },
                      { id: 'emerald', name: 'Hijau', bg: 'bg-emerald-600' },
                      { id: 'blue', name: 'Biru', bg: 'bg-blue-600' },
                      { id: 'amber', name: 'Kuning', bg: 'bg-amber-500' },
                      { id: 'purple', name: 'Ungu', bg: 'bg-purple-600' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setStampColor(col.id as any)}
                        className={`px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                          stampColor === col.id
                            ? 'border-slate-800 bg-white shadow-xs font-extrabold ring-1 ring-slate-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${col.bg}`} />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENT PREVIEW CONTAINER (Canvas Capture Target) */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto bg-slate-100 flex justify-center print:max-h-none print:p-0 print:bg-white">
          <div 
            ref={documentRef}
            className="w-full max-w-[540px] bg-white border border-slate-200 rounded-2xl p-6 shadow-sm print:shadow-none print:border-none print:p-2 relative overflow-hidden"
          >
            {/* TAB 1: FAKTUR INVOICE (Matching Screenshot 1) */}
            {activeTab === 'invoice' && (
              <div className="space-y-4 text-slate-800">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-blue-900 pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight uppercase">
                      BUKTI BAYAR
                    </h2>
                    <p className="text-xs font-extrabold text-slate-600 font-mono mt-0.5">
                      NO: #{invoice.id || 'INV-3614'}
                    </p>
                  </div>

                  <div className="text-right">
                    <h3 className="text-base font-black text-blue-900 tracking-tight">
                      TRENS LOGISTIK
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      EKSPEDISI &amp; LOGISTIK CARGO NASIONAL
                    </p>
                  </div>
                </div>

                {/* Penerima & Tanggal */}
                <div className="flex items-start justify-between text-xs py-1">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      PENERIMA / INSTANSI:
                    </span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {invoice.customerName || 'IWAN'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {invoice.recipientAddress || 'Mitra Terdaftar Enterprise'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      TANGGAL TRANSAKSI:
                    </span>
                    <p className="font-bold text-slate-700 font-mono">
                      {invoice.issueDate || '6/9/2026, 11.30.41'}
                    </p>
                    <div className={`inline-flex items-center gap-1 text-[11px] font-extrabold mt-0.5 ${
                      paymentStatus === 'LUNAS' ? 'text-emerald-600' :
                      paymentStatus === 'BELUM LUNAS' ? 'text-rose-600' :
                      paymentStatus === 'DP / SEBAGIAN' ? 'text-amber-600' :
                      paymentStatus === 'JATUH TEMPO' ? 'text-purple-600' :
                      paymentStatus === 'BATAL' ? 'text-slate-600' : 'text-blue-600'
                    }`}>
                      {paymentStatus === 'LUNAS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : paymentStatus === 'BELUM LUNAS' || paymentStatus === 'BATAL' ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {paymentStatus === 'CUSTOM' ? (customStampText || 'CUSTOM') : paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table Breakdown with Configurable Stamp Watermark */}
                <div className="relative my-3 pt-2">
                  {/* Dynamic Watermark Stamp */}
                  {showWatermarkStamp && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 rotate-[-18deg] z-0">
                      <div className={`border-4 font-black text-4xl sm:text-5xl px-6 py-2 rounded-2xl tracking-widest uppercase border-dashed ${
                        stampColor === 'emerald' ? 'border-emerald-600 text-emerald-600' :
                        stampColor === 'blue' ? 'border-blue-600 text-blue-600' :
                        stampColor === 'amber' ? 'border-amber-500 text-amber-600' :
                        stampColor === 'purple' ? 'border-purple-600 text-purple-600' :
                        'border-red-600 text-red-600'
                      }`}>
                        {paymentStatus === 'CUSTOM' ? (customStampText || 'CUSTOM') : paymentStatus}
                      </div>
                    </div>
                  )}

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 bg-slate-50">
                        <th className="py-2 px-2 text-left">URAIAN TRANSAKSI / RINCIAN LAYANAN</th>
                        <th className="py-2 px-2 text-right">NILAI TAGIHAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-2 font-bold text-slate-800">
                          {invoice.itemDescription || 'UNDANGAN HC-9912 X1'}
                          {invoice.resi && (
                            <span className="block text-[10px] font-normal text-slate-500">
                              Resi: {invoice.resi} {invoice.colly ? `(${invoice.colly} Colly)` : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800 font-mono">
                          Rp {baseGoodsAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>

                      {ongkirCargo > 0 && (
                        <tr>
                          <td className="py-2 px-2 text-slate-700">
                            Ongkir Cargo ({kotaAsal} → {kotaTujuan})
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800 font-mono">
                            + Rp {ongkirCargo.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      )}

                      {biayaPacking > 0 && (
                        <tr>
                          <td className="py-2 px-2 text-slate-700">Biaya Packing Ekstra</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800 font-mono">
                            + Rp {biayaPacking.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      )}

                      {asuransi > 0 && (
                        <tr>
                          <td className="py-2 px-2 text-slate-700">Premi Asuransi Pengiriman</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800 font-mono">
                            + Rp {asuransi.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      )}

                      {usePpn && calculatedPpn > 0 && (
                        <tr>
                          <td className="py-2 px-2 text-slate-700">PPN ({ppnPercent}%)</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800 font-mono">
                            + Rp {calculatedPpn.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      )}

                      {usePph && calculatedPph > 0 && (
                        <tr>
                          <td className="py-2 px-2 text-slate-700">Potongan PPh ({pphPercent}%)</td>
                          <td className="py-2 px-2 text-right font-bold text-red-600 font-mono">
                            - Rp {calculatedPph.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total Box */}
                <div className="border-t-2 border-slate-900 pt-3 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-800">
                    TOTAL AKHIR PEMBAYARAN:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 flex items-end justify-between text-[11px] text-slate-600">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">
                      METODE PEMBAYARAN:
                    </span>
                    <p className="font-extrabold text-slate-800 uppercase">
                      {metodePembayaran || 'TRANSFER BANK / QRIS RESMI'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">HORMAT KAMI,</p>
                    <div className="h-10" />
                    <p className="font-extrabold text-slate-900 border-t border-slate-900 pt-1 uppercase">
                      TRENS LOGISTIK ADMIN
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RESI PENJUALAN (Matching Screenshot 2) */}
            {activeTab === 'resi' && (
              <div className="max-w-[360px] mx-auto text-slate-900 font-mono text-xs border border-dashed border-slate-300 p-4 rounded-xl bg-slate-50/50">
                <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
                  <h3 className="font-black text-sm text-slate-900">TRENS LOGISTIK</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-600">
                    RESI &amp; BUKTI PENJUALAN RESMI
                  </p>
                </div>

                <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Resi:</span>
                    <span className="font-bold">RESI-{invoice.id || 'INV-3614'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu:</span>
                    <span>{invoice.issueDate || '6/9/2026, 11.30.41'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pembeli:</span>
                    <span className="font-bold">{invoice.customerName || 'IWAN'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kasir/Operator:</span>
                    <span>Master Admin</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <p className="font-bold">{invoice.itemDescription || 'UNDANGAN HC-9912 X1'}</p>
                  <div className="flex justify-between text-slate-600">
                    <span>Harga Produk:</span>
                    <span className="font-bold font-mono">Rp {baseGoodsAmount.toLocaleString('id-ID')}</span>
                  </div>

                  {ongkirCargo > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Ongkir Cargo:</span>
                      <span className="font-bold font-mono">+ Rp {ongkirCargo.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {biayaPacking > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Packing:</span>
                      <span className="font-bold font-mono">+ Rp {biayaPacking.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {asuransi > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Asuransi:</span>
                      <span className="font-bold font-mono">+ Rp {asuransi.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {usePpn && calculatedPpn > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>PPN ({ppnPercent}%):</span>
                      <span className="font-bold font-mono">+ Rp {calculatedPpn.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="py-2.5 border-b border-dashed border-slate-400 flex justify-between items-center text-sm font-black">
                  <span>TOTAL TAGIHAN:</span>
                  <span className="font-mono">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Status */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Bayar:</span>
                    <span className={`font-bold ${
                      paymentStatus === 'LUNAS' ? 'text-emerald-700' :
                      paymentStatus === 'BELUM LUNAS' ? 'text-rose-700' :
                      paymentStatus === 'DP / SEBAGIAN' ? 'text-amber-700' :
                      paymentStatus === 'JATUH TEMPO' ? 'text-purple-700' : 'text-slate-700'
                    }`}>
                      {paymentStatus === 'CUSTOM' ? (customStampText || 'CUSTOM') : paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode:</span>
                    <span className="font-bold text-slate-800">{metodePembayaran || 'NON-TUNAI / ONLINE'}</span>
                  </div>
                </div>

                {/* Barcode */}
                <div className="pt-3 text-center space-y-1">
                  <div className="flex justify-center items-center gap-0.5 h-8">
                    {[3,1,4,2,5,1,3,4,2,5,1,4,2,3,5,1,4,2,5,3,1,4,2,5,1,3,4].map((h, i) => (
                      <div key={i} className="bg-black w-0.5" style={{ height: `${h * 5}px` }} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 font-bold tracking-widest">
                    *RESI-{invoice.id || 'INV-3614'}*
                  </p>
                  <p className="text-[9px] text-slate-400 pt-1 leading-tight">
                    Terima kasih telah bertransaksi di TRENS LOGISTIK<br />
                    Simpan resi ini sebagai bukti pembelian yang sah
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SURAT JALAN (DO) (Matching Screenshot 3) */}
            {activeTab === 'surat_jalan' && (
              <div className="space-y-4 text-slate-800">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-emerald-900 tracking-tight flex items-center gap-1.5 uppercase">
                      <Truck className="w-5 h-5 text-emerald-600" />
                      <span>SURAT JALAN (DO)</span>
                    </h2>
                    <p className="text-xs font-extrabold text-slate-600 font-mono mt-0.5">
                      DELIVERY ORDER NO: DO-{invoice.id || 'INV-3614'}
                    </p>
                  </div>

                  <div className="text-right">
                    <h3 className="text-base font-black text-blue-900 tracking-tight">
                      TRENS LOGISTIK
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      DIVISI LOGISTIK &amp; PENGIRIMAN CARGO
                    </p>
                  </div>
                </div>

                {/* Sender & Recipient Box */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                      <span>📦</span>
                      <span>PENGIRIM (SENDER):</span>
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                      {invoice.senderName || 'TRENS LOGISTIK WAREHOUSE'}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {invoice.senderAddress || `Gudang Utama Trens Logistik (${kotaAsal})`}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                      <span>👤</span>
                      <span>PENERIMA (TUJUAN):</span>
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                      {invoice.customerName || 'IWAN'}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {invoice.recipientAddress || `Alamat Terdaftar Klien Mitra (${kotaTujuan})`}
                    </p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-2 text-[11px] py-1 border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">TANGGAL KIRIM:</span>
                    <span className="font-bold text-slate-800 font-mono">{invoice.issueDate || '6/9/2026, 11.30.41'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">EKSPEDISI / KURIR:</span>
                    <span className="font-bold text-slate-800">Armada Internal / Expedited</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">STATUS PENGIRIMAN:</span>
                    <span className="font-black text-emerald-600 uppercase">SIAP KIRIM</span>
                  </div>
                </div>

                {/* Table Barang */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 bg-slate-50">
                      <th className="py-2 px-2 text-left w-10">NO</th>
                      <th className="py-2 px-2 text-left">NAMA &amp; URAIAN BARANG</th>
                      <th className="py-2 px-2 text-center w-24">KONDISI</th>
                      <th className="py-2 px-2 text-right w-24">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 px-2 font-mono font-bold">1.</td>
                      <td className="py-2.5 px-2">
                        <p className="font-bold text-slate-900">{invoice.itemDescription || 'UNDANGAN HC-9912 X1'}</p>
                        <p className="text-[10px] text-slate-500">
                          {invoice.resi ? `Resi: ${invoice.resi}` : ''} • {invoice.colly || 1} Colly • {estimasiBerat} Kg
                        </p>
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-700">BAIK</td>
                      <td className="py-2.5 px-2 text-right font-black text-emerald-700">LENGKAP</td>
                    </tr>
                  </tbody>
                </table>

                {/* Note */}
                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                  Catatan: Mohon periksa kembali kondisi dan kelengkapan fisik barang saat diterima. Segera tanda tangani Surat Jalan ini sebagai bukti penerimaan barang resmi.
                </p>

                {/* 3 Signature Columns */}
                <div className="pt-6 grid grid-cols-3 gap-3 text-center text-[10px]">
                  <div>
                    <p className="font-bold text-slate-600 uppercase">PENGIRIM (LOGISTIK)</p>
                    <div className="h-12" />
                    <p className="font-bold text-slate-900 border-t border-slate-900 pt-1 uppercase">
                      ( ADMIN )
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-600 uppercase">DRIVER / KURIR</p>
                    <div className="h-12" />
                    <p className="font-bold text-slate-900 border-t border-slate-900 pt-1 uppercase">
                      ( PETUGAS )
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-600 uppercase">PENERIMA BARANG</p>
                    <div className="h-12" />
                    <p className="font-bold text-slate-900 border-t border-slate-900 pt-1 uppercase">
                      ( {invoice.customerName || 'IWAN'} )
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS (Hidden on Print) */}
        <div className="print:hidden p-4 sm:p-5 bg-white border-t border-slate-200 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>UNDUH PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isCapturing}
              className="bg-[#4338CA] hover:bg-[#4338CA]/90 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isCapturing ? 'MEMPROSES...' : 'GAMBAR (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#1E293B] hover:bg-[#0F172A] text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>CETAK / PRINT</span>
            </button>

            <button
              type="button"
              onClick={handleSendWA}
              className="bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>KIRIM WA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              handleApplyChanges();
              onClose();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
          >
            TUTUP MODAL
          </button>
        </div>

      </div>
    </div>
  );
};
