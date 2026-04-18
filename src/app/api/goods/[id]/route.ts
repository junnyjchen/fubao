/**
 * @fileoverview 商品详情 API
 * @description 获取单个商品详情
 * @module app/api/goods/[id]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取商品详情
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 商品详情
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // 获取商品基本信息
    const { data: goods, error } = await client
      .from('goods')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !goods) {
      // 返回模拟数据兜底
      const mockGoods = getMockGoodsDetail(parseInt(id));
      if (!mockGoods) {
        return NextResponse.json({ error: '商品不存在' }, { status: 404 });
      }
      return NextResponse.json({ data: mockGoods });
    }

    // 获取商户信息
    let merchant = null;
    if (goods.merchant_id) {
      const { data: merchantData } = await client
        .from('merchants')
        .select('id, name, logo, certification_level, rating, total_sales')
        .eq('id', goods.merchant_id)
        .single();
      merchant = merchantData;
    }

    // 获取分类信息
    let category = null;
    if (goods.category_id) {
      const { data: categoryData } = await client
        .from('categories')
        .select('id, name, slug')
        .eq('id', goods.category_id)
        .single();
      category = categoryData;
    }

    // 获取认证信息（如果有）
    let certificate = null;
    if (goods.is_certified) {
      const { data: certData } = await client
        .from('certificates')
        .select('certificate_no, issue_date, issued_by')
        .eq('goods_id', goods.id)
        .single();
      certificate = certData;
    }

    // 获取相关商品（同类型或同分类）
    let relatedGoods: Array<{ id: number; name: string; price: string; main_image: string | null; sales: number }> = [];
    if (goods.category_id) {
      const { data: relatedData } = await client
        .from('goods')
        .select('id, name, price, main_image, sales')
        .eq('category_id', goods.category_id)
        .eq('status', true)
        .neq('id', goods.id)
        .limit(6);
      relatedGoods = relatedData || [];
    }

    return NextResponse.json({
      data: {
        ...goods,
        merchant,
        category,
        certificate,
        relatedGoods,
      },
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    // 返回模拟数据兜底
    const mockGoods = getMockGoodsDetail(parseInt(new URL(request.url).pathname.split('/').pop() || '1'));
    if (mockGoods) {
      return NextResponse.json({ data: mockGoods });
    }
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 });
  }
}

/**
 * 获取模拟商品详情数据
 */
function getMockGoodsDetail(id: number) {
  const mockGoodsList: Record<number, object> = {
    1: {
      id: 1,
      name: '太上老君護身符',
      subtitle: '正統道教開光，護佑平安',
      description: '【商品詳情】\n\n太上老君護身符，源自道教正統傳承，由資深道士手工繪製。\n\n符籙特點：\n- 採用上等朱砂書寫\n- 配合道教秘法開光\n- 配有精美錦盒包裝\n- 可懸掛或隨身佩戴\n\n使用說明：\n1. 請選擇吉日開光\n2. 誠心供奉後使用\n3. 避免沾染污穢\n4. 定期更換以保持靈力',
      price: '299.00',
      original_price: '399.00',
      stock: 100,
      sales: 45,
      views: 1230,
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      images: ['/images/goods/fu-001-1.jpg', '/images/goods/fu-001-2.jpg'],
      is_certified: true,
      type: 1,
      purpose: '平安',
      merchant_id: 1,
      category_id: 8,
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
      certificate: { certificate_no: 'FB-FU-2024-001', issue_date: '2024-01-15', issued_by: '張天師第六十三代傳人' },
      relatedGoods: [
        { id: 2, name: '鎮宅平安符', price: '399.00', main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', sales: 32 },
        { id: 3, name: '五路財神符', price: '399.00', main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', sales: 58 },
        { id: 4, name: '太歲平安符', price: '199.00', main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', sales: 89 },
      ],
    },
    2: {
      id: 2,
      name: '鎮宅平安符',
      subtitle: '驅邪鎮宅，保佑家宅平安',
      description: '【商品詳情】\n\n鎮宅平安符，道教法師開光加持，有效驅除邪祟，保護家宅平安。',
      price: '399.00',
      original_price: '499.00',
      stock: 80,
      sales: 32,
      views: 890,
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      images: ['/images/goods/fu-002-1.jpg'],
      is_certified: true,
      type: 1,
      purpose: '鎮宅',
      merchant_id: 1,
      category_id: 8,
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
      certificate: { certificate_no: 'FB-FU-2024-002', issue_date: '2024-01-15', issued_by: '張天師第六十三代傳人' },
      relatedGoods: [],
    },
    3: {
      id: 3,
      name: '五路財神符',
      subtitle: '招財進寶，財運亨通',
      description: '【商品詳情】\n\n五路財神符，奉請五路財神庇佑，助您財源廣進。',
      price: '399.00',
      original_price: '520.00',
      stock: 95,
      sales: 58,
      views: 1560,
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      images: ['/images/goods/fu-003-1.jpg'],
      is_certified: true,
      type: 1,
      purpose: '招財',
      merchant_id: 1,
      category_id: 8,
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
      certificate: { certificate_no: 'FB-FU-2024-003', issue_date: '2024-01-15', issued_by: '張天師第六十三代傳人' },
      relatedGoods: [],
    },
    9: {
      id: 9,
      name: '純銅金蟾招財擺件',
      subtitle: '三足金蟾，吸財吐寶',
      description: '【商品詳情】\n\n純銅金蟾招財擺件，精選優質純銅，純手工打造。',
      price: '680.00',
      original_price: '880.00',
      stock: 45,
      sales: 28,
      views: 890,
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6870e99e-5a28-4f3f-a3a2-e505f3a80143.jpeg?sign=1807974176-2f0f09eed5-0-e8f14e57ddc7372febeb59f199eefb969ba1fc83f4c1f4d0c3204e91469d9cf3',
      images: ['/images/goods/fengshui-001-1.jpg'],
      is_certified: true,
      type: 2,
      purpose: '招財',
      merchant_id: 2,
      category_id: 17,
      merchant: { id: 2, name: '風水專門店', logo: null, certification_level: 2, rating: 4.6, total_sales: 800 },
      category: { id: 17, name: '風水擺件', slug: 'fengshui' },
      certificate: { certificate_no: 'FB-FS-2024-001', issue_date: '2024-01-20', issued_by: '資深風水師' },
      relatedGoods: [],
    },
  };
  return mockGoodsList[id] || mockGoodsList[1];
}
