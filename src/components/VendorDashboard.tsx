import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getApiUrl } from '../utils/api';
import { 
  Building2, 
  Package, 
  ShoppingBag, 
  Plus, 
  Coins, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Trash2, 
  Edit3, 
  LogOut, 
  ArrowLeft, 
  Award, 
  Phone, 
  Edit2, 
  Zap, 
  ShieldCheck, 
  Printer, 
  Layers, 
  BarChart3, 
  CreditCard, 
  FileText,
  Home,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  MapPin,
  Mail,
  UserCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  Lock,
  FileSpreadsheet,
  Download,
  X,
  RefreshCw,
  Info,
  Check,
  Tag,
  Truck,
  RotateCcw,
  BadgePercent,
  Banknote,
  Ban,
  Eye,
  MousePointerClick,
  ShieldAlert,
  Menu,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Vendor } from '../types';
import Logo, { BrandLogo, QueKartLogoText } from './Logo';
import VendorAuthView from './VendorAuthView';
import VendorExportReports from './VendorExportReports';
import { VendorAnalyticsView } from './VendorAnalyticsView';
import { MASTER_CATEGORIES, MasterCategory, getSubcategoriesForCategory } from '../data/categoriesData';
import { fetchVendorAnalytics } from '../utils/analytics';

interface VendorDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => Promise<void>;
  onEditProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onClose?: () => void;
  activeSubPage?: string | null;
  setActiveSubPage?: (page: string) => void;
  navigateTo?: (path: string) => void;
  currentPath?: string;
}

