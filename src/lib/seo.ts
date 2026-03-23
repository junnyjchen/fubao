/**
 * @fileoverview SEO 元数据配置
 * @description 提供网站SEO元数据管理
 * @module lib/seo
 */

import { Metadata } from 'next';

/** 网站基础信息 */
export const siteConfig = {
  name: '符寶網',
  description: '全球玄門文化科普交易平台 - 符籙、法器、玄學知識',
  url: process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.ltd',
  ogImage: '/og-image.png',
  keywords: [
    '符籙',
    '法器',
    '玄門文化',
    '道教',
    '風水',
    '開光',
    '符咒',
    '護身符',
    '鎮宅符',
    '招財符',
  ],
  creator: 'Fubao Team',
  language: 'zh-TW',
};

/** 默认元数据 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'zh-TW': `${siteConfig.url}?lang=zh-TW`,
      'zh-CN': `${siteConfig.url}?lang=zh-CN`,
      en: `${siteConfig.url}?lang=en`,
    },
  },
};

/**
 * 生成页面元数据
 * @param title - 页面标题
 * @param description - 页面描述
 * @param image - 分享图片
 * @param url - 页面URL
 * @returns 元数据对象
 */
export function generateMetadata({
  title,
  description,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}): Metadata {
  return {
    title: title || siteConfig.name,
    description: description || siteConfig.description,
    openGraph: {
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      url: url ? `${siteConfig.url}${url}` : siteConfig.url,
    },
    twitter: {
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url ? `${siteConfig.url}${url}` : siteConfig.url,
    },
  };
}

/**
 * 生成商品结构化数据
 * @param product - 商品信息
 * @returns JSON-LD 结构化数据
 */
export function generateProductSchema(product: {
  id: number;
  name: string;
  description: string;
  price: string;
  currency?: string;
  availability: 'InStock' | 'OutOfStock';
  image?: string;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
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

/**
 * 生成文章结构化数据
 * @param article - 文章信息
 * @returns JSON-LD 结构化数据
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
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
      '@id': `${siteConfig.url}${article.url}`,
    },
  };
}
