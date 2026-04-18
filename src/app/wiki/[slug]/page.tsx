/**
 * @fileoverview 百科文章详情页
 * @description 展示百科文章详细内容
 * @module app/wiki/[slug]/page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WikiArticlePage } from '@/components/wiki/WikiArticlePage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/wiki/articles?slug=${slug}`);
    const data = await res.json();
    
    if (data.data?.[0]) {
      const article = data.data[0];
      return {
        title: `${article.title} - 玄門百科`,
        description: article.summary || article.title,
      };
    }
  } catch (error) {
    console.error('获取文章元数据失败:', error);
  }

  return {
    title: '文章詳情 - 玄門百科',
  };
}

export default async function WikiArticlePageRoute({ params }: PageProps) {
  const { slug } = await params;
  
  return <WikiArticlePage slug={slug} />;
}
