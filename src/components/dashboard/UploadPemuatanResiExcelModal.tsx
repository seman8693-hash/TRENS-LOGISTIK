import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
  Package,
  Layers,
  Calculator,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ShipmentMode, TrackingItem, ShipmentStatus } from '../../types';
import { rupiah, CITIES, zonePair, MIN_BIAYA } from '../../data/logisticData';

interface UploadPemuatanResiExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRates: Record<ShipmentMode, Record<string, number>>;
  onApplyRates?: (newRates: Record<ShipmentMode, Record<string, number>>) => void;
  onBatchSaveShipments?: (newShipments: Record<string, TrackingItem>) => void;
}

export const ZONE_LABELS: Record<string, string> = {
  same: 'Dalam Satu Zona / Provinsi',
  jawaSumatera: 'Jawa ↔ Sumatera',
  jawaKalimantan: 'Jawa ↔ Kalimantan',
  jawaSulawesi: 'Jawa ↔ Sulawesi',
  jawaBali: 'Jawa ↔ Bali & NTB',
  jawaPapua: 'Jawa ↔ Papua & Maluku',
  cross: 'Antarpulau Lainnya (Luar Jawa)'
};

export const ZONE_KEYS = [
  'same',
  'jawaSumatera',
  'jawaKalimantan',
  'jawaSulawesi',
  'jawaBali',
  'jawaPapua',
  'cross'
];

function resolveZoneKey(input: string): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  for (const k of ZONE_KEYS) {
    if (s === k.toLowerCase() || s.replace(/[-_\s]/g, '') === k.toLowerCase()) {
      return k;
    }
  }

  if (s.includes('satu zona') || s.includes('provinsi') || s.includes('dalam satu') || s.includes('same')) {
    return 'same';
  }
  if (s.includes('sumatera') || s.includes('sumatra')) {
    return 'jawaSumatera';
  }
  if (s.includes('kalimantan') || s.includes('borneo')) {
    return 'jawaKalimantan';
  }
  if (s.includes('sulawesi') || s.includes('celebes')) {
    return 'jawaSulawesi';
  }
  if (s.includes('bali') || s.includes('ntb') || s.includes('nusa tenggara')) {
    return 'jawaBali';
  }
  if (s.includes('papua') || s.includes('maluku') || s.includes('iriam')) {
    return 'jawaPapua';
  }
  if (s.includes('cross') || s.includes('luar jawa') || s.includes('antarpulau') || s.includes('antar pulau')) {
    return 'cross';
  }

  return null;
}

