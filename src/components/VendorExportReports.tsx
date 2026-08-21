import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  ShieldCheck, 
  IndianRupee, 
  Package, 
  Filter,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { Order, Vendor, Product } from '../types';

interface VendorExportReportsProps {
  currentVendor: Vendor;
  orders: Order[];
  products: Product[];
}

type TimeRangeFilter = '24h' | '7d' | '30d' | '6m' | '1y' | 'all';
type StatusFilter = 'all' | 'delivered' | 'shipped' | 'ordered' | 'cancelled';

export default function VendorExportReports({
  currentVendor,
  orders,
  products: _products
}: VendorExportReportsProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // 1. Filter orders specifically belonging to this vendor
  const vendorOrders = useMemo(() => {
    return orders.filter(order =>
      order.items && order.items.some(item => item.product?.vendorId === currentVendor.id)
    );
  }, [orders, currentVendor.id]);

  // Helper to parse date
  const parseOrderDate = (dateStr: string): Date => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
    } catch (_) {}
    return new Date();
  };

  // 2. Filter by Time Range
  const filteredByTimeOrders = useMemo(() => {
    const now = new Date().getTime();
    return vendorOrders.filter(order => {
      if (timeRange === 'all') return true;

      const orderTime = parseOrderDate(order.orderDate).getTime();
      const diffMs = now - orderTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      if (timeRange === '24h') return diffHours <= 24;
      if (timeRange === '7d') return diffDays <= 7;
      if (timeRange === '30d') return diffDays <= 30;
      if (timeRange === '6m') return diffDays <= 180;
      if (timeRange === '1y') return diffDays <= 365;
      return true;
    });
  }, [vendorOrders, timeRange]);

  // 3. Filter by Status & Search Query
  const finalFilteredOrders = useMemo(() => {
    return filteredByTimeOrders
      .filter(order => {
        // Status filter
        if (statusFilter === 'delivered') {
          if (order.status !== 'Delivered' && order.status !== 'Delivered Early') return false;
        } else if (statusFilter === 'shipped') {
          if (order.status !== 'Shipped' && order.status !== 'Out for Delivery') return false;
        } else if (statusFilter === 'ordered') {
          if (order.status !== 'Ordered') return false;
        } else if (statusFilter === 'cancelled') {
          if (order.status !== 'Cancelled') return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = (order.id || '').toLowerCase().includes(q);
          const matchName = (order.shippingAddress?.name || '').toLowerCase().includes(q);
          const matchPhone = (order.shippingAddress?.phone || '').toLowerCase().includes(q);
          const matchCity = (order.shippingAddress?.city || '').toLowerCase().includes(q);
          const matchState = (order.shippingAddress?.state || '').toLowerCase().includes(q);
          const matchPincode = (order.shippingAddress?.pincode || '').toLowerCase().includes(q);
          const matchItem = order.items?.some(i => (i.product?.title || '').toLowerCase().includes(q));

          return matchId || matchName || matchPhone || matchCity || matchState || matchPincode || matchItem;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = parseOrderDate(a.orderDate).getTime();
        const timeB = parseOrderDate(b.orderDate).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [filteredByTimeOrders, statusFilter, searchQuery, sortOrder]);

  // 4. Flatten orders into indexed line-item records for table & CSV export
  const exportRows = useMemo(() => {
    const rows: {
      index: number;
      orderId: string;
      orderDate: string;
      customerName: string;
      customerPhone: string;
      shippingAddress: string;
      city: string;
      state: string;
      pincode: string;
      productTitle: string;
      variantSize: string;
      quantity: number;
      unitPrice: number;
      itemTotal: number;
      commissionRate: string;
      commissionAmount: number;
      netVendorPayout: number;
      status: string;
      paymentMode: string;
    }[] = [];

    let counter = 1;
    finalFilteredOrders.forEach(order => {
      const vendorItems = (order.items || []).filter(
        item => item.product?.vendorId === currentVendor.id
      );

      vendorItems.forEach(item => {
        const itemTotal = (item.product?.price || 0) * item.quantity;
        const commissionAmount = 0; // 0% Commission Platform
        const netVendorPayout = itemTotal;

        rows.push({
          index: counter++,
          orderId: order.id,
          orderDate: order.orderDate || new Date().toISOString(),
          customerName: order.shippingAddress?.name || 'Customer',
          customerPhone: order.shippingAddress?.phone || 'N/A',
          shippingAddress: order.shippingAddress?.addressLine || 'N/A',
          city: order.shippingAddress?.city || 'N/A',
          state: order.shippingAddress?.state || 'N/A',
          pincode: order.shippingAddress?.pincode || 'N/A',
          productTitle: item.product?.title || 'Wholesale Product',
          variantSize: item.selectedSize || 'Standard',
          quantity: item.quantity,
          unitPrice: item.product?.price || 0,
          itemTotal,
          commissionRate: '0%',
          commissionAmount,
          netVendorPayout,
          status: order.status,
          paymentMode: (order as any).paymentMethod || 'Prepaid / UPI / COD'
        });
      });
    });

    return rows;
  }, [finalFilteredOrders, currentVendor.id]);

  // 5. Aggregate KPI Summary Metrics for the filtered time window
  const summaryMetrics = useMemo(() => {
    let totalSales = 0;
    let totalUnits = 0;
    let deliveredCount = 0;
    let inTransitCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    finalFilteredOrders.forEach(order => {
      const vendorItems = (order.items || []).filter(
        item => item.product?.vendorId === currentVendor.id
      );
      const isCancelled = order.status === 'Cancelled';

      vendorItems.forEach(item => {
        totalUnits += item.quantity;
        if (!isCancelled) {
          totalSales += (item.product?.price || 0) * item.quantity;
        }
      });

      if (order.status === 'Delivered' || order.status === 'Delivered Early') {
        deliveredCount++;
      } else if (order.status === 'Shipped' || order.status === 'Out for Delivery') {
        inTransitCount++;
      } else if (order.status === 'Ordered') {
        pendingCount++;
      } else if (order.status === 'Cancelled') {
        cancelledCount++;
      }
    });

    return {
      totalOrders: finalFilteredOrders.length,
      totalSales,
      totalUnits,
      deliveredCount,
      inTransitCount,
      pendingCount,
      cancelledCount,
      commissionSaved: Math.round(totalSales * 0.15) // Industry 15% comparison
    };
  }, [finalFilteredOrders, currentVendor.id]);

  // 6. CSV Single-Click Exporter
  const handleDownloadCsv = () => {
    if (exportRows.length === 0) {
      alert('No order records available to export for the selected filters.');
      return;
    }

    const headers = [
      'Index No.',
      'Order ID',
      'Order Date & Time',
      'Customer Name',
      'Customer Phone Number',
      'Full Shipping Address',
      'City',
      'State',
      'Pincode',
      'Product Title',
      'Size / Variant',
      'Quantity',
      'Wholesale Unit Price (INR)',
      'Total Amount (INR)',
      'QueKart Platform Commission Rate',
      'Commission Deducted (INR)',
      'Net Vendor Payout (INR)',
      'Order Fulfillment Status',
      'Payment Mode'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContentRows = exportRows.map(row => [
      row.index,
      escapeCsv(row.orderId),
      escapeCsv(row.orderDate),
      escapeCsv(row.customerName),
      escapeCsv(row.customerPhone),
      escapeCsv(row.shippingAddress),
      escapeCsv(row.city),
      escapeCsv(row.state),
      escapeCsv(row.pincode),
      escapeCsv(row.productTitle),
      escapeCsv(row.variantSize),
      row.quantity,
      row.unitPrice,
      row.itemTotal,
      escapeCsv(row.commissionRate),
      row.commissionAmount,
      row.netVendorPayout,
      escapeCsv(row.status),
      escapeCsv(row.paymentMode)
    ].join(','));

    // UTF-8 BOM for Excel support
    const csvString = '\uFEFF' + [headers.join(','), ...csvContentRows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timeLabel = 
      timeRange === '24h' ? 'Last_24_Hours' :
      timeRange === '7d' ? 'Last_7_Days' :
      timeRange === '30d' ? 'Last_30_Days' :
      timeRange === '6m' ? 'Last_6_Months' :
      timeRange === '1y' ? 'Last_1_Year' : 'All_Time';

    link.setAttribute('href', url);
    link.setAttribute('download', `QueKart_Vendor_${currentVendor.name.replace(/[^a-zA-Z0-9]/g, '_')}_Orders_${timeLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(exportRows, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn" id="vendor-export-reports-root">
      
      {/* 1. TOP HEADER & SINGLE CLICK EXPORT CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#143C6B] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Order History & Customer Data Export
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Download complete, indexed records of every customer who ordered your products with timestamps and dispatch status.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={exportRows.length === 0}
              className={`h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 ${
                exportRows.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              id="vendor-download-csv-btn"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel / CSV ({exportRows.length})</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              id="vendor-print-report-btn"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Dispatch Slip</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy as JSON"
            >
              <FileText className="w-4 h-4" />
              <span>{copiedNotification ? '✓ Copied' : 'JSON'}</span>
            </button>
          </div>
        </div>

        {/* 2. TIME RANGE SELECTOR PILLS */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-[#143C6B]" />
            <span>Select Time Period:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: '24h', label: 'Last 24 Hours' },
              { id: '7d', label: 'Last 1 Week (7 Days)' },
              { id: '30d', label: 'Last 1 Month (30 Days)' },
              { id: '6m', label: 'Last 6 Months' },
              { id: '1y', label: 'Last 1 Year' },
              { id: 'all', label: 'All Time (Lifetime)' }
            ].map(pill => {
              const active = timeRange === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setTimeRange(pill.id as TimeRangeFilter)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    active
                      ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  id={`vendor-time-pill-${pill.id}`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SEARCH & STATUS FILTER ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Live Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, phone, city, order ID or product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 bg-white focus:outline-hidden focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B]"
              id="vendor-export-search-input"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full text-xs font-bold border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 bg-white focus:outline-hidden focus:border-[#143C6B]"
              id="vendor-export-status-select"
            >
              <option value="all">All Fulfillment Statuses</option>
              <option value="delivered">Delivered Only</option>
              <option value="shipped">In Transit / Shipped</option>
              <option value="ordered">Ordered (Pending Dispatch)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Filtered Orders</span>
            <Package className="w-4 h-4 text-[#143C6B]" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{summaryMetrics.totalOrders}</p>
          <p className="text-[10px] text-slate-400 font-medium">{summaryMetrics.totalUnits} items sold</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Gross Wholesale Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 mt-1">₹{summaryMetrics.totalSales.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-600 font-bold">100% Payout (₹0 Commission)</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Delivered Orders</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-800 mt-1">{summaryMetrics.deliveredCount}</p>
          <p className="text-[10px] text-slate-400 font-medium">{summaryMetrics.inTransitCount} in transit</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Commission Retained</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700 mt-1">₹{summaryMetrics.commissionSaved.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-amber-600 font-bold">Saved vs 15% marketplace fee</p>
        </div>
      </div>

      {/* 5. PROPER INDEXED CUSTOMER & ORDER DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="vendor-export-table-container">
        
        {/* Table Title Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Indexed Customer Ledger ({exportRows.length} Items)
            </h3>
            <span className="text-[10px] bg-blue-100 text-[#143C6B] font-bold px-2 py-0.5 rounded-full">
              {timeRange.toUpperCase()} Filter
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="text-xs font-bold text-slate-600 hover:text-[#143C6B] flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

        {exportRows.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No Orders Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              There are no orders matching your selected time range ({timeRange}) and filters. Try changing to "All Time".
            </p>
            <button
              type="button"
              onClick={() => { setTimeRange('all'); setStatusFilter('all'); setSearchQuery(''); }}
              className="bg-[#143C6B] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs"
            >
              Reset Filters to All Time
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-3">Order ID & Date</th>
                  <th className="py-3 px-3">Customer Information</th>
                  <th className="py-3 px-3">Delivery Address</th>
                  <th className="py-3 px-3">Product Title & Size</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Price (₹)</th>
                  <th className="py-3 px-3 text-right">Payout (₹)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exportRows.map((row) => (
                  <tr key={`${row.orderId}-${row.index}`} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* 1. Index No */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 bg-slate-50/50">
                      #{row.index}
                    </td>

                    {/* 2. Order ID & Date */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-extrabold text-[#143C6B]">{row.orderId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(row.orderDate).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </td>

                    {/* 3. Customer Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{row.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono font-medium">+91 {row.customerPhone}</div>
                    </td>

                    {/* 4. Delivery Address */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="text-[11px] text-slate-700 truncate font-medium" title={row.shippingAddress}>
                        {row.shippingAddress}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        {row.city}, {row.state} - {row.pincode}
                      </div>
                    </td>

                    {/* 5. Product & Variant */}
                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="font-bold text-slate-800 truncate" title={row.productTitle}>
                        {row.productTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Size/Variant: <strong className="text-slate-600">{row.variantSize}</strong>
                      </div>
                    </td>

                    {/* 6. Quantity */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {row.quantity}
                    </td>

                    {/* 7. Wholesale Unit Price */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                      ₹{row.unitPrice}
                    </td>

                    {/* 8. Net Vendor Payout */}
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                      ₹{row.netVendorPayout}
                      <span className="block text-[9px] text-emerald-600 font-normal">0% Fee</span>
                    </td>

                    {/* 9. Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        row.status === 'Delivered' || row.status === 'Delivered Early'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : row.status === 'Shipped' || row.status === 'Out for Delivery'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : row.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {row.status === 'Delivered' || row.status === 'Delivered Early' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : row.status === 'Shipped' || row.status === 'Out for Delivery' ? (
                          <Truck className="w-3 h-3" />
                        ) : row.status === 'Cancelled' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{row.status}</span>
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Showing <strong>{exportRows.length}</strong> recorded customer orders</span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>QueKart 0% Commission Direct Vendor Payout Guarantee</span>
          </span>
        </div>

      </div>

    </div>
  );
}
