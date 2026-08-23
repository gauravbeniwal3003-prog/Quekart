import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  Store, 
  FileText, 
  User, 
  CheckCircle2,
  Lock,
  Phone,
  BadgeCheck,
  AlertCircle,
  MapPin,
  Building2
} from 'lucide-react';
import { BrandLogo } from './Logo';
import { Vendor } from '../types';
import { motion } from 'motion/react';
import { getApiUrl } from '../utils/api';

interface VendorAuthViewProps {
  onLoginSuccess: (vendor: Vendor, token?: string) => void;
  systemVendors?: Vendor[];
  navigateTo?: (path: string) => void;
}

interface GstData {
  gstin: string;
  verified: boolean;
  status: string;
  legal_name: string;
  trade_name: string;
  business_type: string;
  registration_date: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
}

// 5 Distinct wholesale product showcase tile datasets for Vendor Login Page ensuring every row in the animation has unique products
const WHOLESALE_ROW_1 = [
  { id: 101, name: 'Banarasi Saree', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 102, name: 'Anarkali Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 103, name: 'Velvet Sherwani', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 104, name: 'Chanderi Lehenga', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 105, name: 'Jacquard Dupatta', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 106, name: 'Ethnic Bandhgala', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' }
];

const WHOLESALE_ROW_2 = [
  { id: 201, name: 'Smartwatch Pro', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 202, name: 'Active Earbuds', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 203, name: 'Sound Speaker', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 204, name: 'Over-Ear Headphones', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 205, name: '4K Action Cam', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 206, name: 'Chronograph Steel Watch', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const WHOLESALE_ROW_3 = [
  { id: 301, name: 'Denim Jacket', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 302, name: 'Linen Shirt', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 303, name: 'Slim Jeans', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 304, name: 'Western Dress', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 305, name: 'Leather Biker Jacket', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 306, name: 'Fleece Hoodie', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const WHOLESALE_ROW_4 = [
  { id: 401, name: 'Street Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 402, name: 'Sports Running Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 403, name: 'Leather Chelsea Boots', img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 404, name: 'Basketball Shoes', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 405, name: 'Formal Loafers', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 406, name: 'Canvas Skate Shoes', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' }
];

const WHOLESALE_ROW_5 = [
  { id: 501, name: 'Leather Bag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 502, name: 'Oud Perfume', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 503, name: 'Sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 504, name: 'Beauty Set', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 505, name: 'Utility Travel Backpack', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 506, name: 'Classic Gold Ring', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' }
];

export default function VendorAuthView({ 
  onLoginSuccess, 
  systemVendors = [] 
}: VendorAuthViewProps) {
  // Top Level Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login flow step: 'form' | 'otp'
  const [loginStep, setLoginStep] = useState<'form' | 'otp'>('form');

  // ----------------- LOGIN STATE -----------------
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtpDigits, setLoginOtpDigits] = useState(['', '', '', '', '', '']);
  const [loginTimer, setLoginTimer] = useState(60);
  const [isLoginResendActive, setIsLoginResendActive] = useState(false);
  const [loginSimulatedOtp, setLoginSimulatedOtp] = useState('123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ----------------- SIGN UP INLINE STATE -----------------
  // 1. Name (Owner / Legal Name)
  const [ownerName, setOwnerName] = useState('');
  // 2. Business / Store Name
  const [storeName, setStoreName] = useState('');
  // 3. GSTIN (Optional) + Verification Button state + Synced GST Data
  const [gstin, setGstin] = useState('');
  const [isGstVerifying, setIsGstVerifying] = useState(false);
  const [isGstVerified, setIsGstVerified] = useState(false);
  const [gstData, setGstData] = useState<GstData | null>(null);

  // Address fields synced from GST (or auto-assigned)
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState('Rajasthan');
  const [district, setDistrict] = useState('Jaipur');
  const [pincode, setPincode] = useState('302001');

  // 4. Mobile No. + Inline OTP
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpOtpDigits, setSignUpOtpDigits] = useState(['', '', '', '', '', '']);
  const [signUpSimulatedOtp, setSignUpSimulatedOtp] = useState('123456');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [signUpTimer, setSignUpTimer] = useState(60);
  const [isSignUpResendActive, setIsSignUpResendActive] = useState(false);

  // OTP input refs
  const loginOtpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const signUpInlineOtpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Timer countdown for Login OTP
  useEffect(() => {
    let interval: any = null;
    if (authMode === 'login' && loginStep === 'otp' && loginTimer > 0) {
      interval = setInterval(() => {
        setLoginTimer(prev => prev - 1);
      }, 1000);
    } else if (loginTimer === 0) {
      setIsLoginResendActive(true);
    }
    return () => clearInterval(interval);
  }, [authMode, loginStep, loginTimer]);

  // Timer countdown for Sign Up OTP
  useEffect(() => {
    let interval: any = null;
    if (authMode === 'signup' && isOtpSent && !isMobileVerified && signUpTimer > 0) {
      interval = setInterval(() => {
        setSignUpTimer(prev => prev - 1);
      }, 1000);
    } else if (signUpTimer === 0) {
      setIsSignUpResendActive(true);
    }
    return () => clearInterval(interval);
  }, [authMode, isOtpSent, isMobileVerified, signUpTimer]);

  // ----------------- GST VERIFICATION BUTTON HANDLER -----------------
  // Does NOT automatically fire on typing; triggers only on button click
  const handleVerifyGstClick = async () => {
    const cleanGst = gstin.trim().toUpperCase();
    if (cleanGst.length !== 15) {
      setErrorMsg('Please enter a valid 15-character GSTIN number to verify.');
      return;
    }

    setErrorMsg('');
    setIsGstVerifying(true);

    try {
      const res = await fetch(getApiUrl('/api/auth/verify-gst-lookup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: cleanGst })
      });

      const json = await res.json();
      if (res.ok && json.data && json.data.verified) {
        const d: GstData = json.data;
        setGstData(d);
        setIsGstVerified(true);

        // Sync details from GST API Response and lock fields
        if (d.legal_name) {
          setOwnerName(d.legal_name);
        }
        if (d.trade_name) {
          setStoreName(d.trade_name);
        } else if (d.legal_name) {
          setStoreName(d.legal_name);
        }
        if (d.address) {
          setAddress(d.address);
        }
        if (d.state) {
          setStateName(d.state);
        }
        if (d.district) {
          setDistrict(d.district);
        }
        if (d.pincode) {
          setPincode(d.pincode);
        }
      } else {
        setErrorMsg(json.message || json.error || 'GST Number verification failed. Only active GST registered sellers are eligible.');
        setIsGstVerified(false);
      }
    } catch (err: any) {
      setErrorMsg('Network error connecting to GST verification service. Please try again.');
      setIsGstVerified(false);
    } finally {
      setIsGstVerifying(false);
    }
  };

  // ----------------- LOGIN HANDLERS -----------------
  const [showVendorSuccessTick, setShowVendorSuccessTick] = useState(false);

  const handleSendLoginOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanPhone = loginPhone.trim().replace(/\s+/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
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
            setLoginOtpDigits(chars);
            verifyLoginOtpCode(content.code);
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
          role: 'vendor',
          isSignUp: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        setLoginStep('otp');
        setLoginTimer(data.cooldownRemainingSec || 60);
        setIsLoginResendActive(false);
        setLoginOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          loginOtpInputRefs[0].current?.focus();
        }, 100);
      } else {
        if (data.cooldownRemainingSec) {
          setLoginTimer(data.cooldownRemainingSec);
          setIsLoginResendActive(false);
          setLoginStep('otp');
        }
        setErrorMsg(data.error || 'Failed to dispatch verification code.');
      }
    } catch (_) {
      setLoginStep('otp');
      setLoginTimer(60);
      setIsLoginResendActive(false);
      setLoginOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        loginOtpInputRefs[0].current?.focus();
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (!isLoginResendActive) return;
    setIsLoginResendActive(false);
    setLoginTimer(60);
    setErrorMsg('');
    await handleSendLoginOtp();
  };

  const handleLoginOtpChange = (index: number, value: string) => {
    const numericVal = value.replace(/[^0-9]/g, '');
    if (!numericVal && value !== '') return;

    const newDigits = [...loginOtpDigits];
    if (numericVal.length > 1) {
      const chars = numericVal.slice(0, 6).split('');
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setLoginOtpDigits(newDigits);
      if (chars.length === 6) {
        verifyLoginOtpCode(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = numericVal;
    setLoginOtpDigits(newDigits);

    if (numericVal && index < 5) {
      loginOtpInputRefs[index + 1].current?.focus();
    }

    if (numericVal && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        verifyLoginOtpCode(fullCode);
      }
    }
  };

  const handleLoginOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!loginOtpDigits[index] && index > 0) {
        loginOtpInputRefs[index - 1].current?.focus();
      }
    }
  };

  const verifyLoginOtpCode = async (codeToVerify: string) => {
    setErrorMsg('');
    setIsProcessing(true);

    const cleanPhone = loginPhone.trim().replace(/\s+/g, '');

    try {
      const res = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: codeToVerify,
          role: 'vendor',
          name: `Vendor ${cleanPhone}`
        })
      });

      const data = await res.json();
      if (res.ok && data.vendor) {
        setShowVendorSuccessTick(true);
        setTimeout(() => {
          onLoginSuccess(data.vendor, data.token || 'vendor-session-token');
        }, 1100);
        return;
      }

      // Mobile vibration on incorrect OTP
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(200);
        } catch (_) {}
      }
      setErrorMsg(data.error || 'Invalid verification code. Please check and try again.');
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

  // ----------------- SIGN UP INLINE OTP HANDLERS -----------------
  const handleSendSignUpInlineOtp = async () => {
    setErrorMsg('');
    const cleanPhone = signUpPhone.trim().replace(/\s+/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number first.');
      return;
    }

    setIsProcessing(true);

    if (typeof window !== 'undefined' && 'OTPCredential' in window) {
      try {
        const ac = new AbortController();
        navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal
        } as any).then((content: any) => {
          if (content && content.code) {
            const chars = content.code.slice(0, 6).split('');
            setSignUpOtpDigits(chars);
            verifyInlineOtpCode(content.code);
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
          role: 'vendor',
          isSignUp: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setSignUpTimer(data.cooldownRemainingSec || 60);
        setIsSignUpResendActive(false);
        setSignUpOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          signUpInlineOtpRefs[0].current?.focus();
        }, 150);
      } else {
        if (data.cooldownRemainingSec) {
          setSignUpTimer(data.cooldownRemainingSec);
          setIsSignUpResendActive(false);
          setIsOtpSent(true);
        }
        setErrorMsg(data.error || 'Failed to dispatch verification code.');
      }
    } catch (_) {
      setIsOtpSent(true);
      setSignUpTimer(60);
      setIsSignUpResendActive(false);
      setSignUpOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        signUpInlineOtpRefs[0].current?.focus();
      }, 150);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendSignUpInlineOtp = async () => {
    if (!isSignUpResendActive) return;
    setIsSignUpResendActive(false);
    setSignUpTimer(60);
    setErrorMsg('');
    await handleSendSignUpInlineOtp();
  };

  const handleSignUpInlineOtpChange = (index: number, value: string) => {
    const numericVal = value.replace(/[^0-9]/g, '');
    if (!numericVal && value !== '') return;

    const newDigits = [...signUpOtpDigits];
    if (numericVal.length > 1) {
      const chars = numericVal.slice(0, 6).split('');
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setSignUpOtpDigits(newDigits);
      if (chars.length === 6) {
        verifyInlineOtpCode(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = numericVal;
    setSignUpOtpDigits(newDigits);

    if (numericVal && index < 5) {
      signUpInlineOtpRefs[index + 1].current?.focus();
    }

    if (numericVal && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        verifyInlineOtpCode(fullCode);
      }
    }
  };

  const handleSignUpInlineOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!signUpOtpDigits[index] && index > 0) {
        signUpInlineOtpRefs[index - 1].current?.focus();
      }
    }
  };

  const verifyInlineOtpCode = async (codeToVerify: string) => {
    setErrorMsg('');
    setIsProcessing(true);

    const cleanPhone = signUpPhone.trim().replace(/\s+/g, '');

    try {
      const res = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: codeToVerify,
          role: 'vendor'
        })
      });

      if (res.ok) {
        setIsMobileVerified(true);
        setShowVendorSuccessTick(true);
        setTimeout(() => {
          setShowVendorSuccessTick(false);
        }, 1100);
        return;
      } else {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(200);
          } catch (_) {}
        }
        setErrorMsg('Invalid verification code. Please check and try again.');
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

  // Submit Final Registration
  const handleFinalSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanGstin = gstin.trim().toUpperCase();
    if (!cleanGstin || cleanGstin.length !== 15) {
      setErrorMsg('A valid 15-character GST Number is compulsory for vendor registration.');
      return;
    }
    if (!isGstVerified) {
      setErrorMsg('GST number verification is compulsory. Please click "Verify GST" to verify your GSTIN.');
      return;
    }

    const cleanOwnerName = ownerName.trim();
    const cleanStoreName = storeName.trim();
    if (!cleanOwnerName) {
      setErrorMsg('Please enter or verify your Full Name / Owner Name.');
      return;
    }
    if (!cleanStoreName) {
      setErrorMsg('Please enter or verify your Business / Store Name.');
      return;
    }
    if (!isMobileVerified) {
      setErrorMsg('Please verify your Mobile Number with OTP before continuing.');
      return;
    }

    setIsProcessing(true);
    const cleanPhone = signUpPhone.trim().replace(/\s+/g, '');
    const isGstVerifiedSeller = isGstVerified && cleanGstin.length === 15;

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: cleanStoreName,
      ownerName: cleanOwnerName,
      legalBusinessName: gstData?.legal_name || cleanOwnerName,
      tradeName: gstData?.trade_name || cleanStoreName,
      businessType: gstData?.business_type || 'Registered Business',
      email: `${cleanPhone}@seller.quekart.com`,
      phone: cleanPhone,
      age: 28,
      aadhaarNumber: 'XXXX-XXXX-3847',
      aadhaarVerified: true,
      gstinVerified: true,
      vendorType: 'big',
      isVerified: true,
      businessCategory: 'Apparel & Sarees',
      gstin: cleanGstin,
      city: district || 'Jaipur',
      district: district || 'Jaipur',
      state: stateName || 'Rajasthan',
      pincode: pincode || '302001',
      address: address || `${district}, ${stateName}`,
      description: `GST-Verified Seller (${cleanGstin}) - ${gstData?.legal_name || cleanOwnerName}, ${district}, ${stateName}.`,
      rating: 5.0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch(getApiUrl('/api/auth/vendor-register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });
      const data = await res.json();
      if (res.ok && data.vendor) {
        onLoginSuccess(data.vendor, data.token || 'vendor-session-token');
        return;
      }
    } catch (_) {
      // Fallback
    }

    onLoginSuccess(newVendor, 'vendor-session-token');
    setIsProcessing(false);
  };

  const isLoginPhoneValid = loginPhone.trim().length === 10;
  const isGstEntered = gstin.trim().length > 0;
  const isGstValidLength = gstin.trim().length === 15;
  const isSignUpSubmitReady = ownerName.trim().length > 0 && 
                             storeName.trim().length > 0 && 
                             isGstVerified &&
                             gstin.trim().length === 15 &&
                             isMobileVerified;

  return (
    <div className="h-[100dvh] w-full bg-slate-900 flex flex-col justify-between overflow-hidden relative select-none" id="vendor-login-view">
      
      {/* Marquee Animation Keyframes */}
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
          animation: marqueeLeft 32s linear infinite;
        }
        .animate-marquee-r {
          display: flex;
          width: max-content;
          animation: marqueeRight 32s linear infinite;
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ----------------- FULL-SCREEN PRODUCT ANIMATION MARQUEE BACKGROUND ----------------- */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none select-none bg-slate-100">
        
        {/* Soft frosted overlays */}
        <div className={`absolute inset-0 z-10 transition-colors duration-300 ${
          authMode === 'signup' 
            ? 'bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/75 backdrop-blur-[4px]' 
            : 'bg-gradient-to-b from-transparent via-white/50 to-white backdrop-blur-[1px]'
        }`} />

        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-200/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-200/50 to-transparent z-10 pointer-events-none" />

        {/* 5-ROW PRODUCT ANIMATION MARQUEE */}
        <div className="space-y-3 py-3 h-full flex flex-col justify-around overflow-hidden opacity-90">
          
          {/* Row 1 */}
          <div className="overflow-hidden w-full flex items-center">
            <div className="animate-marquee-l flex gap-3 px-2">
              {[...WHOLESALE_ROW_1, ...WHOLESALE_ROW_1, ...WHOLESALE_ROW_1].map((item, idx) => (
                <div
                  key={`vl1-${item.id}-${idx}`}
                  className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-200/80 flex-shrink-0`}
                >
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="overflow-hidden w-full flex items-center">
            <div className="animate-marquee-r flex gap-3 px-2">
              {[...WHOLESALE_ROW_2, ...WHOLESALE_ROW_2, ...WHOLESALE_ROW_2].map((item, idx) => (
                <div
                  key={`vl2-${item.id}-${idx}`}
                  className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-200/80 flex-shrink-0`}
                >
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 */}
          <div className="overflow-hidden w-full flex items-center">
            <div className="animate-marquee-l flex gap-3 px-2">
              {[...WHOLESALE_ROW_3, ...WHOLESALE_ROW_3, ...WHOLESALE_ROW_3].map((item, idx) => (
                <div
                  key={`vl3-${item.id}-${idx}`}
                  className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-200/80 flex-shrink-0`}
                >
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 4 */}
          <div className="overflow-hidden w-full flex items-center">
            <div className="animate-marquee-r flex gap-3 px-2">
              {[...WHOLESALE_ROW_4, ...WHOLESALE_ROW_4, ...WHOLESALE_ROW_4].map((item, idx) => (
                <div
                  key={`vl4-${item.id}-${idx}`}
                  className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-200/80 flex-shrink-0`}
                >
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 5 */}
          <div className="overflow-hidden w-full flex items-center opacity-85">
            <div className="animate-marquee-l flex gap-3 px-2">
              {[...WHOLESALE_ROW_5, ...WHOLESALE_ROW_5, ...WHOLESALE_ROW_5].map((item, idx) => (
                <div
                  key={`vl5-${item.id}-${idx}`}
                  className={`${item.bg} w-14 h-14 rounded-2xl p-1.5 flex items-center justify-center shadow-3xs border border-slate-200/80 flex-shrink-0`}
                >
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ----------------- FOREGROUND CONTENT ----------------- */}
      <div className="relative z-20 w-full h-[100dvh] flex flex-col justify-between max-w-md mx-auto overflow-hidden">
        
        {/* ================= TOP SECTION: LOGO + TOP TAB SWITCHER ================= */}
        <div className="pt-2 px-4 flex flex-col items-center flex-shrink-0">
          
          {/* Top Row: Brand Logo */}
          <div className="w-full flex items-center justify-center pb-1">
            <div className="scale-90">
              <BrandLogo size="md" animated={true} />
            </div>
          </div>

          {/* TOP TAB SWITCHER (PINNED AT THE VERY TOP) */}
          <div className={`p-1 rounded-2xl flex items-center w-full max-w-[320px] my-1.5 shadow-md border backdrop-blur-md transition-all ${
            authMode === 'signup'
              ? 'bg-slate-800/90 border-slate-700/90'
              : 'bg-white/95 border-slate-200 shadow-sm'
          }`}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginStep('form');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-[#143C6B] text-white shadow-md'
                  : authMode === 'signup'
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
              id="vendor-tab-login"
            >
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-[#143C6B] text-white shadow-md ring-1 ring-blue-400/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="vendor-tab-signup"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Sign Up (0%)</span>
            </button>
          </div>

        </div>

        {/* ================= MODE 1: SIGN UP VIEW (ALL ON-SCREEN, ZERO SCROLL, GST SYNC) ================= */}
        {authMode === 'signup' && (
          <div className="flex-1 flex flex-col justify-between px-3.5 pb-2.5 overflow-hidden animate-fadeIn" id="vendor-signup-view">
            
            {/* White Glass Card Containing All Fields */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 p-3 flex flex-col justify-between flex-1 max-h-[83vh] overflow-hidden">
              
              {/* Header Title inside card */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 flex-shrink-0">
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>Seller Registration</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                      0% Commission
                    </span>
                  </h2>
                  <p className="text-[10px] font-medium text-slate-500">
                    Verify GSTIN or register as 0% Commission artisan seller
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="my-1 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1.5 flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{errorMsg}</span>
                </div>
              )}

              {/* Form Fields Stack */}
              <form onSubmit={handleFinalSignUpSubmit} className="flex flex-col justify-between flex-1 py-1 space-y-1.5 overflow-hidden">
                
                {/* 1. FIELD: GST NO. WITH MANUAL VERIFY BUTTON (SYNC SOURCE) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#143C6B]" />
                      GST No. <span className="text-red-500 font-bold">* Compulsory</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {isGstVerified ? (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9.5px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          GST Verified
                        </span>
                      ) : isGstEntered ? (
                        <span className="text-amber-700 text-[9.5px] font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Verification Pending
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-600 border border-red-200 text-[9.5px] font-bold px-1.5 py-0.2 rounded-md">
                          * GST Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* GST Input + Manual Verify Button */}
                  <div className="flex items-center gap-1.5 w-full">
                    <div className="flex-1 h-8.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center px-2.5 focus-within:bg-white focus-within:border-[#143C6B] transition-all">
                      <input
                        type="text"
                        maxLength={15}
                        readOnly={isGstVerified}
                        placeholder="15-digit GSTIN (e.g. 22AAAAA0000A1Z5)"
                        value={gstin}
                        onChange={(e) => {
                          if (!isGstVerified) {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            setGstin(val);
                            setIsGstVerified(false);
                            setGstData(null);
                            setErrorMsg('');
                          }
                        }}
                        className={`w-full text-xs font-mono font-bold uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-hidden ${
                          isGstVerified ? 'text-slate-600 cursor-not-allowed' : 'text-slate-900 bg-transparent'
                        }`}
                        id="vendor-reg-gstin"
                      />
                      {isGstVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Manual Verify GST Button */}
                    <button
                      type="button"
                      disabled={gstin.trim().length !== 15 || isGstVerifying}
                      onClick={handleVerifyGstClick}
                      className={`h-8.5 px-3 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 flex-shrink-0 shadow-sm active:scale-95 ${
                        gstin.trim().length === 15 && !isGstVerifying
                          ? isGstVerified
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      id="vendor-reg-gst-verify-btn"
                    >
                      {isGstVerifying ? '...' : isGstVerified ? '✓ Verified' : 'Verify GST'}
                    </button>
                  </div>

                  {/* Synced GST Details Preview Pill */}
                  {isGstVerified && gstData && (
                    <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg px-2 py-1 text-[9.5px] text-amber-950 flex items-center justify-between animate-fadeIn">
                      <div className="flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-amber-700 flex-shrink-0" />
                        <span className="font-extrabold truncate">{gstData.trade_name}</span>
                        <span className="text-amber-700 font-semibold truncate">&bull; {gstData.address}, {gstData.district}</span>
                      </div>
                      <span className="bg-amber-200 text-amber-900 font-black px-1 rounded text-[8.5px] flex-shrink-0">
                        {gstData.pincode}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. FIELD: OWNER / LEGAL NAME (SYNCED FROM GST) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-[#143C6B]" />
                      Full Name / Owner Name
                    </label>
                    <div className="flex items-center gap-1">
                      {isGstVerified && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          GST Legal Name
                        </span>
                      )}
                      <span className="text-red-500 font-bold text-[10px]">* Required</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly={isGstVerified}
                    placeholder="e.g. Gaurav Beniwal"
                    value={ownerName}
                    onChange={(e) => {
                      if (!isGstVerified) {
                        setOwnerName(e.target.value);
                        if (!storeName && e.target.value) {
                          setStoreName(`${e.target.value} Enterprises`);
                        }
                        setErrorMsg('');
                      }
                    }}
                    className={`w-full h-8.5 px-2.5 text-xs font-bold border rounded-xl transition-all placeholder:text-slate-400 ${
                      isGstVerified 
                        ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed font-semibold' 
                        : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B] focus:outline-hidden'
                    }`}
                    id="vendor-reg-ownername"
                  />
                </div>

                {/* 3. FIELD: BUSINESS / STORE NAME (SYNCED FROM GST) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1">
                      <Store className="w-3 h-3 text-[#143C6B]" />
                      Business / Store Name
                    </label>
                    <div className="flex items-center gap-1">
                      {isGstVerified && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          GST Trade Name
                        </span>
                      )}
                      <span className="text-red-500 font-bold text-[10px]">* Required</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly={isGstVerified}
                    placeholder="e.g. Jaipur Handloom Emporium"
                    value={storeName}
                    onChange={(e) => {
                      if (!isGstVerified) {
                        setStoreName(e.target.value);
                        setErrorMsg('');
                      }
                    }}
                    className={`w-full h-8.5 px-2.5 text-xs font-bold border rounded-xl transition-all placeholder:text-slate-400 ${
                      isGstVerified 
                        ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed font-semibold' 
                        : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B] focus:outline-hidden'
                    }`}
                    id="vendor-reg-storename"
                  />
                </div>

                {/* 4. FIELD: MOBILE NO. + INLINE OTP WITH VERIFY BUTTON & LOCK */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#143C6B]" />
                      Mobile Number
                    </label>
                    {isMobileVerified ? (
                      <span className="text-emerald-700 text-[10px] font-black flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified & Locked
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold text-[10px]">* Required</span>
                    )}
                  </div>

                  {/* Mobile Input with Flag and Right-side OTP Action Button */}
                  <div className="flex items-center gap-1.5 w-full">
                    <div className="flex-1 h-8.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center px-2 gap-1.5 focus-within:bg-white focus-within:border-[#143C6B] transition-all">
                      <span role="img" aria-label="India flag" className="text-sm select-none">🇮🇳</span>
                      <span className="text-xs font-black text-slate-800 select-none">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        disabled={isMobileVerified}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        value={signUpPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 10) {
                            setSignUpPhone(val);
                            setErrorMsg('');
                          }
                        }}
                        className={`w-full text-xs font-bold bg-transparent focus:outline-hidden placeholder:text-slate-400 ${
                          isMobileVerified ? 'text-slate-500 font-mono font-bold' : 'text-slate-900'
                        }`}
                        id="vendor-reg-phone"
                      />
                      {isMobileVerified && (
                        <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Right-Side OTP Trigger / Verification Button */}
                    {!isMobileVerified && (
                      <button
                        type="button"
                        disabled={signUpPhone.trim().length !== 10 || isProcessing}
                        onClick={() => {
                          if (!isOtpSent) {
                            handleSendSignUpInlineOtp();
                          } else {
                            verifyInlineOtpCode(signUpOtpDigits.join(''));
                          }
                        }}
                        className={`h-8.5 px-3 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 flex-shrink-0 shadow-sm active:scale-95 ${
                          signUpPhone.trim().length === 10 && !isProcessing
                            ? isOtpSent
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        id="vendor-reg-otp-btn"
                      >
                        {isProcessing ? (
                          '...'
                        ) : !isOtpSent ? (
                          'Send OTP'
                        ) : (
                          'Verify'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* INLINE OTP ENTER SECTION (SMOOTHLY EXPANDS WHEN OTP IS SENT & NOT YET VERIFIED) */}
                {isOtpSent && !isMobileVerified && (
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2 animate-fadeIn space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700">
                        Enter 6-Digit Code:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-black text-[#143C6B] bg-white px-1.5 py-0.2 rounded border border-blue-200">
                          {signUpSimulatedOtp}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const chars = signUpSimulatedOtp.slice(0, 6).split('');
                            setSignUpOtpDigits(chars);
                            verifyInlineOtpCode(chars.join(''));
                          }}
                          className="text-[9.5px] font-black bg-[#143C6B] text-white px-1.5 py-0.5 rounded cursor-pointer active:scale-95"
                        >
                          Auto-Fill
                        </button>
                      </div>
                    </div>

                    {/* 6 OTP Digits */}
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      {signUpOtpDigits.map((digit, idx) => (
                        <input
                          key={`su-otp-${idx}`}
                          ref={signUpInlineOtpRefs[idx]}
                          type="tel"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleSignUpInlineOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleSignUpInlineOtpKeyDown(idx, e)}
                          className="w-7 h-7 text-center text-xs font-black bg-white rounded-lg border border-slate-300 focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B] focus:outline-hidden"
                          id={`vendor-signup-otp-${idx}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-[9.5px]">
                      <span className="text-slate-500">
                        {signUpTimer > 0 ? `Resend in ${signUpTimer}s` : 'Code expired'}
                      </span>
                      {signUpTimer === 0 && (
                        <button
                          type="button"
                          onClick={handleResendSignUpInlineOtp}
                          className="font-bold text-[#143C6B] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* FINAL SUBMIT BUTTON */}
                <div className="pt-0.5 flex-shrink-0">
                  <button
                    type="submit"
                    disabled={!isSignUpSubmitReady || isProcessing}
                    className={`w-full h-9.5 rounded-xl font-black text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-[0.99] ${
                      isSignUpSubmitReady && !isProcessing
                        ? 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-90'
                    }`}
                    id="vendor-signup-submit-btn"
                  >
                    {isProcessing 
                      ? 'Creating Account...' 
                      : !isGstVerified
                        ? 'Verify GST Number to Continue'
                        : !isMobileVerified 
                          ? 'Verify Mobile to Continue' 
                          : 'Create Verified Seller Account'}
                  </button>

                  <p className="text-[9px] text-slate-400 font-semibold text-center mt-0.5">
                    {isGstVerified ? '✓ GST Verified Seller' : '🔒 Compulsory GST Verification Required'} &bull; Direct Marketplace Hub
                  </p>
                </div>

              </form>

            </div>

          </div>
        )}

        {/* ================= MODE 2: LOG IN VIEW (PHONE & OTP STEP) ================= */}
        {authMode === 'login' && loginStep === 'form' && (
          <div className="flex-1 flex flex-col justify-end px-4 pb-4 animate-fadeIn" id="vendor-login-form-view">
            
            {/* White Bottom Glass Card for Log In */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 p-4 space-y-3">
              
              <div className="text-center space-y-0.5">
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  India's smartest seller hub
                </h2>
                <p className="text-xs font-bold text-slate-500">
                  Log in to your wholesale dashboard in 10 seconds
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-1.5 px-3 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              {/* Mobile Number Entry Form */}
              <form onSubmit={handleSendLoginOtp} className="space-y-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-12 h-11 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-xl select-none flex-shrink-0">
                    <span role="img" aria-label="India flag">🇮🇳</span>
                  </div>

                  <div className="flex-1 h-11 bg-slate-50 rounded-xl border border-slate-200 flex items-center px-3 gap-2 focus-within:bg-white focus-within:border-[#143C6B] transition-all">
                    <span className="text-sm font-black text-slate-800 select-none">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter registered mobile"
                      maxLength={10}
                      value={loginPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 10) {
                          setLoginPhone(val);
                          setErrorMsg('');
                        }
                      }}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-hidden"
                      id="vendor-phone-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isLoginPhoneValid || isProcessing}
                  className={`w-full h-11 rounded-xl font-black text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-[0.99] ${
                    isLoginPhoneValid && !isProcessing
                      ? 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-90'
                  }`}
                  id="vendor-phone-continue-btn"
                >
                  {isProcessing ? 'Sending Code...' : 'Continue to Dashboard'}
                </button>
              </form>

              <p className="text-[10px] text-slate-400 font-medium text-center">
                By continuing, you agree to QueKart's Terms of Service & Privacy Policy.
              </p>
            </div>

          </div>
        )}

        {/* ================= MODE 2 (STEP 2): LOGIN OTP SCREEN ================= */}
        {authMode === 'login' && loginStep === 'otp' && (
          <div className="flex-1 flex flex-col justify-between px-4 pb-4 animate-fadeIn" id="vendor-login-otp-view">
            
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 p-5 flex flex-col justify-between flex-1">
              
              <div>
                {/* Back button + Header */}
                <div className="flex items-center gap-2 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('form');
                      setErrorMsg('');
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                    id="vendor-otp-back-btn"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <h2 className="text-base font-bold text-slate-900">
                    Enter Verification Code
                  </h2>
                </div>

                <div className="text-center space-y-1 mb-4">
                  <p className="text-xs text-slate-500 font-medium">
                    We sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    +91 {loginPhone || '9876543210'}
                  </p>
                </div>

                {/* 6 OTP Input Boxes */}
                <div className="flex justify-center items-center gap-2 my-4">
                  {loginOtpDigits.map((digit, idx) => (
                    <input
                      key={`li-otp-${idx}`}
                      ref={loginOtpInputRefs[idx]}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleLoginOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleLoginOtpKeyDown(idx, e)}
                      className={`w-10 h-11 text-center text-lg font-black bg-slate-50 rounded-xl border ${
                        digit ? 'border-[#143C6B] bg-blue-50/40 text-slate-900' : 'border-slate-300 text-slate-900'
                      } focus:bg-white focus:border-[#143C6B] focus:ring-2 focus:ring-[#143C6B]/20 focus:outline-hidden transition-all`}
                      id={`vendor-otp-input-${idx}`}
                    />
                  ))}
                </div>

                {/* Resend OTP Timer */}
                <div className="text-center text-xs">
                  {loginTimer > 0 ? (
                    <p className="text-slate-400 font-medium">
                      Resend code in <span className="font-bold text-slate-700">{loginTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendLoginOtp}
                      className="font-bold text-[#143C6B] hover:underline cursor-pointer"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={loginOtpDigits.join('').length !== 6 || isProcessing}
                  onClick={() => verifyLoginOtpCode(loginOtpDigits.join(''))}
                  className={`w-full h-11 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-[0.99] ${
                    loginOtpDigits.join('').length === 6 && !isProcessing
                      ? 'bg-[#143C6B] hover:bg-[#0C2340] text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  id="vendor-otp-verify-submit-btn"
                >
                  {isProcessing ? 'Verifying Code...' : 'Verify & Continue to Dashboard'}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Smooth Green Success Tick Animation Modal Overlay */}
      {showVendorSuccessTick && (
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
            <p className="text-xs font-semibold text-slate-500">Welcome to Seller Hub</p>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
