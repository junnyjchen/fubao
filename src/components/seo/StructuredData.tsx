/**
 * @fileoverview 结构化数据组件
 * @description 提供 Schema.org 结构化数据支持
 * @module components/seo/StructuredData
 */

import { Metadata } from 'next';

/**
 * 产品结构化数据
 */
interface ProductSchemaProps {
  product: {
    id: number | string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    currency?: string;
    brand?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: {
      average: number;
      count: number;
    };
    category?: string;
    sku?: string;
    url?: string;
  };
}

/**
 * 产品 JSON-LD 结构化数据
 */
export function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `product-${product.id}`,
    name: product.name,
    description: product.description,
    image: product.image,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    sku: product.sku,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: product.availability 
        ? `https://schema.org/${product.availability}`
        : 'https://schema.org/InStock',
      url: product.url,
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 文章结构化数据
 */
interface ArticleSchemaProps {
  article: {
    id: number | string;
    title: string;
    description?: string;
    image?: string;
    author?: {
      name: string;
      url?: string;
    };
    datePublished?: string;
    dateModified?: string;
    category?: string;
    tags?: string[];
    url?: string;
  };
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `article-${article.id}`,
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: article.author ? {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: '符寶網',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    articleSection: article.category,
    keywords: article.tags?.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 视频结构化数据
 */
interface VideoSchemaProps {
  video: {
    id: number | string;
    title: string;
    description?: string;
    thumbnail?: string;
    duration?: string; // ISO 8601 格式，如 PT1M30S
    uploadDate?: string;
    views?: number;
    author?: {
      name: string;
      url?: string;
    };
    url?: string;
  };
}

export function VideoSchema({ video }: VideoSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `video-${video.id}`,
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail,
    duration: video.duration,
    uploadDate: video.uploadDate,
    contentUrl: video.url,
    embedUrl: `${video.url}/embed`,
    ...(video.views && { viewCount: video.views }),
    ...(video.author && {
      author: {
        '@type': 'Person',
        name: video.author.name,
        url: video.author.url,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 网站结构化数据
 */
interface WebsiteSchemaProps {
  name: string;
  description: string;
  url: string;
  searchUrl?: string;
}

export function WebsiteSchema({ name, description, url, searchUrl }: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    potentialAction: searchUrl ? {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: '符寶網',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 组织结构化数据
 */
interface OrganizationSchemaProps {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sameAs?: string[];
}

export function OrganizationSchema({ 
  name, 
  description, 
  logo, 
  url, 
  sameAs 
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    logo,
    url,
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 面包屑结构化数据
 */
interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      name: item.name,
      position: item.position,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 本地商家结构化数据
 */
interface LocalBusinessSchemaProps {
  business: {
    name: string;
    description?: string;
    logo?: string;
    image?: string;
    url?: string;
    telephone?: string;
    email?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
    openingHours?: string[];
    priceRange?: string;
    rating?: number;
    reviewCount?: number;
  };
}

export function LocalBusinessSchema({ business }: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: business.name,
    description: business.description,
    logo: business.logo,
    image: business.image,
    url: business.url,
    telephone: business.telephone,
    email: business.email,
    address: business.address ? {
      '@type': 'PostalAddress',
      ...business.address,
    } : undefined,
    geo: business.geo ? {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    } : undefined,
    openingHoursSpecification: business.openingHours?.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours,
    })),
    priceRange: business.priceRange,
    ...(business.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: business.rating,
        reviewCount: business.reviewCount,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ 结构化数据
 */
interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 商品列表结构化数据
 */
interface ItemListSchemaProps {
  items: Array<{
    position: number;
    name: string;
    url: string;
    image?: string;
    price?: number;
    currency?: string;
  }>;
}

export function ItemListSchema({ items }: ItemListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      image: item.image,
      ...(item.price && {
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: item.currency || 'USD',
        },
      }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 面包屑元数据生成器
 */
export function generateBreadcrumbMetadata(
  items: Array<{ name: string; href: string }>,
  baseUrl: string
): { title?: string; robots?: { index: boolean; follow: boolean } } {
  const breadcrumb = items.map((item, index) => ({
    name: item.name,
    url: `${baseUrl}${item.href}`,
    position: index + 1,
  }));

  return {
    title: items.map(i => i.name).join(' | '),
    robots: {
      index: false,
      follow: true,
    },
  };
}
