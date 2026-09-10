import { HtmlTemplate } from '../types';

export const MAIN_STANDALONE_HTML = `<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TRENS-LOGISTIC — Layanan Logistik Darat, Laut & Udara</title>
  <meta name="description" content="Layanan terpercaya spesialis kiriman kargo darat, laut, dan udara ke seluruh pelosok nusantara dengan kalkulator ongkir & tracking resi online." />
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">

  <!-- TOP BAR -->
  <div class="bg-[#0B1B4D] text-white text-xs border-b border-blue-950/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
      <p class="flex items-center gap-2 font-medium">
        <span class="text-amber-400">🎁</span>
        <span>Gratis penjemputan paket (Free Pickup) &amp; konsultasi tarif armada</span>
      </p>
      <div class="flex items-center gap-5 text-slate-300">
        <span class="hidden sm:inline">🕒 Sen–Jum: 08:00 – 17:00 WIB</span>
        <a href="tel:081389755106" class="text-white hover:text-amber-400 font-bold transition-colors">
          📞 0813-8975-5106
        </a>
        <a href="https://wa.me/6285694310979" target="_blank" class="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
          💬 WA: 0856-9431-0979
        </a>
      </div>
    </div>
  </div>

  <!-- NAVBAR -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
      <a href="#beranda" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-xl shadow-md">
          TL
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-[#0B1B4D] text-lg tracking-tight">TRENS-LOGISTIC</span>
            <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Resmi</span>
          </div>
          <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Pengiriman Darat • Laut • Udara</p>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
        <a href="#beranda" class="hover:text-blue-700 transition-colors">Beranda</a>
        <a href="#layanan" class="hover:text-blue-700 transition-colors">Layanan</a>
        <a href="#kalkulator" class="text-blue-700 hover:text-blue-800 font-bold transition-colors">Cek Tarif</a>
        <a href="#tracking" class="text-indigo-700 hover:text-indigo-800 font-bold transition-colors">Lacak Resi</a>
        <a href="#pesan" class="hover:text-blue-700 transition-colors">Pemesanan</a>
        <a href="#kemitraan" class="text-blue-800 hover:text-blue-900 font-bold transition-colors">Kemitraan</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="https://wa.me/6281280005183?text=Halo%20TRENS-LOGISTIC%2C%20saya%20tertarik%20mendaftar%20Kemitraan%20Pengiriman." target="_blank" class="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5">
          <span>🤝 Daftar Kemitraan</span>
        </a>
      </div>
    </div>
  </header>

  <!-- HERO SECTION -->
  <section id="beranda" class="relative overflow-hidden bg-gradient-to-b from-[#0B1B4D] via-[#102A72] to-[#0B1B4D] text-white py-16 lg:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      <div class="grid lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Armada Siap Jalan Hari Ini ke Seluruh Indonesia
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Solusi Pengiriman Kargo <span class="text-amber-400">Darat, Laut &amp; Udara</span> Terpercaya
          </h1>
          <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            Kirim barang pindahan, kargo pabrik, alat berat, hingga paket retail dengan tarif transparan, jaminan aman, dan pemantauan resi langsung secara real-time.
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <a href="#kalkulator" class="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-sm">
              🧮 Hitung Ongkir Sekarang
            </a>
            <a href="#tracking" class="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm">
              🔍 Lacak Nomor Resi
            </a>
          </div>

          <div class="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center sm:text-left">
            <div>
              <div class="text-2xl font-black text-amber-400">500+</div>
              <div class="text-xs text-slate-300">Kota &amp; Kabupaten</div>
            </div>
            <div>
              <div class="text-2xl font-black text-amber-400">100%</div>
              <div class="text-xs text-slate-300">Bergaransi &amp; Aman</div>
            </div>
            <div>
              <div class="text-2xl font-black text-amber-400">24/7</div>
              <div class="text-xs text-slate-300">Customer Support</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 bg-white text-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100">
          <h2 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span>⚡ Quick Cek Resi</span>
          </h2>
          <p class="text-xs text-slate-500 mb-4">Cek status paket Anda secara instan</p>
          <div class="space-y-3">
            <div class="relative">
              <input 
                id="quick-resi-input"
                type="text" 
                placeholder="Contoh: LN2408001 / LN2408002"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <button 
              onclick="cekResiCepat()"
              class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md"
            >
              Lacak Pengiriman
            </button>
            <div class="text-[11px] text-slate-400 text-center">
              Resi simulasi demo: <span class="text-blue-600 font-bold cursor-pointer" onclick="document.getElementById('quick-resi-input').value='LN2408001'; cekResiCepat();">LN2408001</span> | <span class="text-blue-600 font-bold cursor-pointer" onclick="document.getElementById('quick-resi-input').value='LN2408002'; cekResiCepat();">LN2408002</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LAYANAN UTAMA -->
  <section id="layanan" class="py-16 max-w-7xl mx-auto px-4 sm:px-6">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0B1B4D]">Layanan Logistik Lengkap</h2>
      <p class="text-sm text-slate-600 mt-2">Disesuaikan dengan kebutuhan muatan, kecepatan, dan anggaran bisnis Anda</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-2xl border-2 border-amber-500/40 shadow-sm hover:shadow-lg transition-all">
        <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mb-4 font-bold">
          ⚡
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Same Day Service</h3>
        <p class="text-xs text-slate-600 leading-relaxed mb-4">
          Layanan pengiriman kilat prioritas tinggi dengan proses penjemputan dan pengantaran langsung tiba di hari yang sama.
        </p>
        <ul class="text-xs text-slate-700 space-y-1.5 border-t border-slate-100 pt-3">
          <li>⚡ Pickup &amp; delivery di hari yang sama.</li>
          <li>🏢 Prioritas untuk area/kota besar.</li>
          <li>📦 Cocok untuk dokumen &amp; paket urgent.</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl mb-4 font-bold">
          🚛
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Kargo Darat (Trucking &amp; Ro-Ro)</h3>
        <p class="text-xs text-slate-600 leading-relaxed mb-4">
          Layanan armada Truk CDD, Fuso, Tronton, Wingbox, hingga via Kapal RoRo untuk pengiriman antar pulau se-Jawa, Bali, Sumatera &amp; NTB.
        </p>
        <ul class="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
          <li>✓ Sewa Truk Full (FTL) &amp; Eceran (LTL)</li>
          <li>✓ Door to Door Service</li>
          <li>✓ Penjemputan di lokasi pabrik/gudang</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl mb-4 font-bold">
          🚢
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Kargo Laut (Kontainer &amp; Curah)</h3>
        <p class="text-xs text-slate-600 leading-relaxed mb-4">
          Spesialis kiriman bertonase besar ke Kalimantan, Sulawesi, Maluku, dan Papua dengan kontainer 20ft/40ft (FCL/LCL) dan kapal kargo.
        </p>
        <ul class="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
          <li>✓ Pengiriman Kontainer FCL &amp; LCL</li>
          <li>✓ Angkutan Alat Berat &amp; Proyek</li>
          <li>✓ Jadwal pelayaran rutin mingguan</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-2xl mb-4 font-bold">
          ✈️
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Kargo Udara (Ekspres Kilat)</h3>
        <p class="text-xs text-slate-600 leading-relaxed mb-4">
          Solusi pengiriman dokumen penting, sampel komoditas, dan barang darurat dengan penerbangan kargo tercepat 1-2 hari sampai.
        </p>
        <ul class="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
          <li>✓ Prioritas Port-to-Door &amp; Port-to-Port</li>
          <li>✓ Estimasi 24 - 48 Jam</li>
          <li>✓ Handling khusus barang bernilai tinggi</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- KALKULATOR TARIF ONGKIR -->
  <section id="kalkulator" class="py-16 bg-gradient-to-b from-slate-100 to-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8">
        <span class="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100 px-3 py-1 rounded-full">Hitung Otomatis</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0B1B4D] mt-2">Kalkulator Ongkir &amp; Berat Volumetrik</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">Sistem menghitung nilai tertinggi antara berat fisik aktual vs berat volumetrik kargo</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div class="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kota Asal</label>
            <select id="calc-asal" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-600">
              <option value="Jakarta">Jakarta (Hub Utama)</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Semarang">Semarang</option>
              <option value="Bandung">Bandung</option>
              <option value="Medan">Medan</option>
              <option value="Makassar">Makassar</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kota Tujuan</label>
            <select id="calc-tujuan" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-600">
              <option value="Surabaya">Surabaya</option>
              <option value="Semarang">Semarang</option>
              <option value="Bandung">Bandung</option>
              <option value="Medan">Medan</option>
              <option value="Balikpapan">Balikpapan</option>
              <option value="Banjarmasin">Banjarmasin</option>
              <option value="Makassar">Makassar</option>
              <option value="Denpasar">Denpasar (Bali)</option>
              <option value="Jayapura">Jayapura (Papua)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Moda Pengiriman</label>
            <select id="calc-moda" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-600">
              <option value="Darat">🚛 Darat (Trucking)</option>
              <option value="Laut">🚢 Laut (Kapal Kargo)</option>
              <option value="Udara">✈️ Udara (Ekspres)</option>
            </select>
          </div>
        </div>

        <div class="grid sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Berat Aktual (Kg)</label>
            <input id="calc-berat" type="number" min="1" value="25" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Panjang (cm)</label>
            <input id="calc-panjang" type="number" min="1" value="50" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Lebar (cm)</label>
            <input id="calc-lebar" type="number" min="1" value="40" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Tinggi (cm)</label>
            <input id="calc-tinggi" type="number" min="1" value="30" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold" />
          </div>
        </div>

        <button onclick="hitungOngkir()" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md">
          Hitung Estimasi Biaya
        </button>

        <!-- Hasil Kalkulasi -->
        <div id="calc-result" class="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-2xl hidden">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-blue-200/80 pb-4">
            <div>
              <p class="text-xs text-blue-900 font-medium">Estimasi Total Ongkos Kirim</p>
              <p id="res-biaya" class="text-2xl font-black text-blue-900">Rp 0</p>
            </div>
            <div class="text-right">
              <span id="res-waktu" class="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Estimasi 2-3 Hari
              </span>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 pt-3">
            <div>Berat Fisik: <span id="res-aktual" class="font-bold text-slate-900">0 Kg</span></div>
            <div>Volumetrik: <span id="res-volumetrik" class="font-bold text-slate-900">0 Kg</span></div>
            <div>Chargeable: <span id="res-chargeable" class="font-bold text-blue-700">0 Kg</span></div>
            <div>Tarif/Kg: <span id="res-tarif" class="font-bold text-slate-900">Rp 0</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TRACKING SECTION -->
  <section id="tracking" class="py-16 max-w-4xl mx-auto px-4 sm:px-6">
    <div class="text-center mb-8">
      <span class="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100 px-3 py-1 rounded-full">Live Checkpoint</span>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0B1B4D] mt-2">Pelacakan Resi Nusantara</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-1">Pantau setiap pergerakan paket Anda dari gudang asal hingga tiba di tujuan</p>
    </div>

    <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row gap-3">
        <input 
          id="main-resi-input"
          type="text" 
          placeholder="Masukkan Nomor Resi (cth: LN2408001)"
          class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold uppercase focus:ring-2 focus:ring-indigo-600"
        />
        <button 
          onclick="lacakResiUtama()"
          class="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow"
        >
          Lacak Paket
        </button>
      </div>

      <!-- Detail Pelacakan -->
      <div id="tracking-result" class="mt-8 hidden">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p class="text-[11px] text-slate-500 font-semibold uppercase">Nomor Resi</p>
            <p id="trk-resi" class="text-lg font-black text-slate-900">LN2408001</p>
          </div>
          <div>
            <p class="text-[11px] text-slate-500 font-semibold uppercase">Nama Pengiriman</p>
            <p id="trk-nama" class="text-sm font-bold text-slate-800">-</p>
          </div>
          <div>
            <p class="text-[11px] text-slate-500 font-semibold uppercase">Rute &amp; Moda</p>
            <p id="trk-rute" class="text-sm font-bold text-slate-800">-</p>
          </div>
          <div>
            <span id="trk-status-badge" class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Dalam Perjalanan
            </span>
          </div>
        </div>

        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Riwayat Checkpoint Perjalanan:</h4>
        <div id="trk-timeline" class="space-y-4 border-l-2 border-indigo-200 ml-4 pl-6 relative">
          <!-- Dinamis diisi via JS -->
        </div>
      </div>
    </div>
  </section>

  <!-- FORM PEMESANAN -->
  <section id="pesan" class="py-16 bg-slate-100">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-8">
        <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">Formulir Pengiriman</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0B1B4D] mt-2">Pesan Pengiriman Kargo</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">Isi formulir berikut dan petugas dispatcher kami akan segera menghubungi Anda</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        <form id="order-form" onsubmit="handlePesan(event)" class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Pengirim / PT *</label>
              <input id="ord-nama" type="text" required placeholder="Contoh: PT. Sumber Makmur / Bpk. Budi" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Aktif *</label>
              <input id="ord-hp" type="tel" required placeholder="0812xxxxxxxx" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Moda Pengiriman</label>
              <select id="ord-moda" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold">
                <option value="Darat">🚛 Kargo Darat (Trucking)</option>
                <option value="Laut">🚢 Kargo Laut (Kapal)</option>
                <option value="Udara">✈️ Kargo Udara (Ekspres)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Rute (Asal → Tujuan) *</label>
              <input id="ord-rute" type="text" required placeholder="Jakarta ke Surabaya" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Jenis / Nama Barang *</label>
              <input id="ord-barang" type="text" required placeholder="Sparepart Mesin, Pindahan Rumah, Konveksi" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Perkiraan Berat (Kg) *</label>
              <input id="ord-berat" type="number" min="1" required placeholder="50" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan / Alamat Jemput</label>
            <textarea id="ord-catatan" rows="2" placeholder="Butuh packing kayu, jemput di pergudangan Cikarang..." class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"></textarea>
          </div>

          <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2">
            <span>Kirim Pemesanan via WhatsApp &amp; Sistem</span>
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer id="kontak" class="bg-[#071133] text-slate-400 text-xs py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <div class="flex items-center gap-2 text-white font-extrabold text-base mb-3">
          <span class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-sm">TL</span>
          TRENS-LOGISTIC
        </div>
        <p class="leading-relaxed">
          Penyedia jasa pengiriman kargo terpadu darat, laut, dan udara yang siap menghubungkan seluruh kota dan kepulauan Indonesia secara andal dan profesional.
        </p>
      </div>

      <div>
        <h4 class="text-white font-bold text-sm mb-3">Layanan Kami</h4>
        <ul class="space-y-2">
          <li><a href="#layanan" class="hover:text-white">Kargo Darat Full &amp; LTL</a></li>
          <li><a href="#layanan" class="hover:text-white">Kargo Laut FCL &amp; LCL</a></li>
          <li><a href="#layanan" class="hover:text-white">Kargo Udara Kilat</a></li>
          <li><a href="#layanan" class="hover:text-white">Pindahan Rumah &amp; Kantor</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-white font-bold text-sm mb-3">Head Office (Kantor Pusat)</h4>
        <p class="mb-2">📍 Jl. Jati 1 No. 12 RT 001/06 Kel. Kebon Bawang, Kec. Tanjung Priok, Jakarta Utara</p>
        <p class="mb-2">📞 Telp: 0813-8975-5106</p>
        <p class="mb-2">💬 WhatsApp: 0856-9431-0979</p>
        <p>✉️ halo@trens-logistic.id</p>
      </div>

      <div>
        <h4 class="text-white font-bold text-sm mb-3">Jam Operasional</h4>
        <p class="mb-1 text-slate-300">Senin - Sabtu: 08.00 - 20.00 WIB</p>
        <p class="text-slate-300">Minggu / Hari Libur: Layanan Kargo Khusus &amp; Hotline 24 Jam</p>
        <div class="mt-4 pt-4 border-t border-slate-800 text-[11px]">
          © 2026 TRENS-LOGISTIC Nusantara. Hak Cipta Dilindungi.
        </div>
      </div>
    </div>
  </footer>

  <!-- SCRIPT LOGIKA STANDALONE -->
  <script>
    // Database Resi Demo Standalone
    const DUMMY_RESI = {
      'LN2408001': {
        nama: 'Kargo Komponen Mesin Industri (250 Kg)',
        rute: 'Jakarta → Balikpapan',
        moda: 'Laut',
        status: 'Dalam Perjalanan',
        history: [
          { w: '01 Sep 2026 14:00', k: 'Kapal KM Kargo Nusantara berangkat dari Pelabuhan Tanjung Priok menuju Balikpapan', s: 'done' },
          { w: '31 Aug 2026 19:30', k: 'Selesai pemuatan (loading) kontainer ke kapal di Dermaga Marunda', s: 'done' },
          { w: '30 Aug 2026 10:15', k: 'Paket tiba di Gudang Pusat Sortir Jakarta Barat & selesai packing kayu', s: 'done' },
          { w: '29 Aug 2026 16:00', k: 'Penjemputan paket (Pickup) dari pabrik pengirim di Cikarang', s: 'done' }
        ]
      },
      'LN2408002': {
        nama: 'Paket Retail Tekstil & Konveksi (35 Kg)',
        rute: 'Jakarta → Surabaya',
        moda: 'Darat',
        status: 'Tiba di Kota Tujuan',
        history: [
          { w: '02 Sep 2026 06:45', k: 'Truk tiba di Gudang Transit Surabaya (Margomulyo) siap diantar kurir', s: 'done' },
          { w: '01 Sep 2026 21:00', k: 'Armada Truk melintas via Tol Trans Jawa', s: 'done' },
          { w: '01 Sep 2026 14:30', k: 'Berangkat dari Hub Logistik Utama Jakarta', s: 'done' }
        ]
      }
    };

    // Tarif Dasar per Moda & Rute
    const TARIF_DATA = {
      'Darat': { base: 4500, minKg: 10, divisor: 4000, days: '2 - 3 Hari' },
      'Laut': { base: 6500, minKg: 30, divisor: 4000, days: '4 - 7 Hari' },
      'Udara': { base: 28000, minKg: 5, divisor: 5000, days: '1 - 2 Hari' }
    };

    function hitungOngkir() {
      const asal = document.getElementById('calc-asal').value;
      const tujuan = document.getElementById('calc-tujuan').value;
      const moda = document.getElementById('calc-moda').value;
      const berat = parseFloat(document.getElementById('calc-berat').value) || 0;
      const p = parseFloat(document.getElementById('calc-panjang').value) || 0;
      const l = parseFloat(document.getElementById('calc-lebar').value) || 0;
      const t = parseFloat(document.getElementById('calc-tinggi').value) || 0;

      const conf = TARIF_DATA[moda] || TARIF_DATA['Darat'];
      const volumetrik = Math.round((p * l * t) / conf.divisor);
      const chargeable = Math.max(berat, volumetrik, conf.minKg);
      const totalBiaya = chargeable * conf.base;

      document.getElementById('res-biaya').innerText = 'Rp ' + totalBiaya.toLocaleString('id-ID');
      document.getElementById('res-waktu').innerText = 'Estimasi ' + conf.days;
      document.getElementById('res-aktual').innerText = berat + ' Kg';
      document.getElementById('res-volumetrik').innerText = volumetrik + ' Kg';
      document.getElementById('res-chargeable').innerText = chargeable + ' Kg (Min. ' + conf.minKg + ' Kg)';
      document.getElementById('res-tarif').innerText = 'Rp ' + conf.base.toLocaleString('id-ID');

      document.getElementById('calc-result').classList.remove('hidden');
    }

    function renderTracking(resiKey) {
      const item = DUMMY_RESI[resiKey];
      if (!item) {
        alert('Nomor Resi "' + resiKey + '" belum ditemukan di database simulasi. Coba gunakan: LN2408001 atau LN2408002');
        return;
      }

      document.getElementById('trk-resi').innerText = resiKey;
      document.getElementById('trk-nama').innerText = item.nama;
      document.getElementById('trk-rute').innerText = item.rute + ' (' + item.moda + ')';
      document.getElementById('trk-status-badge').innerText = item.status;

      const timelineEl = document.getElementById('trk-timeline');
      timelineEl.innerHTML = '';

      item.history.forEach((h, idx) => {
        const point = document.createElement('div');
        point.className = 'relative group';
        point.innerHTML = \`
          <div class="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
          <div class="text-xs font-bold text-slate-800">\${h.w}</div>
          <p class="text-xs text-slate-600 mt-0.5">\${h.k}</p>
        \`;
        timelineEl.appendChild(point);
      });

      document.getElementById('tracking-result').classList.remove('hidden');
    }

    function cekResiCepat() {
      const val = document.getElementById('quick-resi-input').value.trim().toUpperCase();
      if (!val) {
        alert('Silakan masukkan nomor resi terlebih dahulu.');
        return;
      }
      document.getElementById('main-resi-input').value = val;
      renderTracking(val);
      window.location.hash = 'tracking';
    }

    function lacakResiUtama() {
      const val = document.getElementById('main-resi-input').value.trim().toUpperCase();
      if (!val) {
        alert('Silakan masukkan nomor resi terlebih dahulu.');
        return;
      }
      renderTracking(val);
    }

    function handlePesan(e) {
      e.preventDefault();
      const nama = document.getElementById('ord-nama').value;
      const hp = document.getElementById('ord-hp').value;
      const moda = document.getElementById('ord-moda').value;
      const rute = document.getElementById('ord-rute').value;
      const barang = document.getElementById('ord-barang').value;
      const berat = document.getElementById('ord-berat').value;
      const catatan = document.getElementById('ord-catatan').value;

      const pesanWa = \`Halo TRENS-LOGISTIC, saya ingin memesan pengiriman:\\n- Pengirim: \${nama}\\n- No HP: \${hp}\\n- Moda: \${moda}\\n- Rute: \${rute}\\n- Barang: \${barang}\\n- Berat: \${berat} Kg\\n- Catatan: \${catatan}\`;
      const urlWa = 'https://wa.me/6285694310979?text=' + encodeURIComponent(pesanWa);
      window.open(urlWa, '_blank');
      alert('Pemesanan berhasil diproses! Anda akan diarahkan ke WhatsApp CS TRENS-LOGISTIC.');
    }
  </script>
</body>
</html>`;

