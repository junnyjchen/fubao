/**
 * @fileoverview 商品详情 API
 * @description 获取单个商品详情 - MySQL 实现
 * @module app/api/goods/[id]/route
 */

import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取商品详情
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh-TW';

    // 获取商品基本信息
    const goods = await queryOne('SELECT * FROM goods WHERE id = ? AND status = 1', [parseInt(id)]);

    if (!goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 获取商户信息
    let merchant = null;
    if (goods.merchant_id) {
      merchant = await queryOne('SELECT id, name, logo, verified FROM merchants WHERE id = ?', [goods.merchant_id]);
    }

    // 获取分类信息
    let category = null;
    if (goods.category_id) {
      category = await queryOne('SELECT id, name, slug FROM categories WHERE id = ?', [goods.category_id]);
    }

    // 获取翻译（如果请求了非默认语言）
    let translatedGoods = { ...goods };
    if (locale !== 'zh-TW') {
      const translation = await queryOne(
        'SELECT * FROM goods_i18n WHERE goods_id = ? AND locale = ?',
        [parseInt(id), locale]
      );
      if (translation) {
        translatedGoods = {
          ...goods,
          name: translation.name || goods.name,
          subtitle: translation.subtitle || goods.subtitle,
          description: translation.description || goods.description,
          _original: { name: goods.name, subtitle: goods.subtitle, description: goods.description },
          _translated_locale: locale,
        };
      }
    }

    // 获取相关商品（同分类）
    let relatedGoods: unknown[] = [];
    if (goods.category_id) {
      relatedGoods = await query(
        'SELECT id, name, price, main_image, sales FROM goods WHERE category_id = ? AND id != ? AND status = 1 ORDER BY sales DESC LIMIT 4',
        [goods.category_id, parseInt(id)]
      );

      // 翻译相关商品
      if (locale !== 'zh-TW' && relatedGoods.length > 0) {
        const relatedIds = relatedGoods.map((g: any) => g.id);
        const relatedTranslations = await query(
          `SELECT * FROM goods_i18n WHERE goods_id IN (${relatedIds.map(() => '?').join(',')}) AND locale = ?`,
          [...relatedIds, locale]
        );
        const transMap = new Map<number, any>();
        for (const t of relatedTranslations) {
          transMap.set(t.goods_id, t);
        }
        relatedGoods = relatedGoods.map((g: any) => {
          const t = transMap.get(g.id);
          if (t) return { ...g, name: t.name || g.name };
          return g;
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...translatedGoods,
        merchant,
        category,
        related_goods: relatedGoods,
      },
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 });
  }
}
