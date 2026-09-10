import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  ZoomIn, 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  RotateCw
} from 'lucide-react';

interface PhotoUploadDropzoneProps {
  label?: string;
  subLabel?: string;
  currentPhotoUrl?: string;
  onPhotoChange: (dataUrl: string | undefined) => void;
  className?: string;
  required?: boolean;
}

export const PhotoUploadDropzone: React.FC<PhotoUploadDropzoneProps> = ({
  label = 'Foto Fisik Barang / Paket',
  subLabel = 'Unggah foto barang saat diterima atau serah terima di hub gudang',
  currentPhotoUrl,
  onPhotoChange,
  className = '',
  required = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & convert file to optimized base64 data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }

    // Check size limit: 12MB raw max
    if (file.size > 12 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (Maksimal 12MB).');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Resize logic to max 1200x1200px to maintain crisp quality while keeping document size small
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Calculate approx size
          const stringLength = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
          const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383687;
          const sizeInKb = Math.round(sizeInBytes / 1024);
          setFileSizeStr(`~${sizeInKb} KB`);

          onPhotoChange(compressedDataUrl);
        } else {
          onPhotoChange(src);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('Gagal memproses gambar.');
      };
      img.src = src;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processImageFile(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange(undefined);
    setFileName('');
    setFileSizeStr('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {currentPhotoUrl && (
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Foto Tersedia</span>
          </span>
        )}
      </div>
      
      {subLabel && (
        <p className="text-[11px] text-slate-500">{subLabel}</p>
      )}

      {/* Hidden File Input (supports gallery & camera) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload State / Preview Container */}
      {currentPhotoUrl ? (
        <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3.5 transition-all">
          {/* Thumbnail preview with zoom trigger */}
          <div 
            onClick={() => setShowLightbox(true)}
            className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0 group cursor-pointer shadow-xs"
          >
            <img 
              src={currentPhotoUrl} 
              alt="Foto barang" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {fileName || 'foto-barang.jpg'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {fileSizeStr ? `Ukuran: ${fileSizeStr} • ` : ''}Siap Disimpan
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <ZoomIn className="w-3 h-3 text-blue-600" />
                <span>Lihat Foto</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <RotateCw className="w-3 h-3 text-slate-500" />
                <span>Ganti</span>
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Hapus foto ini"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Box for Drag & Drop + Click */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 bg-white'
          }`}
        >
          {isProcessing ? (
            <div className="py-2 flex flex-col items-center justify-center gap-2 text-slate-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Mengompresi dan memproses foto...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center transition-transform group-hover:scale-110">
                <Camera className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  <span className="text-blue-700 underline">Klik untuk pilih foto</span> atau tarik file ke sini
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung foto kamera HP, format JPG, PNG, WEBP (Maksimal 12MB)
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full mt-1">
                <UploadCloud className="w-3 h-3 text-blue-600" />
                <span>Tersimpan otomatis ke database pelacakan</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {showLightbox && currentPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLightbox(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">{label}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img 
                src={currentPhotoUrl} 
                alt="Foto Pembesaran" 
                className="max-h-[72vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="px-3 py-1.5 text-center text-[11px] text-white/60">
              Klik di luar gambar atau tombol silang untuk menutup
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
