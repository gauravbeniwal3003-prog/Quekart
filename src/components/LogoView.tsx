import React, { useState } from 'react';
import { Download, ArrowLeft, Check, Copy, Sparkles, FileImage, Type, Layers, ExternalLink } from 'lucide-react';
import Logo, { BrandLogo, QueKartLogoText, LOGO_IMAGE_URL } from './Logo';

interface LogoViewProps {
  onBack: () => void;
}

export default function LogoView({ onBack }: LogoViewProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Helper to trigger browser download from blob URL
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // 1. Download Logo Icon (PNG)
  const downloadIconPng = async () => {
    setIsGenerating('icon-png');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = LOGO_IMAGE_URL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Transparent padding background
        ctx.clearRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 100, 100, 800, 800);
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, 'QueKart_Logo_Icon_HQ.png');
      }
    } catch (e) {
      console.error(e);
      window.open(LOGO_IMAGE_URL, '_blank');
    } finally {
      setIsGenerating(null);
    }
  };

  // 2. Download Logo Icon (SVG)
  const downloadIconSvg = () => {
    setIsGenerating('icon-svg');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <image href="${LOGO_IMAGE_URL}" x="25" y="25" width="450" height="450" />
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'QueKart_Logo_Icon.svg');
    setIsGenerating(null);
  };

  // 3. Download QueKart Text (PNG)
  const downloadTextPng = () => {
    setIsGenerating('text-png');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 1200, 400);
        ctx.font = 'bold 160px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        // Draw "Que" in #143C6B
        ctx.fillStyle = '#143C6B';
        ctx.fillText('Que', 100, 200);

        // Measure "Que" width to position "Kart"
        const queWidth = ctx.measureText('Que').width;

        // Draw "Kart" in #C89D1F
        ctx.fillStyle = '#C89D1F';
        ctx.fillText('Kart', 100 + queWidth, 200);

        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, 'QueKart_Text_Logo_HQ.png');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(null);
    }
  };

  // 4. Download QueKart Text (SVG)
  const downloadTextSvg = () => {
    setIsGenerating('text-svg');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 250" width="800" height="250">
  <style>
    .brand-text { font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 140px; }
    .que { fill: #143C6B; }
    .kart { fill: #C89D1F; }
  </style>
  <text x="50" y="175" className="brand-text">
    <tspan className="que">Que</tspan><tspan className="kart">Kart</tspan>
  </text>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'QueKart_Text_Logo.svg');
    setIsGenerating(null);
  };

  // 5. Download Full Combined Logo + Text (PNG)
  const downloadFullPng = async () => {
    setIsGenerating('full-png');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = LOGO_IMAGE_URL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 1800, 600);
        
        // Draw Logo Icon on the Left
        ctx.drawImage(img, 100, 100, 400, 400);

        // Draw Text next to Icon
        ctx.font = 'bold 200px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        ctx.fillStyle = '#143C6B';
        ctx.fillText('Que', 560, 300);

        const queWidth = ctx.measureText('Que').width;

        ctx.fillStyle = '#C89D1F';
        ctx.fillText('Kart', 560 + queWidth, 300);

        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, 'QueKart_Full_Brand_Logo_HQ.png');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(null);
    }
  };

  // 6. Download Full Combined Logo + Text (SVG)
  const downloadFullSvg = () => {
    setIsGenerating('full-svg');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <style>
    .brand-text { font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 160px; }
    .que { fill: #143C6B; }
    .kart { fill: #C89D1F; }
  </style>
  <image href="${LOGO_IMAGE_URL}" x="50" y="50" width="300" height="300" />
  <text x="390" y="250" className="brand-text">
    <tspan className="que">Que</tspan><tspan className="kart">Kart</tspan>
  </text>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'QueKart_Full_Brand_Logo.svg');
    setIsGenerating(null);
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-130px)] pb-20 w-full flex flex-col items-center p-4 sm:p-8" id="logo-assets-page">
      
      {/* Top Header Row */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2.5 hover:bg-white bg-slate-100 rounded-full transition-colors cursor-pointer border border-slate-200 active:scale-95 shadow-xs"
            id="logo-page-back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Brand Identity Assets
              <Sparkles className="w-5 h-5 text-[#C89D1F]" />
            </h1>
            <p className="text-xs text-slate-500 font-bold">Download official QueKart logo and typography files in HQ</p>
          </div>
        </div>

        <button
          onClick={() => window.open(LOGO_IMAGE_URL, '_blank')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-black text-[#143C6B] bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <span>Original Asset URL</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="w-full max-w-5xl space-y-8">
        
        {/* SECTION 1: MAIN OFFICIAL BRAND LOGO (UNIFORM EVERYWHERE) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-50 to-transparent w-64 h-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <span className="bg-[#143C6B] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                Official Standard Logo
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                QueKart Main Brand Mark
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-md leading-relaxed">
                This exact logo pairing (Shopping Cart Icon + Colored QueKart typography) is standardized across all headers, logins, vendor panels & mobile screens.
              </p>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-inner flex flex-col items-center justify-center min-w-[280px]">
              <BrandLogo size="lg" animated={true} />
              <p className="text-[11px] font-bold text-slate-400 mt-4">Uniform Desktop & Mobile Spec</p>
            </div>
          </div>

          {/* Action Download Row */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#143C6B]" />
              <span className="text-xs font-black text-slate-700">Combined Full Logo Downloads:</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadFullPng}
                disabled={isGenerating === 'full-png'}
                className="flex items-center gap-2 bg-[#143C6B] hover:bg-[#0C2340] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating === 'full-png' ? 'Preparing...' : 'Download Full Logo (PNG)'}</span>
              </button>

              <button
                onClick={downloadFullSvg}
                disabled={isGenerating === 'full-svg'}
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating === 'full-svg' ? 'Preparing...' : 'Download Full Logo (SVG)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2 & 3: INDIVIDUAL ASSETS (LOGO ICON & QUEKART TEXT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: LOGO ICON ONLY */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                  <FileImage className="w-4 h-4 text-[#143C6B]" />
                  <span>1. Shopping Cart Logo Icon</span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                  Icon Mark
                </span>
              </div>

              {/* Icon Visual Preview */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex items-center justify-center h-48 shadow-inner">
                <Logo animated={true} className="h-24 w-24 drop-shadow-md" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-semibold text-center mb-3">Isolated high-resolution cart symbol</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={downloadIconPng}
                  disabled={isGenerating === 'icon-png'}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#143C6B]" />
                  <span>PNG Icon</span>
                </button>
                <button
                  onClick={downloadIconSvg}
                  disabled={isGenerating === 'icon-svg'}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C89D1F]" />
                  <span>SVG Icon</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: QUEKART TEXT BRANDING ONLY */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                  <Type className="w-4 h-4 text-[#C89D1F]" />
                  <span>2. QueKart Brand Text Typography</span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                  Wordmark
                </span>
              </div>

              {/* Text Visual Preview */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex items-center justify-center h-48 shadow-inner">
                <QueKartLogoText sizeClassName="text-4xl sm:text-5xl" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-semibold text-center mb-3">Styled Display Font with official #143C6B & #C89D1F color split</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={downloadTextPng}
                  disabled={isGenerating === 'text-png'}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#143C6B]" />
                  <span>PNG Text</span>
                </button>
                <button
                  onClick={downloadTextSvg}
                  disabled={isGenerating === 'text-svg'}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C89D1F]" />
                  <span>SVG Text</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 4: BRAND COLOR CODES & GUIDELINES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            Brand Palette & Specs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Color 1: Que Navy */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#143C6B] shadow-md flex items-center justify-center text-white text-xs font-black">
                  Que
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Que Navy Blue</p>
                  <p className="text-[11px] text-slate-500 font-mono font-bold">#143C6B</p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard('#143C6B')}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {copiedColor === '#143C6B' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Color 2: Kart Gold */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#C89D1F] shadow-md flex items-center justify-center text-white text-xs font-black">
                  Kart
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Kart Royal Gold</p>
                  <p className="text-[11px] text-slate-500 font-mono font-bold">#C89D1F</p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard('#C89D1F')}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {copiedColor === '#C89D1F' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
