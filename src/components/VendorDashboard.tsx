import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  ShoppingBag, 
  Plus, 
  TrendingUp, 
  Coins, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  Check, 
  Eye, 
  ChevronRight, 
  LogOut, 
  ArrowLeft, 
  FileSpreadsheet, 
  Sparkles,
  Award,
  ChevronLeft,
  Truck,
  User,
  Camera,
  Phone,
  MapPin,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Vendor } from '../types';

interface VendorDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => Promise<void>;
  onEditProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onClose: () => void;
  activeSubPage?: string | null;
  setActiveSubPage?: (page: string) => void;
}

export default function VendorDashboard({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onClose,
  activeSubPage,
  setActiveSubPage
}: VendorDashboardProps) {
  // Current logged in vendor state
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(() => {
    const saved = localStorage.getItem('quekart_current_vendor');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Tab State
  const activeSubTab = activeSubPage || 'dashboard';
  const setActiveSubTab = setActiveSubPage || (() => {});

  // GST Validation State
  const [isGstVerifying, setIsGstVerifying] = useState(false);
  const [gstVerifyStatus, setGstVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [gstVerifyMessage, setGstVerifyMessage] = useState('');
  const [isGstVerified, setIsGstVerified] = useState(false);

  // Profile-level GSTIN updates
  const [profileGstin, setProfileGstin] = useState('');
  const [profileGstError, setProfileGstError] = useState('');
  const [profileGstSuccess, setProfileGstSuccess] = useState('');

  // Function to simulate government GST portal validation
  const simulateGstVerification = async (gstNumber: string, businessName: string): Promise<boolean> => {
    if (!gstNumber || gstNumber.trim().length !== 15) {
      setGstVerifyStatus('failed');
      setGstVerifyMessage('Invalid GSTIN: Must be exactly 15 alphanumeric characters.');
      return false;
    }
    
    setIsGstVerifying(true);
    setGstVerifyStatus('verifying');
    setGstVerifyMessage('Validating GSTIN structure & state prefix...');
    
    await new Promise(resolve => setTimeout(resolve, 650));
    setGstVerifyMessage('Connecting to GST Common Portal (GSTN)...');
    
    await new Promise(resolve => setTimeout(resolve, 750));
    setGstVerifyMessage('Retrieving corporate credentials & tax ledger records...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsGstVerifying(false);
    setGstVerifyStatus('success');
    setGstVerifyMessage(`GSTIN verified successfully for "${businessName || 'Your Business'}"! Registered in State GST Common Registry.`);
    setIsGstVerified(true);
    return true;
  };

  // Form States for Registering Vendor
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regType, setRegType] = useState<'small' | 'big'>('small');
  const [regCategory, setRegCategory] = useState('Apparel & Sarees');
  const [regGstin, setRegGstin] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Secure Phone Lock-in Login States
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Interactive Editable Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCategory, setProfileCategory] = useState('Apparel & Sarees');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profileDescText, setProfileDescText] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form States for Product Listing
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState('Women Apparel');
  const [pSubCategory, setPSubCategory] = useState('Sarees');
  const [pPrice, setPPrice] = useState<number>(299);
  const [pOrigPrice, setPOrigPrice] = useState<number>(599);
  const [pSizeOptions, setPSizeOptions] = useState<string[]>(['Free Size']);
  const [pSelectedImage, setPSelectedImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Search and Filter for Vendor Products
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Load registered vendors from the backend
  const fetchVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        setSystemVendors(data);
      }
    } catch (err) {
      console.warn('Failed to load vendors from API, offline fallback.', err);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Sync current vendor to local storage when changed
  const handleSelectVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    localStorage.setItem('quekart_current_vendor', JSON.stringify(vendor));
    setActiveSubTab('dashboard');
  };

  const handleLogoutVendor = () => {
    setCurrentVendor(null);
    localStorage.removeItem('quekart_current_vendor');
    setIsEditingProfile(false);
  };

  const handleLoginVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanedLoginInput = loginPhone.trim().replace(/\s+/g, '');
    if (!cleanedLoginInput) {
      setLoginError('Please enter your registered mobile number.');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      // Find a matching vendor by cleaning up phone spaces/hyphens
      const match = systemVendors.find(v => {
        const cleanedDbPhone = v.phone.replace(/[^0-9]/g, '');
        const cleanedInputPhone = cleanedLoginInput.replace(/[^0-9]/g, '');
        // Check if there is a match (either exact or ends with if national prefix differs)
        return cleanedDbPhone === cleanedInputPhone || 
               (cleanedDbPhone.length >= 10 && cleanedInputPhone.length >= 10 && 
                cleanedDbPhone.slice(-10) === cleanedInputPhone.slice(-10));
      });

      if (match) {
        if (match.status === 'suspended') {
          setLoginError('This supplier account is suspended. Please contact QueKart support.');
          return;
        }
        handleSelectVendor(match);
      } else {
        setLoginError('No registered vendor found with this mobile number. Please register as a new supplier below.');
      }
    } catch (err) {
      setLoginError('Authentication service failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (currentVendor) {
      setProfileName(currentVendor.name || '');
      setProfileEmail(currentVendor.email || '');
      setProfilePhone(currentVendor.phone || '');
      setProfileCategory(currentVendor.businessCategory || 'Apparel & Sarees');
      setProfileCity(currentVendor.city || '');
      setProfileState(currentVendor.state || '');
      setProfileDescText(currentVendor.description || '');
      setProfileAvatar(currentVendor.avatar || '');
    }
  }, [currentVendor, activeSubTab]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size is small enough (e.g. < 2.5MB) for easy base64 serialization
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Please choose an image file under 2.5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim() || !profilePhone.trim()) {
      alert('Business name, email, and mobile contact phone are required.');
      return;
    }

    setIsSavingProfile(true);
    const updatedVendor: Vendor = {
      ...currentVendor,
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      businessCategory: profileCategory,
      city: profileCity.trim(),
      state: profileState.trim(),
      description: profileDescText.trim(),
      avatar: profileAvatar.trim()
    };

    try {
      const res = await fetch(`/api/vendors/${currentVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVendor)
      });

      if (res.ok) {
        setCurrentVendor(updatedVendor);
        localStorage.setItem('quekart_current_vendor', JSON.stringify(updatedVendor));
        setIsEditingProfile(false);
        alert('Supplier profile updated successfully!');
        fetchVendors();
      } else {
        const err = await res.json();
        alert(`Failed to save profile changes: ${err.error || 'Server rejected changes'}`);
      }
    } catch (err) {
      console.warn('Network offline, saving changes locally.', err);
      setCurrentVendor(updatedVendor);
      localStorage.setItem('quekart_current_vendor', JSON.stringify(updatedVendor));
      setIsEditingProfile(false);
      alert('Supplier profile updated locally! (Running in Offline Mode)');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Registering a new vendor
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegistrationError('Please fill out all required fields.');
      return;
    }

    let finalVendorType: 'small' | 'big' = 'small';
    const finalGstin = regGstin.trim().toUpperCase();

    if (finalGstin) {
      // If not manually verified via button, trigger validation automatically
      if (!isGstVerified) {
        const ok = await simulateGstVerification(finalGstin, regName.trim());
        if (!ok) {
          setRegistrationError('GSTIN verification failed. Please provide a valid 15-character GSTIN or leave it blank to register as an Unverified Seller.');
          return;
        }
      }
      finalVendorType = 'big'; // Auto marked as Verified Seller
    } else {
      finalVendorType = 'small'; // Auto marked as Unverified Seller
    }

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      vendorType: finalVendorType,
      businessCategory: regCategory,
      gstin: finalGstin || undefined,
      rating: 5.0, // starts with clean 5.0
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVendor)
      });

      if (res.ok) {
        setRegistrationSuccess(true);
        setSystemVendors(prev => [...prev, newVendor]);
        setTimeout(() => {
          handleSelectVendor(newVendor);
          // Reset fields
          setRegName('');
          setRegEmail('');
          setRegPhone('');
          setRegGstin('');
          setIsGstVerified(false);
          setGstVerifyStatus('idle');
          setGstVerifyMessage('');
          setRegistrationSuccess(false);
        }, 1500);
      } else {
        const err = await res.json();
        setRegistrationError(err.error || 'Failed to complete registration.');
      }
    } catch (err) {
      console.warn('Network offline during register, falling back locally.');
      setSystemVendors(prev => [...prev, newVendor]);
      setRegistrationSuccess(true);
      setTimeout(() => {
        handleSelectVendor(newVendor);
        setIsGstVerified(false);
        setGstVerifyStatus('idle');
        setGstVerifyMessage('');
      }, 1500);
    }
  };

  // Vendor product filtering (products listed by this specific vendor)
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

  // Vendor orders (orders containing products from this vendor)
  const vendorOrders = orders.filter(o => 
    o.items.some(item => item.product.vendorId === currentVendor?.id)
  );

  // Calculates total revenue from successfully delivered/completed items
  const totalRevenue = vendorOrders.reduce((sum, order) => {
    const vendorItemsPrice = order.items
      .filter(item => item.product.vendorId === currentVendor?.id)
      .reduce((s, item) => s + (item.product.price * item.quantity), 0);
    return sum + (order.status !== 'Cancelled' ? vendorItemsPrice : 0);
  }, 0);

  // Preset images matching Meesho style
  const imagePresets = [
    { label: 'Royal Banarasi Saree (Pink)', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Embroidered Salwar Suit (Yellow)', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600' },
    { label: 'Designer Chanderi Saree (Green)', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600' },
    { label: 'Golden Wedding Lehenga', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
    { label: 'Men\'s Silk Kurta Set', url: 'https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=600' },
    { label: 'Handcrafted Wooden Clock', url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Premium Lip Gloss Kit', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600' },
    { label: 'Traditional Brass Diya Set', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600' }
  ];

  const handleOpenListingModal = (productToEdit: Product | null = null) => {
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setPTitle(productToEdit.title);
      setPDesc(productToEdit.description);
      setPCategory(productToEdit.category);
      setPSubCategory(productToEdit.subCategory);
      setPPrice(productToEdit.price);
      setPOrigPrice(productToEdit.originalPrice);
      setPSizeOptions(productToEdit.sizeOptions);
      setPSelectedImage(productToEdit.images[0] || '');
      setCustomImageUrl('');
    } else {
      setEditingProduct(null);
      setPTitle('');
      setPDesc('');
      setPCategory('Women Apparel');
      setPSubCategory('Sarees');
      setPPrice(299);
      setPOrigPrice(599);
      setPSizeOptions(['Free Size']);
      setPSelectedImage(imagePresets[0].url);
      setCustomImageUrl('');
    }
    setIsListingModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim() || !pDesc.trim()) {
      alert('Product title and description are required.');
      return;
    }

    const finalImage = customImageUrl.trim() ? customImageUrl.trim() : pSelectedImage;
    const discount = Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-vendor-${Date.now()}`,
      title: pTitle.trim(),
      description: pDesc.trim(),
      category: pCategory,
      subCategory: pSubCategory,
      price: Number(pPrice),
      originalPrice: Number(pOrigPrice),
      discountPercent: discount > 0 ? discount : 0,
      codPrice: Number(pPrice) + 15, // standard small COD processing premium
      hasUpiOffer: true,
      rating: editingProduct ? editingProduct.rating : 5.0,
      ratingCount: editingProduct ? editingProduct.ratingCount : 1,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      images: [finalImage],
      variants: editingProduct ? editingProduct.variants : [
        { colorName: 'Default', imageUrl: finalImage, price: Number(pPrice), originalPrice: Number(pOrigPrice) }
      ],
      soldBy: currentVendor?.name || 'Verified Supplier',
      soldByRating: currentVendor?.rating || 4.2,
      productHighlights: [
        { label: 'Category', value: pCategory },
        { label: 'Fabric / Material', value: pSubCategory }
      ],
      additionalDetails: [
        { label: 'Delivery Time', value: '3-4 Days' },
        { label: 'Return Policy', value: '7-day Easy Return & Refund Guarantee' }
      ],
      sizeOptions: pSizeOptions,
      reviews: editingProduct ? editingProduct.reviews : [],
      vendorId: currentVendor?.id,
      // If Big Vendor, directly 'approved', otherwise 'pending'
      approvalStatus: currentVendor?.vendorType === 'big' ? 'approved' : 'pending',
      // Explicitly lock-out and preserve administrative / automatic tags
      tag: editingProduct ? editingProduct.tag : undefined,
      numericId: editingProduct ? editingProduct.numericId : undefined,
      sponsoredUntil: editingProduct ? editingProduct.sponsoredUntil : undefined,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      isAd: editingProduct ? editingProduct.isAd : undefined
    };

    try {
      if (editingProduct) {
        await onEditProduct(productPayload);
      } else {
        await onAddProduct(productPayload);
      }
      setIsListingModalOpen(false);
    } catch (err: any) {
      alert(`Operation failed: ${err.message || 'Check connection'}`);
    }
  };

  const handleToggleSize = (size: string) => {
    setPSizeOptions(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" id="vendor-panel-root">
      {/* Upper Navigation Header */}
      <header className="bg-white border-b border-gray-100 shadow-3xs sticky top-0 z-40 px-4 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer"
            id="vendor-back-btn"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-lucky-magenta" />
              <span className="flex items-center">
                <span style={{ color: '#143C6B' }}>Que</span>
                <span style={{ color: '#C89D1F' }}>Kart</span>
                <span className="ml-1 text-lucky-magenta">Seller Portal</span>
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-wide">Bharat's Commission-Free Wholesale Hub</p>
          </div>
        </div>

        {currentVendor && (
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-md border ${
              currentVendor.vendorType === 'big' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {currentVendor.vendorType === 'big' ? '👑 Verified Seller (GST)' : '🌱 Unverified Seller'}
            </span>
            <button 
              onClick={handleLogoutVendor} 
              className="text-xs text-red-500 font-extrabold flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-red-50 cursor-pointer"
              id="vendor-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Exit Portal</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col">
        {!currentVendor ? (
          /* REGISTRATION / SELECTION PANEL */
          <div className="flex-1 grid md:grid-cols-5 gap-6 items-start max-w-4xl mx-auto w-full py-6">
            
            {/* Mobile Lock-in Login Panel */}
            <div className="md:col-span-2 space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-3xs space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-lucky-magenta" />
                    <span>Supplier Mobile Login</span>
                  </h2>
                  <p className="text-[10.5px] text-gray-400 font-medium mt-1">Enter your registered mobile number to securely lock into your dashboard.</p>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-[10.5px] font-bold p-2.5 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginVendor} className="space-y-3">
                  <div>
                    <label className="text-[9.5px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Registered Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={loginPhone}
                      onChange={e => {
                        setLoginPhone(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-[#143C6B] hover:bg-[#0f2d52] disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
                  >
                    <span>Secure Sign-In</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Quick demo selection */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-3xs animate-fadeIn">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Registered Demo Suppliers</h3>
                
                {isLoadingVendors ? (
                  <p className="text-xs text-gray-500 font-medium py-2">Loading active directory...</p>
                ) : systemVendors.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No active vendors registered.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {systemVendors.map(vendor => (
                      <div
                        key={vendor.id}
                        className="p-2.5 bg-slate-50/50 rounded-lg border border-gray-100 flex justify-between items-center gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-black text-gray-800 truncate">{vendor.name}</h4>
                          <p className="text-[9.5px] text-gray-400 font-bold mt-0.5">Mob: {vendor.phone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginPhone(vendor.phone);
                            setLoginError('');
                            // Automatically trigger login for outstanding ease of use
                            setTimeout(() => {
                              const match = systemVendors.find(v => v.id === vendor.id);
                              if (match) handleSelectVendor(match);
                            }, 50);
                          }}
                          className="px-2 py-1 bg-lucky-magenta-light text-lucky-magenta hover:bg-lucky-magenta hover:text-white rounded-md text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                        >
                          ⚡ Auto Sign-In
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3.5 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-wide">Verification Tier Benefits:</h4>
                  <ul className="text-[9.5px] text-gray-500 space-y-2 mt-2">
                    <li className="flex gap-1.5 items-start">
                      <span className="text-emerald-600">👑</span>
                      <p><strong>Verified (GST)</strong>: Instant live catalog listing without admin review.</p>
                    </li>
                    <li className="flex gap-1.5 items-start">
                      <span className="text-amber-600">🌱</span>
                      <p><strong>Unverified (No GST)</strong>: Products require quick manual admin review before going live.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="md:col-span-3 bg-white rounded-xl border border-gray-100 p-5 shadow-3xs">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center gap-2 mb-2">
                <PlusCircle className="text-lucky-magenta w-5 h-5" />
                <span>Register a New Supplier Account</span>
              </h2>
              <p className="text-[11px] text-gray-400 font-medium mb-4">Start listing your wholesale products at 0% Commission and reach millions of buyers.</p>

              {registrationError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{registrationError}</span>
                </div>
              )}

              {registrationSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Account registered successfully! Logging you in...</span>
                </div>
              )}

              <form onSubmit={handleRegisterVendor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Wholesale Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahavir Textiles Jaipur"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Business Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. info@mahavirtextiles.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Mobile Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99999 88888"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">GSTIN Number (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 08AAAAA1111A1Z1"
                        value={regGstin}
                        disabled={isGstVerified}
                        onChange={e => {
                          setRegGstin(e.target.value);
                          setIsGstVerified(false);
                          setGstVerifyStatus('idle');
                          setGstVerifyMessage('');
                        }}
                        className="flex-1 text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta uppercase placeholder:normal-case disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                      />
                      <button
                        type="button"
                        disabled={isGstVerifying || isGstVerified || !regGstin.trim()}
                        onClick={() => simulateGstVerification(regGstin, regName || 'your company')}
                        className="px-3 bg-lucky-magenta text-white font-extrabold text-[10px] rounded-lg hover:bg-lucky-magenta-hover transition-all disabled:bg-slate-100 disabled:text-gray-400 cursor-pointer uppercase tracking-wider"
                      >
                        {isGstVerified ? '✓ Verified' : isGstVerifying ? 'Verifying...' : 'Verify GST'}
                      </button>
                    </div>

                    {/* Verification Progress and Message */}
                    {gstVerifyStatus !== 'idle' && (
                      <div className={`mt-2 p-2 rounded-lg border text-[10px] font-bold ${
                        gstVerifyStatus === 'verifying' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' :
                        gstVerifyStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {gstVerifyStatus === 'verifying' && <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                          {gstVerifyStatus === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {gstVerifyStatus === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                          <span>{gstVerifyMessage}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Business Category</label>
                    <select
                      value={regCategory}
                      onChange={e => setRegCategory(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    >
                      <option value="Apparel & Sarees">Apparel & Sarees</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                      <option value="Footwear & Bags">Footwear & Bags</option>
                      <option value="Consumer Electronics">Consumer Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Onboarding Trust Designation</label>
                    <div className={`p-2.5 rounded-lg border text-[11px] font-bold flex items-start gap-2.5 min-h-[46px] transition-all ${
                      isGstVerified 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-150' 
                        : 'bg-amber-50 text-amber-900 border-amber-150'
                    }`}>
                      <span className="text-sm pt-0.5">{isGstVerified ? '👑' : '🌱'}</span>
                      <div>
                        <p className="font-extrabold">{isGstVerified ? 'Auto-Marked: Verified Seller' : 'Auto-Marked: Unverified Seller'}</p>
                        <p className={`text-[9.5px] font-semibold mt-0.5 leading-tight ${
                          isGstVerified ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {isGstVerified 
                            ? 'Instant live directory listing is enabled for your items.' 
                            : 'Products will require manual validation by admin before going live.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-lucky-magenta hover:bg-lucky-magenta-hover text-white font-extrabold text-xs py-3 px-4 rounded-lg cursor-pointer transition-all uppercase tracking-wider shadow-2xs mt-2"
                >
                  Create commissions-free shop
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ACTIVE LOGGED-IN VENDOR WORKSPACE */
          <div className="space-y-6">
            
            {/* Business Card Banner */}
            <div className="bg-gradient-to-r from-lucky-magenta to-lucky-magenta-hover text-white rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏪</span>
                  <h2 className="text-base font-black uppercase tracking-wide">{currentVendor.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/80 font-bold mt-1.5">
                  <span>Category: <strong>{currentVendor.businessCategory}</strong></span>
                  <span>•</span>
                  <span>GSTIN Status: <strong className={currentVendor.vendorType === 'big' ? 'text-emerald-300' : 'text-amber-300'}>{currentVendor.vendorType === 'big' ? `${currentVendor.gstin} (Verified)` : 'Not Verified'}</strong></span>
                  <span>•</span>
                  <span>Contact: <strong>{currentVendor.phone}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs flex-shrink-0 self-start sm:self-auto">
                <div className="text-center px-2">
                  <p className="text-[9px] text-lucky-gold uppercase font-black tracking-wider">Rating</p>
                  <p className="text-sm font-black text-amber-400 mt-0.5">★ {currentVendor.rating}</p>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center px-2">
                  <p className="text-[9px] text-lucky-gold uppercase font-black tracking-wider">Verification</p>
                  <p className={`text-xs font-black mt-0.5 uppercase tracking-wide ${currentVendor.vendorType === 'big' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {currentVendor.vendorType === 'big' ? '👑 Verified' : '🌱 Unverified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">Net Earnings</span>
                  <p className="text-sm font-black text-gray-800 mt-0.5">₹ {totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="bg-lucky-magenta-light text-lucky-magenta p-2.5 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">My Products</span>
                  <p className="text-sm font-black text-gray-800 mt-0.5">{vendorProducts.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">Awaiting Review</span>
                  <p className="text-sm font-black text-gray-800 mt-0.5">
                    {vendorProducts.filter(p => p.approvalStatus === 'pending').length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="bg-lucky-magenta-light text-lucky-magenta p-2.5 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">Client Orders</span>
                  <p className="text-sm font-black text-gray-800 mt-0.5">{vendorOrders.length}</p>
                </div>
              </div>
            </div>

            {/* Sub Tabs Toggle Bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-1 flex shadow-3xs" id="vendor-dashboard-subtabs">
              {(['dashboard', 'products', 'orders', 'profile'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`flex-1 text-center py-2 text-xs font-extrabold uppercase tracking-wide rounded-lg cursor-pointer transition-all ${
                    activeSubTab === tab 
                      ? 'bg-lucky-magenta text-white shadow-2xs' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SUB-TABS VIEWS RENDERING */}
            <AnimatePresence mode="wait">
              {activeSubTab === 'dashboard' && (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid md:grid-cols-3 gap-6"
                >
                  {/* Left Column: Recent Orders Fulfillment */}
                  <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-3xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📦 Recent Orders Needing Shipment</span>
                        <span className="bg-lucky-magenta-light text-lucky-magenta text-[8px] font-black px-1.5 py-0.2 rounded-xs">{vendorOrders.length} Total</span>
                      </h3>
                      <button onClick={() => setActiveSubTab('orders')} className="text-[10px] text-lucky-magenta font-extrabold hover:underline">View All Orders</button>
                    </div>

                    {vendorOrders.length === 0 ? (
                      <div className="py-12 text-center">
                        <span className="text-3xl">📭</span>
                        <h4 className="text-xs font-bold text-gray-400 mt-2">No orders placed by customers yet.</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Share your catalog or lower prices to attract clients!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {vendorOrders.slice(0, 3).map(order => {
                          const vendorItems = order.items.filter(item => item.product.vendorId === currentVendor.id);
                          const vendorSubtotal = vendorItems.reduce((sub, item) => sub + (item.product.price * item.quantity), 0);
                          return (
                            <div key={order.id} className="py-3 flex flex-col xs:flex-row justify-between xs:items-center gap-3">
                              <div>
                                <span className="text-[10px] text-lucky-magenta font-black">ID: {order.id.slice(0, 10).toUpperCase()}</span>
                                <p className="text-xs font-semibold text-gray-800 mt-0.5">{vendorItems.map(vi => `${vi.product.title} (${vi.selectedSize}) x${vi.quantity}`).join(', ')}</p>
                                <span className="text-[10px] text-gray-400 font-semibold">{order.orderDate} • Deliver to {order.shippingAddress.city}</span>
                              </div>
                              <div className="text-right flex-shrink-0 self-end xs:self-auto">
                                <span className="text-xs font-black text-gray-800">₹ {vendorSubtotal}</span>
                                <div className="mt-1">
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                                    order.status === 'Delivered Early' ? 'bg-emerald-50 text-emerald-500' :
                                    'bg-lucky-magenta-light text-lucky-magenta'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Mini Catalog Overview */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-3xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">⚡ Fast Action</h3>
                    </div>

                    <button 
                      onClick={() => handleOpenListingModal(null)}
                      className="w-full bg-lucky-magenta hover:bg-lucky-magenta-hover text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-3xs transition-all"
                    >
                      <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                      <span>List New Wholesale Item</span>
                    </button>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Top Selling Classifications</h4>
                      {['Women Apparel', 'Home & Kitchen', 'Cosmetics & Beauty'].map(cat => {
                        const count = vendorProducts.filter(p => p.category === cat).length;
                        return (
                          <div key={cat} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                            <span className="text-xs font-bold text-gray-700">{cat}</span>
                            <span className="bg-white border border-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded-md">{count} items</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSubTab === 'products' && (
                <motion.div
                  key="products-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Search and Filters */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-200/80 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta bg-slate-50/50"
                      />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      {(['all', 'approved', 'pending', 'rejected'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setStatusFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap cursor-pointer transition-all ${
                            statusFilter === f 
                              ? 'bg-lucky-magenta/10 text-lucky-magenta border border-lucky-magenta/20' 
                              : 'bg-slate-50 text-gray-500 hover:text-gray-800 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          {f} ({
                            f === 'all' ? vendorProducts.length :
                            f === 'approved' ? vendorProducts.filter(p => p.approvalStatus === 'approved' || !p.approvalStatus).length :
                            vendorProducts.filter(p => p.approvalStatus === f).length
                          })
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Listings Table Grid */}
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-3xs">
                      <span className="text-4xl">🏷️</span>
                      <h3 className="text-sm font-bold text-gray-700 mt-3">No matching products found</h3>
                      <p className="text-xs text-gray-400 mt-1">Try listing a new item or updating your filters.</p>
                      <button 
                        onClick={() => handleOpenListingModal(null)}
                        className="bg-lucky-magenta text-white font-extrabold text-xs py-2 px-4 rounded-lg mt-4 cursor-pointer"
                      >
                        Add Product Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map(p => (
                        <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-3xs hover:shadow-2xs transition-shadow flex flex-col justify-between relative">
                          
                          {/* Approval Status Header Ribbon */}
                          <div className={`absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-3xs z-10 ${
                            p.approvalStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            p.approvalStatus === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {p.approvalStatus === 'pending' ? 'Pending Approval' :
                             p.approvalStatus === 'rejected' ? 'Rejected' :
                             'Live / Active'}
                          </div>

                          <div>
                            <div className="h-44 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                              <img 
                                src={p.images[0]} 
                                alt={p.title} 
                                className="object-cover w-full h-full"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="p-4 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-lucky-magenta font-extrabold uppercase tracking-wider">{p.category} • {p.subCategory}</span>
                                {p.numericId && (
                                  <span className="bg-slate-100 text-slate-700 font-mono font-black text-[9px] px-1.5 py-0.2 rounded-sm border border-slate-200/50">
                                    ID: #{p.numericId}
                                  </span>
                                )}
                              </div>
                              {p.sponsoredUntil && new Date(p.sponsoredUntil) > new Date() && (
                                <div className="mt-1">
                                  <span className="text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200 font-black uppercase px-2 py-0.5 rounded-md inline-block">
                                    ⭐ Sponsored Active
                                  </span>
                                </div>
                              )}
                              <h4 className="text-xs font-black text-gray-800 line-clamp-1">{p.title}</h4>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-800">₹{p.price}</span>
                                <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span>
                                <span className="text-[9px] text-lucky-green font-extrabold">{p.discountPercent}% OFF</span>
                              </div>

                              <p className="text-[10px] text-gray-400 line-clamp-2">{p.description}</p>

                              {p.rejectionReason && p.approvalStatus === 'rejected' && (
                                <div className="bg-red-50 border border-red-100 text-[10px] text-red-600 font-bold p-2.5 rounded-lg mt-2">
                                  <strong>Feedback:</strong> {p.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4 pt-0 border-t border-gray-50 mt-3 flex gap-2">
                            <button
                              onClick={() => handleOpenListingModal(p)}
                              className="flex-1 border border-gray-200 hover:border-lucky-magenta/40 hover:text-lucky-magenta text-[10px] font-black uppercase py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => {
                                triggerConfirm(
                                  'Are you sure you want to delete this product listing?',
                                  () => {
                                    onDeleteProduct(p.id);
                                  },
                                  'Delete Listing',
                                  'Delete'
                                );
                              }}
                              className="border border-red-100 hover:bg-red-50 text-red-500 p-2 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSubTab === 'orders' && (
                <motion.div
                  key="orders-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-3xs space-y-4"
                >
                  <div className="pb-2 border-b border-gray-100">
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Wholesale Orders Directory</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manage and ship items sold under your business catalog.</p>
                  </div>

                  {vendorOrders.length === 0 ? (
                    <div className="py-16 text-center">
                      <span className="text-4xl">📦</span>
                      <h4 className="text-xs font-black text-gray-400 mt-3">No wholesale orders placed yet</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Your catalog items are active but have no customer demand logs yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 divide-y divide-gray-100">
                      {vendorOrders.map(order => {
                        const vendorItems = order.items.filter(item => item.product.vendorId === currentVendor.id);
                        const vendorSubtotal = vendorItems.reduce((sub, item) => sub + (item.product.price * item.quantity), 0);
                        return (
                          <div key={order.id} className="pt-4 first:pt-0 flex flex-col md:flex-row gap-4 justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="bg-lucky-magenta-light text-lucky-magenta text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  ID: {order.id.slice(0, 12).toUpperCase()}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">{order.orderDate}</span>
                              </div>

                              <div className="space-y-1.5 pl-1.5 border-l-2 border-lucky-magenta-light">
                                {vendorItems.map(item => (
                                  <div key={item.id} className="flex gap-3 items-center">
                                    <img 
                                      src={item.product.images[0]} 
                                      alt={item.product.title} 
                                      className="w-10 h-10 object-cover rounded-md border border-gray-100"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">{item.product.title}</p>
                                      <p className="text-[10px] text-gray-400 mt-0.5">Size: <strong>{item.selectedSize}</strong> • Quantity: <strong>{item.quantity}</strong> • Color: <strong>{item.product.variants[item.selectedVariantIndex]?.colorName || 'Default'}</strong></p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="bg-slate-50/50 p-2.5 rounded-lg text-[10px] text-gray-500 space-y-0.5 max-w-md">
                                <p className="font-bold text-gray-700">Client Delivery Address:</p>
                                <p>{order.shippingAddress.name} • {order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase block">Your Payout subtotal</span>
                                <span className="text-base font-black text-gray-800">₹ {vendorSubtotal}</span>
                              </div>

                              <div className="flex gap-1.5 items-center">
                                <span className="text-[9px] text-gray-400 font-extrabold uppercase">Order Status:</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  order.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                                  order.status === 'Delivered Early' ? 'bg-emerald-50 text-emerald-500' :
                                  'bg-blue-50 text-blue-500'
                                }`}>
                                  {order.status}
                                </span>
                              </div>

                              <div className="mt-1 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <Truck className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[9.5px] text-gray-500 font-bold">Fulfillment Managed globally by QueKart Courier Partners</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSubTab === 'profile' && (
                <motion.div
                  key={isEditingProfile ? "profile-edit" : "profile-view"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 max-w-xl mx-auto w-full"
                >
                  {!isEditingProfile ? (
                    /* VIEW MODE */
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-3xs">
                        <div className="pb-4 border-b border-gray-100 mb-4 text-center space-y-3 animate-fadeIn">
                          <div className="relative w-20 h-20 mx-auto">
                            {currentVendor.avatar ? (
                              <img 
                                src={currentVendor.avatar} 
                                alt={currentVendor.name} 
                                className="w-20 h-20 rounded-full object-cover border-2 border-lucky-magenta shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="bg-gradient-to-br from-lucky-magenta-light to-lucky-magenta/20 text-lucky-magenta w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto font-black shadow-inner">
                                🏪
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-3xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-gray-800 uppercase tracking-wider">{currentVendor.name}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Wholesale Seller Registry Certificate</p>
                          </div>

                          {currentVendor.description && (
                            <p className="text-xs text-gray-500 text-center italic max-w-md mx-auto px-4 bg-slate-50 py-2 rounded-lg border border-slate-100/50">
                              "{currentVendor.description}"
                            </p>
                          )}

                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-lucky-magenta hover:bg-lucky-magenta-hover text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-3xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Supplier Profile</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Vendor ID</span>
                            <span className="font-mono text-gray-800 font-black text-[11px]">{currentVendor.id}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Seller Type</span>
                            <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-md ${
                              currentVendor.vendorType === 'big' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {currentVendor.vendorType === 'big' ? '👑 Verified Seller (GST)' : '🌱 Unverified Seller'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">GSTIN Certification</span>
                            <span className={`font-semibold uppercase ${currentVendor.vendorType === 'big' ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>
                              {currentVendor.gstin || 'NOT CERTIFIED (UNVERIFIED)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Registered Phone</span>
                            <span className="font-semibold text-gray-800">{currentVendor.phone}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Registered Email</span>
                            <span className="font-semibold text-gray-800">{currentVendor.email}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Operating Location</span>
                            <span className="font-semibold text-gray-800">
                              {currentVendor.city && currentVendor.state 
                                ? `${currentVendor.city}, ${currentVendor.state}` 
                                : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Seller Reputation</span>
                            <span className="font-black text-amber-500">★ {currentVendor.rating} (Verified)</span>
                          </div>
                          <div className="flex justify-between items-center py-2 text-xs">
                            <span className="text-gray-400 font-extrabold uppercase tracking-wide">Onboarding Date</span>
                            <span className="font-semibold text-gray-500">{new Date(currentVendor.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* GST SELF-SERVICE UPGRADE MODULE */}
                      {currentVendor.vendorType !== 'big' && (
                        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100 rounded-xl p-5 shadow-3xs space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            <div>
                              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Upgrade to Verified Seller</h4>
                              <p className="text-[10px] text-amber-700 font-medium mt-0.5">Enter and verify your GSTIN to bypass manual admin reviews & take listings live instantly.</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter 15-character GSTIN (e.g. 08AAAAA1111A1Z1)"
                                value={profileGstin}
                                disabled={isGstVerifying}
                                onChange={e => {
                                  setProfileGstin(e.target.value);
                                  setProfileGstError('');
                                  setProfileGstSuccess('');
                                  setGstVerifyStatus('idle');
                                }}
                                className="flex-1 text-xs font-semibold border border-amber-200 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-lucky-magenta uppercase placeholder:normal-case disabled:bg-slate-100 disabled:text-gray-400"
                              />
                              <button
                                type="button"
                                disabled={isGstVerifying || !profileGstin.trim()}
                                onClick={async () => {
                                  setProfileGstError('');
                                  setProfileGstSuccess('');
                                  const formattedGst = profileGstin.trim().toUpperCase();
                                  const ok = await simulateGstVerification(formattedGst, currentVendor.name);
                                  if (ok) {
                                    // Save to backend
                                    const upgradedVendor: Vendor = {
                                      ...currentVendor,
                                      gstin: formattedGst,
                                      vendorType: 'big'
                                    };
                                    try {
                                      const res = await fetch(`/api/vendors/${currentVendor.id}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(upgradedVendor)
                                      });
                                      if (res.ok) {
                                        setProfileGstSuccess('Congratulations! Your account is now verified.');
                                        setCurrentVendor(upgradedVendor);
                                        localStorage.setItem('quekart_current_vendor', JSON.stringify(upgradedVendor));
                                        setProfileGstin('');
                                        fetchVendors();
                                      } else {
                                        setProfileGstError('Failed to save upgraded status to server registry.');
                                      }
                                    } catch (err) {
                                      console.warn('Offline backup: Upgrading vendor profile locally.');
                                      setProfileGstSuccess('Congratulations! Your account is verified (Local).');
                                      setCurrentVendor(upgradedVendor);
                                      localStorage.setItem('quekart_current_vendor', JSON.stringify(upgradedVendor));
                                      setProfileGstin('');
                                    }
                                  } else {
                                    setProfileGstError('GSTIN structure validation failed. Ensure it is exactly 15 alphanumeric characters.');
                                  }
                                }}
                                className="px-3 bg-lucky-magenta hover:bg-lucky-magenta-hover text-white font-extrabold text-[10px] rounded-lg disabled:bg-slate-100 disabled:text-gray-400 cursor-pointer uppercase tracking-wider transition-colors shrink-0"
                              >
                                {isGstVerifying ? 'Verifying...' : 'Verify & Upgrade'}
                              </button>
                            </div>

                            {/* Progress display */}
                            {gstVerifyStatus === 'verifying' && (
                              <div className="bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-800 p-2.5 rounded-lg flex items-center gap-2 animate-pulse">
                                <div className="w-2.5 h-2.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                <span>{gstVerifyMessage}</span>
                              </div>
                            )}

                            {profileGstError && (
                              <div className="bg-red-50 border border-red-100 text-[10px] font-bold text-red-700 p-2.5 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <span>{profileGstError}</span>
                              </div>
                            )}

                            {profileGstSuccess && (
                              <div className="bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 p-2.5 rounded-lg flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{profileGstSuccess}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* EDITING MODE */
                    <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-gray-100 p-5 shadow-3xs space-y-5 animate-fadeIn">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <div>
                          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Edit Supplier Details</h3>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Maintain updated profile and branding information</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] text-gray-500 font-extrabold uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Interactive Avatar Selection */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                        <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">1. Choose Brand Logo or Profile Photo</label>
                        
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 w-16 h-16 rounded-full bg-white border border-gray-100 overflow-hidden flex items-center justify-center shadow-3xs relative group">
                            {profileAvatar ? (
                              <img 
                                src={profileAvatar} 
                                alt="Avatar Preview" 
                                className="w-16 h-16 object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-2xl">🏪</span>
                            )}
                            {profileAvatar && (
                              <button
                                type="button"
                                onClick={() => setProfileAvatar('')}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-white font-black uppercase"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="flex-1">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-lucky-magenta/50 rounded-lg text-[10.5px] font-extrabold text-slate-700 transition-colors shadow-3xs cursor-pointer">
                              <Camera className="w-3.5 h-3.5 text-gray-400" />
                              <span>Upload custom photo</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAvatarFileChange} 
                                className="hidden" 
                              />
                            </label>
                            <p className="text-[9px] text-gray-400 mt-1">Accepts PNG, JPG, or WebP up to 2.5MB. Instant Base64 serialization.</p>
                          </div>
                        </div>

                        {/* Presets Grid */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-200/50">
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Or select an elegant demo preset logo:</span>
                          <div className="grid grid-cols-6 gap-2">
                            {[
                              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
                              'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
                              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
                            ].map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProfileAvatar(url)}
                                className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                  profileAvatar === url ? 'border-lucky-magenta scale-95 shadow-xs' : 'border-white hover:border-gray-200'
                                }`}
                              >
                                <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Direct URL input */}
                        <div className="pt-1.5">
                          <input
                            type="text"
                            placeholder="Or paste custom image URL..."
                            value={profileAvatar.startsWith('data:') ? '' : profileAvatar}
                            onChange={e => setProfileAvatar(e.target.value)}
                            className="w-full text-[10.5px] border border-gray-200 rounded-lg p-2 bg-white"
                          />
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Business Name *</label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Mobile Contact * (Lock-in key)</label>
                            <input
                              type="tel"
                              required
                              value={profilePhone}
                              onChange={e => setProfilePhone(e.target.value)}
                              className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden bg-slate-50/50"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Registered Email *</label>
                            <input
                              type="email"
                              required
                              value={profileEmail}
                              onChange={e => setProfileEmail(e.target.value)}
                              className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1">
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Business Category</label>
                            <select
                              value={profileCategory}
                              onChange={e => setProfileCategory(e.target.value)}
                              className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden"
                            >
                              <option value="Apparel & Sarees">Apparel & Sarees</option>
                              <option value="Home Decor & Textiles">Home Decor & Textiles</option>
                              <option value="Handicrafts & Gifts">Handicrafts & Gifts</option>
                              <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                            </select>
                          </div>

                          <div className="col-span-1">
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">City</label>
                            <input
                              type="text"
                              placeholder="e.g. Jaipur"
                              value={profileCity}
                              onChange={e => setProfileCity(e.target.value)}
                              className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">State</label>
                            <input
                              type="text"
                              placeholder="e.g. Rajasthan"
                              value={profileState}
                              onChange={e => setProfileState(e.target.value)}
                              className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Business Bio / Brand Story</label>
                          <textarea
                            rows={3}
                            placeholder="Tell buyers about your manufacturing process, legacy, or wholesale capabilities..."
                            value={profileDescText}
                            onChange={e => setProfileDescText(e.target.value)}
                            className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 focus:border-lucky-magenta focus:outline-hidden resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-extrabold text-gray-500 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-5 py-2 bg-lucky-magenta hover:bg-lucky-magenta-hover disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition-colors"
                        >
                          {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="bg-lucky-magenta-light/40 rounded-xl p-4 border border-lucky-magenta-light space-y-2">
                    <h4 className="text-[11px] font-black text-lucky-magenta uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-lucky-magenta" />
                      <span>QueKart Commission-Free Pledge</span>
                    </h4>
                    <p className="text-[10px] text-lucky-magenta/90 leading-relaxed font-semibold">
                      QueKart charges absolutely **0% commissions** on all listed products. 100% of the listed catalog cost is disbursed instantly into your supplier bank account after verified shipping delivery. Safe, honest, and truly Indian.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </main>

      {/* PRODUCT LISTING / EDITING MODAL DRAWER */}
      <AnimatePresence>
        {isListingModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4"
              id="vendor-product-modal"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  {editingProduct ? 'Edit Listed Product Details' : 'List New Wholesale Product'}
                </h3>
                <button 
                  onClick={() => setIsListingModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-gray-400 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                
                {/* Image Selection Area */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">1. Product Catalog Photography</label>
                  
                  {/* Selected image preview */}
                  <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <img 
                      src={customImageUrl.trim() ? customImageUrl : pSelectedImage} 
                      alt="Catalog selection preview" 
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-700">Currently Selected Photo Accent</p>
                      <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Choose from our instant premium Meesho-styled templates below OR paste a direct web image link.</p>
                    </div>
                  </div>

                  {/* Preset Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {imagePresets.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPSelectedImage(img.url);
                          setCustomImageUrl('');
                        }}
                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          pSelectedImage === img.url && !customImageUrl 
                            ? 'border-lucky-magenta scale-95 shadow-xs' 
                            : 'border-transparent hover:border-slate-300'
                        }`}
                        title={img.label}
                      >
                        <img 
                          src={img.url} 
                          alt={img.label} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Custom link input */}
                  <div>
                    <input
                      type="text"
                      placeholder="Paste direct product image URL (Optional)"
                      value={customImageUrl}
                      onChange={e => setCustomImageUrl(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                </div>

                {/* Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Traditional Banarasi Cotton Saree"
                      value={pTitle}
                      onChange={e => setPTitle(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Catalog Classification</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={pCategory}
                        onChange={e => setPCategory(e.target.value)}
                        className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                      >
                        <option value="Women Apparel">Women Apparel</option>
                        <option value="Men Apparel">Men Apparel</option>
                        <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Consumer Electronics">Consumer Electronics</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Saree / Kurtis / Watch"
                        value={pSubCategory}
                        onChange={e => setPSubCategory(e.target.value)}
                        className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Wholesale Cost (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 299"
                      value={pPrice}
                      onChange={e => setPPrice(Number(e.target.value))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">M.R.P. Sticker Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 599"
                      value={pOrigPrice}
                      onChange={e => setPOrigPrice(Number(e.target.value))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Calculated Discount</label>
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-xs font-black text-lucky-green flex items-center justify-center">
                      {pOrigPrice > pPrice 
                        ? `${Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100)}% Discount` 
                        : 'No Discount'}
                    </div>
                  </div>
                </div>

                {/* Size options */}
                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Size Options Available</label>
                  <div className="flex flex-wrap gap-2">
                    {['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Standard Size'].map(sz => {
                      const active = pSizeOptions.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            active 
                              ? 'bg-lucky-magenta text-white border-lucky-magenta shadow-3xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-slate-50'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-1">Product Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide rich details of fabrics, fitting instructions, embroidery work, material composition, etc."
                    value={pDesc}
                    onChange={e => setPDesc(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 focus:outline-hidden focus:border-lucky-magenta"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsListingModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-lucky-magenta hover:bg-lucky-magenta-hover text-white font-extrabold text-xs py-2 px-5 rounded-lg cursor-pointer shadow-3xs transition-all uppercase tracking-wider"
                  >
                    {editingProduct ? 'Update Listing' : 'Publish Catalog'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100"
            >
              <h3 className="text-sm font-extrabold text-slate-900 mb-2">{confirmDialog.title || 'Confirm Action'}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer"
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
