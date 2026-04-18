/**
 * @fileoverview 页面模块管理API
 * @description 可视化编辑器的后端接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** 默认页面模块数据 */
function getDefaultBlocks() {
  return [
    {
      id: '1',
      type: 'banner',
      title: '首頁輪播圖',
      order: 1,
      visible: true,
      config: {
        images: [],
        autoplay: true,
        interval: 5000,
      },
    },
    {
      id: '2',
      type: 'category',
      title: '商品分類',
      order: 2,
      visible: true,
      config: {
        columns: 4,
        showTitle: true,
      },
    },
    {
      id: '3',
      type: 'product_grid',
      title: '熱門商品',
      order: 3,
      visible: true,
      config: {
        title: '熱門商品推薦',
        count: 8,
        columns: 4,
        showMore: true,
      },
    },
  ];
}

// GET: 获取所有页面模块
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('page_blocks')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('获取页面模块失败:', error);
      return NextResponse.json({ data: getDefaultBlocks() });
    }

    // 如果没有数据，返回默认数据
    if (!data || data.length === 0) {
      return NextResponse.json({ data: getDefaultBlocks() });
    }

    return NextResponse.json({ 
      data: data.map(b => ({
        id: String(b.id),
        type: b.type,
        title: b.title,
        order: b.order,
        visible: b.visible,
        config: b.config || {},
      }))
    });
  } catch (error) {
    console.error('获取页面模块异常:', error);
    return NextResponse.json({ data: getDefaultBlocks() });
  }
}

// POST: 批量保存页面模块
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { blocks } = body;

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: '無效的數據格式' }, { status: 400 });
    }

    // 开启事务，先删除所有现有模块，再插入新的
    const { error: deleteError } = await supabase
      .from('page_blocks')
      .delete()
      .neq('id', 0); // 删除所有

    if (deleteError) {
      console.error('删除旧模块失败:', deleteError);
      return NextResponse.json({ error: '保存失敗', details: deleteError.message }, { status: 500 });
    }

    // 插入新模块
    const blocksToInsert = blocks.map((block, index) => ({
      type: block.type,
      title: block.title,
      order: index + 1,
      visible: block.visible,
      config: block.config || {},
    }));

    const { data, error: insertError } = await supabase
      .from('page_blocks')
      .insert(blocksToInsert)
      .select();

    if (insertError) {
      console.error('插入新模块失败:', insertError);
      return NextResponse.json({ error: '保存失敗', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: data?.map(b => ({
        id: String(b.id),
        type: b.type,
        title: b.title,
        order: b.order,
        visible: b.visible,
        config: b.config || {},
      })), 
      message: '保存成功' 
    });
  } catch (error) {
    console.error('保存页面模块异常:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
