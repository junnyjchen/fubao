/**
 * @fileoverview 网站地图
 * @description 自动生成sitemap.xml
 * @module app/sitemap
 */

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT 
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT.replace(/^https?:\/\//, '')}`
    : 'https://fubao.ltd';

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/baike`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ai-assistant`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/distribution`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/merchant/apply`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 动态页面（商品、百科、新闻等）
  // 在实际生产环境中，这些应该从数据库获取
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // 获取商品列表
    const goodsRes = await fetch(`${baseUrl}/api/goods?limit=1000`);
    if (goodsRes.ok) {
      const goodsData = await goodsRes.json();
      if (goodsData.data) {
        goodsData.data.forEach((goods: { id: number; updated_at?: string }) => {
          dynamicPages.push({
            url: `${baseUrl}/shop/${goods.id}`,
            lastModified: goods.updated_at ? new Date(goods.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      }
    }

    // 获取百科文章
    const wikiRes = await fetch(`${baseUrl}/api/wiki/articles?limit=500`);
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.data) {
        wikiData.data.forEach((article: { id: number; slug?: string; updated_at?: string }) => {
          dynamicPages.push({
            url: `${baseUrl}/baike/${article.slug || article.id}`,
            lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        });
      }
    }

    // 获取新闻
    const newsRes = await fetch(`${baseUrl}/api/news?limit=500`);
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      if (newsData.data) {
        newsData.data.forEach((news: { id: number; slug?: string; published_at?: string }) => {
          dynamicPages.push({
            url: `${baseUrl}/news/${news.slug || news.id}`,
            lastModified: news.published_at ? new Date(news.published_at) : new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
          });
        });
      }
    }
  } catch (error) {
    console.error('生成动态sitemap失败:', error);
  }

  return [...staticPages, ...dynamicPages];
}
