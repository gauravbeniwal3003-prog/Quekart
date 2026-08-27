import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Navigation, 
  Search, 
  ChevronRight, 
  X, 
  Building2, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo, { BrandLogo } from './Logo';
import { getApiUrl } from '../utils/api';
import { 
  getAllIndianStates, 
  getDistrictsForState, 
  findMatchingState, 
  findMatchingDistrict 
} from '../data/indiaLocations';

interface UserAuthViewProps {
  onLoginSuccess: (user: any, token: string) => void;
  onSkip?: () => void;
  navigateTo?: (path: string) => void;
  isSignup?: boolean;
}

// 5 Distinct tile datasets for User Login Page ensuring every row in the animation has 10 unique products (50 distinct products in total)
const FASHION_ROW_1 = [
  { id: 101, name: 'Designer Anarkali Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 102, name: 'Royal Banarasi Silk Saree', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 103, name: 'Chikankari Kurti', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 104, name: 'Sherwani Suit', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 105, name: 'Handloom Silk Dupatta', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 106, name: 'Bandhgala Jacket', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 107, name: 'Printed Cotton Kurta Set', img: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 108, name: 'Festive Designer Lehenga', img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 109, name: 'Traditional Kanjeevaram Saree', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 110, name: 'Gota Patti Sharara Suit', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const FASHION_ROW_2 = [
  { id: 201, name: 'Amoled Smartwatch Pro', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 202, name: 'Wireless Active Earbuds', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 203, name: 'Bluetooth Sound Speaker', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 204, name: 'Noise Cancelling Headphones', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 205, name: '4K Action Camera', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 206, name: 'Chronograph Steel Watch', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 207, name: 'Over-Ear Studio Monitors', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 208, name: 'Mechanical Wireless Keyboard', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 209, name: 'Smart Fitness Band', img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 210, name: 'Fast Magnetic Charger', img: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const FASHION_ROW_3 = [
  { id: 301, name: 'Denim Trucker Jacket', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 302, name: 'Linen Slim Fit Shirt', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 303, name: 'Distressed Slim Jeans', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 304, name: 'Party Western Dress', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 305, name: 'Biker Leather Jacket', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 306, name: 'Streetwear Hoodie', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 307, name: 'Cashmere Knit Pullover', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 308, name: 'Oversized Graphic Tee', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 309, name: 'Casual Flannel Overshirt', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 310, name: 'Classic Wool Trench Coat', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const FASHION_ROW_4 = [
  { id: 401, name: 'Urban Street Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 402, name: 'Running Sport Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 403, name: 'Leather Chelsea Boots', img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 404, name: 'Basketball Kicks', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 405, name: 'Handcrafted Casual Loafers', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 406, name: 'Canvas Skate Shoes', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 407, name: 'Classic Oxford Shoes', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 408, name: 'Air Cushion Athleisure Trainers', img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 409, name: 'Leather Dress Derbies', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 410, name: 'Vintage Suede Walkers', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const FASHION_ROW_5 = [
  { id: 501, name: 'Luxury Leather Handbag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 502, name: 'Signature Oud Perfume', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 503, name: 'Polarized Sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 504, name: 'Velvet Matte Beauty Set', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 505, name: 'Urban Utility Backpack', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 506, name: 'Classic Gold Ring', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 507, name: 'Kundan Choker Necklace', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 508, name: 'Botanical Glow Serum', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 509, name: 'Genuine Leather Belt', img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 510, name: 'Rose Gold Diamond Bangles', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

export default function UserAuthView({ onLoginSuccess, onSkip, navigateTo, isSignup = false }: UserAuthViewProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile_complete'>('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('123456');

  // New profile completion state variables
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileGender, setProfileGender] = useState('Male');
  const [profileCity, setProfileCity] = useState('');
  const [profilePincode, setProfilePincode] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAltPhone, setProfileAltPhone] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  const [autoFilledNotice, setAutoFilledNotice] = useState('');
  const webOtpAbortControllerRef = useRef<AbortController | null>(null);

  // Smart Scrolling Modals State
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');

  // Location auto-detect state
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'denied' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState('');

  // Geolocation auto-detection handler
  const detectUserLocation = (isManualClick = false) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('error');
      setLocationMessage('Location service is not supported on this browser.');
      return;
    }

    setLocationStatus('detecting');
    setLocationMessage('Requesting location access to auto-fill address...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Primary reverse geocoding API
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          let data = await res.json();
          
          let rawState = data.principalSubdivision || data.region || '';
          let rawCity = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || '';
          let rawPincode = data.postcode || '';
          let rawStreet = data.localityInfo?.informative?.[0]?.name || data.locality || '';

          // Secondary OSM fallback if primary lacks state
          if (!rawState) {
            try {
              const osmRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const osmData = await osmRes.json();
              rawState = osmData.address?.state || '';
              rawCity = osmData.address?.state_district || osmData.address?.district || osmData.address?.city || osmData.address?.town || '';
              rawPincode = osmData.address?.postcode || '';
              rawStreet = osmData.address?.road || osmData.address?.suburb || osmData.address?.neighbourhood || '';
            } catch (_) {}
          }

          let matchedState = findMatchingState(rawState);
          let matchedDistrict: string | null = null;

          if (matchedState) {
            setProfileState(matchedState);
            matchedDistrict = findMatchingDistrict(matchedState, rawCity);
            if (matchedDistrict) {
              setProfileCity(matchedDistrict);
            } else {
              const available = getDistrictsForState(matchedState);
              if (available.length > 0) {
                setProfileCity(available[0]);
                matchedDistrict = available[0];
              }
            }
          }

          if (rawPincode) {
            const cleanPin = rawPincode.replace(/[^0-9]/g, '');
            if (cleanPin.length === 6) {
              setProfilePincode(cleanPin);
            }
          }

          if (rawStreet) {
            setProfileAddress(prev => prev || rawStreet);
          }

          setLocationStatus('success');
          setLocationMessage(
            `Location detected! State: ${matchedState || rawState}${matchedDistrict ? `, District: ${matchedDistrict}` : ''}. You can edit details below.`
          );
        } catch (err) {
          console.warn('Location reverse-geocode error:', err);
          setLocationStatus('error');
          setLocationMessage('GPS position retrieved. Please select State & District from the smart lists.');
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission denied. You can select your State & District manually.');
        } else {
          setLocationMessage('Could not detect position. Please select State & District manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-prompt location detection when arriving on profile_complete screen
  useEffect(() => {
    if (step === 'profile_complete') {
      detectUserLocation(false);
    }
  }, [step]);

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
    if (step === 'otp' && typeof window !== 'undefined' && 'OTPCredential' in window) {
      if (webOtpAbortControllerRef.current) {
        try {
          webOtpAbortControllerRef.current.abort();
        } catch (_) {}
      }

      const ac = new AbortController();
      webOtpAbortControllerRef.current = ac;

      (navigator.credentials as any).get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      }).then((otpObj: any) => {
        if (otpObj && otpObj.code) {
          const cleanCode = otpObj.code.replace(/[^0-9]/g, '').slice(0, 6);
          if (cleanCode) {
            const chars = cleanCode.split('');
            const newDigits = ['', '', '', '', '', ''];
            chars.forEach((c: string, idx: number) => {
              if (idx < 6) newDigits[idx] = c;
            });
            setOtpDigits(newDigits);
            setAutoFilledNotice('✨ Verification Code Auto-Detected & Filled!');
            if (otpInputRefs[5].current) {
              otpInputRefs[5].current.focus();
            }
            if (cleanCode.length === 6) {
              verifyOtpCode(cleanCode);
            }
          }
        }
      }).catch((err: any) => {
        if (err?.name !== 'AbortError') {
          console.log('WebOTP auto-capture ended or bypassed:', err);
        }
      });

      return () => {
        try {
          ac.abort();
        } catch (_) {}
      };
    }
  }, [step]);

  const handleSkip = () => {
    try {
      sessionStorage.setItem('quekart_browsing_guest', 'true');
      localStorage.setItem('quekart_browsing_guest', 'true');
    } catch (e) {
      console.log('Storage permission note:', e);
    }
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
    setAutoFilledNotice('');

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsProcessing(true);

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
    setAutoFilledNotice('');
    await handleSendOtp();
  };

  // Clipboard Paste Handler (Supports 1-tap paste on any input box or container)
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericVal = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
    if (numericVal) {
      const chars = numericVal.split('');
      const newDigits = ['', '', '', '', '', ''];
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      setAutoFilledNotice('⚡ Verification Code Pasted & Auto-Filled!');
      const focusIdx = Math.min(5, chars.length - 1);
      if (otpInputRefs[focusIdx].current) {
        otpInputRefs[focusIdx].current.focus();
      }
      if (numericVal.length === 6) {
        verifyOtpCode(numericVal);
      }
    }
  };

  // Handle OTP digit changes (Supports 6-digit native SMS autofill, multi-char & single digit)
  const handleOtpChange = (index: number, value: string) => {
    const numericVal = value.replace(/[^0-9]/g, '');

    // Handle clearing input
    if (!numericVal && value === '') {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle 6-digit native SMS Auto-Fill or multi-char string into input box
    if (numericVal.length >= 6) {
      const clean6 = numericVal.slice(0, 6);
      const chars = clean6.split('');
      const newDigits = ['', '', '', '', '', ''];
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      setAutoFilledNotice('⚡ Verification Code Auto-Filled!');
      if (otpInputRefs[5].current) {
        otpInputRefs[5].current.focus();
      }
      verifyOtpCode(clean6);
      return;
    }

    // Handle partial multi-digit paste or autofill (2-5 digits)
    if (numericVal.length > 1) {
      const chars = numericVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      const focusIdx = Math.min(5, chars.length - 1);
      if (otpInputRefs[focusIdx].current) {
        otpInputRefs[focusIdx].current.focus();
      }
      if (newDigits.every(d => d !== '') && newDigits.join('').length === 6) {
        verifyOtpCode(newDigits.join(''));
      }
      return;
    }

    // Single digit entry
    const singleDigit = numericVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    // Auto focus next box
    if (singleDigit && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Auto-verify if all 6 boxes are filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && newDigits.every(d => d !== '')) {
      verifyOtpCode(fullCode);
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
          setShowSuccessTick(false);
          const needsProfileComplete = data.isNewUser || !data.user.isProfileComplete || !data.user.name || data.user.name.startsWith('Customer');
          if (needsProfileComplete) {
            setTempToken(data.token);
            setTempUserId(data.user.id);
            setStep('profile_complete');
          } else {
            onLoginSuccess(data.user, data.token);
          }
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

  // Profile Completion submit handler
  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!profileState.trim()) {
      setErrorMsg('Please select your State from the list');
      return;
    }
    if (!profileCity.trim()) {
      setErrorMsg(`Please select your District in ${profileState}`);
      return;
    }
    if (!profileAddress.trim()) {
      setErrorMsg('Please enter your Street / Delivery Address');
      return;
    }
    if (!profilePincode.trim() || profilePincode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit PIN code');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    const fullDeliveryAddress = `${profileAddress.trim()}, ${profileCity.trim()}, ${profileState.trim()} - ${profilePincode.trim()}`;

    try {
      const res = await fetch(getApiUrl('/api/user/profile'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          userId: tempUserId,
          phone: phone,
          name: profileName,
          email: profileEmail,
          gender: profileGender,
          state: profileState,
          city: profileCity,
          address: fullDeliveryAddress,
          streetAddress: profileAddress,
          pincode: profilePincode,
          alternativePhone: profileAltPhone,
          isProfileComplete: true
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user, tempToken);
      } else {
        // Fallback user profile creation if server returns error or offline
        const fallbackUser = {
          id: tempUserId || `user-${phone}`,
          name: profileName,
          email: profileEmail,
          phone: `91${phone.slice(-10)}`,
          gender: profileGender,
          state: profileState,
          city: profileCity,
          address: fullDeliveryAddress,
          streetAddress: profileAddress,
          pincode: profilePincode,
          alternativePhone: profileAltPhone,
          isProfileComplete: true,
          createdAt: new Date().toISOString()
        };
        onLoginSuccess(fallbackUser, tempToken || 'user-registered-jwt-token');
      }
    } catch (_) {
      const fallbackUser = {
        id: tempUserId || `user-${phone}`,
        name: profileName,
        email: profileEmail,
        phone: `91${phone.slice(-10)}`,
        gender: profileGender,
        state: profileState,
        city: profileCity,
        address: fullDeliveryAddress,
        streetAddress: profileAddress,
        pincode: profilePincode,
        alternativePhone: profileAltPhone,
        isProfileComplete: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(fallbackUser, tempToken || 'user-registered-jwt-token');
    } finally {
      setIsProcessing(false);
    }
  };

  const isPhoneValid = phone.trim().length === 10;

  return (
    <div className="min-h-[100svh] w-full bg-white flex flex-col justify-between overflow-y-auto relative select-none" id="customer-login-view">
      
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
        <div className="relative w-full min-h-[100svh] overflow-y-auto flex flex-col justify-between max-w-md mx-auto bg-white" id="customer-phone-view-container">
          
          {/* TOP 45% SCREEN: ANIMATED PRODUCTS SHOWCASE */}
          <div className="relative h-[45vh] min-h-[220px] max-h-[380px] overflow-hidden z-0 select-none bg-slate-50/50 w-full flex-shrink-0">
            
            {/* Top Right Floating Skip Login Button */}
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSkip();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSkip();
                }}
                className="bg-white hover:bg-slate-50 text-slate-900 text-[12px] font-black px-4 py-2 rounded-full shadow-lg border border-slate-300 transition-all active:scale-90 cursor-pointer backdrop-blur-md relative z-50 touch-manipulation"
                id="skip-login-btn"
              >
                Skip login →
              </button>
            </div>

            {/* Fading side overlays */}
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />

            {/* Translucent overlay gradient behind logo transition */}
            <div className="absolute bottom-0 inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-white/70 to-white z-20 pointer-events-none backdrop-blur-[2px]" />

            {/* 5-ROW PRODUCT ANIMATION MARQUEE FILLING SCREEN */}
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

              {/* Row 5: Moving Left */}
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

          {/* BOTTOM RESPONSIVE LOGIN CARD: FLOATING SHEET OVERLAY */}
          <div className="flex-1 bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl flex flex-col justify-between px-6 pt-6 pb-6 z-30 -mt-6 min-h-[300px]">
            
            {/* QueKart Logo */}
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <BrandLogo size="md" animated={true} />

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  {isSignup ? "Create your account" : "India's smartest fashion app"}
                </h1>
                <p className="text-xs font-bold text-slate-400">
                  {isSignup ? "Register as a New Customer" : "Log In or Sign Up in 10 Seconds"}
                </p>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-2 px-3 rounded-xl text-center animate-fadeIn mb-3">
                {errorMsg}
              </div>
            )}

            {/* Mobile Number Input Form */}
            <form onSubmit={handleSendOtp} className="w-full space-y-4">
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
            <p className="text-[11px] text-slate-400 font-medium text-center leading-normal mt-6">
              By continuing, you agree to our{' '}
              <span 
                onClick={() => navigateTo ? navigateTo('/terms') : (window.history.pushState(null, '', '/terms'), window.dispatchEvent(new PopStateEvent('popstate')))}
                className="border-b border-dashed border-slate-400 text-slate-500 cursor-pointer hover:text-[#143C6B]"
              >
                Terms of service
              </span>
              {' '}&{' '}
              <span 
                onClick={() => navigateTo ? navigateTo('/privacy') : (window.history.pushState(null, '', '/privacy'), window.dispatchEvent(new PopStateEvent('popstate')))}
                className="border-b border-dashed border-slate-400 text-slate-500 cursor-pointer hover:text-[#143C6B]"
              >
                Privacy policy
              </span>
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

            {/* Auto-Filled Success Notification Badge */}
            {autoFilledNotice && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold py-2.5 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 animate-fadeIn shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>{autoFilledNotice}</span>
              </div>
            )}

            {/* 6-Box Clean OTP Input UI with 1-Tap Auto-Fill Support */}
            <div 
              className="flex justify-center items-center gap-2 sm:gap-3 my-6"
              onPaste={handleOtpPaste}
            >
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-black rounded-xl border transition-all ${
                    digit 
                      ? 'bg-white border-slate-900 text-slate-900 shadow-xs ring-2 ring-emerald-500/20' 
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

      {/* ----------------- STEP 3: PROFILE COMPLETION ----------------- */}
      {step === 'profile_complete' && (
        <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-5 pt-4 pb-8 overflow-y-auto animate-fadeIn animate-duration-300" id="profile-completion-view">
          <div className="space-y-4">
            {/* Top Bar / Header */}
            <div className="space-y-1 pt-2 pb-3 border-b border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg('');
                }}
                className="w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  Complete registration
                </h2>
                <p className="text-[11px] font-bold text-slate-400">
                  Please provide your details to access your account
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-3.5">
              
              {/* GPS Location Auto-Detect Banner */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <MapPin className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight">Auto-Fill via GPS</h4>
                      <p className="text-[10px] font-semibold text-slate-500">Allow location access for 1-tap setup</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => detectUserLocation(true)}
                    disabled={locationStatus === 'detecting'}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {locationStatus === 'detecting' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Detect Location</span>
                      </>
                    )}
                  </button>
                </div>

                {locationMessage && (
                  <div className={`mt-1.5 p-2 rounded-xl text-[11px] font-bold flex items-center gap-2 ${
                    locationStatus === 'success' 
                      ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200' 
                      : locationStatus === 'denied' || locationStatus === 'error'
                      ? 'bg-amber-100/90 text-amber-900 border border-amber-200'
                      : 'bg-blue-100/90 text-blue-900 border border-blue-200'
                  }`}>
                    {locationStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    <span>{locationMessage}</span>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lakhwinder Singh"
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
                />
              </div>

              {/* Step 1: Select State (Smart Alphabetical List) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                  <span>1. Select State *</span>
                  <span className="text-[9px] font-bold text-blue-600 uppercase">A-Z Smart List</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsStateModalOpen(true)}
                  className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    profileState 
                      ? 'bg-blue-50/60 border-blue-300 text-slate-900 font-black' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 font-semibold hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Building2 className={`w-4 h-4 shrink-0 ${profileState ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate text-xs">
                      {profileState || 'Tap to select state (Alphabetical list)'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Step 2: Select District (Smart List filtered by selected State) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                  <span>2. Select District *</span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {profileState ? `Filtered for ${profileState}` : 'Select State first'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileState) {
                      setErrorMsg('Please select your State first before choosing a District');
                      setIsStateModalOpen(true);
                      return;
                    }
                    setIsDistrictModalOpen(true);
                  }}
                  className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    profileCity 
                      ? 'bg-blue-50/60 border-blue-300 text-slate-900 font-black' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 font-semibold hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MapPin className={`w-4 h-4 shrink-0 ${profileCity ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate text-xs">
                      {profileCity || (profileState ? `Tap to select district in ${profileState}` : 'Select State first')}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Street / Delivery Address (Manual Input) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  3. Delivery / Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House / Flat No., Building Name, Street, Colony"
                  value={profileAddress}
                  onChange={(e) => {
                    setProfileAddress(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
                />
              </div>

              {/* PIN Code & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    PIN Code *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={6}
                    placeholder="e.g. 122001"
                    value={profilePincode}
                    onChange={(e) => {
                      setProfilePincode(e.target.value.replace(/[^0-9]/g, ''));
                      setErrorMsg('');
                    }}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={profileEmail}
                    onChange={(e) => {
                      setProfileEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Gender Select buttons */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Gender *
                </label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setProfileGender(g)}
                      className={`flex-1 h-10 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                        profileGender === g
                          ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alternative Phone Number (Optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Alternative Phone (Optional)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={profileAltPhone}
                  onChange={(e) => {
                    setProfileAltPhone(e.target.value.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold py-2 px-3 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] hover:brightness-110 text-white font-black text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? 'Saving Details...' : 'Complete & Enter App'}
              </button>
            </form>
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

      {/* ========================================== */}
      {/* SMART ALPHABETICAL STATE SELECTOR MODAL    */}
      {/* ========================================== */}
      <AnimatePresence>
        {isStateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                    AZ
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Select State / Union Territory</h3>
                    <p className="text-[10px] font-bold text-slate-400">Alphabetical scrolling list (36 total)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search state (e.g. Haryana, Rajasthan)..."
                    value={stateSearchQuery}
                    onChange={(e) => setStateSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-all"
                  />
                  {stateSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStateSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* State Scrolling List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
                {getAllIndianStates()
                  .filter(s => s.toLowerCase().includes(stateSearchQuery.toLowerCase().trim()))
                  .map((stateName) => {
                    const isSelected = profileState.toLowerCase() === stateName.toLowerCase();
                    const districtCount = getDistrictsForState(stateName).length;

                    return (
                      <button
                        type="button"
                        key={stateName}
                        onClick={() => {
                          setProfileState(stateName);
                          // Clear city if current city doesn't belong to newly selected state
                          const currentDistricts = getDistrictsForState(stateName);
                          if (!currentDistricts.includes(profileCity)) {
                            setProfileCity('');
                          }
                          setIsStateModalOpen(false);
                          setErrorMsg('');
                          // Auto open district selector next for 1-tap fast experience
                          setTimeout(() => {
                            setIsDistrictModalOpen(true);
                          }, 150);
                        }}
                        className={`w-full py-3 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-blue-600 text-white font-black shadow-xs'
                            : 'hover:bg-slate-100/80 text-slate-800 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className="text-xs tracking-tight">{stateName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {districtCount} Districts
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                        </div>
                      </button>
                    );
                  })}

                {getAllIndianStates().filter(s => s.toLowerCase().includes(stateSearchQuery.toLowerCase().trim())).length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs font-bold text-slate-400">No states found matching "{stateSearchQuery}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* SMART ALPHABETICAL DISTRICT SELECTOR MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {isDistrictModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Select District in <span className="text-blue-600">{profileState || 'State'}</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      Alphabetical list of districts in {profileState}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDistrictModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder={`Search district in ${profileState}...`}
                    value={districtSearchQuery}
                    onChange={(e) => setDistrictSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                  />
                  {districtSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDistrictSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* District Scrolling List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
                {getDistrictsForState(profileState)
                  .filter(d => d.toLowerCase().includes(districtSearchQuery.toLowerCase().trim()))
                  .map((districtName) => {
                    const isSelected = profileCity.toLowerCase() === districtName.toLowerCase();

                    return (
                      <button
                        type="button"
                        key={districtName}
                        onClick={() => {
                          setProfileCity(districtName);
                          setIsDistrictModalOpen(false);
                          setErrorMsg('');
                        }}
                        className={`w-full py-3 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-black shadow-xs'
                            : 'hover:bg-slate-100/80 text-slate-800 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className="text-xs tracking-tight">{districtName}</span>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    );
                  })}

                {getDistrictsForState(profileState).filter(d => d.toLowerCase().includes(districtSearchQuery.toLowerCase().trim())).length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs font-bold text-slate-400">No districts found matching "{districtSearchQuery}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
