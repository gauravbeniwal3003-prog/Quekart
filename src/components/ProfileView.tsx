import React from 'react';
import { 
  ChevronLeft, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Phone, 
  Gift, 
  Smartphone, 
  CreditCard, 
  Heart, 
  Share2, 
  Store, 
  Briefcase, 
  Settings, 
  Star, 
  ShieldAlert, 
  LogOut,
  Camera,
  Check,
  Copy,
  Plus,
  Trash2,
  HelpCircle,
  MapPin,
  User,
  Languages,
  AlertCircle,
  Building,
  Wallet,
  Coins,
  MessageSquare,
  Sparkles,
  FileText,
  CheckCircle,
  Clock,
  ShieldCheck,
  Globe,
  Bell,
  Lock,
  MessageCircle
} from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
  onOpenCart: () => void;
  cartCount: number;
  onSelectTab: (tab: string) => void;
  wishlistCount: number;
  ordersCount: number;
  activeSubPage?: string | null;
  setActiveSubPage?: (subPage: string | null) => void;
}

export default function ProfileView({
  onBack,
  onOpenCart,
  cartCount,
  onSelectTab,
  wishlistCount,
  ordersCount,
  activeSubPage: propsActiveSubPage,
  setActiveSubPage: propsSetActiveSubPage
}: ProfileViewProps) {

  const triggerToast = (message: string) => {
    // Dispatch a custom toast event so it shows the same beautiful style as our application toast
    const event = new CustomEvent('show-toast', { detail: message });
    window.dispatchEvent(event);
  };

  // 1. Navigation state for sub-pages
  const [localActiveSubPage, setLocalActiveSubPage] = React.useState<string | null>(null);
  const activeSubPage = propsActiveSubPage !== undefined ? propsActiveSubPage : localActiveSubPage;
  const setActiveSubPage = propsSetActiveSubPage !== undefined ? propsSetActiveSubPage : setLocalActiveSubPage;
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // 2. Avatar & Edit Profile custom states
  const [profileName, setProfileName] = React.useState("Gaurav Beniwal");
  const [profileEmail, setProfileEmail] = React.useState("gauravbeniwal30003@gmail.com");
  const [profilePhone, setProfilePhone] = React.useState("9876543210");
  const [profileGender, setProfileGender] = React.useState("Male");
  const [profileCity, setProfileCity] = React.useState("Jaipur");
  const [profilePin, setProfilePin] = React.useState("302001");
  
  // Custom interactive avatar colors
  const [avatarSkin, setAvatarSkin] = React.useState("#fbc3a1");
  const [avatarShirt, setAvatarShirt] = React.useState("#3b82f6");
  const [avatarHair, setAvatarHair] = React.useState("#1e1e1e");

  // 3. Wallet & Refer / Earn states
  const [luckyBalance, setLuckyBalance] = React.useState(250);
  const [referralCode] = React.useState("LUCKY777GAURAV");
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [scratchCards, setScratchCards] = React.useState([
    { id: 1, orderId: "ORD-8120", reward: 150, scratched: false, date: "12 Jul 2026", friendName: "Amit Sharma", amount: 599 },
    { id: 2, orderId: "ORD-4192", reward: 100, scratched: false, date: "14 Jul 2026", friendName: "Priya Patel", amount: 450 },
    { id: 3, orderId: "ORD-2938", reward: 125, scratched: true, date: "10 Jul 2026", friendName: "Siddharth Jain", amount: 499 }
  ]);
  const [referralHistory, setReferralHistory] = React.useState([
    { id: 1, name: "Amit Sharma", status: "Completed", date: "12 Jul 2026", reward: 150, phone: "+91 98321 XXX54" },
    { id: 2, name: "Priya Patel", status: "Pending", date: "14 Jul 2026", reward: 100, phone: "+91 88762 XXX09" },
    { id: 3, name: "Siddharth Jain", status: "Completed", date: "10 Jul 2026", reward: 125, phone: "+91 70145 XXX12" }
  ]);

  // Active tab inside Refer & Earn
  const [activeReferEarnTab, setActiveReferEarnTab] = React.useState("dashboard"); // "dashboard", "scratch", "history", "milestones"
  
  // Simulator State
  const [simFriendName, setSimFriendName] = React.useState("");
  const [simOrderAmount, setSimOrderAmount] = React.useState("499");
  const [isSimulating, setIsSimulating] = React.useState(false);

  // 4. Bank & UPI details state
  const [bankAccNo, setBankAccNo] = React.useState("919876543210");
  const [bankIFSC, setBankIFSC] = React.useState("PYTM0123456");
  const [bankHolder, setBankHolder] = React.useState("Gaurav Beniwal");
  const [upiId, setUpiId] = React.useState("gauravbeniwal@okaxis");
  const [isEditingBank, setIsEditingBank] = React.useState(false);
  const [isEditingUpi, setIsEditingUpi] = React.useState(false);

  // 5. Payment & Refund State
  const [refundHistory, setRefundHistory] = React.useState([
    { id: "TXN-89312", title: "Premium Rayon Anarkali Kurti Set", date: "14 Jul 2026", price: 249, type: "UPI Refund", status: "Refund Processed", refId: "REF-902318491" },
    { id: "TXN-74129", title: "Luxury Analog Golden Couple Watch", date: "12 Jul 2026", price: 1499, type: "COD Order", status: "Success", refId: null },
    { id: "TXN-32158", title: "Royal Cotton Traditional Saree", date: "05 Jul 2026", price: 540, type: "Card Refund", status: "Refund Initiated", refId: "REF-401924121" }
  ]);
  const [activeRefundTab, setActiveRefundTab] = React.useState("refunds");

  // 6. Language state
  const [selectedLanguage, setSelectedLanguage] = React.useState("English");

  // 7. Shared Products State
  const [sharedProducts, setSharedProducts] = React.useState([
    { id: "prod-watch-lr05", title: "LR 05 Luxury Golden Analog Watch", price: 1499, originalPrice: 2999, discountPercent: 50, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", shares: 8, views: 124 },
    { id: "prod-kurti-anarkali", title: "Premium Rayon Anarkali Kurti Set For Women", price: 249, originalPrice: 499, discountPercent: 50, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", shares: 14, views: 256 }
  ]);

  // 8. Followed Shops State
  const [followedShops, setFollowedShops] = React.useState([
    { id: 1, name: "Bella Cosmetics", rating: 4.6, followers: "45K", logo: "💄", address: "Mumbai, Maharashtra" },
    { id: 2, name: "Komal Handlooms", rating: 4.3, followers: "12K", logo: "🧵", address: "Surat, Gujarat" },
    { id: 3, name: "Gaurav Garments", rating: 4.8, followers: "89K", logo: "👕", address: "Jaipur, Rajasthan" }
  ]);
  const [unfollowedShopsHistory, setUnfollowedShopsHistory] = React.useState<typeof followedShops>([]);

  // 9. Become a Supplier multi-step wizard state
  const [supplierStep, setSupplierStep] = React.useState(1);
  const [supplierGstin, setSupplierGstin] = React.useState("");
  const [supplierShopName, setSupplierShopName] = React.useState("");
  const [supplierState, setSupplierState] = React.useState("");
  const [isSupplierVerified, setIsSupplierVerified] = React.useState(false);

  // 10. Settings Configuration
  const [pushNotif, setPushNotif] = React.useState(true);
  const [smsNotif, setSmsNotif] = React.useState(true);
  const [whatsappNotif, setWhatsappNotif] = React.useState(false);
  const [quickCheckout, setQuickCheckout] = React.useState(true);
  const [simulatedTwilightTheme, setSimulatedTwilightTheme] = React.useState(false);

  // 11. Rate Lucky Feedback Form State
  const [reviewStars, setReviewStars] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const reviewTagsList = ["Super Fast Shipping", "Lowest Price Online", "Outstanding Quality", "Hassle-Free Returns", "True to Size"];

  // 12. Help Centre Custom Chat Support Bot State
  const [faqSearchQuery, setFaqSearchQuery] = React.useState("");
  const [faqCategory, setFaqCategory] = React.useState("all");
  const [expandedFaqIndex, setExpandedFaqIndex] = React.useState<number | null>(null);
  const [chatMessages, setChatMessages] = React.useState([
    { sender: "bot", text: "Hello Gaurav! Welcome to QueKart Live Support. How can I assist you with your orders, refunds, or payments today?", time: "Just now" }
  ]);
  const [userChatInput, setUserChatInput] = React.useState("");

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userMsg = userChatInput;
    const newMsgs = [...chatMessages, { sender: "user", text: userMsg, time: "Just now" }];
    setChatMessages(newMsgs);
    setUserChatInput("");

    // Simulate smart customer support responses
    setTimeout(() => {
      let botResponse = "I've received your query. Let me look up your account details. A support specialist will follow up in 2-3 minutes.";
      const queryLower = userMsg.toLowerCase();
      if (queryLower.includes("refund")) {
        botResponse = "Your recent refund of ₹249 for Anarkali Kurti (TXN-89312) was successfully credited on 14 Jul 2026. Please check your linked bank account ending in *3210.";
      } else if (queryLower.includes("order") || queryLower.includes("track") || queryLower.includes("delivery")) {
        botResponse = "You have 3 active orders in your database. Our top shipment is currently out for delivery in Jaipur and should reach you by 6 PM today!";
      } else if (queryLower.includes("payment") || queryLower.includes("cod")) {
        botResponse = "QueKart supports Cash on Delivery (COD) for 100% of pin codes, as well as instant UPI discounts of 5% on online payments. UPI offers are applied automatically!";
      } else if (queryLower.includes("supplier") || queryLower.includes("sell")) {
        botResponse = "Selling on QueKart is 100% commission-free! You can register your business by verifying your GSTIN in the 'Become a Supplier' tab in your account panel.";
      }
      setChatMessages(prev => [...prev, { sender: "bot", text: botResponse, time: "Just now" }]);
    }, 900);
  };

  const faqs = [
    { cat: "orders", q: "How can I track my order status?", a: "Go to the 'My Orders' tab on the bottom bar of the app. You can click on any active order to see real-time updates of its transit status, courier partner, and expected delivery date." },
    { cat: "refunds", q: "When will I get my refund for a returned item?", a: "Refunds are processed within 2 hours after return pick-up or cancellation is verified. UPI/Netbanking refunds are credited within 24 hours, and bank accounts may take up to 2-3 business days depending on your bank." },
    { cat: "payments", q: "Is Cash on Delivery (COD) safe?", a: "Yes, fully safe! In COD, you pay the courier delivery agent in cash only when you receive the product. QueKart also offers a safety guarantee to ensure genuine products are delivered." },
    { cat: "account", q: "How do I change my delivery address?", a: "You can change or add a new delivery address during checkout inside the Cart drawer. You can also save multiple delivery addresses for quick selection." },
    { cat: "orders", q: "Can I cancel an order after it is shipped?", a: "Once shipped, direct cancellation is not possible. However, you can simply reject the package when the delivery agent arrives, or raise a standard 7-day return request once delivered." }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase());
    const matchesCategory = faqCategory === "all" || faq.cat === faqCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Refer & Earn Scratching
  const handleScratchDynamicCard = (id: number) => {
    let cardAmount = 0;
    let friend = "";
    setScratchCards(prev => prev.map(c => {
      if (c.id === id && !c.scratched) {
        cardAmount = c.reward;
        friend = c.friendName;
        return { ...c, scratched: true };
      }
      return c;
    }));
    if (cardAmount > 0) {
      setLuckyBalance(prev => prev + cardAmount);
      triggerToast(`🎉 You won ₹${cardAmount} from referring ${friend}! Added to your wallet.`);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    triggerToast("Referral code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Onboard Friend Simulator function
  const handleSimulateReferral = (name: string, amountStr: string, autoComplete: boolean) => {
    if (!name.trim()) {
      triggerToast("Please enter a friend's name!");
      return;
    }
    const orderAmt = parseInt(amountStr) || 499;
    const calculatedReward = Math.min(150, Math.floor(orderAmt * 0.25)); // 25% up to ₹150
    const newId = referralHistory.length + 1;
    const randomPhone = "+91 " + Math.floor(6000000000 + Math.random() * 4000000000).toString().replace(/(\d{5})(\d{5})/, "$1 XXX$2").slice(0, 14);
    
    const newHistoryItem = {
      id: newId,
      name: name,
      status: autoComplete ? ("Completed" as const) : ("Pending" as const),
      date: "Today",
      reward: calculatedReward,
      phone: randomPhone
    };

    setReferralHistory(prev => [newHistoryItem, ...prev]);

    if (autoComplete) {
      // Add a scratch card
      const newCard = {
        id: Date.now(),
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        reward: calculatedReward,
        scratched: false,
        date: "Today",
        friendName: name,
        amount: orderAmt
      };
      setScratchCards(prev => [newCard, ...prev]);
      triggerToast(`🎉 Success! ${name} ordered ₹${orderAmt}. You got a Scratch Card worth ₹${calculatedReward}!`);
      setActiveReferEarnTab("scratch");
    } else {
      triggerToast(`📩 Invite sent to ${name}! They are now in your Pending Referrals list.`);
      setActiveReferEarnTab("history");
    }
  };

  // Profile avatar drawing
  const renderAvatarSvg = (sizeClass = "w-16 h-16") => (
    <div className={`relative ${sizeClass} rounded-full flex items-center justify-center overflow-visible shadow-inner`} style={{ backgroundColor: avatarSkin + "40" }}>
      <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] mt-1.5" referrerPolicy="no-referrer">
        {/* Head */}
        <path d="M50,22 C32,22 32,48 32,54 C32,60 38,68 50,68 C62,68 68,60 68,54 C68,48 68,22 50,22 Z" fill={avatarSkin} />
        {/* Ears */}
        <circle cx="28" cy="48" r="6" fill={avatarSkin} />
        <circle cx="72" cy="48" r="6" fill={avatarSkin} />
        {/* Hair */}
        <path d="M28,40 C28,25 35,12 50,12 C65,12 72,25 72,40 C64,28 58,32 50,25 C42,32 36,28 28,40 Z" fill={avatarHair} />
        <path d="M35,22 L38,15 L43,18 L48,13 L53,18 L58,14 L62,19 L66,16" stroke={avatarHair} strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Eyes */}
        <circle cx="43" cy="45" r="3" fill="#121212" />
        <circle cx="57" cy="45" r="3" fill="#121212" />
        {/* Eyebrows */}
        <path d="M38,39 Q43,36 47,39" stroke={avatarHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M53,39 Q57,36 62,39" stroke={avatarHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <path d="M50,47 L50,52" stroke="#e09e7c" strokeWidth="2" strokeLinecap="round" />
        {/* Mouth */}
        <path d="M44,56 Q50,62 56,56" stroke="#c04040" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Chin detail */}
        <path d="M48,63 Q50,65 52,63" stroke="#e09e7c" strokeWidth="1.5" fill="none" />
        {/* Neck & Shirt */}
        <path d="M42,66 L58,66 L62,80 L38,80 Z" fill={avatarShirt} />
        <path d="M42,66 L50,72 L58,66" fill={avatarSkin} />
      </svg>
    </div>
  );

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${simulatedTwilightTheme ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-800'}`} id="profile-container">
      
      {/* ==================== A. MAIN ACCOUNT PROFILE MENU VIEW ==================== */}
      {activeSubPage === null && (
        <div className="animate-fadeIn">
          {/* Header Bar */}
          <header className={`px-4 py-3 border-b sticky top-0 z-50 flex items-center justify-between ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`} id="profile-header">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-1 -ml-1 hover:bg-opacity-10 rounded-full cursor-pointer transition-colors" id="profile-back-btn">
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <span className="text-sm font-extrabold tracking-wider uppercase" id="profile-header-title">Account Settings</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => triggerToast("Opening search options...")} className="p-1.5 hover:bg-opacity-10 rounded-full cursor-pointer transition-colors" id="profile-search-btn">
                <Search className="w-5 h-5 stroke-[2]" />
              </button>
              <button onClick={onOpenCart} className="p-1.5 hover:bg-opacity-10 rounded-full cursor-pointer transition-colors relative" id="profile-cart-btn">
                <ShoppingCart className="w-5 h-5 stroke-[2]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-lucky-magenta text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* User Info Section */}
          <div className={`px-4 py-4 flex items-center justify-between border-b ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`} id="profile-user-section">
            <div className="flex items-center gap-4">
              <div className="relative">
                {renderAvatarSvg("w-16 h-16")}
                <button 
                  onClick={() => setActiveSubPage('edit-profile')}
                  className="absolute bottom-0 right-0 bg-white border border-gray-200/80 p-1 rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform"
                  id="avatar-camera-btn"
                >
                  <Camera className="w-3.5 h-3.5 text-gray-500 stroke-[2]" />
                </button>
              </div>

              <div>
                <h2 className="text-[17px] font-extrabold leading-tight tracking-tight" id="profile-user-name">{profileName}</h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5" id="profile-user-email">{profileEmail}</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveSubPage('edit-profile')} 
              className="text-gray-400 hover:text-gray-600 transition-transform active:translate-x-0.5"
              id="profile-edit-chevron"
            >
              <ChevronRight className="w-6 h-6 stroke-[1.8]" />
            </button>
          </div>

          {/* Dual Quick Action Cards */}
          <div className={`grid grid-cols-2 gap-3.5 px-4 py-4 border-b ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`} id="profile-dual-cards">
            {/* Help Centre Card */}
            <div 
              onClick={() => setActiveSubPage('help-centre')}
              className={`border rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${simulatedTwilightTheme ? 'border-slate-700 bg-slate-900/50 hover:bg-slate-700' : 'border-gray-200/80 hover:bg-gray-50'}`}
              id="profile-help-card"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2.5 shadow-2xs">
                <Phone className="w-5 h-5 text-blue-500 fill-blue-50 stroke-[2]" />
              </div>
              <span className="text-xs font-bold">Help Centre</span>
              <span className="text-[10px] text-gray-400 mt-0.5">24x7 Customer support</span>
            </div>

            {/* Refer & Earn Card */}
            <div 
              onClick={() => setActiveSubPage('refer-earn')}
              className={`border rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${simulatedTwilightTheme ? 'border-slate-700 bg-slate-900/50 hover:bg-slate-700' : 'border-gray-200/80 hover:bg-gray-50'}`}
              id="profile-refer-card"
            >
              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-2.5 shadow-2xs">
                <Gift className="w-5 h-5 text-lucky-magenta fill-pink-50 stroke-[2]" />
              </div>
              <span className="text-xs font-bold">Refer & Earn</span>
              <span className="text-[10px] text-lucky-magenta font-extrabold mt-0.5">Get ₹150 Free</span>
            </div>
          </div>

          {/* My Payments Section */}
          <div className={`mt-2.5 border-y ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`} id="profile-payments-section">
            <h3 className="px-4 pt-3 pb-1 text-[13px] font-extrabold tracking-tight text-gray-400 uppercase">My Payments</h3>
            <div className="divide-y divide-gray-100/10">
              {/* Bank & UPI Details */}
              <div 
                onClick={() => setActiveSubPage('bank-upi')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-bank-upi"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50/60 flex items-center justify-center text-blue-500 shadow-3xs">
                    <Smartphone className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Bank & UPI Details</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">To receive refunds & cashbacks</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="bg-emerald-50 text-emerald-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-emerald-100">Linked</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Payment & Refund Status */}
              <div 
                onClick={() => setActiveSubPage('payment-refund')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-payments-refunds"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-3xs">
                    <CreditCard className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Payment & Refund</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Track transactions & returns</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* My Activity Section */}
          <div className={`mt-2.5 border-y ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`} id="profile-activity-section">
            <h3 className="px-4 pt-3 pb-1 text-[13px] font-extrabold tracking-tight text-gray-400 uppercase">My Activity</h3>
            <div className="divide-y divide-gray-100/10">
              {/* Change Language */}
              <div 
                onClick={() => setActiveSubPage('change-language')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-change-lang"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center">
                    <span className="text-[11px] font-black text-lucky-magenta font-sans uppercase">अ A</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold">Change Language</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Currently: {selectedLanguage}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Wishlisted Products */}
              <div 
                onClick={() => onSelectTab('wishlist')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-wishlisted"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-3xs">
                    <Heart className="w-5 h-5 fill-current stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Wishlisted Products</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Your saved items collection</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {wishlistCount > 0 && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Shared Products */}
              <div 
                onClick={() => setActiveSubPage('shared-products')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-shared"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-lucky-magenta shadow-3xs">
                    <Share2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Shared Products</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Catalog items you shared with friends</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Followed Shops */}
              <div 
                onClick={() => setActiveSubPage('followed-shops')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-followed"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-3xs">
                    <Store className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Followed Shops</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">View updates from preferred merchants</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tight">Active</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Others Section */}
          <div className={`mt-2.5 border-y ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`} id="profile-others-section">
            <h3 className="px-4 pt-3 pb-1 text-[13px] font-extrabold tracking-tight text-gray-400 uppercase">Others</h3>
            <div className="divide-y divide-gray-100/10">
              {/* Lucky Balance */}
              <div 
                onClick={() => setActiveSubPage('lucky-balance')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-lucky-balance"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-3xs">
                    <Wallet className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">QueKart Balance</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Earn coins & redeem rewards</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#e6fffa] text-[#00a389] border border-[#b2f5ea] text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    ₹{luckyBalance}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Become a Supplier */}
              <div 
                onClick={() => onSelectTab('vendor')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-supplier"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shadow-3xs">
                    <Briefcase className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Become a Supplier</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Sell items at 0% commission fee</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSupplierVerified ? (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Active ✅</span>
                  ) : (
                    <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Incomplete</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Admin Control Panel */}
              <div 
                onClick={() => onSelectTab('admin')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-red-50/10 transition-colors bg-red-50/30 border-y border-red-100/50"
                id="row-admin-suite"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600 shadow-3xs">
                    <Lock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">Admin Control Panel</span>
                      <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-sm tracking-widest uppercase">Max Access</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Manage products, orders, coupons & charts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full">Authorized</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Settings */}
              <div 
                onClick={() => setActiveSubPage('settings')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-settings"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shadow-3xs">
                    <Settings className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Settings & Toggles</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Manage notifications & theme mode</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Rate Lucky */}
              <div 
                onClick={() => setActiveSubPage('rate-lucky')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-rate"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-3xs">
                    <Star className="w-5 h-5 fill-current stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Rate QueKart App</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Love our service? Give feedback!</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Legal and Policies */}
              <div 
                onClick={() => setActiveSubPage('legal-policies')}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-legal"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shadow-3xs">
                    <ShieldAlert className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Legal and Policies</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Terms of Use & Anti-Counterfeiting</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Logout */}
              <div 
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-opacity-5 transition-colors"
                id="row-logout"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-3xs">
                    <LogOut className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Logout</span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Log out of this device safely</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Made with love for Bharat - Bottom Illustration Banner */}
          <div className="mt-8 px-4 flex flex-col items-center" id="bharat-banner-wrapper">
            <div className={`w-full rounded-2xl p-5 border flex items-center justify-between overflow-hidden relative shadow-2xs ${simulatedTwilightTheme ? 'bg-slate-800 border-slate-700' : 'bg-[#f4f7fa] border-gray-100'}`} id="bharat-banner">
              {/* Confetti decorative circles */}
              <div className="absolute top-2 right-12 w-2 h-2 rounded-full bg-pink-300 opacity-60"></div>
              <div className="absolute bottom-3 left-20 w-1.5 h-1.5 rounded-full bg-yellow-400 opacity-60"></div>
              <div className="absolute top-1/2 left-28 w-2.5 h-2.5 rounded-full bg-blue-300 opacity-40"></div>

              <div className="flex flex-col max-w-[55%]" id="bharat-banner-text">
                <h4 className="text-[17px] italic leading-tight font-sans tracking-wide">
                  Made with <span className="text-[#e11d48] font-bold">love</span>
                </h4>
                <h4 className="text-[17px] italic leading-tight font-bold tracking-wide mt-0.5">
                  for Bharat
                </h4>
              </div>

              {/* Vector representation of hands holding Indian Flag */}
              <div className="relative w-28 h-20 flex-shrink-0" id="bharat-banner-graphic">
                {/* Indian Flag SVG */}
                <svg viewBox="0 0 120 100" className="w-full h-full">
                  {/* Flag Pole */}
                  <line x1="55" y1="35" x2="55" y2="85" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Flag Ripples */}
                  <g>
                    {/* Saffron */}
                    <path d="M55,35 Q65,30 75,35 Q85,40 95,35 L95,44 Q85,49 75,44 Q65,39 55,44 Z" fill="#FF9933" />
                    {/* White */}
                    <path d="M55,44 Q65,39 75,44 Q85,49 95,44 L95,53 Q85,58 75,53 Q65,48 55,53 Z" fill="#FFFFFF" />
                    {/* Green */}
                    <path d="M55,53 Q65,48 75,53 Q85,58 95,53 L95,62 Q85,67 75,62 Q65,57 55,62 Z" fill="#138808" />
                    {/* Ashoka Chakra */}
                    <circle cx="75" cy="48.5" r="3" fill="none" stroke="#000080" strokeWidth="0.8" />
                    <path d="M75,45.5 L75,51.5 M72,48.5 L78,48.5 M73,46.5 L77,50.5 M73,50.5 L77,46.5" stroke="#000080" strokeWidth="0.4" />
                  </g>

                  {/* Hands */}
                  <path d="M25,75 Q28,62 38,62 Q45,62 48,70 Q43,82 25,85 Z" fill="#e09e7c" />
                  <path d="M38,62 C40,50 48,50 46,65" stroke="#bf8162" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M48,82 Q56,72 65,72 Q72,72 75,82 Q65,92 48,85 Z" fill="#e09e7c" />
                  <circle cx="53" cy="78" r="3" fill="#bf8162" />
                  <circle cx="57" cy="78" r="3" fill="#bf8162" />
                  <circle cx="61" cy="78" r="3" fill="#bf8162" />
                </svg>
              </div>
            </div>

            {/* App Version indicator */}
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide mt-3" id="app-version-text">
              App Version: 28.4 (QueKart-Build-841)
            </span>
          </div>
        </div>
      )}


      {/* ==================== B. MODALS AND SUB-PAGES ACCORDING TO USER SELECTION ==================== */}
      
      {/* 1. Edit Profile Information Sub-Page */}
      {activeSubPage === 'edit-profile' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="edit-profile-subpage">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Edit Profile</h2>
          </div>

          {/* Interactive Avatar Customizer block */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs mb-5 text-center flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Avatar Preview</span>
            {renderAvatarSvg("w-24 h-24")}
            
            {/* Controls */}
            <div className="grid grid-cols-3 gap-2 mt-4 w-full">
              {/* Skin Selector */}
              <div className="flex flex-col items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Skin Tone</span>
                <div className="flex gap-1.5 mt-1">
                  <button onClick={() => setAvatarSkin("#fbc3a1")} className={`w-4 h-4 rounded-full bg-[#fbc3a1] border ${avatarSkin === "#fbc3a1" ? 'border-lucky-magenta scale-110' : 'border-gray-200'}`} />
                  <button onClick={() => setAvatarSkin("#fde3cf")} className={`w-4 h-4 rounded-full bg-[#fde3cf] border ${avatarSkin === "#fde3cf" ? 'border-lucky-magenta scale-110' : 'border-gray-200'}`} />
                  <button onClick={() => setAvatarSkin("#bf8162")} className={`w-4 h-4 rounded-full bg-[#bf8162] border ${avatarSkin === "#bf8162" ? 'border-lucky-magenta scale-110' : 'border-gray-200'}`} />
                </div>
              </div>

              {/* Shirt Selector */}
              <div className="flex flex-col items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Shirt Color</span>
                <div className="flex gap-1.5 mt-1">
                  <button onClick={() => setAvatarShirt("#3b82f6")} className={`w-4 h-4 rounded-md bg-[#3b82f6] ${avatarShirt === "#3b82f6" ? 'ring-2 ring-lucky-magenta' : ''}`} />
                  <button onClick={() => setAvatarShirt("#db2777")} className={`w-4 h-4 rounded-md bg-[#db2777] ${avatarShirt === "#db2777" ? 'ring-2 ring-lucky-magenta' : ''}`} />
                  <button onClick={() => setAvatarShirt("#10b981")} className={`w-4 h-4 rounded-md bg-[#10b981] ${avatarShirt === "#10b981" ? 'ring-2 ring-lucky-magenta' : ''}`} />
                </div>
              </div>

              {/* Hair Selector */}
              <div className="flex flex-col items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Hair Type</span>
                <div className="flex gap-1.5 mt-1">
                  <button onClick={() => setAvatarHair("#1e1e1e")} className={`w-4 h-4 rounded-full bg-[#1e1e1e] ${avatarHair === "#1e1e1e" ? 'ring-2 ring-lucky-magenta' : ''}`} />
                  <button onClick={() => setAvatarHair("#8B4513")} className={`w-4 h-4 rounded-full bg-[#8B4513] ${avatarHair === "#8B4513" ? 'ring-2 ring-lucky-magenta' : ''}`} />
                  <button onClick={() => setAvatarHair("#eab308")} className={`w-4 h-4 rounded-full bg-[#eab308] ${avatarHair === "#eab308" ? 'ring-2 ring-lucky-magenta' : ''}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Form details */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4">
            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
              <input 
                type="text" 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
              <input 
                type="email" 
                value={profileEmail} 
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Mobile Number</label>
              <input 
                type="text" 
                value={profilePhone} 
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Gender</label>
                <select 
                  value={profileGender} 
                  onChange={(e) => setProfileGender(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">City</label>
                <input 
                  type="text" 
                  value={profileCity} 
                  onChange={(e) => setProfileCity(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">PIN Code</label>
              <input 
                type="text" 
                value={profilePin} 
                onChange={(e) => setProfilePin(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
              />
            </div>

            <button 
              onClick={() => {
                setActiveSubPage(null);
                triggerToast("Profile information saved successfully! ✅");
              }}
              className="w-full bg-lucky-magenta hover:bg-opacity-90 text-white font-extrabold text-xs py-3 rounded-lg shadow-md cursor-pointer transition-transform active:scale-98"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* 2. Help Centre & Live Chat Support Sub-Page */}
      {activeSubPage === 'help-centre' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="help-centre-subpage">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Help Centre</h2>
          </div>

          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search help topics..." 
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-2 pl-9.5 pr-4 text-xs font-semibold focus:outline-none focus:border-lucky-magenta shadow-3xs"
            />
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
            {["all", "orders", "refunds", "payments", "account"].map(cat => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                  faqCategory === cat 
                    ? 'bg-lucky-magenta border-lucky-magenta text-white shadow-2xs' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQs List Accordion */}
          <div className="space-y-2.5 mt-2 mb-6">
            <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider px-1">Common Questions</h3>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-6 bg-white border border-gray-100 rounded-xl">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500 font-medium">No FAQs match "{faqSearchQuery}"</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;
                return (
                  <div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-3xs">
                    <button 
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between font-bold text-xs text-gray-800 hover:bg-gray-50/50 cursor-pointer"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-50 text-[11px] text-gray-500 leading-relaxed font-medium bg-pink-50/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Smart Live Chat widget box */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-2xs overflow-hidden" id="chat-widget">
            <div className="bg-lucky-magenta px-4 py-3 flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <div>
                <h4 className="text-xs font-black">QueKart Live Support</h4>
                <p className="text-[9px] text-pink-100 font-bold">● Active Customer Assistant</p>
              </div>
            </div>

            {/* Chat Body messages list */}
            <div className="p-3.5 h-48 overflow-y-auto bg-gray-50/50 flex flex-col gap-2.5" id="chat-messages-container">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user' ? 'bg-lucky-magenta text-white rounded-br-none' : 'bg-white border border-gray-200/60 text-gray-800 rounded-bl-none shadow-3xs'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-gray-400 mt-0.5 px-1 font-bold">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input field */}
            <form onSubmit={handleSendChatMessage} className="border-t border-gray-100 p-2 bg-white flex gap-2">
              <input 
                type="text" 
                placeholder="Type your question here..." 
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-lucky-magenta font-semibold"
              />
              <button 
                type="submit" 
                className="bg-lucky-magenta text-white text-[10px] font-black px-4 py-1.5 rounded-lg hover:bg-opacity-90 active:scale-95 cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Refer & Earn Gamified Scratch-Card Sub-Page */}
      {activeSubPage === 'refer-earn' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="refer-earn-subpage">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <ChevronLeft className="w-6 h-6 stroke-[2]" />
              </button>
              <div>
                <h2 className="text-base font-extrabold tracking-wide uppercase flex items-center gap-1.5">
                  <span>Refer & Earn</span>
                  <span className="bg-lucky-magenta text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">Meesho style</span>
                </h2>
                <p className="text-[10px] text-gray-400 font-bold">Bharat's No. 1 Referral Program</p>
              </div>
            </div>
            {/* Quick Balance badge */}
            <div className="bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-lucky-magenta fill-pink-100" />
              <span className="text-xs font-black text-lucky-magenta">₹{luckyBalance}</span>
            </div>
          </div>

          {/* Core Meesho-Style Earnings Stats Banner */}
          <div className="bg-linear-to-r from-[#9c1359] to-[#db2777] rounded-2xl p-4.5 text-white shadow-md mb-5 relative overflow-hidden" id="meesho-stats-banner">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>
            
            <span className="bg-amber-400 text-purple-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              👑 QueKart Star Club Partner
            </span>
            
            <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-white/15 pt-3.5">
              <div className="border-r border-white/15 pr-1">
                <span className="text-[10px] text-pink-200 block uppercase font-extrabold tracking-wider">Total Earned</span>
                <span className="text-lg font-black mt-0.5 block flex items-center justify-center gap-0.5">
                  <span className="text-amber-300 font-bold">₹</span>{luckyBalance}
                </span>
              </div>
              
              <div className="border-r border-white/15 px-1">
                <span className="text-[10px] text-pink-200 block uppercase font-extrabold tracking-wider">Pending</span>
                <span className="text-lg font-black mt-0.5 block flex items-center justify-center gap-0.5 text-pink-100">
                  <span>₹</span>{referralHistory.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.reward, 0)}
                </span>
              </div>
              
              <div className="pl-1">
                <span className="text-[10px] text-pink-200 block uppercase font-extrabold tracking-wider">Completed</span>
                <span className="text-lg font-black mt-0.5 block">
                  {referralHistory.filter(r => r.status === 'Completed').length} Friends
                </span>
              </div>
            </div>
          </div>

          {/* Horizontal Navigation Tabs */}
          <div className="flex border-b border-gray-100 mb-4 text-xs font-extrabold text-gray-400 overflow-x-auto scrollbar-none gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: "🏠" },
              { id: "scratch", label: `Scratch Cards (${scratchCards.filter(c => !c.scratched).length})`, icon: "🎁" },
              { id: "history", label: "My Referrals", icon: "📋" },
              { id: "simulator", label: "Invite Simulator 🧪", icon: "⚡" }
            ].map(tab => {
              const isActive = activeReferEarnTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReferEarnTab(tab.id)}
                  className={`py-2 px-3 flex items-center gap-1 cursor-pointer transition-all border-b-2 font-black ${
                    isActive 
                      ? "border-lucky-magenta text-lucky-magenta bg-pink-50/10" 
                      : "border-transparent hover:text-gray-600"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}

          {/* Tab 1: Dashboard */}
          {activeReferEarnTab === "dashboard" && (
            <div className="space-y-4.5 animate-fadeIn">
              {/* Weekly Referral Goal Milestone */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs">
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-gray-800 flex items-center gap-1">
                      <span>🎯 Weekly Star Goal Challenge</span>
                      <span className="bg-amber-100 text-amber-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded-sm">Bonus ₹300</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Complete 5 successful referrals to earn an extra ₹300 bonus cash!</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>Progress: {referralHistory.filter(r => r.status === 'Completed').length} / 5 Referred</span>
                    <span className="text-lucky-magenta font-black">
                      {Math.min(100, Math.round((referralHistory.filter(r => r.status === 'Completed').length / 5) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-linear-to-r from-lucky-magenta to-pink-500 h-full transition-all duration-500 rounded-full" 
                      style={{ width: `${Math.min(100, (referralHistory.filter(r => r.status === 'Completed').length / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Share Referral Code Section */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-100 shadow-3xs text-center">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-2">Your Invite Code</span>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 justify-between max-w-sm mx-auto mb-3.5">
                  <span className="text-sm font-black text-lucky-magenta tracking-wider select-all">{referralCode}</span>
                  <button 
                    onClick={handleCopyReferral}
                    className="flex items-center gap-1 text-xs text-gray-500 font-bold hover:text-lucky-magenta cursor-pointer transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedCode ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                {/* Instant Share Buttons */}
                <div className="grid grid-cols-2 gap-3.5">
                  <button 
                    onClick={() => {
                      triggerToast("Simulating WhatsApp invite share to your contacts...");
                    }}
                    className="bg-[#25D366] text-white font-extrabold text-[11px] py-2.5 rounded-xl shadow-xs hover:bg-[#20ba5a] active:scale-98 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Share on WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => {
                      triggerToast("Simulation link copied! Forward it to friends to earn.");
                    }}
                    className="bg-lucky-magenta text-white font-extrabold text-[11px] py-2.5 rounded-xl shadow-xs hover:bg-opacity-95 active:scale-98 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>More Options</span>
                  </button>
                </div>
              </div>

              {/* How it works Visual flow chart */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs">
                <h4 className="text-xs font-black text-gray-800 border-b border-gray-50 pb-2 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚀 How Meesho Referral Works</span>
                </h4>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Share Your Code", text: "Invite friends to install the QueKart App & share your unique code with them." },
                    { step: "2", title: "Friend Places 1st Order", text: "Your friends get an instant 20% discount on their first purchase order!" },
                    { step: "3", title: "Get Instant Cash Card", text: "You get a cash scratch card worth up to ₹150 for EVERY friend's first order!" }
                  ].map(step => (
                    <div key={step.step} className="flex gap-3.5 items-start">
                      <span className="bg-pink-100 text-lucky-magenta w-5.5 h-5.5 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 shadow-3xs">
                        {step.step}
                      </span>
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-gray-800">{step.title}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-semibold">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard of Top Earners */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1">
                    <span>🏆 QueKart Leaderboard</span>
                    <span className="bg-emerald-50 text-emerald-600 font-extrabold text-[8px] px-1 py-0.2 rounded-xs">Live Weekly</span>
                  </h4>
                  <span className="text-[9px] text-gray-400 font-bold">Top Referrers of Bharat</span>
                </div>
                <div className="space-y-2 text-xs font-bold">
                  {[
                    { rank: "1", name: "Suresh Patel", location: "Surat", amount: "₹45,890", medal: "🥇" },
                    { rank: "2", name: "Kajal Sharma", location: "Delhi", amount: "₹38,200", medal: "🥈" },
                    { rank: "3", name: "Rajat Beniwal", location: "Jaipur", amount: "₹31,450", medal: "🥉" }
                  ].map(user => (
                    <div key={user.rank} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{user.medal}</span>
                        <div>
                          <p className="text-gray-800 text-[11px] font-extrabold">{user.name}</p>
                          <span className="text-[8px] text-gray-400 font-medium">{user.location}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-lucky-magenta">{user.amount} Won</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Scratch Cards */}
          {activeReferEarnTab === "scratch" && (
            <div className="space-y-4.5 animate-fadeIn">
              <div className="bg-amber-50 border border-amber-100/50 rounded-xl p-3.5 flex gap-2.5 items-start">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-100 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950 leading-tight">Scratch & Win Cash!</h4>
                  <p className="text-[10px] text-amber-800/80 leading-normal mt-0.5">Tap on any active card. Rub the silver overlay with your cursor/finger or double tap to instantly claim cash directly into your wallet balance.</p>
                </div>
              </div>

              {scratchCards.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
                  <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-500">No active scratch cards</p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[80%] mx-auto">Use the **Invite Simulator 🧪** tab to register dummy referrals and win instant scratch cards to test out this gamified system!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {scratchCards.map(card => (
                    <div 
                      key={card.id}
                      onClick={() => handleScratchDynamicCard(card.id)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-center border relative overflow-hidden transition-all duration-300 ${
                        card.scratched 
                          ? 'bg-linear-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800 scale-100' 
                          : 'bg-linear-to-br from-pink-500 via-[#db2777] to-purple-600 border-pink-400 hover:scale-[1.03] cursor-pointer shadow-md shadow-pink-100 animate-pulse'
                      }`}
                    >
                      {/* Shiny Overlay for Unscratched */}
                      {!card.scratched && (
                        <div className="absolute inset-0 bg-white/10 skew-x-12 translate-x-[-150%] hover:translate-x-[150%] transition-transform duration-1000"></div>
                      )}

                      {card.scratched ? (
                        <div className="animate-scaleIn">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                          <span className="text-[8px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Claimed ✅</span>
                          <h4 className="text-xl font-black mt-1 text-emerald-900">₹{card.reward}</h4>
                          <p className="text-[8px] text-emerald-500/80 font-bold mt-1 truncate max-w-[90px] mx-auto">From {card.friendName}</p>
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-2 right-2 bg-white/20 text-white font-black text-[8px] px-2 py-0.5 rounded-full">
                            NEW
                          </div>
                          <Gift className="w-10 h-10 text-white stroke-[1.8] animate-bounce mb-1" />
                          <span className="text-white font-extrabold text-xs tracking-tight">Tap & Scratch</span>
                          <span className="text-[8px] text-pink-100 font-black uppercase tracking-wider mt-1 block">Value up to ₹150</span>
                          <p className="text-[7px] text-white/70 font-semibold mt-1">From {card.friendName}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Referrals Log */}
          {activeReferEarnTab === "history" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                  <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider">Your Referral History Log</h4>
                  <span className="text-[9px] text-gray-400 font-bold">{referralHistory.length} invites total</span>
                </div>

                <div className="divide-y divide-gray-100/50">
                  {referralHistory.map(item => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                      <div className="space-y-0.5">
                        <p className="text-gray-800 text-[12px] font-black">{item.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold">{item.phone} • {item.date}</p>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase inline-block ${
                          item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{item.status}</span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-800">Reward: ₹{item.reward}</p>
                        {item.status === 'Pending' ? (
                          <button 
                            onClick={() => {
                              triggerToast(`Simulating WhatsApp reminder template to ${item.name}...`);
                            }}
                            className="mt-1.5 text-[9px] font-black text-white bg-[#25D366] hover:bg-[#20ba5a] px-2 py-1 rounded-md flex items-center gap-1 w-max ml-auto active:scale-95 transition-transform"
                          >
                            <MessageCircle className="w-3 h-3 fill-white" />
                            <span>Remind</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-emerald-600 font-extrabold mt-1.5 block">Received 🎉</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Invite Simulator */}
          {activeReferEarnTab === "simulator" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4.5">
                <div className="text-center border-b border-gray-50 pb-3">
                  <span className="text-2xl">🧪</span>
                  <h3 className="text-sm font-black text-gray-800 mt-1">Meesho Referral Sandbox Simulator</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Test out the referral pipeline in real-time. Create mock friends to verify scratch cards, wallet balances, and history tracking.</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Friend's Mock Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Vikram Singh" 
                      value={simFriendName}
                      onChange={(e) => setSimFriendName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">First Order Amount (₹)</label>
                    <select 
                      value={simOrderAmount} 
                      onChange={(e) => setSimOrderAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
                    >
                      <option value="299">₹299 (Earn ₹74 Reward)</option>
                      <option value="499">₹499 (Earn ₹124 Reward)</option>
                      <option value="599">₹599 (Earn ₹149 Reward)</option>
                      <option value="999">₹999 (Earn ₹150 Max Reward)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1.5">
                    <button 
                      onClick={() => handleSimulateReferral(simFriendName, simOrderAmount, false)}
                      className="bg-gray-100 text-gray-600 font-extrabold text-[10px] py-2.5 rounded-xl border border-gray-200/50 hover:bg-gray-200 cursor-pointer active:scale-95 transition-transform"
                    >
                      Simulate App Install Only
                    </button>
                    <button 
                      onClick={() => handleSimulateReferral(simFriendName, simOrderAmount, true)}
                      className="bg-lucky-magenta text-white font-black text-[10px] py-2.5 rounded-xl shadow-md hover:bg-opacity-95 cursor-pointer active:scale-95 transition-transform"
                    >
                      Simulate 1st Order (Win Card!)
                    </button>
                  </div>
                </div>

                {/* Preset Fast Selection */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100/60 text-xs">
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2">Or select preset test cases:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Rahul Gupta", order: "499", label: "Rahul's Order" },
                      { name: "Sonia Verma", order: "999", label: "Sonia's Big Order" },
                      { name: "Preeti Sen", order: "299", label: "Preeti's Budget Order" }
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setSimFriendName(preset.name);
                          setSimOrderAmount(preset.order);
                          triggerToast(`Selected preset: ${preset.name}`);
                        }}
                        className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-600 font-bold hover:border-lucky-magenta hover:text-lucky-magenta cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Referral FAQ and Rules */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs mt-4">
            <h4 className="text-xs font-black text-gray-800 border-b border-gray-50 pb-2 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-lucky-magenta" />
              <span>Program Frequently Asked Questions</span>
            </h4>
            <div className="space-y-3.5 text-[11px] font-medium text-gray-500">
              <details className="group">
                <summary className="font-extrabold text-gray-700 cursor-pointer flex justify-between items-center group-open:text-lucky-magenta">
                  <span>How much can I earn?</span>
                  <span className="text-[10px] text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-1.5 leading-relaxed text-gray-400">There is absolutely **no limit**! For every friend who places their first purchase order using your referral code, you earn 25% of their order value up to a maximum of ₹150. You can refer hundreds of friends!</p>
              </details>
              
              <details className="group">
                <summary className="font-extrabold text-gray-700 cursor-pointer flex justify-between items-center group-open:text-lucky-magenta">
                  <span>When is the scratch card unlocked?</span>
                  <span className="text-[10px] text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-1.5 leading-relaxed text-gray-400">The scratch card is unlocked the **moment your referred friend's first order is marked as delivered** by our courier logistics. If the order is cancelled, the pending reward is expired.</p>
              </details>

              <details className="group">
                <summary className="font-extrabold text-gray-700 cursor-pointer flex justify-between items-center group-open:text-lucky-magenta">
                  <span>Can I transfer this to my Bank/UPI?</span>
                  <span className="text-[10px] text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-1.5 leading-relaxed text-gray-400">Yes! The wallet cash can be used **100% on your next purchases** on QueKart. You can also transfer your balance directly into your linked bank account from the "My Wallet" section.</p>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bank & UPI Details Sub-Page */}
      {activeSubPage === 'bank-upi' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="bank-upi-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Bank & UPI Details</h2>
          </div>

          <div className="bg-amber-50 border border-amber-100/60 rounded-xl p-3.5 flex gap-2.5 items-start mb-5" id="payout-security-info">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 leading-tight">100% Encrypted & Safe Payouts</h4>
              <p className="text-[10px] text-amber-800/80 leading-normal mt-0.5">Your banking details are encrypted and stored safely. They are only used to automate instant refunds for returned cash-on-delivery orders.</p>
            </div>
          </div>

          {/* Bank Account Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs mb-5">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4.5 h-4.5 text-blue-500" />
                <span>Primary Bank Account</span>
              </h3>
              <button 
                onClick={() => {
                  if (isEditingBank) {
                    setIsEditingBank(false);
                    triggerToast("Bank Details updated successfully!");
                  } else {
                    setIsEditingBank(true);
                  }
                }}
                className="text-[10px] text-lucky-magenta font-black hover:underline cursor-pointer"
              >
                {isEditingBank ? "Save" : "Edit Details"}
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-0.5">Account Number</label>
                {isEditingBank ? (
                  <input 
                    type="text" 
                    value={bankAccNo} 
                    onChange={(e) => setBankAccNo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-gray-50"
                  />
                ) : (
                  <span className="font-black text-gray-700 tracking-wider">XXXX XXXX {bankAccNo.slice(-4)}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-0.5">IFSC Code</label>
                  {isEditingBank ? (
                    <input 
                      type="text" 
                      value={bankIFSC} 
                      onChange={(e) => setBankIFSC(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-gray-50 uppercase"
                    />
                  ) : (
                    <span className="font-extrabold text-gray-700 uppercase">{bankIFSC}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-0.5">Holder Name</label>
                  {isEditingBank ? (
                    <input 
                      type="text" 
                      value={bankHolder} 
                      onChange={(e) => setBankHolder(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-gray-50"
                    />
                  ) : (
                    <span className="font-bold text-gray-700">{bankHolder}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* UPI ID Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4.5 h-4.5 text-pink-500" />
                <span>Linked UPI ID</span>
              </h3>
              <button 
                onClick={() => {
                  if (isEditingUpi) {
                    setIsEditingUpi(false);
                    triggerToast("UPI ID saved & verified!");
                  } else {
                    setIsEditingUpi(true);
                  }
                }}
                className="text-[10px] text-lucky-magenta font-black hover:underline cursor-pointer"
              >
                {isEditingUpi ? "Verify & Save" : "Edit UPI"}
              </button>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Your UPI ID</label>
              {isEditingUpi ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-gray-50"
                  />
                  <button 
                    onClick={() => {
                      setIsEditingUpi(false);
                      triggerToast("UPI ID Verified successfully! ✅");
                    }}
                    className="bg-lucky-magenta text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                  <span className="text-xs font-bold text-gray-800 select-all">{upiId}</span>
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 font-black px-1.5 py-0.5 rounded-sm border border-emerald-100 uppercase">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Payment & Refund Timeline Tracker Sub-Page */}
      {activeSubPage === 'payment-refund' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="payment-refund-subpage">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Payment & Refunds</h2>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg mb-5 shadow-3xs">
            <button 
              onClick={() => setActiveRefundTab("refunds")}
              className={`text-xs py-2 rounded-md font-bold transition-all cursor-pointer ${
                activeRefundTab === "refunds" ? "bg-white text-gray-800 shadow-2xs" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Refund Status
            </button>
            <button 
              onClick={() => setActiveRefundTab("payments")}
              className={`text-xs py-2 rounded-md font-bold transition-all cursor-pointer ${
                activeRefundTab === "payments" ? "bg-white text-gray-800 shadow-2xs" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Transactions
            </button>
          </div>

          <div className="space-y-4">
            {activeRefundTab === 'refunds' ? (
              // Refund Tracker Stepper list
              refundHistory.filter(txn => txn.status.startsWith("Refund")).map(txn => (
                <div key={txn.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs">
                  <div className="flex justify-between items-start border-b border-gray-50 pb-2.5">
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{txn.title}</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5 font-bold">Transaction ID: {txn.id}</p>
                    </div>
                    <span className="text-xs font-black text-lucky-magenta">₹{txn.price}</span>
                  </div>

                  {/* Step Indicators */}
                  <div className="mt-4 space-y-4 relative pl-5 border-l-2 border-gray-100 ml-1.5" id="refund-stepper">
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-7 top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-3xs">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[10px] font-black text-gray-800 block">Return Request Initiated</span>
                      <span className="text-[9px] text-gray-400 font-bold">{txn.date}</span>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-7 top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-3xs">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[10px] font-black text-gray-800 block">Package Picked Up & Inspected</span>
                      <span className="text-[9px] text-gray-400 font-bold">Same day</span>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className={`absolute -left-7 top-0 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white shadow-3xs ${
                        txn.status === "Refund Processed" ? 'bg-emerald-500' : 'bg-lucky-magenta animate-pulse'
                      }`}>
                        {txn.status === "Refund Processed" ? <Check className="w-2.5 h-2.5 text-white" /> : <Clock className="w-2 h-2 text-white" />}
                      </div>
                      <span className="text-[10px] font-black text-gray-800 block">Refund Transferred ({txn.type})</span>
                      <span className="text-[9px] text-gray-400 font-bold">
                        {txn.status === "Refund Processed" ? `Credited: ${txn.refId}` : "Processing by Bank"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // All Transactions history
              refundHistory.map(txn => (
                <div key={txn.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-gray-800">{txn.title}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{txn.date} • {txn.type}</p>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                      txn.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>{txn.status}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">₹{txn.price}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. Change Language Sub-Page */}
      {activeSubPage === 'change-language' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="change-language-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Select Language</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6" id="language-grid">
            {[
              { code: "en", label: "English", sub: "English" },
              { code: "hi", label: "Hindi", sub: "हिंदी" },
              { code: "bn", label: "Bengali", sub: "বাংলা" },
              { code: "te", label: "Telugu", sub: "తెలుగు" },
              { code: "ta", label: "Tamil", sub: "தமிழ்" },
              { code: "mr", label: "Marathi", sub: "मराठी" }
            ].map(lang => {
              const isSelected = selectedLanguage === lang.label;
              return (
                <div 
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.label)}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isSelected ? 'border-lucky-magenta bg-pink-50/20 scale-[1.03] shadow-xs' : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-base font-black ${isSelected ? 'text-lucky-magenta' : 'text-gray-800'}`}>{lang.sub}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{lang.label}</span>
                  
                  {isSelected && (
                    <span className="bg-lucky-magenta text-white p-0.5 rounded-full mt-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => {
              setActiveSubPage(null);
              triggerToast(`Language successfully changed to ${selectedLanguage}! ✅`);
            }}
            className="w-full bg-lucky-magenta text-white font-extrabold text-xs py-3 rounded-lg shadow-md hover:bg-opacity-95 cursor-pointer transition-transform active:scale-98"
          >
            Confirm Language Selection
          </button>
        </div>
      )}

      {/* 7. Shared Products Catalog Sub-Page */}
      {activeSubPage === 'shared-products' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="shared-products-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Shared Catalogues</h2>
          </div>

          <div className="space-y-4">
            {sharedProducts.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-3xs flex gap-3.5 items-center">
                <img src={p.image} alt={p.title} className="w-16 h-20 object-cover rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-black text-gray-800 truncate">{p.title}</h4>
                  <p className="text-xs font-black text-gray-950">₹{p.price} <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span></p>
                  
                  {/* Share logs stats */}
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 pt-1">
                    <span className="flex items-center gap-0.5"><Share2 className="w-3.5 h-3.5 text-lucky-magenta" /> {p.shares} Shares</span>
                    <span className="flex items-center gap-0.5"><Search className="w-3.5 h-3.5 text-blue-500" /> {p.views} Views</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    triggerToast(`Re-sharing link for ${p.title.slice(0, 15)}...`);
                  }}
                  className="bg-lucky-magenta text-white text-[10px] font-extrabold p-2 rounded-lg hover:bg-opacity-90 active:scale-95 transition-all"
                >
                  Reshare
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Followed Shops Sub-Page */}
      {activeSubPage === 'followed-shops' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="followed-shops-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Followed Shops</h2>
          </div>

          {followedShops.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-xl shadow-3xs">
              <span className="text-4xl">🏬</span>
              <p className="text-xs text-gray-400 font-extrabold mt-3 uppercase tracking-wider">No followed sellers yet</p>
              <button 
                onClick={() => {
                  setFollowedShops([
                    { id: 1, name: "Bella Cosmetics", rating: 4.6, followers: "45K", logo: "💄", address: "Mumbai, Maharashtra" },
                    { id: 2, name: "Komal Handlooms", rating: 4.3, followers: "12K", logo: "🧵", address: "Surat, Gujarat" },
                    { id: 3, name: "Gaurav Garments", rating: 4.8, followers: "89K", logo: "👕", address: "Jaipur, Rajasthan" }
                  ]);
                  triggerToast("Restored recommended shops! ✅");
                }}
                className="mt-4 bg-lucky-magenta text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-md cursor-pointer"
              >
                Restore Shop Recommendations
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {followedShops.map(shop => (
                <div key={shop.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs flex justify-between items-center">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-1 bg-gray-50 rounded-lg">{shop.logo}</span>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 flex items-center gap-1">
                        <span>{shop.name}</span>
                        <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1 py-0.2 rounded-sm">Verified</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{shop.followers} Followers • {shop.address}</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black text-gray-600">{shop.rating} ★</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setFollowedShops(prev => prev.filter(s => s.id !== shop.id));
                      setUnfollowedShopsHistory(prev => [...prev, shop]);
                      triggerToast(`You unfollowed ${shop.name}`);
                    }}
                    className="border border-gray-200 text-gray-500 hover:text-lucky-magenta hover:border-lucky-magenta text-[10px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. Lucky Balance Sub-Page */}
      {activeSubPage === 'lucky-balance' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="lucky-balance-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">QueKart Wallet</h2>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-3xs mb-5 text-center flex flex-col items-center relative overflow-hidden">
            {/* Ambient background accent */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-100 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-100 rounded-full blur-xl"></div>

            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-2.5 shadow-2xs text-purple-600">
              <Wallet className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Available Balance</span>
            <h3 className="text-3xl font-black text-gray-900 mt-1 flex items-center gap-1.5">
              <span className="text-purple-600">₹</span>{luckyBalance}
            </h3>
            <p className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 border border-emerald-100">100% Usable on Checkout</p>
          </div>

          {/* Quick Info rules list */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs mb-5">
            <h4 className="text-xs font-black text-gray-800 border-b border-gray-50 pb-2 mb-3">How to earn and spend Balance?</h4>
            <ul className="space-y-3.5 text-[11px] font-medium text-gray-500">
              <li className="flex gap-2.5 items-start">
                <span className="bg-purple-100 text-purple-600 w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0">1</span>
                <p>Refer friends via the **Refer & Earn** portal. Every verified sign-up wins you custom scratch card rewards of up to ₹150.</p>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="bg-purple-100 text-purple-600 w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0">2</span>
                <p>QueKart Balance is applied **automatically** at checkout to deduct order costs. No promo code input required!</p>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="bg-purple-100 text-purple-600 w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0">3</span>
                <p>Coins can also be won by sharing product reviews and leaving detailed ratings with photos of items.</p>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 10. Become a Supplier Onboarding Step Wizard */}
      {activeSubPage === 'become-supplier' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="become-supplier-subpage">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Supplier Portal</h2>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-3 gap-2.5 mb-6 text-center text-[10px] font-bold">
            <div className={`pb-2 border-b-2 ${supplierStep >= 1 ? 'border-lucky-magenta text-lucky-magenta' : 'border-gray-200 text-gray-400'}`}>1. GSTIN Check</div>
            <div className={`pb-2 border-b-2 ${supplierStep >= 2 ? 'border-lucky-magenta text-lucky-magenta' : 'border-gray-200 text-gray-400'}`}>2. Store setup</div>
            <div className={`pb-2 border-b-2 ${supplierStep >= 3 ? 'border-lucky-magenta text-lucky-magenta' : 'border-gray-200 text-gray-400'}`}>3. Verification</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs">
            {supplierStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-lucky-magenta mx-auto mb-2" />
                  <h3 className="text-sm font-black text-gray-800">Verify your Business GSTIN</h3>
                  <p className="text-[10px] text-gray-400 mt-1">To sell items on QueKart at 0% Commission fees</p>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Enter 15-Digit GSTIN</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 07AAAAA1111A1Z1" 
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value.toUpperCase())}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 uppercase focus:outline-none focus:border-lucky-magenta"
                  />
                </div>

                <button 
                  onClick={() => {
                    if (supplierGstin.length < 10) {
                      triggerToast("Please enter a valid 15-digit GSTIN number!");
                      return;
                    }
                    setSupplierStep(2);
                    triggerToast("GSTIN Verified! Setup your shop name next.");
                  }}
                  className="w-full bg-lucky-magenta text-white font-extrabold text-xs py-2.5 rounded-lg shadow-md cursor-pointer"
                >
                  Verify GSTIN & Continue
                </button>
              </div>
            )}

            {supplierStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center">
                  <Store className="w-12 h-12 text-lucky-magenta mx-auto mb-2" />
                  <h3 className="text-sm font-black text-gray-800">Choose your Shop Details</h3>
                  <p className="text-[10px] text-gray-400 mt-1">This name will be visible on product pages</p>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Shop Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Gaurav Handlooms" 
                    value={supplierShopName}
                    onChange={(e) => setSupplierShopName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Operating State</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rajasthan" 
                    value={supplierState}
                    onChange={(e) => setSupplierState(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-lucky-magenta"
                  />
                </div>

                <button 
                  onClick={() => {
                    if (!supplierShopName || !supplierState) {
                      triggerToast("Please fill in both fields!");
                      return;
                    }
                    setSupplierStep(3);
                    triggerToast("Shop details linked successfully.");
                  }}
                  className="w-full bg-lucky-magenta text-white font-extrabold text-xs py-2.5 rounded-lg shadow-md cursor-pointer"
                >
                  Save Store Details
                </button>
              </div>
            )}

            {supplierStep === 3 && (
              <div className="space-y-4 text-center animate-fadeIn">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-black text-gray-800">Onboarding Completed!</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Your application to become a merchant partner is under review. Our operations manager will activate your dashboard within 2 hours.</p>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-left text-[11px] font-semibold space-y-1">
                  <p>● **Shop Name:** {supplierShopName}</p>
                  <p>● **GSTIN Verified:** {supplierGstin}</p>
                  <p>● **Region:** {supplierState}</p>
                </div>

                <button 
                  onClick={() => {
                    setIsSupplierVerified(true);
                    setActiveSubPage(null);
                    setSupplierStep(1);
                    triggerToast("Supplier account initiated! 🎉");
                  }}
                  className="w-full bg-lucky-magenta text-white font-extrabold text-xs py-2.5 rounded-lg shadow-md cursor-pointer"
                >
                  Return to Account View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. Settings & Custom Simulation Toggles Sub-Page */}
      {activeSubPage === 'settings' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="settings-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Settings</h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden divide-y divide-gray-50">
            {/* push toggles */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Push Notifications</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Receive deals & catalog alerts</p>
              </div>
              <button 
                onClick={() => setPushNotif(!pushNotif)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${pushNotif ? 'bg-lucky-magenta' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushNotif ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* sms updates */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Order SMS Updates</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Shipment transit status messages</p>
              </div>
              <button 
                onClick={() => setSmsNotif(!smsNotif)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${smsNotif ? 'bg-lucky-magenta' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${smsNotif ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* whatsapp updates */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">WhatsApp Alerts</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Receive discount codes and tracking details</p>
              </div>
              <button 
                onClick={() => setWhatsappNotif(!whatsappNotif)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${whatsappNotif ? 'bg-lucky-magenta' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${whatsappNotif ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Simulated Twilight Theme */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Twilight Night Mode</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Simulate eye-safe low light layout</p>
              </div>
              <button 
                onClick={() => {
                  setSimulatedTwilightTheme(!simulatedTwilightTheme);
                  triggerToast(simulatedTwilightTheme ? "Restored light mode theme!" : "Twilight theme simulation activated! 🌓");
                }}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${simulatedTwilightTheme ? 'bg-lucky-magenta' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${simulatedTwilightTheme ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Quick checkout */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Save Details for Quick Checkout</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Saves address and linked UPI ID</p>
              </div>
              <button 
                onClick={() => setQuickCheckout(!quickCheckout)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${quickCheckout ? 'bg-lucky-magenta' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${quickCheckout ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              setActiveSubPage(null);
              triggerToast("All settings saved successfully! ✅");
            }}
            className="w-full mt-5 bg-lucky-magenta text-white font-extrabold text-xs py-3 rounded-lg shadow-md hover:bg-opacity-95 cursor-pointer text-center"
          >
            Confirm & Save Settings
          </button>
        </div>
      )}

      {/* 12. Rate Lucky Stars and Review Sub-Page */}
      {activeSubPage === 'rate-lucky' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="rate-lucky-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Rate QueKart</h2>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-5 text-center flex flex-col items-center">
            <div>
              <h3 className="text-sm font-black text-gray-800">How would you rate your experience?</h3>
              <p className="text-[10px] text-gray-400 mt-1">We read all reviews to improve our delivery speeds!</p>
            </div>

            {/* Interactive Stars Row */}
            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4, 5].map(starNum => {
                const isActive = starNum <= reviewStars;
                return (
                  <button 
                    key={starNum}
                    onClick={() => setReviewStars(starNum)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125"
                  >
                    <Star className={`w-8 h-8 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick feedback tags */}
            <div className="w-full">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2 text-left">Highlight features</span>
              <div className="flex flex-wrap gap-2">
                {reviewTagsList.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(prev => prev.filter(t => t !== tag));
                        } else {
                          setSelectedTags(prev => [...prev, tag]);
                        }
                      }}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-pink-50 border-lucky-magenta text-lucky-magenta scale-105 shadow-2xs' 
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed feedback text block */}
            <div className="w-full">
              <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1 text-left">Detailed Review (Optional)</label>
              <textarea 
                rows={3}
                placeholder="Share your experience using QueKart..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-xs font-semibold focus:outline-none focus:border-lucky-magenta bg-gray-50/50"
              />
            </div>

            <button 
              onClick={() => {
                if (reviewStars === 0) {
                  triggerToast("Please select at least 1 star before submitting!");
                  return;
                }
                setActiveSubPage(null);
                setReviewStars(0);
                setReviewComment("");
                setSelectedTags([]);
                triggerToast("Thank you for your rating & feedback! ❤️");
              }}
              className="w-full bg-lucky-magenta text-white font-extrabold text-xs py-2.5 rounded-lg shadow-md cursor-pointer transition-transform active:scale-98"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* 13. Legal & Policies Sub-Page */}
      {activeSubPage === 'legal-policies' && (
        <div className="animate-slideIn px-4 py-4 max-w-md mx-auto" id="legal-policies-subpage">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setActiveSubPage(null)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h2 className="text-base font-extrabold tracking-wide uppercase">Legal & Policies</h2>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs space-y-4" id="legal-content">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5 uppercase">
                <FileText className="w-4 h-4 text-lucky-magenta" />
                <span>1. Terms & Conditions</span>
              </h3>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium mt-1.5">Welcome to QueKart. By using our website and application, you agree to comply with our commercial terms of service. Products are sold directly by verified independent supplier merchants at 0% Commission charges.</p>
            </div>

            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>2. Return and Refund Policy</span>
              </h3>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium mt-1.5">QueKart supports a direct **7-day return policy** on 100% of standard products. Items must be returned in their original packaging and verified during return courier pickup. Refund is processed instantly into your linked bank account or UPI ID.</p>
            </div>

            <div>
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5 uppercase">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                <span>3. Anti-Counterfeiting Rules</span>
              </h3>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium mt-1.5">Independent suppliers are strictly forbidden from selling duplicate, counterfeit, or misleading brands. Any supplier failing our quality checks is permanently blacklisted, and 100% compensation is credited to the affected customer.</p>
            </div>
          </div>
        </div>
      )}


      {/* ==================== C. OVERLAYS AND GLOBAL CONFIRMATION POPUPS ==================== */}
      
      {/* Logout Confirmation Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" id="logout-confirm-overlay">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-lg border border-gray-100 text-center animate-scaleIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <LogOut className="w-6 h-6 stroke-[2]" />
            </div>
            
            <div>
              <h3 className="text-sm font-black text-gray-900">Are you sure you want to log out?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">This will clear your local cached orders and active shopping cart.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1.5">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-extrabold py-2.5 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                No, Keep me in
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  onBack();
                  triggerToast("Logged out successfully! Resetting session.");
                }}
                className="bg-lucky-magenta text-white hover:bg-opacity-95 text-xs font-black py-2.5 rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
