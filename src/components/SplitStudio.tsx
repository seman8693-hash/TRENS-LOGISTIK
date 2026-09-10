import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Columns, 
  Rows, 
  Code, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Laptop, 
  Sparkles, 
  FileCode, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  Maximize2,
  RefreshCw,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { DeviceMode, SplitLayout, HtmlTemplate } from '../types';
import { STANDALONE_TEMPLATES, MAIN_STANDALONE_HTML } from '../data/standaloneHtmlTemplates';

interface SplitStudioProps {
  onBackToWebsite: () => void;
}

export const SplitStudio: React.FC<SplitStudioProps> = ({ onBackToWebsite }) => {
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('full-trens-logistic');
  const [htmlCode, setHtmlCode] = useState<string>(MAIN_STANDALONE_HTML);
  const [splitLayout, setSplitLayout] = useState<SplitLayout>('split-horizontal');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage for left/top pane
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [previewKey, setPreviewKey] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Line numbers calculation
  const lineCount = htmlCode.split('\n').length;
  const characterCount = htmlCode.length;
  const sizeKb = (new Blob([htmlCode]).size / 1024).toFixed(1);

  // Handle template switch
  const handleSelectTemplate = (template: HtmlTemplate) => {
    setCurrentTemplateId(template.id);
    setHtmlCode(template.html);
    setPreviewKey(prev => prev + 1);
  };

  // Handle Download HTML
  const handleDownloadHtml = () => {
    try {
      const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = currentTemplateId === 'full-trens-logistic' 
        ? 'trens-logistic-website.html' 
        : `${currentTemplateId}.html`;
        
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle Copy Code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Handle Open in New Tab
  const handleOpenNewTab = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Handle Insert Snippet
  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = htmlCode.substring(0, start) + snippet + htmlCode.substring(end);
    setHtmlCode(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Dragging handler for split resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      if (splitLayout === 'split-horizontal') {
        const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
        if (newRatio >= 20 && newRatio <= 80) {
          setSplitRatio(Math.round(newRatio));
        }
      } else if (splitLayout === 'split-vertical') {
        const newRatio = ((e.clientY - rect.top) / rect.height) * 100;
        if (newRatio >= 20 && newRatio <= 80) {
          setSplitRatio(Math.round(newRatio));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, splitLayout]);

  // Width styling based on device simulation
  const getDeviceStyle = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '375px', height: '100%', minHeight: '667px' };
      case 'tablet':
        return { width: '768px', height: '100%', minHeight: '800px' };
      case 'laptop':
        return { width: '1024px', height: '100%' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. TOP STUDIO BAR */}
      <header className="h-16 bg-[#0B142B] border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0 z-30 shadow-md">
        
        {/* Brand & Back Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToWebsite}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all shadow-xs"
            title="Kembali ke Tampilan Web Penuh"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Kembali ke Website</span>
          </button>

          <div className="h-5 w-px bg-slate-700/60 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              HTML
            </div>
            <div>
              <span className="text-xs font-extrabold text-white tracking-tight">Split Studio &amp; Unduh HTML</span>
              <span className="hidden md:inline-block ml-2 px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                Live Single-File
              </span>
            </div>
          </div>
        </div>

        {/* Center: Template & Layout Controls */}
        <div className="hidden lg:flex items-center gap-2">
          
          {/* Template Selector */}
          <div className="relative group">
            <select
              value={currentTemplateId}
              onChange={(e) => {
                const found = STANDALONE_TEMPLATES.find(t => t.id === e.target.value);
                if (found) handleSelectTemplate(found);
              }}
              className="bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {STANDALONE_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  📄 {tpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Layout Mode Toggles */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setSplitLayout('split-horizontal')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                splitLayout === 'split-horizontal' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Split Horizontal (Kiri: Kode, Kanan: Preview)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSplitLayout('split-vertical')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                splitLayout === 'split-vertical' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Split Vertical (Atas: Kode, Bawah: Preview)"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSplitLayout('editor-only')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                splitLayout === 'editor-only' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Hanya Editor Kode"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSplitLayout('preview-only')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                splitLayout === 'preview-only' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Hanya Live Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'desktop' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('laptop')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'laptop' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Laptop View (1024px)"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'tablet' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'mobile' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Actions: Copy & Unduh HTML */}
        <div className="flex items-center gap-2">
          
          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
            title="Salin semua kode HTML ke clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-extrabold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Salin Kode</span>
              </>
            )}
          </button>

          {/* Download HTML Button (Prominent) */}
          <button
            id="btn-download-html"
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-md hover:shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-95"
            title="Unduh Berkas HTML Siap Pakai (.html)"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>{downloadSuccess ? '✓ Terunduh!' : 'Unduh HTML'}</span>
          </button>

          {/* Open New Tab */}
          <button
            onClick={handleOpenNewTab}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            title="Buka Preview di Tab Browser Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. SUB-BAR: Quick Snippets & Status Info */}
      <div className="h-10 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
        
        {/* Quick Snippet Injectors */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 text-amber-400" /> Sisipkan:
          </span>
          <button
            onClick={() => handleInsertSnippet(`\n  <!-- Tombol WhatsApp Floating -->\n  <a href="https://wa.me/6285694310979?text=Halo%20TRENS-LOGISTIC" target="_blank" class="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm">\n    <span>💬 Chat WA CS</span>\n  </a>\n`)}
            className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold shrink-0 transition-colors"
          >
            + Tombol WA
          </button>
          <button
            onClick={() => handleInsertSnippet(`\n  <!-- Banner Promo Diskon Kargo -->\n  <div class="bg-amber-400 text-slate-950 p-4 text-center font-bold text-sm">\n    🎉 Promo Kargo Kilat! Diskon 15% untuk kiriman di atas 100 Kg se-Jawa Bali.\n  </div>\n`)}
            className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold shrink-0 transition-colors"
          >
            + Banner Diskon
          </button>
          <button
            onClick={() => handleInsertSnippet(`\n  <!-- Badge Garansi Resmi -->\n  <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">\n    ✓ 100% Berasuransi & Garansi Tepat Waktu\n  </div>\n`)}
            className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold shrink-0 transition-colors"
          >
            + Badge Garansi
          </button>
        </div>

        {/* File Stats */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
          <span>{lineCount} baris</span>
          <span>{characterCount.toLocaleString()} karakter</span>
          <span className="text-amber-400 font-bold">{sizeKb} KB</span>
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold ml-2"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Preview
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER (SPLIT PANES) */}
      <div 
        ref={containerRef} 
        className={`flex-1 relative overflow-hidden flex ${
          splitLayout === 'split-vertical' ? 'flex-col' : 'flex-row'
        }`}
      >
        
        {/* LEFT / TOP PANE: CODE EDITOR */}
        {(splitLayout === 'split-horizontal' || splitLayout === 'split-vertical' || splitLayout === 'editor-only') && (
          <div 
            style={{
              width: splitLayout === 'split-horizontal' ? `${splitRatio}%` : splitLayout === 'editor-only' ? '100%' : '100%',
              height: splitLayout === 'split-vertical' ? `${splitRatio}%` : splitLayout === 'editor-only' ? '100%' : '100%'
            }}
            className="flex flex-col bg-[#0F172A] border-r border-slate-800 overflow-hidden relative"
          >
            {/* Editor Mini Header */}
            <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-slate-300 font-bold text-[11px]">index.html (Single-File Standalone)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const found = STANDALONE_TEMPLATES.find(t => t.id === currentTemplateId);
                    if (found && window.confirm('Reset kode ke template bawaan?')) {
                      setHtmlCode(found.html);
                      setPreviewKey(k => k + 1);
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  title="Kembalikan kode ke versi asli template"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Code Textarea & Gutter */}
            <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
              
              {/* Line Numbers Gutter */}
              <div className="w-11 bg-slate-950/60 text-slate-600 text-right pr-2 py-3 select-none overflow-hidden font-mono text-[11px] leading-5 shrink-0 border-r border-slate-800/60">
                {Array.from({ length: Math.min(lineCount, 500) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={htmlCode}
                onChange={(e) => {
                  setHtmlCode(e.target.value);
                  if (autoRefresh) {
                    // update preview seamlessly
                  }
                }}
                spellCheck={false}
                placeholder="Tulis atau paste kode HTML di sini..."
                className="flex-1 w-full h-full p-3 bg-transparent text-slate-200 font-mono text-[12px] leading-5 resize-none focus:outline-none focus:ring-0 overflow-auto selection:bg-blue-600 selection:text-white"
              />
            </div>
          </div>
        )}

        {/* DRAGGABLE RESIZER DIVIDER */}
        {(splitLayout === 'split-horizontal' || splitLayout === 'split-vertical') && (
          <div
            onMouseDown={() => setIsDragging(true)}
            className={`group bg-slate-800 hover:bg-blue-600 transition-colors z-20 flex items-center justify-center select-none ${
              splitLayout === 'split-horizontal' 
                ? 'w-2 cursor-col-resize hover:w-2' 
                : 'h-2 cursor-row-resize hover:h-2'
            }`}
          >
            <div className={`bg-slate-600 group-hover:bg-white rounded-full ${
              splitLayout === 'split-horizontal' ? 'w-0.5 h-6' : 'h-0.5 w-6'
            }`}></div>
          </div>
        )}

        {/* RIGHT / BOTTOM PANE: LIVE INTERACTIVE PREVIEW */}
        {(splitLayout === 'split-horizontal' || splitLayout === 'split-vertical' || splitLayout === 'preview-only') && (
          <div 
            style={{
              width: splitLayout === 'split-horizontal' ? `${100 - splitRatio}%` : splitLayout === 'preview-only' ? '100%' : '100%',
              height: splitLayout === 'split-vertical' ? `${100 - splitRatio}%` : splitLayout === 'preview-only' ? '100%' : '100%'
            }}
            className="flex flex-col bg-slate-950 overflow-hidden relative"
          >
            {/* Preview Mini Header with Device Indicator */}
            <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-300 text-[11px]">Live Browser Preview</span>
                <span className="text-[10px] text-slate-500 font-mono">({deviceMode})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">Sandbox IFrame</span>
              </div>
            </div>

            {/* Preview Stage Container with Device Frame */}
            <div className="flex-1 bg-slate-900/60 p-2 sm:p-4 overflow-auto flex items-center justify-center">
              <div 
                style={getDeviceStyle()}
                className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-700/80 ${
                  deviceMode !== 'desktop' ? 'my-auto' : 'h-full w-full'
                }`}
              >
                {/* Mockup Browser Window Header */}
                <div className="h-7 bg-slate-100 border-b border-slate-200 px-3 flex items-center justify-between text-[10px] text-slate-500 shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="bg-white px-4 py-0.5 rounded-md border border-slate-200 text-slate-600 font-mono text-[10px] truncate max-w-[200px]">
                    https://trens-logistic.local
                  </div>
                  <div className="w-8"></div>
                </div>

                {/* The IFrame */}
                <iframe
                  key={previewKey}
                  title="Live Preview Standalone HTML"
                  srcDoc={htmlCode}
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
                  className="w-full flex-1 border-0 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
