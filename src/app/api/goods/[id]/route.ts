import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = getSupabaseClient();
    
    // 获取商品信息
    const { data: goods, error } = await client
      .from('goods')
      .select('*')
      .eq('id', parseInt(id))
      .eq('status', true)
      .single();

    if (error || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 获取商户信息
    const { data: merchant } = await client
      .from('merchants')
      .select('id, name, type, logo, cover, description, certification_level, rating, total_sales, city, province')
      .eq('id', goods.merchant_id)
      .single();

    // 获取认证证书
    let certificate = null;
    if (goods.is_certified) {
      const { data: certData } = await client
        .from('certificates')
        .select('*')
        .eq('goods_id', goods.id)
        .single();
      certificate = certData;
    }

    // 获取商品评价
    const { data: reviews } = await client
      .from('reviews')
      .select('*')
      .eq('goods_id', goods.id)
      .eq('status', true)
      .order('created_at', { ascending: false })
      .limit(10);

    // 获取相关商品
    const { data: relatedGoods } = await client
      .from('goods')
      .select('id, name, main_image, price, sales, is_certified')
      .eq('merchant_id', goods.merchant_id)
      .eq('status', true)
      .neq('id', goods.id)
      .limit(4);

    return NextResponse.json({
      data: {
        ...goods,
        merchant,
        certificate,
        reviews: reviews || [],
        relatedGoods: relatedGoods || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取商品信息失败' },
      { status: 500 }
    );
  }
}
