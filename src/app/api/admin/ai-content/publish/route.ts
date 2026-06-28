/**
 * @fileoverview AI内容发布API
 * @description 将AI生成的内容发布到对应的业务接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert } from '@/lib/db';

/** 百科分类映射: AI 生成值 → 前端分类 key */
const BAIKE_CATEGORY_MAP: Record<string, string> = {
  '符咒': 'fuzhou', '符籙': 'fuzhou', '符箓': 'fuzhou', 'talisman': 'fuzhou',
  '法器': 'faqi', 'ritual': 'faqi', 'instrument': 'faqi',
  '风水': 'fengshui', '風水': 'fengshui', 'fengshui': 'fengshui',
  '周易': 'zhouyi', '易經': 'zhouyi', '易经': 'zhouyi', 'iching': 'zhouyi',
  '道教': 'daojiao', 'daoism': 'daojiao', 'taoism': 'daojiao', 'culture': 'daojiao',
  '佛教': 'fojiao', 'buddhism': 'fojiao',
};

/** 新闻分类映射: AI 生成值 → 前端分类 key */
const NEWS_CATEGORY_MAP: Record<string, string> = {
  '环球': '1', '全球': '1', '国际': '1', 'global': '1',
  '行业': '2', '产业': '2', 'industry': '2',
  '活动': '3', '法会': '3', 'activity': '3',
  '互动': '4', '社区': '4', 'interaction': '4',
};

/** 根据内容智能映射百科分类 */
function mapBaikeCategory(category?: string): string {
  if (!category) return 'fuzhou';
  const lower = category.toLowerCase();
  // 精确匹配
  if (BAIKE_CATEGORY_MAP[category]) return BAIKE_CATEGORY_MAP[category];
  if (BAIKE_CATEGORY_MAP[lower]) return BAIKE_CATEGORY_MAP[lower];
  // 模糊匹配
  for (const [key, value] of Object.entries(BAIKE_CATEGORY_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return value;
  }
  return 'fuzhou'; // 默认: 符咒
}

/** 根据内容智能映射新闻分类 */
function mapNewsCategory(category?: string): string {
  if (!category) return '2'; // 默认: 行业
  const lower = category.toLowerCase();
  if (NEWS_CATEGORY_MAP[category]) return NEWS_CATEGORY_MAP[category];
  if (NEWS_CATEGORY_MAP[lower]) return NEWS_CATEGORY_MAP[lower];
  for (const [key, value] of Object.entries(NEWS_CATEGORY_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return value;
  }
  return '2'; // 默认: 行业
}

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
    fulu: 1, faqie: 2, nianzhu: 3, jingshu: 4, xunxiang: 5, other: 6,
  },
  wiki: {
    fulu: 1, daoism: 2, history: 3, practice: 4, culture: 5,
  },
  news: {
    news: 1, culture: 2, knowledge: 3, notice: 4,
  },
};

/**
 * 发布产品内容
 * goods 表列：name, subtitle, main_image, price, original_price, stock,
 *   is_certified, category_id, merchant_id, type, purpose, status, description
 * (detail 列为 migrate 新增，可能不存在)
 */
async function publishProduct(
  content: PublishRequest['content'],
  options?: PublishRequest['options']
) {
  const categoryId = categoryMapping.product[content.category || 'other'] || 6;

  // 获取第一个可用商户
  const merchant = await queryOne('SELECT id FROM merchants WHERE status = 1 LIMIT 1');
  const merchantId = merchant?.id || 1;

  // 检查 goods 表是否有 detail 列
  const detailCol = await queryOne("SHOW COLUMNS FROM goods LIKE 'detail'");
  const hasDetailCol = !!detailCol;

  const insertData: Record<string, unknown> = {
    merchant_id: merchantId,
    name: content.title,
    subtitle: content.summary.substring(0, 50),
    main_image: options?.cover_image || '',
    category_id: categoryId,
    description: content.summary,
    price: options?.price || 288,
    original_price: options?.original_price || 388,
    stock: options?.stock || 100,
    is_certified: 0,
    purpose: Array.isArray(content.tags) ? content.tags.join(',') : '',
    status: options?.status ? 1 : 0,
  };

  // detail 列存在时存完整内容，否则合并到 description
  if (hasDetailCol) {
    insertData.detail = content.content;
  } else {
    insertData.description = content.summary + '\n\n' + content.content;
  }

  const result = await insert('goods', insertData);

  const insertId = typeof result === 'number' ? result : (result as any)?.id || 0;
  if (insertId === 0) {
    throw new Error('商品发布失败，请检查数据库字段是否匹配');
  }
  return { id: insertId, type: 'product', title: content.title };
}

