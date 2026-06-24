/**
 * @fileoverview 商户审核 API - MySQL 实现
 * @module app/api/admin/merchant-applications/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, update as dbUpdate, insert as dbInsert } from '@/lib/db';

/**
 * GET - 获取商户申请列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const data = await query(
      `SELECT * FROM merchant_applications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const countResult = await queryOne(`SELECT COUNT(*) as cnt FROM merchant_applications ${whereClause}`, params);
    const total = Number(countResult?.cnt || 0);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      total_pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('获取商户申请列表失败:', error);
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20, total_pages: 0 });
  }
}

/**
 * POST - 审核商户申请
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, review_note } = body;

    if (!id || !action) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    await dbUpdate('merchant_applications', {
      status,
      review_note: review_note || null,
      reviewed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }, { id });

    // 如果审核通过，自动创建商户
    if (status === 'approved') {
      const application = await queryOne('SELECT * FROM merchant_applications WHERE id = ?', [id]);
      if (application) {
        await dbInsert('merchants', {
          name: application.name,
          type: application.type || 'individual',
          contact_name: application.contact_name,
          contact_phone: application.contact_phone,
          contact_email: application.contact_email,
          description: application.description,
          address: application.address,
          license_number: application.license_number,
          verified: 1,
          status: 1,
          user_id: application.user_id,
        });
      }
    }

    return NextResponse.json({ success: true, message: status === 'approved' ? '審核通過' : '已拒絕申請' });
  } catch (error) {
    console.error('审核商户申请失败:', error);
    return NextResponse.json({ error: '審核操作失敗' }, { status: 500 });
  }
}
