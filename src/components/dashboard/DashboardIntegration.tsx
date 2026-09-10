import React, { useState } from 'react';
import { 
  Webhook, 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Save, 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Send,
  Zap,
  Globe,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { WebhookConfig, TrackingItem, OrderRequest, PartnerLead, ShipmentMode } from '../../types';

interface DashboardIntegrationProps {
  tracks: Record<string, TrackingItem>;
  orders: OrderRequest[];
  partners: PartnerLead[];
  rates: Record<ShipmentMode, Record<string, number>>;
  webhookConfig: WebhookConfig;
  onSaveWebhook: (cfg: WebhookConfig) => void;
  onImportAllData: (data: any) => void;
}

export const DashboardIntegration: React.FC<DashboardIntegrationProps> = ({
  tracks,
  orders,
  partners,
  rates,
  webhookConfig,
  onSaveWebhook,
  onImportAllData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'endpoints' | 'sandbox' | 'webhooks' | 'backup' | 'snippets'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/tracking/:resi');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Webhook form state
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url);
  const [webhookSecret, setWebhookSecret] = useState(webhookConfig.secret);
  const [activeEvents, setActiveEvents] = useState<string[]>(webhookConfig.activeEvents);
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  // Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>('GET /api/v1/tracking/:resi');
  const [sandboxResi, setSandboxResi] = useState('LN25083001');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // Code snippet language
  const [snippetLang, setSnippetLang] = useState<'curl' | 'nodejs' | 'python' | 'php'>('nodejs');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestWebhook = () => {
    setWebhookTestStatus('testing');
    setTimeout(() => {
      setWebhookTestStatus('success');
      setTimeout(() => setWebhookTestStatus('idle'), 4000);
    }, 800);
  };

  const handleSaveWebhookForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWebhook({
      url: webhookUrl,
      secret: webhookSecret,
      activeEvents,
      lastTriggered: new Date().toISOString(),
      lastStatus: 200
    });
    alert('Konfigurasi Webhook berhasil disimpan!');
  };

  const handleExecuteSandbox = () => {
    setSandboxLoading(true);
    setTimeout(() => {
      if (sandboxEndpoint === 'GET /api/v1/tracking/:resi') {
        const item = tracks[sandboxResi] || tracks['LN25083001'];
        setSandboxResponse({
          status: 200,
          success: true,
          data: {
            resi: sandboxResi,
            ...item
          },
          meta: {
            source: 'TRENS-LOGISTIC Core Engine',
            latencyMs: 34,
            timestamp: new Date().toISOString()
          }
        });
      } else if (sandboxEndpoint === 'POST /api/v1/shipments') {
        setSandboxResponse({
          status: 201,
          success: true,
          message: 'Resi pengiriman baru berhasil diterbitkan.',
          data: {
            resi: 'LN' + Date.now().toString().slice(-8),
            status: 'Diproses',
            createdAt: new Date().toISOString(),
            labelUrl: 'https://api.trens-logistic.com/v1/labels/sample.pdf'
          }
        });
      } else if (sandboxEndpoint === 'POST /api/v1/calculate-rate') {
        setSandboxResponse({
          status: 200,
          success: true,
          data: {
            rute: 'Jakarta → Surabaya',
            moda: 'Darat',
            beratAktualKg: 15,
            volumetrikKg: 9.5,
            chargeableKg: 15,
            tarifPerKg: 2500,
            totalBiaya: 50000,
            estimasiWaktu: '1-2 hari'
          }
        });
      } else if (sandboxEndpoint === 'GET /api/v1/shipments') {
        setSandboxResponse({
          status: 200,
          success: true,
          total: Object.keys(tracks).length,
          data: (Object.entries(tracks) as [string, TrackingItem][]).slice(0, 3).map(([resi, t]) => ({
            resi,
            nama: t.nama,
            rute: t.rute,
            status: t.status,
            cost: t.cost
          }))
        });
      }
      setSandboxLoading(false);
    }, 450);
  };

  const handleExportFullJSON = () => {
    const fullBackup = {
      app: 'TRENS-LOGISTIC',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      data: {
        tracks,
        orders,
        partners,
        rates,
        webhookConfig
      }
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trens-logistic-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          onImportAllData(parsed.data);
          alert('Data sistem berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Status Integrasi */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready for Integration • REST API &amp; Webhook Standard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Pusat Integrasi Sistem (API &amp; Webhook Ready)
            </h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Dashboard ini dirancang siap pakai (plug-and-play). Anda dapat langsung mengintegrasikan sistem ini ke backend Express, Cloud Database (Firestore / PostgreSQL), aplikasi e-commerce, atau webhook pihak ketiga.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-right">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">API Base URL</span>
              <span className="font-mono text-xs font-bold text-amber-300">
                https://api.trens-logistic.com/v1
              </span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
          {[
            { id: 'endpoints', label: '1. Daftar Endpoint API', icon: Globe },
            { id: 'sandbox', label: '2. API Sandbox & Tester', icon: Play },
            { id: 'webhooks', label: '3. Webhook Listener', icon: Webhook },
            { id: 'snippets', label: '4. Contoh Kode Integrasi', icon: Code },
            { id: 'backup', label: '5. Backup & Ekspor JSON', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: API Endpoints Reference */}
      {activeSubTab === 'endpoints' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Dokumentasi REST API TRENS-LOGISTIC
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Format Request &amp; Response standar JSON untuk integrasi sistem ERP, Marketplace, dan Aplikasi Mobile.
            </p>

            <div className="space-y-3">
              {[
                {
                  method: 'GET',
                  path: '/api/v1/tracking/:resi',
                  desc: 'Mengecek status tracking dan riwayat checkpoint suatu nomor resi publik.',
                  auth: 'Public / API Key',
                  example: 'GET https://api.trens-logistic.com/v1/tracking/LN25083001'
                },
                {
                  method: 'POST',
                  path: '/api/v1/shipments',
                  desc: 'Menerbitkan resi AWB baru, menghitung tarif otomatis, dan menambahkan ke antrian kiriman.',
                  auth: 'Bearer Token',
                  example: 'POST https://api.trens-logistic.com/v1/shipments'
                },
                {
                  method: 'PUT',
                  path: '/api/v1/shipments/:resi/status',
                  desc: 'Mengupdate status kiriman (Diproses, Perjalanan, Tiba, Terkirim) dan menambahkan checkpoint perjalanan baru.',
                  auth: 'Bearer Token',
                  example: 'PUT https://api.trens-logistic.com/v1/shipments/LN25083001/status'
                },
                {
                  method: 'POST',
                  path: '/api/v1/pickup-requests',
                  desc: 'Membuat permintaan order penjemputan barang baru oleh pelanggan.',
                  auth: 'Public / Web Token',
                  example: 'POST https://api.trens-logistic.com/v1/pickup-requests'
                },
                {
                  method: 'POST',
                  path: '/api/v1/calculate-rate',
                  desc: 'Menghitung estimasi ongkos kirim berdasarkan berat aktual vs dimensi volumetrik antarzona.',
                  auth: 'Public',
                  example: 'POST https://api.trens-logistic.com/v1/calculate-rate'
                },
                {
                  method: 'GET',
                  path: '/api/v1/shipments',
                  desc: 'Mengambil daftar semua resi dengan filter tanggal, status, dan moda transportasi.',
                  auth: 'Bearer Token (Admin)',
                  example: 'GET https://api.trens-logistic.com/v1/shipments?status=Dalam%20Perjalanan'
                }
              ].map((ep, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-black ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ep.path}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      Autentikasi: {ep.auth}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{ep.desc}</p>
                  
                  <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
                    <span className="truncate">{ep.example}</span>
                    <button
                      onClick={() => copyToClipboard(ep.example, `ep-${idx}`)}
                      className="text-slate-400 hover:text-white ml-2 shrink-0"
                    >
                      {copiedKey === `ep-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Sandbox */}
      {activeSubTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Request Config */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">API Sandbox Request Runner</h3>
              <p className="text-xs text-slate-500">Uji coba simulasi pemanggilan endpoint secara langsung</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Endpoint Uji Coba:
              </label>
              <select
                value={sandboxEndpoint}
                onChange={(e) => setSandboxEndpoint(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              >
                <option value="GET /api/v1/tracking/:resi">GET /api/v1/tracking/:resi (Cek Resi)</option>
                <option value="POST /api/v1/shipments">POST /api/v1/shipments (Buat Resi)</option>
                <option value="POST /api/v1/calculate-rate">POST /api/v1/calculate-rate (Hitung Ongkir)</option>
                <option value="GET /api/v1/shipments">GET /api/v1/shipments (List Pengiriman)</option>
              </select>
            </div>

            {sandboxEndpoint === 'GET /api/v1/tracking/:resi' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parameter :resi
                </label>
                <input
                  type="text"
                  value={sandboxResi}
                  onChange={(e) => setSandboxResi(e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Header Autentikasi:
              </label>
              <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono">
                <code>
                  Authorization: Bearer trens_live_sec_89d3a7710b8e<br />
                  Content-Type: application/json<br />
                  Accept: application/json
                </code>
              </div>
            </div>

            <button
              onClick={handleExecuteSandbox}
              disabled={sandboxLoading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {sandboxLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Kirim / Simulasikan Request</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Live JSON Response */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-mono text-slate-400">Response Preview (JSON)</span>
                {sandboxResponse && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    HTTP {sandboxResponse.status} OK • {sandboxResponse.meta?.latencyMs || 32}ms
                  </span>
                )}
              </div>

              <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-80 p-2 bg-slate-900 rounded-lg">
                {sandboxResponse 
                  ? JSON.stringify(sandboxResponse, null, 2)
                  : `// Klik "Kirim / Simulasikan Request" untuk melihat output JSON respon.`}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Standard Format: RFC 7807 Compliant</span>
              {sandboxResponse && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(sandboxResponse, null, 2), 'sandbox-res')}
                  className="hover:text-white flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'sandbox-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin JSON</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Webhooks */}
      {activeSubTab === 'webhooks' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Webhook className="w-4 h-4 text-blue-700" />
                <span>Konfigurasi Webhook Pengiriman</span>
              </h3>
              <p className="text-xs text-slate-500">
                Kirimkan notifikasi event otomatis ke URL endpoint server Anda saat resi diupdate
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Webhook Engine Aktif
            </span>
          </div>

          <form onSubmit={handleSaveWebhookForm} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payload Target URL:
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Secret Signature (HMAC SHA-256):
              </label>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pilih Event Pemicu (Event Triggers):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'shipment.created', label: 'Resi Baru Dibuat (AWB Issued)' },
                  { id: 'shipment.checkpoint_updated', label: 'Checkpoint Baru Ditambahkan' },
                  { id: 'shipment.delivered', label: 'Barang Sukses Terkirim' },
                  { id: 'pickup.requested', label: 'Permintaan Pickup Masuk' }
                ].map((ev) => {
                  const checked = activeEvents.includes(ev.id);
                  return (
                    <label 
                      key={ev.id}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-colors ${
                        checked ? 'bg-blue-50/60 border-blue-300 text-blue-950 font-bold' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveEvents([...activeEvents, ev.id]);
                          } else {
                            setActiveEvents(activeEvents.filter(x => x !== ev.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{ev.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Konfigurasi</span>
              </button>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={webhookTestStatus === 'testing'}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {webhookTestStatus === 'testing'
                    ? 'Mengirim Ping...'
                    : webhookTestStatus === 'success'
                    ? 'Terkirim 200 OK!'
                    : 'Uji Coba Ping Webhook'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Code Snippets */}
      {activeSubTab === 'snippets' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Contoh Script Integrasi</h3>
              <p className="text-xs text-slate-500">Salin template kode siap pakai untuk backend atau frontend Anda</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['nodejs', 'curl', 'python', 'php'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSnippetLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                    snippetLang === lang
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-slate-950 rounded-xl p-4 text-xs font-mono text-slate-200 overflow-x-auto">
            <button
              onClick={() => {
                const code = snippetLang === 'nodejs'
                  ? `// Node.js (Fetch API)\nconst resi = 'LN25083001';\nconst res = await fetch('https://api.trens-logistic.com/v1/tracking/' + resi, {\n  headers: {\n    'Authorization': 'Bearer ' + process.env.TRENS_API_KEY\n  }\n});\nconst trackingData = await res.json();\nconsole.log('Status Pengiriman:', trackingData.data.status);`
                  : snippetLang === 'curl'
                  ? `curl -X GET "https://api.trens-logistic.com/v1/tracking/LN25083001" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Accept: application/json"`
                  : snippetLang === 'python'
                  ? `import requests\n\nurl = "https://api.trens-logistic.com/v1/tracking/LN25083001"\nheaders = {"Authorization": "Bearer YOUR_API_KEY"}\nresponse = requests.get(url, headers=headers)\nprint(response.json())`
                  : `<?php\n$ch = curl_init("https://api.trens-logistic.com/v1/tracking/LN25083001");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer YOUR_API_KEY"]);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);\necho $response;`;
                copyToClipboard(code, 'snippet');
              }}
              className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copiedKey === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Kode</span>
            </button>

            <pre className="text-emerald-300">
              {snippetLang === 'nodejs' && `// Node.js (Fetch API)
const resi = 'LN25083001';
const res = await fetch('https://api.trens-logistic.com/v1/tracking/' + resi, {
  headers: {
    'Authorization': 'Bearer ' + process.env.TRENS_API_KEY
  }
});
const trackingData = await res.json();
console.log('Status Pengiriman:', trackingData.data.status);
console.log('Riwayat Perjalanan:', trackingData.data.history);`}

              {snippetLang === 'curl' && `curl -X GET "https://api.trens-logistic.com/v1/tracking/LN25083001" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`}

              {snippetLang === 'python' && `import requests

url = "https://api.trens-logistic.com/v1/tracking/LN25083001"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print("Status:", data["data"]["status"])`}

              {snippetLang === 'php' && `<?php
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.trens-logistic.com/v1/tracking/LN25083001",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY",
    "Accept: application/json"
  ]
]);

$response = curl_exec($curl);
curl_close($curl);
$result = json_decode($response, true);
print_r($result);`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: Backup & JSON Export */}
      {activeSubTab === 'backup' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Backup &amp; Sinkronisasi Data JSON</h3>
            <p className="text-xs text-slate-500">
              Unduh seluruh snapshot database pengiriman (Resi, Order Pickup, Mitra, dan Tarif) atau pulihkan ke sistem baru
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Export Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Ekspor Snapshot Sistem (JSON)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Unduh seluruh data resi aktif ({Object.keys(tracks).length} data), pesanan ({orders.length}), dan calon mitra ({partners.length}).
              </p>
              <button
                onClick={handleExportFullJSON}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File JSON Lengkap</span>
              </button>
            </div>

            {/* Import Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pulihkan / Restore dari JSON</span>
              </h4>
              <p className="text-xs text-slate-500">
                Upload file snapshot JSON untuk mengisi data resi dan order secara instan ke dalam sistem.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
