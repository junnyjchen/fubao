/**
 * @fileoverview AI内容发布API
 * @description 将AI生成的内容发布到对应的业务接口
 * @module app/api/admin/ai-content/publish/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 内容类型 */
type ContentType = 'product' | 'wiki' | 'news';

/** 发布请求 */
interface PublishRequest {
  type: ContentType;
  content: {
    title: string;
    summary: string;
    content: string;
    keywords: string[];
    metaDescription: string;
    category?: string;
    tags?: string[];
  };
  options?: {
    status?: boolean;
    is_featured?: boolean;
    price?: number;
    original_price?: number;
    stock?: number;
    cover_image?: string;
  };
}

/** 分类映射 */
const categoryMapping: Record<ContentType, Record<string, number>> = {
  product: {
    fulu: 1,      // 符籙
    faqie: 2,     // 法器
    nianzhu: 3,   // 唸珠
    jingshu: 4,   // 經書
    xunxiang: 5,  // 熏香
    other: 6,     // 其他
  },
  wiki: {
    fulu: 1,      // 符籙知識
    daoism: 2,    // 道教文化
    history: 3,   // 歷史典故
    practice: 4,  // 修行入門
    culture: 5,   // 民俗文化
  },
  news: {
    news: 1,      // 新聞動態
    culture: 2,   // 玄門文化
    knowledge: 3, // 符箓知識
    notice: 4,    // 公告通知
  },
};

/**
 * 生成URL友好的slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * 发布产品内容
 */
async function publishProduct(
  content: PublishRequest['content'],
  options?: PublishRequest['options']
) {
  const client = getSupabaseClient();
  
  // 获取分类ID
  const categoryId = categoryMapping.product[content.category || 'other'] || 6;
  
  // 获取或创建默认商户（用于AI发布的内容）
  let merchantId = 1;
  
  // 尝试获取第一个可用商户
  const { data: merchants } = await client
    .from('merchants')
    .select('id')
    .eq('status', 1)
    .limit(1);
  
  if (merchants && merchants.length > 0) {
    merchantId = merchants[0].id;
  }
  
  // 创建商品 - 只使用基本字段
  const insertData: Record<string, unknown> = {
    merchant_id: merchantId,
    name: content.title,
    subtitle: content.summary.substring(0, 50),
    category_id: categoryId,
    description: content.summary,
    price: options?.price || 288,
    original_price: options?.original_price || 388,
    stock: options?.stock || 100,
    is_certified: false,
    status: options?.status ? 1 : 0, // 0=草稿, 1=上架
  };

  const { data, error } = await client
    .from('goods')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`創建商品失敗: ${error.message}`);
  }

  return { id: data.id, type: 'product', title: content.title };
}

/**
 * 发布百科文章
 */
async function publishWiki(
  content: PublishRequest['content'],
  options?: PublishRequest['options']
) {
  const client = getSupabaseClient();
  
  // 获取分类ID
  const categoryId = categoryMapping.wiki[content.category || 'culture'] || 5;
  
  // 生成slug
  const slug = generateSlug(content.title);
  
  // 检查slug是否已存在
  const { data: existing } = await client
    .from('wiki_articles')
    .select('id')
    .eq('slug', slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
  
  // 创建百科文章 - 只使用基本字段
  const insertData: Record<string, unknown> = {
    title: content.title,
    slug: finalSlug,
    category_id: categoryId,
    summary: content.summary,
    content: content.content,
    author: '符寶網編輯部',
  };

  // 可选字段
  if (options?.cover_image) {
    insertData.cover_image = options.cover_image;
  }

  const { data, error } = await client
    .from('wiki_articles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`創建百科文章失敗: ${error.message}`);
  }

  return { id: data.id, type: 'wiki', title: content.title, slug: finalSlug };
}

/**
 * 发布新闻
 */
async function publishNews(
  content: PublishRequest['content'],
  options?: PublishRequest['options']
) {
  const client = getSupabaseClient();
  
  // 创建新闻
  const { data, error } = await client
    .from('news')
    .insert({
      title: content.title,
      summary: content.summary,
      content: content.content,
      cover: options?.cover_image || null,
      is_featured: options?.is_featured ?? false,
      status: options?.status ?? false,
      views: 0,
      published_at: options?.status ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`創建新聞失敗: ${error.message}`);
  }

  return { id: data.id, type: 'news', title: content.title };
}

/**
 * POST /api/admin/ai-content/publish
 * 发布AI生成的内容
 */
export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json();
    const { type, content, options } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    if (!content.title || !content.summary || !content.content) {
      return NextResponse.json(
        { error: '內容不完整，請確保包含標題、摘要和正文' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'product':
        result = await publishProduct(content, options);
        break;
      case 'wiki':
        result = await publishWiki(content, options);
        break;
      case 'news':
        result = await publishNews(content, options);
        break;
      default:
        return NextResponse.json(
          { error: '無效的內容類型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: '內容發佈成功',
    });
  } catch (error) {
    console.error('发布内容失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '發佈失敗' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-content/publish/batch
 * 批量发布AI生成的内容
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items }: { items: PublishRequest[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '請提供要發佈的內容列表' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { type, content, options } = item;
        
        let result;
        switch (type) {
          case 'product':
            result = await publishProduct(content, options);
            break;
          case 'wiki':
            result = await publishWiki(content, options);
            break;
          case 'news':
            result = await publishNews(content, options);
            break;
          default:
            throw new Error('無效的內容類型');
        }
        
        results.push(result);
      } catch (error) {
        errors.push({
          title: item.content?.title || '未知',
          error: error instanceof Error ? error.message : '發佈失敗',
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      successCount: results.length,
      failCount: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('批量发布失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '批量發佈失敗' },
      { status: 500 }
    );
  }
}
