import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Sparkles, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import Logo, { BrandLogo } from './Logo';
import { getApiUrl } from '../utils/api';

interface UserAuthViewProps {
  onLoginSuccess: (user: any, token: string) => void;
  onSkip?: () => void;
  navigateTo?: (path: string) => void;
}

// 5 Distinct tile datasets for User Login Page ensuring every row in the animation has unique products
const FASHION_ROW_1 = [
  { id: 101, name: 'Designer Anarkali Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 102, name: 'Royal Banarasi Silk Saree', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 103, name: 'Chikankari Kurti', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 104, name: 'Sherwani Suit', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 105, name: 'Handloom Silk Dupatta', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 106, name: 'Bandhgala Jacket', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' }
];

const FASHION_ROW_2 = [
  { id: 201, name: 'Amoled Smartwatch Pro', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 202, name: 'Wireless Active Earbuds', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 203, name: 'Bluetooth Sound Speaker', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 204, name: 'Noise Cancelling Headphones', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 205, name: '4K Action Camera', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 206, name: 'Chronograph Steel Watch', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const FASHION_ROW_3 = [
  { id: 301, name: 'Denim Trucker Jacket', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 302, name: 'Linen Slim Fit Shirt', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 303, name: 'Distressed Slim Jeans', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 304, name: 'Party Western Dress', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 305, name: 'Biker Leather Jacket', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 306, name: 'Streetwear Hoodie', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const FASHION_ROW_4 = [
  { id: 401, name: 'Urban Street Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 402, name: 'Running Sport Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 403, name: 'Leather Chelsea Boots', img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 404, name: 'Basketball Kicks', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 405, name: 'Handcrafted Casual Loafers', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 406, name: 'Canvas Skate Shoes', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' }
];

const FASHION_ROW_5 = [
  { id: 501, name: 'Luxury Leather Handbag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 502, name: 'Signature Oud Perfume', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 503, name: 'Polarized Sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 504, name: 'Velvet Matte Beauty Set', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 505, name: 'Urban Utility Backpack', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 506, name: 'Classic Gold Ring', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' }
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
      const res = await fetch(getApiUrl('/api/auth/user-login'), {
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

  const [showSuccessTick, setShowSuccessTick] = useState(false);

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

    // Prompt WebOTP API permission listener for auto-capture
    if (typeof window !== 'undefined' && 'OTPCredential' in window) {
      try {
        const ac = new AbortController();
        navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal
        } as any).then((content: any) => {
          if (content && content.code) {
            const chars = content.code.slice(0, 6).split('');
            setOtpDigits(chars);
            verifyOtpCode(content.code);
          }
        }).catch(err => {
          console.log('WebOTP Listener inactive:', err);
        });
      } catch (err) {
        console.log('WebOTP API init error:', err);
      }
    }

    try {
      const res = await fetch(getApiUrl('/api/auth/send-otp'), {
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

    const cleanPhone = phone.trim().replace(/\s+/g, '');

    try {
      const res = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: codeToVerify,
          role: 'user',
          name: `Customer ${cleanPhone}`
        })
      });

      const data = await res.json();
      if (res.ok && data.user && data.token) {
        // Trigger smooth green tick animation
        setShowSuccessTick(true);
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1100);
      } else {
        // Mobile vibration on incorrect OTP
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(200);
          } catch (_) {}
        }
        setErrorMsg(data.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (_) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(200);
        } catch (_) {}
      }
      setErrorMsg('Network error. Unable to verify OTP code.');
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
                  {[...FASHION_ROW_1, ...FASHION_ROW_1, ...FASHION_ROW_1].map((item, idx) => (
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
                  {[...FASHION_ROW_2, ...FASHION_ROW_2, ...FASHION_ROW_2].map((item, idx) => (
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
                  {[...FASHION_ROW_3, ...FASHION_ROW_3, ...FASHION_ROW_3].map((item, idx) => (
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
                  {[...FASHION_ROW_4, ...FASHION_ROW_4, ...FASHION_ROW_4].map((item, idx) => (
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
                  {[...FASHION_ROW_5, ...FASHION_ROW_5, ...FASHION_ROW_5].map((item, idx) => (
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

          <div className="w-full space-y-3 pt-6">
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

      {/* Smooth Green Success Tick Animation Modal Overlay */}
      {showSuccessTick && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="bg-white rounded-3xl p-7 flex flex-col items-center justify-center shadow-2xl border border-emerald-100 text-center max-w-xs w-full"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 relative shadow-sm">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="absolute inset-0 rounded-full bg-emerald-400"
              />
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 stroke-[2.5]" />
              </motion.div>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">OTP Verified!</h3>
            <p className="text-xs font-semibold text-slate-500">Welcome to QueKart</p>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
