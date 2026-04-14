/**
 * SEO 工具函数
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  schema?: Record<string, any>;
}

/**
 * 生成完整的 meta 标签配置
 */
export function generateMetadata(config: SEOMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords || '符寶,玄學,文化,商品,道教科普',
    
    // Open Graph
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.url || baseUrl,
      siteName: '符寶網',
      images: [
        {
          url: config.image || defaultImage,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'zh_CN',
      type: config.type || 'website',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [config.image || defaultImage],
    },
    
    // 额外 meta
    other: {
      'article:published_time': config.publishedAt || '',
      'article:modified_time': config.modifiedAt || '',
      'article:author': config.author || '符寶網',
    },
  };
}

/**
 * 生成 JSON-LD 结构化数据
 */
export function generateJsonLd(config: {
  type: 'website' | 'article' | 'product' | 'organization';
  data: Record<string, any>;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
  
  const schemas: Record<string, any> = {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '符寶網',
      description: '全球玄門文化科普交易平台',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '符寶網',
      description: '全球玄門文化科普交易平台',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        'https://weibo.com/fubao',
        'https://twitter.com/fubao',
      ],
    },
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: config.data.title,
      description: config.data.summary || config.data.description,
      image: config.data.image || config.data.coverImage,
      author: {
        '@type': 'Person',
        name: config.data.author || '符寶網',
      },
      publisher: {
        '@type': 'Organization',
        name: '符寶網',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: config.data.publishedAt,
      dateModified: config.data.modifiedAt || config.data.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': config.data.url || baseUrl,
      },
    },
    product: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: config.data.name,
      description: config.data.description || config.data.subtitle,
      image: config.data.image || config.data.mainImage,
      brand: {
        '@type': 'Brand',
        name: config.data.brand || '符寶網认证',
      },
      offers: {
        '@type': 'Offer',
        price: config.data.price || '0',
        priceCurrency: 'CNY',
        availability: config.data.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: config.data.merchantName || '符寶網商家',
        },
      },
      aggregateRating: config.data.rating ? {
        '@type': 'AggregateRating',
        ratingValue: config.data.rating,
        reviewCount: config.data.reviewCount || 0,
      } : undefined,
    },
  };

  const schema = schemas[config.type];
  if (!schema) {
    return '';
  }

  return JSON.stringify(schema);
}

/**
 * 生成面包屑结构化数据
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
}

/**
 * 生成 FAQ 结构化数据
 */
export function generateFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
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

  return JSON.stringify(schema);
}

/**
 * 生成商品列表结构化数据
 */
export function generateProductListJsonLd(products: Array<{
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '符寶商品列表',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/goods/${product.id}`,
      name: product.name,
      image: product.image,
      description: product.description,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'CNY',
      },
    })),
  };

  return JSON.stringify(schema);
}

/**
 * URL 规范化
 */
export function normalizeUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
  
  // 移除多余的斜杠
  const normalizedPath = path.replace(/\/+/g, '/').replace(/\/$/, '');
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * 生成规范的 title
 */
export function generateTitle(title: string, suffix = '符寶網'): string {
  if (!title) return suffix;
  return `${title} - ${suffix}`;
}

/**
 * 生成规范的 description
 */
export function generateDescription(description: string, maxLength = 160): string {
  if (!description) {
    return '符寶網是全球玄門文化科普交易平台，提供优质的玄學文化商品和服务。';
  }
  
  // 移除 HTML 标签
  const plainText = description.replace(/<[^>]*>/g, '');
  
  // 截断
  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength - 3) + '...';
  }
  
  return plainText;
}
