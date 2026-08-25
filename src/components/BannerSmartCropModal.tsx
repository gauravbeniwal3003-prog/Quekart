import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, ImageIcon, Loader2, Upload } from 'lucide-react';

export interface BannerSmartCropModalProps {
  isOpen: boolean;
  initialImage: string;
  bannerRow: 'upper' | 'lower';
  onConfirm: (croppedDataUrl: string) => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const PRESET_BANNERS = [
  { name: 'Festive Pink Sparkles', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Traditional Jewellery Craft', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Saffron Traditional Silk', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Luxury Modern Blue Theme', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200' },
];

export default function BannerSmartCropModal({
  isOpen,
  initialImage,
  bannerRow,
  onConfirm,
  onClose,
  isLoading = false
}: BannerSmartCropModalProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(initialImage || PRESET_BANNERS[0].url);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [liveCroppedDataUrl, setLiveCroppedDataUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Aspect ratio configuration: upper row is 3:1, lower is 2:1
  const isUpper = bannerRow === 'upper';
  const targetWidth = isUpper ? 900 : 600;
  const targetHeight = 300;
  const aspectRatioClass = isUpper ? 'aspect-[3/1]' : 'aspect-[2/1]';

  useEffect(() => {
    if (isOpen) {
      setCurrentImageSrc(initialImage || PRESET_BANNERS[0].url);
      setCropZoom(1.0);
      setCropOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialImage]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - cropOffset.x,
        y: e.touches[0].clientY - cropOffset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setCropOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleResetFit = () => {
    setCropZoom(1.0);
    setCropOffset({ x: 0, y: 0 });
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCurrentImageSrc(event.target.result as string);
        setCropZoom(1.0);
        setCropOffset({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Live Canvas renderer
  useEffect(() => {
    if (!isOpen || !currentImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Math for scaling
      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;

      let dWidth = targetWidth;
      let dHeight = targetHeight;

      if (imgRatio > targetRatio) {
        // Image is wider than crop box
        dHeight = targetHeight;
        dWidth = targetHeight * imgRatio;
      } else {
        // Image is taller than crop box
        dWidth = targetWidth;
        dHeight = targetWidth / imgRatio;
      }

      dWidth *= cropZoom;
      dHeight *= cropZoom;

      // Center + user offset
      const x = (targetWidth - dWidth) / 2 + cropOffset.x;
      const y = (targetHeight - dHeight) / 2 + cropOffset.y;

      ctx.drawImage(img, x, y, dWidth, dHeight);

      // Generate base64 data URL
      try {
        const url = canvas.toDataURL('image/jpeg', 0.9);
        setLiveCroppedDataUrl(url);
      } catch (err) {
        console.warn('Canvas toDataURL security exception, falling back:', err);
      }
    };
    img.onerror = () => {
      // If CORS or loading failed, load preset
      console.warn('Failed to load image for cropping, loading fallback.');
    };
  }, [isOpen, currentImageSrc, cropZoom, cropOffset, targetWidth, targetHeight]);

  const handleSaveCrop = () => {
    if (liveCroppedDataUrl) {
      onConfirm(liveCroppedDataUrl);
    } else {
      onConfirm(currentImageSrc);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Real-Time Banner Cropper</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Target Slot: {isUpper ? 'Upper Row (3:1 Single Poster)' : 'Below Row (2:1 Double Posters)'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Cropper Box */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            <div 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`w-full relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${aspectRatioClass}`}
            >
              {/* Image renderer */}
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <img 
                  src={currentImageSrc} 
                  alt="Cropping item" 
                  className="max-w-none w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>

              {/* Grid guide overlays */}
              <div className="absolute inset-0 border-2 border-[#FF8C00] pointer-events-none bg-black/10">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCropZoom(prev => Math.max(0.5, prev - 0.1))}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input 
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF8C00]"
              />
              <button 
                onClick={() => setCropZoom(prev => Math.min(3.0, prev + 0.1))}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFit}
                className="px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 shadow-3xs hover:bg-slate-50 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset View</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md text-[10px] font-bold text-[#143C6B] bg-blue-50 border border-blue-200 shadow-3xs hover:bg-blue-100 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Photo</span>
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleLocalFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Presets Gallery */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Or Use Festive Sample Presets</h4>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_BANNERS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageSrc(preset.url);
                    setCropZoom(1.0);
                    setCropOffset({ x: 0, y: 0 });
                  }}
                  className={`relative aspect-[3/1] bg-slate-100 rounded-lg overflow-hidden border transition-all ${
                    currentImageSrc === preset.url ? 'border-[#FF8C00] ring-1 ring-[#FF8C00]/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden internal canvas for rendering cropped result */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-5 py-2 rounded-lg text-xs font-black transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCrop}
            disabled={isLoading}
            className="bg-[#143C6B] hover:bg-opacity-90 text-white px-5 py-2 rounded-lg text-xs font-black shadow-md flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Real-Time Crop</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
