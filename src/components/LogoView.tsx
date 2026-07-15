import React from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

interface LogoViewProps {
  onBack: () => void;
}

export default function LogoView({ onBack }: LogoViewProps) {
  const handleDownload = () => {
    // We can generate an SVG string and download it
    const svgContent = `
<svg width="800" height="800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Left Side (Blue) -->
  <g stroke="#17436B" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 12 22 L 25 22 L 32 52 L 50 52" />
    <path d="M 32 52 C 32 64, 16 64, 25 70 L 50 70" />
    <path d="M 27 32 L 50 32" />
    <path d="M 35 32 L 38 52" />
    <path d="M 43 32 L 44 52" />
    <path d="M 29 39 L 50 39" />
    <path d="M 30 46 L 50 46" />
    <circle cx="32" cy="82" r="5" fill="#17436B" stroke="none" />
    <circle cx="32" cy="82" r="2" fill="white" stroke="none" />
  </g>

  <!-- Right Side (Gold) -->
  <g stroke="#C49B48" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 50 52 L 72 52 L 79 32 L 50 32" />
    <path d="M 50 70 L 68 70" />
    <path d="M 57 32 L 56 52" />
    <path d="M 65 32 L 64 52" />
    <path d="M 50 39 L 76 39" />
    <path d="M 50 46 L 74 46" />
    <circle cx="64" cy="82" r="5" fill="#C49B48" stroke="none" />
    <circle cx="64" cy="82" r="2" fill="white" stroke="none" />
  </g>
  
  <!-- Arrow (Gold) with white stroke for cutout effect -->
  <g>
    <path d="M 42 62 Q 62 52 82 28" fill="none" stroke="white" stroke-width="10" stroke-linecap="round" />
    <path d="M 42 62 Q 62 52 82 28" fill="none" stroke="#C49B48" stroke-width="5.5" stroke-linecap="round" />
    <polygon points="72,28 92,18 85,38" fill="white" stroke="white" stroke-width="4" stroke-linejoin="round" />
    <polygon points="74,27 90,20 84,36" fill="#C49B48" stroke="#C49B48" stroke-width="2" stroke-linejoin="round" />
  </g>
</svg>
    `.trim();

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quekart-logo-hq.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white min-h-[calc(100vh-130px)] pb-16 w-full flex flex-col items-center p-6">
      <div className="w-full max-w-4xl flex items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-black text-gray-800">Brand Identity</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-gray-50 rounded-3xl p-12 md:p-24 shadow-sm border border-gray-100 mb-12 flex flex-col items-center">
          <Logo animated={false} width={240} height={240} className="mb-8 drop-shadow-sm" />
          <div className="text-center">
            <h2 className="text-4xl font-black text-lucky-magenta tracking-tight">QueKart</h2>
            <p className="text-gray-500 font-semibold mt-2">Official High-Quality Vector Logo</p>
          </div>
        </div>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-3 bg-lucky-magenta hover:bg-lucky-magenta-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Download className="w-6 h-6" />
          Download SVG (HQ)
        </button>
      </div>
    </div>
  );
}
