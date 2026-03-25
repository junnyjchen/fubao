/**
 * @fileoverview SEO元数据配置
 * @description 网站SEO相关配置和工具函数
 * @module lib/seo
 */

import type { Metadata } from 'next';

// 网站基础信息
export const siteConfig = {
  name: '符寶網',
  description: '全球玄門文化科普交易平台，提供符箓法器交易與科普服務',
  url: 'https://fubao.ltd',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/fubaoltd',
    facebook: 'https://facebook.com/fubaoltd',
  },
  creator: '符寶網團隊',
};

// 生成页面元数据
export function generatePageMetadata(options: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}): Metadata {
  const {
    title,
    description = siteConfig.description,
    image = siteConfig.ogImage,
    url = siteConfig.url,
    keywords = [],
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
  } = options;

  const fullTitle = `${title} | ${siteConfig.name}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${siteConfig.url}${url}`;

  const defaultKeywords = [
    '符寶網',
    'fubao.ltd',
    '符箓',
    '法器',
    '玄門',
    '道教',
    '開光',
    '一物一證',
    '道觀',
    '寺廟',
    '玄學',
    'Talismans',
    'Spiritual Items',
  ];

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: [{ name: author || siteConfig.creator }],
    creator: siteConfig.creator,
    openGraph: {
      type: type as 'website' | 'article',
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'zh_TW',
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: [author || siteConfig.creator],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      creator: '@fubaoltd',
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'zh-TW': fullUrl,
        'zh-CN': `${fullUrl}?lang=zh-CN`,
        'en-US': `${fullUrl}?lang=en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// 生成商品结构化数据
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || '符寶網',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'HKD',
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: '符寶網',
      },
    },
  };
}

// 生成文章结构化数据
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '符寶網',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// 生成面包屑结构化数据
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

// 生成网站结构化数据
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
