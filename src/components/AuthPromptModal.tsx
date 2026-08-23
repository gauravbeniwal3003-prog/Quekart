import React from 'react';
import { X, ShieldCheck, Zap, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import Logo, { BrandLogo } from './Logo';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  actionTitle?: string;
  actionDescription?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  onLogin,
  actionTitle = 'Sign in to Continue',
  actionDescription = 'Please log in with your mobile number to add items to your cart, save favorites, and place orders on QueKart.'
}: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" id="auth-prompt-modal">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          id="auth-modal-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pt-1 pb-3">
          <BrandLogo size="lg" layout="col" className="mb-3" />

          <h3 className="text-lg font-black text-slate-900 tracking-tight font-display" id="auth-modal-title">
            {actionTitle}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed px-2" id="auth-modal-desc">
            {actionDescription}
          </p>
        </div>

        {/* Value Props */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2.5 my-3">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[#143C6B] flex-shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span>Fast 1-Click Order Placement & COD</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span>Extra ₹150 Welcome Discount & UPI Offers</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>Real-time Live SMS & WhatsApp Tracking</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="w-full h-12 bg-[#143C6B] hover:bg-[#0C2340] active:scale-[0.99] text-white rounded-2xl font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            id="auth-modal-login-btn"
          >
            <span>LOG IN / SIGN UP WITH MOBILE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
            id="auth-modal-guest-btn"
          >
            Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
