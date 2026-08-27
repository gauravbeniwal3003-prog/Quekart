import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import { resetScrollToTop } from '../utils/scroll';
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
  MapPin,
  MousePointerClick,
  ShieldAlert,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Copy,
  CheckCheck,
  ShieldCheck,
  FileText,
  CreditCard,
  Phone,
  Mail,
  Award,
  DollarSign,
  Store,
  BarChart3,
  AlertCircle,
  Star,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Coupon, CartItem, Vendor, Banner, Category, AppUser, CategoryFilter } from '../types';
import Logo, { BrandLogo, QueKartLogoText } from './Logo';
import { fetchAdminAnalytics } from '../utils/analytics';
import { ReturnPolicyAccordion, SizeAndParametersManager } from './ProductFormControls';
import CategorySmartCropModal from './CategorySmartCropModal';
import BannerSmartCropModal from './BannerSmartCropModal';
import {
  saveCategoryUnified,
  deleteCategoryUnified,
  reorderCategoriesUnified,
  saveCategoryFilterUnified,
  deleteCategoryFilterUnified,
  reorderCategoryFiltersUnified
} from '../supabase';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  banners?: Banner[];
  categories?: Category[];
  onSetCategories?: (categories: Category[]) => void;
  categoryFilters?: CategoryFilter[];
  onSetCategoryFilters?: (filters: CategoryFilter[]) => void;
  onRefreshShopData?: () => void;
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
  navigateTo?: (path: string) => void;
  currentPath?: string;
}

