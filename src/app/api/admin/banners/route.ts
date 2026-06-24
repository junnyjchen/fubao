import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const banner = await queryOne('SELECT * FROM banners WHERE id = ?', [id]);
      return NextResponse.json({ success: true, banner });
    }

    const banners = await query('SELECT * FROM banners ORDER BY sort ASC, id DESC');
    return NextResponse.json({ success: true, banners: Array.isArray(banners) ? banners : [] });
  } catch (error) {
    console.error('[banners] GET 失败:', error);
    return NextResponse.json({ success: true, banners: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image, link, position, sort, status, start_date, end_date } = body;

    const id = await insert('banners', {
      title: title || '',
      image: image || '',
      link: link || '',
      position: position || 'home',
      sort: sort || 0,
      status: status ? 1 : 0,
      start_date: start_date || null,
      end_date: end_date || null,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[banners] POST 失败:', error);
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.sort !== undefined) updateData.sort = data.sort;
    if (data.status !== undefined) updateData.status = data.status ? 1 : 0;
    if (data.start_date !== undefined) updateData.start_date = data.start_date || null;
    if (data.end_date !== undefined) updateData.end_date = data.end_date || null;

    await update('banners', updateData, { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[banners] PUT 失败:', error);
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    await remove('banners', { id: Number(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[banners] DELETE 失败:', error);
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
