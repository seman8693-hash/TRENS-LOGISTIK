import React, { useState } from 'react';
import { 
  Handshake, 
  Search, 
  MessageCircle, 
  Building2, 
  Store, 
  Truck, 
  UserCheck, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { PartnerLead } from '../../types';

interface DashboardPartnersProps {
  partners: PartnerLead[];
  onUpdatePartnerStatus: (id: string, status: PartnerLead['status']) => void;
  onDeletePartner: (id: string) => void;
}

export const DashboardPartners: React.FC<DashboardPartnersProps> = ({
  partners,
  onUpdatePartnerStatus,
  onDeletePartner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  const filtered = partners.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.nama.toLowerCase().includes(q) ||
      (p.perusahaan && p.perusahaan.toLowerCase().includes(q)) ||
      p.kota.toLowerCase().includes(q) ||
      p.noHp.includes(q);

    const matchType = typeFilter === 'Semua' || p.tipe === typeFilter;
    const matchStatus = statusFilter === 'Semua' || p.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const getTipeBadge = (tipe: PartnerLead['tipe']) => {
    switch (tipe) {
      case 'agen':
        return { label: 'Gerai / Agen Drop Point', icon: Store, color: 'bg-blue-100 text-blue-800' };
      case 'armada':
        return { label: 'Mitra Armada & Transporter', icon: Truck, color: 'bg-amber-100 text-amber-800' };
      case 'korporat':
        return { label: 'Korporat / B2B Kontrak', icon: Building2, color: 'bg-indigo-100 text-indigo-800' };
      case 'kurir':
        return { label: 'Kurir Delivery', icon: UserCheck, color: 'bg-emerald-100 text-emerald-800' };
      default:
        return { label: 'Kemitraan', icon: Handshake, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const handleWhatsAppChat = (p: PartnerLead) => {
    const clean = p.noHp.replace(/[^0-9]/g, '');
    const phone = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
    const badge = getTipeBadge(p.tipe);
    
    const msg = `Halo Bapak/Ibu ${p.nama}, terima kasih atas ketertarikan Anda mendaftar sebagai *${badge.label}* di TRENS-LOGISTIC.%0A%0A` +
      `Kami dari Tim Kemitraan Pusat ingin menindaklanjuti data pendaftaran Anda untuk wilayah operasional *${encodeURIComponent(p.kota)}*.%0A` +
      `Apakah saat ini ada waktu luang untuk berdiskusi mengenai skema kerjasama & langkah selanjutnya?`;

    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-5">
      
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-600" />
              <span>Data Pendaftaran &amp; Calon Mitra</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar calon agen drop point, vendor armada transporter, dan klien korporat B2B
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {partners.length} Total Pendaftar
          </span>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, PT/toko, kota, nomor WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="Semua">Semua Kategori Kemitraan</option>
              <option value="agen">Gerai / Agen Drop Point</option>
              <option value="armada">Mitra Armada &amp; Transporter</option>
              <option value="korporat">Mitra Korporat &amp; B2B</option>
              <option value="kurir">Mitra Kurir Delivery</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="Semua">Semua Status Verifikasi</option>
              <option value="Menunggu">Menunggu Verifikasi</option>
              <option value="Dihubungi">Sudah Dihubungi</option>
              <option value="Disetujui">Disetujui / Aktif</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Calon Mitra</th>
                <th className="py-3.5 px-4">Kategori Kerjasama</th>
                <th className="py-3.5 px-4">Kota Operasional</th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Catatan / Profil</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">Tidak ada data pendaftaran kemitraan yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const badge = getTipeBadge(p.tipe);
                  const Icon = badge.icon;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Company */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.nama}</p>
                        {p.perusahaan && (
                          <p className="text-[11px] text-slate-500 font-medium">{p.perusahaan}</p>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {p.id}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {p.kota}
                      </td>

                      {/* Phone / WA */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-blue-900">
                        {p.noHp}
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        <p className="text-[11px] line-clamp-2 italic">
                          {p.pesan || '-'}
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={p.status}
                          onChange={(e) => onUpdatePartnerStatus(p.id, e.target.value as PartnerLead['status'])}
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none focus:ring-1 ${
                            p.status === 'Disetujui'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : p.status === 'Dihubungi'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : p.status === 'Menunggu'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="Menunggu">Menunggu</option>
                          <option value="Dihubungi">Dihubungi</option>
                          <option value="Disetujui">Disetujui</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleWhatsAppChat(p)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                            title="Buka Chat WhatsApp dengan Calon Mitra"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Follow Up</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data kemitraan ${p.nama}?`)) {
                                onDeletePartner(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
