import React from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

interface LogoViewProps {
  onBack: () => void;
}

export default function LogoView({ onBack }: LogoViewProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch('https://i.ibb.co/Rt6vbFm/file-0000000005187206b6cd29703bc3b791.png');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quekart-logo-hq.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      // Fallback
      window.open('https://i.ibb.co/Rt6vbFm/file-0000000005187206b6cd29703bc3b791.png', '_blank');
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-130px)] pb-16 w-full flex flex-col items-center p-6">
      <div className="w-full max-w-4xl flex items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Brand Identity</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-gray-50 rounded-3xl p-12 md:p-24 shadow-sm border border-gray-100 mb-12 flex flex-col items-center">
          <Logo animated={false} width={240} height={240} className="mb-8 drop-shadow-sm" />
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight flex items-center justify-center">
              <span style={{ color: '#143C6B' }}>Que</span>
              <span style={{ color: '#C89D1F' }}>Kart</span>
            </h2>
            <p className="text-gray-500 font-semibold mt-2">Official High-Quality Logo</p>
          </div>
        </div>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-3 bg-lucky-magenta hover:bg-lucky-magenta-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Download className="w-6 h-6" />
          Download Logo (HQ)
        </button>
      </div>
    </div>
  );
}
