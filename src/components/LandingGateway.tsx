import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Store, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Lock,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import Logo, { BrandLogo } from './Logo';

interface LandingGatewayProps {
  onNavigate: (path: string) => void;
}

// Interactive detailed policy modal states
type ModalType = 'contact' | 'refund' | 'terms' | 'privacy' | null;

const LANDING_TILES_1 = [
  { id: 1, name: 'Designer Anarkali Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 2, name: 'Royal Banarasi Silk Saree', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 3, name: 'Amoled Smartwatch Pro', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 4, name: 'Wireless Active Earbuds', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 5, name: 'Denim Trucker Jacket', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 6, name: 'Urban Street Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' }
];

const LANDING_TILES_2 = [
  { id: 7, name: 'Luxury Leather Handbag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 8, name: 'Signature Oud Perfume', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 9, name: 'Polarized Sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 10, name: 'Linen Slim Fit Shirt', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 11, name: 'Velvet Matte Beauty Set', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 12, name: 'Classic Gold Ring', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' }
];

export default function LandingGateway({ onNavigate }: LandingGatewayProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [contactFormStatus, setContactFormStatus] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormStatus('Thank you! Your message has been routed to our corporate support ledger. We will reach back within 4 business hours.');
    setTimeout(() => setContactFormStatus(null), 8000);
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between relative overflow-hidden select-none bg-slate-50" id="platform-gateway">
      
      {/* Premium next-gen custom styles and seamless keyframes */}
      <style>{`
        @keyframes marqueeLeftInfinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRightInfinite {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left-slow {
          display: flex;
          width: max-content;
          animation: marqueeLeftInfinite 40s linear infinite;
        }
        .animate-marquee-right-slow {
          display: flex;
          width: max-content;
          animation: marqueeRightInfinite 40s linear infinite;
        }
        .text-navy {
          color: #143C6B;
        }
        .bg-navy {
          background-color: #143C6B;
        }
        .border-navy {
          border-color: #143C6B;
        }
        .text-brand-gold {
          color: #C89D1F;
        }
        .bg-brand-gold {
          background-color: #C89D1F;
        }
        .border-brand-gold {
          border-color: #C89D1F;
        }
      `}</style>

      {/* Ambient background with logo color tints */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-white to-slate-50/60 z-0 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        
        {/* 1. Header pinned always on top - Minimal QueKart logo and name only */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-4 sm:px-8 py-3.5 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <BrandLogo size="md" onClick={() => onNavigate('/')} id="landing-logo-brand" />
          </div>
        </header>

        {/* 2. Headline Section */}
        <div className="pt-6 sm:pt-10 pb-3 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight font-display">
            A New Era of <span style={{ color: '#143C6B' }}>Shopping</span>
          </h1>
          <p className="text-base sm:text-2xl font-bold text-[#C89D1F] tracking-wide mt-2 font-display">
            Shop. Enjoy. Get Surprised.
          </p>
        </div>

        {/* 3. 8-ROW CLOTHING ANIMATION WITH TRANSLUCENT BOTTOM ROWS & OVERLAY ACTION BUTTONS */}
        <div className="relative w-full overflow-hidden select-none py-2 my-2">
          {/* Fading side overlays */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-20 pointer-events-none" />

          {/* 8-ROW MARQUEE GRID */}
          <div className="space-y-2.5 w-full">
            
            {/* ROW 1 (Clear 100%) - Moving Left */}
            <div className="overflow-hidden w-full flex items-center opacity-100">
              <div className="animate-marquee-left-slow flex gap-3 px-2">
                {[...LANDING_TILES_1, ...LANDING_TILES_1, ...LANDING_TILES_1, ...LANDING_TILES_1].map((item, idx) => (
                  <div
                    key={`showcase-r1-${item.id}-${idx}`}
                    className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                  >
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl drop-shadow-xs" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2 (Clear 100%) - Moving Right */}
            <div className="overflow-hidden w-full flex items-center opacity-100">
              <div className="animate-marquee-right-slow flex gap-3 px-2">
                {[...LANDING_TILES_2, ...LANDING_TILES_2, ...LANDING_TILES_2, ...LANDING_TILES_2].map((item, idx) => (
                  <div
                    key={`showcase-r2-${item.id}-${idx}`}
                    className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                  >
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl drop-shadow-xs" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3 (Clear 100%) - Moving Left */}
            <div className="overflow-hidden w-full flex items-center opacity-100">
              <div className="animate-marquee-left-slow flex gap-3 px-2">
                {[...LANDING_TILES_2.slice().reverse(), ...LANDING_TILES_2.slice().reverse(), ...LANDING_TILES_2.slice().reverse(), ...LANDING_TILES_2.slice().reverse()].map((item, idx) => (
                  <div
                    key={`showcase-r3-${item.id}-${idx}`}
                    className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                  >
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl drop-shadow-xs" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 4 (Clear 100%) - Moving Right */}
            <div className="overflow-hidden w-full flex items-center opacity-100">
              <div className="animate-marquee-right-slow flex gap-3 px-2">
                {[...LANDING_TILES_1.slice().reverse(), ...LANDING_TILES_1.slice().reverse(), ...LANDING_TILES_1.slice().reverse(), ...LANDING_TILES_1.slice().reverse()].map((item, idx) => (
                  <div
                    key={`showcase-r4-${item.id}-${idx}`}
                    className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                  >
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl drop-shadow-xs" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>

            {/* TRANSLUCENT BOTTOM 4 ROWS AREA WITH OVERLAY BUTTONS */}
            <div className="relative pt-1">
              
              {/* ROW 5 (Translucent 75%) - Moving Left */}
              <div className="overflow-hidden w-full flex items-center opacity-75">
                <div className="animate-marquee-left-slow flex gap-3 px-2">
                  {[...LANDING_TILES_1, ...LANDING_TILES_1, ...LANDING_TILES_1, ...LANDING_TILES_1].map((item, idx) => (
                    <div
                      key={`showcase-r5-${item.id}-${idx}`}
                      className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ROW 6 (Translucent 55%) - Moving Right */}
              <div className="overflow-hidden w-full flex items-center opacity-55 my-2.5">
                <div className="animate-marquee-right-slow flex gap-3 px-2">
                  {[...LANDING_TILES_2, ...LANDING_TILES_2, ...LANDING_TILES_2, ...LANDING_TILES_2].map((item, idx) => (
                    <div
                      key={`showcase-r6-${item.id}-${idx}`}
                      className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ROW 7 (Translucent 35%) - Moving Left */}
              <div className="overflow-hidden w-full flex items-center opacity-35">
                <div className="animate-marquee-left-slow flex gap-3 px-2">
                  {[...LANDING_TILES_2.slice().reverse(), ...LANDING_TILES_2.slice().reverse(), ...LANDING_TILES_2.slice().reverse(), ...LANDING_TILES_2.slice().reverse()].map((item, idx) => (
                    <div
                      key={`showcase-r7-${item.id}-${idx}`}
                      className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ROW 8 (Translucent 20%) - Moving Right */}
              <div className="overflow-hidden w-full flex items-center opacity-20 my-2.5">
                <div className="animate-marquee-right-slow flex gap-3 px-2">
                  {[...LANDING_TILES_1.slice().reverse(), ...LANDING_TILES_1.slice().reverse(), ...LANDING_TILES_1.slice().reverse(), ...LANDING_TILES_1.slice().reverse()].map((item, idx) => (
                    <div
                      key={`showcase-r8-${item.id}-${idx}`}
                      className={`${item.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* FLOATING ACTION BUTTONS OVERLAY ON TRANSLUCENT LINES */}
              <div className="absolute inset-0 z-30 flex items-center justify-center px-4 bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full max-w-xl mx-auto backdrop-blur-xs p-4 rounded-3xl bg-white/40 border border-white/60 shadow-lg">
                  
                  {/* Button 1: Start Shopping */}
                  <button
                    type="button"
                    onClick={() => onNavigate('/shop')}
                    className="w-full sm:w-1/2 text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer bg-navy hover:brightness-110 hover:shadow-xl active:scale-98 group"
                    id="btn-start-shopping"
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                    <span>Start Shopping</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  {/* Button 2: Register as Vendor */}
                  <button
                    type="button"
                    onClick={() => onNavigate('/vendor')}
                    className="w-full sm:w-1/2 text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer bg-brand-gold hover:brightness-110 hover:shadow-xl active:scale-98 group"
                    id="btn-register-vendor"
                  >
                    <Store className="w-5 h-5 stroke-[2.5]" />
                    <span>Register as Vendor</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 4. THREE GOOD HIGHLIGHT POINTS FOR OUR WEBSITE */}
        <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Choose <span style={{ color: '#143C6B' }}>Que</span><span style={{ color: '#C89D1F' }}>Kart</span>?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">Direct, Transparent & Fast E-Commerce Experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Point 1: 0% Platform Commission */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-3xs flex flex-col items-center text-center hover:border-blue-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#143C6B] flex items-center justify-center mb-4">
                <Store className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">0% Platform Commission</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Direct manufacturer-to-retailer pricing with zero hidden fees, enabling sellers to pass maximum margin and discounts to customers.
              </p>
            </div>

            {/* Point 2: 10-Second Fast OTP Login */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-3xs flex flex-col items-center text-center hover:border-amber-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-[#C89D1F] flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">10-Second Instant Checkout</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No passwords required. Access accounts instantly with seamless mobile OTP authentication and 1-click quick guest browsing.
              </p>
            </div>

            {/* Point 3: 100% GST Verified Suppliers & Cash on Delivery */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-3xs flex flex-col items-center text-center hover:border-emerald-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">100% GST Verified & COD</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Every wholesaler is government GST verified with Surat & Jaipur warehouse nodes, offering guaranteed quality and Cash on Delivery.
              </p>
            </div>

          </div>
        </section>

        {/* 5. PROFESSIONAL REGISTERED ENTERPRISE FOOTER WITH DETAILED COMPLIANCE DRAWER LINKS */}
        <footer className="bg-white border-t border-slate-200/90 py-10 px-4 sm:px-8 mt-12">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
              
              {/* Brand Description */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Logo className="h-7 w-7" />
                  <span className="text-lg font-black tracking-tight flex items-center">
                    <span style={{ color: '#143C6B' }}>Que</span>
                    <span style={{ color: '#C89D1F' }}>Kart</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm">
                  QueKart Commerce Private Limited is a registered corporate enterprise facilitating frictionless direct transactions between licensed Indian textile manufacturers, verified small businesses, and retail shoppers.
                </p>
                <p className="text-[10px] text-slate-400 font-mono font-bold">
                  Corporate Identity Number (CIN): U72900RJ2026PTC091054
                </p>
              </div>

              {/* Useful Portal Routes */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Commerce Portals</h4>
                <div className="flex flex-col space-y-2 text-xs font-bold text-slate-500">
                  <button onClick={() => onNavigate('/shop')} className="hover:text-[#143C6B] transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#143C6B]" />
                    <span>Explore E-Shop</span>
                  </button>
                  <button onClick={() => onNavigate('/vendor')} className="hover:text-[#C89D1F] transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#C89D1F]" />
                    <span>Sell on QueKart (0%)</span>
                  </button>
                </div>
              </div>

              {/* Registered Legal Links */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Compliance & Policies</h4>
                <div className="flex flex-col space-y-2 text-xs font-black text-[#143C6B]">
                  <button onClick={() => setActiveModal('contact')} className="hover:text-[#C89D1F] text-left transition-colors cursor-pointer flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Contact Us
                  </button>
                  <button onClick={() => setActiveModal('refund')} className="hover:text-[#C89D1F] text-left transition-colors cursor-pointer flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Refund & Cancellations
                  </button>
                  <button onClick={() => setActiveModal('terms')} className="hover:text-[#C89D1F] text-left transition-colors cursor-pointer flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                  </button>
                  <button onClick={() => setActiveModal('privacy')} className="hover:text-[#C89D1F] text-left transition-colors cursor-pointer flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Privacy Policy
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Credit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
              <p>© 2026 QueKart Commerce Private Limited. Registered in Surat & Jaipur, India. All rights reserved.</p>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span>ISO 9001:2015 Certified</span>
                <span>•</span>
                <span>GSTIN Compliant Network</span>
              </div>
            </div>

          </div>
        </footer>

        {/* 6. DYNAMIC POLICY MODAL POPUP WINDOWS */}
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Logo className="w-6 h-6" />
                  <h3 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wide">
                    {activeModal === 'contact' && 'Corporate Contact Registry'}
                    {activeModal === 'refund' && 'Refund, Returns & Cancellations'}
                    {activeModal === 'terms' && 'Terms of Service Agreement'}
                    {activeModal === 'privacy' && 'Privacy & Data Protection Policy'}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable Detailed Legalese */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed font-semibold max-h-[60vh]">
                
                {activeModal === 'contact' && (
                  <div className="space-y-4">
                    <p className="text-slate-500">
                      Our customer grievance and seller registration helpdesks are active 24/7 to resolve transactional and catalogue compliance tickets immediately. Please reach out through any channel below.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <Mail className="w-4 h-4 text-[#143C6B]" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Support Email</span>
                        <a href="mailto:support@quekart.com" className="font-bold text-[#143C6B] block truncate">support@quekart.com</a>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <Phone className="w-4 h-4 text-[#143C6B]" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Helpline</span>
                        <a href="tel:+911412891000" className="font-bold text-[#143C6B] block">+91 141-289-1000</a>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <MapPin className="w-4 h-4 text-[#143C6B]" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered HQ</span>
                        <span className="font-bold text-slate-800 block truncate">Surat & Jaipur Nodes</span>
                      </div>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-3 pt-3 border-t border-slate-100">
                      <h4 className="text-slate-800 font-bold uppercase text-[11px]">Instant Corporate Message Desk</h4>
                      {contactFormStatus && (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-xs font-bold">
                          {contactFormStatus}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Legal Full Name" 
                          required 
                          className="border border-slate-300 rounded-lg p-2 bg-white text-xs font-medium focus:outline-[#143C6B]"
                        />
                        <input 
                          type="email" 
                          placeholder="Your Email Address" 
                          required 
                          className="border border-slate-300 rounded-lg p-2 bg-white text-xs font-medium focus:outline-[#143C6B]"
                        />
                      </div>
                      <textarea 
                        rows={3} 
                        placeholder="Please write details of your query, merchant application, or order grievance..." 
                        required 
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs font-medium focus:outline-[#143C6B]"
                      />
                      <button 
                        type="submit" 
                        className="bg-[#143C6B] text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer hover:bg-opacity-90 w-full"
                      >
                        Submit Ticket
                      </button>
                    </form>
                  </div>
                )}

                {activeModal === 'refund' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="font-black block">Important Consumer Clause</span>
                        We operate on <strong>No Questions Asked 7-Day Returns & Exchanges</strong> on all approved catalog categories!
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-slate-800 font-black uppercase text-[11px]">1. Scope of Returns</h4>
                      <p>
                        QueKart allows direct returns or exchanges of eligible wholesale products purchased via the retail storefront within 7 calendar days from the actual delivery timestamp. All packages must remain in original unused merchant condition with price tags fully attached.
                      </p>

                      <h4 className="text-slate-800 font-black uppercase text-[11px]">2. Payout Returns Procedure</h4>
                      <p>
                        Once our logistics courier retrieves the packet from your designated warehouse/shipping address, the physical stock is automatically verified in our Surat/Jaipur hub nodes. Payouts are generated back within 24-48 business hours directly to your designated bank account, UPI ID, or original billing instrument.
                      </p>

                      <h4 className="text-slate-800 font-black uppercase text-[11px]">3. Reverse Pickup Service Fee</h4>
                      <p>
                        Reverse shipping is completely sponsored for products reported with packaging defects or wrong dispatches. For voluntary returns, a standard reverse courier facilitation ledger rate of ₹39 may apply.
                      </p>
                    </div>
                  </div>
                )}

                {activeModal === 'terms' && (
                  <div className="space-y-4">
                    <p className="text-slate-500 font-mono text-[10px]">Last Updated: August 20, 2026</p>
                    
                    <div className="space-y-3">
                      <h4 className="text-slate-800 font-black uppercase text-[11px]">1. Agreement to Terms</h4>
                      <p>
                        By visiting the storefront, registering as an active wholesale merchant, or using our demo OTP systems, you represent and warrant that you hold legal authority to engage under Indian Business & E-Commerce Law guidelines.
                      </p>

                      <h4 className="text-slate-800 font-black uppercase text-[11px]">2. Zero Commission Marketplace Model</h4>
                      <p>
                        QueKart acts as a direct-to-retail facilitation system. We do not extract commissions on supplier payout transactions. Vendors are directly liable for catalog accuracy, fabric grade certifications, and dispatch compliance.
                      </p>

                      <h4 className="text-slate-800 font-black uppercase text-[11px]">3. Prohibited Merchant Activities</h4>
                      <p>
                        Merchant listings containing counterfeit labels, copy-pasted copyright imagery, misleading MRP price points, or duplicate listings are automatically flagged by our systems and sent to administration blocks immediately.
                      </p>
                    </div>
                  </div>
                )}

                {activeModal === 'privacy' && (
                  <div className="space-y-4">
                    <p className="text-slate-500 font-mono text-[10px]">Information Security Officer Ledger (2026 Revision)</p>

                    <div className="space-y-3">
                      <h4 className="text-slate-800 font-black uppercase text-[11px]">1. User Data Ownership</h4>
                      <p>
                        QueKart enforces standard secure encryption hashes. We never share customer contact numbers, delivery addresses, billing sheets, or catalog analytics with third-party marketing brokers.
                      </p>

                      <h4 className="text-slate-800 font-black uppercase text-[11px]">2. Cookie & Tracking Protocols</h4>
                      <p>
                        We use limited cookie protocols to persist active client session logs (such as cart lists, user login states, and active checkout pathways). These coordinates stay encrypted on your local device.
                      </p>

                      <h4 className="text-slate-800 font-black uppercase text-[11px]">3. Government GSTIN Ledgers</h4>
                      <p>
                        All merchant GST registration documents verified on the supplier panel are securely cross-checked with the Government GSTN systems through secured proxy servers and are permanently locked against unauthorized modifications to prevent transactional fraud.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-[10px] text-slate-400 font-mono font-bold">Secure SSL Verification</span>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="bg-[#143C6B] text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-opacity-95"
                >
                  Close Document
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
