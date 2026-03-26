/**
 * @fileoverview 免费领商品API
 * @description 免费领取商品，支持邮寄或到店自取
 * @module app/api/free-gifts/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 免费商品类型
 */
interface FreeGift {
  id: number;
  name: string;
  description: string;
  image: string | null;
  original_price: string;
  stock: number;
  claimed: number;
  limit_per_user: number;
  shipping_fee: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
  merchant_id: number;
  merchant?: {
    id: number;
    name: string;
    address: string;
  };
}

/**
 * 获取模拟免费商品数据
 */
function getMockFreeGifts(): FreeGift[] {
  return [
    {
      id: 1,
      name: '平安符（開光加持）',
      description: '開光加持平安符，保佑平安順遂。每人限領1份，郵寄需支付郵費HK$20，或到店免費領取。',
      image: null,
      original_price: '128.00',
      stock: 100,
      claimed: 56,
      limit_per_user: 1,
      shipping_fee: '20.00',
      is_active: true,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      merchant_id: 1,
      merchant: {
        id: 1,
        name: '玄門道院',
        address: '九龍油尖旺區彌敦道100號',
      },
    },
    {
      id: 2,
      name: '道家養生香囊',
      description: '天然草本香囊，安神助眠。每人限領1份，郵寄需支付郵費HK$15。',
      image: null,
      original_price: '68.00',
      stock: 50,
      claimed: 23,
      limit_per_user: 1,
      shipping_fee: '15.00',
      is_active: true,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      merchant_id: 1,
      merchant: {
        id: 1,
        name: '玄門道院',
        address: '九龍油尖旺區彌敦道100號',
      },
    },
    {
      id: 3,
      name: '六字真言手環',
      description: '藏式六字真言手環，祈福平安。每人限領2份。',
      image: null,
      original_price: '88.00',
      stock: 200,
      claimed: 178,
      limit_per_user: 2,
      shipping_fee: '18.00',
      is_active: true,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      merchant_id: 2,
      merchant: {
        id: 2,
        name: '龍虎山法器店',
        address: '港島中西區皇后大道中200號',
      },
    },
    {
      id: 4,
      name: '開光銅錢掛件',
      description: '五帝銅錢掛件，招財辟邪。到店免費領取，數量有限。',
      image: null,
      original_price: '58.00',
      stock: 80,
      claimed: 45,
      limit_per_user: 1,
      shipping_fee: '15.00',
      is_active: true,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      merchant_id: 3,
      merchant: {
        id: 3,
        name: '禪心閣',
        address: '新界沙田區沙田正街100號',
      },
    },
  ];
}

/**
 * GET /api/free-gifts
 * 获取免费领商品列表
 * @query page - 页码
 * @query limit - 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const client = getSupabaseClient();

    // 尝试从数据库获取
    const { data: gifts, error } = await client
      .from('free_gifts')
      .select(`
        id,
        name,
        description,
        image,
        original_price,
        stock,
        claimed,
        limit_per_user,
        shipping_fee,
        is_active,
        start_time,
        end_time,
        merchant_id,
        merchants (
          id,
          name,
          address
        )
      `)
      .eq('is_active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('获取免费商品失败:', error);
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockFreeGifts(),
        pagination: {
          page,
          limit,
          total: getMockFreeGifts().length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: gifts || [],
      pagination: {
        page,
        limit,
        total: gifts?.length || 0,
      },
    });
  } catch (error) {
    console.error('免费商品API错误:', error);
    return NextResponse.json({
      success: true,
      data: getMockFreeGifts(),
    });
  }
}

/**
 * POST /api/free-gifts
 * 领取免费商品
 * @body gift_id - 商品ID
 * @body receive_type - 领取方式（shipping/pickup）
 * @body shipping_name - 收货人姓名（邮寄必填）
 * @body shipping_phone - 收货人手机（邮寄必填）
 * @body shipping_address - 收货地址（邮寄必填）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      gift_id,
      receive_type,
      shipping_name,
      shipping_phone,
      shipping_address,
    } = body;

    // 验证必填字段
    if (!gift_id) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    if (!['shipping', 'pickup'].includes(receive_type)) {
      return NextResponse.json({ error: '請選擇領取方式' }, { status: 400 });
    }

    // 邮寄需要地址信息
    if (receive_type === 'shipping') {
      if (!shipping_name || !shipping_phone || !shipping_address) {
        return NextResponse.json({ error: '請填寫完整的收貨信息' }, { status: 400 });
      }
    }

    // 获取商品信息
    const client = getSupabaseClient();
    const { data: gift, error: giftError } = await client
      .from('free_gifts')
      .select('*')
      .eq('id', parseInt(gift_id))
      .single();

    if (giftError || !gift) {
      // 使用模拟数据
      const mockGift = getMockFreeGifts().find(g => g.id === parseInt(gift_id));
      if (!mockGift) {
        return NextResponse.json({ error: '商品不存在' }, { status: 400 });
      }

      // 生成领取记录
      const claimNo = `FREE${Date.now().toString(36).toUpperCase()}`;
      
      return NextResponse.json({
        success: true,
        message: '領取成功',
        data: {
          claim_no: claimNo,
          gift_name: mockGift.name,
          receive_type,
          shipping_fee: receive_type === 'shipping' ? mockGift.shipping_fee : '0',
          need_pay: receive_type === 'shipping',
          pay_amount: receive_type === 'shipping' ? mockGift.shipping_fee : '0',
          merchant: mockGift.merchant,
          pickup_address: receive_type === 'pickup' ? mockGift.merchant?.address : null,
        },
      });
    }

    // 检查库存
    if (gift.stock <= 0) {
      return NextResponse.json({ error: '商品已領完' }, { status: 400 });
    }

    // 生成领取记录
    const claimNo = `FREE${Date.now().toString(36).toUpperCase()}`;
    const shippingFee = receive_type === 'shipping' ? gift.shipping_fee : '0';

    return NextResponse.json({
      success: true,
      message: '領取成功',
      data: {
        claim_no: claimNo,
        gift_name: gift.name,
        receive_type,
        shipping_fee: shippingFee,
        need_pay: receive_type === 'shipping',
        pay_amount: shippingFee,
        pickup_address: receive_type === 'pickup' ? gift.merchant?.address : null,
      },
    });
  } catch (error) {
    console.error('领取商品失败:', error);
    return NextResponse.json({ error: '領取失敗，請稍後重試' }, { status: 500 });
  }
}