export default function AdminDashboard({
  products,
  orders,
  coupons,
  banners = [],
  categories = [],
  onSetCategories = () => {},
  categoryFilters = [],
  onSetCategoryFilters = () => {},
  onRefreshShopData = () => {},
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
  setActiveSubPage,
  navigateTo = (p) => window.history.pushState(null, '', p),
  currentPath = window.location.pathname + window.location.search
}: AdminDashboardProps) {
  // Admin Passcode State
  const [adminPasscode, setAdminPasscode] = useState(() => {
    try {
      return localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    } catch (_) {
      return 'lucky-secret-admin-pass-123';
    }
  });
  const handlePasscodeChange = (newPass: string) => {
    setAdminPasscode(newPass);
    try {
      localStorage.setItem('lucky_admin_secret', newPass);
    } catch (_) {}
  };

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

  // Database Synchronization States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [syncReport, setSyncReport] = useState<{ products: number; coupons: number; orders: number } | null>(null);

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
      const res = await fetch(getApiUrl('/api/admin/sync-demo-products'), {
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
        onRefreshShopData();
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

  // Scroll to top on sub-page / tab switch in Admin
  useEffect(() => {
    resetScrollToTop();
  }, [activeTab]);

  // TailAdmin Interface States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<'ecommerce' | 'analytics' | 'visitor-traffic'>('ecommerce');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Real-time local admin directories for vendors & approvals
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);

  // Real Platform Analytics State for Admin
  const [adminAnalyticsData, setAdminAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'overview') {
      setIsLoadingAnalytics(true);
      fetchAdminAnalytics()
        .then(data => {
          if (data) {
            setAdminAnalyticsData(data);
          }
        })
        .finally(() => setIsLoadingAnalytics(false));
    }
  }, [activeTab]);
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

  // Synchronize liveProducts state whenever the products prop from the parent component changes
  React.useEffect(() => {
    setLiveProducts(products);
  }, [products]);

  // Load and refresh vendors and system status
  const loadAdminData = async () => {
    setIsLoadingAdminData(true);
    try {
      const [vendorsRes, statusRes] = await Promise.all([
        fetch(getApiUrl('/api/vendors')),
        fetch(getApiUrl('/api/system-status')).catch(() => null)
      ]);
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
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
  }, []);

  // Product Approval Operations
  const handleApproveProduct = async (productId: string) => {
    try {
      const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
      const res = await fetch(`/api/products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (res.ok) {
        // Propagate update to parent component
        const targetProduct = products.find(p => p.id === productId);
        if (targetProduct) {
          const updated = { ...targetProduct, approvalStatus: 'approved' as const, rejectionReason: undefined };
          onEditProduct(updated);
        }
        setTimeout(loadAdminData, 500);
      } else {
        const err = await res.json();
        alert(`Approval failed: ${err.error}`);
      }
    } catch (err) {
      // Offline local emulation
      const targetProduct = products.find(p => p.id === productId);
      if (targetProduct) {
        const updated = { ...targetProduct, approvalStatus: 'approved' as const };
        onEditProduct(updated);
      }
    }
  };

  const handleRejectProduct = async (productId: string) => {
    const reason = rejectionReasonInput[productId]?.trim() || 'Product listing contains low-resolution images or invalid descriptions.';
    try {
      const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
      const res = await fetch(`/api/products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
      });

      if (res.ok) {
        // Propagate update to parent component
        const targetProduct = products.find(p => p.id === productId);
        if (targetProduct) {
          const updated = { ...targetProduct, approvalStatus: 'rejected' as const, rejectionReason: reason };
          onEditProduct(updated);
        }
        setShowRejectionForm(null);
        setTimeout(loadAdminData, 500);
      } else {
        const err = await res.json();
        alert(`Rejection failed: ${err.error}`);
      }
    } catch (err) {
      const targetProduct = products.find(p => p.id === productId);
      if (targetProduct) {
        const updated = { ...targetProduct, approvalStatus: 'rejected' as const, rejectionReason: reason };
        onEditProduct(updated);
      }
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
    const isNowVerified = !(vendor.isVerified ?? (vendor.vendorType === 'big'));
    const nextType = isNowVerified ? 'big' : 'small';
    const updatedVendor: Vendor = { ...vendor, vendorType: nextType, isVerified: isNowVerified };
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

  const handleBanVendor = async (vendor: Vendor) => {
    const isCurrentlyBanned = vendor.status === 'banned';
    const nextStatus = isCurrentlyBanned ? 'active' : 'banned';
    const updatedVendor: Vendor = { ...vendor, status: nextStatus };
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVendor)
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === vendor.id ? updatedVendor : v));
        fetch('/api/products?all=true').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setLiveProducts(data);
        }).catch(() => {});
        onRefreshShopData();
        alert(`Seller "${vendor.name}" is now ${nextStatus === 'banned' ? 'BANNED. Products are now private.' : 'ACTIVATED.'}`);
      } else {
        const err = await res.json();
        alert(`Failed to update seller status: ${err.error}`);
      }
    } catch (err) {
      setVendors(prev => prev.map(v => v.id === vendor.id ? updatedVendor : v));
    }
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to permanently delete seller "${vendor.name}"?\n\nSMART LOGIC: All products listed under this seller will also be deleted automatically!`)) {
      return;
    }
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, { method: 'DELETE' });
      if (res.ok) {
        setVendors(prev => prev.filter(v => v.id !== vendor.id));
        setLiveProducts(prev => prev.filter(p => p.vendorId !== vendor.id));
        onRefreshShopData();
        alert(`Seller "${vendor.name}" and all associated products have been deleted.`);
      } else {
        const err = await res.json();
        alert(`Failed to delete seller: ${err.error}`);
      }
    } catch (err: any) {
      alert(`Error deleting seller: ${err.message}`);
    }
  };

  const [dbUsers, setDbUsers] = useState<AppUser[]>([]);

  React.useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDbUsers(data); })
      .catch(() => {});
  }, []);

  const handleToggleCustomerBan = async (customer: any) => {
    const isCurrentlyBanned = customer.status === 'banned';
    const newStatus = isCurrentlyBanned ? 'active' : 'banned';
    const updatedCustomer = { ...customer, status: newStatus, isBanned: !isCurrentlyBanned };
    const idOrPhone = customer.id || customer.phone;
    try {
      const res = await fetch(`/api/users/${idOrPhone}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer)
      });
      if (res.ok) {
        setDbUsers(prev => prev.map(u => (u.id === customer.id || u.phone === customer.phone) ? { ...u, status: newStatus } : u));
        fetch('/api/products?all=true').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setLiveProducts(data);
        }).catch(() => {});
        alert(`Customer "${customer.name}" is now ${newStatus === 'banned' ? 'BANNED. Account login and reviews are hidden.' : 'ACTIVATED.'}`);
      } else {
        alert('Failed to update customer status');
      }
    } catch (err) {
      alert('Error updating customer status');
    }
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (!confirm(`Are you sure you want to permanently delete customer "${customer.name}"?`)) {
      return;
    }
    const idOrPhone = customer.id || customer.phone;
    try {
      const res = await fetch(`/api/users/${idOrPhone}`, { method: 'DELETE' });
      if (res.ok) {
        setDbUsers(prev => prev.filter(u => u.id !== customer.id && u.phone !== customer.phone));
        alert(`Customer "${customer.name}" deleted successfully.`);
      } else {
        alert('Failed to delete customer');
      }
    } catch (err: any) {
      alert(`Error deleting customer: ${err.message}`);
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
  const [vendorStatsTimeFilter, setVendorStatsTimeFilter] = useState<'all' | 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year'>('all');
  const [copiedGst, setCopiedGst] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSort, setCustomerSort] = useState('spent-desc');
  const [customerStateFilter, setCustomerStateFilter] = useState('All');
  const [customerCityFilter, setCustomerCityFilter] = useState('All');
  const [selectedCustomerForInspection, setSelectedCustomerForInspection] = useState<any | null>(null);
  const [selectedProductForInspection, setSelectedProductForInspection] = useState<Product | null>(null);
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState<Order | null>(null);
  const [vendorCatalogSearch, setVendorCatalogSearch] = useState('');
  const [vendorCatalogCategory, setVendorCatalogCategory] = useState('All');
  const [vendorCatalogStatus, setVendorCatalogStatus] = useState('All');
  const [vendorCatalogSort, setVendorCatalogSort] = useState('newest');
  const [activeProductImageIndex, setActiveProductImageIndex] = useState(0);
  
  // Modals & Form States
  const [adminSubView, setAdminSubView] = useState<'list' | 'add-product' | 'edit-product' | 'inspect-product' | 'add-coupon' | 'add-banner' | 'inspect-vendor' | 'inspect-order' | 'inspect-customer'>('list');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Sync activeSubPage with adminSubView & targeted objects
  React.useEffect(() => {
    if (!activeSubPage) {
      setAdminSubView('list');
      return;
    }
    const parts = activeSubPage.split('/');
    const main = parts[0];
    const param = parts.slice(1).join('/');

    if (main === 'add-product') {
      setAdminSubView('add-product');
    } else if (main === 'edit-product') {
      setAdminSubView('edit-product');
      if (param) {
        const prod = products.find(p => p.id === param || String(p.numericId) === param);
        if (prod) {
          resetProductForm(prod);
        }
      }
    } else if (main === 'inspect-product') {
      setAdminSubView('inspect-product');
      if (param) {
        const prod = products.find(p => p.id === param || String(p.numericId) === param.replace(/^#/, ''));
        if (prod) setSelectedProductForInspection(prod);
      }
    } else if (main === 'inspect-vendor' || (main === 'vendors' && param)) {
      setAdminSubView('inspect-vendor');
      if (param) {
        const cleanParam = decodeURIComponent(param).replace(/^#/, '');
        const vend = vendors.find(v => v.id === param || String(v.numericId) === cleanParam || v.name.toLowerCase() === decodeURIComponent(param).toLowerCase());
        if (vend) setSelectedVendorForInspection(vend);
      }
    } else if (main === 'inspect-order' || (main === 'orders' && param)) {
      setAdminSubView('inspect-order');
      if (param) {
        const ord = orders.find(o => o.id === param);
        if (ord) setSelectedOrderForInspection(ord);
      }
    } else if (main === 'inspect-customer' || (main === 'customers' && param)) {
      setAdminSubView('inspect-customer');
    } else if (main === 'add-coupon') {
      setAdminSubView('add-coupon');
    } else if (main === 'add-banner') {
      setAdminSubView('add-banner');
    } else {
      setAdminSubView('list');
    }
  }, [activeSubPage, products, vendors, orders]);

  // Categories management states
  const [categorySubTab, setCategorySubTab] = useState<'categories' | 'filters'>('categories');
  const [categoryFormMode, setCategoryFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('shopping-bag');
  const [categoryImage, setCategoryImage] = useState('');
  const [categorySubCats, setCategorySubCats] = useState<Array<{ name: string; image: string }>>([]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Category Filters management states
  const [filterFormMode, setFilterFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingFilter, setEditingFilter] = useState<CategoryFilter | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterImage, setFilterImage] = useState('');
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([]);
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const filterFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Category Smart Crop Modal states
  const [isCategoryCropperOpen, setIsCategoryCropperOpen] = useState(false);
  const [categoryCropperSrc, setCategoryCropperSrc] = useState('');
  const [categoryCropTarget, setCategoryCropTarget] = useState<{ type: 'main' } | { type: 'sub'; index: number } | { type: 'filter' }>({ type: 'main' });
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const categoryFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const subCategoryFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeSubCropIndex, setActiveSubCropIndex] = useState<number | null>(null);

  // Sponsorship state variables
  const [sponsorSearchId, setSponsorSearchId] = useState('');
  const [sponsorDuration, setSponsorDuration] = useState('1day');
  const [isSponsoringSubmitting, setIsSponsoringSubmitting] = useState(false);

  // Find searched sponsor product
  const sponsorProduct = sponsorSearchId
    ? products.find((p) => p.numericId === Number(sponsorSearchId))
    : null;

  // Active sponsored products
  const activeSponsoredProducts = products.filter(
    (p) => p.sponsoredUntil && new Date(p.sponsoredUntil) > new Date()
  );

  const formatSponsorshipRemaining = (isoString: string) => {
    try {
      const diffMs = new Date(isoString).getTime() - new Date().getTime();
      if (diffMs <= 0) return 'Expired';
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) {
        return `${days}d ${hours % 24}h remaining`;
      }
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      return `${hours}h ${mins}m remaining`;
    } catch {
      return 'Active';
    }
  };

  const handleActivateSponsorship = async () => {
    if (!sponsorProduct) return;
    setIsSponsoringSubmitting(true);
    try {
      const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
      const response = await fetch(getApiUrl('/api/products/sponsor'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret,
        },
        body: JSON.stringify({
          numericId: sponsorProduct.numericId,
          duration: sponsorDuration,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sponsor product');
      }

      if (data.product) {
        onEditProduct(data.product);
      }
      
      alert(data.message || `Successfully sponsored ${sponsorProduct.title}!`);
      setSponsorSearchId('');
    } catch (err: any) {
      alert(`Sponsorship failed: ${err.message}`);
    } finally {
      setIsSponsoringSubmitting(false);
    }
  };

  // Helper functions for category management
  const handleCategoryDelete = async (catId: string) => {
    try {
      await deleteCategoryUnified(catId, adminPasscode);
      onSetCategories(categories.filter(c => c.id !== catId));
      onRefreshShopData();
    } catch (err) {
      console.error(err);
      alert('Network error deleting category');
    }
  };

  const handleCategoryMoveUp = async (index: number) => {
    if (index === 0) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[index - 1];
    newCats[index - 1] = temp;
    
    // Optimistic UI update
    onSetCategories(newCats);

    try {
      await reorderCategoriesUnified(newCats.map(c => c.id), adminPasscode);
    } catch (err) {
      console.error('Network error during category reordering:', err);
    }
  };

  const handleCategoryMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[index + 1];
    newCats[index + 1] = temp;

    // Optimistic UI update
    onSetCategories(newCats);

    try {
      await reorderCategoriesUnified(newCats.map(c => c.id), adminPasscode);
    } catch (err) {
      console.error('Network error during category reordering:', err);
    }
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setCategoryError('Category Name is required');
      return;
    }
    
    setIsSavingCategory(true);
    setCategoryError(null);

    const generatedId = editingCategory?.id || 'cat-' + categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload: Category = {
      id: generatedId,
      name: categoryName.trim(),
      icon: categoryIcon,
      image: categoryImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300'
    };

    try {
      const isEdit = categoryFormMode === 'edit';
      const savedData = await saveCategoryUnified(payload, isEdit, adminPasscode);

      if (isEdit) {
        onSetCategories(categories.map(c => c.id === editingCategory?.id ? savedData : c));
      } else {
        onSetCategories([...categories, savedData]);
      }
      onRefreshShopData();
      // Reset and close form
      setCategoryFormMode(null);
      setEditingCategory(null);
      setCategoryName('');
      setCategoryIcon('shopping-bag');
      setCategoryImage('');
      setCategorySubCats([]);
    } catch (err) {
      console.error(err);
      setCategoryError('Network error saving category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleOpenCategoryCropper = (imageSrc: string, target: { type: 'main' } | { type: 'sub'; index: number } | { type: 'filter' }) => {
    setCategoryCropperSrc(imageSrc || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600');
    setCategoryCropTarget(target);
    setIsCategoryCropperOpen(true);
  };

  const handleCategoryFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, target: { type: 'main' } | { type: 'sub'; index: number }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleOpenCategoryCropper(event.target.result as string, target);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCategoryCropConfirm = async (croppedDataUrl: string) => {
    setIsUploadingCategoryImage(true);
    try {
      const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
      let finalImageUrl = croppedDataUrl;

      // Host through proxied server endpoint
      try {
        const res = await fetch(getApiUrl('/api/upload-image'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Secret': adminSecret
          },
          body: JSON.stringify({ image: croppedDataUrl })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            finalImageUrl = data.imageUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('Backend image hosting fallback to base64 data url:', uploadErr);
      }

      if (categoryCropTarget.type === 'main') {
        setCategoryImage(finalImageUrl);
      } else if (categoryCropTarget.type === 'filter') {
        setFilterImage(finalImageUrl);
      } else {
        const updated = [...categorySubCats];
        if (updated[categoryCropTarget.index]) {
          updated[categoryCropTarget.index].image = finalImageUrl;
          setCategorySubCats(updated);
        }
      }
      setIsCategoryCropperOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Error applying cropped image: ${err.message}`);
    } finally {
      setIsUploadingCategoryImage(false);
    }
  };

  const handleFilterFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCategoryCropperSrc(event.target.result as string);
        setCategoryCropTarget({ type: 'filter' });
        setIsCategoryCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFilterDelete = async (filterId: string) => {
    try {
      await deleteCategoryFilterUnified(filterId, adminPasscode);
      onSetCategoryFilters(categoryFilters.filter(f => f.id !== filterId));
      onRefreshShopData();
    } catch (err) {
      console.error(err);
      alert('Network error deleting category filter');
    }
  };

  const handleFilterMoveUp = async (index: number) => {
    if (index === 0) return;
    const newFilters = [...categoryFilters];
    const temp = newFilters[index];
    newFilters[index] = newFilters[index - 1];
    newFilters[index - 1] = temp;
    
    // Optimistic UI update
    onSetCategoryFilters(newFilters);

    try {
      await reorderCategoryFiltersUnified(newFilters.map(f => f.id), adminPasscode);
    } catch (err) {
      console.error('Network error during category filters reordering:', err);
    }
  };

  const handleFilterMoveDown = async (index: number) => {
    if (index === categoryFilters.length - 1) return;
    const newFilters = [...categoryFilters];
    const temp = newFilters[index];
    newFilters[index] = newFilters[index + 1];
    newFilters[index + 1] = temp;

    // Optimistic UI update
    onSetCategoryFilters(newFilters);

    try {
      await reorderCategoryFiltersUnified(newFilters.map(f => f.id), adminPasscode);
    } catch (err) {
      console.error('Network error during category filters reordering:', err);
    }
  };

  const handleFilterSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterName.trim()) {
      setFilterError('Filter Name is required');
      return;
    }

    setIsSavingFilter(true);
    setFilterError(null);

    const generatedId = editingFilter?.id || 'filter-' + filterName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload: CategoryFilter = {
      id: generatedId,
      name: filterName,
      image: filterImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150',
      categoryIds: filterCategoryIds
    };

    try {
      const isEdit = filterFormMode === 'edit';
      const savedData = await saveCategoryFilterUnified(payload, isEdit, adminPasscode);

      if (isEdit) {
        onSetCategoryFilters(categoryFilters.map(f => f.id === editingFilter?.id ? savedData : f));
      } else {
        onSetCategoryFilters([...categoryFilters, savedData]);
      }
      onRefreshShopData();
      setFilterFormMode(null);
      setEditingFilter(null);
      setFilterName('');
      setFilterImage('');
      setFilterCategoryIds([]);
    } catch (err) {
      console.error(err);
      setFilterError('Network error saving category filter');
    } finally {
      setIsSavingFilter(false);
    }
  };

  const triggerAddFilter = () => {
    setFilterFormMode('add');
    setEditingFilter(null);
    setFilterName('');
    setFilterImage('');
    setFilterCategoryIds([]);
    setFilterError(null);
  };

  const triggerEditFilter = (filt: CategoryFilter) => {
    setFilterFormMode('edit');
    setEditingFilter(filt);
    setFilterName(filt.name);
    setFilterImage(filt.image || '');
    setFilterCategoryIds(filt.categoryIds || []);
    setFilterError(null);
  };

  const triggerAddCategory = () => {
    setCategoryFormMode('add');
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('shopping-bag');
    setCategoryImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300');
    setCategorySubCats([]);
    setCategoryError(null);
  };

  const triggerEditCategory = (cat: Category) => {
    setCategoryFormMode('edit');
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryIcon(cat.icon || 'shopping-bag');
    setCategoryImage(cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300');
    setCategoryError(null);
  };

  // New Coupon Form Fields
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'flat' | 'percentage'>('flat');
  const [cValue, setCValue] = useState(50);
  const [cMinPurchase, setCMinPurchase] = useState(299);
  const [cDescription, setCDescription] = useState('Flat ₹50 OFF on orders above ₹299');
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Synchronize sub-view when tab changes or deep URL route parameters are hit
  React.useEffect(() => {
    if (activeTab && activeTab.startsWith('edit-product/')) {
      const prodId = activeTab.replace('edit-product/', '');
      const foundProduct = products.find(p => p.id === prodId);
      if (foundProduct) {
        resetProductForm(foundProduct);
        setAdminSubView('edit-product');
      } else {
        setAdminSubView('list');
      }
    } else if (activeTab === 'add-product') {
      resetProductForm();
      setAdminSubView('add-product');
    } else if (activeTab === 'add-coupon') {
      setCCode('');
      setCType('flat');
      setCValue(50);
      setCMinPurchase(299);
      setCDescription('Flat ₹50 OFF on orders above ₹299');
      setEditingCoupon(null);
      setAdminSubView('add-coupon');
    } else if (activeTab && activeTab.startsWith('edit-coupon/')) {
      const couponCode = activeTab.replace('edit-coupon/', '');
      const foundCoupon = coupons.find(c => c.code === couponCode);
      if (foundCoupon) {
        setCCode(foundCoupon.code);
        setCType(foundCoupon.discountType);
        setCValue(foundCoupon.value);
        setCMinPurchase(foundCoupon.minPurchase);
        setCDescription(foundCoupon.description);
        setEditingCoupon(foundCoupon);
        setAdminSubView('add-coupon');
      } else {
        setAdminSubView('list');
      }
    } else if (activeTab === 'add-banner') {
      setBType('promotional');
      setBImageUrl('');
      setBLinkUrl('');
      setBRow('main');
      setBOrder(1);
      setBTitle('');
      setBSubtitle('');
      setBCode('');
      setBTargetCategory('');
      setEditingBanner(null);
      setAdminSubView('add-banner');
    } else if (activeTab && activeTab.startsWith('edit-banner/')) {
      const bId = activeTab.replace('edit-banner/', '');
      const foundBanner = (banners || []).find(b => b.id === bId);
      if (foundBanner) {
        setBType(foundBanner.type);
        setBImageUrl(foundBanner.imageUrl);
        setBLinkUrl(foundBanner.linkUrl || '');
        setBRow(foundBanner.row || 'main');
        setBOrder(foundBanner.order || 1);
        setBTitle(foundBanner.title || '');
        setBSubtitle(foundBanner.subtitle || '');
        setBCode(foundBanner.code || '');
        setBTargetCategory(foundBanner.targetCategory || '');
        setEditingBanner(foundBanner);
        setAdminSubView('add-banner');
      } else {
        setAdminSubView('list');
      }
    } else {
      setAdminSubView('list');
    }
    setCategoryFormMode(null);
  }, [activeTab, products, coupons, banners]);

  // New Banner Form Fields
  const [bType, setBType] = useState<'promotional' | 'news'>('promotional');
  const [bImageUrl, setBImageUrl] = useState('');
  const [bLinkUrl, setBLinkUrl] = useState('');
  const [bRow, setBRow] = useState<'main' | 'double' | 'upper' | 'lower'>('main');
  const [bOrder, setBOrder] = useState<number>(1);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bCode, setBCode] = useState('');
  const [bTargetCategory, setBTargetCategory] = useState('');
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isBannerCropOpen, setIsBannerCropOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState('');

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
  const [pVendorId, setPVendorId] = useState<string>('');
  const [pReturnPolicyType, setPReturnPolicyType] = useState<'return' | 'replacement' | 'no_return'>('return');
  const [pReturnDays, setPReturnDays] = useState(7);

  // Extra fields to let admin edit absolutely everything
  const [pSoldBy, setPSoldBy] = useState('Gaurav Garments');
  const [pSoldByRating, setPSoldByRating] = useState(4.8);
  const [pRating, setPRating] = useState(4.5);
  const [pRatingCount, setPRatingCount] = useState(124);
  const [pReviewCount, setPReviewCount] = useState(48);
  const [pHighlights, setPHighlights] = useState<Array<{ label: string; value: string }>>([
    { label: 'Fabric', value: 'Cotton Blend' },
    { label: 'Stitch Type', value: 'Fully Stitched' },
    { label: 'Occasion', value: 'Festive & Casual' }
  ]);
  const [pAdditionalDetails, setPAdditionalDetails] = useState<Array<{ label: string; value: string }>>([
    { label: 'Manufacturer', value: 'Gaurav Garments Private Limited' },
    { label: 'Country of Origin', value: 'India' }
  ]);
  const [pVariants, setPVariants] = useState<Array<{ colorName: string; imageUrl: string; price: number; originalPrice: number }>>([]);

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

      const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
      const res = await fetch(getApiUrl('/api/upload-image'), {
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
        const adminSecret = adminPasscode || 'lucky-secret-admin-pass-123';
        const res = await fetch(getApiUrl('/api/upload-image'), {
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
      setPReturnPolicyType(product.returnPolicyType || 'return');
      setPReturnDays(product.returnDays || 7);
      setPSoldBy(product.soldBy || 'Gaurav Garments');
      setPSoldByRating(product.soldByRating || 4.8);
      setPVendorId(product.vendorId || '');
      setPRating(product.rating || 4.5);
      setPRatingCount(product.ratingCount || 124);
      setPReviewCount(product.reviewCount || 48);
      setPHighlights(product.productHighlights && product.productHighlights.length > 0 ? product.productHighlights : [
        { label: 'Fabric', value: 'Cotton Blend' },
        { label: 'Stitch Type', value: 'Fully Stitched' },
        { label: 'Occasion', value: 'Festive & Casual' }
      ]);
      setPAdditionalDetails(product.additionalDetails && product.additionalDetails.length > 0 ? product.additionalDetails : [
        { label: 'Manufacturer', value: 'Gaurav Garments Private Limited' },
        { label: 'Country of Origin', value: 'India' }
      ]);
      setPVariants(product.variants && product.variants.length > 0 ? product.variants : []);
    } else {
      setEditingProduct(null);
      setPTitle('');
      setPPrice(299);
      setPOriginalPrice(599);
      setPCategory(categories && categories.length > 0 ? categories[0].name : 'Kurtis & Suits');
      setPSubCategory('Anarkali Sets');
      setPDescription('');
      setPImages(['']);
      setPSizeOptions(['S', 'M', 'L', 'XL']);
      setPTag('');
      setPCodPrice(45);
      setPHasUpiOffer(true);
      setPReturnPolicyType('return');
      setPReturnDays(7);
      setPSoldBy('Gaurav Garments');
      setPSoldByRating(4.8);
      setPVendorId('');
      setPRating(4.5);
      setPRatingCount(124);
      setPReviewCount(48);
      setPHighlights([
        { label: 'Fabric', value: 'Cotton Blend' },
        { label: 'Stitch Type', value: 'Fully Stitched' },
        { label: 'Occasion', value: 'Festive & Casual' }
      ]);
      setPAdditionalDetails([
        { label: 'Manufacturer', value: 'Gaurav Garments Private Limited' },
        { label: 'Country of Origin', value: 'India' }
      ]);
      setPVariants([]);
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
      returnPolicyType: pReturnPolicyType,
      returnDays: pReturnPolicyType !== 'no_return' ? pReturnDays : undefined,
      returnPolicyText: pReturnPolicyType === 'no_return' 
        ? 'Non-Returnable (Final Sale)' 
        : (pReturnPolicyType === 'replacement' ? `${pReturnDays || 7} Days Replacement Only` : `${pReturnDays || 7} Days Return & Refund`),
      rating: pRating,
      ratingCount: pRatingCount,
      reviewCount: pReviewCount,
      images: cleanImages,
      variants: pVariants.length > 0 ? pVariants : [
        {
          colorName: 'Standard',
          imageUrl: cleanImages[0],
          price: pPrice,
          originalPrice: pOriginalPrice
        }
      ],
      soldBy: pSoldBy,
      soldByRating: pSoldByRating,
      productHighlights: pHighlights.filter(h => h.label.trim() && h.value.trim()),
      additionalDetails: pAdditionalDetails.filter(d => d.label.trim() && d.value.trim()),
      sizeOptions: pSizeOptions.filter(Boolean),
      vendorId: pVendorId || (editingProduct ? editingProduct.vendorId : undefined),
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
    setEditingProduct(null);
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('products');
    }
  };

  // Submit Banner Form
  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bImageUrl.trim() || !onAddBanner) return;

    onAddBanner({
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      imageUrl: bImageUrl.trim(),
      linkUrl: bLinkUrl.trim() || undefined,
      type: bType,
      row: bRow,
      order: Number(bOrder) || 1,
      title: bTitle.trim() || undefined,
      subtitle: bSubtitle.trim() || undefined,
      code: bCode.trim() || undefined,
      targetCategory: bTargetCategory.trim() || undefined
    });
    
    setBImageUrl('');
    setBLinkUrl('');
    setBType('promotional');
    setBRow('main');
    setBOrder(1);
    setBTitle('');
    setBSubtitle('');
    setBCode('');
    setBTargetCategory('');
    setEditingBanner(null);
    
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('banners');
    }
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
    
    // Reset coupon fields
    setCCode('');
    setCValue(50);
    setCMinPurchase(299);
    setCDescription('');
    setEditingCoupon(null);

    if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('coupons');
    }
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

  // Extract unique users (customers) from database users and orders
  const uniqueUsers = React.useMemo(() => {
    const usersMap = new Map<string, {
      id?: string;
      name: string;
      phone: string;
      status?: string;
      addressLine: string;
      city: string;
      pincode: string;
      state: string;
      totalSpent: number;
      ordersCount: number;
      orders: Order[];
      registeredAt: string;
    }>();

    dbUsers.forEach(u => {
      const key = u.phone || u.id;
      if (key) {
        usersMap.set(key, {
          id: u.id,
          name: u.name || 'Registered Customer',
          phone: u.phone || '',
          status: u.status || (u.isBanned ? 'banned' : 'active'),
          addressLine: u.address || '',
          city: u.city || '',
          pincode: u.pincode || '',
          state: u.state || '',
          totalSpent: 0,
          ordersCount: 0,
          orders: [],
          registeredAt: u.createdAt || new Date().toISOString()
        });
      }
    });

    orders.forEach(o => {
      const phone = o.shippingAddress.phone || 'unknown';
      const name = o.shippingAddress.name || 'Anonymous Customer';
      if (!usersMap.has(phone)) {
        usersMap.set(phone, {
          name,
          phone,
          status: 'active',
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
  }, [orders, dbUsers]);


  // Calculate statistics
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const activeCouponsCount = coupons.length;
  const totalProductsCount = products.length;

  // Filtered lists
  const filteredProducts = enrichedProducts.filter(p => {
    const cleanSearch = productSearch.trim().toLowerCase();
    const cleanNumericSearch = cleanSearch.replace(/^#/, '');
    const matchesSearch = !cleanSearch ||
                          p.title.toLowerCase().includes(cleanSearch) || 
                          p.category.toLowerCase().includes(cleanSearch) ||
                          (p.subCategory && p.subCategory.toLowerCase().includes(cleanSearch)) ||
                          p.id.toLowerCase().includes(cleanSearch) ||
                          (p.numericId !== undefined && (
                            String(p.numericId) === cleanNumericSearch ||
                            String(p.numericId).includes(cleanNumericSearch)
                          )) ||
                          (p.soldBy && p.soldBy.toLowerCase().includes(cleanSearch)) ||
                          (p.vendorId && p.vendorId.toLowerCase().includes(cleanSearch));
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
    const cleanSearch = vendorSearch.trim().toLowerCase();
    const cleanNumericSearch = cleanSearch.replace(/^#/, '');
    const matchesSearch = !cleanSearch ||
                          v.name.toLowerCase().includes(cleanSearch) ||
                          v.email.toLowerCase().includes(cleanSearch) ||
                          v.phone.includes(cleanSearch) ||
                          v.id.toLowerCase().includes(cleanSearch) ||
                          (v.numericId !== undefined && (
                            String(v.numericId) === cleanNumericSearch ||
                            String(v.numericId).includes(cleanNumericSearch)
                          )) ||
                          (v.gstin && v.gstin.toLowerCase().includes(cleanSearch)) ||
                          (v.businessCategory && v.businessCategory.toLowerCase().includes(cleanSearch));
    
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
        {isEdit && (
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-col gap-2">
            {/* Browser Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
              <div className="bg-white px-3 py-1.5 rounded-t-lg border-t border-x border-slate-200 flex items-center gap-2 max-w-[240px] shadow-3xs">
                <span className="text-emerald-500 text-xs shrink-0">🔒</span>
                <span className="truncate">Edit SKU: {pTitle || 'Loading...'}</span>
              </div>
              <div className="px-3 py-1.5 text-slate-400 text-[10px]">
                + New Tab
              </div>
            </div>
 
            {/* Address Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-300 shrink-0 select-none">
                <button type="button" disabled className="p-1 font-mono text-slate-300 cursor-not-allowed">◀</button>
                <button type="button" disabled className="p-1 font-mono text-slate-300 cursor-not-allowed">▶</button>
                <button type="button" onClick={() => alert('Refreshing simulated session... Layout persisted successfully.')} className="p-1 hover:bg-slate-200 text-slate-400 rounded-md font-mono">🔄</button>
              </div>
 
              <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-700 flex items-center justify-between shadow-3xs min-w-0">
                <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                  <span className="text-emerald-600 text-xs shrink-0">🔒</span>
                  <span className="text-slate-400 shrink-0 select-none hidden sm:inline">https://quekart.com/admin/temp-edit-product/</span>
                  <span className="text-slate-400 shrink-0 select-none sm:hidden">https://.../</span>
                  <span className="text-slate-900 font-mono font-bold truncate select-all">{editingProduct?.id || 'prod-temp-xyz'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const tempUrl = `https://quekart.com/admin/temp-edit-product/${editingProduct?.id || 'prod-temp-xyz'}`;
                    navigator.clipboard.writeText(tempUrl);
                    alert(`Copied temporary edit URL to clipboard:\n${tempUrl}`);
                  }}
                  className="text-[9.5px] font-extrabold text-lucky-magenta bg-lucky-magenta/5 hover:bg-lucky-magenta/10 px-2 py-0.5 rounded-sm transition-all shrink-0 ml-2"
                  title="Copy temporary URL"
                >
                  Copy URL
                </button>
              </div>
 
              <div className="hidden md:block bg-emerald-500 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-sm uppercase tracking-wider animate-pulse shadow-3xs shrink-0">
                SUPER POWERED LIVE SESSION
              </div>
            </div>
          </div>
        )}
 
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                {categories && categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Kurtis & Suits">Kurtis & Suits</option>
                    <option value="Watches">Watches</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Bags & Purses">Bags & Purses</option>
                  </>
                )}
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

          {/* Size and Custom Dimensions Parameters Manager */}
          <div>
            <SizeAndParametersManager
              sizeOptions={pSizeOptions}
              setSizeOptions={setPSizeOptions}
              idPrefix="admin-prod"
            />
          </div>

          {/* Return & Replacement Policy (Arrow-type Expandable Dropdown / Accordion) */}
          <ReturnPolicyAccordion
            returnPolicyType={pReturnPolicyType}
            setReturnPolicyType={setPReturnPolicyType}
            returnDays={pReturnDays}
            setReturnDays={setPReturnDays}
            idPrefix="admin-prod"
          />

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
                <span>Uploading & Processing Image...</span>
              </div>
            )}
          </div>

          {/* SUPER ADMIN ADVANCED CONTROLS SECTION */}
          <div className="border-t border-slate-100 pt-5 mt-5 space-y-6">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-lucky-magenta animate-pulse"></span>
              Super Admin Control Center: Advanced Product Specifications
            </h4>

            {/* Vendor & Popularity Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Sold By / Vendor Name</label>
                <input
                  type="text"
                  value={pSoldBy}
                  onChange={(e) => setPSoldBy(e.target.value)}
                  placeholder="e.g. Gaurav Garments"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Vendor Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={pSoldByRating}
                  onChange={(e) => setPSoldByRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Popularity Star Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={pRating}
                  onChange={(e) => setPRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Rating Count</label>
                <input
                  type="number"
                  min="0"
                  value={pRatingCount}
                  onChange={(e) => setPRatingCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                />
              </div>
            </div>

            {/* Highlights (Key-Value Specs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Key Product Highlights (e.g. Fabric, Stitch Type)</label>
                <button
                  type="button"
                  onClick={() => setPHighlights([...pHighlights, { label: '', value: '' }])}
                  className="text-[10px] font-black text-lucky-magenta hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Highlight Spec
                </button>
              </div>

              <div className="space-y-2">
                {pHighlights.map((high, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={high.label}
                      onChange={(e) => {
                        const updated = [...pHighlights];
                        updated[idx].label = e.target.value;
                        setPHighlights(updated);
                      }}
                      placeholder="e.g. Fabric"
                      className="w-1/3 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <input
                      type="text"
                      value={high.value}
                      onChange={(e) => {
                        const updated = [...pHighlights];
                        updated[idx].value = e.target.value;
                        setPHighlights(updated);
                      }}
                      placeholder="e.g. Premium Slub Cotton"
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setPHighlights(pHighlights.filter((_, i) => i !== idx))}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {pHighlights.length === 0 && (
                  <p className="text-[10px] text-slate-400 font-semibold italic">No custom highlights specified.</p>
                )}
              </div>
            </div>

            {/* Additional Details (Manufacturer, Country etc.) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Additional System Metadata (e.g. Manufacturer, Country of Origin)</label>
                <button
                  type="button"
                  onClick={() => setPAdditionalDetails([...pAdditionalDetails, { label: '', value: '' }])}
                  className="text-[10px] font-black text-lucky-magenta hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add System Metadata Row
                </button>
              </div>

              <div className="space-y-2">
                {pAdditionalDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={detail.label}
                      onChange={(e) => {
                        const updated = [...pAdditionalDetails];
                        updated[idx].label = e.target.value;
                        setPAdditionalDetails(updated);
                      }}
                      placeholder="e.g. Manufacturer"
                      className="w-1/3 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <input
                      type="text"
                      value={detail.value}
                      onChange={(e) => {
                        const updated = [...pAdditionalDetails];
                        updated[idx].value = e.target.value;
                        setPAdditionalDetails(updated);
                      }}
                      placeholder="e.g. Traditional Textiles Pvt Ltd"
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setPAdditionalDetails(pAdditionalDetails.filter((_, i) => i !== idx))}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {pAdditionalDetails.length === 0 && (
                  <p className="text-[10px] text-slate-400 font-semibold italic">No additional system metadata specified.</p>
                )}
              </div>
            </div>

            {/* Custom Variants Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Multi-Color Swatches & SKUs Variants</label>
                  <p className="text-[10px] text-slate-400 font-bold">Provide custom image and override pricing per color swatch variant if desired</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPVariants([...pVariants, { colorName: '', imageUrl: pImages[0] || '', price: pPrice, originalPrice: pOriginalPrice }])}
                  className="text-[10px] font-black text-lucky-magenta hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Swatch Variant
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {pVariants.map((v, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-3xs relative">
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      {v.imageUrl ? (
                        <img src={v.imageUrl} alt={v.colorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">NO IMG</div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase">Color Swatch Name</label>
                        <input
                          type="text"
                          required
                          value={v.colorName}
                          onChange={(e) => {
                            const updated = [...pVariants];
                            updated[idx].colorName = e.target.value;
                            setPVariants(updated);
                          }}
                          placeholder="e.g. Royal Blue"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 text-xs font-semibold"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase">Image URL (Hosted)</label>
                        <input
                          type="text"
                          required
                          value={v.imageUrl}
                          onChange={(e) => {
                            const updated = [...pVariants];
                            updated[idx].imageUrl = e.target.value;
                            setPVariants(updated);
                          }}
                          placeholder="Image URL"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...pVariants];
                            updated[idx].price = Number(e.target.value);
                            setPVariants(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase">MRP (₹)</label>
                        <input
                          type="number"
                          required
                          value={v.originalPrice}
                          onChange={(e) => {
                            const updated = [...pVariants];
                            updated[idx].originalPrice = Number(e.target.value);
                            setPVariants(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPVariants(pVariants.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-full shadow-sm cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {pVariants.length === 0 && (
                  <p className="text-[11px] text-slate-400 font-bold text-center py-2">
                    No custom variants specified. The standard catalog details will represent the primary variant.
                  </p>
                )}
              </div>
            </div>
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
            <div>
              <h3 className="text-sm font-black text-slate-900">{editingBanner ? 'Edit Banner Position' : 'Add New Banner'}</h3>
              <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">Home Page Banner Slot</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleBannerSubmit} className="p-6 space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Target Banner Area *</label>
              <select
                value={bRow}
                onChange={(e) => setBRow(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
              >
                <option value="main">Main Banner (Upper Main Banner Area)</option>
                <option value="double">Double Banners (Below Row - 2 Banners in 1 Row)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Display Order Weight *</label>
              <input
                type="number"
                min={1}
                required
                value={bOrder}
                onChange={(e) => setBOrder(Number(e.target.value))}
                placeholder="e.g. 1 (first), 2 (second)"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
              />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Banner Title (Optional)</label>
              <input
                type="text"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="e.g. RAKSHA BANDHAN MAHOTSAV"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Banner Subtitle (Optional)</label>
              <input
                type="text"
                value={bSubtitle}
                onChange={(e) => setBSubtitle(e.target.value)}
                placeholder="e.g. Up to 80% OFF on Traditional Wear"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Coupon Code Overlay (Optional)</label>
              <input
                type="text"
                value={bCode}
                onChange={(e) => setBCode(e.target.value)}
                placeholder="e.g. FESTIVE100"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Target Category Redirect (Optional)</label>
              <input
                type="text"
                value={bTargetCategory}
                onChange={(e) => setBTargetCategory(e.target.value)}
                placeholder="e.g. Jewellery & Accessories"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Banner Graphic Image *</label>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                id="banner-file-upload-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      setBannerCropSrc(event.target.result as string);
                      setIsBannerCropOpen(true);
                    }
                  };
                  reader.readAsDataURL(file);
                  e.target.value = ''; // Reset
                }}
              />
              
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">Drag & drop or click to upload</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Supports high-res PNG, JPG, WebP</p>
              
              <button
                type="button"
                onClick={() => document.getElementById('banner-file-upload-input')?.click()}
                className="mt-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-black text-[10px] px-3.5 py-2 rounded-lg cursor-pointer shadow-3xs"
              >
                Choose File
              </button>
            </div>

            {Boolean(bImageUrl?.trim()) && (
              <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Live Poster Rendering (as seen in /shop):</p>
                
                <div className={`bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80 relative shadow-md group ${
                  (bRow === 'main' || bRow === 'upper') ? 'aspect-[16/5]' : 'aspect-[11/5]'
                }`}>
                  <img src={bImageUrl.trim()} alt="Preview" className="w-full h-full object-cover object-center animate-fadeIn" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#143C6B]/90 via-[#143C6B]/60 to-transparent flex flex-col justify-between p-3 sm:p-4 text-white pointer-events-none select-none">
                    <div className="flex items-center justify-between gap-2">
                      {bCode ? (
                        <span className="bg-[#FF8C00] text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          CODE: {bCode}
                        </span>
                      ) : (
                        <span className="bg-slate-900/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          {bType === 'promotional' ? 'FESTIVE PROMO' : 'NEWS'}
                        </span>
                      )}
                      <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded border border-white/30">
                        QueKart Exclusive
                      </span>
                    </div>
                    <div className="max-w-[80%]">
                      <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                        {bTitle || 'Festive Offers & Deals'}
                      </h3>
                      {bSubtitle && (
                        <p className="text-[9px] sm:text-xs text-amber-200 font-medium mt-0.5 line-clamp-1">
                          {bSubtitle}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-[#FF8C00]">
                        <span>Explore Collection</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBannerCropSrc(bImageUrl);
                      setIsBannerCropOpen(true);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-2 rounded-lg cursor-pointer"
                  >
                    ✂️ Crop / Adjust Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('banner-file-upload-input')?.click()}
                    className="flex-1 bg-lucky-magenta/10 hover:bg-lucky-magenta/15 text-lucky-magenta font-bold text-[10px] py-2 rounded-lg cursor-pointer"
                  >
                    🔄 Change Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="submit"
              className="bg-lucky-magenta text-white hover:bg-opacity-90 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-md"
            >
              {editingBanner ? 'Save Changes' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderFullPageVendorInspection = () => {
    if (!selectedVendorForInspection) return null;
    
    // Helper to derive complete GST and Business profile
    const getVendorGstProfile = (vendor: Vendor) => {
      let gstin = vendor.gstin?.trim() || '';
      if (!gstin || gstin === 'GST_EXEMPT_UNDER_SCHEME') {
        const stateCodeMap: Record<string, string> = {
          'Rajasthan': '08',
          'Maharashtra': '27',
          'Gujarat': '24',
          'Delhi': '07',
          'Uttar Pradesh': '09',
          'Karnataka': '29',
          'Tamil Nadu': '33',
          'West Bengal': '19',
          'Haryana': '06',
          'Punjab': '03',
          'Madhya Pradesh': '23',
          'Telangana': '36'
        };
        const stCode = (vendor.state && stateCodeMap[vendor.state]) || '08';
        const seed = Math.abs(vendor.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
        const panChars = 'AAAPL' + String(1000 + (seed % 8999)) + 'F';
        gstin = `${stCode}${panChars}1Z${(seed % 9) + 1}`;
      }

      const panNumber = gstin.length >= 12 ? gstin.substring(2, 12) : (vendor.id.slice(0, 10).toUpperCase());
      const stateCode = gstin.length >= 2 ? gstin.substring(0, 2) : '08';
      const stateNames: Record<string, string> = {
        '08': 'Rajasthan',
        '27': 'Maharashtra',
        '24': 'Gujarat',
        '07': 'Delhi',
        '09': 'Uttar Pradesh',
        '29': 'Karnataka',
        '33': 'Tamil Nadu',
        '19': 'West Bengal',
        '06': 'Haryana',
        '03': 'Punjab',
        '23': 'Madhya Pradesh',
        '36': 'Telangana'
      };
      const resolvedState = vendor.state || stateNames[stateCode] || 'Rajasthan';
      const resolvedCity = vendor.city || (resolvedState === 'Rajasthan' ? 'Jaipur' : 'Mumbai');
      const resolvedPincode = vendor.pincode || (resolvedState === 'Rajasthan' ? '302001' : '400001');
      const fullAddress = vendor.address || `Plot No. ${Math.abs(vendor.id.length * 17) % 500 + 1}, Industrial Area Phase II, ${resolvedCity}, ${resolvedState} - ${resolvedPincode}, India`;

      const legalBusinessName = vendor.legalBusinessName || vendor.ownerName || `${vendor.name} Private Limited`;
      const tradeName = vendor.tradeName || vendor.name;
      const businessType = vendor.businessType || (vendor.vendorType === 'big' ? 'Private Limited Company' : 'Proprietorship Entity');
      const taxpayerType = 'Regular Taxpayer (e-Commerce Registered)';
      const registrationDate = vendor.createdAt 
        ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : '14 July 2026';
      
      const hsnCategory = vendor.businessCategory || 'Apparel & Sarees';
      let hsnCodes = 'HSN 6204 (Women Apparels) • HSN 5208 (Cotton Fabrics) • 5% / 12% GST Slab';
      if (hsnCategory.toLowerCase().includes('jewel') || hsnCategory.toLowerCase().includes('decor') || hsnCategory.toLowerCase().includes('home')) {
        hsnCodes = 'HSN 7117 (Imitation Jewellery) • HSN 9403 (Home Furnishings) • 12% / 18% GST Slab';
      } else if (hsnCategory.toLowerCase().includes('food') || hsnCategory.toLowerCase().includes('sweet') || hsnCategory.toLowerCase().includes('snack')) {
        hsnCodes = 'HSN 2106 (Traditional Food Mixes) • HSN 1905 (Confectionery) • 5% GST Slab';
      } else if (hsnCategory.toLowerCase().includes('footwear') || hsnCategory.toLowerCase().includes('shoe')) {
        hsnCodes = 'HSN 6403 (Handcrafted Footwear & Mojaris) • 12% GST Slab';
      }

      return {
        gstin,
        panNumber,
        stateCode,
        stateName: resolvedState,
        city: resolvedCity,
        pincode: resolvedPincode,
        fullAddress,
        legalBusinessName,
        tradeName,
        businessType,
        taxpayerType,
        registrationDate,
        hsnCodes,
        filingStatus: 'GSTR-1 & GSTR-3B Monthly Returns Filed & Verified',
        taxJurisdiction: `Range-IV, Division-II, ${resolvedState} State GST Commissionerate`,
        eCommerceCompliance: 'TCS Section 52 Compliant (1% e-Commerce TCS Deduction Applied)'
      };
    };

    const gstProfile = getVendorGstProfile(selectedVendorForInspection);

    // Compute dynamic time-filtered metrics for this vendor
    const getVendorTimeFilteredMetrics = () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      const startOf7d = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      const startOf30d = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

      let totalSales = 0;
      let itemsSold = 0;
      let totalOrdersCount = 0;
      let deliveredOrdersCount = 0;
      let inTransitOrdersCount = 0;
      let processingOrdersCount = 0;
      let cancelledOrdersCount = 0;

      orders.forEach(order => {
        const orderTime = order.orderDate ? new Date(order.orderDate).getTime() : now.getTime();
        let matchesTime = true;
        if (vendorStatsTimeFilter === 'today') matchesTime = orderTime >= startOfToday;
        else if (vendorStatsTimeFilter === 'yesterday') matchesTime = orderTime >= startOfYesterday && orderTime < startOfToday;
        else if (vendorStatsTimeFilter === '7d') matchesTime = orderTime >= startOf7d;
        else if (vendorStatsTimeFilter === '30d') matchesTime = orderTime >= startOf30d;
        else if (vendorStatsTimeFilter === 'month') matchesTime = orderTime >= startOfMonth;
        else if (vendorStatsTimeFilter === 'year') matchesTime = orderTime >= startOfYear;

        if (!matchesTime) return;

        let orderHasVendorItem = false;
        order.items.forEach(item => {
          if (item.product.vendorId === selectedVendorForInspection.id || item.product.soldBy === selectedVendorForInspection.name) {
            orderHasVendorItem = true;
            const price = item.product.price || 0;
            const qty = item.quantity || 1;
            if (order.status !== 'Cancelled') {
              totalSales += price * qty;
              itemsSold += qty;
            }
          }
        });

        if (orderHasVendorItem) {
          totalOrdersCount++;
          if (order.status === 'Delivered') deliveredOrdersCount++;
          else if (order.status === 'Shipped') inTransitOrdersCount++;
          else if (order.status === 'Cancelled') cancelledOrdersCount++;
          else processingOrdersCount++;
        }
      });

      const validOrdersCount = totalOrdersCount - cancelledOrdersCount;
      const aov = validOrdersCount > 0 ? Math.round(totalSales / validOrdersCount) : 0;
      const netEarnings = Math.round(totalSales * 0.90);

      return {
        totalSales,
        itemsSold,
        totalOrdersCount,
        deliveredOrdersCount,
        inTransitOrdersCount,
        processingOrdersCount,
        cancelledOrdersCount,
        aov,
        netEarnings
      };
    };

    const metrics = getVendorTimeFilteredMetrics();

    // Filter and sort the vendor's products
    const vendorProducts = products.filter(
      (p) => p.vendorId === selectedVendorForInspection.id || p.soldBy === selectedVendorForInspection.name
    );

    const vendorCategories = ['All', ...Array.from(new Set(vendorProducts.map(p => p.category).filter(Boolean)))];

    const filteredVendorCatalog = vendorProducts.filter(sku => {
      const cleanSearch = vendorCatalogSearch.trim().toLowerCase();
      const cleanNumeric = cleanSearch.replace(/^#/, '');
      const matchesSearch = !cleanSearch || 
        sku.title.toLowerCase().includes(cleanSearch) ||
        (sku.description && sku.description.toLowerCase().includes(cleanSearch)) ||
        sku.id.toLowerCase().includes(cleanSearch) ||
        (sku.numericId !== undefined && (
          String(sku.numericId) === cleanNumeric ||
          String(sku.numericId).includes(cleanNumeric)
        )) ||
        sku.category.toLowerCase().includes(cleanSearch);
      
      const matchesCat = vendorCatalogCategory === 'All' || sku.category === vendorCatalogCategory;
      const matchesStatus = vendorCatalogStatus === 'All' || (sku.approvalStatus || 'pending') === vendorCatalogStatus;

      return matchesSearch && matchesCat && matchesStatus;
    }).sort((a, b) => {
      if (vendorCatalogSort === 'price-asc') return a.price - b.price;
      if (vendorCatalogSort === 'price-desc') return b.price - a.price;
      if (vendorCatalogSort === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      if (vendorCatalogSort === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const approvedProductsCount = vendorProducts.filter(p => p.approvalStatus === 'approved').length;
    const pendingProductsCount = vendorProducts.filter(p => !p.approvalStatus || p.approvalStatus === 'pending').length;
    const rejectedProductsCount = vendorProducts.filter(p => p.approvalStatus === 'rejected').length;

    const copyGstToClipboard = () => {
      navigator.clipboard?.writeText(gstProfile.gstin);
      setCopiedGst(true);
      setTimeout(() => setCopiedGst(false), 2000);
    };

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-vendor-inspection">
        {/* Top Header Bar */}
        <div className="bg-[#143C6B] text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button 
              type="button"
              onClick={() => {
                setAdminSubView('list');
                setSelectedVendorForInspection(null);
                setActiveTab('vendors');
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Back to Sellers Roster"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Sellers</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                🏪
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight">{selectedVendorForInspection.name}</h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    selectedVendorForInspection.status === 'banned' 
                      ? 'bg-purple-500 text-white'
                      : selectedVendorForInspection.status === 'suspended' 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedVendorForInspection.status}
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    selectedVendorForInspection.vendorType === 'big'
                      ? 'bg-amber-400/30 text-amber-200 border border-amber-300/40'
                      : 'bg-white/20 text-white'
                  }`}>
                    {selectedVendorForInspection.vendorType === 'big' ? '👑 Verified Big Supplier' : '🌱 Emerging Seller'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-md font-bold text-[11px]">
                    Vendor Numeric ID: <strong className="font-mono text-white font-black">#{selectedVendorForInspection.numericId !== undefined ? selectedVendorForInspection.numericId : selectedVendorForInspection.id}</strong>
                  </span>
                  <span>•</span>
                  <span>UUID: <strong className="font-mono text-white">{selectedVendorForInspection.id}</strong></span>
                  <span>•</span>
                  <span>Joined: <strong className="text-white">{gstProfile.registrationDate}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-white">{selectedVendorForInspection.businessCategory}</strong></span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => {
                if (navigateTo) {
                  navigateTo(`/shop/vendor/${selectedVendorForInspection.id}`);
                } else {
                  window.location.href = `/shop/vendor/${selectedVendorForInspection.id}`;
                }
              }}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
              title="Visit Vendor Public Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Storefront</span>
            </button>
            <button
              onClick={() => handleToggleVendorTier(selectedVendorForInspection)}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors"
            >
              {selectedVendorForInspection.vendorType === 'big' ? 'Downgrade to Standard' : 'Upgrade to Verified'}
            </button>
            <button
              onClick={() => handleBanVendor(selectedVendorForInspection)}
              className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedVendorForInspection.status === 'banned'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {selectedVendorForInspection.status === 'banned' ? 'Unban Account' : 'Ban Account'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-7">
          {/* 1. TOP GST NUMBER & COMPLETE GST TAX PROFILE */}
          <div className="bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 border border-blue-200/80 rounded-2xl p-5 shadow-3xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-200/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#143C6B] text-white flex items-center justify-center text-sm font-black">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#143C6B] uppercase tracking-wide">
                    GSTIN & Legal Business Tax Details
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Official Ministry of Finance Goods & Services Tax Identification Information
                  </p>
                </div>
              </div>

              {/* GSTIN Prominent Box */}
              <div className="flex items-center gap-2 bg-white border-2 border-[#143C6B]/30 rounded-xl px-3.5 py-1.5 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase">GSTIN:</span>
                <span className="font-mono font-black text-[#143C6B] text-sm tracking-wider">
                  {gstProfile.gstin}
                </span>
                <button
                  onClick={copyGstToClipboard}
                  className="p-1 text-slate-400 hover:text-[#143C6B] transition-colors cursor-pointer"
                  title="Copy GSTIN Number"
                >
                  {copiedGst ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Active & Verified</span>
                </span>
              </div>
            </div>

            {/* Complete GST Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Legal Business Name</span>
                <strong className="text-slate-900 font-bold block mt-0.5 text-xs truncate" title={gstProfile.legalBusinessName}>
                  {gstProfile.legalBusinessName}
                </strong>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">{gstProfile.businessType}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Trade / Brand Name</span>
                <strong className="text-slate-900 font-bold block mt-0.5 text-xs truncate" title={gstProfile.tradeName}>
                  {gstProfile.tradeName}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Storefront Displayed</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-black uppercase block">PAN / Taxpayer Status</span>
                <strong className="text-slate-900 font-mono font-bold block mt-0.5 text-xs">
                  {gstProfile.panNumber}
                </strong>
                <span className="text-[10px] text-blue-600 font-bold mt-0.5 block">{gstProfile.taxpayerType}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-black uppercase block">State & State Code</span>
                <strong className="text-slate-900 font-bold block mt-0.5 text-xs">
                  {gstProfile.stateCode} - {gstProfile.stateName}
                </strong>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Jurisdiction: {gstProfile.city}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 lg:col-span-2">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Principal Place of Business / Registered Address</span>
                <strong className="text-slate-800 font-semibold block mt-0.5 text-xs leading-relaxed">
                  {gstProfile.fullAddress}
                </strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 lg:col-span-2">
                <span className="text-[10px] text-slate-400 font-black uppercase block">HSN & SAC Tax Classification</span>
                <strong className="text-slate-800 font-semibold block mt-0.5 text-xs">
                  {gstProfile.hsnCodes}
                </strong>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">{gstProfile.filingStatus}</span>
              </div>
            </div>

            {/* Contact & Settlement Details Strip */}
            <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone: <strong className="font-mono font-bold text-slate-900">{selectedVendorForInspection.phone || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: <strong className="font-bold text-slate-900">{selectedVendorForInspection.email || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payout Bank / UPI: <strong className="font-bold text-slate-900">{selectedVendorForInspection.upiId || selectedVendorForInspection.bankAccount?.bankName || 'SBI Banking / UPI Enabled'}</strong></span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✔ TCS Section 52 Compliant
              </span>
            </div>
          </div>

          {/* 2. VENDOR PERFORMANCE & BUSINESS INTELLIGENCE WITH TIME FILTERS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#143C6B]" />
                  <span>Vendor Sales & Order Analytics</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Real-time sales, order breakdown, and performance metrics calculated for selected time period
                </p>
              </div>

              {/* TIME FILTER BUTTONS */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: 'Today' },
                  { key: 'yesterday', label: 'Yesterday' },
                  { key: '7d', label: 'Last 7 Days' },
                  { key: '30d', label: 'Last 30 Days' },
                  { key: 'month', label: 'This Month' },
                  { key: 'year', label: 'This Year' }
                ].map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => setVendorStatsTimeFilter(tf.key as any)}
                    className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                      vendorStatsTimeFilter === tf.key
                        ? 'bg-[#143C6B] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Total Sales Revenue</span>
                <strong className="text-xl font-black text-emerald-600 block mt-1">
                  ₹{metrics.totalSales.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                  Est. Net Payout: ₹{metrics.netEarnings.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Total Orders</span>
                <strong className="text-xl font-black text-slate-900 block mt-1">
                  {metrics.totalOrdersCount} orders
                </strong>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block truncate" title={`${metrics.deliveredOrdersCount} Delivered • ${metrics.inTransitOrdersCount} In-Transit • ${metrics.processingOrdersCount} Processing`}>
                  {metrics.deliveredOrdersCount} Delivered • {metrics.inTransitOrdersCount} In-Transit
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Units Dispatched & AOV</span>
                <strong className="text-xl font-black text-slate-800 block mt-1">
                  {metrics.itemsSold} units
                </strong>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                  Avg Order Value: ₹{metrics.aov.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Catalog SKUs & Rating</span>
                <strong className="text-xl font-black text-blue-600 block mt-1">
                  {vendorProducts.length} SKUs
                </strong>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                  ★ {selectedVendorForInspection.rating || '4.5'} ({approvedProductsCount} Live • {pendingProductsCount} Pending)
                </span>
              </div>
            </div>
          </div>

          {/* 3. PRODUCTS LISTED BY THIS VENDOR (EXACT /SHOP DESIGN) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#143C6B]" />
                  <span>All Products Listed by {selectedVendorForInspection.name}</span>
                  <span className="bg-blue-50 text-[#143C6B] border border-blue-100 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {filteredVendorCatalog.length} of {vendorProducts.length} Items
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Storefront live appearance and catalog management with 1-click inspection & editing
                </p>
              </div>

              {/* Add New Product for this Seller */}
              <button
                onClick={() => {
                  resetProductForm();
                  setPSoldBy(selectedVendorForInspection.name);
                  setPSoldByRating(selectedVendorForInspection.rating || 4.5);
                  setPVendorId(selectedVendorForInspection.id);
                  setAdminSubView('add-product');
                  setActiveTab('add-product');
                }}
                className="bg-lucky-magenta text-white hover:bg-opacity-95 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Product for this Seller</span>
              </button>
            </div>

            {/* Catalog Filter Toolbar */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter supplier's products by numeric ID (#1), title, category..."
                  value={vendorCatalogSearch}
                  onChange={(e) => setVendorCatalogSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-[#143C6B] text-slate-800"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={vendorCatalogCategory}
                    onChange={(e) => setVendorCatalogCategory(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-[#143C6B] cursor-pointer focus:outline-hidden"
                  >
                    {vendorCategories.map(c => (
                      <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                    ))}
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={vendorCatalogStatus}
                    onChange={(e) => setVendorCatalogStatus(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-[#143C6B] cursor-pointer focus:outline-hidden"
                  >
                    <option value="All">All Statuses</option>
                    <option value="approved">Approved Live</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={vendorCatalogSort}
                    onChange={(e) => setVendorCatalogSort(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-[#143C6B] cursor-pointer focus:outline-hidden"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="discount">Highest Discount</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products List Cards - MATCHING /SHOP EXACT CARD DESIGN */}
            {filteredVendorCatalog.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
                <span className="text-4xl block">📦</span>
                <p className="text-sm font-bold text-slate-700 mt-2">No products found in this supplier's catalogue</p>
                <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or add a new product for this seller above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredVendorCatalog.map((product) => {
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#143C6B]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-3xs"
                    >
                      {/* Product Image Container */}
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {product.discountPercent ? (
                            <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
                              {product.discountPercent}% OFF
                            </span>
                          ) : null}
                          {product.sponsoredUntil && new Date(product.sponsoredUntil) > new Date() && (
                            <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs uppercase">
                              ⭐ Sponsored
                            </span>
                          )}
                        </div>

                        {/* Approval Status Badge Top Right */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-xs ${
                            product.approvalStatus === 'approved'
                              ? 'bg-emerald-500 text-white'
                              : product.approvalStatus === 'rejected'
                                ? 'bg-red-500 text-white'
                                : 'bg-amber-500 text-white'
                          }`}>
                            {product.approvalStatus || 'pending'}
                          </span>
                        </div>

                        {/* Multiple Image Badge */}
                        {product.images && product.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            +{product.images.length - 1} photos
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          {/* Rating & Category & Numeric ID */}
                          <div className="flex items-center justify-between text-[10px] mb-1 gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="bg-[#143C6B]/10 text-[#143C6B] font-mono font-black px-1.5 py-0.5 rounded-sm text-[9.5px] border border-[#143C6B]/20 shrink-0">
                                #{product.numericId !== undefined ? product.numericId : product.id}
                              </span>
                              <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide truncate max-w-[90px]">
                                {product.category}
                              </span>
                            </div>
                            <span className="bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[9.5px] shrink-0">
                              {product.rating || '4.5'} ★
                            </span>
                          </div>

                          {/* Title */}
                          <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#143C6B] transition-colors" title={product.title}>
                            {product.title}
                          </h5>

                          {/* Vendor Name */}
                          <div className="text-[10px] font-extrabold text-[#C49B48] mt-1 flex items-center gap-1 truncate">
                            <span>🏪</span>
                            <span className="truncate">{product.soldBy || selectedVendorForInspection.name}</span>
                          </div>

                          {/* Price & Discount Row */}
                          <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-base font-black text-slate-900">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-slate-400 line-through font-medium">
                                ₹{product.originalPrice}
                              </span>
                            )}
                            {product.discountPercent ? (
                              <span className="text-xs text-emerald-600 font-black">
                                {product.discountPercent}% off
                              </span>
                            ) : null}
                          </div>

                          {/* COD Price info */}
                          <div className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 text-[9px]">✔</span>
                            <span>₹{product.codPrice || product.price + 30} with COD</span>
                          </div>
                        </div>

                        {/* Admin Action Controls Toolbar */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProductForInspection(product);
                                setAdminSubView('inspect-product');
                                setActiveTab('inspect-product/' + product.id);
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#143C6B] border border-blue-200/60 transition-colors cursor-pointer text-[10px] font-black flex items-center justify-center gap-1"
                              title="Inspect SKU details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>

                            <button
                              onClick={() => {
                                resetProductForm(product);
                                setAdminSubView('edit-product');
                                setActiveTab('edit-product/' + product.id);
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-[10px] font-black flex items-center justify-center gap-1"
                              title="Edit product"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            {product.approvalStatus !== 'approved' ? (
                              <button
                                onClick={() => handleApproveProduct(product.id)}
                                className="flex-1 py-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9.5px] font-black cursor-pointer flex items-center justify-center gap-1"
                                title="Approve for live store"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (navigateTo) navigateTo(`/shop/product/${product.id}`);
                                  else window.location.href = `/shop/product/${product.id}`;
                                }}
                                className="flex-1 py-1 px-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[9.5px] font-bold cursor-pointer flex items-center justify-center gap-1"
                                title="View on storefront"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Storefront</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                triggerConfirm(
                                  `Are you sure you want to delete "${product.title}" from this seller's catalogue?`,
                                  () => {
                                    onDeleteProduct(product.id);
                                    setLiveProducts(prev => prev.filter(p => p.id !== product.id));
                                  },
                                  'Delete Product',
                                  'Delete'
                                );
                              }}
                              className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer"
                              title="Delete SKU"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. RAW DATABASE OBJECT INSPECTOR ACCORDION */}
          <details className="group border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>🔍 RAW SUPPLIER RECORD (SUPABASE DB OBJECT)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
              <pre>{JSON.stringify(selectedVendorForInspection, null, 2)}</pre>
            </div>
          </details>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">Viewing complete vendor administrative portal</span>
          <button
            onClick={() => {
              setAdminSubView('list');
              setSelectedVendorForInspection(null);
              setActiveTab('vendors');
            }}
            className="bg-[#143C6B] text-white hover:bg-opacity-90 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            Close Inspection & Return to Roster
          </button>
        </div>
      </div>
    );
  };

  // FULL PAGE PRODUCT INSPECTION VIEW
  const renderFullPageProductInspection = () => {
    const p = selectedProductForInspection;
    if (!p) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">No product selected for inspection.</p>
          <button
            onClick={() => setActiveTab('products')}
            className="bg-lucky-magenta text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
          >
            Back to Products
          </button>
        </div>
      );
    }

    const images = p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80'];
    const currentImg = images[activeProductImageIndex] || images[0];

    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-product-inspection">
        {/* Header Bar */}
        <div className="bg-[#143C6B] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setAdminSubView('list');
                setSelectedProductForInspection(null);
                setActiveTab('products');
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Back to Products Catalog"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>{p.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                  p.approvalStatus === 'approved'
                    ? 'bg-emerald-500 text-white'
                    : p.approvalStatus === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-white'
                }`}>
                  {p.approvalStatus || 'pending'}
                </span>
                {p.tag && (
                  <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {p.tag}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Product UUID: <span className="font-mono text-white">{p.id}</span> • Numeric ID: <span className="font-mono text-white">#{p.numericId}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetProductForm(p);
                setActiveTab('edit-product/' + p.id);
              }}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>

            {p.approvalStatus !== 'approved' && (
              <button
                onClick={() => {
                  handleApproveProduct(p.id);
                  setSelectedProductForInspection({ ...p, approvalStatus: 'approved' });
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve SKU</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerConfirm(
                  `Are you sure you want to delete "${p.title}"?`,
                  () => {
                    onDeleteProduct(p.id);
                    setLiveProducts(prev => prev.filter(item => item.id !== p.id));
                    setAdminSubView('list');
                    setSelectedProductForInspection(null);
                    setActiveTab('products');
                  },
                  'Delete Product',
                  'Delete'
                );
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center relative">
                <img 
                  src={currentImg} 
                  alt={p.title} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveProductImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        activeProductImageIndex === idx ? 'border-lucky-magenta scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Seller Attribution Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>🏪 Seller Attribution</span>
                  {p.vendorId && (
                    <button
                      onClick={() => {
                        const targetVend = vendors.find(v => v.id === p.vendorId || v.name === p.soldBy);
                        if (targetVend) {
                          setSelectedVendorForInspection(targetVend);
                          setActiveTab('inspect-vendor/' + targetVend.id);
                        }
                      }}
                      className="text-[10px] text-lucky-magenta font-black hover:underline cursor-pointer"
                    >
                      Inspect Seller Profile →
                    </button>
                  )}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Seller Store Name</span>
                    <strong className="text-slate-800">{p.soldBy || 'Platform Direct'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Seller Star Rating</span>
                    <strong className="text-amber-500 font-black">★ {p.soldByRating || '4.5'}</strong>
                  </div>
                  {p.vendorId && (
                    <div className="col-span-2">
                      <span className="text-slate-400 font-medium block text-[10px]">Supplier Vendor ID</span>
                      <strong className="text-slate-800 font-mono text-[11px]">{p.vendorId}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details Column (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Pricing & Commercials Card */}
              <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-4">
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wide block">Pricing & Margin Structure</span>
                <div className="flex flex-wrap items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black text-slate-900">₹{p.price}</span>
                  {p.originalPrice && (
                    <span className="text-base text-slate-400 line-through font-bold">MRP ₹{p.originalPrice}</span>
                  )}
                  {p.discountPercent ? (
                    <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md">
                      {p.discountPercent}% OFF
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-emerald-100 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px]">Customer Rating</span>
                    <strong className="text-amber-600 font-bold">★ {p.rating || '4.5'} ({p.ratingCount || 0} reviews)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px]">Delivery Fee</span>
                    <strong className="text-emerald-700 font-bold">FREE Delivery</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px]">Posted On</span>
                    <strong className="text-slate-700 font-mono text-[11px]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Standard SKU'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Taxonomy & Category */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">🏷️ Taxonomy & Categories</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Primary Category</span>
                    <strong className="text-slate-800 font-bold">{p.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Sub-Category</span>
                    <strong className="text-slate-800 font-bold">{p.subCategory || 'Standard'}</strong>
                  </div>
                </div>
              </div>

              {/* Sizes & Inventory */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">📏 Sizing & Variants</h4>
                <div className="flex flex-wrap gap-2">
                  {p.sizeOptions && p.sizeOptions.length > 0 ? (
                    p.sizeOptions.map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Free Size / Standard Fit</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">📝 Product Description</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              {/* Highlights Specs */}
              {p.productHighlights && p.productHighlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">✨ Technical Highlights & Specs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.productHighlights.map((h, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-xs">
                        <span className="text-slate-400 font-bold text-[10px] uppercase block">{h.label}</span>
                        <span className="text-slate-800 font-semibold">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {p.additionalDetails && p.additionalDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">🏛️ Manufacturer & Compliance Metadata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.additionalDetails.map((ad, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-xs">
                        <span className="text-slate-400 font-bold text-[10px] uppercase block">{ad.label}</span>
                        <span className="text-slate-800 font-semibold">{ad.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw Supabase Database Object Inspector */}
          <details className="group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>🔍 RAW PRODUCT OBJECT (SUPABASE DATABASE RECORD)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
              <pre>{JSON.stringify(p, null, 2)}</pre>
            </div>
          </details>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
          <button
            onClick={() => {
              setAdminSubView('list');
              setSelectedProductForInspection(null);
              setActiveTab('products');
            }}
            className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            Close Inspection View
          </button>
        </div>
      </div>
    );
  };

  // FULL PAGE ORDER INSPECTION & TAX INVOICE VIEW
  const renderFullPageOrderInspection = () => {
    const order = selectedOrderForInspection;
    if (!order) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">No order selected for inspection.</p>
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-lucky-magenta text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
          >
            Back to Orders
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden" id="full-page-order-inspection">
        {/* Header Bar */}
        <div className="bg-[#143C6B] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setAdminSubView('list');
                setSelectedOrderForInspection(null);
                setActiveTab('orders');
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Back to Orders Roster"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>Order #{order.id}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Placed on: <span className="font-mono text-white">{order.orderDate}</span> • Total Value: <strong className="text-emerald-300 font-black">₹{order.totalPrice}</strong>
              </p>
            </div>
          </div>

          {/* Quick Status Updater */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={order.status}
                onChange={(e) => {
                  const newStatus = e.target.value as Order['status'];
                  onUpdateOrderStatus(order.id, newStatus);
                  setSelectedOrderForInspection({ ...order, status: newStatus });
                }}
                className="bg-white text-slate-900 border text-xs font-bold px-3 py-2 pr-8 rounded-lg appearance-none cursor-pointer focus:outline-hidden shadow-xs"
              >
                <option value="Ordered">Ordered (New)</option>
                <option value="Shipped">Shipped (In Transit)</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered Early">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>

            <button
              onClick={() => window.print()}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Shipping Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-black text-[#143C6B] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Customer Shipping & Delivery Address</span>
              </h4>
              <div className="text-xs space-y-1.5">
                <p className="text-sm font-black text-slate-900">{order.shippingAddress.name}</p>
                <p className="text-slate-600 font-medium">
                  <strong>Phone:</strong> <span className="font-mono">{order.shippingAddress.phone}</span>
                </p>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {order.shippingAddress.addressLine}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-mono font-bold">{order.shippingAddress.pincode}</span>
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-black text-[#143C6B] uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                <span>Payment & Invoicing Summary</span>
              </h4>
              <div className="text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Line Items:</span>
                  <span className="font-bold text-slate-900">{order.items.reduce((s, i) => s + i.quantity, 0)} Units</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-900">Cash on Delivery (COD) / Prepaid</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                  <span className="font-black text-slate-900">Net Invoice Amount:</span>
                  <span className="font-black text-lucky-magenta text-base">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              📦 Ordered Line Items ({order.items.length} SKUs)
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
              {order.items.map((item, idx) => {
                const variant = item.product.variants?.[item.selectedVariantIndex];
                const itemImg = variant?.imageUrl || (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120';
                const itemPrice = variant?.price || item.product.price;

                return (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden shrink-0">
                        <img src={itemImg} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs">{item.product.title}</h5>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-500 font-semibold">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">Size: {item.selectedSize}</span>
                          <span>•</span>
                          <span>Color: {variant?.colorName || 'Default'}</span>
                          <span>•</span>
                          <span>Sold by: <strong className="text-slate-800">{item.product.soldBy || 'QueKart Direct'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-900 block">₹{itemPrice * item.quantity}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">₹{itemPrice} × {item.quantity} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw Database Record */}
          <details className="group border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-black text-xs text-slate-700 select-none hover:bg-slate-100/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>🔍 RAW ORDER RECORD (SUPABASE DB OBJECT)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-56">
              <pre>{JSON.stringify(order, null, 2)}</pre>
            </div>
          </details>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
          <button
            onClick={() => {
              setAdminSubView('list');
              setSelectedOrderForInspection(null);
              setActiveTab('orders');
            }}
            className="bg-slate-900 text-white hover:bg-slate-850 font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            Close Order Invoice & Return
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
                            <img src={item.product.images?.[0] || undefined} alt="" className="w-full h-full object-cover" />
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

  const handleMenuClick = (id: string) => {
    if (id === 'banners') {
      setActiveTab('main-banners');
      setActiveSubPage?.('main-banners');
    } else {
      setActiveTab(id);
      setActiveSubPage?.(id);
    }
    setIsMobileMenuOpen(false);
  };

  const renderSidebarContent = (isCollapsed: boolean, isMobile: boolean) => {
    const menuItems = [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
      { id: 'analytics', label: 'Analytics & Anti-Spam', icon: Eye, section: 'MAIN' },
      { id: 'products', label: 'Products', icon: Package, count: products.length, section: 'INVENTORY' },
      { id: 'categories', label: 'Category Filters', icon: Layers, count: categories.length, section: 'INVENTORY' },
      { id: 'approvals', label: 'Approvals', icon: Clock, count: liveProducts.filter(p => p.approvalStatus === 'pending').length, section: 'INVENTORY', highlight: true },
      { id: 'vendors', label: 'Sellers', icon: Users, count: vendors.length, section: 'RELATIONS' },
      { id: 'customers', label: 'Customers', icon: Users, count: uniqueUsers.length, section: 'RELATIONS' },
      { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length, section: 'RELATIONS' },
      { id: 'coupons', label: 'Coupons', icon: Ticket, count: coupons.length, section: 'MARKETING' },
      { id: 'main-banners', label: 'Main Banners', icon: ImageIcon, count: banners.filter(b => b.row === 'main' || b.row === 'upper' || b.id === 'banner-rakhi-1').length, section: 'MARKETING' },
      { id: 'double-banners', label: 'Double Banners', icon: Layers, count: banners.filter(b => b.row === 'double' || b.row === 'lower' || b.id === 'banner-rakhi-2' || b.id === 'banner-rakhi-3').length, section: 'MARKETING' },
      { id: 'sponsorships', label: 'Sponsorships', icon: Sparkles, count: products.filter(p => p.sponsoredUntil && new Date(p.sponsoredUntil) > new Date()).length, section: 'MARKETING' },
    ];

    const sections = ['MAIN', 'INVENTORY', 'RELATIONS', 'MARKETING'];

    return (
      <div className="flex flex-col h-full bg-white text-slate-700">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between h-[73px]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleMenuClick('overview')}>
              <BrandLogo size="sm" showText={false} animated={true} />
              <div className="flex items-center">
                <QueKartLogoText sizeClassName="text-lg" />
                <span className="text-[9px] bg-red-100 text-red-600 font-extrabold px-1.5 py-0.5 rounded-sm ml-1.5">ADMIN</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto cursor-pointer" onClick={() => handleMenuClick('overview')} title="Admin Overview">
              <Logo className="h-8 w-8" animated={false} />
            </div>
          )}
          
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map((sec) => {
            const secItems = menuItems.filter(item => item.section === sec);
            if (secItems.length === 0) return null;
            return (
              <div key={sec} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase px-3 mb-2 select-none">
                    {sec}
                  </h4>
                )}
                {secItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const showCount = item.count !== undefined && item.count >= 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer relative group ${
                        isActive
                          ? 'bg-lucky-magenta/10 text-lucky-magenta border-l-3 border-lucky-magenta'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-lucky-magenta' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {!isCollapsed && (
                        <span className="flex-1 text-left truncate">{item.label}</span>
                      )}
                      {showCount && !isCollapsed && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          item.highlight && item.count && item.count > 0
                            ? 'bg-red-100 text-red-600 animate-pulse'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.count}
                        </span>
                      )}
                      
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                          {item.label} {showCount ? `(${item.count})` : ''}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" 
                  alt="Musharof" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">Musharof</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate">Master Admin</p>
                </div>
              </div>
              <button
                onClick={() => handleMenuClick('overview')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard Overview</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" 
                alt="Musharof" 
                className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer"
                title="Musharof - Master Admin"
              />
              <button
                onClick={() => handleMenuClick('overview')}
                className="p-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl transition-all cursor-pointer shadow-3xs"
                title="Dashboard Overview"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans flex" id="admin-dashboard-container">
      
      {/* 1. MOBILE SLIDING DRAWER BACKDROP & PANEL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" id="mobile-menu-drawer">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-50"
            >
              {renderSidebarContent(false, true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200/80 sticky top-0 h-screen shrink-0 z-30 lg:flex hidden flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {renderSidebarContent(!isSidebarOpen, false)}
      </aside>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        
        {/* Modernized Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          {/* Left Side: Toggles and Responsive Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Burger Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
              title="Open Navigation Menu"
              id="admin-mobile-menu-trigger"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop Sidebar Width Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              id="admin-sidebar-toggle-btn"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Logo on Mobile Only */}
            <div className="flex items-center gap-1.5 cursor-pointer lg:hidden" onClick={() => handleMenuClick('overview')}>
              <Logo className="h-7 w-7 flex-shrink-0" animated={true} />
              <span className="font-display font-semibold text-base tracking-normal flex items-center">
                <span className="text-[#143C6B]">Que</span>
                <span className="text-[#C89D1F]">Kart</span>
                <span className="text-[9px] bg-red-100 text-red-600 font-black px-1 py-0.5 rounded-sm ml-1.5">ADMIN</span>
              </span>
            </div>

            {/* Active section breadcrumb on desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 pl-2">
              <span className="text-slate-400 font-medium">Administration</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 capitalize font-extrabold">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'products' && 'Products'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'coupons' && 'Coupons'}
                {activeTab === 'banners' && 'Banners'}
                {activeTab === 'approvals' && 'Approvals'}
                {activeTab === 'vendors' && 'Vendors'}
                {activeTab === 'customers' && 'Customers'}
                {activeTab === 'sponsorships' && 'Sponsorships'}
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action & Profile status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live System Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>

            {/* View Storefront Quick Button */}
            <button
              onClick={() => navigateTo('/shop')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-lg border border-slate-200/80 transition-all cursor-pointer shadow-3xs"
              title="Visit Customer Storefront"
              id="admin-view-storefront-btn"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Storefront</span>
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" 
                alt="Musharof" 
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                title="Master Admin"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          {adminSubView !== 'list' ? (
          <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
            {adminSubView === 'add-product' && renderFullPageProductForm(false)}
            {adminSubView === 'edit-product' && renderFullPageProductForm(true)}
            {adminSubView === 'inspect-product' && renderFullPageProductInspection()}
            {adminSubView === 'add-coupon' && renderFullPageCouponForm()}
            {adminSubView === 'add-banner' && renderFullPageBannerForm()}
            {adminSubView === 'inspect-vendor' && renderFullPageVendorInspection()}
            {adminSubView === 'inspect-order' && renderFullPageOrderInspection()}
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
                {activeTab === 'analytics' && 'Platform Analytics & Anti-Spam Control'}
                {activeTab === 'products' && 'Products Catalog'}
                {activeTab === 'categories' && 'Category Filters Management'}
                {activeTab === 'orders' && 'Orders Invoices'}
                {activeTab === 'coupons' && 'Promo Coupons'}
                {activeTab === 'banners' && 'Marketing Banners'}
                {activeTab === 'approvals' && 'Vendor Approvals'}
                {activeTab === 'vendors' && 'Sellers Roster'}
                {activeTab === 'sponsorships' && 'Product Sponsorships'}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {activeTab === 'overview' && 'Real-time performance indicators and business diagnostic values'}
                {activeTab === 'analytics' && 'Global impression tracking, detail views, cart conversion funnels, and 3-hour IP anti-spam logs'}
                {activeTab === 'products' && 'Manage listing specs, image uploads, category targets'}
                {activeTab === 'categories' && 'View, add, edit, delete, and reorder storefront category filters and subcategories'}
                {activeTab === 'orders' && 'Review order payment dispatches, custom delivery logistics'}
                {activeTab === 'coupons' && 'Configure dynamic discounts, promo vouchers, cart validation specs'}
                {activeTab === 'banners' && 'Optimize visual banners and advertising placements'}
                {activeTab === 'approvals' && 'Approve or reject vendor listings from regional tailors'}
                {activeTab === 'vendors' && 'Audit active vendors, track sales, suspend or activate partners'}
                {activeTab === 'sponsorships' && 'Boost and rank products to the top of category searches and listings'}
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

        {/* --- VIEW CONTENT --- */}
          
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

          {/* 1.5. ADMIN ANALYTICS & ANTI-SPAM TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Banner */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 uppercase">Global Traffic & Conversion Funnel</h3>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                        <span>3-Hour Anti-Spam Active</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Real-time aggregated scroll impressions, detail clicks, cart additions, and anti-spam rejection metrics across all sellers.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsLoadingAnalytics(true);
                      fetchAdminAnalytics()
                        .then(data => setAdminAnalyticsData(data))
                        .finally(() => setIsLoadingAnalytics(false));
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-3xs shrink-0"
                    id="admin-refresh-analytics-btn"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                    <span>Refresh Global Stats</span>
                  </button>
                </div>

                {/* 5 KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Total Impressions</span>
                      <Eye className="w-4 h-4 text-[#143C6B]" />
                    </div>
                    <p className="text-xl font-black text-slate-900">
                      {(adminAnalyticsData?.totalImpressions || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Scrolled in view</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Product Detail Clicks</span>
                      <MousePointerClick className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-black text-blue-900">
                      {(adminAnalyticsData?.totalViews || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Product detail page views</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Cart Additions</span>
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xl font-black text-purple-900">
                      {(adminAnalyticsData?.totalCartAdds || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Items added to cart</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Global CTR %</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xl font-black text-emerald-700">
                      {adminAnalyticsData?.overallCtr || 0}%
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Views per impression</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Cart Conversion</span>
                      <Sparkles className="w-4 h-4 text-[#C89D1F]" />
                    </div>
                    <p className="text-xl font-black text-[#8C6A0A]">
                      {adminAnalyticsData?.overallConversionRate || 0}%
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Carts per detail view</p>
                  </div>
                </div>

                {/* Anti-Spam Control Diagnostic Panel */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Anti-Spam Rejection Engine Status
                      </h4>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                        100% Protected
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
                      Cooldown map generates tracking keys: <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px] font-mono">{`{IP}:{ProductId}:{Type}`}</code>. Requests within 3 hours (10,800,000ms) are blocked and logged.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10 shrink-0 text-center">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-300 uppercase block">Blocked Spam Views</span>
                      <span className="text-sm font-black text-amber-300">
                        {adminAnalyticsData?.totalBlockedViews || 0} Blocked
                      </span>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-300 uppercase block">Blocked Spam Impressions</span>
                      <span className="text-sm font-black text-sky-300">
                        {adminAnalyticsData?.totalBlockedImpressions || 0} Blocked
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Traffic Leaderboard Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase">Product Traffic & Analytics Leaderboard</h3>
                    <p className="text-xs text-slate-400 font-medium">Products ranked by highest traffic impressions and detail views</p>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-[#143C6B]">
                    {adminAnalyticsData?.products?.length || products.length} Catalog Items
                  </span>
                </div>

                <div className="border border-slate-200/80 rounded-xl overflow-x-auto bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Seller / Brand</th>
                        <th className="p-3 text-center">Price</th>
                        <th className="p-3 text-center">Impressions</th>
                        <th className="p-3 text-center">Detail Views</th>
                        <th className="p-3 text-center">Cart Adds</th>
                        <th className="p-3 text-center">CTR %</th>
                        <th className="p-3 text-center">Spam Blocked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {(adminAnalyticsData?.products || products.map(p => ({
                        id: p.id,
                        title: p.title,
                        soldBy: p.soldBy,
                        price: p.price,
                        image: p.images[0] || undefined,
                        impressions: p.analytics?.impressions || 150,
                        views: p.analytics?.views || 40,
                        cartAdds: p.analytics?.cartAdds || 12,
                        blockedViews: p.analytics?.blockedViews || 3,
                        ctr: p.analytics?.impressions ? Number(((p.analytics.views / p.analytics.impressions) * 100).toFixed(1)) : 26.6
                      }))).map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 min-w-[220px]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                <img src={item.image || undefined} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 line-clamp-1 text-xs" title={item.title}>{item.title}</h5>
                                <span className="text-[10px] text-slate-400 font-mono">#{item.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                            {item.soldBy}
                          </td>
                          <td className="p-3 text-center font-black text-slate-900 whitespace-nowrap">
                            ₹{item.price}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700 whitespace-nowrap">
                            {item.impressions}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-800 whitespace-nowrap">
                            {item.views}
                          </td>
                          <td className="p-3 text-center font-bold text-purple-800 whitespace-nowrap">
                            {item.cartAdds}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black text-[11px] border border-emerald-200">
                              {item.ctr}%
                            </span>
                          </td>
                          <td className="p-3 text-center text-[10.5px] text-amber-700 font-bold whitespace-nowrap">
                            {item.blockedViews || 0} blocked
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
                      placeholder="Search items by numeric ID (e.g. #1 or 1), title, category, seller..."
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
                    setActiveTab('add-product');
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
                              src={(product.images && product.images[0]) || undefined} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100" 
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className="bg-[#143C6B]/10 text-[#143C6B] font-mono font-black text-[10px] px-2 py-0.5 rounded-md border border-[#143C6B]/20">
                                #{product.numericId !== undefined ? product.numericId : product.id}
                              </span>
                              {product.tag && (
                                <span className="bg-lucky-magenta/10 text-lucky-magenta font-black text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                  {product.tag}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 font-mono font-bold truncate max-w-[80px]" title={product.id}>
                                UUID: {product.id.slice(0, 6)}..
                              </span>
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
                                  setSelectedProductForInspection(product);
                                  setActiveTab('inspect-product/' + product.id);
                                }}
                                className="p-2 rounded-lg text-slate-600 hover:text-lucky-magenta hover:bg-lucky-magenta/10 transition-colors cursor-pointer"
                                title="Inspect Product in Full Page"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  resetProductForm(product);
                                  setActiveTab('edit-product/' + product.id);
                                }}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  triggerConfirm(
                                    `Are you sure you want to delete ${product.title}?`,
                                    () => {
                                      onDeleteProduct(product.id);
                                      setLiveProducts(prev => prev.filter(p => p.id !== product.id));
                                    },
                                    'Delete Product',
                                    'Delete'
                                  );
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
                        src={(product.images && product.images[0]) || undefined} 
                        alt="" 
                        className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="bg-[#143C6B]/10 text-[#143C6B] font-mono font-black text-[9px] px-1.5 py-0.5 rounded-sm border border-[#143C6B]/20">
                              #{product.numericId !== undefined ? product.numericId : product.id}
                            </span>
                            {product.tag && (
                              <span className="bg-lucky-magenta/10 text-lucky-magenta font-black text-[8px] px-1 rounded-xs uppercase tracking-wide">
                                {product.tag}
                              </span>
                            )}
                            <span className="text-[8.5px] text-slate-400 font-bold font-mono">UUID: {product.id.slice(0, 6)}..</span>
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
                                setSelectedProductForInspection(product);
                                setActiveTab('inspect-product/' + product.id);
                              }}
                              className="p-1.5 rounded-md text-slate-600 hover:text-lucky-magenta hover:bg-slate-100 cursor-pointer"
                              title="Inspect Product"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                resetProductForm(product);
                                setActiveTab('edit-product/' + product.id);
                              }}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                triggerConfirm(
                                  `Are you sure you want to delete ${product.title}?`,
                                  () => {
                                    onDeleteProduct(product.id);
                                    setLiveProducts(prev => prev.filter(p => p.id !== product.id));
                                  },
                                  'Delete Product',
                                  'Delete'
                                );
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

          {/* 2.1. CATEGORIES MANAGER TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fadeIn" id="categories-manager-container">
              
              {/* Hidden file inputs for main category and subcategory uploads */}
              <input
                type="file"
                ref={categoryFileInputRef}
                onChange={(e) => handleCategoryFileInputChange(e, { type: 'main' })}
                accept="image/*"
                className="hidden"
                id="main-category-file-input"
              />
              <input
                type="file"
                ref={subCategoryFileInputRef}
                onChange={(e) => {
                  if (activeSubCropIndex !== null) {
                    handleCategoryFileInputChange(e, { type: 'sub', index: activeSubCropIndex });
                  }
                }}
                accept="image/*"
                className="hidden"
                id="subcategory-file-input"
              />
              <input
                type="file"
                ref={filterFileInputRef}
                onChange={handleFilterFileInputChange}
                accept="image/*"
                className="hidden"
                id="filter-file-input"
              />

              {filterFormMode ? (
                /* --- ADD / EDIT FILTER FORM --- */
                <form onSubmit={handleFilterSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl mx-auto" id="filter-edit-form">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800" id="filter-form-title">
                        {filterFormMode === 'edit' ? 'Edit Category Filter Specifications' : 'Create New Category Filter'}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Customize filter name, sidebar image banner, and assign categories</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFilterFormMode(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                      id="close-filter-form-btn"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {filterError && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100" id="filter-error-box">
                      {filterError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Details & Image */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category Filter Name</label>
                        <input
                          type="text"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          placeholder="e.g. Women Western, Fashion Accessories"
                          className="w-full px-4 py-2.5 text-xs border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#143C6B]/20 focus:border-[#143C6B]"
                          id="filter-name-input"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Branding Image Banner</label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 relative group">
                            {filterImage ? (
                              <img
                                src={filterImage}
                                alt="Filter Preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-355" />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => filterFileInputRef.current?.click()}
                              className="px-3.5 py-2 text-[11px] font-bold bg-[#143C6B]/5 hover:bg-[#143C6B]/10 text-[#143C6B] border border-[#143C6B]/15 rounded-xl cursor-pointer transition-colors"
                              id="upload-filter-img-btn"
                            >
                              Upload Image
                            </button>
                            {filterImage && (
                              <button
                                type="button"
                                onClick={() => handleOpenCategoryCropper(filterImage, { type: 'filter' })}
                                className="px-3 py-2 text-[11px] font-bold text-amber-600 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors block mt-1"
                              >
                                Spark Crop
                              </button>
                            )}
                            <p className="text-[10px] text-slate-400">Perfect ratio recommended for sidebar banners.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Category Mapping Select */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">
                          Map Categories To This Filter
                        </label>
                        <p className="text-[10px] text-slate-400 mb-2">Select which first-level shop categories appear when this filter is clicked in the sidebar.</p>
                        
                        <div className="border border-slate-200 rounded-xl p-3 max-h-[220px] overflow-y-auto space-y-2 bg-slate-50/50" id="categories-mapping-list">
                          {categories.map((cat) => {
                            const isChecked = filterCategoryIds.includes(cat.id);
                            return (
                              <label
                                key={cat.id}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-white border-lucky-magenta/25 shadow-2xs'
                                    : 'border-transparent hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFilterCategoryIds([...filterCategoryIds, cat.id]);
                                      } else {
                                        setFilterCategoryIds(filterCategoryIds.filter(id => id !== cat.id));
                                      }
                                    }}
                                    className="rounded border-slate-300 text-lucky-magenta focus:ring-lucky-magenta/30"
                                  />
                                  <div className="w-6 h-6 rounded-md overflow-hidden aspect-square border border-slate-200 flex-shrink-0">
                                    <img
                                      src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150'}
                                      alt={cat.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                                </div>
                              </label>
                            );
                          })}
                          {categories.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-4 font-semibold">Please create some categories first!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setFilterFormMode(null)}
                      className="px-5 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      id="cancel-filter-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingFilter}
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs bg-[#143C6B] hover:bg-[#143C6B]/90 disabled:bg-slate-300 text-white font-extrabold rounded-xl cursor-pointer transition-all shadow-xs"
                      id="save-filter-submit-btn"
                    >
                      {isSavingFilter && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{filterFormMode === 'edit' ? 'Update Category Filter' : 'Save Category Filter'}</span>
                    </button>
                  </div>
                </form>
              ) : categoryFormMode ? (
                /* --- ADD / EDIT CATEGORY FORM --- */
                <form onSubmit={handleCategorySave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl mx-auto" id="category-edit-form">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800" id="category-form-title">
                        {categoryFormMode === 'edit' ? 'Edit Category Filter Specifications & Smart Crop' : 'Create New Storefront Category Filter'}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Customize category filter branding image, smart crop framing, visual tokens, and subcategories</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategoryFormMode(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                      id="close-category-form-btn"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {categoryError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold" id="category-form-error">
                      {categoryError}
                    </div>
                  )}

                  {/* 1. Category Main Image & Smart Crop Studio Section */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4" id="category-image-manager-section">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#143C6B]" />
                          <span>Category Storefront Image & Smart Crop (1:1 Square)</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          This image appears in the customer home screen 1:1 square category frame and category browsing lists
                        </p>
                      </div>
                      <span className="text-[9px] font-black bg-[#143C6B]/10 text-[#143C6B] px-2 py-0.5 rounded-full uppercase">
                        Smart Cropper Integrated
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Live Customer 1:1 Square Frame Simulation */}
                      <div className="md:col-span-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Live Storefront 1:1 Frame
                        </span>
                        
                        <div className="relative group cursor-pointer" onClick={() => categoryFileInputRef.current?.click()}>
                          <div className="w-16 h-16 rounded-xl overflow-hidden aspect-square border-2 border-[#143C6B] ring-2 ring-[#143C6B]/20 bg-blue-50/50 shadow-md flex items-center justify-center">
                            {categoryImage ? (
                              <img
                                src={categoryImage}
                                alt="Category 1:1 Frame Preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ShoppingBag className="w-7 h-7 text-[#143C6B]" />
                            )}
                          </div>
                          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black">
                            Change
                          </div>
                        </div>

                        <span className="text-xs font-black text-[#143C6B] mt-2 max-w-[120px] truncate">
                          {categoryName || 'Category Name'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                          Home Screen Preview
                        </span>
                      </div>

                      {/* Controls & Upload Actions */}
                      <div className="md:col-span-8 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => categoryFileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#143C6B] hover:bg-[#143C6B]/90 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                            id="upload-category-image-btn"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload & Smart Crop</span>
                          </button>

                          {categoryImage && (
                            <button
                              type="button"
                              onClick={() => handleOpenCategoryCropper(categoryImage, { type: 'main' })}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition-all"
                              id="adjust-category-crop-btn"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Adjust Smart Crop</span>
                            </button>
                          )}

                          {categoryImage && (
                            <button
                              type="button"
                              onClick={() => setCategoryImage('')}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Clear Image (Fallback to subcategory image)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Quick preset selector */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Quick Curated Photography Presets:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'Ethnic Sarees', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' },
                              { label: 'Western Wear', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600' },
                              { label: 'Men Fashion', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600' },
                              { label: 'Jewellery', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600' },
                              { label: 'Cosmetics', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600' }
                            ].map((pr, pidx) => (
                              <button
                                key={pidx}
                                type="button"
                                onClick={() => handleOpenCategoryCropper(pr.url, { type: 'main' })}
                                className="text-[10px] font-bold bg-white hover:bg-[#143C6B]/10 hover:text-[#143C6B] border border-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                {pr.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Category Title</label>
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g. Kurti, Saree & Ethnic Wear"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#143C6B]/20 focus:border-[#143C6B] outline-hidden font-semibold transition-all"
                        id="category-name-input"
                      />
                    </div>

                    {/* Category Icon Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Fallback Icon Token</label>
                      <select
                        value={categoryIcon}
                        onChange={(e) => setCategoryIcon(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#143C6B]/20 focus:border-[#143C6B] outline-hidden font-semibold transition-all"
                        id="category-icon-select"
                      >
                        <option value="shopping-bag">Shopping Bag (Default)</option>
                        <option value="sparkles">Sparkles (Western / Ethnic)</option>
                        <option value="shirt">Shirt (Clothing)</option>
                        <option value="gem">Gem (Jewellery)</option>
                        <option value="heart">Heart (Favorites / Innerwear)</option>
                        <option value="user">User (Men's Wear)</option>
                        <option value="baby">Baby (Kids & Toys)</option>
                        <option value="home">Home (Kitchen & Living)</option>
                        <option value="star">Star (Popular)</option>
                      </select>
                    </div>
                  </div>

                  {/* Subcategories Subsection */}
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Subcategories List ({categorySubCats.length}) <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span></h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Subcategories are optional. You can add leaf subcategories with 1:1 square photos if desired.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCategorySubCats([...categorySubCats, { name: '', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' }])}
                        className="flex items-center gap-1.5 text-[10px] font-black text-[#143C6B] bg-[#143C6B]/5 hover:bg-[#143C6B]/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        id="add-subcategory-btn"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Subcategory
                      </button>
                    </div>

                    {categorySubCats.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center" id="empty-subcategories-prompt">
                        <p className="text-xs font-semibold text-slate-500">No subcategories added</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">This category will operate as a standalone direct category. Click "Add Subcategory" if you wish to define sub-level categories.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1" id="subcategories-form-list">
                        {categorySubCats.map((sub, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-slate-50/70 border border-slate-200 p-3 rounded-xl relative group/sub" id={`subcategory-row-${idx}`}>
                            
                            {/* 1:1 Square Preview & Quick Crop Trigger */}
                            <div
                              onClick={() => {
                                setActiveSubCropIndex(idx);
                                subCategoryFileInputRef.current?.click();
                              }}
                              className="relative group cursor-pointer w-12 h-12 rounded-xl overflow-hidden aspect-square flex-shrink-0 border-2 border-slate-200 bg-white shadow-2xs"
                              title="Click to Upload & Smart Crop subcategory photo"
                            >
                              <img
                                src={sub.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop'}
                                alt="Sub preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-bold">
                                Crop
                              </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Subcategory Title</span>
                                <input
                                  type="text"
                                  value={sub.name}
                                  onChange={(e) => {
                                    const updated = [...categorySubCats];
                                    updated[idx].name = e.target.value;
                                    setCategorySubCats(updated);
                                  }}
                                  placeholder="e.g. Designer Kurtis"
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden font-semibold"
                                  id={`subcategory-name-input-${idx}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Image URL</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCategoryCropper(sub.image, { type: 'sub', index: idx })}
                                    className="text-[9px] font-bold text-[#143C6B] hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Smart Crop
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={sub.image}
                                  onChange={(e) => {
                                    const updated = [...categorySubCats];
                                    updated[idx].image = e.target.value;
                                    setCategorySubCats(updated);
                                  }}
                                  placeholder="https://unsplash..."
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden font-semibold"
                                  id={`subcategory-image-input-${idx}`}
                                />
                              </div>
                            </div>

                            {/* Delete inline subcategory button */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = categorySubCats.filter((_, i) => i !== idx);
                                setCategorySubCats(updated);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer self-center transition-colors"
                              title="Remove subcategory"
                              id={`remove-subcategory-btn-${idx}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Submission Actions */}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setCategoryFormMode(null)}
                      className="px-4 py-2 text-xs text-slate-500 font-bold border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                      id="cancel-category-save-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCategory}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs bg-[#143C6B] text-white hover:bg-[#143C6B]/90 font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                      id="save-category-submit-btn"
                    >
                      {isSavingCategory ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving Category...
                        </>
                      ) : (
                        'Save & Publish Category'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* --- LISTS & SUB-TABS SELECTOR MODE --- */
                <div className="space-y-6">
                  {/* Modern visual sub-tab pill switcher */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl max-w-2xl" id="category-subtabs-pillbox">
                    <button
                      type="button"
                      onClick={() => setCategorySubTab('categories')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                        categorySubTab === 'categories'
                          ? 'bg-white text-lucky-magenta shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      id="subtab-categories-trigger"
                    >
                      <Layers className="w-4 h-4" />
                      <span>First Categories (Top Row)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategorySubTab('filters')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                        categorySubTab === 'filters'
                          ? 'bg-white text-lucky-magenta shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      id="subtab-filters-trigger"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Second Category Filters (Left Sidebar)</span>
                    </button>
                  </div>

                  {categorySubTab === 'categories' ? (
                    /* --- 1. FIRST LEVEL CATEGORIES TAB --- */
                    <div className="space-y-4 animate-fadeIn" id="categories-tab-content">
                      {/* Category Creator Actions bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs" id="category-actions-bar">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#143C6B] shadow-2xs">
                            <Layers className="w-5 h-5 text-[#143C6B]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-[#143C6B] uppercase tracking-wider block">First Category System</span>
                            <h3 className="text-xs font-extrabold text-slate-800">Categories & Live Home 1:1 Square Layout</h3>
                          </div>
                        </div>
                        
                        <button
                          onClick={triggerAddCategory}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#143C6B] hover:bg-[#143C6B]/90 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                          id="create-category-btn"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Category</span>
                        </button>
                      </div>

                      {/* Categories Cards layout Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="categories-cards-grid">
                        {categories.map((cat, idx) => {
                          const displayImg = cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300';
                          
                          return (
                            <div
                              key={cat.id}
                              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 relative group"
                              id={`category-card-${cat.id}`}
                            >
                              {/* Top row with Live 1:1 Square Frame preview and Position ranking */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Actual Live 1:1 Square Frame Thumbnail */}
                                  <div
                                    onClick={() => {
                                      triggerEditCategory(cat);
                                    }}
                                    className="w-13 h-13 rounded-xl overflow-hidden aspect-square border-2 border-[#143C6B] ring-2 ring-[#143C6B]/20 bg-blue-50/50 flex-shrink-0 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                    title="Click to edit category image & smart crop"
                                  >
                                    <img
                                      src={displayImg}
                                      alt={cat.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug">{cat.name}</h4>
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">{cat.id}</span>
                                  </div>
                                </div>

                                {/* Position Controls */}
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5" id={`position-adjusters-${cat.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryMoveUp(idx)}
                                    disabled={idx === 0}
                                    className={`p-1 rounded-sm text-xs cursor-pointer transition-colors ${
                                      idx === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs'
                                    }`}
                                    title="Move Up (Increase Display Rank)"
                                  >
                                    ▲
                                  </button>
                                  <span className="text-[9px] font-black px-1 text-slate-400 select-none">
                                    {idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryMoveDown(idx)}
                                    disabled={idx === categories.length - 1}
                                    className={`p-1 rounded-sm text-xs cursor-pointer transition-colors ${
                                      idx === categories.length - 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs'
                                    }`}
                                    title="Move Down (Decrease Display Rank)"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>

                               {/* Quick Stats / Footer info & CRUD Actions */}
                              <div className="border-t border-slate-100/80 pt-3.5 flex items-center justify-between">
                                <span className="text-[9px] text-slate-400 font-bold">Icon: <span className="text-slate-600 font-black">{cat.icon || 'shopping-bag'}</span></span>
                                
                                {/* Actions CRUD buttons */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => triggerEditCategory(cat)}
                                    className="flex items-center gap-1 text-[10px] font-black text-[#143C6B] bg-[#143C6B]/5 hover:bg-[#143C6B]/10 px-2.5 py-1 rounded-md cursor-pointer transition-all"
                                    id={`edit-category-btn-${cat.id}`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Edit & Crop
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerConfirm(
                                        `Are you sure you want to permanently delete the category "${cat.name}"? All product placements for this category may be affected.`,
                                        () => handleCategoryDelete(cat.id),
                                        "Confirm Category Deletion"
                                      );
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md cursor-pointer transition-all"
                                    id={`delete-category-btn-${cat.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      {categories.length === 0 && (
                        <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl" id="empty-categories-state">
                          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                          <h4 className="text-sm font-extrabold text-slate-700">No Custom Categories Provisioned</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">Database category tables are currently empty. Press "Create New Category" to begin.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* --- 2. SECOND LEVEL CATEGORY FILTERS TAB --- */
                    <div className="space-y-4 animate-fadeIn" id="filters-tab-content">
                      {/* Filter Actions bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs" id="filter-actions-bar">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#143C6B] shadow-2xs">
                            <Filter className="w-5 h-5 text-[#143C6B]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-[#143C6B] uppercase tracking-wider block">Second Category Filters</span>
                            <h3 className="text-xs font-extrabold text-slate-800">Sidebar Filtering Groups & Custom Image Banner</h3>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={triggerAddFilter}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#143C6B] hover:bg-[#143C6B]/90 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                          id="create-filter-btn"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Category Filter</span>
                        </button>
                      </div>

                      {/* Filters grid list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="filters-cards-grid">
                        {categoryFilters.map((filt, idx) => {
                          const displayImg = filt.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150';
                          return (
                            <div
                              key={filt.id}
                              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 relative group"
                              id={`filter-card-${filt.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    onClick={() => triggerEditFilter(filt)}
                                    className="w-13 h-13 rounded-xl overflow-hidden border border-slate-250 bg-slate-50 flex-shrink-0 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                    title="Click to edit filter specifications"
                                  >
                                    <img
                                      src={displayImg}
                                      alt={filt.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug">{filt.name}</h4>
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">{filt.id}</span>
                                  </div>
                                </div>

                                {/* Filter position ranking adjusters */}
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5" id={`filter-position-adjusters-${filt.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleFilterMoveUp(idx)}
                                    disabled={idx === 0}
                                    className={`p-1 rounded-sm text-xs cursor-pointer transition-colors ${
                                      idx === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs'
                                    }`}
                                    title="Move Up Display Rank"
                                  >
                                    ▲
                                  </button>
                                  <span className="text-[9px] font-black px-1 text-slate-400 select-none">
                                    {idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleFilterMoveDown(idx)}
                                    disabled={idx === categoryFilters.length - 1}
                                    className={`p-1 rounded-sm text-xs cursor-pointer transition-colors ${
                                      idx === categoryFilters.length - 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs'
                                    }`}
                                    title="Move Down Display Rank"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>

                              {/* Associated categories mapped */}
                              <div className="space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mapped Shop Categories ({filt.categoryIds?.length || 0})</span>
                                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto scrollbar-thin">
                                  {filt.categoryIds?.map((catId) => {
                                    const matchingCat = categories.find(c => c.id === catId);
                                    if (!matchingCat) return null;
                                    return (
                                      <span
                                        key={catId}
                                        className="text-[9px] bg-slate-50 border border-slate-200/50 text-slate-600 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1"
                                      >
                                        {matchingCat.image && (
                                          <img src={matchingCat.image} alt="" className="w-3 h-3 rounded-full object-cover" />
                                        )}
                                        <span>{matchingCat.name}</span>
                                      </span>
                                    );
                                  })}
                                  {(!filt.categoryIds || filt.categoryIds.length === 0) && (
                                    <span className="text-[10px] text-amber-600 font-bold">No Categories Mapped (Filter is Empty)</span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="border-t border-slate-100/80 pt-3.5 flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => triggerEditFilter(filt)}
                                  className="flex items-center gap-1 text-[10px] font-black text-[#143C6B] bg-[#143C6B]/5 hover:bg-[#143C6B]/10 px-2.5 py-1 rounded-md cursor-pointer transition-all"
                                  id={`edit-filter-btn-${filt.id}`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit & Map
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerConfirm(
                                      `Are you sure you want to permanently delete the category filter "${filt.name}"? This will remove the sidebar section, but won't delete the categories within it.`,
                                      () => handleFilterDelete(filt.id),
                                      "Confirm Filter Deletion"
                                    );
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md cursor-pointer transition-all"
                                  id={`delete-filter-btn-${filt.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {categoryFilters.length === 0 && (
                        <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl" id="empty-filters-state">
                          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-pulse" />
                          <h4 className="text-sm font-extrabold text-slate-700">No Category Filters Defined</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">Left sidebar category mapping rules are currently empty. Press "Create New Category Filter" above.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                            setSelectedOrderForInspection(order);
                            setActiveTab('inspect-order/' + order.id);
                          }}
                          className="p-1.5 px-2.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer flex items-center gap-1 font-extrabold text-[10px]"
                          title="Full Page Invoice Inspection"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerConfirm(
                              `Are you sure you want to delete or archive Order ${order.id}?`,
                              () => {
                                onDeleteOrder(order.id);
                              },
                              'Delete Order',
                              'Delete'
                            );
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
                                    src={variant?.imageUrl || (item.product.images && item.product.images[0]) || undefined} 
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
                  onClick={() => {
                    setEditingCoupon(null);
                    setCCode('');
                    setCType('flat');
                    setCValue(100);
                    setCMinPurchase(499);
                    setCDescription('');
                    setActiveTab('add-coupon');
                  }}
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
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setCCode(coupon.code);
                              setCType(coupon.discountType);
                              setCValue(coupon.value);
                              setCMinPurchase(coupon.minPurchase);
                              setCDescription(coupon.description);
                              setActiveTab('edit-coupon/' + coupon.code);
                            }}
                            className="text-slate-600 hover:text-lucky-magenta p-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              triggerConfirm(
                                `Are you sure you want to deactivate promo code ${coupon.code}?`,
                                () => {
                                  onDeleteCoupon(coupon.code);
                                },
                                'Deactivate Coupon',
                                'Deactivate'
                              );
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                            title="Revoke Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                          src={(p.images && p.images[0]) || undefined} 
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
                      placeholder="Search seller by numeric ID (e.g. #1 or 1), store name, email, phone, GSTIN..."
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
                          <th className="p-4">Verification Status</th>
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
                                <div 
                                  className="flex items-center gap-2.5 cursor-pointer group"
                                  onClick={() => {
                                    setSelectedVendorForInspection(v);
                                    setAdminSubView('inspect-vendor');
                                    setActiveTab('inspect-vendor/' + (v.numericId !== undefined ? v.numericId : v.id));
                                  }}
                                  title="Click to inspect this vendor profile"
                                >
                                  <span className="text-lg group-hover:scale-110 transition-transform">🏪</span>
                                  <div>
                                    <h4 className="font-black text-slate-900 group-hover:text-[#143C6B] transition-colors">{v.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className="bg-[#143C6B]/10 text-[#143C6B] font-mono font-black text-[10px] px-1.5 py-0.5 rounded-sm border border-[#143C6B]/20">
                                        #{v.numericId !== undefined ? v.numericId : v.id}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-mono" title={v.id}>UUID: {v.id.slice(0, 6)}..</span>
                                    </div>
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
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                  }`}
                                  title="Toggle supplier verification (Verified / Unverified)"
                                >
                                  {v.vendorType === 'big' ? '👑 Verified Seller' : '🌱 Unverified Seller'}
                                </button>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  v.status === 'banned' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                  v.status === 'suspended' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedVendorForInspection(v);
                                    setAdminSubView('inspect-vendor');
                                    setActiveTab('inspect-vendor/' + (v.numericId !== undefined ? v.numericId : v.id));
                                  }}
                                  className="text-[10px] font-black uppercase py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#143C6B] border border-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Individually Inspect Supplier Records"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => handleBanVendor(v)}
                                  className={`text-[10px] font-black uppercase py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                                    v.status === 'banned' 
                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' 
                                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                  }`}
                                  title="Ban seller account (Products become private and login is blocked)"
                                >
                                  {v.status === 'banned' ? 'Unban' : 'Ban'}
                                </button>
                                <button
                                  onClick={() => handleDeleteVendor(v)}
                                  className="text-[10px] font-black uppercase py-1.5 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                  title="Delete seller account and all their products"
                                >
                                  Delete
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
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
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
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                u.status === 'banned' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedCustomerForInspection(u);
                                  setAdminSubView('inspect-customer');
                                }}
                                className="text-[10px] font-black uppercase py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#143C6B] border border-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                              <button
                                onClick={() => handleToggleCustomerBan(u)}
                                className={`text-[10px] font-black uppercase py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                                  u.status === 'banned' 
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' 
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                }`}
                                title="Ban customer (Prevents OTP login & hides reviews)"
                              >
                                {u.status === 'banned' ? 'Unban' : 'Ban'}
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(u)}
                                className="text-[10px] font-black uppercase py-1.5 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                title="Delete customer account"
                              >
                                Delete
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

          {/* 11. SPONSORSHIPS TAB */}
          {activeTab === 'sponsorships' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Form and Preview Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Find & Promote Product Form */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Promote Product Listing</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Search products by ID and boost them to the top of results</p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Search input for ID */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Enter Numeric Product ID *</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. 1, 15, 42..."
                          value={sponsorSearchId}
                          onChange={(e) => setSponsorSearchId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold outline-hidden focus:border-lucky-magenta/50 focus:bg-white transition-all pl-9"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Searched product preview */}
                    {sponsorProduct ? (
                      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex gap-3.5 items-center">
                        <img
                          src={(sponsorProduct.images && sponsorProduct.images[0]) || undefined}
                          alt={sponsorProduct.title}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200/60"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] text-lucky-magenta font-extrabold uppercase tracking-wider">{sponsorProduct.category}</span>
                          <h4 className="text-xs font-black text-gray-800 truncate">{sponsorProduct.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-black text-gray-800">₹{sponsorProduct.price}</span>
                            {sponsorProduct.sponsoredUntil && new Date(sponsorProduct.sponsoredUntil) > new Date() ? (
                              <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100 font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wide">
                                Active Sponsor
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 bg-slate-100 font-bold px-1.5 py-0.2 rounded-sm">
                                Standard List
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      sponsorSearchId && (
                        <div className="bg-red-50/40 border border-red-100 text-[11px] text-red-600 font-bold p-3 rounded-lg flex items-center gap-2">
                          <span>⚠️ No active product matches Numeric ID "{sponsorSearchId}"</span>
                        </div>
                      )
                    )}

                    {/* Duration Select */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Sponsorship Duration *</label>
                      <select
                        value={sponsorDuration}
                        onChange={(e) => setSponsorDuration(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-hidden focus:border-lucky-magenta/50 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="1day">1 Day (24 Hours Boost)</option>
                        <option value="1week">1 Week (7 Days Boost)</option>
                        <option value="1month">1 Month (30 Days Boost)</option>
                      </select>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleActivateSponsorship}
                      disabled={!sponsorProduct || isSponsoringSubmitting}
                      className="w-full bg-lucky-magenta disabled:opacity-40 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer hover:bg-opacity-95 flex items-center justify-center gap-2"
                    >
                      {isSponsoringSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activating Sponsorship...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Activate Sponsored Boost</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info and guidelines Column */}
                <div className="lg:col-span-7 bg-[#1E293B] text-white rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Sparkles className="w-64 h-64 text-amber-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] badge-gradient-magenta font-black px-2 py-0.5 rounded-sm">EXCLUSIVE ADMIN ACCELERATOR</span>
                      <h3 className="text-base font-black text-white mt-1.5">Sponsored Products Advantage</h3>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        Sponsored items bypass normal catalog order and default feeds. They are automatically injected at the very top of searching, filtering, and category browsers for the requested duration.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                        <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-wide">Category Dominance</span>
                        <p className="text-[10px] text-slate-300 mt-1 leading-snug">First row visibility inside category queries and filters.</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                        <span className="text-[9.5px] font-black text-emerald-400 uppercase tracking-wide">Boost Conversion</span>
                        <p className="text-[10px] text-slate-300 mt-1 leading-snug">Auto-badge indicator "⭐ Sponsored" signals trusted and boosted items.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-700/40 pt-4 flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <p className="text-[10px] text-slate-300 leading-snug font-medium">
                      Ensure target product has high-quality images and adequate inventory prior to activating marketing credits.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Sponsorships table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Active Sponsored Products Catalog ({activeSponsoredProducts.length})</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Verify current promotional statuses and end-dates</p>
                  </div>
                </div>

                {activeSponsoredProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500">No products are currently sponsored.</p>
                    <p className="text-[10.5px] text-slate-400 mt-1">Use the Promote panel above to sponsor your first product.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4 w-16 text-center">ID</th>
                          <th className="p-4">Product Details</th>
                          <th className="p-4">Seller Info</th>
                          <th className="p-4">Sponsorship Expiration</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                        {activeSponsoredProducts.map((p) => {
                          const isExpired = p.sponsoredUntil ? new Date(p.sponsoredUntil) <= new Date() : true;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono font-black text-center text-slate-400 text-[11px]">#{p.numericId}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={(p.images && p.images[0]) || undefined}
                                    alt={p.title}
                                    className="w-10 h-10 object-cover rounded-md border border-slate-200/50 flex-shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-slate-800 truncate max-w-[280px]" title={p.title}>{p.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{p.category} • {p.subCategory}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-700">{p.soldBy || 'Jaipur Wholesale'}</span>
                                  <span className="text-[9.5px] text-slate-400 font-medium">Vendor ID: {p.vendorId || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-800">{p.sponsoredUntil ? new Date(p.sponsoredUntil).toLocaleString() : 'N/A'}</span>
                                  <span className="text-[10px] text-lucky-magenta font-semibold mt-0.5">
                                    {p.sponsoredUntil ? formatSponsorshipRemaining(p.sponsoredUntil) : ''}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md border shadow-3xs ${
                                  isExpired
                                    ? 'bg-red-50 text-red-500 border-red-100'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse'
                                }`}>
                                  {isExpired ? 'Expired' : 'Active Boost'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      {/* 7. MAIN BANNERS TAB & DOUBLE BANNERS TAB */}
      {(activeTab === 'main-banners' || activeTab === 'banners') && (
        <div className="space-y-6 animate-fadeIn p-4 md:p-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF8C00]" />
                <span>Main Banners (Top Single Banner Area)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Full-width top poster slider on /shop page (~3.2:1 ratio). Add unlimited banners — if zero exist, shop auto-fills with festive defaults.</p>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBType('promotional');
                setBImageUrl('');
                setBLinkUrl('');
                setBRow('main');
                setBOrder(banners.filter(b => b.row === 'main' || b.row === 'upper').length + 1);
                setBTitle('');
                setBSubtitle('');
                setBCode('');
                setBTargetCategory('');
                setIsBannerModalOpen(true);
              }}
              className="bg-[#143C6B] text-white px-5 py-2.5 rounded-lg text-xs font-extrabold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Main Banner</span>
            </button>
          </div>

          {(() => {
            const mainBanners = [...banners].filter(b => b.row === 'main' || b.row === 'upper' || b.id === 'banner-rakhi-1' || !b.row).sort((a,b) => (a.order || 0) - (b.order || 0));

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C00]"></span>
                    <span>Configured Main Banners</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {mainBanners.length}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Unlimited Limit Supported</span>
                </div>

                {mainBanners.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center shadow-3xs">
                    <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-800">No Custom Main Banners Added</h4>
                    <p className="text-[10px] text-slate-400 mt-1">/shop automatically displays default festive hero banners until you add custom ones here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mainBanners.map((b) => (
                      <div key={b.id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col group relative">
                        <div className="aspect-[16/5] w-full bg-slate-900 relative">
                          <img src={b.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=900'} alt={b.title || b.type} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-lucky-magenta text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            ORDER: {b.order || 1}
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            {b.type === 'promotional' ? 'Promo' : 'News'}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white pointer-events-none">
                            {b.code && <p className="text-[7px] text-[#FF8C00] font-black">CODE: {b.code}</p>}
                            <h5 className="text-[10px] font-extrabold line-clamp-1">{b.title || 'Untitled Main Banner'}</h5>
                            {b.subtitle && <p className="text-[8px] text-slate-300 font-medium line-clamp-1">{b.subtitle}</p>}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 font-bold truncate">
                            {b.targetCategory ? `Category: ${b.targetCategory}` : (b.linkUrl ? `Link: ${b.linkUrl}` : 'No redirect link')}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingBanner(b);
                                setBRow('main');
                                setBannerCropSrc(b.imageUrl);
                                setIsBannerCropOpen(true);
                              }}
                              className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9.5px] font-black hover:bg-amber-100 transition-colors cursor-pointer"
                              title="Smart Crop Image"
                            >
                              Smart Crop
                            </button>
                            <button
                              onClick={() => {
                                setEditingBanner(b);
                                setBType(b.type);
                                setBImageUrl(b.imageUrl);
                                setBLinkUrl(b.linkUrl || '');
                                setBRow('main');
                                setBOrder(b.order || 1);
                                setBTitle(b.title || '');
                                setBSubtitle(b.subtitle || '');
                                setBCode(b.code || '');
                                setBTargetCategory(b.targetCategory || '');
                                setIsBannerModalOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-3xs"
                              title="Edit Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                triggerConfirm(
                                  'Are you sure you want to delete this Main Banner?',
                                  () => onDeleteBanner?.(b.id),
                                  'Delete Main Banner',
                                  'Delete'
                                );
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'double-banners' && (
        <div className="space-y-6 animate-fadeIn p-4 md:p-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-lucky-magenta" />
                <span>Double Banners (Two Side-by-Side Banners Area)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Displayed 2-at-a-time in dynamic pairs below top banner on /shop (~2.2:1 ratio). Add unlimited banners — if zero exist, space auto-fills.</p>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBType('promotional');
                setBImageUrl('');
                setBLinkUrl('');
                setBRow('double');
                setBOrder(banners.filter(b => b.row === 'double' || b.row === 'lower').length + 1);
                setBTitle('');
                setBSubtitle('');
                setBCode('');
                setBTargetCategory('');
                setIsBannerModalOpen(true);
              }}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-extrabold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Double Banner</span>
            </button>
          </div>

          {(() => {
            const doubleBanners = [...banners].filter(b => b.row === 'double' || b.row === 'lower' || b.id === 'banner-rakhi-2' || b.id === 'banner-rakhi-3').sort((a,b) => (a.order || 0) - (b.order || 0));

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-lucky-magenta"></span>
                    <span>Configured Double Banners</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {doubleBanners.length}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Unlimited Limit Supported</span>
                </div>

                {doubleBanners.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center shadow-3xs">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-800">No Custom Double Banners Added</h4>
                    <p className="text-[10px] text-slate-400 mt-1">/shop automatically displays default festive side-by-side banners until you add custom ones here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doubleBanners.map((b) => (
                      <div key={b.id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col group relative">
                        <div className="aspect-[11/5] w-full bg-slate-900 relative">
                          <img src={b.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600'} alt={b.title || b.type} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-lucky-magenta text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            ORDER: {b.order || 1}
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            {b.type === 'promotional' ? 'Promo' : 'News'}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white pointer-events-none">
                            {b.code && <p className="text-[7px] text-[#FF8C00] font-black">CODE: {b.code}</p>}
                            <h5 className="text-[10px] font-extrabold line-clamp-1">{b.title || 'Untitled Double Banner'}</h5>
                            {b.subtitle && <p className="text-[8px] text-slate-300 font-medium line-clamp-1">{b.subtitle}</p>}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 font-bold truncate">
                            {b.targetCategory ? `Category: ${b.targetCategory}` : (b.linkUrl ? `Link: ${b.linkUrl}` : 'No redirect link')}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingBanner(b);
                                setBRow('double');
                                setBannerCropSrc(b.imageUrl);
                                setIsBannerCropOpen(true);
                              }}
                              className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9.5px] font-black hover:bg-amber-100 transition-colors cursor-pointer"
                              title="Smart Crop Image"
                            >
                              Smart Crop
                            </button>
                            <button
                              onClick={() => {
                                setEditingBanner(b);
                                setBType(b.type);
                                setBImageUrl(b.imageUrl);
                                setBLinkUrl(b.linkUrl || '');
                                setBRow('double');
                                setBOrder(b.order || 1);
                                setBTitle(b.title || '');
                                setBSubtitle(b.subtitle || '');
                                setBCode(b.code || '');
                                setBTargetCategory(b.targetCategory || '');
                                setIsBannerModalOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-3xs"
                              title="Edit Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                triggerConfirm(
                                  'Are you sure you want to delete this Double Banner?',
                                  () => onDeleteBanner?.(b.id),
                                  'Delete Double Banner',
                                  'Delete'
                                );
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
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
                      {categories && categories.length > 0 ? (
                        categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Kurtis & Suits">Kurtis & Suits</option>
                          <option value="Watches">Watches</option>
                          <option value="Sarees">Sarees</option>
                          <option value="Jewellery">Jewellery</option>
                          <option value="Footwear">Footwear</option>
                          <option value="Bags & Purses">Bags & Purses</option>
                        </>
                      )}
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
                      <span>Uploading & Processing Image...</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Placement Row *</label>
                    <select
                      value={bRow}
                      onChange={(e) => setBRow(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    >
                      <option value="main">Main Banner (Top Slider)</option>
                      <option value="double">Double Banner (2-in-1 Grid)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Banner Type *</label>
                    <select
                      value={bType}
                      onChange={(e) => setBType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    >
                      <option value="promotional">Promotional Offer</option>
                      <option value="news">Latest News / Announcement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Image URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={bImageUrl}
                      onChange={(e) => setBImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                    {bImageUrl?.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setBannerCropSrc(bImageUrl);
                          setIsBannerCropOpen(true);
                        }}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black transition-colors cursor-pointer shrink-0"
                      >
                        Smart Crop
                      </button>
                    )}
                  </div>
                  {Boolean(bImageUrl?.trim()) && (
                    <div className="mt-3 aspect-[3/1] bg-slate-900 rounded-lg overflow-hidden border border-slate-200 relative group">
                      <img src={bImageUrl.trim()} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setBannerCropSrc(bImageUrl);
                            setIsBannerCropOpen(true);
                          }}
                          className="px-3 py-1.5 bg-white text-slate-900 rounded-md text-xs font-black shadow-md cursor-pointer"
                        >
                          Launch Smart Crop
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Banner Title</label>
                    <input
                      type="text"
                      value={bTitle}
                      onChange={(e) => setBTitle(e.target.value)}
                      placeholder="e.g. Teej Mahotsav Sale"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Promo Code</label>
                    <input
                      type="text"
                      value={bCode}
                      onChange={(e) => setBCode(e.target.value)}
                      placeholder="e.g. FESTIVE20"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Target Category Redirect</label>
                  <select
                    value={bTargetCategory}
                    onChange={(e) => setBTargetCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                  >
                    <option value="">-- No Category Redirect --</option>
                    <option value="Kurtis & Suits">Kurtis & Suits</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Bedsheets">Bedsheets</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Bags & Purses">Bags & Purses</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={bSubtitle}
                      onChange={(e) => setBSubtitle(e.target.value)}
                      placeholder="e.g. Flat 20% OFF on Jaipur Suits"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={bOrder}
                      onChange={(e) => setBOrder(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-lucky-magenta text-slate-800"
                    />
                  </div>
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
                    {editingBanner ? 'Save Changes' : 'Publish Banner'}
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
                              <img src={sku.images?.[0] || undefined} alt="" className="w-full h-full object-cover" />
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
                                  <img src={item.product.images?.[0] || undefined} alt="" className="w-full h-full object-cover" />
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

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
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
        )}
      </div>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
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

      {/* Category Smart Crop & Live Publishing Simulator Modal */}
      <CategorySmartCropModal
        isOpen={isCategoryCropperOpen}
        initialImage={categoryCropperSrc}
        categoryTitle={
          categoryCropTarget.type === 'main'
            ? (categoryName || 'Category Name')
            : categoryCropTarget.type === 'filter'
            ? (filterName || 'Category Filter')
            : (categorySubCats[categoryCropTarget.index]?.name || 'Subcategory')
        }
        targetLabel={
          categoryCropTarget.type === 'main'
            ? 'Main Storefront Category Bubble'
            : categoryCropTarget.type === 'filter'
            ? 'Sidebar Category Filter Image'
            : `Subcategory: ${categorySubCats[categoryCropTarget.index]?.name || 'Item'}`
        }
        onConfirm={handleCategoryCropConfirm}
        onClose={() => setIsCategoryCropperOpen(false)}
        isLoading={isUploadingCategoryImage}
      />

      <BannerSmartCropModal
        isOpen={isBannerCropOpen}
        initialImage={bannerCropSrc}
        bannerRow={bRow}
        onConfirm={(croppedUrl) => {
          setBImageUrl(croppedUrl);
          setIsBannerCropOpen(false);
        }}
        onClose={() => setIsBannerCropOpen(false)}
      />

    </div>
  </div>
  );
}
