/**
 * @fileoverview 商户证书 API
 * @description 获取和管理商户的认证证书
 * @module app/api/merchant/certificates/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取商户证书列表
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 获取 token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 验证 token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const userId = payload.userId;

    // 获取用户的商户ID
    const { data: user } = await client
      .from('users')
      .select('merchant_id')
      .eq('id', userId)
      .single();

    if (!user?.merchant_id) {
      return NextResponse.json({ error: '您還未開通店鋪' }, { status: 400 });
    }

    const merchantId = user.merchant_id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 构建查询
    let query = client
      .from('certificates')
      .select('*', { count: 'exact' })
      .eq('merchant_id', merchantId);

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', parseInt(status));
    }

    // 关键字搜索
    if (keyword && keyword.trim()) {
      query = query.or(`cert_no.ilike.%${keyword.trim()}%,goods_name.ilike.%${keyword.trim()}%`);
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: certificates, error, count } = await query;

    if (error) {
      // 如果表不存在，返回空数组
      if (error.code === '42P01') {
        return NextResponse.json({ data: [], total: 0 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 统计各状态数量
    const stats = {
      total: count || 0,
      pending: 0,
      bound: 0,
      invalid: 0,
    };

    if (certificates) {
      certificates.forEach(cert => {
        if (cert.status === 0) stats.pending++;
        else if (cert.status === 1) stats.bound++;
        else if (cert.status === 2) stats.invalid++;
      });
    }

    return NextResponse.json({
      data: certificates || [],
      total: count || 0,
      page,
      limit,
      stats,
    });
  } catch (error) {
    console.error('获取证书列表失败:', error);
    return NextResponse.json({ error: '獲取證書列表失敗' }, { status: 500 });
  }
}

/**
 * 创建新证书
 */
export async function POST(request: NextRequest) {
  try {
    // 从 Cookie 获取 token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 验证 token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const userId = payload.userId;

    // 获取用户的商户ID
    const { data: user } = await client
      .from('users')
      .select('merchant_id')
      .eq('id', userId)
      .single();

    if (!user?.merchant_id) {
      return NextResponse.json({ error: '您還未開通店鋪' }, { status: 400 });
    }

    const body = await request.json();
    const { goods_id, cert_type } = body;

    if (!goods_id) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    if (!cert_type) {
      return NextResponse.json({ error: '請選擇證書類型' }, { status: 400 });
    }

    // 获取商品信息
    const { data: goods, error: goodsError } = await client
      .from('goods')
      .select('id, name')
      .eq('id', goods_id)
      .eq('merchant_id', user.merchant_id)
      .single();

    if (goodsError || !goods) {
      return NextResponse.json({ error: '商品不存在或無權限' }, { status: 404 });
    }

    // 生成证书编号
    const year = new Date().getFullYear();
    const { count } = await client
      .from('certificates')
      .select('*', { count: 'exact', head: true });
    
    const certNo = `CERT-${year}-${String((count || 0) + 1).padStart(6, '0')}`;

    // 创建证书
    const { data: certificate, error: createError } = await client
      .from('certificates')
      .insert({
        cert_no: certNo,
        merchant_id: user.merchant_id,
        goods_id,
        goods_name: goods.name,
        cert_type,
        issue_date: new Date().toISOString().split('T')[0],
        issuer: '符寶網', // TODO: 从商户信息获取
        status: 0, // 待绑定
        verify_url: `https://fubao.ltd/cert/${certNo}`,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('创建证书失败:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: '證書創建成功',
      data: certificate,
    });
  } catch (error) {
    console.error('创建证书失败:', error);
    return NextResponse.json({ error: '創建證書失敗' }, { status: 500 });
  }
}
