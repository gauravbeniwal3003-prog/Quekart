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
  Sparkles,
  Building2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import Logo, { BrandLogo } from './Logo';

interface LandingGatewayProps {
  onNavigate: (path: string) => void;
}

// Interactive detailed policy modal states
type ModalType = 'contact' | 'refund' | 'terms' | 'privacy' | null;

// 8 Distinct product row datasets ensuring every row in the animation has 10 unique products (80 distinct products in total)
const LANDING_ROW_1 = [
  { id: 101, name: 'Designer Anarkali Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 102, name: 'Royal Banarasi Silk Saree', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 103, name: 'Embroidered Velvet Sherwani', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 104, name: 'Bridal Chikankari Lehenga', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 105, name: 'Handloom Silk Dupatta', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 106, name: 'Royal Bandhgala Suit', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 107, name: 'Chanderi Printed Kurta', img: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 108, name: 'Festive Ethnic Gown', img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 109, name: 'Kanjeevaram Pattu Saree', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 110, name: 'Gota Patti Sharara Set', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const LANDING_ROW_2 = [
  { id: 201, name: 'Amoled Smartwatch Pro', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 202, name: 'Wireless Active Earbuds', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 203, name: 'Chronograph Steel Watch', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 204, name: 'Pro Noise Cancelling Headphones', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 205, name: 'Portable Bass Speaker', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 206, name: '4K Action Cam', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 207, name: 'Over-Ear Studio Headphones', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 208, name: 'Mechanical Wireless Keyboard', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 209, name: 'Smart Fitness Band', img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 210, name: 'Magnetic Fast Charger', img: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const LANDING_ROW_3 = [
  { id: 301, name: 'Urban Street Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 302, name: 'Performance Running Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 303, name: 'Leather Chelsea Boots', img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 304, name: 'High-Top Basketball Kicks', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 305, name: 'Handcrafted Loafers', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 306, name: 'Canvas Skate Sneakers', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 307, name: 'Classic Oxford Shoes', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 308, name: 'Air Cushion Trainers', img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 309, name: 'Leather Dress Derbies', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 310, name: 'Retro Suede Runners', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const LANDING_ROW_4 = [
  { id: 401, name: 'Denim Trucker Jacket', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 402, name: 'Linen Slim Fit Shirt', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 403, name: 'Distressed Denim Jeans', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 404, name: 'Evening Cocktail Dress', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 405, name: 'Black Leather Biker Jacket', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 406, name: 'Oversized Streetwear Hoodie', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 407, name: 'Cashmere Knit Pullover', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 408, name: 'Oversized Graphic Tee', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 409, name: 'Casual Flannel Overshirt', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 410, name: 'Wool Trench Overcoat', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const LANDING_ROW_5 = [
  { id: 501, name: 'Luxury Leather Tote Bag', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 502, name: 'Urban Utility Backpack', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 503, name: 'Designer Crossbody Bag', img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 504, name: 'Vintage Leather Travel Duffle', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 505, name: 'Slim Bifold Card Wallet', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 506, name: 'Minimalist Evening Clutch', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 507, name: 'Structured Leather Satchel', img: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 508, name: 'Quilted Chain Shoulder Bag', img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 509, name: 'Canvas Laptop Messenger', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 510, name: 'Hardshell Spinner Trolley', img: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const LANDING_ROW_6 = [
  { id: 601, name: 'Signature Oud Perfume', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 602, name: 'Velvet Matte Beauty Set', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 603, name: 'Botanical Skincare Serum', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 604, name: 'French Cologne Spray', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 605, name: 'Hydrating Face Cream', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 606, name: 'Luxury Lipstick Kit', img: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 607, name: 'Organic Face Cleanser', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 608, name: 'Nourishing Argan Hair Oil', img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 609, name: 'Vitamin C Glow Drops', img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 610, name: 'Mineral Eyeshadow Palette', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' }
];

const LANDING_ROW_7 = [
  { id: 701, name: 'Polarized Aviator Sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 702, name: 'Vintage Square Eyewear', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 703, name: 'Genuine Leather Waist Belt', img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 704, name: 'Classic Wool Fedora Hat', img: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 705, name: 'Cashmere Winter Scarf', img: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 706, name: 'Retro Round Sunglasses', img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 707, name: 'Embroidered Baseball Cap', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 708, name: 'Knit Wool Beanie', img: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 709, name: 'Titanium Frame Spectacles', img: 'https://images.unsplash.com/photo-1609792633084-5390029b359f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 710, name: 'Leather Driving Gloves', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
];

const LANDING_ROW_8 = [
  { id: 801, name: 'Classic Gold Solitaire Ring', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 802, name: 'Kundan Choker Necklace', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 803, name: 'Pearl Drop Earrings', img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 804, name: 'Sterling Silver Chain', img: 'https://images.unsplash.com/photo-1611591475179-62cd3c2f2353?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 805, name: 'Emerald Gemstone Pendant', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' },
  { id: 806, name: 'Rose Gold Bangles', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f4f7f6]' },
  { id: 807, name: 'Diamond Tennis Bracelet', img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#eef8f8]' },
  { id: 808, name: 'Temple Jewellery Jhumkas', img: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f8f5ee]' },
  { id: 809, name: 'Zircon Stud Earrings', img: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#edf5f9]' },
  { id: 810, name: 'Antique Silver Anklets', img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=260', bg: 'bg-[#f7edf5]' }
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
        
        {/* 1. Header pinned always on top - Horizontally Centered QueKart Logo & Name */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-4 sm:px-8 py-3 sm:py-3.5 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-center text-center">
            <BrandLogo 
              size="lg" 
              animated={true} 
              onClick={() => onNavigate('/')} 
              id="landing-logo-brand" 
              className="justify-center mx-auto"
            />
          </div>
        </header>

        {/* 2. Branded Headline Banner matching reference design */}
        <div className="pt-2.5 sm:pt-5 pb-2 max-w-[620px] mx-auto px-3 sm:px-5 w-full" id="landing-hero-banner-container">
          <div className="relative group overflow-hidden rounded-2xl sm:rounded-[26px] bg-[#07182E] px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-[2px] border-[#D4AF37] shadow-[0_6px_25px_rgba(7,24,46,0.5),0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-3 sm:gap-4.5">
            
            {/* Top and bottom subtle golden ambient glow flares */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-r from-transparent via-[#FBBF24]/30 to-transparent blur-md pointer-events-none" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-r from-transparent via-[#FBBF24]/20 to-transparent blur-md pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E4E8C]/20 via-transparent to-transparent pointer-events-none" />

            {/* Golden Shopping Bag with Heart Icon */}
            <div className="flex-shrink-0 flex items-center justify-center relative z-10 pl-0.5">
              <div className="relative w-8 h-9 min-[360px]:w-9 min-[360px]:h-10 sm:w-11 sm:h-12 flex items-center justify-center drop-shadow-[0_2px_10px_rgba(245,166,35,0.45)]">
                <svg 
                  viewBox="0 0 100 115" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-full h-full"
                >
                  {/* Bag Handle */}
                  <path 
                    d="M34 38V22C34 13.1634 41.1634 6 50 6C58.8366 6 66 13.1634 66 22V38" 
                    stroke="#F5A623" 
                    strokeWidth="8.5" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Bag Body Gradient & Shape */}
                  <defs>
                    <linearGradient id="goldBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="35%" stopColor="#F5A623" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="bagShine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Bag Body with rounded corners */}
                  <path 
                    d="M16 32H84C87.3137 32 89.8732 34.887 89.5168 38.1754L82.1472 106.175C81.8415 108.997 79.4674 111 76.6305 111H23.3695C20.5326 111 18.1585 108.997 17.8528 106.175L10.4832 38.1754C10.1268 34.887 12.6863 32 16 32Z" 
                    fill="url(#goldBagGrad)" 
                  />
                  
                  {/* Subtle highlights */}
                  <path 
                    d="M20 36H80L75 104H25L20 36Z" 
                    fill="url(#bagShine)" 
                    opacity="0.2" 
                  />

                  {/* Dark Navy Heart in the center */}
                  <path 
                    d="M50 87.5C49.1 87.5 48.3 87.15 47.7 86.55L34.2 73.05C28.6 67.45 28.6 58.35 34.2 52.75C39.8 47.15 48.9 47.15 50 52.55C51.1 47.15 60.2 47.15 65.8 52.75C71.4 58.35 71.4 67.45 65.8 73.05L52.3 86.55C51.7 87.15 50.9 87.5 50 87.5Z" 
                    fill="#07182E" 
                  />
                </svg>
              </div>
            </div>

            {/* Banner Text Block - Start and End perfectly matched on the same horizontal points */}
            <div className="flex-1 min-w-0 relative z-10 select-none py-0.5">
              <svg 
                viewBox="0 0 520 60" 
                className="w-full h-auto block" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <style>{`
                    .hero-txt-title {
                      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                      font-weight: 900;
                      paint-order: stroke fill;
                    }
                    .hero-txt-sub {
                      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                      font-weight: 800;
                    }
                  `}</style>
                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Line 1: A NEW ERA OF SHOPPING - Ultra Bold, Starts at x=0, Ends exactly at x=520 */}
                <text 
                  x="0" 
                  y="24" 
                  fill="#FFFFFF" 
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  fontSize="26.5" 
                  fontWeight="900" 
                  textLength="520" 
                  lengthAdjust="spacing"
                  className="hero-txt-title uppercase"
                >
                  A NEW ERA OF <tspan fill="#F5A623" stroke="#F5A623" strokeWidth="0.8" fontWeight="900" filter="url(#goldGlow)">SHOPPING</tspan>
                </text>
                
                {/* Line 2: Great Products. Best Prices. Surprise Rewards. - Starts at x=0, Ends exactly at x=520 */}
                <text 
                  x="0" 
                  y="53" 
                  fill="#FFFFFF" 
                  fontSize="15.8" 
                  fontWeight="800" 
                  textLength="520" 
                  lengthAdjust="spacing"
                  className="hero-txt-sub"
                >
                  Great Products.   Best Prices.   Surprise Rewards.
                </text>
              </svg>
            </div>

          </div>
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
                {[...LANDING_ROW_1, ...LANDING_ROW_1, ...LANDING_ROW_1, ...LANDING_ROW_1].map((item, idx) => (
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
                {[...LANDING_ROW_2, ...LANDING_ROW_2, ...LANDING_ROW_2, ...LANDING_ROW_2].map((item, idx) => (
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
                {[...LANDING_ROW_3, ...LANDING_ROW_3, ...LANDING_ROW_3, ...LANDING_ROW_3].map((item, idx) => (
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
                {[...LANDING_ROW_4, ...LANDING_ROW_4, ...LANDING_ROW_4, ...LANDING_ROW_4].map((item, idx) => (
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
                  {[...LANDING_ROW_5, ...LANDING_ROW_5, ...LANDING_ROW_5, ...LANDING_ROW_5].map((item, idx) => (
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
                  {[...LANDING_ROW_6, ...LANDING_ROW_6, ...LANDING_ROW_6, ...LANDING_ROW_6].map((item, idx) => (
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
                  {[...LANDING_ROW_7, ...LANDING_ROW_7, ...LANDING_ROW_7, ...LANDING_ROW_7].map((item, idx) => (
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
                  {[...LANDING_ROW_8, ...LANDING_ROW_8, ...LANDING_ROW_8, ...LANDING_ROW_8].map((item, idx) => (
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
                    className="w-full sm:w-1/2 text-white font-black text-sm py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer bg-navy hover:brightness-110 hover:shadow-xl active:scale-98 group whitespace-nowrap"
                    id="btn-start-shopping"
                  >
                    <ShoppingBag className="w-4.5 h-4.5 stroke-[2.5] flex-shrink-0" />
                    <span className="whitespace-nowrap">Start Shopping</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </button>

                  {/* Button 2: Register as Vendor */}
                  <button
                    type="button"
                    onClick={() => onNavigate('/vendor')}
                    className="w-full sm:w-1/2 text-white font-black text-sm py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer bg-brand-gold hover:brightness-110 hover:shadow-xl active:scale-98 group whitespace-nowrap"
                    id="btn-register-vendor"
                  >
                    <Store className="w-4.5 h-4.5 stroke-[2.5] flex-shrink-0" />
                    <span className="whitespace-nowrap">Register as Vendor</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </button>

                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 4. WHY CHOOSE QUEKART? - EXACT PIXEL-PERFECT MATCH TO SCREENSHOT */}
        <section className="max-w-xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16" id="why-choose-quekart-section">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-9">
            <h2 className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight font-sans">
              <span className="text-[#0B1E36]">Why Choose Que</span><span className="text-[#E5A812]">Kart</span><span className="text-[#0B1E36]">?</span>
            </h2>

            {/* Decorative Divider: Gold bar + Center Navy Dot + Navy bar */}
            <div className="flex items-center justify-center gap-1.5 my-3">
              <div className="w-12 h-[2px] bg-[#E5A812] rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#0B1E36] rounded-full" />
              <div className="w-12 h-[2px] bg-[#0B1E36] rounded-full" />
            </div>

            <p className="text-[12px] min-[360px]:text-[13.5px] sm:text-base text-[#556987] font-medium tracking-normal mt-2 whitespace-nowrap">
              Direct, Transparent &amp; Fast E-Commerce Experience
            </p>
          </div>

          {/* Vertical Stacked Cards */}
          <div className="flex flex-col gap-3.5 sm:gap-5">
            
            {/* Card 1: 0% Platform Commission */}
            <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-7 border border-[#E2EAF2] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(20,60,107,0.06)] transition-all duration-200 flex flex-row items-center gap-3.5 sm:gap-6 text-left">
              {/* Circular Icon Badge: Ice Blue with Storefront Icon */}
              <div className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 rounded-full bg-[#EAF3FA] border border-[#D8E6F3] flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 min-[375px]:w-8 min-[375px]:h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Scalloped Awning */}
                  <path d="M9 19C9 15 11 13.5 15 13.5H33C37 13.5 39 15 39 19C39 21.8 36.8 23.5 34 23.5C31.2 23.5 29.5 21.8 28 20C26.5 21.8 24.8 23.5 22 23.5C19.2 23.5 17.5 21.8 16 20C14.5 21.8 12.8 23.5 10 23.5C9.2 23.5 9 21 9 19Z" stroke="#143C6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Shop Walls */}
                  <path d="M11 23.5V36.5C11 37.8 12 38.5 13.5 38.5H34.5C36 38.5 37 37.8 37 36.5V23.5" stroke="#143C6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Central Door */}
                  <path d="M20.5 38.5V29.5C20.5 28.5 21.2 27.5 22.5 27.5H25.5C26.8 27.5 27.5 28.5 27.5 29.5V38.5" stroke="#143C6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] min-[360px]:text-[16px] min-[400px]:text-[18px] sm:text-[21px] font-bold text-[#0B1E36] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  0% Platform Commission
                </h3>
                {/* Accent Underline Bar */}
                <div className="w-12 h-[2.5px] bg-[#143C6B] rounded-full mt-1.5 sm:mt-2 mb-2 sm:mb-2.5" />
                <p className="text-xs sm:text-[13.5px] text-[#556987] font-normal leading-relaxed text-pretty">
                  Direct factory pricing with zero hidden fees and maximum discounts.
                </p>
              </div>
            </div>

            {/* Card 2: 10-Second Instant Checkout */}
            <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-7 border border-[#E2EAF2] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(229,168,18,0.06)] transition-all duration-200 flex flex-row items-center gap-3.5 sm:gap-6 text-left">
              {/* Circular Icon Badge: Warm Cream with Smartphone Icon */}
              <div className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 rounded-full bg-[#FEF8EC] border border-[#FDEECC] flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 min-[375px]:w-8 min-[375px]:h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Smartphone Body */}
                  <rect x="15" y="9" width="18" height="30" rx="4" stroke="#E5A812" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Home Dot */}
                  <circle cx="24" cy="33" r="1.5" fill="#E5A812"/>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] min-[360px]:text-[16px] min-[400px]:text-[18px] sm:text-[21px] font-bold text-[#0B1E36] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  10-Second Instant Checkout
                </h3>
                {/* Accent Underline Bar */}
                <div className="w-12 h-[2.5px] bg-[#E5A812] rounded-full mt-1.5 sm:mt-2 mb-2 sm:mb-2.5" />
                <p className="text-xs sm:text-[13.5px] text-[#556987] font-normal leading-relaxed text-pretty">
                  No password required. Instant login with fast mobile OTP authentication.
                </p>
              </div>
            </div>

            {/* Card 3: 100% GST Verified & COD */}
            <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-7 border border-[#E2EAF2] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.06)] transition-all duration-200 flex flex-row items-center gap-3.5 sm:gap-6 text-left">
              {/* Circular Icon Badge: Light Mint with Shield-Checkmark Icon */}
              <div className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8F7EE] border border-[#D2EFE0] flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 min-[375px]:w-8 min-[375px]:h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shield outline */}
                  <path d="M24 9.5L13 14.5V23C13 29.8 17.7 36 24 37.5C30.3 36 35 29.8 35 23V14.5L24 9.5Z" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Checkmark inside */}
                  <path d="M19 23.5L22.5 27L29 20" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] min-[360px]:text-[16px] min-[400px]:text-[18px] sm:text-[21px] font-bold text-[#0B1E36] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  100% GST Verified &amp; COD
                </h3>
                {/* Accent Underline Bar */}
                <div className="w-12 h-[2.5px] bg-[#059669] rounded-full mt-1.5 sm:mt-2 mb-2 sm:mb-2.5" />
                <p className="text-xs sm:text-[13.5px] text-[#556987] font-normal leading-relaxed text-pretty">
                  Verified Surat &amp; Jaipur wholesale sellers with guaranteed quality and Cash on Delivery.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 5. PROFESSIONAL FOOTER - EXACT SCREENSHOT LAYOUT MATCH */}
        <footer className="bg-white border-t border-[#E8EEF5] pt-10 sm:pt-14 pb-12 px-4 sm:px-6 mt-12" id="landing-footer-section">
          <div className="max-w-xl mx-auto w-full">
            
            {/* Logo & Headline */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BrandLogo size="md" animated={false} layout="row" className="justify-start" />
              </div>
              <p className="text-sm sm:text-[14.5px] text-[#556987] font-normal leading-relaxed">
                India's trusted digital marketplace connecting verified sellers and happy shoppers with quality products, transparent pricing and reliable delivery.
              </p>
            </div>

            {/* Enterprise Information List (3 Items with circular icons) */}
            <div className="flex flex-col gap-4 sm:gap-5 mb-8">
              
              {/* Item 1: Registered Firm */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#EAF3FA] border border-[#D8E6F3] flex items-center justify-center flex-shrink-0 text-[#143C6B]">
                  <Building2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-[#8B9EB2] tracking-wider uppercase">
                    REGISTERED FIRM
                  </span>
                  <span className="text-[15px] font-bold text-[#0B1E36] leading-snug">
                    PASI E-COMMERCE SERVICES
                  </span>
                  <span className="text-xs text-[#6B7F96] mt-0.5">
                    Proprietorship Firm
                  </span>
                </div>
              </div>

              {/* Item 2: GST Registration Number */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#EAF3FA] border border-[#D8E6F3] flex items-center justify-center flex-shrink-0 text-[#143C6B]">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-[#8B9EB2] tracking-wider uppercase">
                    GST REGISTRATION NUMBER
                  </span>
                  <span className="text-[15px] font-bold text-[#0B1E36] leading-snug">
                    06KLFPS7562K2Z8
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#6B7F96] mt-0.5 font-medium">
                    <span>GSTIN Verified</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  </div>
                </div>
              </div>

              {/* Item 3: Registered Address */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#EAF3FA] border border-[#D8E6F3] flex items-center justify-center flex-shrink-0 text-[#143C6B]">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-[#8B9EB2] tracking-wider uppercase whitespace-nowrap">
                    REGISTERED ADDRESS
                  </span>
                  <span className="text-[15px] font-bold text-[#0B1E36] leading-snug whitespace-nowrap">
                    PASI E-COMMERCE SERVICES
                  </span>
                  <span className="text-xs text-[#6B7F96] mt-0.5 whitespace-nowrap">
                    Panchkula, Haryana – 134118, India
                  </span>
                </div>
              </div>

            </div>

            {/* COMPLIANCE & POLICIES SECTION */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#0B1E36] uppercase tracking-wider mb-3 whitespace-nowrap">
                COMPLIANCE &amp; POLICIES
              </h4>
              <div className="flex flex-col divide-y divide-slate-100/80">
                {/* Contact Us */}
                <button 
                  onClick={() => onNavigate('/contact')} 
                  className="w-full flex items-center justify-between py-3.5 hover:text-[#143C6B] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4.5 h-4.5 text-[#0B1E36] stroke-[2.2] flex-shrink-0" />
                    <span className="text-sm font-bold text-[#0B1E36] group-hover:text-[#143C6B] transition-colors whitespace-nowrap">
                      Contact Us
                    </span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                </button>

                {/* Refund & Cancellations */}
                <button 
                  onClick={() => onNavigate('/refund')} 
                  className="w-full flex items-center justify-between py-3.5 hover:text-[#143C6B] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4.5 h-4.5 text-[#0B1E36] stroke-[2.2] flex-shrink-0" />
                    <span className="text-sm font-bold text-[#0B1E36] group-hover:text-[#143C6B] transition-colors whitespace-nowrap">
                      Refund &amp; Cancellations
                    </span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                </button>

                {/* Terms & Conditions */}
                <button 
                  onClick={() => onNavigate('/terms')} 
                  className="w-full flex items-center justify-between py-3.5 hover:text-[#143C6B] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4.5 h-4.5 text-[#0B1E36] stroke-[2.2] flex-shrink-0" />
                    <span className="text-sm font-bold text-[#0B1E36] group-hover:text-[#143C6B] transition-colors whitespace-nowrap">
                      Terms &amp; Conditions
                    </span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                </button>

                {/* Privacy Policy */}
                <button 
                  onClick={() => onNavigate('/privacy')} 
                  className="w-full flex items-center justify-between py-3.5 hover:text-[#143C6B] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4.5 h-4.5 text-[#0B1E36] stroke-[2.2] flex-shrink-0" />
                    <span className="text-sm font-bold text-[#0B1E36] group-hover:text-[#143C6B] transition-colors whitespace-nowrap">
                      Privacy Policy
                    </span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Bottom Copyright, Address & Certifications */}
            <div className="pt-6 border-t border-[#E8EEF5]">
              <div className="flex items-start gap-3 mb-4">
                {/* Hexagonal / Shield Copyright Emblem */}
                <div className="w-7 h-7 rounded-lg border-2 border-[#143C6B] flex items-center justify-center flex-shrink-0 text-[#143C6B] font-bold text-xs mt-0.5">
                  ©
                </div>
                <div className="text-xs text-[#4A5D73] font-medium leading-relaxed">
                  <div className="font-semibold text-[#0B1E36]">© 2026 PASI E-COMMERCE SERVICES.</div>
                  <div className="text-[#4A5D73]">All rights reserved.</div>
                  <div className="text-slate-500">Operating the brand "Quekart".</div>
                  <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Panchkula, Haryana – 134118, India</span>
                  </div>
                </div>
              </div>

              {/* Certification Chips - Guaranteed 1 single line side by side */}
              <div className="flex items-center justify-between sm:justify-start gap-1 min-[360px]:gap-1.5 sm:gap-2.5 text-[9.5px] min-[360px]:text-[10.5px] min-[400px]:text-[11.5px] sm:text-xs text-[#6B7F96] font-medium pt-2 whitespace-nowrap overflow-hidden">
                <span className="whitespace-nowrap">ISO 9001:2015 Certified</span>
                <span className="text-slate-300 font-light px-0.5">|</span>
                <span className="whitespace-nowrap">GST Compliant</span>
                <span className="text-slate-300 font-light px-0.5">|</span>
                <span className="whitespace-nowrap">Secure &amp; Trusted</span>
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
