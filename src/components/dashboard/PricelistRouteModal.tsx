import React, { useState, useEffect } from 'react';
import { X, MapPin, Calculator, Truck, Clock, DollarSign, Package } from 'lucide-react';
import { PricelistRouteItem, ShipmentMode } from '../../types';

interface PricelistRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (route: PricelistRouteItem) => void;
  editItem?: PricelistRouteItem | null;
}

export const PricelistRouteModal: React.FC<PricelistRouteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem
}) => {
  const [kotaAsal, setKotaAsal] = useState('Jakarta Barat');
  const [kotaTujuan, setKotaTujuan] = useState('');
  const [moda, setModa] = useState<ShipmentMode>('Darat');
  const [layanan, setLayanan] = useState('Cargo Regular');
  const [vendor, setVendor] = useState('trens-log');
  const [tarifKg, setTarifKg] = useState<number>(5000);
  const [modalKg, setModalKg] = useState<number>(3500);
  const [minimalBerat, setMinimalBerat] = useState<number>(50);
  const [leadTime, setLeadTime] = useState('2-3 Hari Kerja');

  useEffect(() => {
    if (editItem) {
      setKotaAsal(editItem.kotaAsal);
      setKotaTujuan(editItem.kotaTujuan);
      setModa(editItem.moda);
      setLayanan(editItem.layanan);
      setVendor(editItem.vendor?.toLowerCase() === 'solap' ? 'trens-log' : editItem.vendor);
      setTarifKg(editItem.tarifKg);
      setModalKg(editItem.modalKg || 0);
      setMinimalBerat(editItem.minimalBerat);
      setLeadTime(editItem.leadTime);
    } else {
      setKotaAsal('Jakarta Barat');
      setKotaTujuan('');
      setModa('Darat');
      setLayanan('Cargo Regular');
      setVendor('trens-log');
      setTarifKg(5000);
      setModalKg(3500);
      setMinimalBerat(50);
      setLeadTime('2-3 Hari Kerja');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const margin = modalKg > 0 && tarifKg > modalKg ? Math.round(((tarifKg - modalKg) / modalKg) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kotaTujuan.trim()) {
      alert('Mohon isi kota / kabupaten tujuan!');
      return;
    }
    if (tarifKg <= 0) {
      alert('Tarif ongkir per kg harus lebih dari 0!');
      return;
    }

    const newItem: PricelistRouteItem = {
      id: editItem ? editItem.id : `rt-${Date.now()}`,
      kotaAsal: kotaAsal.trim(),
      kotaTujuan: kotaTujuan.trim(),
      moda,
      layanan: layanan.trim(),
      vendor: vendor.trim() || 'trens-log',
      tarifKg,
      modalKg: modalKg > 0 ? modalKg : undefined,
      marginPercent: margin > 0 ? margin : undefined,
      minimalBerat: minimalBerat > 0 ? minimalBerat : 1,
      leadTime: leadTime.trim() || '2-4 Hari'
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B1B4D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-xl text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {editItem ? 'Edit Rute Pricelist' : '+ Tambah Manual Rute Cargo'}
              </h3>
              <p className="text-xs text-blue-200">
                Lengkapi data tarif jual, modal, berat minimum, dan estimasi waktu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Kota Asal</span>
              </label>
              <input
                type="text"
                required
                value={kotaAsal}
                onChange={(e) => setKotaAsal(e.target.value)}
                placeholder="contoh: Tangerang / Jakarta Barat"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kota / Kab Tujuan</span>
              </label>
              <input
                type="text"
                required
                value={kotaTujuan}
                onChange={(e) => setKotaTujuan(e.target.value)}
                placeholder="contoh: Purwakarta / Semarang"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jalur / Moda</label>
              <select
                value={moda}
                onChange={(e) => setModa(e.target.value as ShipmentMode)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Darat">🚛 Darat</option>
                <option value="Laut">🚢 Laut</option>
                <option value="Udara">✈️ Udara</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Layanan</label>
              <input
                type="text"
                value={layanan}
                onChange={(e) => setLayanan(e.target.value)}
                placeholder="Cargo Regular / Super"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Kurir</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="trens-log / kurir"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Tarif Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tarif Ongkir / Kg (Jual)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={tarifKg || ''}
                    onChange={(e) => setTarifKg(Number(e.target.value))}
                    className="w-full text-xs font-bold pl-8 pr-3 py-2 rounded-xl border border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-emerald-800 bg-emerald-50/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harga Modal / Kg (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={modalKg || ''}
                    onChange={(e) => setModalKg(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {modalKg > 0 && (
              <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500">Estimasi Margin Keuntungan:</span>
                <span className={`font-bold ${margin >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  +{margin}% (Untung Rp {(tarifKg - modalKg).toLocaleString('id-ID')}/kg)
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Minimal Berat (Kg)</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={minimalBerat || ''}
                onChange={(e) => setMinimalBerat(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Lead Time / Estimasi</span>
              </label>
              <input
                type="text"
                required
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="2-3 Hari Kerja / 7-8 HARI"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

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
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B1B4D] hover:bg-blue-900 rounded-xl shadow-sm transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
            >
              <span>{editItem ? 'Simpan Perubahan' : 'Tambah Ke Pricelist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
