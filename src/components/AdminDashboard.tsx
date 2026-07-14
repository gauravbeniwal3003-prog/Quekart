import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Ticket, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Coins, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Tag,
  Database,
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Coupon, CartItem } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onClose: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  coupons,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddCoupon,
  onDeleteCoupon,
  onClose
}: AdminDashboardProps) {
  // Admin Passcode State
  const [adminPasscode, setAdminPasscode] = useState(() => localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123');
  const handlePasscodeChange = (newPass: string) => {
    setAdminPasscode(newPass);
    localStorage.setItem('lucky_admin_secret', newPass);
  };

  // Database Synchronization States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [syncReport, setSyncReport] = useState<{ products: number; coupons: number; orders: number } | null>(null);

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
      const res = await fetch('/api/admin/sync-demo-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSyncReport({
          products: data.productsSynced,
          coupons: data.couponsSynced,
          orders: data.ordersSynced
        });
        setSyncStatus('success');
      } else {
        setSyncStatus('failed');
        const err = await res.json();
        alert(`⚠️ Database Sync Failed:\n${err.error || 'Check database permissions or database connection.'}`);
      }
    } catch (e: any) {
      console.error(e);
      setSyncStatus('failed');
      alert(`❌ Communication Error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  
  // Modals & Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // New/Edit Product Form Fields
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState(299);
  const [pOriginalPrice, setPOriginalPrice] = useState(599);
  const [pCategory, setPCategory] = useState('Kurtis & Suits');
  const [pSubCategory, setPSubCategory] = useState('Anarkali Sets');
  const [pDescription, setPDescription] = useState('');
  const [pImages, setPImages] = useState<string[]>(['']);
  const [pSizeOptions, setPSizeOptions] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [pTag, setPTag] = useState('');
  const [pCodPrice, setPCodPrice] = useState(45);
  const [pHasUpiOffer, setPHasUpiOffer] = useState(true);

  // --- CAMERA AND FILE UPLOAD STATES & REFS ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // --- 1:1 CROP MODAL STATE ---
  const [croppingSrc, setCroppingSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const cropperCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Mouse & Touch Drag Crop Event Handlers
  const handleMouseDownCrop = (e: React.MouseEvent) => {
    setIsDraggingCrop(true);
    setCropDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };
  const handleMouseMoveCrop = (e: React.MouseEvent) => {
    if (!isDraggingCrop) return;
    setCropOffset({
      x: e.clientX - cropDragStart.x,
      y: e.clientY - cropDragStart.y
    });
  };
  const handleMouseUpCrop = () => {
    setIsDraggingCrop(false);
  };
  const handleTouchStartCrop = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingCrop(true);
      setCropDragStart({
        x: e.touches[0].clientX - cropOffset.x,
        y: e.touches[0].clientY - cropOffset.y
      });
    }
  };
  const handleTouchMoveCrop = (e: React.TouchEvent) => {
    if (!isDraggingCrop || e.touches.length !== 1) return;
    setCropOffset({
      x: e.touches[0].clientX - cropDragStart.x,
      y: e.touches[0].clientY - cropDragStart.y
    });
  };
  const handleTouchUpCrop = () => {
    setIsDraggingCrop(false);
  };

  // Real-time canvas rendering for previewing crop
  React.useEffect(() => {
    if (!croppingSrc) return;
    const img = new Image();
    img.src = croppingSrc;
    img.onload = () => {
      const canvas = cropperCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 500; // Final high-res 1:1 crop square size
      canvas.width = size;
      canvas.height = size;

      // Dark solid background behind image
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);

      const imgRatio = img.width / img.height;
      let dWidth = size;
      let dHeight = size;

      if (imgRatio > 1) {
        dWidth = size * imgRatio;
      } else {
        dHeight = size / imgRatio;
      }

      dWidth *= cropZoom;
      dHeight *= cropZoom;

      // UI container width is 320px, final high-res is 500px. Scale the drag speed perfectly!
      const scaleFactor = 500 / 320;
      const x = (size - dWidth) / 2 + (cropOffset.x * scaleFactor);
      const y = (size - dHeight) / 2 + (cropOffset.y * scaleFactor);

      ctx.drawImage(img, x, y, dWidth, dHeight);
    };
  }, [croppingSrc, cropZoom, cropOffset]);

  const handleCropConfirm = async () => {
    const canvas = cropperCanvasRef.current;
    if (!canvas) return;
    setImageUploadLoading(true);
    try {
      const base64Data = canvas.toDataURL('image/jpeg', 0.85);
      setCroppingSrc(null); // Close modal instantly

      const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ image: base64Data })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setPImages(prev => {
            const filtered = prev.filter(Boolean);
            return [...filtered, data.imageUrl];
          });
        }
      } else {
        const err = await res.json();
        alert(`Failed to host file: ${err.error || 'Check server configuration.'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Cropping confirmation error: ${err.message}`);
    } finally {
      setImageUploadLoading(false);
    }
  };
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Default to back camera for product shots on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Video playback start failed:", err));
      }
      
      // Enumerate other cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      alert(`Could not open camera stream: ${err.message || err}. Please verify that you have given camera permissions to this frame/tab.`);
      setIsCameraOpen(false);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Video playback switch failed:", err));
      }
    } catch (err) {
      console.error("Failed to swap active camera device:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    setImageUploadLoading(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;
      const size = Math.min(vWidth, vHeight);
      
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the center square from the video source
        const sx = (vWidth - size) / 2;
        const sy = (vHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const base64Data = canvas.toDataURL('image/jpeg', 0.85);
        
        // Terminate camera feeds instantly to free resources
        stopCamera();

        // Safe secure upload through our proxied endpoint
        const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Secret': adminSecret
          },
          body: JSON.stringify({ image: base64Data })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setPImages(prev => {
              // Strip empty placeholders and insert the newly generated CDN link
              const filtered = prev.filter(Boolean);
              return [...filtered, data.imageUrl];
            });
          }
        } else {
          const err = await res.json();
          alert(`Image hosting upload failed: ${err.error || 'Server rejected request.'}`);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert(`Snap capture error: ${e.message}`);
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImageUploadLoading(true);
    try {
      const file = files[0];
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Instead of direct uploading, assign raw base64 data to crop state and launch custom cropper dialog
      setCroppingSrc(base64Data);
      setCropZoom(1.0);
      setCropOffset({ x: 0, y: 0 });
    } catch (err: any) {
      console.error(err);
      alert(`File reading error: ${err.message}`);
    } finally {
      setImageUploadLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  // New Coupon Form Fields
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'flat' | 'percentage'>('flat');
  const [cValue, setCValue] = useState(50);
  const [cMinPurchase, setCMinPurchase] = useState(299);
  const [cDescription, setCDescription] = useState('Flat ₹50 OFF on orders above ₹299');

  // Reset Product Form
  const resetProductForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setPTitle(product.title);
      setPPrice(product.price);
      setPOriginalPrice(product.originalPrice);
      setPCategory(product.category);
      setPSubCategory(product.subCategory);
      setPDescription(product.description);
      setPImages(product.images.length > 0 ? product.images : ['']);
      setPSizeOptions(product.sizeOptions);
      setPTag(product.tag || '');
      setPCodPrice(product.codPrice || 45);
      setPHasUpiOffer(product.hasUpiOffer || false);
    } else {
      setEditingProduct(null);
      setPTitle('');
      setPPrice(299);
      setPOriginalPrice(599);
      setPCategory('Kurtis & Suits');
      setPSubCategory('Anarkali Sets');
      setPDescription('');
      setPImages(['']);
      setPSizeOptions(['S', 'M', 'L', 'XL']);
      setPTag('');
      setPCodPrice(45);
      setPHasUpiOffer(true);
    }
  };

  // Submit Product Form
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanImages = pImages.map(img => img.trim()).filter(Boolean);
    if (cleanImages.length === 0) {
      cleanImages.push('https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400');
    }

    const discountPercent = Math.round(((pOriginalPrice - pPrice) / pOriginalPrice) * 100);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: pTitle,
      description: pDescription || 'Premium high quality product with direct-from-factory pricing.',
      category: pCategory,
      subCategory: pSubCategory,
      price: pPrice,
      originalPrice: pOriginalPrice,
      discountPercent: discountPercent > 0 ? discountPercent : 0,
      codPrice: pCodPrice,
      hasUpiOffer: pHasUpiOffer,
      rating: editingProduct ? editingProduct.rating : 4.5,
      ratingCount: editingProduct ? editingProduct.ratingCount : 124,
      reviewCount: editingProduct ? editingProduct.reviewCount : 48,
      images: cleanImages,
      variants: editingProduct ? editingProduct.variants : [
        {
          colorName: 'Standard',
          imageUrl: cleanImages[0],
          price: pPrice,
          originalPrice: pOriginalPrice
        }
      ],
      soldBy: editingProduct ? editingProduct.soldBy : 'Gaurav Garments',
      soldByRating: editingProduct ? editingProduct.soldByRating : 4.8,
      productHighlights: editingProduct ? editingProduct.productHighlights : [
        { label: 'Fabric', value: 'Cotton Blend' },
        { label: 'Stitch Type', value: 'Fully Stitched' },
        { label: 'Occasion', value: 'Festive & Casual' }
      ],
      additionalDetails: editingProduct ? editingProduct.additionalDetails : [
        { label: 'Manufacturer', value: 'Gaurav Garments Private Limited' },
        { label: 'Country of Origin', value: 'India' }
      ],
      sizeOptions: pSizeOptions.filter(Boolean),
      tag: pTag || undefined,
      reviews: editingProduct ? editingProduct.reviews : []
    };

    if (editingProduct) {
      onEditProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }
    setIsProductModalOpen(false);
  };

  // Submit Coupon Form
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim()) return;

    const newCoupon: Coupon = {
      code: cCode.toUpperCase().replace(/\s+/g, ''),
      discountType: cType,
      value: Number(cValue),
      minPurchase: Number(cMinPurchase),
      description: cDescription || `${cType === 'flat' ? '₹' : ''}${cValue}${cType === 'percentage' ? '%' : ''} OFF`
    };

    onAddCoupon(newCoupon);
    setIsCouponModalOpen(false);
    // Reset coupon fields
    setCCode('');
    setCValue(50);
    setCMinPurchase(299);
    setCDescription('');
  };

  // Calculate statistics
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const activeCouponsCount = coupons.length;
  const totalProductsCount = products.length;

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.shippingAddress.name.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Extract unique categories for filter dropdown
  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Colors for Order status badges
  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'Delivered Early':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Out for Delivery':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Ordered':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16" id="admin-dashboard-container">
      {/* Top Professional Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              id="back-from-admin-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded-md tracking-wider">PRO</span>
                <h1 className="text-base font-extrabold tracking-tight">Admin Operations Suite</h1>
              </div>
              <p className="text-[10px] text-slate-400">Total System Control & Product Configs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-[9px] font-black text-slate-400 tracking-wider">SECURE PASSCODE:</span>
              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => handlePasscodeChange(e.target.value)}
                placeholder="Enter Secret Key"
                className="bg-transparent border-none text-xs font-mono text-emerald-400 focus:outline-hidden w-28 text-center"
                title="Enter X-Admin-Secret to authenticate database writes"
              />
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">System Mode: <span className="text-emerald-400 font-black">ONLINE</span></span>
              <span className="h-4 w-px bg-slate-800"></span>
              <div className="flex items-center gap-1.5 bg-slate-800 text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Gaurav Garments</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Responsive Horizontal Tabs / Navigation Menu */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 flex flex-wrap gap-1 mb-6 shadow-3xs" id="admin-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Coupons ({coupons.length})</span>
          </button>
        </div>

        {/* --- VIEW CONTENT --- */}
        <div id="admin-view-content">
          
          {/* 1. OVERVIEW / ANALYTICS TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Database Live Sync Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 border border-slate-700/60 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
                      Supabase Cloud Database Sync Hub
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Active Connectivity</span>
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                      Seed, synchronize, and deploy existing catalog items and promo codes securely directly into your remote database in one-click. From now on, all transactions, updates, and coupon actions will persist in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  {syncStatus === 'success' && syncReport && (
                    <div className="text-left text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg font-mono">
                      <span className="font-bold block text-emerald-400">SUCCESSFULLY REPLICATED:</span>
                      <span>{syncReport.products} products, {syncReport.coupons} coupons, {syncReport.orders} orders</span>
                    </div>
                  )}
                  <button
                    onClick={handleSyncSupabase}
                    disabled={isSyncing}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                    id="sync-database-btn"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Synchronizing Live Catalog...' : 'Sync Demo Catalog to Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-grid">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Sales</span>
                    <span className="text-xl font-black text-slate-900 block mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50/50 px-1.5 py-0.5 rounded-sm inline-block mt-1">Live Revenue</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
                    <span className="text-xl font-black text-slate-900 block mt-0.5">{orders.length}</span>
                    <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50/50 px-1.5 py-0.5 rounded-sm inline-block mt-1">Ordered items</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow flex items-start gap-4">
                  <div className="p-3 bg-pink-50 rounded-lg text-pink-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Catalog</span>
                    <span className="text-xl font-black text-slate-900 block mt-0.5">{totalProductsCount}</span>
                    <span className="text-[9px] text-pink-600 font-extrabold bg-pink-50/50 px-1.5 py-0.5 rounded-sm inline-block mt-1">Active SKUs</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs hover:shadow-xs transition-shadow flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Promo Codes</span>
                    <span className="text-xl font-black text-slate-900 block mt-0.5">{activeCouponsCount}</span>
                    <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50/50 px-1.5 py-0.5 rounded-sm inline-block mt-1">Coupons Active</span>
                  </div>
                </div>
              </div>

              {/* Graphic charts + trends */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Custom modern SVG area chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">E-Commerce Sales Insights</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Daily order sales & dispatch metrics</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-md">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      Weekly Avg: ₹{orders.length > 0 ? Math.round(totalRevenue / 7) : 0}
                    </span>
                  </div>

                  {/* SVG Chart Frame */}
                  <div className="w-full h-56 relative bg-slate-50/50 rounded-lg p-2 overflow-hidden flex flex-col justify-end">
                    {/* SVG Curve */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#db2777" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#db2777" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      {/* Area beneath */}
                      <path 
                        d="M 0 160 Q 100 120 200 140 T 400 60 T 500 40 L 500 200 L 0 200 Z" 
                        fill="url(#chartGradient)"
                      />
                      {/* Stroke line */}
                      <path 
                        d="M 0 160 Q 100 120 200 140 T 400 60 T 500 40" 
                        fill="none" 
                        stroke="#db2777" 
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Scatter Data Dots */}
                      <circle cx="100" cy="125" r="5" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="200" cy="140" r="5" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="350" cy="72" r="5" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="500" cy="40" r="5" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
                    </svg>

                    {/* Chart Labels Overlay */}
                    <div className="relative flex justify-between text-[10px] text-slate-400 px-2 pt-2 border-t border-slate-100 font-mono">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun (Today)</span>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-4 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Avg Order Value (AOV)</span>
                      <span className="text-base font-black text-slate-800">₹{averageOrderValue}</span>
                    </div>
                    <div className="border-x border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Sales Target</span>
                      <span className="text-base font-black text-emerald-600">84% Met</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Conversion Rate</span>
                      <span className="text-base font-black text-pink-600">4.12%</span>
                    </div>
                  </div>
                </div>

                {/* Popular categories & Low Stock Warning Panel */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-sm mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      <h3>Inventory & Operations Warning</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                        <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wide">Out-of-Stock Alert</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">"Royal Cotton Traditional Saree" size XL is currently low in warehouse (Only 2 left).</p>
                      </div>

                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <h4 className="text-[11px] font-black text-red-800 uppercase tracking-wide">Dispatched Backlog</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">3 orders require dispatch labels immediately to stay within SLA dispatch.</p>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-wide">Refund SLA Met</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">All customer return claims are processed. 0 refunds pending.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                      <span>Warehouse Location:</span>
                      <span className="text-slate-800 font-extrabold">Jaipur Center, RJ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders log overview list */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Recent Customer Inbound Orders</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Verify payments & courier handovers</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-lucky-magenta hover:underline font-extrabold cursor-pointer flex items-center gap-1"
                  >
                    Manage Orders <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-2">Order ID</th>
                        <th className="py-3 px-2">Customer</th>
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Price</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-2 font-mono font-bold text-slate-900">{order.id}</td>
                          <td className="py-3 px-2">
                            <span className="font-extrabold text-slate-800 block">{order.shippingAddress.name}</span>
                            <span className="text-[10px] text-slate-400">{order.shippingAddress.phone}</span>
                          </td>
                          <td className="py-3 px-2 text-slate-500">{order.orderDate}</td>
                          <td className="py-3 px-2 font-black text-slate-900">₹{order.totalPrice}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[9px] font-black ${getStatusStyle(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                setOrderSearch(order.id);
                                setActiveTab('orders');
                              }}
                              className="text-lucky-magenta hover:text-pink-700 font-bold px-2 py-1 bg-pink-50/50 rounded-md cursor-pointer"
                            >
                              Edit Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS MANAGER TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Product Controls Box */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search items by title or category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-lucky-magenta font-semibold"
                      id="admin-product-search"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200/80 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 appearance-none focus:outline-hidden focus:border-lucky-magenta cursor-pointer"
                      id="admin-product-category-filter"
                    >
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetProductForm();
                    setIsProductModalOpen(true);
                  }}
                  className="bg-lucky-magenta text-white hover:bg-opacity-95 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
                  id="admin-add-product-btn"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product table list (Responsive desktop/mobile) */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden">
                
                {/* Desktop Product Table (Visible on md and above) */}
                <div className="hidden md:block">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-4 w-16">Image</th>
                        <th className="py-4 px-4">Product Details</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Prices</th>
                        <th className="py-4 px-4">Rating</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/30">
                          <td className="py-3 px-4">
                            <img 
                              src={product.images[0]} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100" 
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {product.tag && (
                                <span className="bg-lucky-magenta/10 text-lucky-magenta font-black text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                  {product.tag}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono font-bold">ID: {product.id}</span>
                            </div>
                            <span className="font-extrabold text-slate-800 block text-xs truncate leading-normal">{product.title}</span>
                            <span className="text-[10px] text-slate-400 block font-medium truncate">{product.description}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-700 block">{product.category}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{product.subCategory}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-black text-slate-900 block">₹{product.price}</span>
                            <span className="text-[10px] text-slate-400 line-through font-semibold block">₹{product.originalPrice}</span>
                            <span className="text-[10px] text-emerald-600 font-bold block">{product.discountPercent}% OFF</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 font-extrabold text-amber-500">
                              <span>★ {product.rating}</span>
                              <span className="text-slate-400 font-semibold text-[10px]">({product.ratingCount})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  resetProductForm(product);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${product.title}?`)) {
                                    onDeleteProduct(product.id);
                                  }
                                }}
                                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold text-xs">
                            No products found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Products Grid (Visible on small screens) */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="p-4 flex gap-3.5 hover:bg-slate-50/30">
                      <img 
                        src={product.images[0]} 
                        alt="" 
                        className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {product.tag && (
                              <span className="bg-lucky-magenta/10 text-lucky-magenta font-black text-[8px] px-1 rounded-xs uppercase tracking-wide">
                                {product.tag}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 font-bold font-mono">ID: {product.id}</span>
                          </div>
                          <span className="font-extrabold text-slate-800 text-xs block truncate leading-tight">{product.title}</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{product.category} • {product.subCategory}</span>
                        </div>
                        
                        <div className="flex items-end justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">₹{product.price}</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                            <span className="text-[10px] text-emerald-600 font-extrabold">{product.discountPercent}% OFF</span>
                          </div>
                          
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => {
                                resetProductForm(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${product.title}?`)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                      No products found matching your search.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 3. ORDERS MANAGER TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Order Search Bar and Quick Tabs */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by Order ID or Customer Name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-lucky-magenta font-semibold text-slate-800"
                    id="admin-order-search"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {['All', 'Ordered', 'Shipped', 'Out for Delivery', 'Delivered Early', 'Cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-md border tracking-wider flex-shrink-0 cursor-pointer transition-all ${
                        orderStatusFilter === status
                          ? 'bg-slate-900 text-white border-slate-900 shadow-3xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inbound Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs hover:border-slate-300 transition-colors" id={`admin-order-card-${order.id}`}>
                    {/* Order header row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-3 gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm">{order.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold">•</span>
                        <span className="text-slate-500 font-semibold text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {order.orderDate}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status dropdown controller */}
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className={`border text-[10px] font-black px-2.5 py-1.5 pr-7 rounded-md appearance-none cursor-pointer focus:outline-hidden ${getStatusStyle(order.status)}`}
                          >
                            <option value="Ordered">Ordered (New)</option>
                            <option value="Shipped">Shipped (In Transit)</option>
                            <option value="Out for Delivery">Out For Delivery</option>
                            <option value="Delivered Early">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronRight className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete or archive Order ${order.id}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Order Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer shipping details & item maps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Shipping detail column */}
                      <div className="md:col-span-1 bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Customer Address</h4>
                        <p className="text-xs font-black text-slate-800">{order.shippingAddress.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Phone: {order.shippingAddress.phone}</p>
                        <p className="text-[11px] text-slate-600 mt-1.5 font-medium leading-relaxed">
                          {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                      </div>

                      {/* Items Ordered columns */}
                      <div className="md:col-span-2 space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Line Items</h4>
                        <div className="divide-y divide-slate-100 max-h-[140px] overflow-y-auto pr-1">
                          {order.items.map((item, idx) => {
                            const variant = item.product.variants[item.selectedVariantIndex];
                            return (
                              <div key={idx} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={variant?.imageUrl || item.product.images[0]} 
                                    alt="" 
                                    className="w-10 h-10 rounded-md object-cover bg-slate-50 border border-slate-100"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <span className="font-extrabold text-slate-800 text-xs block leading-tight truncate max-w-[200px] sm:max-w-md">{item.product.title}</span>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                      Size: {item.selectedSize} • Color: {variant?.colorName || 'Default'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-xs font-black text-slate-900 block">₹{variant?.price || item.product.price}</span>
                                  <span className="text-[10px] text-slate-400 block font-semibold">Qty: {item.quantity}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 font-bold text-xs">
                          <span className="text-slate-400 font-black">ORDER TOTAL VALUE</span>
                          <span className="text-sm font-black text-lucky-magenta bg-pink-50/50 px-2 py-0.5 rounded-md border border-pink-100">
                            ₹{order.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="bg-white rounded-xl border border-slate-200/80 py-12 text-center text-slate-400 font-semibold text-xs shadow-3xs">
                    No orders found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. COUPONS MANAGER TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Coupon Actions Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Dynamic Promotion & Coupons List</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Create discount codes to boost conversions</p>
                </div>

                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="bg-lucky-magenta text-white hover:bg-opacity-95 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  id="admin-create-coupon-btn"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Promotion Code</span>
                </button>
              </div>

              {/* Coupons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="admin-coupons-grid">
                {coupons.map((coupon) => (
                  <div 
                    key={coupon.code} 
                    className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden shadow-3xs hover:border-lucky-magenta/40 transition-colors"
                  >
                    {/* Coupon cut-out visual effects */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f8fafc] border-r border-slate-200"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f8fafc] border-l border-slate-200"></div>

                    <div>
                      <div className="flex items-start justify-between">
                        <span className="bg-lucky-magenta/5 border border-lucky-magenta/25 text-lucky-magenta font-black text-xs px-3 py-1 rounded-md tracking-widest uppercase">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Deactivate promo code ${coupon.code}?`)) {
                              onDeleteCoupon(coupon.code);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Revoke Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1 mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900">
                            {coupon.discountType === 'flat' ? '₹' : ''}
                            {coupon.value}
                            {coupon.discountType === 'percentage' ? '%' : ''}
                          </span>
                          <span className="text-xs text-slate-500 font-extrabold uppercase">OFF</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{coupon.description}</p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>MINIMUM PURCHASE</span>
                      <span className="text-slate-800 font-black">₹{coupon.minPurchase}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL DIALOG --- */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{editingProduct ? 'Modify Active SKU' : 'Add New SKU to Catalog'}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Jaipur Warehouse Hub</p>
                </div>
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
                {/* Form row */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Product Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="e.g. Premium Silk Solid Traditional Kurti Set"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  />
                </div>

                {/* Categories Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Primary Category *</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:border-lucky-magenta"
                    >
                      <option value="Kurtis & Suits">Kurtis & Suits</option>
                      <option value="Watches">Watches</option>
                      <option value="Sarees">Sarees</option>
                      <option value="Jewellery">Jewellery</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Bags & Purses">Bags & Purses</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Sub-Category *</label>
                    <input
                      type="text"
                      required
                      value={pSubCategory}
                      onChange={(e) => setPSubCategory(e.target.value)}
                      placeholder="e.g. Anarkali Suit"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
                </div>

                {/* Price and Original Price Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Discount Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Original MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pOriginalPrice}
                      onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">COD Margin Fee (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={pCodPrice}
                      onChange={(e) => setPCodPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
                </div>

                {/* Banner / Badge overlay tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Promotional Overlay Badge</label>
                    <input
                      type="text"
                      value={pTag}
                      onChange={(e) => setPTag(e.target.value)}
                      placeholder="e.g. Top Rated, Lowest Price, 50% OFF"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="has-upi-offer"
                      checked={pHasUpiOffer}
                      onChange={(e) => setPHasUpiOffer(e.target.checked)}
                      className="w-4.5 h-4.5 text-lucky-magenta border-gray-300 rounded-sm focus:ring-lucky-magenta cursor-pointer"
                    />
                    <label htmlFor="has-upi-offer" className="text-xs font-extrabold text-slate-700 cursor-pointer">
                      Enable Extra ₹12 UPI Discount Offer
                    </label>
                  </div>
                </div>

                {/* Size options */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Available Size Options</label>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(size => {
                      const isSelected = pSizeOptions.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => {
                            if (isSelected) {
                              setPSizeOptions(pSizeOptions.filter(s => s !== size));
                            } else {
                              setPSizeOptions([...pSizeOptions, size]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-md border text-xs font-black cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-lucky-magenta text-white border-lucky-magenta shadow-3xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Image Manager (No raw URLs displayed anywhere) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">
                      Product Images Gallery (Previews Only) *
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {pImages.filter(Boolean).length} Active Images
                    </span>
                  </div>

                  {/* Previews Grid */}
                  {pImages.filter(Boolean).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {pImages.filter(Boolean).map((img, idx) => (
                        <div key={idx} className="group relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200/60 shadow-3xs hover:border-lucky-magenta/50 transition-colors">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPImages(pImages.filter(url => url !== img));
                              }}
                              className="bg-slate-900/80 text-white hover:bg-rose-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                              title="Delete Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-slate-900/50 backdrop-blur-xs text-[9px] text-white font-bold text-center py-1 truncate">
                            Image {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold">No images uploaded yet</p>
                      <p className="text-[10px] text-slate-400 mt-1">Upload files or snap a photo live below to configure visuals.</p>
                    </div>
                  )}

                  {/* Live Camera Interface inside the Modal */}
                  {isCameraOpen && (
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between text-white text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          Live Camera Viewport
                        </span>
                        
                        {/* Camera selector if multiple cameras exist */}
                        {cameraDevices.length > 1 && (
                          <select
                            value={selectedCameraId}
                            onChange={(e) => switchCamera(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-md text-[10px] px-2 py-1 text-slate-200 outline-hidden font-bold"
                          >
                            {cameraDevices.map(device => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="relative aspect-video max-w-md mx-auto rounded-lg overflow-hidden bg-black border border-slate-800 shadow-md">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={imageUploadLoading}
                          className="px-4 py-2 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {imageUploadLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )}
                          <span>Take & Host Photo</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Action Panel */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* File Input */}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors text-xs font-black text-slate-700">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Upload Local Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={imageUploadLoading || isCameraOpen}
                        className="hidden"
                      />
                    </label>

                    {/* Camera Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isCameraOpen) {
                          stopCamera();
                        } else {
                          startCamera();
                        }
                      }}
                      disabled={imageUploadLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors text-xs font-black text-slate-700 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4 text-slate-500" />
                      <span>{isCameraOpen ? 'Stop Camera Stream' : 'Snap Photo Live'}</span>
                    </button>
                  </div>

                  {imageUploadLoading && (
                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-indigo-600 bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Compressing & Hosting to ImgBB Storage Node...</span>
                    </div>
                  )}
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Full Product Description</label>
                  <textarea
                    rows={3}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Provide details of fabric, print style, embroidery details..."
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  />
                </div>

                {/* Form Footer */}
                <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
                  >
                    {editingProduct ? 'Save Modifications' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATE COUPON MODAL DIALOG --- */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden"
            >
              <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black">Generate Interactive Coupon</h3>
                  <p className="text-[10px] text-slate-400">Direct-to-Consumer Discount Rules</p>
                </div>
                <button 
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCouponSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Coupon Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME100, MEESHO20"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold tracking-wider focus:outline-hidden focus:border-lucky-magenta uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-normal text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Discount Type *</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as 'flat' | 'percentage')}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:border-lucky-magenta"
                    >
                      <option value="flat">Flat Discount (₹)</option>
                      <option value="percentage">Percentage OFF (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Discount Value *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={cValue}
                      onChange={(e) => setCValue(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Minimum Purchase Requirement (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={cMinPurchase}
                    onChange={(e) => setCMinPurchase(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Helpful User Tagline / Description *</label>
                  <input
                    type="text"
                    required
                    value={cDescription}
                    onChange={(e) => setCDescription(e.target.value)}
                    placeholder="e.g. Flat ₹100 OFF on orders above ₹499"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  />
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-[11px] text-indigo-700 font-semibold leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>
                    New coupons will immediately appear in the user's available coupon tray in the cart drawer.
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
                  >
                    Generate Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM 1:1 CROP MODAL --- */}
      <AnimatePresence>
        {croppingSrc && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-white"
            >
              {/* Header */}
              <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#db2777] animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                    Fine Tune 1:1 Ratio Crop
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCroppingSrc(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewport & Drag Canvas Container */}
              <div className="p-5 flex flex-col items-center space-y-4">
                <p className="text-[10px] text-slate-400 text-center font-bold tracking-wider">
                  ↔ DRAG THE PHOTO TO FRAME • USE SLIDER TO ZOOM
                </p>

                {/* Draggable Viewport */}
                <div
                  onMouseDown={handleMouseDownCrop}
                  onMouseMove={handleMouseMoveCrop}
                  onMouseUp={handleMouseUpCrop}
                  onMouseLeave={handleMouseUpCrop}
                  onTouchStart={handleTouchStartCrop}
                  onTouchMove={handleTouchMoveCrop}
                  onTouchEnd={handleTouchUpCrop}
                  className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] relative overflow-hidden rounded-xl border-4 border-slate-850 shadow-inner bg-slate-950 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
                >
                  {/* Real-time Rendered Canvas representing final cropped JPG */}
                  <canvas
                    ref={cropperCanvasRef}
                    className="w-full h-full pointer-events-none rounded-lg"
                  />

                  {/* Aesthetic grid overlays to assist centering (like standard cameras) */}
                  <div className="absolute inset-0 pointer-events-none border border-white/10 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-b border-white/10"></div>
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-b border-white/10"></div>
                    <div className="border-r border-white/10"></div>
                    <div className="border-r border-white/10"></div>
                    <div></div>
                  </div>
                </div>

                {/* Zoom Control Slider */}
                <div className="w-full space-y-1.5 px-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>Zoom Scale</span>
                    <span className="text-[#db2777] font-extrabold">{Math.round(cropZoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full accent-[#db2777] bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                </div>

                {/* Helpers */}
                <div className="bg-slate-950 border border-slate-850/80 rounded-lg p-2.5 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  💡 Double check centering before hosting. Cropping in 1:1 prevents text overlapping and maintains visually premium layouts.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-950 px-5 py-4 border-t border-slate-800/60 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setCroppingSrc(null)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  disabled={imageUploadLoading}
                  className="bg-[#db2777] hover:bg-opacity-90 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {imageUploadLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Hosting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Crop & Host Image</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
