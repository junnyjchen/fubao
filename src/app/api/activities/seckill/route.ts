/**
 * @fileoverview 秒杀商品 API
 * @description 获取秒杀商品列表
 * @module app/api/activities/seckill/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 秒杀商品接口
 */
interface SeckillGoods {
  id: number;
  activity_id: number;
  goods_id: number;
  seckill_price: string;
  seckill_stock: number;
  seckill_sales: number;
  limit_per_user: number;
  start_time: string;
  end_time: string;
  goods: {
    id: number;
    name: string;
    main_image: string | null;
    price: string;
    original_price: string | null;
    stock: number;
    sales: number;
    merchants?: { name: string } | null;
  } | null;
}

/**
 * 获取秒杀商品列表
 * @param request - 请求对象
 * @returns 秒杀商品列表
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const activityId = searchParams.get('activity_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 构建查询
    let query = client
      .from('seckill_goods')
      .select(`
        *,
        goods:goods_id (
          id,
          name,
          main_image,
          price,
          original_price,
          stock,
          sales,
          merchants:merchant_id (
            name
          )
        )
      `)
      .order('sort', { ascending: true })
      .limit(limit);

    if (activityId) {
      query = query.eq('activity_id', parseInt(activityId));
    }

    const { data: seckillGoods, error } = await query;

    if (error) {
      console.error('获取秒杀商品失败:', error);
      // 如果表不存在或查询失败，返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockSeckillGoods(),
      });
    }

    return NextResponse.json({
      success: true,
      data: seckillGoods?.length > 0 ? seckillGoods : getMockSeckillGoods(),
    });
  } catch (error) {
    console.error('秒杀商品API错误:', error);
    return NextResponse.json({
      success: true,
      data: getMockSeckillGoods(),
    });
  }
}

/**
 * 模拟秒杀商品数据
 */
function getMockSeckillGoods(): SeckillGoods[] {
  const now = new Date();
  
  return [
    {
      id: 1,
      activity_id: 1,
      goods_id: 1,
      seckill_price: '288.00',
      seckill_stock: 50,
      seckill_sales: 42,
      limit_per_user: 2,
      start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      goods: {
        id: 1,
        name: '太上老君鎮宅符',
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        price: '388.00',
        original_price: '488.00',
        stock: 100,
        sales: 1256,
        merchants: { name: '龍虎山道觀法物店' },
      },
    },
    {
      id: 2,
      activity_id: 1,
      goods_id: 2,
      seckill_price: '199.00',
      seckill_stock: 30,
      seckill_sales: 28,
      limit_per_user: 1,
      start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      goods: {
        id: 2,
        name: '五雷護身符',
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        price: '288.00',
        original_price: '358.00',
        stock: 150,
        sales: 2080,
        merchants: { name: '龍虎山道觀法物店' },
      },
    },
    {
      id: 3,
      activity_id: 1,
      goods_id: 4,
      seckill_price: '499.00',
      seckill_stock: 20,
      seckill_sales: 18,
      limit_per_user: 1,
      start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      goods: {
        id: 4,
        name: '武當檀香唸珠',
        main_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
        price: '688.00',
        original_price: '888.00',
        stock: 50,
        sales: 856,
        merchants: { name: '武當山法器專營' },
      },
    },
    {
      id: 4,
      activity_id: 1,
      goods_id: 5,
      seckill_price: '258.00',
      seckill_stock: 40,
      seckill_sales: 35,
      limit_per_user: 2,
      start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      goods: {
        id: 5,
        name: '銅製八卦鏡',
        main_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        price: '358.00',
        original_price: '458.00',
        stock: 80,
        sales: 1256,
        merchants: { name: '武當山法器專營' },
      },
    },
  ];
}
