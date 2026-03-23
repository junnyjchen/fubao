import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = getSupabaseClient();
    
    // 获取商户信息
    const { data: merchant, error } = await client
      .from('merchants')
      .select('*')
      .eq('id', parseInt(id))
      .eq('status', true)
      .single();

    if (error || !merchant) {
      return NextResponse.json({ error: '商户不存在' }, { status: 404 });
    }

    // 获取商户商品
    const { data: goods } = await client
      .from('goods')
      .select('id, name, main_image, price, original_price, sales, is_certified, type, purpose')
      .eq('merchant_id', merchant.id)
      .eq('status', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      data: {
        ...merchant,
        goods: goods || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取商户信息失败' },
      { status: 500 }
    );
  }
}
