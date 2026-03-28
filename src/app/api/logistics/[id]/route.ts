/**
 * @fileoverview 物流跟踪API
 * @description 查询物流信息
 * @module app/api/logistics/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface OrderRecord {
  id: number;
  order_no: string;
  order_status: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_time: string | null;
  receive_time: string | null;
  tracking_number: string | null;
  tracking_company: string | null;
  created_at: string;
}

/**
 * GET - 获取订单物流信息
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const client = getSupabaseClient();

    // 获取订单信息
    const { data: order, error: orderError } = await client
      .from('orders')
      .select(`
        id,
        order_no,
        order_status,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_time,
        receive_time,
        tracking_number,
        tracking_company,
        created_at
      `)
      .eq('id', parseInt(id))
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 模拟物流轨迹（实际项目中应调用物流公司API）
    const logisticsTracks = generateMockLogistics(order);

    return NextResponse.json({
      order: {
        id: order.id,
        order_no: order.order_no,
        status: order.order_status,
        tracking_number: order.tracking_number,
        tracking_company: order.tracking_company,
        shipping_name: order.shipping_name,
        shipping_phone: order.shipping_phone,
        shipping_address: order.shipping_address,
      },
      tracks: logisticsTracks,
    });
  } catch (error) {
    console.error('获取物流信息失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 生成模拟物流轨迹
 */
function generateMockLogistics(order: OrderRecord) {
  const tracks = [];
  const now = new Date();

  if (order.receive_time) {
    tracks.push({
      time: order.receive_time,
      status: '已簽收',
      description: '您的包裹已簽收，感謝使用',
      location: order.shipping_address,
    });
  }

  if (order.tracking_number) {
    // 派送中
    if (order.order_status >= 2 && !order.receive_time) {
      tracks.push({
        time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: '派送中',
        description: '快遞員正在派送，請保持電話暢通',
        location: '派送站點',
      });
    }

    // 到达目的地城市
    tracks.push({
      time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      status: '已到達',
      description: `包裹已到達${order.shipping_address?.split('省')[0] || '目的地'}分撥中心`,
      location: '目的地分撥中心',
    });

    // 运输中
    tracks.push({
      time: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      status: '運輸中',
      description: '包裹正在運輸中',
      location: '運輸途中',
    });

    // 已揽收
    tracks.push({
      time: order.shipping_time || new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      status: '已攬收',
      description: `快遞員已攬收，運單號：${order.tracking_number}`,
      location: '發貨地',
    });
  }

  // 已发货
  if (order.shipping_time) {
    tracks.push({
      time: order.shipping_time,
      status: '已發貨',
      description: `商家已發貨，物流公司：${order.tracking_company || '快遞'}`,
      location: '商家倉庫',
    });
  }

  // 已支付
  tracks.push({
    time: order.created_at,
    status: '已下單',
    description: '訂單已創建，等待商家發貨',
    location: '',
  });

  return tracks;
}