/**
 * 发布百科文章
 */
async function publishWiki(
  content: PublishRequest['content'],
  options?: PublishRequest['options']
) {
  // 生成 slug：标题转拼音风格 + 时间戳
  const slug = content.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();

  const result = await insert('articles', {
    title: content.title,
    slug,
    summary: content.summary,
    content: content.content,
    cover_image: options?.cover_image || '',
    category: mapBaikeCategory(content.category),
    author: '符寶網編輯部',
    tags: Array.isArray(content.tags) ? JSON.stringify(content.tags) : null,
    status: options?.status ? 1 : 0,
    view_count: 0,
    like_count: 0,
    published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });

  const insertId = typeof result === 'number' ? result : (result as any)?.id || 0;
  if (insertId === 0) {
    console.error('[publishWiki] 百科发布失败, db.insert 返回 0');
  }
  return { id: insertId, type: 'wiki', title: content.title, slug };
}

/**
 * 发布新闻
 */
async function publishNews(
  content: PublishRequest['content'],
  options?: PublishRequest['options']
) {
  // 生成 slug
  const slug = content.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();

  // 检查 news 表是否有 is_featured 列
  const featuredCol = await queryOne("SHOW COLUMNS FROM news LIKE 'is_featured'");
  const hasFeaturedCol = !!featuredCol;

  const insertData: Record<string, unknown> = {
    title: content.title,
    slug,
    summary: content.summary,
    content: content.content,
    cover_image: options?.cover_image || '',
    category: mapNewsCategory(content.category),
    author: '符寶網編輯部',
    tags: Array.isArray(content.tags) ? JSON.stringify(content.tags) : null,
    status: options?.status ? 1 : 0,
    view_count: 0,
    published_at: options?.status ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
  };

  if (hasFeaturedCol) {
    insertData.is_featured = options?.is_featured ? 1 : 0;
  }

  const result = await insert('news', insertData);

  const insertId = typeof result === 'number' ? result : (result as any)?.id || 0;
  if (insertId === 0) {
    console.error('[publishNews] 新闻发布失败, db.insert 返回 0');
  }
  if (insertId === 0) {
    throw new Error('新闻发布失败，请检查数据库字段是否匹配');
  }
  return { id: insertId, type: 'news', title: content.title, slug };
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
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
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
        return NextResponse.json({ error: '無效的內容類型' }, { status: 400 });
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
 * PUT /api/admin/ai-content/publish
 * 批量发布AI生成的内容
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items }: { items: PublishRequest[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '請提供要發佈的內容列表' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        let result;
        switch (item.type) {
          case 'product':
            result = await publishProduct(item.content, item.options);
            break;
          case 'wiki':
            result = await publishWiki(item.content, item.options);
            break;
          case 'news':
            result = await publishNews(item.content, item.options);
            break;
          default:
            errors.push({ index: i, error: '無效的內容類型' });
            continue;
        }
        results.push(result);
      } catch (err) {
        errors.push({
          index: i,
          error: err instanceof Error ? err.message : '發佈失敗',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { published: results, errors },
      message: `成功發佈 ${results.length} 條內容${errors.length > 0 ? `，${errors.length} 條失敗` : ''}`,
    });
  } catch (error) {
    console.error('批量发布失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '批量發佈失敗' },
      { status: 500 }
    );
  }
}