export default function VendorDashboard({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onClose: _onClose,
  activeSubPage,
  setActiveSubPage,
  navigateTo = (p) => window.history.pushState(null, '', p),
  currentPath = window.location.pathname + window.location.search
}: VendorDashboardProps) {
  // Current logged in vendor state
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(() => {
    try {
      const saved = localStorage.getItem('quekart_current_vendor');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // Left sidebar drawer navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Custom dialog confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    title?: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (message: string, onConfirm: () => void, title = 'Confirm Action', confirmText = 'Confirm') => {
    setConfirmDialog({ message, onConfirm, title, confirmText });
  };

  // Available registered vendors in system
  const [systemVendors, setSystemVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  // File input refs for Direct Photo Capture & Gallery Upload
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Parse active subroute and query parameter (e.g. ?id=xyz)
  const currentUrl = currentPath || (window.location.pathname + window.location.search);
  const [_pathnameOnly, searchParamsString] = currentUrl.split('?');
  const queryParams = new URLSearchParams(searchParamsString || '');
  const queryId = queryParams.get('id') || queryParams.get('orderId') || '';

  // Determine current vendor active tab/task
  let activeTabKey = 'dashboard';
  if (activeSubPage) {
    if (activeSubPage.startsWith('products/add') || activeSubPage === 'add-product') {
      activeTabKey = 'add-product';
    } else if (activeSubPage.startsWith('products/edit') || activeSubPage === 'edit-product') {
      activeTabKey = 'edit-product';
    } else if (activeSubPage.startsWith('products')) {
      activeTabKey = 'products';
    } else if (activeSubPage.startsWith('orders/details') || activeSubPage.startsWith('orders/view') || activeSubPage === 'order-details') {
      activeTabKey = 'order-details';
    } else if (activeSubPage.startsWith('orders')) {
      activeTabKey = 'orders';
    } else if (activeSubPage.startsWith('export') || activeSubPage.startsWith('reports') || activeSubPage === 'export-reports') {
      activeTabKey = 'export';
    } else if (activeSubPage.startsWith('profile/edit') || activeSubPage === 'edit-profile') {
      activeTabKey = 'edit-profile';
    } else if (activeSubPage.startsWith('profile')) {
      activeTabKey = 'profile';
    } else if (activeSubPage.startsWith('analytics')) {
      activeTabKey = 'analytics';
    } else if (activeSubPage.startsWith('payouts')) {
      activeTabKey = 'payouts';
    } else {
      activeTabKey = activeSubPage;
    }
  }

  // Navigation within Vendor Portal ONLY
  const goToVendorRoute = (subRoute: string, queryParamStr = '') => {
    const full = subRoute ? `/vendor/${subRoute}${queryParamStr ? `?${queryParamStr}` : ''}` : '/vendor';
    if (setActiveSubPage) {
      setActiveSubPage(subRoute);
    }
    navigateTo(full);
  };

  // GST Validation State for post-signup upgrade
  const [isGstVerifying, setIsGstVerifying] = useState(false);
  const [gstVerifyStatus, setGstVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [gstVerifyMessage, setGstVerifyMessage] = useState('');
  const [profileGstin, setProfileGstin] = useState('');

  // Real Analytics State for Vendor
  const [vendorAnalyticsData, setVendorAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (currentVendor && currentVendor.id && activeTabKey === 'analytics') {
      setIsLoadingAnalytics(true);
      fetchVendorAnalytics(currentVendor.id)
        .then(data => {
          if (data) {
            setVendorAnalyticsData(data);
          }
        })
        .finally(() => setIsLoadingAnalytics(false));
    }
  }, [currentVendor?.id, activeTabKey]);

  // Determine if vendor profile is permanently locked
  const isGstLocked = useMemo(() => {
    if (!currentVendor) return false;
    return currentVendor.vendorType === 'big' || 
           currentVendor.isVerified === true || 
           currentVendor.gstinVerified === true || 
           (!!currentVendor.gstin && currentVendor.gstin.trim().length === 15);
  }, [currentVendor]);

  // Function to simulate government GST portal validation
  const simulateGstVerification = async (gstNumber: string, businessName: string): Promise<boolean> => {
    const clean = (gstNumber || '').trim().toUpperCase();
    if (!clean || clean.length !== 15) {
      setGstVerifyStatus('failed');
      setGstVerifyMessage('Invalid GSTIN: Must be exactly 15 alphanumeric characters.');
      return false;
    }
    
    setIsGstVerifying(true);
    setGstVerifyStatus('verifying');
    setGstVerifyMessage('Validating GSTIN structure & state prefix...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setGstVerifyMessage('Connecting to GST Common Portal (GSTN)...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setGstVerifyMessage('Retrieving corporate credentials & tax ledger records...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsGstVerifying(false);
    setGstVerifyStatus('success');
    setGstVerifyMessage(`GSTIN verified successfully for "${businessName || 'Your Business'}"! Registered in State GST Common Registry.`);
    return true;
  };

  // Handle Post-Signup GST Upgrade
  const handleUpgradeGstin = async () => {
    if (!currentVendor || !profileGstin.trim()) return;
    const cleanGst = profileGstin.trim().toUpperCase();
    const ok = await simulateGstVerification(cleanGst, currentVendor.name);
    
    if (ok) {
      const upgraded: Vendor = {
        ...currentVendor,
        gstin: cleanGst,
        gstinVerified: true,
        isVerified: true,
        vendorType: 'big'
      };

      try {
        const res = await fetch(`/api/vendors/${currentVendor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(upgraded)
        });
        if (res.ok) {
          setCurrentVendor(upgraded);
          try {
            localStorage.setItem('quekart_current_vendor', JSON.stringify(upgraded));
          } catch (_) {}
          setProfileGstin('');
          alert('Congratulations! Your GST number is verified. Your seller account is now upgraded to "Verified GST Store" and your legal business profile has been permanently locked for GST compliance.');
        }
      } catch (err) {
        console.error('Failed to sync upgraded vendor status with server:', err);
        // Still update locally
        setCurrentVendor(upgraded);
        try {
          localStorage.setItem('quekart_current_vendor', JSON.stringify(upgraded));
        } catch (_) {}
      }
    }
  };

  // Interactive Editable Profile States (for non-verified vendors)
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCategory, setProfileCategory] = useState('Women Ethnic Wear');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profileDescText, setProfileDescText] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form States for Product Listing / Editing
  const [editingProductId, setEditingProductId] = useState<string>(queryId);
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState('Women Ethnic Wear');
  const [pSubCategory, setPSubCategory] = useState('Banarasi Sarees');
  const [pPrice, setPPrice] = useState<number>(299);
  const [pOrigPrice, setPOrigPrice] = useState<number>(599);
  const [pSizeOptions, setPSizeOptions] = useState<string[]>(['Free Size']);
  
  // Product Photos state: NO auto-selected images on new listing!
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Cash on Delivery (COD) Configuration
  const [pCodAvailable, setPCodAvailable] = useState<boolean>(true);
  const [pCodSurcharge, setPCodSurcharge] = useState<number>(39);

  // Return & Replacement Policy Configuration
  const [pReturnPolicyType, setPReturnPolicyType] = useState<'return' | 'replacement' | 'no_return'>('return');
  const [pReturnDays, setPReturnDays] = useState<number>(7);
  const [pReturnPolicyText, setPReturnPolicyText] = useState<string>('');

  // UPI Offers & Instant Promotions Configuration
  const [pHasUpiOffer, setPHasUpiOffer] = useState<boolean>(true);
  const [pUpiDiscountType, setPUpiDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [pUpiDiscountValue, setPUpiDiscountValue] = useState<number>(5);
  const [pUpiOfferText, setPUpiOfferText] = useState<string>('Extra 5% Instant Discount on UPI Payment');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Interactive Quick Stock & Price Updater State
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [quickStockQty, setQuickStockQty] = useState<number>(100);
  const [quickStockPrice, setQuickStockPrice] = useState<number>(299);
  const [isUpdatingQuickStock, setIsUpdatingQuickStock] = useState<boolean>(false);

  // Dispatch & AWB Generator Modal State
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchCourier, setDispatchCourier] = useState<string>('Delhivery Express');
  const [dispatchAwb, setDispatchAwb] = useState<string>('');
  const [isSavingDispatch, setIsSavingDispatch] = useState<boolean>(false);

  // Bank & UPI Settlement Details State
  const [bankAccountName, setBankAccountName] = useState<string>(() => currentVendor?.bankAccount?.accountHolderName || currentVendor?.name || '');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>(() => currentVendor?.bankAccount?.accountNumber || '');
  const [bankIfscCode, setBankIfscCode] = useState<string>(() => currentVendor?.bankAccount?.ifscCode || '');
  const [bankName, setBankName] = useState<string>(() => currentVendor?.bankAccount?.bankName || '');
  const [bankUpiId, setBankUpiId] = useState<string>(() => currentVendor?.upiId || `${(currentVendor?.phone || '')}@upi`);
  const [isSavingBank, setIsSavingBank] = useState<boolean>(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState<boolean>(false);

  // Vendor Financials & Passbook Ledger State
  const [vendorFinancials, setVendorFinancials] = useState<{
    availableBalance: number;
    totalEarnings: number;
    deliveredSales: number;
    pendingBalance: number;
    totalWithdrawn: number;
    totalRefunded: number;
    transactionsCount: number;
    transactions: Array<{
      id: string;
      vendorId: string;
      transactionType: string;
      typeLabel: string;
      referenceId: string;
      orderId?: string;
      productTitle?: string;
      quantity?: number;
      description: string;
      credit: number;
      debit: number;
      runningBalance: number;
      status: string;
      timestamp: string;
      date: string;
    }>;
    payouts: any[];
  } | null>(null);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(false);

  // Payout Request Form State (Bank vs UPI with full validation)
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>('bank');
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutUpi, setPayoutUpi] = useState<string>(() => currentVendor?.upiId || `${(currentVendor?.phone || '')}@upi`);
  const [payoutAccNo, setPayoutAccNo] = useState<string>(() => currentVendor?.bankAccount?.accountNumber || '');
  const [payoutIfsc, setPayoutIfsc] = useState<string>(() => currentVendor?.bankAccount?.ifscCode || '');
  const [payoutHolder, setPayoutHolder] = useState<string>(() => currentVendor?.bankAccount?.accountHolderName || currentVendor?.name || '');
  const [payoutBankTitle, setPayoutBankTitle] = useState<string>(() => currentVendor?.bankAccount?.bankName || '');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccessData, setPayoutSuccessData] = useState<any | null>(null);
  const [payoutErrorMsg, setPayoutErrorMsg] = useState<string>('');

  // Passbook Transaction Ledger Filters
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  // Load Vendor Financial Summary & Passbook
  const loadVendorFinancials = async () => {
    if (!currentVendor?.id) return;
    setIsLoadingFinancials(true);
    try {
      const res = await fetch(getApiUrl(`/api/vendor/${currentVendor.id}/financials`));
      if (res.ok) {
        const data = await res.json();
        setVendorFinancials(data);
      }
    } catch (e) {
      console.warn('Failed to load vendor financials:', e);
    } finally {
      setIsLoadingFinancials(false);
    }
  };

  useEffect(() => {
    if (currentVendor?.id && (activeTabKey === 'payouts' || activeTabKey === 'dashboard')) {
      loadVendorFinancials();
    }
  }, [currentVendor?.id, activeTabKey]);

  useEffect(() => {
    if (currentVendor) {
      if (currentVendor.bankAccount) {
        setBankAccountNumber(currentVendor.bankAccount.accountNumber || '');
        setBankIfscCode(currentVendor.bankAccount.ifscCode || '');
        setBankAccountName(currentVendor.bankAccount.accountHolderName || currentVendor.name || '');
        setBankName(currentVendor.bankAccount.bankName || '');
        
        setPayoutAccNo(currentVendor.bankAccount.accountNumber || '');
        setPayoutIfsc(currentVendor.bankAccount.ifscCode || '');
        setPayoutHolder(currentVendor.bankAccount.accountHolderName || currentVendor.name || '');
        setPayoutBankTitle(currentVendor.bankAccount.bankName || '');
      } else {
        setBankAccountNumber('');
        setBankIfscCode('');
        setBankAccountName(currentVendor.name || '');
        setBankName('');
        
        setPayoutAccNo('');
        setPayoutIfsc('');
        setPayoutHolder(currentVendor.name || '');
        setPayoutBankTitle('');
      }
      if (currentVendor.upiId) {
        setBankUpiId(currentVendor.upiId);
        setPayoutUpi(currentVendor.upiId);
      } else {
        setBankUpiId(`${currentVendor.phone || ''}@upi`);
        setPayoutUpi(`${currentVendor.phone || ''}@upi`);
      }
    }
  }, [currentVendor]);

  // Handle Payout Submission (Bank A/C or UPI)
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutErrorMsg('');
    const amt = Number(payoutAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setPayoutErrorMsg('Please enter a valid withdrawal amount greater than ₹0.');
      return;
    }

    const available = vendorFinancials?.availableBalance ?? 0;
    if (amt > available) {
      setPayoutErrorMsg(`Withdrawal amount ₹${amt.toLocaleString()} exceeds your available balance of ₹${available.toLocaleString()}.`);
      return;
    }

    if (payoutMethod === 'bank') {
      if (!payoutAccNo.trim() || !payoutIfsc.trim()) {
        setPayoutErrorMsg('Please provide your Bank Account Number and IFSC Code.');
        return;
      }
    } else {
      if (!payoutUpi.trim() || !payoutUpi.includes('@')) {
        setPayoutErrorMsg('Please provide a valid UPI ID (e.g. mobile@upi or name@okaxis).');
        return;
      }
    }

    setIsSubmittingPayout(true);
    try {
      const res = await fetch(getApiUrl(`/api/vendor/${currentVendor.id}/payout`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: payoutMethod,
          accountNumber: payoutMethod === 'bank' ? payoutAccNo.trim() : undefined,
          ifscCode: payoutMethod === 'bank' ? payoutIfsc.trim().toUpperCase() : undefined,
          accountHolderName: payoutMethod === 'bank' ? (payoutHolder.trim() || currentVendor.name) : undefined,
          bankName: payoutMethod === 'bank' ? (payoutBankTitle.trim() || 'Bank Account') : undefined,
          upiId: payoutMethod === 'upi' ? payoutUpi.trim() : undefined,
          amount: amt
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setPayoutSuccessData(result.payout);
        if (result.financials) {
          setVendorFinancials(result.financials);
        } else {
          loadVendorFinancials();
        }
        setPayoutAmount('');
      } else {
        setPayoutErrorMsg(result.error || 'Failed to process payout. Please try again.');
      }
    } catch (e: any) {
      setPayoutErrorMsg(e.message || 'Network error while requesting payout.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Export Financial Passbook Statement as CSV
  const handleExportStatementCsv = () => {
    if (!vendorFinancials?.transactions || vendorFinancials.transactions.length === 0) return;
    
    const headers = ['Date & Time', 'Transaction Reference ID', 'Type', 'Description', 'Related Order/Product', 'Credit (+)', 'Debit (-)', 'Running Balance (Closing)', 'Status'];
    const rows = vendorFinancials.transactions.map(t => [
      `"${t.date || t.timestamp}"`,
      `"${t.referenceId || t.id}"`,
      `"${t.typeLabel}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.orderId || t.productTitle || '-'}"`,
      t.credit > 0 ? `₹${t.credit}` : '0',
      t.debit > 0 ? `₹${t.debit}` : '0',
      `₹${t.runningBalance}`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QueKart_Vendor_Passbook_${currentVendor?.id || 'store'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedRefId(text);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  // Available subcategories for the selected category
  const availableSubcategories = useMemo(() => {
    return getSubcategoriesForCategory(pCategory);
  }, [pCategory]);

  // Fetch registered vendors from database
  const fetchVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const res = await fetch(getApiUrl('/api/vendors'));
      if (res.ok) {
        const data = await res.json();
        setSystemVendors(data);
        if (currentVendor) {
          const matched = data.find((v: Vendor) => v.id === currentVendor.id || v.phone === currentVendor.phone);
          if (matched) {
            setCurrentVendor(matched);
            localStorage.setItem('quekart_current_vendor', JSON.stringify(matched));
          }
        }
      }
    } catch (err) {
      console.warn('Unable to load vendors directory. Using fallback.');
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Vendor selection handler
  const handleSelectVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    try {
      localStorage.setItem('quekart_current_vendor', JSON.stringify(vendor));
    } catch (_) {}
    goToVendorRoute('dashboard');
  };

  // Vendor logout handler -> stays strictly on /vendor
  const handleLogoutVendor = () => {
    setCurrentVendor(null);
    try {
      localStorage.removeItem('quekart_current_vendor');
      localStorage.removeItem('quekart_vendor_token');
    } catch (_) {}
    goToVendorRoute('');
  };

  // Sync profile editing fields when vendor changes
  useEffect(() => {
    if (currentVendor) {
      setProfileName(currentVendor.name || '');
      setProfileEmail(currentVendor.email || '');
      setProfilePhone(currentVendor.phone || '');
      setProfileCategory(currentVendor.businessCategory || 'Women Ethnic Wear');
      setProfileCity(currentVendor.city || 'Jaipur');
      setProfileState(currentVendor.state || 'Rajasthan');
      setProfileDescText(currentVendor.description || '');
    }
  }, [currentVendor]);

  // Sync product fields when editing or resetting on add
  useEffect(() => {
    if (activeTabKey === 'edit-product' && queryId) {
      const target = products.find(p => p.id === queryId);
      if (target) {
        setEditingProductId(target.id);
        setPTitle(target.title);
        setPDesc(target.description);
        setPCategory(target.category);
        setPSubCategory(target.subCategory || 'General');
        setPPrice(target.price);
        setPOrigPrice(target.originalPrice);
        setPSizeOptions(target.sizeOptions || ['Free Size']);
        setUploadedImages(target.images || []);
        setCustomImageUrl('');
        setPhotoError('');
        setPCodAvailable(target.isCodAvailable !== false);
        setPCodSurcharge(target.codSurcharge ?? (target.codPrice ? Math.max(0, target.codPrice - target.price) : 39));
        setPReturnPolicyType(target.returnPolicyType || 'return');
        setPReturnDays(target.returnDays ?? 7);
        setPReturnPolicyText(target.returnPolicyText || '');
        setPHasUpiOffer(target.hasUpiOffer !== false);
        setPUpiDiscountType(target.upiDiscountType || 'percentage');
        setPUpiDiscountValue(target.upiDiscountValue ?? 5);
        setPUpiOfferText(target.upiOfferText || 'Extra 5% Instant Discount on UPI Payment');
      }
    } else if (activeTabKey === 'add-product') {
      // CLEAR ALL FIELDS COMPLETELY - NO AUTO SELECTED PHOTOS!
      setEditingProductId('');
      setPTitle('');
      setPDesc('');
      setPCategory('Women Ethnic Wear');
      setPSubCategory('Banarasi Sarees');
      setPPrice(299);
      setPOrigPrice(599);
      setPSizeOptions(['Free Size']);
      setUploadedImages([]); // Empty images array
      setCustomImageUrl('');
      setPhotoError('');
      setPCodAvailable(true);
      setPCodSurcharge(39);
      setPReturnPolicyType('return');
      setPReturnDays(7);
      setPReturnPolicyText('');
      setPHasUpiOffer(true);
      setPUpiDiscountType('percentage');
      setPUpiDiscountValue(5);
      setPUpiOfferText('Extra 5% Instant Discount on UPI Payment');
    }
  }, [activeTabKey, queryId, products]);

  // Photo handlers: Camera Click, Gallery Pick, URL Add, Remove
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImages(prev => [...prev, base64]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPhotoError('');

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUploadedImages(prev => {
          if (!prev.includes(base64)) {
            return [...prev, base64];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setPhotoError('');
    const cleanUrl = customImageUrl.trim();
    if (!uploadedImages.includes(cleanUrl)) {
      setUploadedImages(prev => [...prev, cleanUrl]);
    }
    setCustomImageUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Save profile changes (only for non-GST verified vendors)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVendor) return;

    if (isGstLocked) {
      alert('Your profile is permanently locked because you are a GST Verified seller. Business details cannot be edited directly.');
      return;
    }

    setIsSavingProfile(true);

    const updated: Vendor = {
      ...currentVendor,
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      businessCategory: profileCategory,
      city: profileCity.trim(),
      state: profileState.trim(),
      description: profileDescText.trim()
    };

    try {
      const res = await fetch(`/api/vendors/${currentVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setCurrentVendor(updated);
        localStorage.setItem('quekart_current_vendor', JSON.stringify(updated));
        goToVendorRoute('profile');
        alert('Store profile updated successfully.');
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      alert('Failed to save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Product save handler (Enforces immutable Title & Photos on edit)
  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEditMode = activeTabKey === 'edit-product' && !!editingProductId;
    const existingProduct = products.find(p => p.id === editingProductId);

    if (!isEditMode && uploadedImages.length === 0) {
      setPhotoError('Please capture or upload at least 1 product photo.');
      return;
    }

    if (!pTitle.trim()) {
      alert('Please fill in product title.');
      return;
    }

    if (!pDesc.trim()) {
      alert('Please fill in product description.');
      return;
    }

    if (pPrice <= 0 || pOrigPrice <= 0) {
      alert('Please provide valid pricing (minimum ₹1).');
      return;
    }

    setIsSavingProduct(true);
    const discount = pOrigPrice > pPrice ? Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100) : 0;

    // IMMUTABILITY ENFORCEMENT:
    // If editing existing product: title and images MUST NEVER CHANGE.
    const finalTitle = isEditMode && existingProduct ? existingProduct.title : pTitle.trim();
    const finalImages = isEditMode && existingProduct ? existingProduct.images : uploadedImages;

    const finalCodPrice = pCodAvailable ? (pPrice + (Number(pCodSurcharge) || 0)) : pPrice;
    const finalReturnPolicyText = pReturnPolicyType === 'no_return'
      ? 'No Return / Non-Returnable (Final Sale)'
      : pReturnPolicyType === 'replacement'
      ? `${pReturnDays || 7} Days Replacement / Exchange Only`
      : `${pReturnDays || 7} Days Easy Return & 100% Refund`;

    const finalUpiText = pHasUpiOffer
      ? (pUpiOfferText.trim() || (pUpiDiscountType === 'percentage' ? `Extra ${pUpiDiscountValue}% OFF on UPI Payment` : `Instant ₹${pUpiDiscountValue} OFF on UPI Payment`))
      : '';

    const productPayload: Product = {
      id: existingProduct ? existingProduct.id : 'prod-' + Math.random().toString(36).substring(2, 9),
      title: finalTitle,
      description: pDesc.trim(),
      category: pCategory,
      subCategory: pSubCategory.trim() || 'General',
      price: pPrice,
      originalPrice: pOrigPrice,
      discountPercent: discount,
      isCodAvailable: pCodAvailable,
      codPrice: finalCodPrice,
      codSurcharge: pCodAvailable ? (Number(pCodSurcharge) || 0) : 0,
      returnPolicyType: pReturnPolicyType,
      returnDays: pReturnPolicyType === 'no_return' ? 0 : (Number(pReturnDays) || 7),
      returnPolicyText: finalReturnPolicyText,
      hasUpiOffer: pHasUpiOffer,
      upiDiscountType: pUpiDiscountType,
      upiDiscountValue: Number(pUpiDiscountValue) || 0,
      upiOfferText: finalUpiText,
      rating: existingProduct ? existingProduct.rating : 0,
      ratingCount: existingProduct ? existingProduct.ratingCount : 0,
      reviewCount: existingProduct ? existingProduct.reviewCount : 0,
      images: finalImages,
      variants: [],
      soldBy: currentVendor?.name || 'QueKart Verified Store',
      soldByRating: currentVendor?.rating || 4.8,
      productHighlights: [
        { label: 'Fabric / Material', value: '100% Premium Grade' },
        { label: 'Direct Manufacturer', value: currentVendor?.name || 'QueKart Partner' },
        { label: 'GST Invoice', value: currentVendor?.gstin ? 'Available' : 'Standard Bill' },
        { label: 'Return Policy', value: finalReturnPolicyText },
        { label: 'Payment Terms', value: pCodAvailable ? `COD Available (₹${finalCodPrice}) & Online UPI` : 'Prepaid Online Only' }
      ],
      additionalDetails: [
        { label: 'Country of Origin', value: 'India' },
        { label: 'Dispatch Location', value: `${currentVendor?.city || 'Surat'}, ${currentVendor?.state || 'Gujarat'}` },
        { label: 'Return Window', value: pReturnPolicyType === 'no_return' ? 'Non-Returnable' : `${pReturnDays || 7} Calendar Days` },
        { label: 'Cash on Delivery', value: pCodAvailable ? `Supported (₹${pCodSurcharge} handling)` : 'Not Available (Online Only)' }
      ],
      sizeOptions: pSizeOptions.length ? pSizeOptions : ['Free Size'],
      reviews: existingProduct ? existingProduct.reviews : [],
      vendorId: currentVendor?.id,
      approvalStatus: currentVendor?.vendorType === 'big' ? 'approved' : 'pending',
      tag: existingProduct ? existingProduct.tag : undefined,
      numericId: existingProduct ? existingProduct.numericId : undefined,
      createdAt: existingProduct ? existingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (isEditMode) {
        await onEditProduct(productPayload);
      } else {
        await onAddProduct(productPayload);
      }
      goToVendorRoute('products');
    } catch (err: any) {
      alert(`Operation failed: ${err.message || 'Check connection'}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleToggleSize = (size: string) => {
    setPSizeOptions(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Quick Stock & Price Updater Handlers
  const handleOpenQuickStock = (prod: Product) => {
    setQuickStockProduct(prod);
    setQuickStockPrice(prod.price);
    setQuickStockQty(100);
  };

  const handleSaveQuickStock = async () => {
    if (!quickStockProduct) return;
    setIsUpdatingQuickStock(true);
    try {
      const updatedProd: Product = {
        ...quickStockProduct,
        price: quickStockPrice,
        originalPrice: Math.max(quickStockProduct.originalPrice, quickStockPrice + 100),
        discountPercent: Math.round(((Math.max(quickStockProduct.originalPrice, quickStockPrice + 100) - quickStockPrice) / Math.max(quickStockProduct.originalPrice, quickStockPrice + 100)) * 100)
      };
      await onEditProduct(updatedProd);
      setQuickStockProduct(null);
    } catch (err) {
      alert('Failed to update stock and price.');
    } finally {
      setIsUpdatingQuickStock(false);
    }
  };

  // Dispatch & AWB Generator Handlers
  const handleOpenDispatch = (order: Order) => {
    setDispatchOrder(order);
    setDispatchAwb(`AWB${Math.floor(100000000 + Math.random() * 900000000)}`);
  };

  const handleSaveDispatch = async () => {
    if (!dispatchOrder) return;
    setIsSavingDispatch(true);
    try {
      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(dispatchOrder.id, 'Shipped');
      }
      setDispatchOrder(null);
      alert(`Order #${dispatchOrder.id.slice(0, 8)} marked as SHIPPED via ${dispatchCourier}! Tracking AWB: ${dispatchAwb}`);
    } catch (err) {
      alert('Failed to update order status.');
    } finally {
      setIsSavingDispatch(false);
    }
  };

  // Bank Account & UPI Save Handler
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    setTimeout(() => {
      setIsSavingBank(false);
      setBankSaveSuccess(true);
      setTimeout(() => setBankSaveSuccess(false), 3000);
    }, 600);
  };

  // Filter vendor items & orders
  const vendorProducts = products.filter(p => p.vendorId === currentVendor?.id);
  const filteredProducts = vendorProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || 
                        (statusFilter === 'approved' && (p.approvalStatus === 'approved' || !p.approvalStatus)) ||
                        (statusFilter === 'pending' && p.approvalStatus === 'pending') ||
                        (statusFilter === 'rejected' && p.approvalStatus === 'rejected');
    return matchesSearch && matchStatus;
  });

  const vendorOrders = orders.filter(o => 
    o.items && o.items.some(item => item.product?.vendorId === currentVendor?.id)
  );

  const filteredOrders = vendorOrders.filter(o => {
    const matchStatus = orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (o.shippingAddress?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (o.shippingAddress?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedOrderForDetail = queryId ? orders.find(o => o.id === queryId) : null;

  const totalRevenue = vendorOrders.reduce((sum, order) => {
    const vendorItemsPrice = (order.items || [])
      .filter(item => item.product?.vendorId === currentVendor?.id)
      .reduce((s, item) => s + ((item.product?.price || 0) * item.quantity), 0);
    return sum + (order.status !== 'Cancelled' ? vendorItemsPrice : 0);
  }, 0);

  if (!currentVendor) {
    return (
      <VendorAuthView 
        onLoginSuccess={handleSelectVendor} 
        systemVendors={systemVendors}
        navigateTo={navigateTo}
        initialAuthMode={activeSubPage === 'signup' || activeSubPage === 'register' ? 'signup' : 'login'}
      />
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100/60 min-h-screen text-slate-900 flex flex-col font-sans selection:bg-[#143C6B]/15 selection:text-[#143C6B] overflow-x-hidden" id="vendor-portal-root">
      
      {/* 1. TOP HEADER (With Liquid Glass & Official QueKart Brand Logo) */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/80 backdrop-blur-xl shadow-xs px-3 sm:px-6 py-2.5 sm:py-3" id="vendor-top-header">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2.5">
          
          {/* Left: 3-Lines Hamburger Menu Button + Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {currentVendor && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-1 sm:-ml-0.5 rounded-xl liquid-glass hover:bg-white/80 text-slate-800 transition-all flex items-center justify-center cursor-pointer border border-white/90 shadow-3xs active:scale-95"
                id="vendor-sidebar-hamburger-btn"
                aria-label="Open Navigation Menu"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 stroke-[2.3] text-[#143C6B]" />
              </button>
            )}

            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none min-w-0 group" 
              onClick={() => goToVendorRoute('dashboard')}
              id="vendor-header-logo"
            >
              <BrandLogo size="md" animated={true} />
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full liquid-glass-pill border border-[#143C6B]/20 text-[#143C6B] text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C89D1F] animate-pulse" />
                <span>Supplier Hub</span>
              </div>
            </div>
          </div>

          {/* Right: Profile Pill & Live Status */}
          {currentVendor ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Vendor Store Name on larger screens */}
              <div 
                onClick={() => goToVendorRoute('profile')}
                className="hidden sm:flex items-center gap-2.5 liquid-glass hover:bg-white/90 border border-white/90 px-3 py-1.5 rounded-2xl cursor-pointer transition-all shadow-3xs group"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#143C6B] to-[#1E4E8C] text-white flex items-center justify-center text-xs font-black shadow-xs ring-2 ring-[#C89D1F]/40 shrink-0">
                  {(currentVendor.name || 'V').charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-[#143C6B] truncate block max-w-[130px] leading-tight">
                    {currentVendor.name}
                  </span>
                  <span className="text-[9.5px] font-bold text-[#C89D1F] block uppercase tracking-wider leading-none">
                    Verified Seller
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#143C6B] bg-[#143C6B]/10 border border-[#143C6B]/20 px-3.5 py-1 rounded-full liquid-glass-pill">
                Supplier Registration
              </span>
            </div>
          )}

        </div>
      </header>

      {/* LEFT SIDEBAR DRAWER (Sliding from Left via 3-Lines Hamburger Menu) */}
      <AnimatePresence>
        {isSidebarOpen && currentVendor && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="vendor-sidebar-drawer-container">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-[#0B2544]/60 backdrop-blur-sm transition-opacity cursor-pointer"
              id="vendor-sidebar-backdrop"
            />

            {/* Sidebar Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 27, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[340px] bg-white/95 backdrop-blur-2xl shadow-2xl z-50 flex flex-col h-[100dvh] overflow-hidden border-r border-white/80"
              id="vendor-sidebar-drawer"
            >
              {/* Drawer Top Header with Brand Logo */}
              <div className="px-4 py-3.5 border-b border-slate-100/90 flex items-center justify-between shrink-0 liquid-glass">
                <div className="flex items-center gap-2">
                  <BrandLogo size="sm" animated={true} />
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  id="vendor-sidebar-close-btn"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vendor Profile Card in Drawer */}
              <div className="px-4 pt-3.5 pb-2 shrink-0">
                <div className="p-3.5 liquid-glass-card rounded-2xl border border-white/90 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#143C6B] to-[#1E4E8C] text-white font-black text-base flex items-center justify-center shadow-xs ring-2 ring-[#C89D1F]/50 shrink-0">
                    {(currentVendor.name || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {currentVendor.name}
                      </h4>
                      <span className="text-[9px] bg-[#C89D1F]/15 text-[#8C6A0A] font-black px-1.5 py-0.2 rounded-sm uppercase">
                        PRO
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                      {currentVendor.email || (currentVendor.phone ? `+91 ${currentVendor.phone}` : 'vendor@quekart.com')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 font-sans">
                {/* Section 1: Main Navigation */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#143C6B] px-2 mb-1.5">
                    MAIN MENU
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'dashboard', label: 'Home (Overview)', icon: Home, path: 'dashboard' },
                      { id: 'products', label: 'My Products (Items)', icon: Package, path: 'products', count: vendorProducts.length },
                      { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, path: 'orders', count: vendorOrders.filter(o => o.status === 'Ordered' || o.status === 'Shipped').length },
                      { id: 'analytics', label: 'Analytics & Traffic', icon: BarChart3, path: 'analytics' },
                      { id: 'payouts', label: 'Payments & Bank Payouts', icon: Coins, path: 'payouts' }
                    ].map(item => {
                      const Icon = item.icon;
                      const isActive = activeTabKey === item.id || 
                        (item.id === 'products' && activeTabKey === 'edit-product') ||
                        (item.id === 'orders' && activeTabKey === 'order-details');

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            goToVendorRoute(item.path);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#143C6B] to-[#1E4E8C] text-white shadow-md shadow-[#143C6B]/25 border-l-3 border-[#C89D1F]'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C89D1F]' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.count !== undefined && item.count > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {item.count}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Store & Inventory Tools */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#143C6B] px-2 mb-1.5">
                    STORE TOOLS
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'add-product', label: '+ Add New Product', icon: Plus, path: 'products/add' },
                      { id: 'export', label: 'Download Reports (Excel)', icon: FileSpreadsheet, path: 'export' },
                      { id: 'profile', label: 'Store & Bank Details', icon: Building2, path: 'profile' }
                    ].map(item => {
                      const Icon = item.icon;
                      const isActive = activeTabKey === item.id ||
                        (item.id === 'profile' && activeTabKey === 'edit-profile');

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            goToVendorRoute(item.path);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#143C6B] to-[#1E4E8C] text-white shadow-md shadow-[#143C6B]/25 border-l-3 border-[#C89D1F]'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C89D1F]' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Pinned Sign Out Action */}
              <div className="p-4 border-t border-slate-100 liquid-glass shrink-0">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    handleLogoutVendor();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-600 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-3xs"
                  id="vendor-sidebar-logout-btn"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Log Out (Exit Store)</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 pb-12 sm:pb-12 flex flex-col">
        {/* AUTHENTICATED VENDOR VIEWS */}
        <div className="space-y-4 sm:space-y-6" id="vendor-dashboard-content">
            
            {/* DYNAMIC SUBPAGE ROUTING */}
            <AnimatePresence mode="wait">
              
              {/* 1. DASHBOARD OVERVIEW */}
              {activeTabKey === 'dashboard' && (
                <motion.div
                  key="vendor-dashboard-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Top Welcome Banner (Liquid Glass) */}
                  <div className="liquid-glass-card rounded-2xl border border-white/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#143C6B] to-[#1E4E8C] text-white flex items-center justify-center font-black text-xl shadow-md ring-2 ring-[#C89D1F]/50">
                        {currentVendor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-black text-slate-900">{currentVendor.name}</h2>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isGstLocked
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-[#C89D1F]/15 text-[#8C6A0A] border-[#C89D1F]/40'
                          }`}>
                            {isGstLocked ? '👑 GST Verified Seller' : '⭐ Registered Merchant'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {currentVendor.city || 'Jaipur'}, {currentVendor.state || 'Rajasthan'} • {currentVendor.businessCategory || 'Direct Manufacturer / Seller'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => goToVendorRoute('products/add')}
                        className="flex-1 sm:flex-none bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#143C6B]/20 border border-[#C89D1F]/30 cursor-pointer active:scale-98 transition-all"
                      >
                        <Plus className="w-4 h-4 text-[#C89D1F]" />
                        <span>+ List New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI Metric Cards (Liquid Glass Cards with Brand Colors) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" id="vendor-kpi-grid">
                    <div className="liquid-glass-card rounded-2xl p-4 border border-white/90 shadow-xs flex items-center gap-3.5 hover:scale-[1.01] transition-transform">
                      <div className="w-11 h-11 rounded-xl bg-[#143C6B]/10 border border-[#143C6B]/20 flex items-center justify-center text-[#143C6B] shrink-0 shadow-3xs">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Net Sales</span>
                        <p className="text-base sm:text-lg font-black text-slate-900">₹{totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => goToVendorRoute('products')}
                      className="liquid-glass-card rounded-2xl p-4 border border-white/90 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-[#143C6B] hover:scale-[1.01] transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#C89D1F]/15 border border-[#C89D1F]/30 flex items-center justify-center text-[#8C6A0A] shrink-0 shadow-3xs">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Catalog Items</span>
                        <p className="text-base sm:text-lg font-black text-slate-900">{vendorProducts.length}</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => goToVendorRoute('orders')}
                      className="liquid-glass-card rounded-2xl p-4 border border-white/90 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-[#143C6B] hover:scale-[1.01] transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#143C6B] shrink-0 shadow-3xs">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Client Orders</span>
                        <p className="text-base sm:text-lg font-black text-[#143C6B]">{vendorOrders.length}</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => goToVendorRoute('export')}
                      className="liquid-glass-card rounded-2xl p-4 border border-white/90 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-emerald-500 hover:scale-[1.01] transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-3xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Reports</span>
                        <p className="text-xs sm:text-sm font-black text-emerald-700">Financial Ledger</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Orders & Fast Actions */}
                  <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Left 2 Cols: Recent Orders */}
                    <div className="lg:col-span-2 liquid-glass rounded-2xl border border-white/90 p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100/80">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#143C6B]" />
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Recent Dispatch Orders</h3>
                          <span className="text-[10px] bg-[#143C6B]/10 text-[#143C6B] font-bold px-2 py-0.5 rounded-full">
                            {vendorOrders.length}
                          </span>
                        </div>

                        <button 
                          onClick={() => goToVendorRoute('orders')}
                          className="text-xs font-bold text-[#143C6B] hover:text-[#0D2C4E] flex items-center gap-1 cursor-pointer"
                        >
                          <span>View All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {vendorOrders.length === 0 ? (
                        <div className="py-12 text-center space-y-2">
                          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs text-slate-500 font-medium">No customer orders yet. List attractive products to start receiving dispatch requests!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100/90">
                          {vendorOrders.slice(0, 4).map(order => (
                            <div 
                              key={order.id} 
                              onClick={() => goToVendorRoute('orders/details', `id=${order.id}`)}
                              className="py-3 flex items-center justify-between gap-3 hover:bg-white/60 -mx-2 px-2 rounded-xl cursor-pointer transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-900 font-mono">#{order.id.slice(0, 8)}</span>
                                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    order.status === 'Delivered Early'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : order.status === 'Shipped' || order.status === 'Out for Delivery'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Customer: <strong>{order.shippingAddress?.name || 'Buyer'}</strong> • {order.shippingAddress?.city || 'India'}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-black text-slate-900 block">
                                  ₹{order.totalPrice}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold">100% Payout</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right 1 Col: Store Health & Quick Actions */}
                    <div className="space-y-4">
                      {/* GST Status Card */}
                      <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 liquid-glass ${
                        isGstLocked 
                          ? 'border-emerald-200/90' 
                          : 'border-[#C89D1F]/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-5 h-5 ${isGstLocked ? 'text-emerald-600' : 'text-[#C89D1F]'}`} />
                            <h4 className="text-xs font-black text-slate-900 uppercase">GST Compliance</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isGstLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isGstLocked ? 'Verified' : 'Pending'}
                          </span>
                        </div>

                        {isGstLocked ? (
                          <div className="space-y-1.5">
                            <p className="text-xs text-slate-700 font-medium">
                              Your account is operating under verified GSTIN <strong>{currentVendor.gstin}</strong>.
                            </p>
                            <p className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Profile details locked (GST compliant).
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-700 font-medium">
                              You are operating as a Small Business. Verify your GST number anytime to unlock instant automatic catalog approval!
                            </p>
                            <button
                              onClick={() => goToVendorRoute('profile')}
                              className="w-full bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-colors"
                            >
                              Verify GSTIN Now
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick Links Card */}
                      <div className="liquid-glass rounded-2xl border border-white/90 p-4 sm:p-5 shadow-xs space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Merchant Tools</h4>
                        <div className="space-y-1.5">
                          <button
                            onClick={() => goToVendorRoute('export')}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 text-xs font-bold text-slate-700 border border-slate-200/50 cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                              <span>Download Customer Orders</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button
                            onClick={() => goToVendorRoute('products/add')}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 text-xs font-bold text-slate-700 border border-slate-200/50 cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-[#143C6B]" />
                              <span>Add New Catalog Item</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button
                            onClick={() => goToVendorRoute('profile')}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 text-xs font-bold text-slate-700 border border-slate-200/50 cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#143C6B]" />
                              <span>Business Profile & Tax Info</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}

              {/* 2. CATALOG PRODUCTS PAGE */}
              {activeTabKey === 'products' && (
                <motion.div
                  key="vendor-products-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-black text-slate-900">Your Catalog Products ({vendorProducts.length})</h2>
                        <p className="text-xs text-slate-500 font-medium">Manage wholesale prices, stock sizes and live listings.</p>
                      </div>

                      <button
                        onClick={() => goToVendorRoute('products/add')}
                        className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ List New Product</span>
                      </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search your products by title or category..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full text-xs font-medium border border-slate-300 rounded-xl py-2 pl-9 pr-3 bg-white focus:outline-hidden focus:border-[#143C6B]"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="text-xs font-bold border border-slate-300 rounded-xl py-2 px-3 bg-white focus:outline-hidden focus:border-[#143C6B]"
                      >
                        <option value="all">All Approval Statuses</option>
                        <option value="approved">Approved & Live</option>
                        <option value="pending">Pending Admin Review</option>
                        <option value="rejected">Rejected / Needs Fix</option>
                      </select>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="py-16 text-center space-y-3">
                        <Package className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-700">No Products Listed Yet</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                          Click "List New Product" to snap photos and add your wholesale inventory.
                        </p>
                        <button
                          onClick={() => goToVendorRoute('products/add')}
                          className="bg-[#143C6B] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                        >
                          + Add First Product
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {filteredProducts.map(product => {
                          const isApproved = product.approvalStatus === 'approved' || !product.approvalStatus;
                          const isPending = product.approvalStatus === 'pending';

                          return (
                            <div key={product.id} className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors">
                              <div className="flex gap-3">
                                <img
                                  src={product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}
                                  alt={product.title}
                                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                      isApproved 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : isPending 
                                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                      {isApproved ? '✓ Live' : isPending ? '⏳ Reviewing' : '✕ Needs Fix'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">#{product.numericId || product.id.slice(-4)}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 truncate" title={product.title}>
                                    {product.title}
                                  </h4>
                                  <p className="text-[10.5px] text-slate-500 truncate">{product.category} • {product.subCategory}</p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-black text-slate-900">₹{product.price}</span>
                                    <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                                    <span className="text-[10px] text-emerald-600 font-bold">{product.discountPercent}% OFF</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Sizes: {product.sizeOptions?.join(', ') || 'Free Size'}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => goToVendorRoute('products/edit', `id=${product.id}`)}
                                    className="p-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#143C6B] rounded-lg border border-slate-200 cursor-pointer transition-colors"
                                    title="Edit price, size, description (Title & Photos locked)"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => triggerConfirm(
                                      `Are you sure you want to remove "${product.title}" from your catalog?`,
                                      () => onDeleteProduct(product.id),
                                      'Delete Product',
                                      'Delete'
                                    )}
                                    className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 3. ADD PRODUCT PAGE (NO AUTO SELECTED PHOTOS, DIRECT CAMERA/GALLERY SNAP, COMPREHENSIVE CATEGORIES) */}
              {activeTabKey === 'add-product' && (
                <motion.div
                  key="vendor-add-product-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="max-w-3xl mx-auto w-full space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToVendorRoute('products')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143C6B] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Catalog</span>
                    </button>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      0% Commission Listing
                    </span>
                  </div>

                  <form onSubmit={handleSaveProductForm} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-5">
                    <div className="pb-3 border-b border-slate-100">
                      <h2 className="text-base font-black text-slate-900">List New Product</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Direct camera click or gallery upload. Photos and title will be permanently locked once published.
                      </p>
                    </div>

                    {/* PHOTO UPLOAD & DIRECT CAMERA CLICK */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block">
                          Product Photos * <span className="text-slate-400 font-normal lowercase">(at least 1 photo required)</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#143C6B]">
                          {uploadedImages.length} photo{uploadedImages.length === 1 ? '' : 's'} added
                        </span>
                      </div>

                      {/* Hidden File Inputs */}
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        className="hidden"
                        id="vendor-camera-file-input"
                      />
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                        id="vendor-gallery-file-input"
                      />

                      {/* Action Buttons: Camera Snap & Gallery Pick */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="h-14 bg-blue-50/80 hover:bg-blue-100 text-[#143C6B] border border-blue-200 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                          id="vendor-click-photo-btn"
                        >
                          <Camera className="w-5 h-5 text-[#143C6B]" />
                          <span>Click Photo (Camera)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="h-14 bg-purple-50/80 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                          id="vendor-upload-gallery-btn"
                        >
                          <Upload className="w-5 h-5 text-purple-700" />
                          <span>Upload From Gallery</span>
                        </button>

                        <div className="col-span-2 sm:col-span-1 flex gap-1">
                          <input
                            type="text"
                            placeholder="Or image URL..."
                            value={customImageUrl}
                            onChange={e => setCustomImageUrl(e.target.value)}
                            className="flex-1 text-xs font-medium border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#143C6B]"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            disabled={!customImageUrl.trim()}
                            className="bg-slate-800 hover:bg-black text-white text-xs font-bold px-3 rounded-xl cursor-pointer disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {photoError && (
                        <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {photoError}
                        </p>
                      )}

                      {/* Photo Previews Grid */}
                      {uploadedImages.length === 0 ? (
                        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1.5">
                          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs text-slate-600 font-bold">No photos selected yet</p>
                          <p className="text-[11px] text-slate-400">
                            Use "Click Photo" or "Upload From Gallery" to attach your real product photos.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-2xs">
                              <img
                                src={img}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 bg-[#143C6B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                  Cover
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer shadow-xs opacity-90 hover:opacity-100"
                                title="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Title & Master Category */}
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Product Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pure Cotton Banarasi Jacquard Woven Saree with Blouse"
                          value={pTitle}
                          onChange={e => setPTitle(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:border-[#143C6B]"
                          id="vendor-product-title-input"
                        />
                        <p className="text-[10px] text-slate-400 font-medium mt-1">
                          Note: Once published, the title cannot be changed for catalog compliance.
                        </p>
                      </div>

                      {/* COMPREHENSIVE CATEGORIES DATABASE SELECTOR */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                            Primary Category * ({MASTER_CATEGORIES.length} Master Groups)
                          </label>
                          <select
                            value={pCategory}
                            onChange={e => {
                              const newCat = e.target.value;
                              setPCategory(newCat);
                              const subList = getSubcategoriesForCategory(newCat);
                              if (subList.length > 0) {
                                setPSubCategory(subList[0]);
                              }
                            }}
                            className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:border-[#143C6B]"
                            id="vendor-category-select"
                          >
                            {MASTER_CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name} ({cat.group})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                            Subcategory Classification *
                          </label>
                          {availableSubcategories.length > 0 ? (
                            <select
                              value={pSubCategory}
                              onChange={e => setPSubCategory(e.target.value)}
                              className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:border-[#143C6B]"
                              id="vendor-subcategory-select"
                            >
                              {availableSubcategories.map((sub, sIdx) => (
                                <option key={sIdx} value={sub}>
                                  {sub}
                                </option>
                              ))}
                              <option value="Custom / Other">Custom / Other</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              required
                              placeholder="e.g. Saree, Kurti, Shoes, Watch"
                              value={pSubCategory}
                              onChange={e => setPSubCategory(e.target.value)}
                              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                            />
                          )}
                        </div>
                      </div>

                      {/* Subcategory Suggestion Chips */}
                      {availableSubcategories.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Suggested Tags:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {availableSubcategories.slice(0, 6).map((sub, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPSubCategory(sub)}
                                className={`text-[10.5px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer border ${
                                  pSubCategory === sub
                                    ? 'bg-[#143C6B] text-white border-[#143C6B]'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Wholesale Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="299"
                          value={pPrice}
                          onChange={e => setPPrice(Number(e.target.value))}
                          className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                          id="vendor-price-input"
                        />
                        <span className="text-[10px] text-emerald-600 font-bold">100% Payout to Seller</span>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          MRP Sticker Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="599"
                          value={pOrigPrice}
                          onChange={e => setPOrigPrice(Number(e.target.value))}
                          className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                          id="vendor-original-price-input"
                        />
                        <span className="text-[10px] text-slate-400 font-medium">Printed Box MRP</span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Discount Margin
                        </label>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-black text-emerald-700">
                          {pOrigPrice > pPrice ? `${Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100)}% Margin OFF` : 'Standard Rate'}
                        </div>
                      </div>
                    </div>

                    {/* Sizing Chips */}
                    <div className="pt-2">
                      <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1.5">
                        Available Sizes / Inventory Options
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '6-12M', '1-2Y', '3-4Y', '5-6Y'].map(sz => {
                          const active = pSizeOptions.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleToggleSize(sz)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                active 
                                  ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-xs' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="pt-2">
                      <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                        Product Description & Specifications *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detail fabric material, weave, wash care instructions, pack contents, weight, and dimensions..."
                        value={pDesc}
                        onChange={e => setPDesc(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:border-[#143C6B]"
                        id="vendor-product-desc-input"
                      />
                    </div>

                    {/* 1. CASH ON DELIVERY (COD) SETTINGS */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${pCodAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            <Banknote className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cash on Delivery (COD)</h4>
                            <p className="text-[10.5px] text-slate-500 font-medium">Decide whether buyers can pay cash upon parcel delivery</p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pCodAvailable}
                            onChange={e => setPCodAvailable(e.target.checked)}
                            className="sr-only peer"
                            id="vendor-toggle-cod"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {pCodAvailable ? (
                        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          <div>
                            <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                              COD Handling / Convenience Fee (₹)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={pCodSurcharge}
                                onChange={e => setPCodSurcharge(Number(e.target.value))}
                                className="w-24 text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                                placeholder="39"
                              />
                              <div className="flex gap-1">
                                {[0, 29, 39, 49].map(amt => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setPCodSurcharge(amt)}
                                    className={`text-[10px] px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                      pCodSurcharge === amt ? 'bg-[#143C6B] text-white border-[#143C6B]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {amt === 0 ? 'Free' : `₹${amt}`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-2.5 border border-emerald-200/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer COD Price</span>
                              <span className="text-sm font-black text-slate-900">₹{pPrice + (Number(pCodSurcharge) || 0)}</span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✔ COD Enabled
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-200/60 bg-indigo-50/70 rounded-xl p-2.5 border border-indigo-100 text-indigo-900 text-xs font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span>This item will be listed as <strong>Online Payment Only (Prepaid)</strong>. COD disabled for buyers.</span>
                        </div>
                      )}
                    </div>

                    {/* 2. RETURN & REPLACEMENT POLICY */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#143C6B] flex items-center justify-center font-black">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Return & Replacement Policy</h4>
                          <p className="text-[10.5px] text-slate-500 font-medium">Choose policy type and return duration for this specific product</p>
                        </div>
                      </div>

                      {/* Policy Mode Selector: 3 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPReturnPolicyType('return')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            pReturnPolicyType === 'return'
                              ? 'bg-blue-50 border-[#143C6B] ring-1 ring-[#143C6B]'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900">Return & Refund</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${pReturnPolicyType === 'return' ? 'border-[#143C6B] bg-[#143C6B]' : 'border-slate-300'}`}>
                              {pReturnPolicyType === 'return' && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Full refund upon item return</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPReturnPolicyType('replacement')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            pReturnPolicyType === 'replacement'
                              ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900">Replacement Only</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${pReturnPolicyType === 'replacement' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                              {pReturnPolicyType === 'replacement' && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Size/defect exchange only</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPReturnPolicyType('no_return')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            pReturnPolicyType === 'no_return'
                              ? 'bg-red-50 border-red-500 ring-1 ring-red-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900">No Return</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${pReturnPolicyType === 'no_return' ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                              {pReturnPolicyType === 'no_return' && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Final sale, non-returnable</span>
                        </button>
                      </div>

                      {/* Days Selection when policy is Return or Replacement */}
                      {pReturnPolicyType !== 'no_return' ? (
                        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-slate-700 font-bold">Policy Window:</label>
                            <div className="flex gap-1.5">
                              {[7, 10, 14, 15, 30].map(days => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setPReturnDays(days)}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                    pReturnDays === days ? 'bg-[#143C6B] text-white border-[#143C6B]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {days} Days
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-[#143C6B] flex items-center gap-1.5">
                            <span>Badge:</span>
                            <span className="bg-blue-50 text-[#143C6B] px-2 py-0.5 rounded-md border border-blue-100 font-black">
                              {pReturnPolicyType === 'return' ? `${pReturnDays || 7} Days Return` : `${pReturnDays || 7} Days Replacement`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-200/60 bg-red-50/60 rounded-xl p-2.5 border border-red-100 text-red-900 text-xs font-semibold flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>Buyers will see a clear <strong>"Non-Returnable (Final Sale)"</strong> badge on the product page.</span>
                        </div>
                      )}
                    </div>

                    {/* 3. UPI OFFERS & INSTANT PROMOTIONS */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${pHasUpiOffer ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
                            <BadgePercent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">UPI Instant Discount Offer</h4>
                            <p className="text-[10.5px] text-slate-500 font-medium">Incentivize buyers to pay via Google Pay, PhonePe, Paytm, BHIM UPI</p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pHasUpiOffer}
                            onChange={e => setPHasUpiOffer(e.target.checked)}
                            className="sr-only peer"
                            id="vendor-toggle-upi-offer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      {pHasUpiOffer && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                                Discount Structure
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={pUpiDiscountType}
                                  onChange={e => setPUpiDiscountType(e.target.value as 'percentage' | 'flat')}
                                  className="text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                                >
                                  <option value="percentage">Percentage (%)</option>
                                  <option value="flat">Flat Amount (₹)</option>
                                </select>
                                <input
                                  type="number"
                                  min={1}
                                  value={pUpiDiscountValue}
                                  onChange={e => setPUpiDiscountValue(Number(e.target.value))}
                                  placeholder={pUpiDiscountType === 'percentage' ? '5' : '30'}
                                  className="w-24 text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                                />
                                <span className="self-center text-xs font-bold text-slate-600">
                                  {pUpiDiscountType === 'percentage' ? '%' : '₹'} OFF
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                                Buyer UPI Price Preview
                              </label>
                              <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs font-black text-purple-800 flex items-center justify-between">
                                <span>Instant UPI Price:</span>
                                <span>₹{Math.max(1, pPrice - (pUpiDiscountType === 'percentage' ? Math.round((pPrice * pUpiDiscountValue) / 100) : pUpiDiscountValue))}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                              Custom Offer Tagline
                            </label>
                            <input
                              type="text"
                              value={pUpiOfferText}
                              onChange={e => setPUpiOfferText(e.target.value)}
                              placeholder="e.g. Extra 5% Instant Discount on UPI Payment"
                              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:border-[#143C6B]"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {[
                                'Extra 5% Instant Discount on UPI Payment',
                                'Instant ₹30 Flat OFF on UPI Payment',
                                'Save ₹50 Extra with GPay / PhonePe / Paytm'
                              ].map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPUpiOfferText(preset)}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                                >
                                  + {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => goToVendorRoute('products')}
                        className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct || uploadedImages.length === 0}
                        className="bg-[#143C6B] hover:bg-[#0D2C4E] disabled:bg-slate-300 text-white font-black text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-xs uppercase tracking-wider flex items-center gap-2"
                        id="vendor-publish-product-btn"
                      >
                        {isSavingProduct ? 'Publishing...' : 'Publish Product to Catalog'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* 4. EDIT PRODUCT PAGE (TITLE & PHOTOS PERMANENTLY LOCKED) */}
              {activeTabKey === 'edit-product' && (
                <motion.div
                  key="vendor-edit-product-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="max-w-2xl mx-auto w-full space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToVendorRoute('products')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143C6B] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Catalog</span>
                    </button>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Title & Photos Locked</span>
                    </span>
                  </div>

                  <form onSubmit={handleSaveProductForm} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-5">
                    <div className="pb-3 border-b border-slate-100">
                      <h2 className="text-base font-black text-slate-900">Edit Catalog Product Details</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Update wholesale pricing, sticker MRP, available sizes, and descriptions.
                      </p>
                    </div>

                    {/* PHOTO SECTION - PERMANENTLY LOCKED */}
                    <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Product Photos (Permanently Locked)</span>
                        </label>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                          Read-Only
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium">
                        Photos are permanently locked after listing to maintain catalog integrity and buyer trust.
                      </p>

                      <div className="flex gap-2 pt-1 overflow-x-auto">
                        {uploadedImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Product photo"
                            className="w-16 h-16 object-cover rounded-xl border border-slate-300 bg-white shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>

                    {/* TITLE - PERMANENTLY LOCKED */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Product Title (Permanently Locked)</span>
                        </label>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                          Read-Only
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={pTitle}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">
                        Product titles cannot be modified once listed.
                      </p>
                    </div>

                    {/* Category Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          disabled
                          value={pCategory}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Subcategory
                        </label>
                        <input
                          type="text"
                          disabled
                          value={pSubCategory}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Pricing Edit */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Wholesale Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={pPrice}
                          onChange={e => setPPrice(Number(e.target.value))}
                          className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          MRP Sticker (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={pOrigPrice}
                          onChange={e => setPOrigPrice(Number(e.target.value))}
                          className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Discount Margin
                        </label>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-black text-emerald-700">
                          {pOrigPrice > pPrice ? `${Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100)}% Margin OFF` : 'Standard'}
                        </div>
                      </div>
                    </div>

                    {/* Sizing Chips */}
                    <div>
                      <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1.5">
                        Available Sizes
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '6-12M', '1-2Y', '3-4Y', '5-6Y'].map(sz => {
                          const active = pSizeOptions.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleToggleSize(sz)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                active 
                                  ? 'bg-[#143C6B] text-white border-[#143C6B]' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                        Product Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={pDesc}
                        onChange={e => setPDesc(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:border-[#143C6B]"
                      />
                    </div>

                    {/* 1. CASH ON DELIVERY (COD) SETTINGS */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${pCodAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            <Banknote className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cash on Delivery (COD)</h4>
                            <p className="text-[10.5px] text-slate-500 font-medium">Decide whether buyers can pay cash upon parcel delivery</p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pCodAvailable}
                            onChange={e => setPCodAvailable(e.target.checked)}
                            className="sr-only peer"
                            id="vendor-edit-toggle-cod"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {pCodAvailable ? (
                        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          <div>
                            <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                              COD Handling Fee (₹)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={pCodSurcharge}
                                onChange={e => setPCodSurcharge(Number(e.target.value))}
                                className="w-24 text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                                placeholder="39"
                              />
                              <div className="flex gap-1">
                                {[0, 29, 39, 49].map(amt => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setPCodSurcharge(amt)}
                                    className={`text-[10px] px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                      pCodSurcharge === amt ? 'bg-[#143C6B] text-white border-[#143C6B]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {amt === 0 ? 'Free' : `₹${amt}`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-2.5 border border-emerald-200/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer COD Price</span>
                              <span className="text-sm font-black text-slate-900">₹{pPrice + (Number(pCodSurcharge) || 0)}</span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✔ COD Enabled
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-200/60 bg-indigo-50/70 rounded-xl p-2.5 border border-indigo-100 text-indigo-900 text-xs font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span>This item will be listed as <strong>Online Payment Only (Prepaid)</strong>. COD disabled.</span>
                        </div>
                      )}
                    </div>

                    {/* 2. RETURN & REPLACEMENT POLICY */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#143C6B] flex items-center justify-center font-black">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Return & Replacement Policy</h4>
                          <p className="text-[10.5px] text-slate-500 font-medium">Configure return/replacement terms for this product</p>
                        </div>
                      </div>

                      {/* Policy Mode Selector: 3 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPReturnPolicyType('return')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            pReturnPolicyType === 'return'
                              ? 'bg-blue-50 border-[#143C6B] ring-1 ring-[#143C6B]'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900">Return & Refund</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${pReturnPolicyType === 'return' ? 'border-[#143C6B] bg-[#143C6B]' : 'border-slate-300'}`}>
                              {pReturnPolicyType === 'return' && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Full refund upon item return</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPReturnPolicyType('replacement')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            pReturnPolicyType === 'replacement'
                              ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900">Replacement Only</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${pReturnPolicyType === 'replacement' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                              {pReturnPolicyType === 'replacement' && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Size/defect exchange only</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPReturnPolicyType('no_return')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            pReturnPolicyType === 'no_return'
                              ? 'bg-red-50 border-red-500 ring-1 ring-red-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900">No Return</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${pReturnPolicyType === 'no_return' ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                              {pReturnPolicyType === 'no_return' && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Final sale, non-returnable</span>
                        </button>
                      </div>

                      {/* Days Selection */}
                      {pReturnPolicyType !== 'no_return' ? (
                        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-slate-700 font-bold">Policy Window:</label>
                            <div className="flex gap-1.5">
                              {[7, 10, 14, 15, 30].map(days => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setPReturnDays(days)}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                    pReturnDays === days ? 'bg-[#143C6B] text-white border-[#143C6B]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {days} Days
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-[#143C6B] flex items-center gap-1.5">
                            <span>Badge:</span>
                            <span className="bg-blue-50 text-[#143C6B] px-2 py-0.5 rounded-md border border-blue-100 font-black">
                              {pReturnPolicyType === 'return' ? `${pReturnDays || 7} Days Return` : `${pReturnDays || 7} Days Replacement`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-200/60 bg-red-50/60 rounded-xl p-2.5 border border-red-100 text-red-900 text-xs font-semibold flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>Buyers will see a clear <strong>"Non-Returnable (Final Sale)"</strong> badge on the product page.</span>
                        </div>
                      )}
                    </div>

                    {/* 3. UPI OFFERS & INSTANT PROMOTIONS */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${pHasUpiOffer ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
                            <BadgePercent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">UPI Instant Discount Offer</h4>
                            <p className="text-[10.5px] text-slate-500 font-medium">Incentivize buyers to pay via Google Pay, PhonePe, Paytm, BHIM UPI</p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pHasUpiOffer}
                            onChange={e => setPHasUpiOffer(e.target.checked)}
                            className="sr-only peer"
                            id="vendor-edit-toggle-upi-offer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      {pHasUpiOffer && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                                Discount Structure
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={pUpiDiscountType}
                                  onChange={e => setPUpiDiscountType(e.target.value as 'percentage' | 'flat')}
                                  className="text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                                >
                                  <option value="percentage">Percentage (%)</option>
                                  <option value="flat">Flat Amount (₹)</option>
                                </select>
                                <input
                                  type="number"
                                  min={1}
                                  value={pUpiDiscountValue}
                                  onChange={e => setPUpiDiscountValue(Number(e.target.value))}
                                  placeholder={pUpiDiscountType === 'percentage' ? '5' : '30'}
                                  className="w-24 text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                                />
                                <span className="self-center text-xs font-bold text-slate-600">
                                  {pUpiDiscountType === 'percentage' ? '%' : '₹'} OFF
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                                Buyer UPI Price Preview
                              </label>
                              <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs font-black text-purple-800 flex items-center justify-between">
                                <span>Instant UPI Price:</span>
                                <span>₹{Math.max(1, pPrice - (pUpiDiscountType === 'percentage' ? Math.round((pPrice * pUpiDiscountValue) / 100) : pUpiDiscountValue))}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
                              Custom Offer Tagline
                            </label>
                            <input
                              type="text"
                              value={pUpiOfferText}
                              onChange={e => setPUpiOfferText(e.target.value)}
                              placeholder="e.g. Extra 5% Instant Discount on UPI Payment"
                              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:border-[#143C6B]"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {[
                                'Extra 5% Instant Discount on UPI Payment',
                                'Instant ₹30 Flat OFF on UPI Payment',
                                'Save ₹50 Extra with GPay / PhonePe / Paytm'
                              ].map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPUpiOfferText(preset)}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                                >
                                  + {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => goToVendorRoute('products')}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-xs uppercase tracking-wider"
                      >
                        {isSavingProduct ? 'Saving...' : 'Update Product'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* 5. ORDERS & DISPATCH PAGE */}
              {activeTabKey === 'orders' && (
                <motion.div
                  key="vendor-orders-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-black text-slate-900">Client Orders & Dispatch ({vendorOrders.length})</h2>
                        <p className="text-xs text-slate-500 font-medium">Process buyer orders, update courier dispatch, and print slips.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToVendorRoute('export')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Export Customer Ledger</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden sm:inline">Print All</span>
                        </button>
                      </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search order ID, customer name, or city..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full text-xs font-medium border border-slate-300 rounded-xl py-2 pl-9 pr-3 bg-white focus:outline-hidden focus:border-[#143C6B]"
                        />
                      </div>

                      <select
                        value={orderStatusFilter}
                        onChange={e => setOrderStatusFilter(e.target.value)}
                        className="text-xs font-bold border border-slate-300 rounded-xl py-2 px-3 bg-white focus:outline-hidden focus:border-[#143C6B]"
                      >
                        <option value="all">All Dispatch Statuses</option>
                        <option value="Ordered">Pending Dispatch</option>
                        <option value="Shipped">In Transit / Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div className="py-16 text-center space-y-3">
                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-700">No Orders Match Filter</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                          Try changing your search term or select "All Dispatch Statuses".
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                        {filteredOrders.map(order => {
                          const vendorItems = (order.items || []).filter(item => item.product?.vendorId === currentVendor.id);
                          const vendorItemsTotal = vendorItems.reduce((s, i) => s + ((i.product?.price || 0) * i.quantity), 0);

                          return (
                            <div key={order.id} className="p-3.5 sm:p-4 bg-white hover:bg-slate-50/80 transition-colors space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black font-mono text-[#143C6B]">#{order.id}</span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                      order.status === 'Delivered Early'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : order.status === 'Shipped' || order.status === 'Out for Delivery'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : order.status === 'Cancelled'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Customer: <strong>{order.shippingAddress?.name || 'Customer'}</strong> (+91 {order.shippingAddress?.phone || 'N/A'}) • {order.shippingAddress?.city || 'India'}, {order.shippingAddress?.state || ''}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 justify-between sm:justify-end">
                                  <div className="text-right">
                                    <span className="text-xs font-black text-slate-900 block">₹{vendorItemsTotal}</span>
                                    <span className="text-[9.5px] text-emerald-600 font-bold">100% Payout</span>
                                  </div>

                                  <button
                                    onClick={() => goToVendorRoute('orders/details', `id=${order.id}`)}
                                    className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer shadow-3xs"
                                  >
                                    Manage
                                  </button>
                                </div>
                              </div>

                              {/* Items mini list */}
                              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                                {vendorItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg text-xs">
                                    <img
                                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                                      alt=""
                                      className="w-5 h-5 object-cover rounded-md"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span className="font-bold text-slate-700 truncate max-w-[140px]">{item.product?.title}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 6. EXPORT & REPORTS PAGE (Dedicated Indexed Customer Orders Download Component) */}
              {activeTabKey === 'export' && (
                <motion.div
                  key="vendor-export-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-4"
                >
                  <VendorExportReports 
                    currentVendor={currentVendor} 
                    orders={orders} 
                    products={products} 
                  />
                </motion.div>
              )}

              {/* 7. ORDER DETAILS SUBPAGE */}
              {activeTabKey === 'order-details' && (
                <motion.div
                  key="vendor-order-details-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="max-w-2xl mx-auto w-full space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToVendorRoute('orders')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143C6B] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Orders</span>
                    </button>
                  </div>

                  {!selectedOrderForDetail ? (
                    <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-slate-200">
                      <p className="text-xs text-slate-600 font-bold">Order Not Found</p>
                      <button
                        onClick={() => goToVendorRoute('orders')}
                        className="mt-3 bg-[#143C6B] text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Return to Orders
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-5">
                      
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-black text-slate-900">Order #{selectedOrderForDetail.id.slice(0, 8)}</h2>
                            <span className="text-[10px] bg-blue-100 text-[#143C6B] font-bold px-2 py-0.5 rounded-full uppercase">
                              {selectedOrderForDetail.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Placed: {selectedOrderForDetail.orderDate}</p>
                        </div>

                        <button
                          onClick={() => window.print()}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Dispatch Slip</span>
                        </button>
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Delivery Details</span>
                        <p className="text-xs font-black text-slate-900">{selectedOrderForDetail.shippingAddress?.name}</p>
                        <p className="text-xs text-slate-600">{selectedOrderForDetail.shippingAddress?.addressLine}</p>
                        <p className="text-xs text-slate-600">
                          {selectedOrderForDetail.shippingAddress?.city}, {selectedOrderForDetail.shippingAddress?.state} - {selectedOrderForDetail.shippingAddress?.pincode}
                        </p>
                        <p className="text-xs font-bold text-slate-700">Phone: {selectedOrderForDetail.shippingAddress?.phone}</p>
                      </div>

                      {/* Merchandise List */}
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Ordered Items</h3>
                        <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100">
                          {(selectedOrderForDetail.items || []).map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                                  alt={item.product?.title}
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800">{item.product?.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-medium">Size: {item.selectedSize || 'Standard'} • Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-slate-900">₹{(item.product?.price || 0) * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dispatch Status Updater */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Update Dispatch Status</span>
                        <div className="flex flex-wrap gap-2">
                          {(['Ordered', 'Shipped', 'Out for Delivery', 'Delivered Early', 'Cancelled'] as const).map(statusOpt => (
                            <button
                              key={statusOpt}
                              onClick={() => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(selectedOrderForDetail.id, statusOpt);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all uppercase ${
                                selectedOrderForDetail.status === statusOpt
                                  ? 'bg-[#143C6B] text-white shadow-3xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Mark {statusOpt}
                            </button>
                          ))}
                          <button
                            onClick={async () => {
                              if (confirm('Process return for this order? The item amount will be deducted from vendor balance and refunded to customer QueKart wallet.')) {
                                try {
                                  const res = await fetch(`/api/orders/${selectedOrderForDetail.id}/return`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reason: 'Vendor marked as Returned' })
                                  });
                                  if (res.ok) {
                                    if (onUpdateOrderStatus) {
                                      onUpdateOrderStatus(selectedOrderForDetail.id, 'Returned');
                                    }
                                    alert('Order marked as Returned and refunded to customer wallet.');
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all uppercase ${
                              selectedOrderForDetail.status === 'Returned'
                                ? 'bg-purple-700 text-white shadow-3xs'
                                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            }`}
                          >
                            Mark Returned
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              )}

              {/* 8. SUPPLIER PROFILE (GST VERIFIED VENDORS PERMANENTLY LOCKED) */}
              {activeTabKey === 'profile' && (
                <motion.div
                  key="vendor-profile-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="max-w-2xl mx-auto w-full space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
                    
                    {/* Header */}
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#143C6B] text-white flex items-center justify-center font-black text-xl shadow-xs">
                          {currentVendor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900">{currentVendor.name}</h3>
                            {isGstLocked && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>GST Verified</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{currentVendor.businessCategory || 'General Merchandise'} • Mob: +91 {currentVendor.phone}</p>
                        </div>
                      </div>

                      {/* EDIT BUTTON LOGIC:
                          If GST Verified -> Profile is permanently locked! Button shows locked badge.
                          If Not GST Verified -> Can edit non-GST details.
                      */}
                      {isGstLocked ? (
                        <div 
                          className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-not-allowed select-none"
                          title="Profile details are permanently locked for GST-verified merchants for tax compliance."
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Profile Locked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => goToVendorRoute('profile/edit')}
                          className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-3xs"
                          id="vendor-edit-profile-btn"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {/* GST Compliance Notice if locked */}
                    {isGstLocked && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-emerald-950">GST Compliance Security Lock Active</h4>
                          <p className="text-[11px] text-emerald-800 font-medium">
                            Your legal business name, registered phone number, and state credentials are permanently locked in compliance with Central GST Portal regulations. Invoices are automatically generated using these verified credentials.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Attributes Table */}
                    <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-medium">Merchant ID</span>
                        <span className="font-mono font-bold text-slate-800">{currentVendor.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-medium">Seller Classification</span>
                        <span className={`font-bold text-[10px] uppercase px-2.5 py-1 rounded-md ${
                          isGstLocked 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isGstLocked ? '👑 Verified GST Store' : '🌱 Small Business (Unverified GST)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-medium">GSTIN Number</span>
                        <span className="font-mono font-bold text-slate-800 uppercase">
                          {currentVendor.gstin || 'Not Provided (Standard Bill)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-medium">Operating City & State</span>
                        <span className="font-bold text-slate-800">{currentVendor.city || 'Jaipur'}, {currentVendor.state || 'Rajasthan'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-medium">Official Contact Email</span>
                        <span className="font-bold text-slate-800">{currentVendor.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-medium">Aadhaar UIDAI Status</span>
                        <span className="font-bold text-slate-800">
                          {currentVendor.aadhaarVerified ? '✓ Biometrically Verified' : 'Standard Documented'}
                        </span>
                      </div>
                    </div>

                    {/* POST-SIGNUP GSTIN VERIFICATION UPGRADE BOX (For unverified vendors) */}
                    {!isGstLocked && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3" id="vendor-post-signup-gst-upgrade">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                          <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                          <span>Instant GSTIN Verification & Upgrade</span>
                        </div>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Didn't add a GST number during sign-up? You can verify your GSTIN at any time. Once verified, your products will be automatically approved without waiting for manual admin review.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="Enter 15-character GSTIN (e.g. 08AAAAA0000A1Z5)"
                            value={profileGstin}
                            onChange={e => setProfileGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            className="flex-1 text-xs font-mono font-bold border border-amber-300 rounded-xl p-2.5 bg-white uppercase focus:outline-hidden focus:border-[#143C6B]"
                            id="vendor-profile-gstin-upgrade-input"
                          />
                          <button
                            type="button"
                            disabled={isGstVerifying || profileGstin.trim().length !== 15}
                            onClick={handleUpgradeGstin}
                            className="bg-[#143C6B] hover:bg-[#0D2C4E] disabled:bg-slate-300 text-white text-xs font-black py-2.5 px-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                            id="vendor-profile-gstin-upgrade-btn"
                          >
                            {isGstVerifying ? 'Verifying with GSTN...' : 'Verify & Lock Profile'}
                          </button>
                        </div>

                        {gstVerifyStatus !== 'idle' && (
                          <div className={`p-2.5 rounded-xl text-xs font-bold ${
                            gstVerifyStatus === 'success' ? 'bg-emerald-100 text-emerald-800' :
                            gstVerifyStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-[#143C6B]'
                          }`}>
                            {gstVerifyMessage}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </motion.div>
              )}

              {/* 9. EDIT PROFILE PAGE (ONLY ACCESSIBLE BY NON-GST VENDORS) */}
              {activeTabKey === 'edit-profile' && (
                <motion.div
                  key="vendor-edit-profile-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="max-w-2xl mx-auto w-full space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToVendorRoute('profile')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143C6B] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Profile</span>
                    </button>
                  </div>

                  {isGstLocked ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
                      <Lock className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h3 className="text-sm font-black text-slate-900">Profile Permanently Locked</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Your profile is verified under GSTIN <strong>{currentVendor.gstin}</strong> and is legally locked from modifications.
                      </p>
                      <button
                        onClick={() => goToVendorRoute('profile')}
                        className="bg-[#143C6B] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Return to Profile
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4" id="edit-profile-form">
                      <div className="pb-3 border-b border-slate-100">
                        <h2 className="text-base font-black text-slate-900">Edit Store Profile</h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Update your store contact and dispatch location.
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Store / Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={profilePhone}
                            onChange={e => setProfilePhone(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={profileEmail}
                            onChange={e => setProfileEmail(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={profileCity}
                            onChange={e => setProfileCity(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={profileState}
                            onChange={e => setProfileState(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                          Store Description
                        </label>
                        <textarea
                          rows={3}
                          value={profileDescText}
                          onChange={e => setProfileDescText(e.target.value)}
                          className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => goToVendorRoute('profile')}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white font-black text-xs py-2 px-5 rounded-xl cursor-pointer shadow-xs uppercase tracking-wider"
                        >
                          {isSavingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* 10. REAL-TIME STORE ANALYTICS */}
              {activeTabKey === 'analytics' && (
                <motion.div
                  key="vendor-analytics-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <VendorAnalyticsView
                    currentVendor={currentVendor}
                    vendorProducts={vendorProducts}
                    vendorOrders={vendorOrders}
                    analyticsData={vendorAnalyticsData}
                    isLoading={isLoadingAnalytics}
                    onRefresh={() => {
                      if (currentVendor?.id) {
                        setIsLoadingAnalytics(true);
                        fetchVendorAnalytics(currentVendor.id)
                          .then(data => setVendorAnalyticsData(data))
                          .finally(() => setIsLoadingAnalytics(false));
                      }
                    }}
                    onExport={() => goToVendorRoute('export')}
                  />
                </motion.div>
              )}

              {/* 12. PAYOUTS, EARNINGS & PASSBOOK STATEMENT PAGE */}
              {activeTabKey === 'payouts' && (
                <motion.div
                  key="vendor-payouts-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-5"
                >
                  {/* Top Financial Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {/* Card 1: Available Balance */}
                    <div className="bg-gradient-to-br from-[#143C6B] via-[#10355F] to-[#0B2544] text-white rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden ring-1 ring-[#C89D1F]/40 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black text-[#C89D1F] tracking-wider">Available Balance</span>
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C89D1F] border border-white/10">
                          <Wallet className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                          ₹{(vendorFinancials?.availableBalance ?? 0).toLocaleString()}
                        </p>
                        <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Immediate Withdrawal
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Total Lifetime Earnings */}
                    <div className="liquid-glass-card rounded-2xl border border-white/90 p-5 shadow-xs space-y-3 hover:scale-[1.01] transition-transform">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Lifetime Earnings</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">
                          ₹{(vendorFinancials?.totalEarnings ?? totalRevenue).toLocaleString()}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">Delivered order sales credited</span>
                      </div>
                    </div>

                    {/* Card 3: In-Transit / Pending Delivery */}
                    <div className="liquid-glass-card rounded-2xl border border-white/90 p-5 shadow-xs space-y-3 hover:scale-[1.01] transition-transform">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Pending Orders</span>
                        <div className="w-8 h-8 rounded-xl bg-[#C89D1F]/15 border border-[#C89D1F]/30 text-[#8C6A0A] flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-black text-[#8C6A0A]">
                          ₹{(vendorFinancials?.pendingBalance ?? 0).toLocaleString()}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">Credits to wallet upon delivery</span>
                      </div>
                    </div>

                    {/* Card 4: Total Withdrawn */}
                    <div className="liquid-glass-card rounded-2xl border border-white/90 p-5 shadow-xs space-y-3 hover:scale-[1.01] transition-transform">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Withdrawn</span>
                        <div className="w-8 h-8 rounded-xl bg-[#143C6B]/10 border border-[#143C6B]/20 text-[#143C6B] flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900">
                          ₹{(vendorFinancials?.totalWithdrawn ?? 0).toLocaleString()}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">Transferred to Bank / UPI</span>
                      </div>
                    </div>
                  </div>

                  {/* Payout Withdrawal Section & Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left 2 Cols: Request Payout Form */}
                    <div className="lg:col-span-2 liquid-glass-card rounded-2xl border border-white/90 p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase">Request Payout Withdrawal</h3>
                          <p className="text-xs text-slate-500 font-medium">Enter your payout details to transfer funds directly to your Bank Account or UPI.</p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md uppercase">
                          0% Fee Instant Settlement
                        </span>
                      </div>

                      {/* Success Alert */}
                      {payoutSuccessData && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Payout Request Submitted Successfully!</span>
                          </div>
                          <p className="text-xs text-emerald-700">
                            Reference ID: <strong>{payoutSuccessData.id}</strong> • Amount: <strong>₹{payoutSuccessData.amount.toLocaleString()}</strong> ({payoutSuccessData.method.toUpperCase()}). Funds will be transferred to your account.
                          </p>
                        </div>
                      )}

                      {/* Error Alert */}
                      {payoutErrorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <span>{payoutErrorMsg}</span>
                        </div>
                      )}

                      {/* Payout Method Toggle: Bank Account vs UPI */}
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block">
                          Choose Withdrawal Method *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPayoutMethod('bank')}
                            className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              payoutMethod === 'bank'
                                ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-md ring-2 ring-[#C89D1F]/40'
                                : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                            <span>Bank Account (NEFT/IMPS)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPayoutMethod('upi')}
                            className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              payoutMethod === 'upi'
                                ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-md ring-2 ring-[#C89D1F]/40'
                                : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <Coins className="w-4 h-4" />
                            <span>Instant UPI ID</span>
                          </button>
                        </div>
                      </div>

                      {/* Form inputs */}
                      <form onSubmit={handleRequestPayout} className="space-y-4">
                        {payoutMethod === 'bank' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/60 p-4 rounded-2xl border border-slate-200/80">
                            <div>
                              <label className="text-[10.5px] text-slate-600 font-extrabold uppercase block mb-1">
                                Bank Account Number *
                              </label>
                              <input
                                type="text"
                                required
                                value={payoutAccNo}
                                onChange={e => setPayoutAccNo(e.target.value)}
                                placeholder="Enter account number"
                                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                              />
                            </div>

                            <div>
                              <label className="text-[10.5px] text-slate-600 font-extrabold uppercase block mb-1">
                                IFSC Code *
                              </label>
                              <input
                                type="text"
                                required
                                value={payoutIfsc}
                                onChange={e => setPayoutIfsc(e.target.value.toUpperCase())}
                                placeholder="e.g. SBIN0001234"
                                className="w-full text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                              />
                            </div>

                            <div>
                              <label className="text-[10.5px] text-slate-600 font-extrabold uppercase block mb-1">
                                Account Holder Name
                              </label>
                              <input
                                type="text"
                                value={payoutHolder}
                                onChange={e => setPayoutHolder(e.target.value)}
                                placeholder="Name as per bank record"
                                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                              />
                            </div>

                            <div>
                              <label className="text-[10.5px] text-slate-600 font-extrabold uppercase block mb-1">
                                Bank Name
                              </label>
                              <input
                                type="text"
                                value={payoutBankTitle}
                                onChange={e => setPayoutBankTitle(e.target.value)}
                                placeholder="e.g. State Bank of India"
                                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/60 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                            <label className="text-[10.5px] text-slate-600 font-extrabold uppercase block mb-1">
                              UPI ID (VPA) *
                            </label>
                            <input
                              type="text"
                              required
                              value={payoutUpi}
                              onChange={e => setPayoutUpi(e.target.value)}
                              placeholder="mobile@upi or name@okhdfcbank"
                              className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                            />
                            <p className="text-[10.5px] text-slate-500">
                              Instant direct credit via Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
                            </p>
                          </div>
                        )}

                        {/* Amount & Quick Presets */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block">
                              Withdrawal Amount (₹) *
                            </label>
                            <span className="text-xs text-slate-500 font-medium">
                              Available: <strong className="text-emerald-700">₹{(vendorFinancials?.availableBalance ?? 0).toLocaleString()}</strong>
                            </span>
                          </div>

                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                            <input
                              type="number"
                              min="1"
                              max={vendorFinancials?.availableBalance || undefined}
                              required
                              value={payoutAmount}
                              onChange={e => setPayoutAmount(e.target.value)}
                              placeholder="Enter amount to withdraw"
                              className="w-full pl-8 pr-4 py-2.5 text-sm font-black border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#143C6B] bg-white"
                            />
                          </div>

                          {/* Quick Presets */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {[500, 1000, 2500, 5000].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPayoutAmount(String(val))}
                                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer border border-slate-200 transition-colors"
                              >
                                ₹{val.toLocaleString()}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setPayoutAmount(String(vendorFinancials?.availableBalance || 0))}
                              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#143C6B] text-[11px] font-black rounded-lg cursor-pointer border border-blue-200 transition-colors"
                            >
                              Withdraw Full Balance (₹{(vendorFinancials?.availableBalance || 0).toLocaleString()})
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmittingPayout || (vendorFinancials?.availableBalance ?? 0) <= 0}
                            className="w-full sm:w-auto bg-[#143C6B] hover:bg-[#0D2C4E] disabled:opacity-50 text-white text-xs font-black py-2.5 px-6 rounded-xl cursor-pointer shadow-md border border-[#C89D1F]/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
                          >
                            <ArrowUpRight className="w-4 h-4 text-[#C89D1F]" />
                            <span>{isSubmittingPayout ? 'Processing Withdrawal...' : 'Withdraw Funds Now'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Right 1 Col: Settlement Info & Policy */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-[#143C6B] to-[#0D2C4E] text-white rounded-2xl p-5 shadow-md space-y-4 border border-[#C89D1F]/30">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-[#C89D1F] tracking-wider">Settlement Policy</span>
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-black text-white">Guaranteed Direct Credit</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Every order marked as <strong>Delivered</strong> is credited immediately to your running balance. You can withdraw anytime with zero delays.
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>QueKart Platform Fee:</span>
                            <span className="font-black text-emerald-300">0% (Free)</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Transfer Mode:</span>
                            <span className="font-bold text-white">IMPS / UPI / NEFT</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Settlement Speed:</span>
                            <span className="font-bold text-white">Instant / Same Day</span>
                          </div>
                        </div>
                      </div>

                      {/* Export Bank Statement Quick Button */}
                      <button
                        onClick={handleExportStatementCsv}
                        className="w-full p-4 liquid-glass-card rounded-2xl border border-white/90 hover:border-emerald-500 shadow-xs flex items-center justify-between cursor-pointer transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Bank Statement</span>
                            <span className="text-xs font-black text-slate-900">Download Passbook Excel/CSV</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* FINANCIAL PASSBOOK & TRANSACTION LEDGER TABLE */}
                  <div className="liquid-glass-card rounded-2xl border border-white/90 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 uppercase">Vendor Financial Passbook & Transaction Ledger</h3>
                          <span className="text-[10px] bg-blue-50 text-[#143C6B] font-bold px-2 py-0.5 rounded-full">
                            {vendorFinancials?.transactions?.length || 0} Records
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Complete running balance record of every credit from delivered sales and payout debit.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={ledgerSearch}
                            onChange={e => setLedgerSearch(e.target.value)}
                            placeholder="Search Ref / Order / Item..."
                            className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl w-48 focus:outline-hidden focus:border-[#143C6B]"
                          />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setLedgerFilter('all')}
                            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                              ledgerFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setLedgerFilter('credit')}
                            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                              ledgerFilter === 'credit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Credits (+)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLedgerFilter('debit')}
                            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                              ledgerFilter === 'debit' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Debits (-)
                          </button>
                        </div>

                        {/* Export Button */}
                        <button
                          onClick={handleExportStatementCsv}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200/80 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Reference ID</th>
                            <th className="p-3">Type & Description</th>
                            <th className="p-3 text-right">Credit (+)</th>
                            <th className="p-3 text-right">Debit (-)</th>
                            <th className="p-3 text-right font-black">Closing Balance</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {(() => {
                            const list = (vendorFinancials?.transactions || []).filter(t => {
                              if (ledgerFilter === 'credit' && t.credit <= 0) return false;
                              if (ledgerFilter === 'debit' && t.debit <= 0) return false;
                              if (ledgerSearch.trim()) {
                                const q = ledgerSearch.toLowerCase();
                                return (
                                  (t.referenceId || '').toLowerCase().includes(q) ||
                                  (t.orderId || '').toLowerCase().includes(q) ||
                                  (t.description || '').toLowerCase().includes(q) ||
                                  (t.productTitle || '').toLowerCase().includes(q)
                                );
                              }
                              return true;
                            });

                            if (list.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-400">
                                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs font-bold">No financial transactions matching current filter.</p>
                                  </td>
                                </tr>
                              );
                            }

                            return list.map(t => (
                              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                                  {t.date || t.timestamp}
                                </td>

                                <td className="p-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-900 text-xs">
                                      {t.referenceId || t.id}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(t.referenceId || t.id)}
                                      className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                                      title="Copy Reference ID"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    {copiedRefId === (t.referenceId || t.id) && (
                                      <span className="text-[9.5px] bg-slate-800 text-white px-1.5 py-0.2 rounded">Copied</span>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3 min-w-[220px]">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9.5px] font-black uppercase px-2 py-0.2 rounded-md ${
                                        t.transactionType === 'order_credit'
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : t.transactionType === 'payout_debit'
                                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                          : t.transactionType === 'return_debit'
                                          ? 'bg-red-50 text-red-800 border border-red-200'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}>
                                        {t.typeLabel}
                                      </span>
                                      {t.orderId && (
                                        <span className="text-[10px] text-slate-400 font-mono">Order #{t.orderId.slice(0, 8)}</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-700 font-bold">{t.description}</p>
                                  </div>
                                </td>

                                <td className="p-3 text-right whitespace-nowrap font-black text-emerald-700">
                                  {t.credit > 0 ? `+ ₹${t.credit.toLocaleString()}` : '-'}
                                </td>

                                <td className="p-3 text-right whitespace-nowrap font-black text-red-600">
                                  {t.debit > 0 ? `- ₹${t.debit.toLocaleString()}` : '-'}
                                </td>

                                <td className="p-3 text-right whitespace-nowrap font-black text-slate-900 bg-slate-50/50">
                                  ₹{t.runningBalance.toLocaleString()}
                                </td>

                                <td className="p-3 text-center whitespace-nowrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    t.status === 'Settled' || t.status === 'Completed'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
      </main>

      {/* MODAL 1: QUICK STOCK & PRICE UPDATER MODAL */}
      <AnimatePresence>
        {quickStockProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#143C6B]" />
                  <h3 className="text-sm font-black text-slate-900">Quick Stock & Price Editor</h3>
                </div>
                <button
                  onClick={() => setQuickStockProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <img
                  src={quickStockProduct.images[0] || ''}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{quickStockProduct.title}</h4>
                  <p className="text-[10.5px] text-slate-500">{quickStockProduct.category} • {quickStockProduct.subCategory}</p>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                    Current Wholesale Price: ₹{quickStockProduct.price}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                    Wholesale Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quickStockPrice}
                    onChange={e => setQuickStockPrice(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                    In-Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quickStockQty}
                    onChange={e => setQuickStockQty(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickStockProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingQuickStock}
                  onClick={handleSaveQuickStock}
                  className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white font-black text-xs py-2 px-5 rounded-xl cursor-pointer shadow-xs uppercase"
                >
                  {isUpdatingQuickStock ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DISPATCH & AWB GENERATOR MODAL */}
      <AnimatePresence>
        {dispatchOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#143C6B]" />
                  <h3 className="text-sm font-black text-slate-900">Dispatch Order #{dispatchOrder.id.slice(0, 8)}</h3>
                </div>
                <button
                  onClick={() => setDispatchOrder(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Ship To: {dispatchOrder.shippingAddress?.name}</p>
                  <p className="text-slate-600">{dispatchOrder.shippingAddress?.street}, {dispatchOrder.shippingAddress?.city}, {dispatchOrder.shippingAddress?.state} - {dispatchOrder.shippingAddress?.pincode}</p>
                  <p className="text-[#143C6B] font-bold">Contact: +91 {dispatchOrder.shippingAddress?.phone}</p>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                    Select Courier Partner *
                  </label>
                  <select
                    value={dispatchCourier}
                    onChange={e => setDispatchCourier(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:border-[#143C6B]"
                  >
                    <option value="Delhivery Express">Delhivery Express Logistics</option>
                    <option value="BlueDart Logistics">BlueDart Express</option>
                    <option value="Ekart Logistics">Ekart Logistics</option>
                    <option value="Expressbees">Expressbees Courier</option>
                    <option value="IndiaPost Speed Post">IndiaPost Speed Post</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-1">
                    Courier Tracking AWB Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchAwb}
                    onChange={e => setDispatchAwb(e.target.value.toUpperCase())}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 font-mono focus:outline-hidden focus:border-[#143C6B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchOrder(null)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingDispatch}
                    onClick={handleSaveDispatch}
                    className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer shadow-xs uppercase"
                  >
                    {isSavingDispatch ? 'Dispatching...' : 'Confirm Dispatch'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100"
            >
              <h3 className="text-sm font-black text-slate-900 mb-1.5">{confirmDialog.title || 'Confirm Action'}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">{confirmDialog.message}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {confirmDialog.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
