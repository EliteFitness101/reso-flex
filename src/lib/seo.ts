/**
 * SEO Utilities for RESOFLEX™ SOVEREIGN OS
 */

export interface SEOMetaTags {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'product' | 'article';
  author?: string;
  keywords?: string[];
}

/**
 * Update meta tags dynamically
 */
export function updateMetaTags(tags: SEOMetaTags): void {
  if (typeof document === 'undefined') return;

  // Title
  if (tags.title) {
    document.title = tags.title;
    updateMetaTag('og:title', tags.title);
    updateMetaTag('twitter:title', tags.title);
  }

  // Description
  if (tags.description) {
    updateMetaTag('description', tags.description);
    updateMetaTag('og:description', tags.description);
    updateMetaTag('twitter:description', tags.description);
  }

  // Image
  if (tags.image) {
    updateMetaTag('og:image', tags.image);
    updateMetaTag('twitter:image', tags.image);
  }

  // URL
  if (tags.url) {
    updateMetaTag('og:url', tags.url);
    updateMetaTag('canonical', tags.url, 'link');
  }

  // Type
  if (tags.type) {
    updateMetaTag('og:type', tags.type);
  }

  // Author
  if (tags.author) {
    updateMetaTag('author', tags.author);
  }

  // Keywords
  if (tags.keywords && tags.keywords.length > 0) {
    updateMetaTag('keywords', tags.keywords.join(', '));
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(
  name: string,
  content: string,
  tagType: 'meta' | 'link' = 'meta'
): void {
  if (typeof document === 'undefined') return;

  if (tagType === 'meta') {
    let element = document.querySelector(`meta[property="${name}"]`) ||
                  document.querySelector(`meta[name="${name}"]`);

    if (!element) {
      element = document.createElement('meta');
      const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
      if (isProperty) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  } else if (tagType === 'link') {
    let element = document.querySelector(`link[rel="${name}"]`);

    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', name);
      document.head.appendChild(element);
    }

    element.setAttribute('href', content);
  }
}

/**
 * Generate structured data (JSON-LD) for products
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  image?: string;
  url: string;
  rating?: number;
  ratingCount?: number;
}): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'NGN',
      price: (product.price / 100).toString(), // Convert from kobo
      availability: 'https://schema.org/InStock',
    },
  };

  if (product.rating && product.ratingCount) {
    Object.assign(schema, {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        ratingCount: product.ratingCount,
      },
    });
  }

  return JSON.stringify(schema);
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ResoFlex Elite',
    url: 'https://resofit.fit',
    logo: 'https://resofit.fit/logo.png',
    description:
      'Premium wellness solutions and fitness infrastructure for Nigeria. Conversion-optimized products with WhatsApp support.',
    sameAs: [
      'https://facebook.com/resoflexelite',
      'https://instagram.com/resoflexelite',
      'https://twitter.com/resoflexelite',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+234-813-225-5842',
      email: 'support@resofit.fit',
    },
    areaServed: 'NG',
  };

  return JSON.stringify(schema);
}

/**
 * Insert JSON-LD schema into head
 */
export function insertSchema(schema: string, id?: string): void {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  if (id) {
    script.id = id;
  }
  script.textContent = schema;

  // Remove existing schema with same ID if updating
  if (id) {
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
  }

  document.head.appendChild(script);
}

/**
 * Generate Open Graph image URL for social sharing
 */
export function generateOGImageUrl(product: {
  name: string;
  price: number;
}): string {
  const encoded = encodeURIComponent(
    `${product.name} - ₦${(product.price / 100).toLocaleString()}`
  );
  return `https://og.resofit.fit/api/og?title=${encoded}`;
}

/**
 * Canonical URL for preventing duplicate content
 */
export function setCanonicalUrl(url: string): void {
  updateMetaTag('canonical', url, 'link');
}

/**
 * Robots meta tag for indexing control
 */
export function setRobotsTag(indexing: boolean, follow: boolean): void {
  const content = [indexing ? 'index' : 'noindex', follow ? 'follow' : 'nofollow'].join(', ');
  updateMetaTag('robots', content);
}

/**
 * Viewport settings for mobile optimization
 */
export function setViewportTag(): void {
  updateMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
}
