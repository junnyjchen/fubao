import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 生成订单号
function generateOrderNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return 'FB' + year + month + day + random;
}

// GET: 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest-user-001';
    const status = searchParams.get('status');
    const includeAll = searchParams.get('includeAll') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();
    
    // 获取总数
    let countQuery = client
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (!includeAll) {
      countQuery = countQuery.eq('user_id', userId);
    }
    
    if (status) {
      countQuery = countQuery.eq('order_status', parseInt(status));
    }

    const { count } = await countQuery;
    
    // 查询订单列表
    let query = client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeAll) {
      query = query.eq('user_id', userId);
    }
    
    if (status) {
      query = query.eq('order_status', parseInt(status));
    }

    query = query.range(offset, offset + limit - 1);

    const { data: ordersList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 获取每个订单的商品明细
    const ordersWithItems = await Promise.all(
      (ordersList || []).map(async (order: { id: number }) => {
        const { data: items } = await client
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        return { ...order, items: items || [] };
      })
    );

    return NextResponse.json({ 
      data: ordersWithItems,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
  }
}

// POST: 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId = 'guest-user-001',
      items, // [{ goodsId, quantity }]
      shippingInfo,
      remark 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '请选择要购买的商品' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取商品信息
    const goodsIds = items.map((item: { goodsId: number }) => item.goodsId);
    const { data: goodsList, error: goodsError } = await client
      .from('goods')
      .select('*')
      .in('id', goodsIds);

    if (goodsError || !goodsList || goodsList.length === 0) {
      return NextResponse.json({ error: '商品不存在' }, { status: 400 });
    }

    // 计算订单金额
    let totalAmount = 0;
    const orderItemsData: Array<{
      goodsId: number;
      goodsName: string;
      goodsImage: string | null;
      price: string;
      quantity: number;
      totalPrice: string;
    }> = [];

    for (const item of items) {
      const goodsItem = goodsList.find((g: { id: number }) => g.id === item.goodsId);
      if (!goodsItem) continue;

      const price = parseFloat(goodsItem.price);
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        goodsId: goodsItem.id,
        goodsName: goodsItem.name,
        goodsImage: goodsItem.main_image,
        price: goodsItem.price,
        quantity,
        totalPrice: itemTotal.toFixed(2),
      });
    }

    // 创建订单
    const orderNo = generateOrderNo();
    const merchantId = goodsList[0].merchant_id;

    const shippingName = shippingInfo?.name || '默認收貨人';
    const shippingPhone = shippingInfo?.phone || '13800138000';
    const shippingAddress = shippingInfo?.address || '默認地址';

    const { data: newOrder, error: orderError } = await client
      .from('orders')
      .insert({
        order_no: orderNo,
        user_id: userId,
        merchant_id: merchantId,
        total_amount: totalAmount.toFixed(2),
        pay_amount: totalAmount.toFixed(2),
        pay_status: 0,
        order_status: 0,
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        remark: remark || null,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      return NextResponse.json({ error: orderError?.message || '创建订单失败' }, { status: 500 });
    }

    // 创建订单商品明细
    const orderItemsInsert = orderItemsData.map(item => ({
      order_id: newOrder.id,
      goods_id: item.goodsId,
      goods_name: item.goodsName,
      goods_image: item.goodsImage,
      price: item.price,
      quantity: item.quantity,
      total_price: item.totalPrice,
    }));

    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItemsInsert);

    if (itemsError) {
      console.error('创建订单商品明细失败:', itemsError);
    }

    return NextResponse.json({ 
      data: { 
        orderId: newOrder.id, 
        orderNo: newOrder.order_no,
        totalAmount: newOrder.total_amount,
        payAmount: newOrder.pay_amount,
      } 
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
