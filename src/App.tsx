import React, { useState, useEffect } from 'react';
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
import { TrackingItem, AppViewMode } from './types';
import { seedInitialFirestoreData } from './firebase';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#dashboard') {
      return 'dashboard';
    }
    return 'website';
  });

  useEffect(() => {
    // Seed initial collections into Firebase Firestore if empty
    seedInitialFirestoreData().catch((err) => {
      console.warn('Firebase seeding notice:', err);
    });
  }, []);

  const [showKemitraanModal, setShowKemitraanModal] = useState<boolean>(false);
  const [printLabelData, setPrintLabelData] = useState<{ resi: string; track: TrackingItem } | null>(null);

  const handlePrintLabel = (resi: string, track: TrackingItem) => {
    setPrintLabelData({ resi, track });
  };

  // If in Dashboard View Mode
  if (viewMode === 'dashboard') {
    return (
      <div className="relative">
        <DashboardLayout
          onBackToWebsite={() => {
            window.location.hash = '';
            setViewMode('website');
          }}
          onPrintLabel={handlePrintLabel}
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
      />

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

    </div>
  );
}
