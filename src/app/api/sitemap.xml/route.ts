/**
 * Sitemap API
 * GET /api/sitemap.xml
 * 生成网站地图
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
    
    const supabase = await createClient();
    
    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      // 返回默认 sitemap
      return generateDefaultSitemap(baseUrl);
    }

    // 获取所有商品
    const { data: goods } = await supabase
      .from('goods')
      .select('id, updated_at')
      .eq('status', 1)
      .order('updated_at', { ascending: false })
      .limit(1000);

    // 获取所有文章
    const { data: articles } = await supabase
      .from('articles')
      .select('id, updated_at')
      .eq('status', 1)
      .order('updated_at', { ascending: false })
      .limit(500);

    // 生成 sitemap XML
    const xml = generateSitemap(baseUrl, goods, articles);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return generateDefaultSitemap(
      process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com'
    );
  }
}

function generateSitemap(baseUrl: string, goods: any[] = [], articles: any[] = []) {
  const now = new Date().toISOString();
  
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/goods', priority: '0.9', changefreq: 'daily' },
    { url: '/articles', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' },
  ];

  let urls = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  // 添加商品页面
  if (goods && goods.length > 0) {
    const goodsUrls = goods.map(item => `
  <url>
    <loc>${baseUrl}/goods/${item.id}</loc>
    <lastmod>${item.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
    urls += goodsUrls;
  }

  // 添加文章页面
  if (articles && articles.length > 0) {
    const articleUrls = articles.map(item => `
  <url>
    <loc>${baseUrl}/articles/${item.id}</loc>
    <lastmod>${item.updated_at || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');
    urls += articleUrls;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateDefaultSitemap(baseUrl: string) {
  const now = new Date().toISOString();
  
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/goods', priority: '0.9', changefreq: 'daily' },
    { url: '/articles', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' },
  ];

  const urls = pages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