export const TRACKING_ONLY_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cek Resi & Pelacakan Kargo — TRENS-LOGISTIC</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen p-4 sm:p-8 flex items-center justify-center text-slate-800">
  <div class="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
    <div class="text-center mb-6">
      <div class="w-12 h-12 bg-blue-700 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-2">TL</div>
      <h1 class="text-2xl font-black text-slate-900">Live Tracking Resi</h1>
      <p class="text-xs text-slate-500">Cek posisi barang kiriman kargo darat, laut & udara</p>
    </div>

    <div class="flex gap-2 mb-6">
      <input id="resiInput" type="text" placeholder="Masukkan Resi (cth: LN2408001)" class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none" />
      <button onclick="checkResi()" class="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">Lacak</button>
    </div>

    <div id="outputCard" class="hidden border-t border-slate-100 pt-4">
      <div class="p-3 bg-blue-50 rounded-xl text-xs space-y-1 mb-4">
        <p class="font-bold text-blue-900" id="resTitle">-</p>
        <p class="text-slate-600" id="resRoute">-</p>
      </div>
      <div id="timelineList" class="space-y-3 border-l-2 border-blue-400 ml-3 pl-4 text-xs"></div>
    </div>
  </div>

  <script>
    const DATA = {
      'LN2408001': {
        title: 'Komponen Mesin Industri (250 Kg) • Kargo Laut',
        route: 'Jakarta ke Balikpapan',
        logs: [
          { t: '01 Sep 2026 14:00', m: 'Kapal Kargo lepas jangkar dari Tanjung Priok' },
          { t: '30 Aug 2026 10:00', m: 'Selesai packing kayu & loading dermaga' },
          { t: '29 Aug 2026 16:00', m: 'Paket dijemput kurir dari pabrik' }
        ]
      }
    };
    function checkResi() {
      const val = document.getElementById('resiInput').value.trim().toUpperCase();
      const item = DATA[val] || DATA['LN2408001'];
      document.getElementById('resTitle').innerText = item.title;
      document.getElementById('resRoute').innerText = 'Rute: ' + item.route;
      const list = document.getElementById('timelineList');
      list.innerHTML = '';
      item.logs.forEach(l => {
        const d = document.createElement('div');
        d.innerHTML = '<strong>' + l.t + '</strong><br/><span class="text-slate-500">' + l.m + '</span>';
        list.appendChild(d);
      });
      document.getElementById('outputCard').classList.remove('hidden');
    }
  </script>
