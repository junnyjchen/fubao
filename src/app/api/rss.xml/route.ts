/**
 * RSS Feed API
 * GET /api/rss.xml
 * 生成文章 RSS 订阅源
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com';
    const siteName = '符寶網';
    const siteDescription = '全球玄門文化科普交易平台';
    
    const supabase = await createClient();
    
    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      return generateDefaultRSS(baseUrl, siteName, siteDescription);
    }

    // 获取最新文章
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        summary,
        content,
        cover_image,
        author,
        views,
        likes,
        published_at,
        created_at
      `)
      .eq('status', 1)
      .order('published_at', { ascending: false })
      .limit(20);

    const now = new Date().toISOString();
    const pubDate = articles?.[0]?.published_at || now;

    const items = articles?.map(article => {
      const articleUrl = `${baseUrl}/articles/${article.id}`;
      const articleDate = article.published_at || article.created_at || now;
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.summary || ''}]]></description>
      <content:encoded><![CDATA[${article.content || article.summary || ''}]]></content:encoded>
      <author>${article.author || '符寶網'}</author>
      <pubDate>${new Date(articleDate).toUTCString()}</pubDate>
      ${article.cover_image ? `<enclosure url="${article.cover_image}" type="image/jpeg" length="0"/>` : ''}
    </item>`;
    }).join('') || '';

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date(pubDate).toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>${siteName}</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('RSS error:', error);
    return generateDefaultRSS(
      process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com',
      '符寶網',
      '全球玄門文化科普交易平台'
    );
  }
}

function generateDefaultRSS(baseUrl: string, siteName: string, siteDescription: string) {
  const now = new Date().toISOString();
  
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date(now).toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>欢迎访问符寶網</title>
      <link>${baseUrl}</link>
      <description>全球玄門文化科普交易平台，提供优质的玄學文化商品和服务。</description>
      <pubDate>${new Date(now).toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
