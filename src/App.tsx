import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LayananSection } from './components/LayananSection';
import { CaraKerjaSection } from './components/CaraKerjaSection';
import { CoverageSection } from './components/CoverageSection';
import { KalkulatorSection } from './components/KalkulatorSection';
import { TrackingSection } from './components/TrackingSection';
import { TestimoniFaqSection } from './components/TestimoniFaqSection';
import { KemitraanSection } from './components/KemitraanSection';
import { KemitraanModal } from './components/KemitraanModal';
import { LokasiFooter } from './components/LokasiFooter';
import { PrintShippingLabelModal } from './components/PrintShippingLabelModal';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AdminLoginModal } from './components/dashboard/AdminLoginModal';
import { isAdminLoggedIn, clearAdminSession } from './utils/adminAuth';
import { TrackingItem, AppViewMode } from './types';

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => isAdminLoggedIn());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.hash === '#dashboard')) {
      return !isAdminLoggedIn();
    }
    return false;
  });

  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.hash === '#dashboard')) {
      return isAdminLoggedIn() ? 'dashboard' : 'website';
    }
    return 'website';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#dashboard') {
        if (isAdminLoggedIn()) {
          setIsAdminAuthenticated(true);
          setViewMode('dashboard');
        } else {
          setViewMode('website');
          setShowLoginModal(true);
        }
      } else {
        setViewMode('website');
      }
    };

    const handlePopState = () => handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Dynamic SEO Title & Robots Controller for single-page routing & Admin protection
  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (viewMode === 'dashboard') {
      document.title = 'Dashboard Admin & Operasional — TRENS-LOGISTIC';
      if (robotsMeta) robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      const hash = window.location.hash;
      if (hash === '#tracking') {
        document.title = 'Lacak Resi Pengiriman Real-Time — TRENS-LOGISTIC';
      } else if (hash === '#kalkulator') {
        document.title = 'Cek Tarif & Ongkir Volumetrik Cargo — TRENS-LOGISTIC';
      } else if (hash === '#layanan') {
        document.title = 'Layanan Ekspedisi Darat, Laut & Udara — TRENS-LOGISTIC';
      } else if (hash === '#kemitraan') {
        document.title = 'Program Kemitraan Ekspedisi & Keagenan — TRENS-LOGISTIC';
      } else if (hash === '#coverage') {
        document.title = 'Jangkauan Rute Pengiriman se-Nusantara — TRENS-LOGISTIC';
      } else {
        document.title = 'TRENS-LOGISTIC — Ekspedisi Darat, Laut & Udara';
      }
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }
  }, [viewMode]);

  const [showKemitraanModal, setShowKemitraanModal] = useState<boolean>(false);
  const [printLabelData, setPrintLabelData] = useState<{ resi: string; track: TrackingItem } | null>(null);

  const handlePrintLabel = (resi: string, track: TrackingItem) => {
    setPrintLabelData({ resi, track });
  };

  const handleOpenDashboard = () => {
    if (isAdminAuthenticated || isAdminLoggedIn()) {
      setIsAdminAuthenticated(true);
      window.history.pushState({}, '', '/admin');
      setViewMode('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowLoginModal(false);
    window.history.pushState({}, '', '/admin');
    setViewMode('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutAdmin = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
    window.history.pushState({}, '', '/');
    setViewMode('website');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Dashboard View Mode
  if (viewMode === 'dashboard') {
    return (
      <div className="relative">
        <DashboardLayout
          onBackToWebsite={() => {
            window.history.pushState({}, '', '/');
            setViewMode('website');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onPrintLabel={handlePrintLabel}
          onLogout={handleLogoutAdmin}
        />

        {/* Modal: Print Thermal / Shipping Label AWB */}
        {printLabelData && (
          <PrintShippingLabelModal
            resi={printLabelData.resi}
            track={printLabelData.track}
            onClose={() => setPrintLabelData(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* 1. Header & Navigation */}
      <Navbar 
        onOpenKemitraanModal={() => setShowKemitraanModal(true)}
        onOpenDashboard={handleOpenDashboard}
      />

      {/* 2. Hero Section with Value Propositions & Quick Check */}
      <HeroSection 
        onOpenKemitraanModal={() => setShowKemitraanModal(true)}
      />

      {/* 3. Layanan (Darat, Laut, Udara) */}
      <LayananSection />

      {/* 4. Cara Kerja & Visi Misi */}
      <CaraKerjaSection />

      {/* 5. Jangkauan Kota & Keunggulan Layanan */}
      <CoverageSection />

      {/* 6. Program Kemitraan Pengiriman (Agen, Armada, B2B, Kurir) */}
      <KemitraanSection 
        onOpenKemitraanModal={() => setShowKemitraanModal(true)}
      />

      {/* 7. Kalkulator Tarif Volumetrik & Ongkir */}
      <KalkulatorSection />

      {/* 8. Tracking Resi dengan Checkpoint Timeline */}
      <TrackingSection 
        onPrintLabel={handlePrintLabel}
      />

      {/* 9. Testimoni Pelanggan & FAQ */}
      <TestimoniFaqSection />

      {/* 10. Lokasi Kantor, Google Maps, Footer & Floating WhatsApp */}
      <LokasiFooter 
        onOpenKemitraanModal={() => setShowKemitraanModal(true)}
        onOpenDashboard={handleOpenDashboard}
      />

      {/* Quick Switcher Dock: Jump to Dashboard Admin */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
        <button
          id="btn-floating-dashboard"
          onClick={handleOpenDashboard}
          className="group bg-[#0B1B4D] hover:bg-blue-950 text-white font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-blue-800/90 flex items-center gap-2.5 text-xs transition-all hover:scale-105 cursor-pointer"
          title="Buka Dashboard Admin Logistik & Operasional"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#0B1B4D]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 font-extrabold">Dashboard Admin</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-blue-200 font-normal">Live Integrasi Website</p>
          </div>
        </button>
      </div>

      {/* Modal: Pendaftaran Kemitraan Pengiriman */}
      <KemitraanModal 
        isOpen={showKemitraanModal}
        onClose={() => setShowKemitraanModal(false)}
      />

      {/* Modal: Print Thermal / Shipping Label AWB */}
      {printLabelData && (
        <PrintShippingLabelModal
          resi={printLabelData.resi}
          track={printLabelData.track}
          onClose={() => setPrintLabelData(null)}
        />
      )}

      {/* Modal: Otorisasi Login Password Admin */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onSuccess={handleLoginSuccess}
        onCancel={() => {
          setShowLoginModal(false);
          if (window.location.pathname === '/admin' || window.location.hash === '#dashboard') {
            window.history.pushState({}, '', '/');
          }
        }}
      />

    </div>
  );
}
