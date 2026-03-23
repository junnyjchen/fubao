import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const purpose = searchParams.get('purpose');
  const merchantId = searchParams.get('merchant_id');
  const isHot = searchParams.get('hot') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    const client = getSupabaseClient();
    
    // 查询商品
    let query = client
      .from('goods')
      .select('*')
      .eq('status', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', parseInt(type));
    }
    if (purpose) {
      query = query.eq('purpose', purpose);
    }
    if (merchantId) {
      query = query.eq('merchant_id', parseInt(merchantId));
    }
    if (isHot) {
      query = query.order('sales', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: goods, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果有商品，查询对应的商户信息
    let merchants: Record<number, { id: number; name: string; type: number; logo: string | null; certification_level: number | null }> = {};
    
    if (goods && goods.length > 0) {
      const merchantIds = [...new Set(goods.map((g: { merchant_id: number }) => g.merchant_id))];
      const { data: merchantData } = await client
        .from('merchants')
        .select('id, name, type, logo, certification_level')
        .in('id', merchantIds);
      
      if (merchantData) {
        merchantData.forEach((m: { id: number; name: string; type: number; logo: string | null; certification_level: number | null }) => {
          merchants[m.id] = m;
        });
      }
    }

    // 组合数据
    const data = goods?.map((g: { merchant_id: number }) => ({
      ...g,
      merchants: merchants[g.merchant_id] || null
    })) || [];

    return NextResponse.json({ data, page, limit });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch goods' },
      { status: 500 }
    );
  }
}
