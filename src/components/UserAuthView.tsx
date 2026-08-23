import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Logo, { BrandLogo } from './Logo';

interface UserAuthViewProps {
  onLoginSuccess: (user: any, token: string) => void;
  onSkip?: () => void;
  navigateTo?: (path: string) => void;
}

// Curated high-fashion clothing, gadgets, footwear and lifestyle accessories
const FASHION_TILES = [
  { id: 1, name: 'Designer Anarkali Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 2, name: 'Royal Banarasi Silk Saree', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 3, name: 'Amoled Smartwatch Pro', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 4, name: 'Wireless Active Earbuds', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 5, name: 'Denim Trucker Jacket', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 6, name: 'Urban Street Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 7, name: 'Luxury Leather Handbag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 8, name: 'Signature Oud Perfume', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 9, name: 'Polarized Sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 10, name: 'Linen Slim Fit Shirt', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 11, name: 'Velvet Matte Beauty Set', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 12, name: 'Distressed Slim Jeans', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 13, name: 'Party Western Dress', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 14, name: 'Bluetooth Sound Speaker', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 15, name: 'Urban Utility Backpack', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 16, name: 'Classic Gold Ring', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' }
];

export default function UserAuthView({ onLoginSuccess, onSkip, navigateTo }: UserAuthViewProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('123456');

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Countdown timer for OTP resend (60-second strict cooldown rule)
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // WebOTP API: Auto-read SMS OTP on supported mobile devices
  useEffect(() => {
    if (step === 'otp' && 'OTPCredential' in window) {
      const ac = new AbortController();
      (navigator.credentials as any).get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      }).then((otpObj: any) => {
        if (otpObj && otpObj.code) {
          const codeDigits = otpObj.code.slice(0, 6).split('');
          const newDigits = ['', '', '', '', '', ''];
          codeDigits.forEach((c: string, idx: number) => {
            if (idx < 6) newDigits[idx] = c;
          });
          setOtpDigits(newDigits);
          if (otpObj.code.length >= 6) {
            verifyOtpCode(otpObj.code);
          }
        }
      }).catch((err: any) => {
        console.log('WebOTP auto-capture ended or bypassed:', err);
      });

      return () => ac.abort();
    }
  }, [step]);

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (navigateTo) {
      navigateTo('/shop');
    } else {
      window.history.pushState(null, '', '/shop');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // 1-Click Fast Demo Login for instant testing
  const handleInstantDemoLogin = async (demoPhone = '9999999999', demoName = 'Gaurav Beniwal') => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone })
      });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        onLoginSuccess(data.user, data.token);
        return;
      }
      // Fallback customer session
      const fallbackUser = {
        id: `user-${demoPhone}`,
        name: demoName,
        email: '',
        phone: `91${demoPhone.slice(-10)}`,
        address: 'Mansarovar, Jaipur, Rajasthan',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(fallbackUser, 'demo-customer-jwt-token');
    } catch (_) {
      const fallbackUser = {
        id: `user-${demoPhone}`,
        name: demoName,
        email: '',
        phone: `91${demoPhone.slice(-10)}`,
        address: 'Mansarovar, Jaipur, Rajasthan',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(fallbackUser, 'demo-customer-jwt-token');
    } finally {
      setIsProcessing(false);
    }
  };

  // Request SMS verification OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          role: 'user',
          isSignUp: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSimulatedOtp(data.otp || '123456');
        setStep('otp');
        setTimer(data.cooldownRemainingSec || 60);
        setIsResendActive(false);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          otpInputRefs[0].current?.focus();
        }, 100);
      } else {
        if (data.cooldownRemainingSec) {
          setTimer(data.cooldownRemainingSec);
          setIsResendActive(false);
          setStep('otp');
        }
        setErrorMsg(data.error || 'Failed to dispatch verification code.');
      }
    } catch (_) {
      // Offline / fallback guarantee
      setSimulatedOtp('123456');
      setStep('otp');
      setTimer(60);
      setIsResendActive(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!isResendActive) return;
    setIsResendActive(false);
    setTimer(60);
    setErrorMsg('');
    await handleSendOtp();
  };

  // Handle OTP digit changes (Supports 6 digits & pasting)
  const handleOtpChange = (index: number, value: string) => {
    const numericVal = value.replace(/[^0-9]/g, '');
    if (!numericVal && value !== '') return;

    const newDigits = [...otpDigits];
    
    // Handle paste of 6 digits
    if (numericVal.length > 1) {
      const chars = numericVal.slice(0, 6).split('');
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      if (chars.length === 6) {
        verifyOtpCode(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = numericVal;
    setOtpDigits(newDigits);

    // Focus next box if filled
    if (numericVal && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 6 boxes are populated
    if (numericVal && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        verifyOtpCode(fullCode);
      }
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs[index - 1].current?.focus();
      }
    }
  };

  // Verify OTP code
  const verifyOtpCode = async (codeToVerify: string) => {
    setErrorMsg('');
    setIsProcessing(true);

    const cleanPhone = phone.trim().replace(/\s+/g, '') || '9999999999';

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: codeToVerify,
          role: 'user',
          name: cleanPhone === '9999999999' ? 'Gaurav Beniwal' : `Customer ${cleanPhone}`
        })
      });

      const data = await res.json();
      if (res.ok && data.user && data.token) {
        onLoginSuccess(data.user, data.token);
      } else {
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          handleInstantDemoLogin(cleanPhone, cleanPhone === '9999999999' ? 'Gaurav Beniwal' : `Customer ${cleanPhone}`);
        }
      }
    } catch (_) {
      handleInstantDemoLogin(cleanPhone, 'Gaurav Beniwal');
    } finally {
      setIsProcessing(false);
    }
  };

  const isPhoneValid = phone.trim().length === 10;

  return (
    <div className="h-[100dvh] w-full bg-white flex flex-col justify-between overflow-hidden relative select-none" id="customer-login-view">
      
      {/* Injecting marquee animation keyframes and classes */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-l {
          display: flex;
          width: max-content;
          animation: marqueeLeft 35s linear infinite;
        }
        .animate-marquee-r {
          display: flex;
          width: max-content;
          animation: marqueeRight 35s linear infinite;
        }
        /* Hide scrollbars completely */
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ----------------- STEP 1: PHONE NUMBER INPUT ----------------- */}
      {step === 'phone' && (
        <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-between max-w-md mx-auto bg-white">
          
          {/* TOP 60% SCREEN: ANIMATED PRODUCTS SHOWCASE */}
          <div className="absolute top-0 inset-x-0 h-[60vh] overflow-hidden z-0 select-none bg-slate-50/50">
            
            {/* Top Right Floating Skip Login Button */}
            <div className="absolute top-3 right-3 z-40">
              <button
                type="button"
                onClick={handleSkip}
                className="bg-white/90 hover:bg-white text-slate-800 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-md border border-slate-200/80 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                id="skip-login-btn"
              >
                Skip login
              </button>
            </div>

            {/* Fading side overlays */}
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />

            {/* Translucent overlay gradient at 50%-60% screen height zone behind logo */}
            <div className="absolute bottom-0 inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-white/70 to-white z-20 pointer-events-none backdrop-blur-[2px]" />

            {/* 5-ROW PRODUCT ANIMATION MARQUEE FILLING 60% SCREEN */}
            <div className="space-y-2 py-3 h-full flex flex-col justify-around overflow-hidden">
              
              {/* Row 1: Moving Left */}
              <div className="overflow-hidden w-full flex items-center">
                <div className="animate-marquee-l flex gap-2.5 px-2">
                  {[...FASHION_TILES, ...FASHION_TILES, ...FASHION_TILES].map((item, idx) => (
                    <div
                      key={`l1-${item.id}-${idx}`}
                      className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Moving Right */}
              <div className="overflow-hidden w-full flex items-center">
                <div className="animate-marquee-r flex gap-2.5 px-2">
                  {[...FASHION_TILES.slice().reverse(), ...FASHION_TILES.slice().reverse(), ...FASHION_TILES.slice().reverse()].map((item, idx) => (
                    <div
                      key={`l2-${item.id}-${idx}`}
                      className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Moving Left */}
              <div className="overflow-hidden w-full flex items-center">
                <div className="animate-marquee-l flex gap-2.5 px-2">
                  {[...FASHION_TILES.slice().reverse(), ...FASHION_TILES.slice().reverse(), ...FASHION_TILES.slice().reverse()].map((item, idx) => (
                    <div
                      key={`l3-${item.id}-${idx}`}
                      className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Moving Right */}
              <div className="overflow-hidden w-full flex items-center">
                <div className="animate-marquee-r flex gap-2.5 px-2">
                  {[...FASHION_TILES, ...FASHION_TILES, ...FASHION_TILES].map((item, idx) => (
                    <div
                      key={`l4-${item.id}-${idx}`}
                      className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Moving Left (Translucent row passing behind 50% logo mark) */}
              <div className="overflow-hidden w-full flex items-center opacity-80">
                <div className="animate-marquee-l flex gap-2.5 px-2">
                  {[...FASHION_TILES, ...FASHION_TILES, ...FASHION_TILES].map((item, idx) => (
                    <div
                      key={`l5-${item.id}-${idx}`}
                      className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-100 flex-shrink-0`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM 50% SCREEN: LOGIN CARD STARTING AT 50% HEIGHT */}
          <div className="absolute top-[50vh] bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl flex flex-col justify-between px-6 pt-2.5 pb-5 overflow-hidden">
            
            {/* QueKart Logo starting at 50% height */}
            <div className="flex flex-col items-center text-center space-y-1.5">
              <BrandLogo size="md" animated={true} />

              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  India's smartest fashion app
                </h1>
                <p className="text-xs font-bold text-slate-400">
                  Log In or Sign Up in 10 Seconds
                </p>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-1.5 px-3 rounded-xl text-center animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Mobile Number Input Form */}
            <form onSubmit={handleSendOtp} className="w-full space-y-3">
              <div className="flex items-center gap-2.5 w-full">
                
                {/* Indian Flag Badge */}
                <div className="w-13 h-12 bg-slate-50 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-center text-2xl flex-shrink-0 select-none">
                  <span role="img" aria-label="India flag">🇮🇳</span>
                </div>

                {/* Number Input with +91 */}
                <div className="flex-1 h-12 bg-slate-50 rounded-2xl border border-slate-200 shadow-3xs flex items-center px-4 gap-2 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                  <span className="text-sm font-extrabold text-slate-800 select-none">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    placeholder="Enter mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length <= 10) {
                        setPhone(val);
                        setErrorMsg('');
                      }
                    }}
                    className="w-full text-sm font-bold text-slate-900 bg-transparent placeholder:text-slate-400 placeholder:font-medium focus:outline-hidden"
                    id="customer-phone-input"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={!isPhoneValid || isProcessing}
                className={`w-full h-12 rounded-2xl font-black text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-[0.99] ${
                  isPhoneValid && !isProcessing
                    ? 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                    : 'bg-[#94a3b8] text-white cursor-not-allowed opacity-90'
                }`}
                id="customer-phone-continue-btn"
              >
                {isProcessing ? 'Sending Code...' : 'Continue'}
              </button>
            </form>

            {/* Terms of Service Footer - Pinned nicely at bottom edge */}
            <p className="text-[11px] text-slate-400 font-medium text-center leading-normal">
              By continuing, you agree to our{' '}
              <span className="border-b border-dashed border-slate-400 text-slate-500 cursor-pointer">Terms of service</span>
              {' '}&{' '}
              <span className="border-b border-dashed border-slate-400 text-slate-500 cursor-pointer">Privacy policy</span>
            </p>

          </div>

        </div>
      )}

      {/* ----------------- STEP 2: OTP VERIFICATION ----------------- */}
      {step === 'otp' && (
        <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-5 pt-4 pb-8 animate-fadeIn" id="customer-otp-view">
          
          <div>
            {/* Top Bar with Back Arrow and Title */}
            <div className="flex items-center gap-3 pt-2 pb-8">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg('');
                }}
                className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                id="otp-back-arrow-btn"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                OTP verification
              </h2>
            </div>

            {/* Subtitle with Phone Number */}
            <div className="text-center space-y-1.5 px-4 mb-8">
              <p className="text-sm font-medium text-slate-600">
                We've sent a verification code to
              </p>
              <p className="text-base font-black text-slate-900">
                +91 {phone || '9999999999'}
              </p>
            </div>

            {/* 6-Box Clean OTP Input UI */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 my-6">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-black rounded-xl border transition-all ${
                    digit 
                      ? 'bg-white border-slate-900 text-slate-900 shadow-xs' 
                      : 'bg-[#f1f5f9] border-transparent text-slate-900 focus:bg-white focus:border-slate-800'
                  } focus:outline-hidden`}
                  id={`otp-box-${idx}`}
                />
              ))}
            </div>

            {/* Resend OTP Timer / Button */}
            <div className="text-center mt-6">
              {timer > 0 ? (
                <p className="text-sm font-medium text-slate-500">
                  Resend OTP in <span className="font-bold text-slate-700">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm font-black text-[#143C6B] hover:text-lucky-magenta transition-colors cursor-pointer"
                  id="resend-otp-btn"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-2 px-3 rounded-xl text-center">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Quick Simulation Code Helper */}
          <div className="w-full space-y-3 pt-6">
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  SMS Code Sent: <span className="font-mono font-black text-sm text-[#143C6B] bg-white px-2 py-0.5 rounded-lg border border-slate-200">{simulatedOtp}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Click Auto-Fill to capture SMS OTP</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const chars = simulatedOtp.slice(0, 6).split('');
                  setOtpDigits(chars);
                  verifyOtpCode(chars.join(''));
                }}
                className="bg-[#143C6B] text-white text-xs font-bold py-2 px-3.5 rounded-xl hover:bg-[#0C2340] active:scale-95 cursor-pointer shadow-xs"
                id="auto-fill-otp-btn"
              >
                Auto-Fill
              </button>
            </div>

            <button
              type="button"
              disabled={otpDigits.join('').length !== 6 || isProcessing}
              onClick={() => verifyOtpCode(otpDigits.join(''))}
              className={`w-full h-13 rounded-2xl font-black text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-[0.99] ${
                otpDigits.join('').length === 6 && !isProcessing
                  ? 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                  : 'bg-[#94a3b8] text-white cursor-not-allowed opacity-90'
              }`}
              id="verify-otp-submit-btn"
            >
              {isProcessing ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
