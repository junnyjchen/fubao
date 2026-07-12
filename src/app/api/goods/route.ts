/**
 * @fileoverview 商品列表 API
 * @module app/api/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const categoryId = searchParams.get('category_id');
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type');
    const purpose = searchParams.get('purpose');
    const locale = searchParams.get('locale') || 'zh-TW';
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['status = ?'];
    const params: unknown[] = [1];

    if (categoryId) {
      conditions.push('category_id = ?');
      params.push(parseInt(categoryId));
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (type) {
      conditions.push('purpose = ?');
      params.push(type);
    }
    if (purpose) {
      conditions.push('purpose = ?');
      params.push(purpose);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const data = await query(
      `SELECT * FROM goods ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const total = await count(
      `SELECT COUNT(*) as cnt FROM goods ${whereClause}`,
      undefined,
      params
    );

    // 如果请求了非默认语言，附加翻译
    let enrichedData = data;
    if (locale !== 'zh-TW' && data.length > 0) {
      const goodsIds = data.map((g: any) => g.id);
      const translations = await query(
        `SELECT * FROM goods_i18n WHERE goods_id IN (${goodsIds.map(() => '?').join(',')}) AND locale = ?`,
        [...goodsIds, locale]
      );

      // 附加翻译到商品
      const translationMap = new Map<number, any>();
      for (const t of translations) {
        translationMap.set(t.goods_id, t);
      }

      enrichedData = data.map((g: any) => {
        const t = translationMap.get(g.id);
        if (t) {
          return {
            ...g,
            name: t.name || g.name,
            subtitle: t.subtitle || g.subtitle,
            description: t.description || g.description,
            _original: { name: g.name, subtitle: g.subtitle, description: g.description },
            _translated_locale: locale,
          };
        }
        return { ...g, _translated_locale: null };
      });
    }

    // 转换图片URL：/api/file/xxx → /uploads/xxx
    const fixImageUrl = (url: string | null | undefined): string | null => {
      if (!url) return null;
      if (url.startsWith('/api/file/')) return url.replace('/api/file/', '/uploads/');
      return url;
    };

    const fixGoodsImages = (g: any) => ({
      ...g,
      main_image: fixImageUrl(g.main_image),
      images: Array.isArray(g.images) ? g.images.map(fixImageUrl) : g.images,
    });

    return NextResponse.json({
      success: true,
      data: enrichedData.map(fixGoodsImages),
      total,
      page,
      pageSize,
      total_pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20, total_pages: 0 });
  }
}
