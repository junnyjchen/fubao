import { NextRequest, NextResponse } from 'next/server';
import { query, update } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, direction } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    const banners = await query('SELECT * FROM banners ORDER BY sort ASC, id DESC') as any[];
    const currentIndex = banners.findIndex((b: any) => b.id === Number(id));

    if (currentIndex === -1) {
      return NextResponse.json({ success: false, error: '未找到' }, { status: 404 });
    }

    if (direction === 'up' && currentIndex > 0) {
      const current = banners[currentIndex];
      const target = banners[currentIndex - 1];
      await update('banners', { sort: target.sort || 0 }, { id: current.id });
      await update('banners', { sort: current.sort || 0 }, { id: target.id });
    } else if (direction === 'down' && currentIndex < banners.length - 1) {
      const current = banners[currentIndex];
      const target = banners[currentIndex + 1];
      await update('banners', { sort: target.sort || 0 }, { id: current.id });
      await update('banners', { sort: current.sort || 0 }, { id: target.id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[banners/sort] 失败:', error);
    return NextResponse.json({ success: false, error: '排序失败' }, { status: 500 });
  }
}
