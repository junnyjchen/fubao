/**
 * 商品真伪验证 API
 * GET /api/verify/{code}
 * 验证符寶认证码
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    if (!code || code.length < 8) {
      return NextResponse.json(
        { 
          valid: false, 
          message: '验证码格式不正确' 
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      return NextResponse.json({
        valid: false,
        message: '验证服务暂时不可用，请稍后再试',
      });
    }

    // 查询认证码对应的商品
    const { data: certificates } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_code,
        goods_id,
        issued_at,
        verified_at,
        status
      `)
      .eq('certificate_code', code.toUpperCase())
      .limit(1);

    if (!certificates || certificates.length === 0) {
      return NextResponse.json({
        valid: false,
        message: '未找到该认证码，请核实后重新查询',
      });
    }

    const cert = certificates[0];
    
    // 获取关联商品信息
    const { data: goods } = await supabase
      .from('goods')
      .select(`
        id,
        name,
        main_image,
        is_certified,
        merchant_id
      `)
      .eq('id', cert.goods_id)
      .eq('is_certified', 1)
      .limit(1);

    // 获取商家信息
    let merchant = null;
    if (goods && goods.length > 0 && goods[0].merchant_id) {
      const { data: merchants } = await supabase
        .from('merchants')
        .select(`
          id,
          name,
          verified_at
        `)
        .eq('id', goods[0].merchant_id)
        .eq('status', 1)
        .limit(1);
      
      merchant = merchants?.[0] || null;
    }

    if (!goods || goods.length === 0) {
      return NextResponse.json({
        valid: false,
        message: '该认证码对应的商品信息不存在或未通过认证',
        certificate: {
          code: cert.certificate_code,
          issued_at: cert.issued_at,
        },
      });
    }

    const product = goods[0];
    
    // 检查认证状态
    const isValid = cert.status === 'active' && product.is_certified === 1;
    const verifiedAt = cert.verified_at ? new Date(cert.verified_at) : null;
    const issuedAt = cert.issued_at ? new Date(cert.issued_at) : null;
    
    // 如果之前未验证过，更新验证时间
    if (!cert.verified_at) {
      await supabase
        .from('certificates')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', cert.id);
    }

    return NextResponse.json({
      valid: isValid,
      verified: !!cert.verified_at,
      certificate: {
        code: cert.certificate_code,
        issued_at: issuedAt?.toISOString() || null,
        verified_at: cert.verified_at || new Date().toISOString(),
        status: cert.status,
      },
      product: {
        id: product.id,
        name: product.name,
        image: product.main_image,
        url: `${process.env.NEXT_PUBLIC_API_URL || 'https://fubao.example.com'}/goods/${product.id}`,
      },
      merchant: merchant ? {
        id: merchant.id,
        name: merchant.name,
        verified: !!merchant.verified_at,
      } : null,
      message: isValid 
        ? '验证成功，该商品为符寶认证正品' 
        : '该认证码已失效或商品认证被撤销',
    });
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        message: error.message || '验证服务出错，请稍后再试' 
      },
      { status: 500 }
    );
  }
}
