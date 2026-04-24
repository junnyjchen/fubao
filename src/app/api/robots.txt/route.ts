/**
 * Robots.txt API
 * GET /api/robots.txt
 * 生成 robots.txt 文件
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
  
  const robots = `# 符寶網 Robots.txt
# https://fubao.example.com/robots.txt

User-agent: *
Allow: /
Allow: /goods/
Allow: /articles/
Allow: /api/

# Disallow admin paths
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /api/addresses
Disallow: /api/cart
Disallow: /api/favorites
Disallow: /api/orders
Disallow: /api/notifications
Disallow: /api/coupons/

# Sitemap
Sitemap: ${baseUrl}/api/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /goods/
Allow: /articles/
Crawl-delay: 0

User-agent: Bingbot
Allow: /goods/
Allow: /articles/
Crawl-delay: 1

User-agent: YandexBot
Allow: /goods/
Allow: /articles/
Crawl-delay: 1`;

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
