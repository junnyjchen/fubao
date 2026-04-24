/**
 * @fileoverview 免费商品API
 * @description 提供免费领取商品的接口
 * @module app/api/free-goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/free-goods
 * 获取免费商品列表
 * @query page - 页码
 * @query limit - 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // 如果supabase无效，返回mock免费商品
    if (!supabase || typeof supabase.from !== 'function') {
      const mockFreeGoods = [
        {
          id: 0,
          name: '免費平安符',
          subtitle: '新手免費領取，道祖加持護平安',
          description: `<h2>免費領取平安符</h2>
<p>符寶網為回饋廣大信眾，特推出免費平安符領取活動。</p>
<h3>符咒功效</h3>
<ul>
<li>護佑人身安全</li>
<li>化解小人是非</li>
<li>出入平安</li>
<li>逢凶化吉</li>
</ul>
<h3>領取說明</h3>
<p>每位用戶限領一份，由正統道觀開光加持，心誠則靈。</p>
<h3>使用方式</h3>
<ol>
<li>請回家後以清水供奉三日</li>
<li>懸掛於卧室或隨身攜帶</li>
<li>心存善念，不可心存邪念</li>
</ol>
<h3>溫馨提示</h3>
<p>符籙為神聖物品，請妥善保管，不可污損。</p>`,
          main_image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=400&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=800&fit=crop',
          ],
          price: '0.00',
          original_price: '99.00',
          is_certified: true,
          sales: 1523,
          stock: 9999,
          type: 1,
          purpose: '平安',
          is_free: true,
          merchant: { 
            id: 1, 
            name: '符寶網官方', 
            logo: null, 
            certification_level: 3, 
            rating: 5.0, 
            total_sales: 5000 
          },
          category: { id: 8, name: '符籙', slug: 'fujis' },
          claim_limit: 1,
          claim_instructions: '每位用戶限領一份，需登錄後領取',
        },
      ];

      return NextResponse.json({
        data: mockFreeGoods.slice(offset, offset + limit),
        pagination: {
          page,
          limit,
          total: mockFreeGoods.length,
          total_pages: 1,
        },
      });
    }

    // 从数据库查询免费商品 (price = 0)
    const { data: goods, error, count } = await supabase
      .from('goods')
      .select(`
        id,
        name,
        subtitle,
        description,
        main_image,
        images,
        price,
        original_price,
        is_certified,
        sales,
        stock,
        type,
        purpose,
        claim_limit,
        claim_instructions,
        merchant:merchants(id, name, logo, certification_level, rating, total_sales),
        category:categories(id, name, slug)
      `, { count: 'exact' })
      .eq('status', 1)
      .eq('price', '0.00')
      .order('sales', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询免费商品失败:', error);
      // 返回mock数据
      return NextResponse.json({
        data: [
          {
            id: 0,
            name: '免費平安符',
            subtitle: '新手免費領取，道祖加持護平安',
            description: `<h2>免費領取平安符</h2>
<p>符寶網為回饋廣大信眾，特推出免費平安符領取活動。</p>
<h3>符咒功效</h3>
<ul>
<li>護佑人身安全</li>
<li>化解小人是非</li>
<li>出入平安</li>
<li>逢凶化吉</li>
</ul>
<h3>領取說明</h3>
<p>每位用戶限領一份，由正統道觀開光加持，心誠則靈。</p>`,
            main_image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=400&fit=crop',
            images: ['https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=800&fit=crop'],
            price: '0.00',
            original_price: '99.00',
            is_certified: true,
            sales: 1523,
            stock: 9999,
            type: 1,
            purpose: '平安',
            is_free: true,
            merchant: { id: 1, name: '符寶網官方', certification_level: 3, rating: 5.0 },
            category: { id: 8, name: '符籙', slug: 'fujis' },
            claim_limit: 1,
          },
        ],
        pagination: { page, limit, total: 1, total_pages: 1 },
      });
    }

    // 添加 is_free 标记
    const freeGoods = (goods || []).map((g: any) => ({
      ...g,
      is_free: true,
    }));

    return NextResponse.json({
      data: freeGoods,
      pagination: {
        page,
        limit,
        total: count || freeGoods.length,
        total_pages: count ? Math.ceil(count / limit) : 1,
      },
    });
  } catch (error) {
    console.error('获取免费商品失败:', error);
    return NextResponse.json(
      { error: '獲取免費商品失敗' },
      { status: 500 }
    );
  }
}
