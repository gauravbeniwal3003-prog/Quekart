import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Sparkles, Layers, Eye, Smartphone, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface CategorySmartCropModalProps {
  isOpen: boolean;
  initialImage: string;
  categoryTitle?: string;
  targetLabel?: string;
  onConfirm: (croppedDataUrl: string) => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

// Curated high quality presets for Indian eCommerce categories
const CATEGORY_PRESETS = [
  { name: 'Ethnic Sarees & Kurtis', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' },
  { name: 'Designer Kurtas', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600' },
  { name: 'Women Westernwear', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600' },
  { name: 'Men Royal Kurtas', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600' },
  { name: 'Jewellery & Necklaces', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600' },
  { name: 'Footwear & Juttis', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600' },
  { name: 'Bags & Clutches', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' },
  { name: 'Kids & Baby Wear', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600' },
  { name: 'Beauty & Cosmetics', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600' },
  { name: 'Home & Kitchen Decor', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600' }
];

export default function CategorySmartCropModal({
  isOpen,
  initialImage,
  categoryTitle = 'Category Name',
  targetLabel = 'Category Main Bubble',
  onConfirm,
  onClose,
  isLoading = false
}: CategorySmartCropModalProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(initialImage || CATEGORY_PRESETS[0].url);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewMask, setPreviewMask] = useState<'square' | 'circle'>('square');
  const [liveCroppedDataUrl, setLiveCroppedDataUrl] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when initialImage changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageSrc(initialImage || CATEGORY_PRESETS[0].url);
      setCropZoom(1.0);
      setCropOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialImage]);

  // Handle Dragging
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

  // Auto-center & reset
  const handleResetFit = () => {
    setCropZoom(1.0);
    setCropOffset({ x: 0, y: 0 });
  };

  // Load new local file
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

  // Render to canvas & update live preview simulation
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

      const size = 500; // Output square dimensions
      canvas.width = size;
      canvas.height = size;

      // Solid background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, size, size);

      const imgRatio = img.width / img.height;
      let dWidth = size;
      let dHeight = size;

      if (imgRatio > 1) {
        dWidth = size * imgRatio;
      } else {
        dHeight = size / imgRatio;
      }

      dWidth *= cropZoom;
      dHeight *= cropZoom;

      // Canvas viewport scale conversion (Interactive preview is 280px in UI)
      const scaleFactor = 500 / 280;
      const x = (size - dWidth) / 2 + (cropOffset.x * scaleFactor);
      const y = (size - dHeight) / 2 + (cropOffset.y * scaleFactor);

      ctx.drawImage(img, x, y, dWidth, dHeight);

      try {
        const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
        setLiveCroppedDataUrl(previewUrl);
      } catch (err) {
        // Fallback for cross-origin if tainted
        setLiveCroppedDataUrl(currentImageSrc);
      }
    };
  }, [isOpen, currentImageSrc, cropZoom, cropOffset]);

  const handleApplyConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onConfirm(finalDataUrl);
    } catch (err) {
      onConfirm(currentImageSrc);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5" id="category-smart-crop-modal">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden text-white flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0 bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#143C6B] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-2">
                  <span>Smart Crop Studio & Live Publishing Simulator</span>
                  <span className="text-[10px] bg-[#143C6B] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {targetLabel}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Adjust positioning & verify live customer view before saving to live storefront
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              id="close-smart-crop-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Interactive Cropper Canvas (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center space-y-4">
              <div className="w-full flex items-center justify-between text-xs">
                <span className="text-[11px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#143C6B]" />
                  Interactive Crop Framing
                </span>
                
                {/* Viewport Mask Toggle */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewMask('square')}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      previewMask === 'square' ? 'bg-[#143C6B] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1:1 Square Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMask('circle')}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      previewMask === 'circle' ? 'bg-[#143C6B] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Circle
                  </button>
                </div>
              </div>

              {/* Draggable Viewport Canvas */}
              <div className="relative flex items-center justify-center p-3 bg-slate-950/60 rounded-2xl border border-slate-800 w-full">
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] relative overflow-hidden shadow-2xl border-4 bg-slate-950 cursor-grab active:cursor-grabbing flex items-center justify-center select-none ${
                    previewMask === 'circle' ? 'rounded-full border-[#143C6B]' : 'rounded-2xl border-[#143C6B]'
                  }`}
                  id="smart-crop-viewport"
                >
                  {/* Canvas representation */}
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full pointer-events-none"
                  />

                  {/* Grid Lines Overlay for Center Alignment */}
                  <div className={`absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border ${
                    previewMask === 'circle' ? 'rounded-full border-white/20' : 'rounded-2xl border-white/20'
                  }`}>
                    <div className="border-r border-b border-white/15"></div>
                    <div className="border-r border-b border-white/15"></div>
                    <div className="border-b border-white/15"></div>
                    <div className="border-r border-b border-white/15"></div>
                    <div className="border-r border-b border-white/15 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs"></div>
                    </div>
                    <div className="border-b border-white/15"></div>
                    <div className="border-r border-white/15"></div>
                    <div className="border-r border-white/15"></div>
                    <div></div>
                  </div>
                </div>

                <span className="absolute bottom-1.5 text-[9px] font-bold text-slate-400 tracking-wider">
                  ↔ DRAG TO POSITION • SLIDE TO ZOOM
                </span>
              </div>

              {/* Zoom & Centering Controls */}
              <div className="w-full space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                    Zoom Magnification
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#C89D1F] font-black">{Math.round(cropZoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={handleResetFit}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reset Position and Zoom"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Auto-Center
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full accent-[#143C6B] bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>

              {/* Upload Different Photo Button */}
              <div className="w-full flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLocalFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Choose Another Image File</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Customer Preview Simulation (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-300 tracking-wider">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Storefront Preview Before Publishing</span>
              </div>

              {/* Live Customer Simulation Card 1: Homepage 1:1 Square Frame */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    1. Home Page Category Frame (1:1)
                  </span>
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                    Exact Live Match
                  </span>
                </div>

                {/* Simulated Customer Header Tile */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-inner flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    {/* The Live 1:1 Square Frame */}
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-xl overflow-hidden aspect-square flex items-center justify-center border-2 border-[#143C6B] ring-2 ring-[#143C6B]/20 bg-blue-50/50 shadow-md transition-transform transform scale-105">
                        <img
                          src={liveCroppedDataUrl || currentImageSrc || CATEGORY_PRESETS[0].url}
                          alt="Live Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-black text-[#143C6B] mt-1.5 text-center max-w-[85px] truncate">
                        {categoryTitle || 'Category Name'}
                      </span>
                    </div>

                    {/* Faded adjacent tiles for realism */}
                    <div className="opacity-40 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                        Popular
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 mt-1.5">Popular</span>
                    </div>
                  </div>

                  <span className="text-[9px] font-semibold text-slate-400 text-center">
                    Shopper View: This is precisely how shoppers will view and tap this 1:1 square category frame on Mobile and Desktop.
                  </span>
                </div>
              </div>

              {/* Live Customer Simulation Card 2: Subcategory / Drawer View */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  2. Subcategory / Card View (1:1)
                </span>
                
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden aspect-square bg-slate-50 border border-slate-200 shrink-0">
                    <img
                      src={liveCroppedDataUrl || currentImageSrc || CATEGORY_PRESETS[0].url}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">{categoryTitle || 'Category Name'}</h5>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">High Resolution • 1:1 Vector Optimized</p>
                  </div>
                </div>
              </div>

              {/* Quick Presets Carousel */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  🎨 Quick Curated Photography Presets
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {CATEGORY_PRESETS.slice(0, 5).map((pr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentImageSrc(pr.url);
                        setCropZoom(1.0);
                        setCropOffset({ x: 0, y: 0 });
                      }}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
                      title={pr.name}
                    >
                      <img src={pr.url} alt={pr.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Footer Action Controls */}
          <div className="border-t border-slate-800 px-5 py-3.5 bg-slate-950 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
              ✨ Image will be optimized & stored on fast high-speed CDN.
            </span>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                id="cancel-smart-crop-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyConfirm}
                disabled={isLoading}
                className="bg-[#143C6B] hover:bg-[#143C6B]/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                id="confirm-smart-crop-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing & Hosting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Confirm Smart Crop & Apply Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
