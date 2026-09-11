import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  FileText, 
  Handshake, 
  Calculator, 
  Webhook, 
  ArrowLeft, 
  Plus, 
  LayoutDashboard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Printer, 
  LogOut,
  Bell,
  Search,
  ExternalLink,
  BriefcaseBusiness,
  ReceiptText
} from 'lucide-react';
import { 
  DashboardTab, 
  TrackingItem, 
  OrderRequest, 
  PartnerLead, 
  ShipmentMode, 
  WebhookConfig,
  ShipmentStatus
} from '../../types';
import { 
  getStoredTracks, 
  saveStoredTracks, 
  getStoredRequests, 
  saveStoredRequests, 
  getStoredPartners, 
  saveStoredPartners, 
  getStoredRates, 
  saveStoredRates,
  getStoredWebhook,
  saveStoredWebhook,
  DEFAULT_RATES,
  INITIAL_SAMPLE_TRACKS,
  SAMPLE_RESIS
} from '../../data/logisticData';
import {
  subscribeShipments,
  subscribeOrders,
  subscribePartners,
  saveShipmentToDb,
  saveOrderToDb,
  savePartnerToDb
} from '../../firebase';

import { DashboardOverview } from './DashboardOverview';
import { DashboardShipments } from './DashboardShipments';
import { DashboardOrders } from './DashboardOrders';
import { DashboardPartners } from './DashboardPartners';
import { DashboardRates } from './DashboardRates';
import { DashboardIntegration } from './DashboardIntegration';
import { DashboardAdmin } from './DashboardAdmin';
import { DashboardInvoices } from './DashboardInvoices';
import { CreateShipmentModal } from './CreateShipmentModal';
import { UpdateCheckpointModal } from './UpdateCheckpointModal';

interface DashboardLayoutProps {
  onBackToWebsite: () => void;
  onPrintLabel: (resi: string, item: TrackingItem) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  onBackToWebsite,
  onPrintLabel
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Master State with LocalStorage & Firestore Sync
  const [tracks, setTracks] = useState<Record<string, TrackingItem>>(() => getStoredTracks());
  const [orders, setOrders] = useState<OrderRequest[]>(() => getStoredRequests());
  const [partners, setPartners] = useState<PartnerLead[]>([]);
  const [rates, setRates] = useState<Record<ShipmentMode, Record<string, number>>>(() => getStoredRates());
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(() => getStoredWebhook());

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    const unsubShipments = subscribeShipments((liveShipments) => {
      const localTracks = getStoredTracks();
      const filteredShipments = Object.fromEntries(
        Object.entries(liveShipments).filter(([resi]) => !SAMPLE_RESIS.has(resi))
      );
      if (Object.keys(localTracks).length === 0) {
        setTracks({});
      } else if (Object.keys(filteredShipments).length > 0) {
        setTracks((prev) => {
          const merged = { ...prev, ...filteredShipments };
          saveStoredTracks(merged);
          return merged;
        });
      }
    });

    const unsubOrders = subscribeOrders((liveOrders) => {
      const localOrders = getStoredRequests();
      if (localOrders.length === 0) {
        setOrders([]);
      } else if (liveOrders.length > 0) {
        setOrders(liveOrders);
        saveStoredRequests(liveOrders);
      }
    });

    const unsubPartners = subscribePartners((livePartners) => {
      const localPartners = getStoredPartners();
      if (localPartners.length === 0) {
        setPartners([]);
      } else if (livePartners.length > 0) {
        setPartners(livePartners);
        saveStoredPartners(livePartners);
      }
    });