function cleanNumber(val: any): number | null {
  if (typeof val === 'number') {
    return isNaN(val) ? null : Math.round(val);
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Generate random resi string if not supplied in Excel
 */
function generateResi(idx: number): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LN${yy}${mm}${dd}${rand}${idx > 0 ? idx : ''}`;
}

/**
 * Download sample template for Pemuatan Resi & Harga
 */
export function downloadShipmentsTemplate() {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    [
      'NO RESI',
      'NAMA BARANG',
      'KOTA ASAL',
      'KOTA TUJUAN',
      'MODA (Darat/Laut/Udara)',
      'PENGIRIM',
      'NO HP PENGIRIM',
      'PENERIMA',
      'NO HP PENERIMA',
      'ALAMAT PENERIMA',
      'BERAT (KG)',
      'HARGA / BIAYA (RP)',
      'CATATAN'
    ],
    [
      'LN26091201',
      'Katalog Percetakan & Kalender',
      'Jakarta',
      'Surabaya',
      'Darat',
      'PT Grafika Jaya',
      '081299887766',
      'Toko Berkah Media',
      '081377889900',
      'Jl. Pemuda No. 45 Surabaya',
      25,
      75000,
      'Packing kardus dobel'
    ],
    [
      'LN26091202',
      'Sparepart Pompa Industri',
      'Surabaya',
      'Balikpapan',
      'Laut',
      'CV Samudera Teknik',
      '082155667788',
      'PT Borneo Mandiri',
      '085244332211',
      'Kawasan Industri Kariangau Balikpapan',
      120,
      360000,
      'Muatan peti kayu berat'
    ],
    [
      'LN26091203',
      'Dokumen Tender & Sampel Tekstil',
      'Jakarta',
      'Makassar',
      'Udara',
      'PT Megah Sentosa',
      '081122334455',
      'Bpk. Hendra Wijaya',
      '081288991122',
      'Ruko Panakkukang Makassar',
      8,
      144000,
      'Prioritas kilat dokumen'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 15 }, // No Resi
    { wch: 30 }, // Nama Barang
    { wch: 16 }, // Kota Asal
    { wch: 16 }, // Kota Tujuan
    { wch: 22 }, // Moda
    { wch: 20 }, // Pengirim
    { wch: 16 }, // No HP Pengirim
    { wch: 22 }, // Penerima
    { wch: 16 }, // No HP Penerima
    { wch: 35 }, // Alamat Penerima
    { wch: 14 }, // Berat
    { wch: 18 }, // Biaya
    { wch: 25 }  // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Pemuatan Resi');
  XLSX.writeFile(wb, 'template-pemuatan-resi-harga.xlsx');
}

/**
 * Download sample template for Master Tarif
 */
export function downloadRatesTemplate() {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['KODE ZONA', 'NAMA RUTE / WILAYAH', 'DARAT (Rp/Kg)', 'LAUT (Rp/Kg)', 'UDARA (Rp/Kg)'],
    ['same', 'Dalam Satu Zona / Provinsi', 0, 0, 0],
    ['jawaSumatera', 'Jawa ↔ Sumatera', 0, 0, 0],
    ['jawaKalimantan', 'Jawa ↔ Kalimantan', 0, 0, 0],
    ['jawaSulawesi', 'Jawa ↔ Sulawesi', 0, 0, 0],
    ['jawaBali', 'Jawa ↔ Bali & NTB', 0, 0, 0],
    ['jawaPapua', 'Jawa ↔ Papua & Maluku', 0, 0, 0],
    ['cross', 'Antarpulau Lainnya (Luar Jawa)', 0, 0, 0]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 34 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Tarif Pengiriman');
  XLSX.writeFile(wb, 'template-tarif-rute.xlsx');
}

export const UploadPemuatanResiExcelModal: React.FC<UploadPemuatanResiExcelModalProps> = ({
  isOpen,
  onClose,
  currentRates,
  onApplyRates,
  onBatchSaveShipments
}) => {
  const [activeMode, setActiveMode] = useState<'shipments' | 'rates'>('shipments');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);

  // Parsed data states
  const [previewShipments, setPreviewShipments] = useState<Record<string, TrackingItem> | null>(null);
  const [previewRates, setPreviewRates] = useState<Record<ShipmentMode, Record<string, number>> | null>(null);
  const [detectedCount, setDetectedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setParsingError(null);
    setPreviewShipments(null);
    setPreviewRates(null);

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setParsingError('Format file tidak didukung. Harap upload file berekstensi .xlsx, .xls, atau .csv');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          setParsingError('Sheet pada file Excel tidak ditemukan atau kosong.');
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length < 2) {
          setParsingError('File Excel tidak memiliki baris data yang cukup. Pastikan terdapat baris judul/kolom dan baris data.');
          return;
        }

        const headerRow = rawRows[0].map((c: any) => String(c).trim().toLowerCase());

        // Detect if this is a Shipment manifest or a Rates matrix
        const isShipmentFormat = headerRow.some(h => 
          h.includes('barang') || h.includes('pengirim') || h.includes('penerima') || h.includes('resi') || h.includes('muatan')
        );

        const isRateFormat = headerRow.some(h => 
          (h.includes('darat') || h.includes('laut') || h.includes('udara')) && (h.includes('zona') || h.includes('rute') || h.includes('wilayah') || h.includes('tarif'))
        );

        const todayFormatted = new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const timeFormatted = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });

        if (isShipmentFormat || activeMode === 'shipments' && !isRateFormat) {
          // Parse as Shipments / Pemuatan Resi & Harga
          setActiveMode('shipments');

          const colResi = headerRow.findIndex(h => h.includes('resi') || h.includes('awb') || h.includes('no'));
          const colBarang = headerRow.findIndex(h => h.includes('barang') || h.includes('item') || h.includes('muatan') || h.includes('deskripsi'));
          const colAsal = headerRow.findIndex(h => h.includes('asal') || h.includes('origin') || h.includes('dari'));
          const colTujuan = headerRow.findIndex(h => h.includes('tujuan') || h.includes('destination') || h.includes('ke'));
          const colModa = headerRow.findIndex(h => h.includes('moda') || h.includes('jalur') || h.includes('tipe') || h.includes('transport'));
          const colSender = headerRow.findIndex(h => h.includes('pengirim') || h.includes('sender'));
          const colSenderPhone = headerRow.findIndex(h => (h.includes('pengirim') && (h.includes('hp') || h.includes('telp') || h.includes('wa'))) || h.includes('sender_phone'));
          const colRecipient = headerRow.findIndex(h => h.includes('penerima') || h.includes('recipient'));
          const colRecipientPhone = headerRow.findIndex(h => (h.includes('penerima') && (h.includes('hp') || h.includes('telp') || h.includes('wa'))) || h.includes('recipient_phone'));
          const colRecipientAddr = headerRow.findIndex(h => h.includes('alamat') || h.includes('address'));
          const colWeight = headerRow.findIndex(h => h.includes('berat') || h.includes('weight') || h.includes('kg'));
          const colCost = headerRow.findIndex(h => h.includes('harga') || h.includes('biaya') || h.includes('ongkir') || h.includes('tarif') || h.includes('cost') || h.includes('rp'));
          const colNotes = headerRow.findIndex(h => h.includes('catatan') || h.includes('notes') || h.includes('keterangan'));

          const parsedShipments: Record<string, TrackingItem> = {};
          let count = 0;

          for (let i = 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row || row.every((c: any) => String(c).trim() === '')) continue;

            const namaBarang = colBarang !== -1 && row[colBarang] ? String(row[colBarang]).trim() : `Paket Kargo #${i}`;
            const asalRaw = colAsal !== -1 && row[colAsal] ? String(row[colAsal]).trim() : 'Jakarta';
            const tujuanRaw = colTujuan !== -1 && row[colTujuan] ? String(row[colTujuan]).trim() : 'Surabaya';
            
            let modaVal: ShipmentMode = 'Darat';
            if (colModa !== -1 && row[colModa]) {
              const m = String(row[colModa]).toLowerCase();
              if (m.includes('laut') || m.includes('kapal')) modaVal = 'Laut';
              else if (m.includes('udara') || m.includes('pesawat') || m.includes('air')) modaVal = 'Udara';
            }

            const senderVal = colSender !== -1 && row[colSender] ? String(row[colSender]).trim() : 'Pengirim Express';
            const senderPhoneVal = colSenderPhone !== -1 && row[colSenderPhone] ? String(row[colSenderPhone]).trim() : '-';
            const recipientVal = colRecipient !== -1 && row[colRecipient] ? String(row[colRecipient]).trim() : 'Penerima Kargo';
            const recipientPhoneVal = colRecipientPhone !== -1 && row[colRecipientPhone] ? String(row[colRecipientPhone]).trim() : '-';
            const recipientAddrVal = colRecipientAddr !== -1 && row[colRecipientAddr] ? String(row[colRecipientAddr]).trim() : `${tujuanRaw}, Indonesia`;
            const weightVal = colWeight !== -1 ? (cleanNumber(row[colWeight]) || 5) : 5;

            // Calculate or take cost from Excel
            let costVal = colCost !== -1 ? cleanNumber(row[colCost]) : null;
            if (costVal === null || costVal < 0) {
              // Calculate from active rates
              const zAsal = CITIES[asalRaw.toLowerCase()]?.z || 'Jawa';
              const zTujuan = CITIES[tujuanRaw.toLowerCase()]?.z || 'Jawa';
              const pair = zonePair(zAsal, zTujuan);
              const rateKg = currentRates[modaVal]?.[pair] || 0;
              costVal = Math.max(MIN_BIAYA, weightVal * rateKg);
            }

            const notesVal = colNotes !== -1 && row[colNotes] ? String(row[colNotes]).trim() : 'Pemuatan massal dari Excel';
            const resiVal = (colResi !== -1 && row[colResi] && String(row[colResi]).trim().length >= 4)
              ? String(row[colResi]).trim().toUpperCase()
              : generateResi(i);

            const newItem: TrackingItem = {
              nama: namaBarang,
              rute: `${asalRaw} → ${tujuanRaw}`,
              moda: modaVal,
              status: 'Diproses' as ShipmentStatus,
              sender: senderVal,
              senderPhone: senderPhoneVal,
              recipient: recipientVal,
              recipientPhone: recipientPhoneVal,
              recipientAddress: recipientAddrVal,
              weight: weightVal,
              cost: costVal,
              date: todayFormatted,
              notes: notesVal,
              history: [
                {
                  w: `${todayFormatted} ${timeFormatted}`,
                  k: `Resi berhasil dimuat dari Manifest Excel. Paket dalam antrian proses Hub ${asalRaw}.`,
                  s: 'current'
                }
              ]
            };

            parsedShipments[resiVal] = newItem;
            count++;
          }

          if (count === 0) {
            setParsingError('Tidak ada data baris resi muatan yang terbaca. Pastikan ada baris data setelah header.');
            return;
          }

          setDetectedCount(count);
          setPreviewShipments(parsedShipments);

        } else {
          // Parse as Master Rates
          setActiveMode('rates');

          const newRates: Record<ShipmentMode, Record<string, number>> = {
            Darat: { ...currentRates.Darat },
            Laut: { ...currentRates.Laut },
            Udara: { ...currentRates.Udara }
          };

          let colDarat = headerRow.findIndex(h => h.includes('darat') || h.includes('truck') || h.includes('truk'));
          let colLaut = headerRow.findIndex(h => h.includes('laut') || h.includes('kapal') || h.includes('ship'));
          let colUdara = headerRow.findIndex(h => h.includes('udara') || h.includes('pesawat') || h.includes('air'));
          let colZone = headerRow.findIndex(h => h.includes('zona') || h.includes('zone') || h.includes('rute') || h.includes('wilayah'));

          let updatesCount = 0;

          if (colDarat !== -1 || colLaut !== -1 || colUdara !== -1) {
            if (colZone === -1) colZone = 0;

            for (let i = 1; i < rawRows.length; i++) {
              const row = rawRows[i];
              if (!row || row.length === 0) continue;

              const zoneRaw = String(row[colZone] || '').trim();
              const zoneRaw2 = row[1] ? String(row[1]).trim() : '';
              const zoneKey = resolveZoneKey(zoneRaw) || resolveZoneKey(zoneRaw2);

              if (!zoneKey) continue;

              if (colDarat !== -1) {
                const val = cleanNumber(row[colDarat]);
                if (val !== null && val >= 0) {
                  newRates.Darat[zoneKey] = val;
                  updatesCount++;
                }
              }
              if (colLaut !== -1) {
                const val = cleanNumber(row[colLaut]);
                if (val !== null && val >= 0) {
                  newRates.Laut[zoneKey] = val;
                  updatesCount++;
                }
              }
              if (colUdara !== -1) {
                const val = cleanNumber(row[colUdara]);
                if (val !== null && val >= 0) {
                  newRates.Udara[zoneKey] = val;
                  updatesCount++;
                }
              }
            }
          }

          if (updatesCount === 0) {
            setParsingError('Tidak ada data harga/tarif yang berhasil dikenali. Pastikan kolom memuat nama Zona/Rute dan kolom harga Darat, Laut, atau Udara.');
            return;
          }

          setDetectedCount(updatesCount);
          setPreviewRates(newRates);
        }

      } catch (err) {
        console.error('Failed to parse excel file:', err);
        setParsingError('Terjadi kesalahan saat memproses file Excel. Pastikan file tidak rusak atau terproteksi password.');
      }
    };

    reader.onerror = () => {
      setParsingError('Gagal membaca file dari komputer.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleApplyShipments = () => {
    if (!previewShipments || !onBatchSaveShipments) return;
    onBatchSaveShipments(previewShipments);
    onClose();
  };

  const handleApplyRates = () => {
    if (!previewRates || !onApplyRates) return;
    onApplyRates(previewRates);
    onClose();
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setPreviewShipments(null);
    setPreviewRates(null);
    setParsingError(null);
    setDetectedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="modal-upload-pemuatan-resi"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-[#0B1B4D] px-6 py-4 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-[#0B1B4D]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Upload &amp; Pemuatan Resi dari Excel
              </h2>
              <p className="text-xs text-blue-200">
                Pemuatan data muatan resi, harga pengiriman, dan manifest kargo secara massal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection: Pemuatan Resi & Harga OR Update Master Tarif */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveMode('shipments');
                handleResetFile();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'shipments'
                  ? 'bg-[#0B1B4D] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Pemuatan Resi &amp; Harga Kirim</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('rates');
                handleResetFile();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'rates'
                  ? 'bg-[#0B1B4D] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-blue-300" />
              <span>2. Master Tarif Ongkir (Rp/Kg)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeMode === 'shipments' ? (
              <button
                type="button"
                onClick={downloadShipmentsTemplate}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-600 hover:text-blue-700 font-bold text-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Unduh Template Resi &amp; Harga</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={downloadRatesTemplate}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-600 hover:text-blue-700 font-bold text-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Unduh Template Tarif Rute</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Upload Dropzone */}
          {!previewShipments && !previewRates && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-blue-600 bg-blue-50/70 scale-[1.01]' 
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>

                <p className="text-sm font-bold text-slate-800">
                  Pilih file Excel atau geser &amp; lepas file ke sini
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {activeMode === 'shipments' 
                    ? 'Upload spreadsheet manifest pengiriman berisi Nama Barang, Rute, Pengirim, Penerima, Berat, dan Harga.'
                    : 'Upload daftar harga tarif ongkir per rute untuk Kargo Darat, Laut, dan Udara.'}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0B1B4D] hover:bg-blue-900 text-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Jelajahi File Komputer</span>
                </div>
              </div>

              {parsingError && (
                <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Gagal memproses file</p>
                    <p className="mt-0.5">{parsingError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview: Shipments / Pemuatan Resi & Harga */}
          {previewShipments && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    File <strong>{selectedFile?.name}</strong> berhasil dibaca (<strong>{detectedCount} resi &amp; harga muatan</strong> siap diterbitkan).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ganti File</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Pratinjau Data Resi &amp; Harga yang Akan Dimuat</span>
                  <span className="text-[11px] font-normal text-slate-500">Periksa detail sebelum menyimpan</span>
                </div>

                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 z-10">
                      <tr>
                        <th className="py-2.5 px-3">No Resi</th>
                        <th className="py-2.5 px-3">Nama Barang</th>
                        <th className="py-2.5 px-3">Rute &amp; Moda</th>
                        <th className="py-2.5 px-3">Pengirim / Penerima</th>
                        <th className="py-2.5 px-3">Berat</th>
                        <th className="py-2.5 px-3 text-right">Harga / Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {(Object.entries(previewShipments) as [string, TrackingItem][]).map(([resiKey, item]) => (
                        <tr key={resiKey} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                            {resiKey}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-800">{item.nama}</p>
                            {item.notes && <p className="text-[10px] text-slate-400 italic">{item.notes}</p>}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium text-slate-700">{item.rute}</p>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {item.moda}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="text-slate-800 font-medium">Dari: {item.sender}</p>
                            <p className="text-slate-500 text-[11px]">Ke: {item.recipient}</p>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                            {item.weight} Kg
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                            {rupiah(item.cost || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Preview: Master Rates */}
          {previewRates && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    File <strong>{selectedFile?.name}</strong> berhasil dibaca ({detectedCount} titik tarif terdeteksi).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ganti File</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Perbandingan Tarif Baru vs Tarif Aktif (per Kg)</span>
                  <span className="text-[11px] font-normal text-slate-500">Perubahan disorot otomatis</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                        <th className="py-2.5 px-3">Rute / Wilayah</th>
                        <th className="py-2.5 px-3">Kargo Darat</th>
                        <th className="py-2.5 px-3">Kargo Laut</th>
                        <th className="py-2.5 px-3">Kargo Udara</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {ZONE_KEYS.map((key) => {
                        const label = ZONE_LABELS[key] || key;

                        const oldDarat = currentRates.Darat?.[key] || 0;
                        const newDarat = previewRates.Darat?.[key] || 0;
                        const diffDarat = newDarat - oldDarat;

                        const oldLaut = currentRates.Laut?.[key] || 0;
                        const newLaut = previewRates.Laut?.[key] || 0;
                        const diffLaut = newLaut - oldLaut;

                        const oldUdara = currentRates.Udara?.[key] || 0;
                        const newUdara = previewRates.Udara?.[key] || 0;
                        const diffUdara = newUdara - oldUdara;

                        const renderCell = (oldVal: number, newVal: number, diff: number) => {
                          const isChanged = diff !== 0;
                          return (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold ${isChanged ? 'text-blue-900 font-extrabold' : 'text-slate-800'}`}>
                                  {rupiah(newVal)}
                                </span>
                                {isChanged && (
                                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                                    diff > 0 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {diff > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                    {diff > 0 ? `+${rupiah(diff)}` : `-${rupiah(Math.abs(diff))}`}
                                  </span>
                                )}
                              </div>
                              {isChanged && (
                                <p className="text-[10px] text-slate-400 line-through">
                                  Lama: {rupiah(oldVal)}
                                </p>
                              )}
                            </div>
                          );
                        };

                        return (
                          <tr key={key} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-slate-800">{label}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{key}</span>
                            </td>
                            <td className="py-2.5 px-3">{renderCell(oldDarat, newDarat, diffDarat)}</td>
                            <td className="py-2.5 px-3">{renderCell(oldLaut, newLaut, diffLaut)}</td>
                            <td className="py-2.5 px-3">{renderCell(oldUdara, newUdara, diffUdara)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          {previewShipments ? (
            <button
              type="button"
              id="btn-apply-excel-shipments"
              onClick={handleApplyShipments}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Muat &amp; Terbitkan {detectedCount} Resi ke Sistem</span>
            </button>
          ) : previewRates ? (
            <button
              type="button"
              id="btn-apply-excel-rates"
              onClick={handleApplyRates}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Terapkan &amp; Simpan Tarif Baru</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Silakan pilih file Excel untuk melihat pratinjau data
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
