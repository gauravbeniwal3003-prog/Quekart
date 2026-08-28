/**
 * QueKart Advanced Client-Side SEO Engine
 * Dynamically updates document title, meta tags, OpenGraph, Twitter Cards,
 * canonical links, and Schema.org JSON-LD structured data for 100% Googlebot indexability.
 */

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
}

const DEFAULT_TITLE = "QueKart™ - India's #1 Direct Factory Wholesale Online Shopping App & Lowest Price Marketplace";
const DEFAULT_DESC = "QueKart is India's premier wholesale e-commerce platform offering direct manufacturer prices on Sarees, Kurtis, Electronics, Home Decor & Footwear. Enjoy Free Delivery, Cash on Delivery (COD), and 0% Commission for Verified Sellers. Top Alternative to Meesho, Flipkart & Amazon.";
const DEFAULT_KEYWORDS = "QueKart, Quekart app, quekart online shopping, quekart wholesale, quekart seller, meesho alternative, flipkart alternative, amazon alternative, cheap online shopping india, wholesale sarees online, surat wholesale market online, jaipur kurti wholesale, direct factory price shopping, 0 commission vendor marketplace, cod shopping app india, pasi ecommerce services";
const DEFAULT_IMAGE = "https://img.icons8.com/color/512/shopping-bag--v1.png";

export function updatePageSEO(config: Partial<SeoConfig>) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  const pageTitle = config.title ? `${config.title} | QueKart` : DEFAULT_TITLE;
  document.title = pageTitle;

  // 2. Helper to set or create meta tag
  const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Standard Meta
  setMetaTag('name', 'description', config.description || DEFAULT_DESC);
  setMetaTag('name', 'keywords', config.keywords || DEFAULT_KEYWORDS);
  setMetaTag('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMetaTag('name', 'author', 'PASI E-COMMERCE SERVICES');

  // 4. Open Graph
  setMetaTag('property', 'og:site_name', 'QueKart');
  setMetaTag('property', 'og:title', config.title || DEFAULT_TITLE);
  setMetaTag('property', 'og:description', config.description || DEFAULT_DESC);
  setMetaTag('property', 'og:image', config.ogImage || DEFAULT_IMAGE);
  setMetaTag('property', 'og:type', config.ogType || 'website');
  
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://quekart.in';
  const canonicalUrl = config.canonicalUrl
    ? config.canonicalUrl
    : config.canonicalPath 
    ? `${currentOrigin}${config.canonicalPath.startsWith('/') ? config.canonicalPath : '/' + config.canonicalPath}`
    : (typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://quekart.in');
    
  setMetaTag('property', 'og:url', canonicalUrl);

  // 5. Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', config.title || DEFAULT_TITLE);
  setMetaTag('name', 'twitter:description', config.description || DEFAULT_DESC);
  setMetaTag('name', 'twitter:image', config.ogImage || DEFAULT_IMAGE);

  // 6. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 7. Dynamic JSON-LD structured data injection
  const schemaPayload = config.structuredData || config.jsonLd;
  let jsonLdEl = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
  if (schemaPayload) {
    if (!jsonLdEl) {
      jsonLdEl = document.createElement('script');
      jsonLdEl.setAttribute('type', 'application/ld+json');
      jsonLdEl.setAttribute('id', 'dynamic-seo-jsonld');
      document.head.appendChild(jsonLdEl);
    }
    jsonLdEl.textContent = JSON.stringify(schemaPayload);
  } else if (jsonLdEl) {
    jsonLdEl.remove();
  }
}
