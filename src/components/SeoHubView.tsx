import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Store, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Zap, 
  TrendingUp, 
  Home, 
  Tag, 
  Smartphone, 
  BadgePercent,
  Layers,
  Heart
} from 'lucide-react';
import { SEO_PAGES, SeoPageData } from '../data/seoPages';
import { updatePageSEO } from '../utils/seo';
import { Product } from '../types';
import Logo, { BrandLogo } from './Logo';

interface SeoHubViewProps {
  slug: string;
  products: Product[];
  onNavigate: (path: string) => void;
  onSelectProduct?: (product: Product) => void;
}

export default function SeoHubView({
  slug,
  products,
  onNavigate,
  onSelectProduct
}: SeoHubViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const pageData: SeoPageData = SEO_PAGES[slug] || SEO_PAGES['quekart-vs-meesho'];

  // Match products from live database matching the target category
  const matchingProducts = pageData.targetCategoryName
    ? products.filter(p => p.category === pageData.targetCategoryName).slice(0, 6)
    : products.slice(0, 6);

  // Dynamic SEO meta update on page mount / slug change
  useEffect(() => {
    const jsonLdData = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageData.metaTitle,
        "description": pageData.metaDescription,
        "url": `https://quekart.in/${pageData.category}/${pageData.slug}`,
        "publisher": {
          "@type": "Organization",
          "name": "QueKart",
          "legalName": "PASI E-COMMERCE SERVICES",
          "logo": "https://img.icons8.com/color/192/shopping-bag--v1.png"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://quekart.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": pageData.category.toUpperCase(),
            "item": `https://quekart.in/${pageData.category}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": pageData.title,
            "item": `https://quekart.in/${pageData.category}/${pageData.slug}`
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": pageData.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ];

    updatePageSEO({
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      keywords: pageData.keywords,
      canonicalPath: `/${pageData.category}/${pageData.slug}`,
      ogType: 'article',
      jsonLd: jsonLdData
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageData]);

  // Dynamic icon helper
  const renderIcon = (iconName: string, className: string = "w-6 h-6 text-[#143C6B]") => {
    switch (iconName) {
      case 'Factory':
      case 'Layers': return <Layers className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Truck': return <Truck className={className} />;
      case 'Tag': return <Tag className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'CheckCircle': return <CheckCircle className={className} />;
      case 'BadgePercent': return <BadgePercent className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Home': return <Home className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const allOtherPages = Object.values(SEO_PAGES).filter(p => p.slug !== pageData.slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id={`seo-page-${pageData.slug}`}>
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <BrandLogo size="md" onClick={() => onNavigate('/')} className="cursor-pointer" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/shop')}
              className="bg-[#143C6B] hover:bg-[#0B1E36] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Online</span>
            </button>

            <button
              onClick={() => onNavigate('/vendor/signup')}
              className="hidden sm:flex bg-[#FF8C00] hover:bg-[#E57E00] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>0% Commission Seller</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main SEO Article Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs font-semibold text-slate-500 flex items-center gap-2 flex-wrap">
          <button onClick={() => onNavigate('/')} className="hover:text-[#143C6B] cursor-pointer">Home</button>
          <span>/</span>
          <span className="uppercase text-slate-400 font-bold">{pageData.category}</span>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-none">{pageData.title}</span>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#07182E] via-[#0B1E36] to-[#143C6B] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden mb-8 border-2 border-[#D4AF37]/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FDE047] text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {pageData.badge}
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              {pageData.h1}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl mb-6">
              {pageData.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate(pageData.ctaPath)}
                className="bg-gradient-to-r from-[#FF8C00] to-[#E57E00] hover:brightness-110 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{pageData.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/vendor/signup')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl backdrop-blur-xs border border-white/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-[#FDE047]" />
                <span>Sell with 0% Commission</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4 Core Value Pillars / Highlights */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-5">
            Key Advantages of Choosing QueKart
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {pageData.highlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex-shrink-0">
                  {renderIcon(highlight.iconName)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                    {highlight.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {highlight.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Matching Catalog Preview */}
        {matchingProducts.length > 0 && (
          <section className="mb-10 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <span className="text-xs font-black uppercase text-[#FF8C00] tracking-wider">Live Wholesale Collection</span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Direct Factory Items Available for Order
                </h2>
              </div>

              <button
                onClick={() => onNavigate(pageData.ctaPath)}
                className="text-xs font-bold text-[#143C6B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {matchingProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(prod);
                    } else {
                      onNavigate(`/shop/product/${prod.id}`);
                    }
                  }}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-3 border border-slate-200/80 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 bg-slate-200 relative">
                    <img 
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300'} 
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-[#143C6B] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      Factory Direct
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-[#143C6B]">
                      {prod.title}
                    </p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-black text-slate-900">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{prod.originalPrice}</span>
                      )}
                      <span className="text-[10px] font-black text-emerald-600">
                        {prod.originalPrice ? `${Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF` : 'Wholesale'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`/shop/product/${prod.id}`);
                    }}
                    className="w-full bg-[#143C6B] hover:bg-[#0B1E36] text-white text-[11px] font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Order Now (COD)</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comparison Feature Table (If applicable) */}
        {pageData.comparisonTable && pageData.comparisonTable.length > 0 && (
          <section className="mb-10 bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Side-by-Side Marketplace Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Compare features, commission structures, and delivery guarantees between QueKart and alternative e-commerce platforms.
            </p>

            <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase">Parameter</th>
                    <th className="py-3 px-4 text-xs font-black text-[#143C6B] uppercase bg-blue-50/70 rounded-t-xl">
                      QueKart™ Wholesale
                    </th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase">
                      Other Aggregators
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageData.comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-xs sm:text-sm font-bold text-slate-800">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-4 text-xs sm:text-sm font-black text-[#143C6B] bg-blue-50/40">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          {row.quekart}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-500">
                        {row.competitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* In-Depth Article Content Sections */}
        <section className="mb-10 space-y-6">
          {pageData.contentSections.map((sec, idx) => (
            <article key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-3">
                {sec.heading}
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {sec.body.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        {/* Structured FAQs Section */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs" id="seo-faq-section">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-[#143C6B]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {pageData.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#143C6B] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Programmatic Internal Link Hub */}
        <section className="bg-slate-100/80 p-6 sm:p-8 rounded-3xl border border-slate-200/80 mb-10">
          <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF8C00]" />
            <span>Explore More QueKart Wholesale Direct Directories</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allOtherPages.map((otherPage) => (
              <button
                key={otherPage.slug}
                onClick={() => onNavigate(`/${otherPage.category}/${otherPage.slug}`)}
                className="text-left p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer group shadow-3xs"
              >
                <span className="text-[10px] font-black uppercase text-[#FF8C00] block mb-0.5">
                  {otherPage.category}
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#143C6B] line-clamp-2">
                  {otherPage.title}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Bottom Conversion CTA Banner */}
        <section className="bg-gradient-to-r from-[#143C6B] to-[#07182E] text-white p-6 sm:p-10 rounded-3xl text-center shadow-lg border-2 border-[#D4AF37]/30">
          <h2 className="text-xl sm:text-3xl font-black mb-3">
            Ready to Shop at Authentic Factory Wholesale Rates?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Join millions of satisfied buyers and resellers across India. Experience 100% Cash on Delivery, instant 1-tap checkout, and direct mill prices today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('/shop')}
              className="w-full sm:w-auto bg-[#FF8C00] hover:bg-[#E57E00] text-white font-black text-sm px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Enter Store & Start Shopping</span>
            </button>

            <button
              onClick={() => onNavigate('/vendor/signup')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl backdrop-blur-xs border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-[#FDE047]" />
              <span>Register as 0% Commission Vendor</span>
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 QueKart™ - Operated by PASI E-COMMERCE SERVICES (GSTIN: 06KLFPS7562K2Z8). All Rights Reserved.</p>
      </footer>
    </div>
  );
}
