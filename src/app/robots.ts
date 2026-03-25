/**
 * @fileoverview robots.txt配置
 * @description 生成robots.txt文件
 * @module app/robots/route
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT 
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT}`
    : 'https://fubao.ltd';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/merchant/dashboard/',
          '/user/',
          '/checkout/',
          '/payment/',
          '/api/',
          '/_next/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
