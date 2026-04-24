/**
 * @fileoverview 百科文章详情页面重定向
 * @description 重定向到新的百科文章路径 /wiki/[slug]
 * @module app/baike/[slug]/page
 */

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetail({ params }: Props) {
  const { slug } = await params;
  redirect(`/wiki/${slug}`);
}
