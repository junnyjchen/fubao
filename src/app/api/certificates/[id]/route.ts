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
      .select('id, goods_id, certificate_no, inspection_result, issue_date, valid_until, images, issued_by, created_at')
      .eq('certificate_no', certificateNo.toUpperCase())
      .single();

    if (error || !certificate) {
      return NextResponse.json(
        { error: '未找到該證書信息，請確認編號是否正確' },
        { status: 404 }
      );
    }

    // 获取商品信息
    let goodsData = null;
    let merchantData = null;
    
    if (certificate.goods_id) {
      const { data: goods } = await client
        .from('goods')
        .select('id, name, main_image, category_id, merchant_id')
        .eq('id', certificate.goods_id)
        .single();
      
      goodsData = goods;
      
      if (goods?.merchant_id) {
        const { data: merchant } = await client
          .from('merchants')
          .select('id, name, certification_level')
          .eq('id', goods.merchant_id)
          .single();
        merchantData = merchant;
      }
    }

    // 判断证书状态
    let status: 'valid' | 'expired' | 'invalid' = 'valid';
    if (certificate.valid_until && new Date(certificate.valid_until) < new Date()) {
      status = 'expired';
    }

    const result = {
      certificate_no: certificate.certificate_no,
      status,
      goods: goodsData ? {
        id: goodsData.id,
        name: goodsData.name,
        image: goodsData.main_image,
      } : null,
      merchant: merchantData ? {
        id: merchantData.id,
        name: merchantData.name,
        level: merchantData.certification_level || 0,
      } : null,
      inspection_result: certificate.inspection_result,
      issue_date: certificate.issue_date,
      issued_by: certificate.issued_by,
      valid_until: certificate.valid_until,
      images: certificate.images,
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
