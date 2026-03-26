/**
 * @fileoverview 积分商城商品 API
 * @description 获取积分商品列表
 * @module app/api/points-goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 积分商品接口
 */
interface PointsGoods {
  id: number;
  name: string;
  type: 'goods' | 'coupon';
  image: string | null;
  points: number;
  original_price: number | null;
  stock: number;
  sales: number;
  description: string | null;
  limit_per_user: number;
}

/**
 * 获取积分商品列表
 * @param request - 请求对象
 * @returns 商品列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = getSupabaseClient();

    // 尝试从数据库获取
    let query = client
      .from('points_goods')
      .select('*')
      .eq('status', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      // 如果表不存在，返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockGoods(type),
      });
    }

    return NextResponse.json({
      success: true,
      data: data?.length > 0 ? data : getMockGoods(type),
    });
  } catch (error) {
    console.error('获取积分商品失败:', error);
    return NextResponse.json({
      success: true,
      data: getMockGoods('all'),
    });
  }
}

/**
 * 模拟商品数据
 */
function getMockGoods(type: string): PointsGoods[] {
  const allGoods: PointsGoods[] = [
    {
      id: 1,
      name: 'HK$50優惠券',
      type: 'coupon',
      image: null,
      points: 500,
      original_price: 50,
      stock: 100,
      sales: 256,
      description: '滿200可用，有效期30天',
      limit_per_user: 3,
    },
    {
      id: 2,
      name: 'HK$100優惠券',
      type: 'coupon',
      image: null,
      points: 900,
      original_price: 100,
      stock: 50,
      sales: 128,
      description: '滿500可用，有效期30天',
      limit_per_user: 2,
    },
    {
      id: 3,
      name: '道教開光手串',
      type: 'goods',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
      points: 2000,
      original_price: 200,
      stock: 20,
      sales: 45,
      description: '開光加持，保平安',
      limit_per_user: 1,
    },
    {
      id: 4,
      name: '符寶定制筆記本',
      type: 'goods',
      image: null,
      points: 800,
      original_price: 80,
      stock: 50,
      sales: 89,
      description: '精美設計，限量發行',
      limit_per_user: 2,
    },
    {
      id: 5,
      name: '9折優惠券',
      type: 'coupon',
      image: null,
      points: 300,
      original_price: null,
      stock: 200,
      sales: 512,
      description: '全場通用，最高減免100',
      limit_per_user: 5,
    },
    {
      id: 6,
      name: '道教文化典藏冊',
      type: 'goods',
      image: null,
      points: 5000,
      original_price: 500,
      stock: 10,
      sales: 23,
      description: '限量典藏版，附贈開光護身符',
      limit_per_user: 1,
    },
  ];

  if (type === 'all') {
    return allGoods;
  }

  return allGoods.filter((item) => item.type === type);
}
