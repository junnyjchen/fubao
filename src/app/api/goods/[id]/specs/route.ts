import { NextRequest, NextResponse } from 'next/server';
import { query, insert, remove } from '@/lib/db';

// GET /api/goods/[id]/specs - 获取商品规格模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);
    const specs = await query(
      'SELECT * FROM goods_specs WHERE goods_id = ? ORDER BY id ASC',
      [goodsId]
    );
    return NextResponse.json({
      success: true,
      specs: (specs || []).map((s: any) => ({
        ...s,
        values: typeof s.values === 'string' ? JSON.parse(s.values) : s.values,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/goods/[id]/specs - 批量保存商品规格
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);
    const { specs } = await request.json();

    if (!Array.isArray(specs)) {
      return NextResponse.json({ error: 'specs 必须为数组' }, { status: 400 });
    }

    await query('DELETE FROM goods_specs WHERE goods_id = ?', [goodsId]);

    const results = [];
    for (const spec of specs) {
      const specId = await insert('goods_specs', {
        goods_id: goodsId,
        name: spec.name,
        values: JSON.stringify(spec.values || []),
      });
      results.push({ ...spec, id: specId });
    }

    return NextResponse.json({ success: true, specs: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