</body>
</html>`;

export const CALCULATOR_ONLY_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kalkulator Tarif Volumetrik — TRENS-LOGISTIC</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen p-4 sm:p-8 flex items-center justify-center text-slate-800">
  <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
    <h1 class="text-xl font-black text-slate-900 mb-1">Kalkulator Ongkir &amp; Volumetrik</h1>
    <p class="text-xs text-slate-500 mb-4">Hitung estimasi berat chargeable (Aktual vs PxLxT/4000)</p>

    <div class="space-y-3 text-xs">
      <div>
        <label class="font-bold">Berat Aktual (Kg)</label>
        <input id="w" type="number" value="20" class="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="font-bold">P (cm)</label>
          <input id="p" type="number" value="60" class="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
        </div>
        <div>
          <label class="font-bold">L (cm)</label>
          <input id="l" type="number" value="40" class="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
        </div>
        <div>
          <label class="font-bold">T (cm)</label>
          <input id="t" type="number" value="30" class="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
        </div>
      </div>
      <button onclick="calc()" class="w-full bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm">Hitung Tarif</button>
      <div id="res" class="p-4 bg-blue-50 rounded-xl hidden font-semibold">
        <p class="text-blue-900 font-bold text-base" id="totalBiaya"></p>
        <p class="text-slate-600 mt-1" id="detail"></p>
      </div>
    </div>
  </div>
  <script>
    function calc() {
      const w = parseFloat(document.getElementById('w').value)||0;
      const p = parseFloat(document.getElementById('p').value)||0;
      const l = parseFloat(document.getElementById('l').value)||0;
      const t = parseFloat(document.getElementById('t').value)||0;
      const vol = Math.round((p * l * t) / 4000);
      const charge = Math.max(w, vol, 10);
      const cost = charge * 5000;
      document.getElementById('totalBiaya').innerText = 'Estimasi: Rp ' + cost.toLocaleString('id-ID');
      document.getElementById('detail').innerText = 'Fisik: ' + w + ' Kg | Volumetrik: ' + vol + ' Kg | Chargeable: ' + charge + ' Kg (@Rp 5.000/Kg)';
      document.getElementById('res').classList.remove('hidden');
    }
  </script>
</body>
</html>`;

export const STANDALONE_TEMPLATES: HtmlTemplate[] = [
  {
    id: 'full-trens-logistic',
    name: 'TRENS-LOGISTIC Website Resmi (All-in-One)',
    description: 'Halaman lengkap dengan Hero, Layanan 3 Moda, Kalkulator Volumetrik, Live Tracking Checkpoint, Form Pesan WA, dan Footer interaktif.',
    category: 'Full Website',
    badge: 'Rekomendasi Utama',
    html: MAIN_STANDALONE_HTML
  },
  {
    id: 'tracking-only',
    name: 'Portal Tracking Resi Kargo Saja',
    description: 'Halaman cek nomor resi mandiri dengan riwayat checkpoint perjalanan logistik.',
    category: 'Widget / Tool',
    badge: 'Ringan',
    html: TRACKING_ONLY_HTML
  },
  {
    id: 'calculator-only',
    name: 'Kalkulator Ongkir & Volumetrik Saja',
    description: 'Kalkulator mandiri untuk menghitung perbandingan berat aktual vs volumetrik PxLxT/4000.',
    category: 'Widget / Tool',
    badge: 'Alat Hitung',
    html: CALCULATOR_ONLY_HTML
  }
];
