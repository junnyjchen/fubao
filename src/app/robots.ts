/**
 * @fileoverview Robots.txt
 * @description 搜索引擎爬虫规则
 * @module app/robots
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT 
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT.replace(/^https?:\/\//, '')}`
    : 'https://fubao.ltd';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/user/',
          '/merchant/dashboard/',
          '/checkout',
          '/payment/',
          '/cart',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/user/', '/merchant/dashboard/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/user/', '/merchant/dashboard/'],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/api/', '/admin/', '/user/', '/merchant/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
