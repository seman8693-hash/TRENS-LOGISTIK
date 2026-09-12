import React from 'react';
import { 
  Printer, 
  X, 
  Truck, 
  Ship, 
  Plane, 
  QrCode, 
  Barcode, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  Scale, 
  Calendar 
} from 'lucide-react';
import { TrackingItem } from '../types';
import { rupiah } from '../data/logisticData';

interface PrintShippingLabelModalProps {
  resi: string;
  track: TrackingItem;
  onClose: () => void;
}

export const PrintShippingLabelModal: React.FC<PrintShippingLabelModalProps> = ({
  resi,
  track,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Top Control Bar (Hidden during window.print via @media print) */}
        <div className="print:hidden bg-[#0B1B4D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Cetak Label Pengiriman / Surat Jalan</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-300 text-[#0B1B4D] font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 sm:p-8 print:p-0 bg-slate-100/50 print:bg-white flex justify-center">
          <div 
            id="shipping-label-printable" 
            className="w-full max-w-[520px] bg-white border-2 border-slate-900 p-5 rounded-xl text-slate-900 font-sans shadow-sm print:border-2 print:border-black print:rounded-none"
          >
            {/* Header: Logo & Mode */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-900 text-white p-1 flex items-center justify-center font-black text-xs">
                  TL
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight leading-none text-blue-950">TRENS-LOGISTIC</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Layanan Darat • Laut • Udara</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black rounded uppercase">
                  MODA {track.moda}
                </span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">TL-AWB-V2</p>
              </div>
            </div>

            {/* Barcode & Resi Big Header */}
            <div className="py-4 border-b-2 border-slate-900 text-center bg-slate-50 print:bg-transparent">
              <p className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-slate-950">
                {resi}
              </p>
              {/* Simulated Barcode */}
              <div className="my-2 flex justify-center items-center gap-0.5 h-10 px-4">
                {[4,2,6,1,3,5,2,4,7,1,3,6,2,5,3,1,4,6,2,3,5,1,4,2,7,3,2,5,1,4,3,6,2,4,1,5,3,2,6,4].map((h, i) => (
                  <div key={i} className="bg-black w-1 rounded-xs" style={{ height: `${h * 5}px` }} />
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-700 tracking-wider">
                RUTE: <span className="text-blue-900 uppercase">{track.rute}</span>
              </p>
            </div>

            {/* Sender & Recipient Grid */}
            <div className="grid grid-cols-2 divide-x-2 divide-slate-900 border-b-2 border-slate-900 text-xs">
              {/* Pengirim */}
              <div className="p-3 space-y-1">
                <span className="block text-[10px] font-black uppercase text-slate-500">PENGIRIM (FROM)</span>
                <p className="font-extrabold text-slate-900 text-sm">{track.sender || 'Customer TRENS'}</p>
                <p className="text-slate-700">{track.senderPhone || '-'}</p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {track.senderAddress || `Asal: ${track.rute.split('→')[0]?.trim() || 'Hub Asal'}`}
                </p>
              </div>

              {/* Penerima */}
              <div className="p-3 space-y-1">
                <span className="block text-[10px] font-black uppercase text-slate-500">PENERIMA (TO)</span>
                <p className="font-extrabold text-slate-900 text-sm">{track.recipient || 'Penerima Barang'}</p>
                <p className="text-slate-700">{track.recipientPhone || '-'}</p>
                <p className="text-[11px] text-slate-600 leading-snug">{track.recipientAddress || `Tujuan: ${track.rute.split('→')[1]?.trim() || 'Hub Tujuan'}`}</p>
              </div>
            </div>

            {/* Cargo Specs */}
            <div className="grid grid-cols-4 divide-x-2 divide-slate-900 border-b-2 border-slate-900 text-center text-xs py-2">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">DESKRIPSI</span>
                <span className="font-bold text-slate-900 truncate block px-1">{track.nama}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">COLLY / KOLI</span>
                <span className="font-black text-slate-900">{track.colly ? `${track.colly} Koli` : '1 Koli'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">BERAT</span>
                <span className="font-black text-slate-900">{track.weight ? `${track.weight} kg` : '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold">BIAYA ONGKIR</span>
                <span className="font-bold text-slate-900">{track.cost ? rupiah(track.cost) : 'LUNAS / COD'}</span>
              </div>
            </div>

            {/* Instructions & Footer */}
            <div className="pt-3 text-[10px] text-slate-600 space-y-1 flex justify-between items-end">
              <div>
                <p className="font-bold text-slate-800">Petunjuk Khusus:</p>
                <p>{track.notes || 'Handle with care • Jangan dibanting • Fragile'}</p>
                <p className="text-[9px] text-slate-400 mt-1">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="text-center font-bold text-slate-900 border border-slate-900 px-2 py-1 rounded">
                <p className="text-[9px] uppercase">Tanda Tangan Penerima</p>
                <div className="h-8 w-24"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
