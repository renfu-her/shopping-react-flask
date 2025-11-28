import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  structuredData?: object;
}

// Helper function to update or create meta tag
const updateMetaTag = (selector: string, attribute: string, value: string) => {
  if (typeof document === 'undefined') return;
  
  let element = document.querySelector(selector) as HTMLElement;
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[name="')) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) element.setAttribute('name', name);
    } else if (selector.startsWith('meta[property="')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) element.setAttribute('property', property);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

// Helper function to update or create link tag
const updateLinkTag = (rel: string, href: string) => {
  if (typeof document === 'undefined') return;
  
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

// Helper function to update or create script tag for JSON-LD
const updateStructuredData = (data: object) => {
  if (typeof document === 'undefined') return;
  
  // Remove existing structured data scripts
  const existing = document.querySelectorAll('script[type="application/ld+json"]');
  existing.forEach(el => el.remove());
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const SEO: React.FC<SEOProps> = ({
  title = 'Lumina Shop - Modern AI-Enhanced E-commerce',
  description = 'A modern, AI-enhanced e-commerce experience featuring a complete shopping flow from authentication to checkout, with an integrated Gemini AI shopping assistant.',
  keywords = 'e-commerce, shopping, AI assistant, online store, products, Lumina Shop',
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  siteName = 'Lumina Shop',
  locale = 'en_US',
  structuredData,
}) => {
  const fullTitle = title.includes('Lumina Shop') ? title : `${title} | Lumina Shop`;
  const fullImageUrl = image.startsWith('http') ? image : `${typeof window !== 'undefined' ? window.location.origin : ''}${image}`;
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Update title
    document.title = fullTitle;

    // Primary Meta Tags
    updateMetaTag('meta[name="title"]', 'content', fullTitle);
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="author"]', 'content', 'Lumina Shop');
    updateMetaTag('meta[name="robots"]', 'content', 'index, follow');
    updateMetaTag('meta[name="language"]', 'content', 'English');
    updateMetaTag('meta[name="revisit-after"]', 'content', '7 days');

    // Open Graph / Facebook
    updateMetaTag('meta[property="og:type"]', 'content', type);
    updateMetaTag('meta[property="og:url"]', 'content', fullUrl);
    updateMetaTag('meta[property="og:title"]', 'content', fullTitle);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:image"]', 'content', fullImageUrl);
    updateMetaTag('meta[property="og:site_name"]', 'content', siteName);
    updateMetaTag('meta[property="og:locale"]', 'content', locale);

    // Twitter
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:url"]', 'content', fullUrl);
    updateMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:image"]', 'content', fullImageUrl);

    // Additional Meta Tags
    updateMetaTag('meta[name="theme-color"]', 'content', '#4f46e5');
    updateMetaTag('meta[name="apple-mobile-web-app-capable"]', 'content', 'yes');
    updateMetaTag('meta[name="apple-mobile-web-app-status-bar-style"]', 'content', 'black-translucent');
    updateMetaTag('meta[name="apple-mobile-web-app-title"]', 'content', 'Lumina Shop');

    // Canonical URL
    updateLinkTag('canonical', fullUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      updateStructuredData(structuredData);
    }
  }, [fullTitle, description, keywords, fullImageUrl, fullUrl, type, siteName, locale, structuredData]);

  // This component doesn't render anything
  return null;
};
