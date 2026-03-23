/**
 * @fileoverview 数据库种子数据 API
 * @description 用于初始化测试数据（仅开发环境使用）
 * @module app/api/seed/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 初始化测试数据
 * @param request - 请求对象
 * @returns 初始化结果
 */
export async function POST(request: Request) {
  try {
    // 仅允许开发环境使用
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: '生產環境禁止使用' }, { status: 403 });
    }

    const client = getSupabaseClient();

    // 1. 创建测试商户
    const { data: merchants, error: merchantError } = await client
      .from('merchants')
      .upsert([
        {
          id: 1,
          name: '龍虎山道觀法物店',
          type: 1,
          logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
          description: '傳承千年的道觀法物，正品保證，開光加持',
          certification_level: 3,
          contact_name: '張道長',
          contact_phone: '400-888-8888',
          address: '江西省鷹潭市龍虎山',
          province: '江西省',
          city: '鷹潭市',
          rating: '4.95',
          total_sales: 12580,
          status: true,
        },
        {
          id: 2,
          name: '武當山法器專營',
          type: 1,
          logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          description: '武當正宗法器，傳統工藝製作',
          certification_level: 3,
          contact_name: '李道長',
          contact_phone: '400-666-6666',
          address: '湖北省十堰市武當山',
          province: '湖北省',
          city: '十堰市',
          rating: '4.88',
          total_sales: 8960,
          status: true,
        },
        {
          id: 3,
          name: '青城山符籙閣',
          type: 1,
          logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
          description: '青城派傳承符籙，道教正宗',
          certification_level: 2,
          contact_name: '王道長',
          contact_phone: '400-999-9999',
          address: '四川省都江堰市青城山',
          province: '四川省',
          city: '都江堰市',
          rating: '4.82',
          total_sales: 6520,
          status: true,
        },
      ], { onConflict: 'id' })
      .select();

    if (merchantError) {
      console.error('创建商户失败:', merchantError);
    }

    // 2. 创建测试分类
    const { data: categories, error: categoryError } = await client
      .from('categories')
      .upsert([
        { id: 1, name: '符籙', slug: 'fulu', sort: 1, status: true },
        { id: 2, name: '法器', slug: 'faqie', sort: 2, status: true },
        { id: 3, name: '唸珠', slug: 'nianzhu', sort: 3, status: true },
        { id: 4, name: '香燭', slug: 'xiangzhu', sort: 4, status: true },
        { id: 5, name: '經書', slug: 'jingshu', sort: 5, status: true },
        { id: 6, name: '護身符', slug: 'hushenfu', sort: 6, status: true },
      ], { onConflict: 'id' })
      .select();

    if (categoryError) {
      console.error('创建分类失败:', categoryError);
    }

    // 3. 创建测试商品
    const goods = [
      // 龍虎山道觀商品
      {
        id: 1,
        merchant_id: 1,
        category_id: 1,
        name: '太上老君鎮宅符',
        subtitle: '開光加持 鎮宅辟邪',
        type: 1,
        purpose: '鎮宅辟邪',
        price: '388.00',
        original_price: '488.00',
        stock: 100,
        sales: 1256,
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
          'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=800',
        ]),
        description: '太上老君鎮宅符，由龍虎山正一道高功法師開光加持，適用於家庭鎮宅辟邪、化解煞氣。',
        is_certified: true,
        status: true,
        sort: 1,
      },
      {
        id: 2,
        merchant_id: 1,
        category_id: 1,
        name: '五雷護身符',
        subtitle: '護身保平安',
        type: 1,
        purpose: '護身保平安',
        price: '288.00',
        original_price: '358.00',
        stock: 150,
        sales: 2080,
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        description: '五雷護身符，傳承龍虎山千年符法，護身保平安。',
        is_certified: true,
        status: true,
        sort: 2,
      },
      {
        id: 3,
        merchant_id: 1,
        category_id: 2,
        name: '桃木七星劍',
        subtitle: '開光法器 驅邪鎮煞',
        type: 1,
        purpose: '驅邪鎮煞',
        price: '1280.00',
        original_price: '1580.00',
        stock: 30,
        sales: 458,
        main_image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
        description: '桃木七星劍，選用百年老桃木精製，刻有北斗七星圖案，經龍虎山高功法師開光加持。',
        is_certified: true,
        status: true,
        sort: 3,
      },
      // 武當山法器商品
      {
        id: 4,
        merchant_id: 2,
        category_id: 3,
        name: '武當檀香唸珠',
        subtitle: '108顆老山檀香',
        type: 1,
        purpose: '修行唸佛',
        price: '688.00',
        original_price: '888.00',
        stock: 50,
        sales: 856,
        main_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
        description: '武當檀香唸珠，108顆老山檀香製成，香氣醇厚，適合修行唸佛。',
        is_certified: true,
        status: true,
        sort: 1,
      },
      {
        id: 5,
        merchant_id: 2,
        category_id: 2,
        name: '銅製八卦鏡',
        subtitle: '風水法器 化煞避邪',
        type: 1,
        purpose: '化煞避邪',
        price: '358.00',
        original_price: '458.00',
        stock: 80,
        sales: 1256,
        main_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        description: '銅製八卦鏡，傳統工藝精製，適用於風水化煞。',
        is_certified: true,
        status: true,
        sort: 2,
      },
      // 青城山符籙閣商品
      {
        id: 6,
        merchant_id: 3,
        category_id: 6,
        name: '青城平安護身牌',
        subtitle: '隨身攜帶 保佑平安',
        type: 1,
        purpose: '護身平安',
        price: '168.00',
        original_price: '218.00',
        stock: 200,
        sales: 3580,
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        description: '青城平安護身牌，小巧精緻，可隨身攜帶，保佑平安。',
        is_certified: true,
        status: true,
        sort: 1,
      },
      {
        id: 7,
        merchant_id: 3,
        category_id: 4,
        name: '道家祈福香',
        subtitle: '天然檀香 祈福納祥',
        type: 1,
        purpose: '祈福納祥',
        price: '98.00',
        original_price: '128.00',
        stock: 300,
        sales: 5680,
        main_image: 'https://images.unsplash.com/photo-1602607753366-e64f530320e7?w=400',
        description: '道家祈福香，天然檀香製成，清香怡人，適合日常祈福。',
        is_certified: false,
        status: true,
        sort: 2,
      },
      {
        id: 8,
        merchant_id: 3,
        category_id: 5,
        name: '道德經註釋版',
        subtitle: '經典註解 修行必備',
        type: 1,
        purpose: '修行學習',
        price: '68.00',
        original_price: '88.00',
        stock: 500,
        sales: 8960,
        main_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        description: '道德經註釋版，包含歷代名家註解，適合修行者學習研讀。',
        is_certified: false,
        status: true,
        sort: 3,
      },
    ];

    const { data: insertedGoods, error: goodsError } = await client
      .from('goods')
      .upsert(goods, { onConflict: 'id' })
      .select();

    if (goodsError) {
      console.error('创建商品失败:', goodsError);
    }

    // 4. 创建测试轮播图
    const { data: banners, error: bannerError } = await client
      .from('banners')
      .upsert([
        {
          id: 1,
          title: '龍虎山道觀法物',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
          link: '/goods/1',
          position: 'home',
          sort: 1,
          status: true,
        },
        {
          id: 2,
          title: '符籙專區',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
          link: '/category/fulu',
          position: 'home',
          sort: 2,
          status: true,
        },
        {
          id: 3,
          title: '新品上架',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
          link: '/goods?sort=new',
          position: 'home',
          sort: 3,
          status: true,
        },
      ], { onConflict: 'id' })
      .select();

    if (bannerError) {
      console.error('创建轮播图失败:', bannerError);
    }

    // 5. 创建百科分类
    const { data: wikiCategories, error: wikiCategoryError } = await client
      .from('wiki_categories')
      .upsert([
        { id: 1, name: '符籙知識', slug: 'fulu-knowledge', description: '符籙的歷史、種類與使用方法', sort_order: 1 },
        { id: 2, name: '法器介紹', slug: 'faqie-intro', description: '道教法器的種類與用途', sort_order: 2 },
        { id: 3, name: '道教文化', slug: 'daoism-culture', description: '道教文化與歷史', sort_order: 3 },
        { id: 4, name: '修行入門', slug: 'practice-intro', description: '道教修行基礎知識', sort_order: 4 },
      ], { onConflict: 'id' })
      .select();

    if (wikiCategoryError) {
      console.error('创建百科分类失败:', wikiCategoryError);
    }

    // 6. 创建百科文章
    const { data: wikiArticles, error: wikiArticleError } = await client
      .from('wiki_articles')
      .upsert([
        {
          id: 1,
          title: '什麼是符籙？',
          slug: 'what-is-fulu',
          category_id: 1,
          summary: '符籙是道教重要的法術載體，歷史悠久，用途廣泛。',
          content: `# 什麼是符籙？

符籙是道教重要的法術載體，歷史悠久，用途廣泛。

## 符籙的起源

符籙起源於古代的巫術和祭祀活動，經過道教的發展和完善，形成了獨特的符籙體系。

## 符籙的種類

- 鎮宅符：用於鎮宅辟邪
- 護身符：用於保護人身安全
- 平安符：祈求平安吉祥
- 財運符：招財進寶

## 符籙的使用方法

1. 選擇合適的符籙
2. 誠心祈禱
3. 正確佩戴或放置`,
          author: '符寶網編輯部',
          is_published: true,
          is_featured: true,
          tags: ['符籙', '道教', '入門'],
        },
        {
          id: 2,
          title: '道教法器簡介',
          slug: 'daoism-tools',
          category_id: 2,
          summary: '道教法器種類繁多，各有其特殊用途和象徵意義。',
          content: `# 道教法器簡介

道教法器種類繁多，各有其特殊用途和象徵意義。

## 常見法器

### 桃木劍
桃木劍是最常見的法器之一，用於驅邪鎮煞。

### 八卦鏡
八卦鏡用於化解煞氣，是風水常用的法器。

### 鈴鐺
鈴鐺用於法事中，可通神靈、驅邪祟。`,
          author: '符寶網編輯部',
          is_published: true,
          is_featured: false,
          tags: ['法器', '道教', '入門'],
        },
      ], { onConflict: 'id' })
      .select();

    if (wikiArticleError) {
      console.error('创建百科文章失败:', wikiArticleError);
    }

    // 7. 创建测试证书
    const { data: certificates, error: certificateError } = await client
      .from('certificates')
      .upsert([
        {
          id: 1,
          certificate_no: 'FB-2024-00001',
          goods_id: 1,
          merchant_id: 1,
          issue_date: '2024-01-15',
          issued_by: '符寶網認證中心',
          valid_until: '2029-01-15',
          details: {
            material: '黃紙朱砂',
            origin: '江西龍虎山',
            craftsmanship: '手工繪製',
            master: '張道長',
            blessing: '經龍虎山正一道高功法師開光加持',
          },
        },
        {
          id: 2,
          certificate_no: 'FB-2024-00002',
          goods_id: 3,
          merchant_id: 1,
          issue_date: '2024-02-20',
          issued_by: '符寶網認證中心',
          valid_until: '2029-02-20',
          details: {
            material: '百年老桃木',
            origin: '江西龍虎山',
            craftsmanship: '手工雕刻',
            master: '李道長',
            blessing: '經龍虎山正一道高功法師開光加持',
          },
        },
      ], { onConflict: 'id' })
      .select();

    if (certificateError) {
      console.error('创建证书失败:', certificateError);
    }

    return NextResponse.json({
      success: true,
      message: '測試數據初始化成功',
      data: {
        merchants: merchants?.length || 0,
        categories: categories?.length || 0,
        goods: insertedGoods?.length || 0,
        banners: banners?.length || 0,
        wiki_categories: wikiCategories?.length || 0,
        wiki_articles: wikiArticles?.length || 0,
        certificates: certificates?.length || 0,
      },
    });
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    return NextResponse.json(
      { error: '初始化測試數據失敗' },
      { status: 500 }
    );
  }
}
