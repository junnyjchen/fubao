/**
 * @fileoverview Sitemap 生成器
 * @description 自动生成 sitemap.xml
 * @module app/sitemap
 */

import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/storage/database/supabase-server';

/**
 * Sitemap URL 配置
 */
interface SitemapUrl {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * 默认变更频率
 */
const DEFAULT_CHANGE_FREQUENCY: SitemapUrl['changeFrequency'] = 'weekly';

/**
 * 生成基础 sitemap
 */
function generateBaseSitemap(baseUrl: string): SitemapUrl[] {
  const routes: SitemapUrl[] = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/shop`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/news`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${baseUrl}/wiki`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/videos`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${baseUrl}/categories`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/search`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ];

  return routes;
}

/**
 * 生成商品 sitemap
 */
async function generateGoodsSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: goods } = await supabase
      .from('goods')
      .select('id, slug, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(10000);

    if (!goods) return [];

    return goods.map((item) => ({
      url: `${baseUrl}/shop/${item.slug || item.id}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating goods sitemap:', error);
    return [];
  }
}

/**
 * 生成文章 sitemap
 */
async function generateArticlesSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: articles } = await supabase
      .from('articles')
      .select('id, slug, category_id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (!articles) return [];

    return articles.map((item) => ({
      url: `${baseUrl}/news/${item.slug || item.id}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating articles sitemap:', error);
    return [];
  }
}

/**
 * 生成视频 sitemap
 */
async function generateVideosSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: videos } = await supabase
      .from('videos')
      .select('id, slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(2000);

    if (!videos) return [];

    return videos.map((item) => ({
      url: `${baseUrl}/video/${item.slug || item.id}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating videos sitemap:', error);
    return [];
  }
}

/**
 * 生成百科 sitemap
 */
async function generateWikiSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: wiki } = await supabase
      .from('wiki_articles')
      .select('id, slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(2000);

    if (!wiki) return [];

    return wiki.map((item) => ({
      url: `${baseUrl}/wiki/${item.slug || item.id}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating wiki sitemap:', error);
    return [];
  }
}

/**
 * 生成分类 sitemap
 */
async function generateCategoriesSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('status', 'active')
      .limit(100);

    if (!categories) return [];

    return categories.map((item) => ({
      url: `${baseUrl}/categories/${item.slug || item.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
    return [];
  }
}

/**
 * 生成 robots.txt
 */
export async function generateRobotsTxt(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fubao.example.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/user/',
          '/checkout/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/user/',
          '/checkout/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/user/',
          '/checkout/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

/**
 * 主 sitemap 生成器
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fubao.example.com';

  // 并行获取所有数据
  const [baseRoutes, goods, articles, videos, wiki, categories] = await Promise.all([
    Promise.resolve(generateBaseSitemap(baseUrl)),
    generateGoodsSitemap(baseUrl),
    generateArticlesSitemap(baseUrl),
    generateVideosSitemap(baseUrl),
    generateWikiSitemap(baseUrl),
    generateCategoriesSitemap(baseUrl),
  ]);

  // 合并所有 URL
  return [
    ...baseRoutes,
    ...goods,
    ...articles,
    ...videos,
    ...wiki,
    ...categories,
  ];
}
