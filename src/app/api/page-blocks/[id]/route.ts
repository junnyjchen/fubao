/**
 * @fileoverview 单个页面模块操作API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: 获取单个模块
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { data, error } = await supabase
      .from('page_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: '模塊不存在' }, { status: 404 });
    }

    return NextResponse.json({ 
      data: {
        id: String(data.id),
        type: data.type,
        title: data.title,
        order: data.order,
        visible: data.visible,
        config: data.config || {},
      }
    });
  } catch (error) {
    console.error('获取模块异常:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// PUT: 更新单个模块
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.visible !== undefined) updateData.visible = body.visible;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.config !== undefined) updateData.config = body.config;

    const { data, error } = await supabase
      .from('page_blocks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新模块失败:', error);
      return NextResponse.json({ error: '更新失敗', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: {
        id: String(data.id),
        type: data.type,
        title: data.title,
        order: data.order,
        visible: data.visible,
        config: data.config || {},
      }, 
      message: '更新成功' 
    });
  } catch (error) {
    console.error('更新模块异常:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// DELETE: 删除单个模块
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { error } = await supabase
      .from('page_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除模块失败:', error);
      return NextResponse.json({ error: '刪除失敗', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除模块异常:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
