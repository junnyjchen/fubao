import { NextRequest, NextResponse } from 'next/server';
import { query, insert, update, remove } from '@/lib/db';

// GET /api/goods/[id]/skus - 获取商品SKU列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);
    const skus = await query(
      'SELECT * FROM goods_skus WHERE goods_id = ? ORDER BY id ASC',
      [goodsId]
    );
    return NextResponse.json({ success: true, skus: (skus || []).map((s: any) => ({
      ...s,
      specs: typeof s.specs === 'string' ? JSON.parse(s.specs) : s.specs,
    })) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/goods/[id]/skus - 批量保存商品SKU
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);
    const { skus } = await request.json();

    if (!Array.isArray(skus)) {
      return NextResponse.json({ error: 'skus 必须为数组' }, { status: 400 });
    }

    // 删除旧SKU
    await query('DELETE FROM goods_skus WHERE goods_id = ?', [goodsId]);

    // 批量插入新SKU
    const results = [];
    for (const sku of skus) {
      const skuId = await insert('goods_skus', {
        goods_id: goodsId,
        sku_code: sku.sku_code || `SKU-${goodsId}-${Date.now()}`,
        specs: JSON.stringify(sku.specs || {}),
        price: sku.price || 0,
        original_price: sku.original_price || 0,
        stock: sku.stock || 0,
        image: sku.image || '',
        status: sku.status ?? 1,
      });
      results.push({ ...sku, id: skuId });
    }

    // 更新商品主价格和库存
    if (skus.length > 0) {
      const minPrice = Math.min(...skus.map((s: any) => Number(s.price) || 0));
      const totalStock = skus.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);
      await update('goods', { price: minPrice, stock: totalStock }, { id: goodsId });
    }

    return NextResponse.json({ success: true, skus: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
