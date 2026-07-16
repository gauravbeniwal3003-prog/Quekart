import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Ticket, 
  ArrowLeft, 
  Users, 
  Coins, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
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
  Loader2,
  Menu,
  Bell,
  ChevronDown,
  ExternalLink,
  Lock,
  Sun,
  Moon,
  Globe,
  Percent,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Coupon, CartItem, Vendor, Banner } from '../types';
import Logo from './Logo';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  banners?: Banner[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onAddBanner?: (banner: Banner) => void;
  onDeleteBanner?: (id: string) => void;
  onClose: () => void;
  activeSubPage?: string | null;
  setActiveSubPage?: (page: string) => void;
}

export default function AdminDashboard({
  products,
  orders,
  coupons,
  banners = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddCoupon,
  onDeleteCoupon,
  onAddBanner,
  onDeleteBanner,
  onClose,
  activeSubPage,
  setActiveSubPage
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
  const activeTab = activeSubPage || 'overview';
  const setActiveTab = setActiveSubPage || (() => {});

  // TailAdmin Interface States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardSubTab, setDashboardSubTab] = useState<'ecommerce' | 'analytics' | 'visitor-traffic'>('ecommerce');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time local admin directories for vendors & approvals
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<{ [productId: string]: string }>({});
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{
    useSupabase: boolean;
    supabaseConnected: boolean;
    supabaseInitialized: boolean;
    tableChecks: { products: boolean; orders: boolean; vendors: boolean; coupons: boolean };
    lastError: string | null;
    localCounts: { products: number; orders: number; vendors: number; coupons: number };
  } | null>(null);

  // Load and refresh vendors and products
  const loadAdminData = async () => {
    setIsLoadingAdminData(true);
    try {
      const [vendorsRes, productsRes, statusRes] = await Promise.all([
        fetch('/api/vendors'),
        fetch('/api/products?all=true'),
        fetch('/api/system-status').catch(() => null)
      ]);
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
      }
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setLiveProducts(productsData);
      }
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }
    } catch (err) {
      console.warn('Failed to load admin directories, falling back locally.', err);
    } finally {
      setIsLoadingAdminData(false);
    }
  };

  React.useEffect(() => {
    loadAdminData();
  }, [products]);

  // Product Approval Operations
  const handleApproveProduct = async (productId: string) => {
    try {
      const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
      const res = await fetch(`/api/products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (res.ok) {
        setLiveProducts(prev => prev.map(p => p.id === productId ? { ...p, approvalStatus: 'approved', rejectionReason: undefined } : p));
        // Also refresh list to be absolutely sure
        setTimeout(loadAdminData, 500);
      } else {
        const err = await res.json();
        alert(`Approval failed: ${err.error}`);
      }
    } catch (err) {
      // Offline local emulation
      setLiveProducts(prev => prev.map(p => p.id === productId ? { ...p, approvalStatus: 'approved' } : p));
    }
  };

  const handleRejectProduct = async (productId: string) => {
    const reason = rejectionReasonInput[productId]?.trim() || 'Product listing contains low-resolution images or invalid descriptions.';
    try {
      const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
      const res = await fetch(`/api/products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
      });

      if (res.ok) {
        setLiveProducts(prev => prev.map(p => p.id === productId ? { ...p, approvalStatus: 'rejected', rejectionReason: reason } : p));
        setShowRejectionForm(null);
        setTimeout(loadAdminData, 500);
      } else {
        const err = await res.json();
        alert(`Rejection failed: ${err.error}`);
      }
    } catch (err) {
      setLiveProducts(prev => prev.map(p => p.id === productId ? { ...p, approvalStatus: 'rejected', rejectionReason: reason } : p));
      setShowRejectionForm(null);
    }
  };

  // Vendor Directory Operations
  const handleToggleVendorStatus = async (vendor: Vendor) => {
    const nextStatus = vendor.status === 'active' ? 'suspended' : 'active';
    const updatedVendor: Vendor = { ...vendor, status: nextStatus };
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVendor)
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === vendor.id ? updatedVendor : v));
      } else {
        const err = await res.json();
        alert(`Failed to update seller status: ${err.error}`);
      }
    } catch (err) {
      setVendors(prev => prev.map(v => v.id === vendor.id ? updatedVendor : v));
    }
  };

  const handleToggleVendorTier = async (vendor: Vendor) => {
    const nextType = vendor.vendorType === 'big' ? 'small' : 'big';
    const updatedVendor: Vendor = { ...vendor, vendorType: nextType };
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVendor)
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === vendor.id ? updatedVendor : v));
      } else {
        const err = await res.json();
        alert(`Failed to update seller classification: ${err.error}`);
      }
    } catch (err) {
      setVendors(prev => prev.map(v => v.id === vendor.id ? updatedVendor : v));
    }
  };

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productTimeFilter, setProductTimeFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderTimeFilter, setOrderTimeFilter] = useState('All');
  const [orderStateFilter, setOrderStateFilter] = useState('All');
  const [orderCityFilter, setOrderCityFilter] = useState('All');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorTimeFilter, setVendorTimeFilter] = useState('All');
  const [vendorStateFilter, setVendorStateFilter] = useState('All');
  const [vendorCityFilter, setVendorCityFilter] = useState('All');
  const [selectedVendorForInspection, setSelectedVendorForInspection] = useState<Vendor | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSort, setCustomerSort] = useState('spent-desc');
  const [customerStateFilter, setCustomerStateFilter] = useState('All');
  const [customerCityFilter, setCustomerCityFilter] = useState('All');
  const [selectedCustomerForInspection, setSelectedCustomerForInspection] = useState<any | null>(null);
  
  // Modals & Form States
  const [adminSubView, setAdminSubView] = useState<'list' | 'add-product' | 'edit-product' | 'add-coupon' | 'add-banner' | 'inspect-vendor' | 'inspect-customer'>('list');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Synchronize sub-view when tab changes
  React.useEffect(() => {
    setAdminSubView('list');
  }, [activeTab]);

  // New Banner Form Fields
  const [bType, setBType] = useState<'promotional' | 'news'>('promotional');
  const [bImageUrl, setBImageUrl] = useState('');
  const [bLinkUrl, setBLinkUrl] = useState('');

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
      setLiveProducts(prev => prev.map(p => p.id === productPayload.id ? productPayload : p));
    } else {
      onAddProduct(productPayload);
      setLiveProducts(prev => [productPayload, ...prev]);
    }
    setAdminSubView('list');
    setEditingProduct(null);
  };

  // Submit Banner Form
  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bImageUrl.trim() || !onAddBanner) return;

    onAddBanner({
      id: `banner-${Date.now()}`,
      imageUrl: bImageUrl.trim(),
      linkUrl: bLinkUrl.trim() || undefined,
      type: bType
    });
    
    setBImageUrl('');
    setBLinkUrl('');
    setBType('promotional');
    setAdminSubView('list');
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
    setAdminSubView('list');
    // Reset coupon fields
    setCCode('');
    setCValue(50);
    setCMinPurchase(299);
    setCDescription('');
  };

  // Enrich mock products with creation dates if missing
  const enrichedProducts = React.useMemo(() => {
    return products.map((p, idx) => {
      if (p.createdAt) return p;
      let daysAgo = 0;
      if (idx === 0) daysAgo = 0.2; // ~5 hours ago
      else if (idx === 1) daysAgo = 0.6; // ~14 hours ago
      else if (idx === 2) daysAgo = 2; // 2 days ago
      else if (idx === 3) daysAgo = 4; // 4 days ago
      else daysAgo = 8 + (idx * 2); // older
      
      const pDate = new Date();
      pDate.setDate(pDate.getDate() - daysAgo);
      return {
        ...p,
        createdAt: pDate.toISOString()
      };
    });
  }, [products]);

  // Helper to determine or assign a vendor's geographical state and city
  const getVendorLocation = (v: Vendor) => {
    if (v.state && v.city) return { state: v.state, city: v.city };
    const name = v.name.toLowerCase();
    if (name.includes('rajasthan') || name.includes('jaipur')) {
      return { state: 'Rajasthan', city: 'Jaipur' };
    }
    if (name.includes('delhi') || name.includes('karol')) {
      return { state: 'Delhi', city: 'Karol Bagh' };
    }
    if (name.includes('craft') || v.id.includes('craft')) {
      return { state: 'Uttar Pradesh', city: 'Noida' };
    }
    const states = ['Maharashtra', 'Gujarat', 'Haryana', 'Karnataka', 'Punjab'];
    const cities: Record<string, string[]> = {
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
      'Haryana': ['Gurugram', 'Faridabad', 'Ambala'],
      'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli'],
      'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar']
    };
    const stateIdx = Math.abs(v.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % states.length;
    const state = states[stateIdx];
    const cityList = cities[state] || ['Default City'];
    const city = cityList[Math.abs(v.id.length) % cityList.length];
    return { state, city };
  };

  // Enrich mock vendors with registration dates and location if missing
  const enrichedVendors = React.useMemo(() => {
    return vendors.map((v, idx) => {
      let daysAgo = 0;
      if (idx === 0) daysAgo = 0.15; // ~3.6 hours ago
      else if (idx === 1) daysAgo = 0.5; // ~12 hours ago
      else if (idx === 2) daysAgo = 3; // 3 days ago
      else daysAgo = 10 + (idx * 3); // older
      
      const vDate = new Date();
      vDate.setDate(vDate.getDate() - daysAgo);
      
      const loc = getVendorLocation(v);
      
      return {
        ...v,
        createdAt: v.createdAt || vDate.toISOString(),
        state: v.state || loc.state,
        city: v.city || loc.city
      };
    });
  }, [vendors]);

  // Helper to check if a date string is within a specific range of days
  const isDateWithinDays = (dateStr: string | undefined, days: number): boolean => {
    if (!dateStr) return false;
    try {
      const now = new Date();
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try parsing "15 Jul, 2026" or similar format
        const cleanStr = dateStr.replace(',', '');
        const parts = cleanStr.split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const monthStr = parts[1].toLowerCase();
          const year = parseInt(parts[2], 10);
          const months: { [key: string]: number } = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
          };
          const month = months[monthStr.substring(0, 3)] ?? 0;
          const parsed = new Date(year, month, day);
          const diffMs = Math.abs(now.getTime() - parsed.getTime());
          return diffMs <= days * 24 * 60 * 60 * 1000;
        }
        return false;
      }
      const diffMs = Math.abs(now.getTime() - date.getTime());
      return diffMs <= days * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  // Vendor Sales & Metrics calculator
  const getVendorSalesStats = (vendorId: string, vendorName: string) => {
    let totalSales = 0;
    let itemsSold = 0;
    orders.filter(o => o.status !== 'Cancelled').forEach(order => {
      order.items.forEach(item => {
        if (item.product.vendorId === vendorId || item.product.soldBy === vendorName) {
          const price = item.product.price;
          const qty = item.quantity || 1;
          totalSales += price * qty;
          itemsSold += qty;
        }
      });
    });
    return { totalSales, itemsSold };
  };

  // Extract unique users (customers) from orders
  const uniqueUsers = React.useMemo(() => {
    const usersMap = new Map<string, {
      name: string;
      phone: string;
      addressLine: string;
      city: string;
      pincode: string;
      state: string;
      totalSpent: number;
      ordersCount: number;
      orders: Order[];
      registeredAt: string; // ISO String from their first order
    }>();

    orders.forEach(o => {
      const phone = o.shippingAddress.phone || 'unknown';
      const name = o.shippingAddress.name || 'Anonymous Customer';
      if (!usersMap.has(phone)) {
        usersMap.set(phone, {
          name,
          phone,
          addressLine: o.shippingAddress.addressLine || '',
          city: o.shippingAddress.city || '',
          pincode: o.shippingAddress.pincode || '',
          state: o.shippingAddress.state || '',
          totalSpent: 0,
          ordersCount: 0,
          orders: [],
          registeredAt: o.orderDate ? new Date(o.orderDate).toISOString() : new Date().toISOString()
        });
      }
      const user = usersMap.get(phone)!;
      user.totalSpent += o.totalPrice;
      user.ordersCount += 1;
      user.orders.push(o);
      
      // Keep earliest order date as registration date
      if (o.orderDate) {
        const orderTime = new Date(o.orderDate).getTime();
        const regTime = new Date(user.registeredAt).getTime();
        if (orderTime < regTime) {
          user.registeredAt = new Date(o.orderDate).toISOString();
        }
      }
    });

    return Array.from(usersMap.values());
  }, [orders]);

  // Calculate statistics
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const activeCouponsCount = coupons.length;
  const totalProductsCount = products.length;

  // Filtered lists
  const filteredProducts = enrichedProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    
    let matchesTime = true;
    if (productTimeFilter === '24h') matchesTime = isDateWithinDays(p.createdAt, 1);
    else if (productTimeFilter === '7d') matchesTime = isDateWithinDays(p.createdAt, 7);
    else if (productTimeFilter === '30d') matchesTime = isDateWithinDays(p.createdAt, 30);
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.shippingAddress.name.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    
    let matchesTime = true;
    if (orderTimeFilter === '24h') matchesTime = isDateWithinDays(o.orderDate, 1);
    else if (orderTimeFilter === '7d') matchesTime = isDateWithinDays(o.orderDate, 7);
    else if (orderTimeFilter === '30d') matchesTime = isDateWithinDays(o.orderDate, 30);
    
    const matchesState = orderStateFilter === 'All' || o.shippingAddress.state === orderStateFilter;
    const matchesCity = orderCityFilter === 'All' || o.shippingAddress.city === orderCityFilter;
    
    return matchesSearch && matchesStatus && matchesTime && matchesState && matchesCity;
  });

  const filteredVendors = enrichedVendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.email.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.phone.includes(vendorSearch);
    
    let matchesTime = true;
    if (vendorTimeFilter === '24h') matchesTime = isDateWithinDays(v.createdAt, 1);
    else if (vendorTimeFilter === '7d') matchesTime = isDateWithinDays(v.createdAt, 7);
    else if (vendorTimeFilter === '30d') matchesTime = isDateWithinDays(v.createdAt, 30);
    
    const matchesState = vendorStateFilter === 'All' || v.state === vendorStateFilter;
    const matchesCity = vendorCityFilter === 'All' || v.city === vendorCityFilter;
    
    return matchesSearch && matchesTime && matchesState && matchesCity;
  });

  const filteredCustomers = uniqueUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          u.phone.includes(customerSearch) ||
                          u.city.toLowerCase().includes(customerSearch.toLowerCase());
                          
    const matchesState = customerStateFilter === 'All' || u.state === customerStateFilter;
    const matchesCity = customerCityFilter === 'All' || u.city === customerCityFilter;
    
    return matchesSearch && matchesState && matchesCity;
  }).sort((a, b) => {
    if (customerSort === 'spent-desc') return b.totalSpent - a.totalSpent;
    if (customerSort === 'spent-asc') return a.totalSpent - b.totalSpent;
    if (customerSort === 'orders-desc') return b.ordersCount - a.ordersCount;
    if (customerSort === 'name') return a.name.localeCompare(b.name);
    return 0;
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
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const renderFullPageProductForm = (isEdit: boolean) => {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-product-form">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setAdminSubView('list');
                setEditingProduct(null);
              }}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-black text-slate-900">{isEdit ? 'Modify Active SKU' : 'Add New SKU to Catalog'}</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Jaipur Warehouse Hub</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-w-3xl">
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

          {/* Visual Image Manager */}
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
                        className="bg-slate-900/80 text-white hover:bg-red-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
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

            {/* Live Camera Interface inside the form */}
            {isCameraOpen && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-white text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Camera Viewport
                  </span>
                  
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
                    className="px-4 py-2 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-50 text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
              <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-lucky-magenta bg-lucky-magenta-light/50 border border-lucky-magenta-light p-2.5 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-lucky-magenta" />
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
              onClick={() => {
                setAdminSubView('list');
                setEditingProduct(null);
              }}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-lucky-magenta text-white hover:bg-opacity-90 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
            >
              {isEdit ? 'Save Modifications' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderFullPageCouponForm = () => {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-coupon-form">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setAdminSubView('list')}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-black text-slate-900">Generate Interactive Coupon</h3>
              <p className="text-[10px] text-slate-400">Direct-to-Consumer Discount Rules</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCouponSubmit} className="p-6 space-y-4 max-w-xl">
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

          <div className="bg-lucky-magenta-light/50 border border-lucky-magenta-light rounded-lg p-3 text-[11px] text-lucky-magenta font-semibold leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-lucky-magenta flex-shrink-0 mt-0.5" />
            <span>
              New coupons will immediately appear in the user's available coupon tray in the cart drawer.
            </span>
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setAdminSubView('list')}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-lucky-magenta text-white hover:bg-opacity-90 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
            >
              Generate Code
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderFullPageBannerForm = () => {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-banner-form">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setAdminSubView('list')}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-black text-slate-900">Add New Banner</h3>
              <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">Home Page Banner Slot</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleBannerSubmit} className="p-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Banner Type *</label>
            <select
              value={bType}
              onChange={(e) => setBType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
            >
              <option value="promotional">Promotional Offer</option>
              <option value="news">Latest News / Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Image URL *</label>
            <input
              type="url"
              required
              value={bImageUrl}
              onChange={(e) => setBImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
            />
            {bImageUrl && (
              <div className="mt-3 aspect-[3/1] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                <img src={bImageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Link URL (Optional)</label>
            <input
              type="url"
              value={bLinkUrl}
              onChange={(e) => setBLinkUrl(e.target.value)}
              placeholder="https://quekart.com/category"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdminSubView('list')}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-lucky-magenta text-white hover:bg-opacity-90 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
            >
              Add Banner
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderFullPageVendorInspection = () => {
    if (!selectedVendorForInspection) return null;
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-vendor-inspection">
        <div className="bg-[#143C6B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setAdminSubView('list');
                setSelectedVendorForInspection(null);
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏪</span>
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <span>{selectedVendorForInspection.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                    selectedVendorForInspection.status === 'suspended' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedVendorForInspection.status}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300">Supplier Profile & SKU Catalog Inspection Panel</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Sales Revenue</span>
              <strong className="text-base text-emerald-600 font-black block mt-0.5">
                ₹{getVendorSalesStats(selectedVendorForInspection.id, selectedVendorForInspection.name).totalSales.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Units Dispatched</span>
              <strong className="text-base text-slate-800 font-black block mt-0.5">
                {getVendorSalesStats(selectedVendorForInspection.id, selectedVendorForInspection.name).itemsSold} units
              </strong>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Seller Rating</span>
              <strong className="text-base text-amber-500 font-black block mt-0.5">
                ★ {selectedVendorForInspection.rating || '4.5'} / 5.0
              </strong>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Catalog Listings</span>
              <strong className="text-base text-blue-600 font-black block mt-0.5">
                {products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).length} SKUs
              </strong>
            </div>
          </div>

          <div className="bg-[#143C6B]/5 border border-[#143C6B]/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-black text-[#143C6B] uppercase tracking-wider">🏢 Supplier Contact & Legal Verification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Registered Email Address</span>
                <strong className="text-slate-800">{selectedVendorForInspection.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Authorized Contact Phone</span>
                <strong className="text-slate-800 font-mono">{selectedVendorForInspection.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">GSTIN / Tax Registration Code</span>
                <strong className="text-slate-800 uppercase font-mono">{selectedVendorForInspection.gstin || 'GST_EXEMPT_UNDER_SCHEME'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Onboarding Timestamp</span>
                <strong className="text-slate-800">
                  {selectedVendorForInspection.createdAt ? new Date(selectedVendorForInspection.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">📦 Live catalog upload list ({products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).length} SKUs)</h4>
            
            {products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).length === 0 ? (
              <p className="text-xs text-slate-400 font-medium italic">This supplier has not uploaded any product catalog files yet.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                {products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).map(sku => (
                  <div key={sku.id} className="p-3 hover:bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden shrink-0">
                        <img src={sku.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900">{sku.title}</h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase">{sku.category}</span>
                          <span>•</span>
                          <span>SKU Price: <strong className="text-slate-700">₹{sku.price}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        sku.approvalStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : sku.approvalStatus === 'rejected' 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {sku.approvalStatus || 'pending'}
                      </span>
                      
                      {sku.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleApproveProduct(sku.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md border border-emerald-100 transition-colors cursor-pointer"
                          title="Approve SKU"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <details className="group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>🔍 RAW SUPPLIER DATABASE OBJECT INSPECTOR</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
              <pre>{JSON.stringify(selectedVendorForInspection, null, 2)}</pre>
            </div>
          </details>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
          <button
            onClick={() => {
              setAdminSubView('list');
              setSelectedVendorForInspection(null);
            }}
            className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            Close Inspection Profile
          </button>
        </div>
      </div>
    );
  };

  const renderFullPageCustomerInspection = () => {
    if (!selectedCustomerForInspection) return null;
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-customer-inspection">
        <div className="bg-[#143C6B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setAdminSubView('list');
                setSelectedCustomerForInspection(null);
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white font-black flex items-center justify-center text-sm">
                {selectedCustomerForInspection.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <span>{selectedCustomerForInspection.name}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[8.5px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
                    Verified Customer
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300">Customer Shipping Profile & Lifetime Order Log Analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Purchase Volume</span>
              <strong className="text-lg text-emerald-600 font-black block mt-0.5">
                ₹{selectedCustomerForInspection.totalSpent.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Orders Placed</span>
              <strong className="text-lg text-slate-800 font-black block mt-0.5">
                {selectedCustomerForInspection.ordersCount} transactions
              </strong>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Average Ticket Size (AOV)</span>
              <strong className="text-lg text-[#143C6B] font-black block mt-0.5">
                ₹{Math.round(selectedCustomerForInspection.totalSpent / selectedCustomerForInspection.ordersCount).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">📍 DEFAULT SHIPPING ADDRESS & CONTACTS</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Recipient Customer Name</span>
                <strong className="text-slate-800">{selectedCustomerForInspection.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Recipient Phone Number</span>
                <strong className="text-slate-800 font-mono">{selectedCustomerForInspection.phone}</strong>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 font-medium block">Delivery Street / Locality Address</span>
                <strong className="text-slate-800">{selectedCustomerForInspection.addressLine || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">City & State</span>
                <strong className="text-slate-800">{selectedCustomerForInspection.city}, {selectedCustomerForInspection.state}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Pincode / Postal Area Code</span>
                <strong className="text-slate-800 font-mono">{selectedCustomerForInspection.pincode}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">🛒 COMPLETE LIFETIME ORDER LOGS</h4>
            
            <div className="space-y-4">
              {selectedCustomerForInspection.orders.map((order: Order) => (
                <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs shadow-3xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 font-bold text-slate-600">
                    <div>
                      Order ID: <span className="text-slate-900 font-mono">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px]">
                      <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs font-semibold">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                            <img src={item.product.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h5 className="font-black text-slate-800">{item.product.title}</h5>
                            <p className="text-[10px] text-slate-400">
                              Size: <strong>{item.selectedSize}</strong> • Sold by: <span className="underline">{item.product.soldBy}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-slate-900 font-extrabold">₹{item.product.price}</div>
                          <div className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity || 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-150 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">Total Paid Invoiced:</span>
                    <strong className="text-[#143C6B] font-black text-sm">₹{order.totalPrice.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <details className="group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>🔍 RAW CUSTOMER DATABASE OBJECT INSPECTOR</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
              <pre>{JSON.stringify(selectedCustomerForInspection, null, 2)}</pre>
            </div>
          </details>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
          <button
            onClick={() => {
              setAdminSubView('list');
              setSelectedCustomerForInspection(null);
            }}
            className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            Close Inspection Profile
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans flex flex-col" id="admin-dashboard-container">
      
      {/* Top Header styled to match the User Panel */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Brand Logo & Title on the Left */}
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0" onClick={onClose} id="admin-brand-logo-container">
          <Logo className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95" animated={true} />
          <span className="font-display font-semibold text-lg sm:text-xl md:text-2xl tracking-normal flex items-center">
            <span style={{ color: '#143C6B' }}>Que</span>
            <span style={{ color: '#C89D1F' }}>Kart</span>
            <span className="text-xs bg-red-100 text-red-600 font-black px-1.5 py-0.5 rounded-sm tracking-wider ml-2">ADMIN</span>
          </span>
        </div>

        {/* Search bar inside header */}
        <div className="relative w-full max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search products or commands... ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-hidden focus:bg-white focus:border-lucky-magenta transition-all"
          />
        </div>

        {/* Right menu tools */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Secure Passcode control inside a clean button */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="password"
              value={adminPasscode}
              onChange={(e) => handlePasscodeChange(e.target.value)}
              placeholder="Passcode"
              className="bg-transparent border-none text-[11px] font-mono text-slate-700 focus:outline-hidden w-24 text-center"
              title="Enter database authorization secret passcode"
            />
          </div>

          {/* Notification bell with orange badge */}
          <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-all">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 cursor-pointer focus:outline-hidden"
            >
              <div className="text-right hidden md:block">
                <span className="block text-xs font-black text-slate-800 leading-tight">Musharof</span>
                <span className="block text-[10px] text-slate-400 font-bold leading-tight">Gaurav Garments</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" 
                alt="Musharof" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1 text-xs text-slate-700 font-semibold space-y-0.5 z-50">
                <button 
                  onClick={() => { setIsDropdownOpen(false); alert('Connected to Gaurav Garments admin portal.'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  User Profile
                </button>
                <button 
                  onClick={() => { setIsDropdownOpen(false); alert('Database Connection is Live'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Account Settings
                </button>
                <hr className="border-slate-100 my-1" />
                <button 
                  onClick={onClose}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                >
                  Back to Store
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {adminSubView !== 'list' ? (
          <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
            {adminSubView === 'add-product' && renderFullPageProductForm(false)}
            {adminSubView === 'edit-product' && renderFullPageProductForm(true)}
            {adminSubView === 'add-coupon' && renderFullPageCouponForm()}
            {adminSubView === 'add-banner' && renderFullPageBannerForm()}
            {adminSubView === 'inspect-vendor' && renderFullPageVendorInspection()}
            {adminSubView === 'inspect-customer' && renderFullPageCustomerInspection()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">

        {/* Combined Main & Admin View Content container */}
        <div id="admin-view-content" className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Breadcrumb path */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {activeTab === 'overview' && 'eCommerce Dashboard'}
                {activeTab === 'products' && 'Products Catalog'}
                {activeTab === 'orders' && 'Orders Invoices'}
                {activeTab === 'coupons' && 'Promo Coupons'}
                {activeTab === 'banners' && 'Marketing Banners'}
                {activeTab === 'approvals' && 'Vendor Approvals'}
                {activeTab === 'vendors' && 'Sellers Roster'}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {activeTab === 'overview' && 'Real-time performance indicators and business diagnostic values'}
                {activeTab === 'products' && 'Manage listing specs, image uploads, category targets'}
                {activeTab === 'orders' && 'Review order payment dispatches, custom delivery logistics'}
                {activeTab === 'coupons' && 'Configure dynamic discounts, promo vouchers, cart validation specs'}
                {activeTab === 'banners' && 'Optimize visual banners and advertising placements'}
                {activeTab === 'approvals' && 'Approve or reject vendor listings from regional tailors'}
                {activeTab === 'vendors' && 'Audit active vendors, track sales, suspend or activate partners'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-3xs">
              <span>Home</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[#C89D1F] capitalize">
                {activeTab}
              </span>
            </div>
          </div>

        {/* Responsive Horizontal Tabs / Navigation Menu */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 flex flex-wrap gap-1.5 mb-6 shadow-3xs" id="admin-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Approvals ({liveProducts.filter(p => p.approvalStatus === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'vendors'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sellers ({vendors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({uniqueUsers.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Coupons ({coupons.length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubPage?.('banners')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-lucky-magenta text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Banners ({banners.length})</span>
          </button>
        </div>

        {/* --- VIEW CONTENT --- */}
        <div id="admin-view-content">
          
          {/* 1. OVERVIEW / ANALYTICS TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">


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
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Catalog</span>
                    <span className="text-xl font-black text-slate-900 block mt-0.5">{totalProductsCount}</span>
                    <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50/50 px-1.5 py-0.5 rounded-sm inline-block mt-1">Active SKUs</span>
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
                              className="text-lucky-magenta hover:text-blue-700 font-bold px-2 py-1 bg-blue-50/50 rounded-md cursor-pointer"
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

                  <div className="relative">
                    <select
                      value={productTimeFilter}
                      onChange={(e) => setProductTimeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200/80 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 appearance-none focus:outline-hidden focus:border-lucky-magenta cursor-pointer"
                    >
                      <option value="All">All Time Added</option>
                      <option value="24h">Added Last 24 Hours</option>
                      <option value="7d">Added Last 7 Days</option>
                      <option value="30d">Added Last 30 Days</option>
                    </select>
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetProductForm();
                    setAdminSubView('add-product');
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
                                  setAdminSubView('edit-product');
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
                                    setLiveProducts(prev => prev.filter(p => p.id !== product.id));
                                  }
                                }}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                                setAdminSubView('edit-product');
                              }}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${product.title}?`)) {
                                  onDeleteProduct(product.id);
                                  setLiveProducts(prev => prev.filter(p => p.id !== product.id));
                                }
                              }}
                              className="p-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
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
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-1 flex-col sm:flex-row gap-2.5 w-full md:w-auto">
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

                    <div className="relative min-w-[170px]">
                      <select
                        value={orderTimeFilter}
                        onChange={(e) => setOrderTimeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 appearance-none focus:outline-hidden focus:border-lucky-magenta cursor-pointer"
                      >
                        <option value="All">All Inbound Orders</option>
                        <option value="24h">Placed Last 24 Hours</option>
                        <option value="7d">Placed Last 7 Days</option>
                        <option value="30d">Placed Last 30 Days</option>
                      </select>
                      <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* State Filter */}
                    <div className="relative min-w-[150px]">
                      <select
                        value={orderStateFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrderStateFilter(val);
                          setOrderCityFilter('All'); // Reset city on state change
                        }}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 appearance-none focus:outline-hidden focus:border-lucky-magenta cursor-pointer"
                      >
                        <option value="All">All States</option>
                        {Array.from(new Set(orders.map(o => o.shippingAddress.state).filter(Boolean))).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto py-1 shrink-0">
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

                {/* Cascading District Filter */}
                {orderStateFilter !== 'All' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 w-fit animate-fadeIn">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>District:</span>
                    <select
                      value={orderCityFilter}
                      onChange={(e) => setOrderCityFilter(e.target.value)}
                      className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                    >
                      {['All', ...Array.from(new Set(orders.filter(o => o.shippingAddress.state === orderStateFilter).map(o => o.shippingAddress.city).filter(Boolean)))].map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Entry match count tracker */}
                <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>Showing {filteredOrders.length} of {orders.length} total orders</span>
                  {(orderSearch || orderTimeFilter !== 'All' || orderStatusFilter !== 'All' || orderStateFilter !== 'All' || orderCityFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setOrderSearch('');
                        setOrderTimeFilter('All');
                        setOrderStatusFilter('All');
                        setOrderStateFilter('All');
                        setOrderCityFilter('All');
                      }}
                      className="text-lucky-magenta hover:underline font-black cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
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
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
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
                          <span className="text-sm font-black text-lucky-magenta bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100">
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
                  onClick={() => setAdminSubView('add-coupon')}
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
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
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

          {/* 5. PRODUCT APPROVALS MANAGER TAB */}
          {activeTab === 'approvals' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>🗳️ Small-Vendor SKU Approval Dashboard</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {liveProducts.filter(p => p.approvalStatus === 'pending').length} Awaiting Review
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Review listed catalogs uploaded by small-scale supplier accounts. Big-scale accounts are auto-approved.</p>
              </div>

              {liveProducts.filter(p => p.approvalStatus === 'pending').length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-3xs">
                  <span className="text-4xl">🎉</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-3">All clear! No pending approvals</h4>
                  <p className="text-xs text-slate-400 mt-1">Sellers have no pending uploads awaiting moderation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveProducts.filter(p => p.approvalStatus === 'pending').map(p => (
                    <div 
                      key={p.id} 
                      className="bg-white rounded-xl border border-slate-200/80 p-4 flex gap-4 shadow-3xs hover:shadow-2xs transition-shadow relative"
                    >
                      <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-blue-50 text-lucky-magenta text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">Wholesale Cost: <strong>₹{p.price}</strong></span>
                        </div>

                        <h4 className="text-xs font-black text-slate-800 truncate">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                        
                        <div className="pt-1.5 flex flex-wrap gap-x-2 text-[10px] text-slate-500 font-semibold">
                          <span>Sold by: <strong className="text-slate-800 underline">{p.soldBy}</strong></span>
                          <span>•</span>
                          <span>Rating: <strong className="text-amber-500">★ {p.soldByRating}</strong></span>
                        </div>

                        {/* Actions buttons or feedback form */}
                        {showRejectionForm === p.id ? (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                            <label className="text-[9px] text-slate-400 font-black uppercase tracking-wide block">Rejection Feedback *</label>
                            <input
                              type="text"
                              placeholder="e.g. Image resolution too low, or price typo."
                              value={rejectionReasonInput[p.id] || ''}
                              onChange={e => setRejectionReasonInput({ ...rejectionReasonInput, [p.id]: e.target.value })}
                              className="w-full text-xs font-semibold border border-slate-200 rounded-md p-1.5 focus:outline-hidden focus:border-lucky-magenta"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setShowRejectionForm(null)}
                                className="px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRejectProduct(p.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-md"
                              >
                                Confirm Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2.5 flex gap-2">
                            <button
                              onClick={() => handleApproveProduct(p.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-md flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve SKU</span>
                            </button>
                            <button
                              onClick={() => setShowRejectionForm(p.id)}
                              className="bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-600 font-extrabold text-[10px] py-1.5 px-3 rounded-md cursor-pointer transition-colors"
                            >
                              Reject & Give Feedback
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. VENDORS / SELLERS DIRECTORY TAB */}
          {activeTab === 'vendors' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Beginner-friendly Help Info Banner */}
              <div className="bg-[#143C6B]/5 border border-[#143C6B]/15 p-4 rounded-xl flex items-start gap-3">
                <span className="text-[#143C6B] text-lg mt-0.5">💡</span>
                <div>
                  <h4 className="text-xs font-black text-[#143C6B]">Sellers Directory & Sales Tracker</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Welcome! This is the supplier control center. Here you can track how much each seller has sold (total revenue and items dispatched), filter partners by registration date (such as those registered in the last 24 hours), or inspect a supplier to moderate their products.
                  </p>
                </div>
              </div>

              {/* Vendor Sales Performance Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sellers Revenue</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    ₹{filteredVendors.reduce((sum, v) => sum + getVendorSalesStats(v.id, v.name).totalSales, 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Aggregate Volume
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Suppliers</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">{vendors.length}</span>
                  <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Registered Partners
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">New Sellers (24h)</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    {vendors.filter(v => isDateWithinDays(v.createdAt, 1)).length}
                  </span>
                  <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Recent Onboardings
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Products</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    {liveProducts.filter(p => p.approvalStatus === 'pending').length}
                  </span>
                  <span className="text-[9px] text-red-600 font-extrabold bg-red-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Awaiting Review
                  </span>
                </div>
              </div>

              {/* Advanced Controls Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search seller by name, email, phone..."
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
                    {/* Time Filter */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span>Registration Date:</span>
                      <select
                        value={vendorTimeFilter}
                        onChange={(e) => setVendorTimeFilter(e.target.value)}
                        className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                      >
                        <option value="All">All Time</option>
                        <option value="24h">Registered in Last 24 Hours</option>
                        <option value="7d">Registered in Last 7 Days</option>
                        <option value="30d">Registered in Last 30 Days</option>
                      </select>
                    </div>

                    {/* State Filter */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>State:</span>
                      <select
                        value={vendorStateFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVendorStateFilter(val);
                          setVendorCityFilter('All'); // Reset city on state change
                        }}
                        className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                      >
                        {['All', ...Array.from(new Set(enrichedVendors.map(v => v.state).filter(Boolean)))].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cascading District Filter */}
                {vendorStateFilter !== 'All' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 w-fit animate-fadeIn">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>District:</span>
                    <select
                      value={vendorCityFilter}
                      onChange={(e) => setVendorCityFilter(e.target.value)}
                      className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                    >
                      {['All', ...Array.from(new Set(enrichedVendors.filter(v => v.state === vendorStateFilter).map(v => v.city).filter(Boolean)))].map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Entry match count tracker */}
                <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>Showing {filteredVendors.length} of {enrichedVendors.length} total sellers</span>
                  {(vendorSearch || vendorTimeFilter !== 'All' || vendorStateFilter !== 'All' || vendorCityFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setVendorSearch('');
                        setVendorTimeFilter('All');
                        setVendorStateFilter('All');
                        setVendorCityFilter('All');
                      }}
                      className="text-lucky-magenta hover:underline font-black cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Vendors List Table */}
              {filteredVendors.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-3xs">
                  <span className="text-4xl">🏪</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-3">No matching registered sellers found</h4>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or registration date filter.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-3xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="p-4">Supplier & ID</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Onboarding Date</th>
                          <th className="p-4">Total Sales (₹)</th>
                          <th className="p-4">Items Sold</th>
                          <th className="p-4">Supplier Tier</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {filteredVendors.map(v => {
                          const stats = getVendorSalesStats(v.id, v.name);
                          return (
                            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-lg">🏪</span>
                                  <div>
                                    <h4 className="font-black text-slate-900">{v.name}</h4>
                                    <span className="text-[9px] text-slate-400 font-mono">ID: {v.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-slate-900">{v.businessCategory}</td>
                              <td className="p-4 text-slate-500 font-medium">
                                {v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                }) : 'Unknown'}
                              </td>
                              <td className="p-4 text-emerald-600 font-extrabold">
                                ₹{stats.totalSales.toLocaleString('en-IN')}
                              </td>
                              <td className="p-4 text-slate-800 font-bold">
                                {stats.itemsSold} units
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleVendorTier(v)}
                                  className={`px-2.5 py-1 rounded-md font-black text-[9.5px] uppercase tracking-wide cursor-pointer transition-colors ${
                                    v.vendorType === 'big' 
                                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200' 
                                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                                  }`}
                                  title="Toggle supplier tier classification"
                                >
                                  {v.vendorType === 'big' ? '👑 Big Scale' : '🌱 Small Scale'}
                                </button>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  v.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedVendorForInspection(v);
                                    setAdminSubView('inspect-vendor');
                                  }}
                                  className="text-[10px] font-black uppercase py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#143C6B] border border-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Individually Inspect Supplier Records"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => handleToggleVendorStatus(v)}
                                  className={`text-[10px] font-black uppercase py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                                    v.status === 'suspended' 
                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100' 
                                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                  }`}
                                >
                                  {v.status === 'suspended' ? 'Activate' : 'Suspend'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6.5 BRAND NEW CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Beginner-friendly customer help block */}
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                <span className="text-blue-600 text-lg mt-0.5">💡</span>
                <div>
                  <h4 className="text-xs font-black text-blue-800">Advanced Customer Registry</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Welcome to the Customer Registry! Here you can track all the distinct buyers who have placed orders on your website. Individually inspect any customer to see their total purchase statistics, active and complete order logs, full address details, and raw database records.
                  </p>
                </div>
              </div>

              {/* Customer Analytics Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Buyers</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">{uniqueUsers.length}</span>
                  <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Unique Buyers Found
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Spend / User</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    ₹{uniqueUsers.length > 0 ? Math.round(totalRevenue / uniqueUsers.length).toLocaleString('en-IN') : 0}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Buyer Lifetime Value
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Top Buyer Spend</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    ₹{uniqueUsers.length > 0 ? Math.max(...uniqueUsers.map(u => u.totalSpent)).toLocaleString('en-IN') : 0}
                  </span>
                  <span className="text-[9px] text-[#C89D1F] font-extrabold bg-[#FBF8F1] px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Valued Customer
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Order Rate</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    {uniqueUsers.length > 0 ? (orders.length / uniqueUsers.length).toFixed(1) : '0'}
                  </span>
                  <span className="text-[9px] text-purple-600 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                    Orders per Customer
                  </span>
                </div>
              </div>

              {/* Filters & Controls */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search customer by name, contact phone, city..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
                    {/* Sort */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sort Customers:</span>
                      <select
                        value={customerSort}
                        onChange={(e) => setCustomerSort(e.target.value)}
                        className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                      >
                        <option value="spent-desc">Total Purchased (High to Low)</option>
                        <option value="spent-asc">Total Purchased (Low to High)</option>
                        <option value="orders-desc">Most Orders Placed</option>
                        <option value="name">Alphabetical Name (A-Z)</option>
                      </select>
                    </div>

                    {/* State Filter */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>State:</span>
                      <select
                        value={customerStateFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomerStateFilter(val);
                          setCustomerCityFilter('All'); // Reset city on state change
                        }}
                        className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                      >
                        {['All', ...Array.from(new Set(uniqueUsers.map(u => u.state).filter(Boolean)))].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cascading District Filter */}
                {customerStateFilter !== 'All' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 w-fit animate-fadeIn">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>District:</span>
                    <select
                      value={customerCityFilter}
                      onChange={(e) => setCustomerCityFilter(e.target.value)}
                      className="bg-transparent border-none font-black text-[#143C6B] cursor-pointer focus:outline-hidden"
                    >
                      {['All', ...Array.from(new Set(uniqueUsers.filter(u => u.state === customerStateFilter).map(u => u.city).filter(Boolean)))].map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Entry match count tracker */}
                <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>Showing {filteredCustomers.length} of {uniqueUsers.length} total customers</span>
                  {(customerSearch || customerStateFilter !== 'All' || customerCityFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setCustomerSearch('');
                        setCustomerStateFilter('All');
                        setCustomerCityFilter('All');
                      }}
                      className="text-lucky-magenta hover:underline font-black cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Customers List Table */}
              {filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-3xs">
                  <span className="text-4xl">👥</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-3">No matching customers found</h4>
                  <p className="text-xs text-slate-400 mt-1">Adjust your search query to find customers in the database.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-3xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Contact Phone</th>
                          <th className="p-4">Primary City / State</th>
                          <th className="p-4">Orders Placed</th>
                          <th className="p-4">Total Purchases (₹)</th>
                          <th className="p-4">Onboarding Date</th>
                          <th className="p-4 text-right">Records Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {filteredCustomers.map(u => (
                          <tr key={u.phone} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#143C6B]/10 text-[#143C6B] font-black flex items-center justify-center text-xs">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900">{u.name}</h4>
                                  <span className="text-[9.5px] text-slate-400 font-bold">Database Verified</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-800 font-mono font-bold">{u.phone}</td>
                            <td className="p-4">
                              <div className="text-slate-900 font-bold">{u.city}</div>
                              <div className="text-[9.5px] text-slate-400 font-semibold">{u.state}</div>
                            </td>
                            <td className="p-4 text-slate-800 font-bold">{u.ordersCount} orders</td>
                            <td className="p-4 text-[#143C6B] font-black text-sm">
                              ₹{u.totalSpent.toLocaleString('en-IN')}
                            </td>
                            <td className="p-4 text-slate-500 font-medium">
                              {new Date(u.registeredAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCustomerForInspection(u);
                                  setAdminSubView('inspect-customer');
                                }}
                                className="text-[10px] font-black uppercase py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#143C6B] border border-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Records</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      {/* 7. BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="space-y-4 animate-fadeIn p-4 md:p-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-lucky-magenta" />
                <span>Dynamic Layout Banners</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Manage promotional banners and latest news images shown on the home page.</p>
            </div>
            <button
              onClick={() => setAdminSubView('add-banner')}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-extrabold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-3xs">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Banners Configured</h4>
              <p className="text-xs text-slate-400 mt-1">Add banners to highlight promotions or news.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col group relative">
                  <div className="aspect-[3/1] w-full bg-slate-50 relative">
                    <img src={b.imageUrl} alt={b.type} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                      {b.type === 'promotional' ? 'Promo' : 'News'}
                    </div>
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 font-medium truncate pr-4">
                      {b.linkUrl || 'No specific link associated'}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this banner?')) {
                          onDeleteBanner?.(b.id);
                        }
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


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
                              className="bg-slate-900/80 text-white hover:bg-red-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
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
                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-lucky-magenta bg-lucky-magenta-light/50 border border-lucky-magenta-light p-2.5 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-lucky-magenta" />
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


      {/* --- ADD BANNER MODAL DIALOG --- */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden"
            >
              <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black">Add New Banner</h3>
                  <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">Home Page Banner Slot</p>
                </div>
                <button 
                  onClick={() => setIsBannerModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBannerSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Banner Type *</label>
                  <select
                    value={bType}
                    onChange={(e) => setBType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  >
                    <option value="promotional">Promotional Offer</option>
                    <option value="news">Latest News / Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={bImageUrl}
                    onChange={(e) => setBImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  />
                  {bImageUrl && (
                    <div className="mt-3 aspect-[3/1] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <img src={bImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Link URL (Optional)</label>
                  <input
                    type="url"
                    value={bLinkUrl}
                    onChange={(e) => setBLinkUrl(e.target.value)}
                    placeholder="https://quekart.com/category"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
                  >
                    Add Banner
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

                <div className="bg-lucky-magenta-light/50 border border-lucky-magenta-light rounded-lg p-3 text-[11px] text-lucky-magenta font-semibold leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-lucky-magenta flex-shrink-0 mt-0.5" />
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
                  <div className="w-2 h-2 rounded-full bg-[#17436B] animate-pulse" />
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
                    <span className="text-[#17436B] font-extrabold">{Math.round(cropZoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full accent-[#17436B] bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
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
                  className="bg-[#17436B] hover:bg-opacity-90 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
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

      {/* --- ADVANCED INDIVIDUAL VENDOR INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedVendorForInspection && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200/80 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#143C6B] text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <span>{selectedVendorForInspection.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                        selectedVendorForInspection.status === 'suspended' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {selectedVendorForInspection.status}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-300">Supplier Profile & SKU Catalog Inspection Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVendorForInspection(null)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Metrics Highlights Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Sales Revenue</span>
                    <strong className="text-base text-emerald-600 font-black block mt-0.5">
                      ₹{getVendorSalesStats(selectedVendorForInspection.id, selectedVendorForInspection.name).totalSales.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Units Dispatched</span>
                    <strong className="text-base text-slate-800 font-black block mt-0.5">
                      {getVendorSalesStats(selectedVendorForInspection.id, selectedVendorForInspection.name).itemsSold} units
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Seller Rating</span>
                    <strong className="text-base text-amber-500 font-black block mt-0.5">
                      ★ {selectedVendorForInspection.rating || '4.5'} / 5.0
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Catalog Listings</span>
                    <strong className="text-base text-blue-600 font-black block mt-0.5">
                      {products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).length} SKUs
                    </strong>
                  </div>
                </div>

                {/* Contact Card Details */}
                <div className="bg-[#143C6B]/5 border border-[#143C6B]/10 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-[#143C6B] uppercase tracking-wider">🏢 Supplier Contact & Legal Verification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Registered Email Address</span>
                      <strong className="text-slate-800">{selectedVendorForInspection.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Authorized Contact Phone</span>
                      <strong className="text-slate-800 font-mono">{selectedVendorForInspection.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">GSTIN / Tax Registration Code</span>
                      <strong className="text-slate-800 uppercase font-mono">{selectedVendorForInspection.gstin || 'GST_EXEMPT_UNDER_SCHEME'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Onboarding Timestamp</span>
                      <strong className="text-slate-800">
                        {selectedVendorForInspection.createdAt ? new Date(selectedVendorForInspection.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Catalog SKU Listings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">📦 Live catalog upload list ({products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).length} SKUs)</h4>
                  
                  {products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium italic">This supplier has not uploaded any product catalog files yet.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                      {products.filter(p => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name).map(sku => (
                        <div key={sku.id} className="p-3 hover:bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden shrink-0">
                              <img src={sku.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h5 className="font-black text-slate-900">{sku.title}</h5>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase">{sku.category}</span>
                                <span>•</span>
                                <span>SKU Price: <strong className="text-slate-700">₹{sku.price}</strong></span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                              sku.approvalStatus === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : sku.approvalStatus === 'rejected' 
                                  ? 'bg-red-50 text-red-700 border border-red-100' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {sku.approvalStatus || 'pending'}
                            </span>
                            
                            {/* Live moderation buttons */}
                            {sku.approvalStatus !== 'approved' && (
                              <button
                                onClick={() => handleApproveProduct(sku.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md border border-emerald-100 transition-colors cursor-pointer"
                                title="Approve SKU"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collapsible RAW JSON DATABASE INSPECTOR */}
                <details className="group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      <span>🔍 RAW SUPPLIER DATABASE OBJECT INSPECTOR</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
                    <pre>{JSON.stringify(selectedVendorForInspection, null, 2)}</pre>
                  </div>
                </details>
              </div>

              {/* Close Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedVendorForInspection(null)}
                  className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  Close Inspection Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADVANCED INDIVIDUAL CUSTOMER INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedCustomerForInspection && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200/80 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#143C6B] text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-white font-black flex items-center justify-center text-sm">
                    {selectedCustomerForInspection.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <span>{selectedCustomerForInspection.name}</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[8.5px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
                        Verified Customer
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-300">Customer Shipping Profile & Lifetime Order Log Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomerForInspection(null)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Financial Lifetime Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Purchase Volume</span>
                    <strong className="text-lg text-emerald-600 font-black block mt-0.5">
                      ₹{selectedCustomerForInspection.totalSpent.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Total Orders Placed</span>
                    <strong className="text-lg text-slate-800 font-black block mt-0.5">
                      {selectedCustomerForInspection.ordersCount} transactions
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Average Ticket Size (AOV)</span>
                    <strong className="text-lg text-[#143C6B] font-black block mt-0.5">
                      ₹{Math.round(selectedCustomerForInspection.totalSpent / selectedCustomerForInspection.ordersCount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Primary Shipping Card details */}
                <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">📍 DEFAULT SHIPPING ADDRESS & CONTACTS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Recipient Customer Name</span>
                      <strong className="text-slate-800">{selectedCustomerForInspection.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Recipient Phone Number</span>
                      <strong className="text-slate-800 font-mono">{selectedCustomerForInspection.phone}</strong>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 font-medium block">Delivery Street / Locality Address</span>
                      <strong className="text-slate-800">{selectedCustomerForInspection.addressLine || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">City & State</span>
                      <strong className="text-slate-800">{selectedCustomerForInspection.city}, {selectedCustomerForInspection.state}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Pincode / Postal Area Code</span>
                      <strong className="text-slate-800 font-mono">{selectedCustomerForInspection.pincode}</strong>
                    </div>
                  </div>
                </div>

                {/* Complete Lifetime Order Logs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">🛒 COMPLETE LIFETIME ORDER LOGS</h4>
                  
                  <div className="space-y-4">
                    {selectedCustomerForInspection.orders.map((order: Order) => (
                      <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs shadow-3xs">
                        {/* Order Sub-header */}
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 font-bold text-slate-600">
                          <div>
                            Order ID: <span className="text-slate-900 font-mono">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[11px]">
                            <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="p-4 divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs font-semibold">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                  <img src={item.product.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h5 className="font-black text-slate-800">{item.product.title}</h5>
                                  <p className="text-[10px] text-slate-400">
                                    Size: <strong>{item.selectedSize}</strong> • Sold by: <span className="underline">{item.product.soldBy}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-slate-900 font-extrabold">₹{item.product.price}</div>
                                <div className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity || 1}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total Price Summary footer */}
                        <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-150 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-bold">Total Paid Invoiced:</span>
                          <strong className="text-[#143C6B] font-black text-sm">₹{order.totalPrice.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collapsible Raw Inspector */}
                <details className="group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      <span>🔍 RAW CUSTOMER DATABASE OBJECT INSPECTOR</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
                    <pre>{JSON.stringify(selectedCustomerForInspection, null, 2)}</pre>
                  </div>
                </details>
              </div>

              {/* Close Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedCustomerForInspection(null)}
                  className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  Close Inspection Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

          </div>
        )}
      </div>
    </div>
  );
}