    return () => {
      unsubShipments();
      unsubOrders();
      unsubPartners();
    };
  }, []);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updateResiTarget, setUpdateResiTarget] = useState<string | null>(null);

  // Sync to Storage
  const updateTracksState = (newTracks: Record<string, TrackingItem>) => {
    setTracks(newTracks);
    saveStoredTracks(newTracks);
  };

  const updateOrdersState = (newOrders: OrderRequest[]) => {
    setOrders(newOrders);
    saveStoredRequests(newOrders);
  };

  const updatePartnersState = (newPartners: PartnerLead[]) => {
    setPartners(newPartners);
    saveStoredPartners(newPartners);
  };

  const updateRatesState = (newRates: Record<ShipmentMode, Record<string, number>>) => {
    setRates(newRates);
    saveStoredRates(newRates);
  };

  const updateWebhookState = (newWebhook: WebhookConfig) => {
    setWebhookConfig(newWebhook);
    saveStoredWebhook(newWebhook);
  };

  // Handlers with Firestore Persistence
  const handleSaveNewShipment = (resi: string, item: TrackingItem) => {
    const updated = { [resi]: item, ...tracks };
    updateTracksState(updated);
    saveShipmentToDb(resi, item).catch(err => console.warn('Firestore save shipment error:', err));
  };

  const handleUpdateShipment = (resi: string, updatedItem: TrackingItem) => {
    const updated = { ...tracks, [resi]: updatedItem };
    updateTracksState(updated);
    saveShipmentToDb(resi, updatedItem).catch(err => console.warn('Firestore update shipment error:', err));
  };

  const handleDeleteShipment = (resi: string) => {
    const copy = { ...tracks };
    delete copy[resi];
    updateTracksState(copy);
  };

  const handleUpdateOrderStatus = (id: string, status: OrderRequest['status']) => {
    const target = orders.find((o) => o.id === id);
    if (target) {
      const updatedItem = { ...target, status };
      saveOrderToDb(updatedItem).catch(err => console.warn('Firestore update order error:', err));
    }
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    updateOrdersState(updated);
  };

  const handleDeleteOrder = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    updateOrdersState(updated);
  };

  const handleConvertOrderToShipment = (order: OrderRequest) => {
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newItem: TrackingItem = {
      nama: order.barang,
      rute: order.rute,
      moda: order.moda,
      status: 'Diproses' as ShipmentStatus,
      sender: order.nama,
      senderPhone: order.hp,
      recipient: 'Penerima (' + order.rute.split('→')[1]?.trim() + ')',
      recipientPhone: '-',
      recipientAddress: order.rute.split('→')[1]?.trim() || 'Alamat Tujuan',
      weight: order.berat,
      cost: order.estimasiBiaya || 100000,
      date: todayFormatted,
      notes: order.catatan || 'Order penjemputan dari website',
      photoUrl: order.photoUrl,
      photoTimestamp: order.photoUrl ? `${todayFormatted} ${timeFormatted}` : undefined,
      history: [
        {
          w: `${todayFormatted} ${timeFormatted}`,
          k: `Order pickup ID ${order.id} telah dikonfirmasi dan diproses ke antrian armada.`,
          s: 'current'
        }
      ]
    };

    updateTracksState({ [order.resi]: newItem, ...tracks });
    saveShipmentToDb(order.resi, newItem).catch(err => console.warn('Firestore convert shipment error:', err));
    handleUpdateOrderStatus(order.id, 'Diproses');
    alert(`Order ${order.id} berhasil dikonversi menjadi Resi Aktif: ${order.resi}`);
    setActiveTab('shipments');
  };

  const handleUpdatePartnerStatus = (id: string, status: PartnerLead['status']) => {
    const target = partners.find((p) => p.id === id);
    if (target) {
      const updatedItem = { ...target, status };
      savePartnerToDb(updatedItem).catch(err => console.warn('Firestore update partner error:', err));
    }
    const updated = partners.map((p) => (p.id === id ? { ...p, status } : p));
    updatePartnersState(updated);
  };

  const handleDeletePartner = (id: string) => {
    const updated = partners.filter((p) => p.id !== id);
    updatePartnersState(updated);
  };

  const handleImportAllData = (imported: any) => {
    if (imported.tracks) updateTracksState(imported.tracks);
    if (imported.orders) updateOrdersState(imported.orders);
    if (imported.partners) updatePartnersState(imported.partners);
    if (imported.rates) updateRatesState(imported.rates);
    if (imported.webhookConfig) updateWebhookState(imported.webhookConfig);
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'Baru').length;
  const pendingPartnersCount = partners.filter(p => p.status === 'Menunggu').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <header className="bg-[#0B1B4D] text-white sticky top-0 z-40 shadow-md border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Brand & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToWebsite}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Kembali ke Halaman Website Publik"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Website Utama</span>
              </button>

              <div className="h-6 w-px bg-white/20 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-sm">
                  <Truck className="w-5 h-5 text-[#0B1B4D]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                      TRENS-LOGISTIC
                    </span>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                      Dashboard
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-200 hidden sm:block">
                    Sistem Operasional Kargo &amp; Manajemen Resi Terpadu
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Action & Profile */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud Firestore Terhubung</span>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-102"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Input Resi Baru</span>
                <span className="sm:hidden">Resi</span>
              </button>

              <button
                onClick={onBackToWebsite}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Keluar ke Website"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#08153d] border-t border-white/5 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-1.5">
            {[
              { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'admin', label: 'Admin', icon: BriefcaseBusiness },
              { id: 'invoices', label: 'Invoice', icon: ReceiptText },
              { id: 'shipments', label: `Resi & Kargo (${Object.keys(tracks).length})`, icon: Package },
              { 
                id: 'orders', 
                label: 'Order Pickup', 
                icon: FileText,
                badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
              },
              { 
                id: 'partners', 
                label: 'Calon Mitra', 
                icon: Handshake,
                badge: pendingPartnersCount > 0 ? pendingPartnersCount : undefined
              },
              { id: 'rates', label: 'Tarif & Rute', icon: Calculator },
              { id: 'integration', label: 'Integrasi API & Webhook', icon: Webhook, highlight: true }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                    active
                      ? 'bg-white text-blue-950 shadow-xs'
                      : tab.highlight
                      ? 'text-amber-300 hover:bg-white/10 hover:text-amber-200'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.highlight && !active ? 'text-amber-400' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            tracks={tracks}
            orders={orders}
            partners={partners}
            onNavigateTab={setActiveTab}
            onOpenCreateShipment={() => setIsCreateOpen(true)}
            onSelectUpdateResi={(resi) => setUpdateResiTarget(resi)}
            onPrintLabel={onPrintLabel}
          />
        )}

        {activeTab === 'admin' && (
          <DashboardAdmin
            tracks={tracks}
            orders={orders}
            partners={partners}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'invoices' && (
          <DashboardInvoices tracks={tracks} orders={orders} />
        )}

        {activeTab === 'shipments' && (
          <DashboardShipments
            tracks={tracks}
            onOpenCreateShipment={() => setIsCreateOpen(true)}
            onSelectUpdateResi={(resi) => setUpdateResiTarget(resi)}
            onPrintLabel={onPrintLabel}
            onDeleteResi={handleDeleteShipment}
          />
        )}

        {activeTab === 'orders' && (
          <DashboardOrders
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onConvertToShipment={handleConvertOrderToShipment}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeTab === 'partners' && (
          <DashboardPartners
            partners={partners}
            onUpdatePartnerStatus={handleUpdatePartnerStatus}
            onDeletePartner={handleDeletePartner}
          />
        )}

        {activeTab === 'rates' && (
          <DashboardRates
            rates={rates}
            onSaveRates={updateRatesState}
            onResetRates={() => updateRatesState(DEFAULT_RATES)}
          />
        )}

        {activeTab === 'integration' && (
          <DashboardIntegration
            tracks={tracks}
            orders={orders}
            partners={partners}
            rates={rates}
            webhookConfig={webhookConfig}
            onSaveWebhook={updateWebhookState}
            onImportAllData={handleImportAllData}
          />
        )}
      </main>

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 TRENS-LOGISTIC System Engine • Siap diintegrasikan ke REST API, Webhooks, Supabase, Firestore, atau ERP.</p>
      </footer>

      {/* Modal: Input Resi Baru */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNewShipment}
      />

      {/* Modal: Update Checkpoint Resi */}
      {updateResiTarget && tracks[updateResiTarget] && (
        <UpdateCheckpointModal
          isOpen={!!updateResiTarget}
          resi={updateResiTarget}
          item={tracks[updateResiTarget]}
          onClose={() => setUpdateResiTarget(null)}
          onUpdate={handleUpdateShipment}
        />
      )}

    </div>
  );
};
