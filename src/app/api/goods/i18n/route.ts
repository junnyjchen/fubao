/**
 * @fileoverview 商品多语言 API
 * @description 商品国际化翻译的 CRUD
 * @module app/api/goods/i18n/route
 */

import { NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove } from '@/lib/db';

// 支持的语言
const SUPPORTED_LOCALES = ['zh-TW', 'en', 'ja', 'ko', 'zh-CN'];

// GET: 获取商品翻译列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goods_id');
    const locale = searchParams.get('locale');

    if (goodsId) {
      // 获取指定商品的翻译
      let translations;
      if (locale) {
        translations = await queryOne(
          'SELECT * FROM goods_i18n WHERE goods_id = ? AND locale = ?',
          [parseInt(goodsId), locale]
        );
      } else {
        translations = await query(
          'SELECT * FROM goods_i18n WHERE goods_id = ?',
          [parseInt(goodsId)]
        );
      }
      return NextResponse.json({ success: true, data: translations });
    }

    // 获取所有翻译
    const translations = await query('SELECT * FROM goods_i18n ORDER BY goods_id, locale');
    return NextResponse.json({ success: true, data: translations });
  } catch (error: any) {
    console.error('获取商品翻译失败:', error);
    return NextResponse.json({ error: '獲取商品翻譯失敗' }, { status: 500 });
  }
}

// POST: 创建或更新商品翻译
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goods_id, locale, name, subtitle, description } = body;

    if (!goods_id || !locale) {
      return NextResponse.json({ error: '缺少商品ID或語言代碼' }, { status: 400 });
    }

    if (!SUPPORTED_LOCALES.includes(locale)) {
      return NextResponse.json({ error: `不支持的語言: ${locale}，支持: ${SUPPORTED_LOCALES.join(', ')}` }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '翻譯名稱不能為空' }, { status: 400 });
    }

    // 检查是否已存在
    const existing = await queryOne(
      'SELECT * FROM goods_i18n WHERE goods_id = ? AND locale = ?',
      [goods_id, locale]
    );

    if (existing) {
      // 更新
      await update('goods_i18n', existing.id, {
        name: name.trim(),
        subtitle: subtitle?.trim() || '',
        description: description?.trim() || '',
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: '翻譯更新成功', id: existing.id });
    } else {
      // 创建
      const id = await insert('goods_i18n', {
        goods_id,
        locale,
        name: name.trim(),
        subtitle: subtitle?.trim() || '',
        description: description?.trim() || '',
      });
      return NextResponse.json({ success: true, message: '翻譯創建成功', id }, { status: 201 });
    }
  } catch (error: any) {
    console.error('保存商品翻译失败:', error);
    return NextResponse.json({ error: '保存商品翻譯失敗' }, { status: 500 });
  }
}

// PUT: 批量更新商品翻译
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { goods_id, translations } = body;

    if (!goods_id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    if (!Array.isArray(translations)) {
      return NextResponse.json({ error: 'translations 必須為數組' }, { status: 400 });
    }

    const results: any[] = [];
    for (const t of translations) {
      if (!t.locale || !t.name?.trim()) continue;

      const existing = await queryOne(
        'SELECT * FROM goods_i18n WHERE goods_id = ? AND locale = ?',
        [goods_id, t.locale]
      );

      if (existing) {
        await update('goods_i18n', existing.id, {
          name: t.name.trim(),
          subtitle: t.subtitle?.trim() || '',
          description: t.description?.trim() || '',
          updated_at: new Date().toISOString(),
        });
        results.push({ locale: t.locale, action: 'updated' });
      } else {
        await insert('goods_i18n', {
          goods_id,
          locale: t.locale,
          name: t.name.trim(),
          subtitle: t.subtitle?.trim() || '',
          description: t.description?.trim() || '',
        });
        results.push({ locale: t.locale, action: 'created' });
      }
    }

    return NextResponse.json({ success: true, message: '批量翻譯保存成功', results });
  } catch (error: any) {
    console.error('批量保存商品翻译失败:', error);
    return NextResponse.json({ error: '批量保存商品翻譯失敗' }, { status: 500 });
  }
}

// DELETE: 删除商品翻译
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const goodsId = searchParams.get('goods_id');
    const locale = searchParams.get('locale');

    if (id) {
      await remove('goods_i18n', { id: parseInt(id) });
      return NextResponse.json({ success: true, message: '翻譯已刪除' });
    }

    if (goodsId && locale) {
      await query('DELETE FROM goods_i18n WHERE goods_id = ? AND locale = ?', [parseInt(goodsId), locale]);
      return NextResponse.json({ success: true, message: '翻譯已刪除' });
    }

    if (goodsId) {
      await query('DELETE FROM goods_i18n WHERE goods_id = ?', [parseInt(goodsId)]);
      return NextResponse.json({ success: true, message: '該商品所有翻譯已刪除' });
    }

    return NextResponse.json({ error: '缺少刪除條件' }, { status: 400 });
  } catch (error: any) {
    console.error('删除商品翻译失败:', error);
    return NextResponse.json({ error: '刪除商品翻譯失敗' }, { status: 500 });
  }
}
