/**
 * @fileoverview Sitemap 生成器
 * @description 自动生成 sitemap.xml
 * @module app/sitemap
 */

import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT}`
    : 'https://www.fubao.ltd';

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 添加商品页面
  try {
    const goods = await query('SELECT id, updated_at, created_at FROM goods WHERE status = ?', [1]);
    for (const item of goods as any[]) {
      routes.push({
        url: `${baseUrl}/shop/${item.id}`,
        lastModified: new Date(item.updated_at || item.created_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch (e) {
    // 忽略数据库错误
  }

  // 添加新闻页面
  try {
    const news = await query('SELECT id, slug, updated_at, created_at FROM news', []);
    for (const item of news as any[]) {
      routes.push({
        url: `${baseUrl}/news/${item.slug || item.id}`,
        lastModified: new Date(item.updated_at || item.created_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  } catch (e) {
    // 忽略数据库错误
  }

  return routes;
}
