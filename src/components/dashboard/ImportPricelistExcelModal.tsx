import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PricelistRouteItem, ShipmentMode } from '../../types';
import { downloadPricelistTemplate } from '../../data/pricelistData';

interface ImportPricelistExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRoutes: PricelistRouteItem[]) => void;
}

export const ImportPricelistExcelModal: React.FC<ImportPricelistExcelModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedItems, setParsedItems] = useState<PricelistRouteItem[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!json || json.length === 0) {
          setErrorMsg('File Excel / CSV kosong atau tidak ada data yang terbaca.');
          setIsProcessing(false);
          return;
        }

        const items: PricelistRouteItem[] = [];

        json.forEach((row, idx) => {
          // Normalize column keys
          const keys = Object.keys(row);
          const getVal = (colNames: string[]) => {
            for (const col of colNames) {
              const matched = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, ''));
              if (matched && row[matched] !== undefined && row[matched] !== '') {
                return row[matched];
              }
            }
            return '';
          };

          const asal = String(getVal(['kotaasal', 'asal', 'origin', 'dari']) || 'Jakarta Barat').trim();
          const tujuan = String(getVal(['kotatujuan', 'kabtujuan', 'tujuan', 'destination', 'ke']) || '').trim();
          const rawModa = String(getVal(['jalur', 'moda', 'mode', 'transportasi']) || 'Darat').toLowerCase();
          const layanan = String(getVal(['layanan', 'service', 'jenispengiriman']) || 'Cargo Regular').trim();
          const rawVendor = String(getVal(['vendor', 'kurir', 'ekspedisi']) || 'trens-log').trim();
          const vendor = rawVendor.toLowerCase() === 'solap' ? 'trens-log' : (rawVendor || 'trens-log');
          const rawTarif = String(getVal(['tarifongkirkg', 'tarifkg', 'tarif', 'ongkirkg', 'harga', 'hargajual']) || '0');
          const rawModal = String(getVal(['modalkg', 'modal', 'hargamodal']) || '0');
          const rawMinBerat = String(getVal(['minimalberat', 'minberat', 'minweight', 'minimal']) || '50');
          const leadTime = String(getVal(['leadtime', 'estimasi', 'waktu', 'hari', 'durasi']) || '2-4 Hari').trim();

          if (!tujuan) return; // Skip if no destination

          let moda: ShipmentMode = 'Darat';
          if (rawModa.includes('laut') || rawModa.includes('sea')) moda = 'Laut';
          else if (rawModa.includes('udara') || rawModa.includes('air') || rawModa.includes('pesawat')) moda = 'Udara';

          const tarifKg = parseInt(rawTarif.replace(/[^0-9]/g, ''), 10) || 5000;
          const modalKg = parseInt(rawModal.replace(/[^0-9]/g, ''), 10) || 0;
          const minimalBerat = parseInt(rawMinBerat.replace(/[^0-9]/g, ''), 10) || 50;

          const margin = modalKg > 0 && tarifKg > modalKg ? Math.round(((tarifKg - modalKg) / modalKg) * 100) : undefined;

          items.push({
            id: `excel-${Date.now()}-${idx}`,
            kotaAsal: asal,
            kotaTujuan: tujuan,
            moda,
            layanan,
            vendor,
            tarifKg,
            modalKg: modalKg > 0 ? modalKg : undefined,
            marginPercent: margin,
            minimalBerat,
            leadTime
          });
        });

        if (items.length === 0) {
          setErrorMsg('Tidak ditemukan baris rute yang valid. Pastikan terdapat kolom "Kota Tujuan" dan "Tarif Ongkir".');
        } else {
          setParsedItems(items);
        }
      } catch (err: any) {
        setErrorMsg('Gagal membaca file Excel/CSV: ' + (err.message || 'Format tidak didukung'));
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Gagal memproses file.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleApply = () => {
    if (parsedItems.length === 0) return;
    onImport(parsedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#059669] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Import Excel / CSV Pricelist Rute</h3>
              <p className="text-xs text-emerald-100">
                Muat ratusan data rute kargo &amp; tarif ongkir per kg secara instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Belum punya format file yang cocok?</h4>
              <p className="text-[11px] text-emerald-700">Gunakan template resmi kami untuk hasil import 100% akurat.</p>
            </div>
            <button
              onClick={downloadPricelistTemplate}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel (.xlsx)</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {fileName ? fileName : 'Klik untuk Pilih File Excel / CSV'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Mendukung format .XLSX, .XLS, atau .CSV dengan kolom rute, tarif, dan moda
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Data Siap Diimpor ({parsedItems.length} Rute)
                </span>
                <span className="text-[11px] text-slate-400">Menampilkan 5 baris teratas</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0B1B4D] text-white text-[11px]">
                    <tr>
                      <th className="py-2 px-3">ASAL</th>
                      <th className="py-2 px-3">TUJUAN</th>
                      <th className="py-2 px-3">JALUR</th>
                      <th className="py-2 px-3">TARIF / KG</th>
                      <th className="py-2 px-3">MIN BERAT</th>
                      <th className="py-2 px-3">LEAD TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.slice(0, 5).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-600">{item.kotaAsal}</td>
                        <td className="py-2 px-3 font-bold text-blue-700">{item.kotaTujuan}</td>
                        <td className="py-2 px-3 text-slate-700">
                          {item.moda === 'Darat' ? '🚛 Darat' : item.moda === 'Laut' ? '🚢 Laut' : '✈️ Udara'}
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-600">
                          Rp {item.tarifKg.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3">{item.minimalBerat} Kg</td>
                        <td className="py-2 px-3 text-slate-500">{item.leadTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedItems.length === 0 || isProcessing}
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
            >
              <span>Terapkan {parsedItems.length} Rute ke Pricelist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
