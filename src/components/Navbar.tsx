import React, { useState } from 'react';
import { 
  Truck, 
  Phone, 
  Clock, 
  Menu, 
  X, 
  Search, 
  Calculator,
  MessageCircle,
  Handshake,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { OFFICE_PHONE, OFFICE_PHONE_DISPLAY, WA_NUMBER, WA_NUMBER_DISPLAY } from '../data/logisticData';

interface NavbarProps {
  onOpenKemitraanModal?: () => void;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenKemitraanModal, onOpenDashboard }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div id="topbar" className="bg-[#0B1B4D] text-white text-xs border-b border-blue-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-medium text-slate-200">
            <span>Layanan Kargo &amp; Logistik Terpercaya Seluruh Nusantara</span>
          </p>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden sm:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Sen–Jum: 08:00 – 17:00 WIB
            </span>
            <a 
              href={`tel:${OFFICE_PHONE}`} 
              className="flex items-center gap-1.5 text-white hover:text-amber-400 font-semibold transition-colors"
              title="Telepon Kantor"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" /> 
              <span>Telp: {OFFICE_PHONE_DISPLAY}</span>
            </a>
            <a 
              href={`https://wa.me/${WA_NUMBER}?text=Halo%20TRENS-LOGISTIC`} 
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              title="WhatsApp Hotline"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> 
              <span>WA: {WA_NUMBER_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header id="main-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <a href="#beranda" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 p-1 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <img 
                src="https://sc04.alicdn.com/kf/Sd6bcc0f091b4437b89123bed660abc13Z.jpg" 
                alt="Logo TRENS-LOGISTIC" 
                className="w-full h-full object-contain rounded-lg bg-white"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Truck className="w-5 h-5 text-white absolute" style={{ display: 'none' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#0B1B4D] text-lg tracking-tight">TRENS-LOGISTIC</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Resmi</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">Pengiriman Darat • Laut • Udara</p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-600">
            <a href="#beranda" className="hover:text-blue-700 transition-colors">Beranda</a>
            <a href="#layanan" className="hover:text-blue-700 transition-colors">Layanan</a>
            <a href="#coverage" className="hover:text-blue-700 transition-colors">Jangkauan</a>
            <a href="#visimisi" className="hover:text-blue-700 transition-colors">Visi &amp; Misi</a>
            <a href="#kalkulator" className="flex items-center gap-1 hover:text-blue-700 transition-colors">
              <Calculator className="w-4 h-4 text-blue-600" />
              Cek Tarif
            </a>
            <a href="#tracking" className="flex items-center gap-1 hover:text-blue-700 transition-colors">
              <Search className="w-4 h-4 text-indigo-600" />
              Tracking Resi
            </a>
            <a href="#kemitraan" className="flex items-center gap-1 hover:text-blue-700 text-blue-800 font-bold transition-colors">
              <Handshake className="w-4 h-4 text-amber-500" />
              Kemitraan
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Dashboard Admin CTA Button */}
            {onOpenDashboard && (
              <button
                id="btn-nav-dashboard"
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-1.5 bg-[#0B1B4D] hover:bg-blue-950 text-white hover:text-amber-300 font-bold px-3.5 py-2 text-xs rounded-xl shadow-xs border border-blue-900 transition-all hover:scale-102 cursor-pointer"
                title="Buka Dashboard Admin & Operasional"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Dashboard Admin</span>
              </button>
            )}

            {/* Daftar Kemitraan CTA Button */}
            <button
              id="btn-nav-kemitraan"
              onClick={onOpenKemitraanModal || (() => {
                const el = document.getElementById('kemitraan');
                el?.scrollIntoView({ behavior: 'smooth' });
              })}
              className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3.5 py-2 text-xs rounded-xl shadow-sm hover:shadow transition-all hover:scale-102"
              title="Daftar Kemitraan Pengiriman"
            >
              <Handshake className="w-3.5 h-3.5 text-amber-300" />
              <span>Daftar Kemitraan</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            {onOpenDashboard && (
              <button
                id="btn-nav-dashboard-mobile"
                onClick={onOpenDashboard}
                className="sm:hidden inline-flex items-center gap-1.5 bg-[#0B1B4D] hover:bg-blue-950 text-amber-300 font-bold px-2.5 py-1.5 text-xs rounded-xl border border-blue-900 shadow-xs"
                title="Buka Dashboard Admin"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>
            )}
            <button 
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 text-sm font-semibold shadow-xl">
            <a 
              href="#beranda" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700"
            >
              Beranda
            </a>
            <a 
              href="#layanan" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700"
            >
              Layanan (Darat, Laut, Udara)
            </a>
            <a 
              href="#coverage" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700"
            >
              Jangkauan Kota
            </a>
            <a 
              href="#visimisi" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
            >
              Visi &amp; Misi Perusahaan
            </a>
            <a 
              href="#kalkulator" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-blue-50 text-blue-700 rounded-lg font-bold"
            >
              Cek Tarif Ongkir
            </a>
            <a 
              href="#tracking" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-blue-50 text-blue-700 rounded-lg font-bold"
            >
              Lacak Nomor Resi
            </a>

            {onOpenDashboard && (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="w-full text-left py-2.5 px-3 bg-[#0B1B4D] hover:bg-blue-950 text-white rounded-lg font-bold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Dashboard Admin Operasional</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Live DB
                </span>
              </button>
            )}

            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenKemitraanModal) onOpenKemitraanModal();
                else {
                  document.getElementById('kemitraan')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full text-left py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg font-bold flex items-center gap-2"
            >
              <Handshake className="w-4 h-4 text-amber-600" />
              <span>Daftar Kemitraan Pengiriman</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
};
