/**
 * @fileoverview 证书查询API
 * @description 根据证书编号查询商品认证信息
 * @module app/api/certificates/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: certificateNo } = await params;

    if (!certificateNo) {
      return NextResponse.json(
        { error: '請輸入證書編號' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询证书信息
    const { data: certificate, error } = await client
      .from('certificates')
      .select(`
        certificate_no,
        issue_date,
        issued_by,
        valid_until,
        verification_count,
        last_verification,
        details,
        goods_id,
        goods:goods (
          id,
          name,
          main_image,
          category:categories (name)
        ),
        merchant:merchants (
          id,
          name,
          certification_level
        )
      `)
      .eq('certificate_no', certificateNo.toUpperCase())
      .single();

    if (error || !certificate) {
      return NextResponse.json(
        { error: '未找到該證書信息，請確認編號是否正確' },
        { status: 404 }
      );
    }

    // 更新验证次数和最后验证时间
    await client
      .from('certificates')
      .update({
        verification_count: certificate.verification_count + 1,
        last_verification: new Date().toISOString(),
      })
      .eq('certificate_no', certificateNo.toUpperCase());

    // 判断证书状态
    let status: 'valid' | 'expired' | 'invalid' = 'valid';
    if (certificate.valid_until && new Date(certificate.valid_until) < new Date()) {
      status = 'expired';
    }

    // 处理关联数据（Supabase可能返回数组）
    const goodsData = Array.isArray(certificate.goods) ? certificate.goods[0] : certificate.goods as any;
    const merchantData = Array.isArray(certificate.merchant) ? certificate.merchant[0] : certificate.merchant as any;
    const categoryData = goodsData?.category && Array.isArray(goodsData.category) 
      ? goodsData.category[0] 
      : goodsData?.category as any;

    const result = {
      certificate_no: certificate.certificate_no,
      status,
      goods: {
        id: goodsData?.id,
        name: goodsData?.name,
        image: goodsData?.main_image,
        category: categoryData?.name || '未分類',
      },
      merchant: {
        id: merchantData?.id,
        name: merchantData?.name,
        level: merchantData?.certification_level || 0,
      },
      issue_date: certificate.issue_date,
      issued_by: certificate.issued_by,
      valid_until: certificate.valid_until,
      verification_count: certificate.verification_count + 1,
      last_verification: new Date().toISOString(),
      details: certificate.details || {
        material: '未記錄',
        origin: '未記錄',
        craftsmanship: '未記錄',
        blessing: null,
        master: null,
      },
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('证书查询失败:', error);
    return NextResponse.json(
      { error: '查詢失敗，請稍後重試' },
      { status: 500 }
    );
  }
}
