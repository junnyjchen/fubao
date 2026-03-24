/**
 * @fileoverview 晒图详情API路由
 * @description 单个晒图的查询、点赞、评论
 * @module app/api/shares/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/shares/[id] - 获取晒图详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const shareId = resolvedParams.id;

  try {
    const { data: share, error } = await supabase
      .from('shares')
      .select(`
        id,
        user_id,
        goods_id,
        order_id,
        content,
        images,
        video_url,
        likes_count,
        comments_count,
        is_anonymous,
        created_at,
        users (
          id,
          nickname,
          avatar
        ),
        goods (
          id,
          name,
          images,
          price
        )
      `)
      .eq('id', shareId)
      .eq('status', 1)
      .single();

    if (error || !share) {
      return NextResponse.json({ error: '內容不存在' }, { status: 404 });
    }

    // 获取评论列表
    const { data: comments } = await supabase
      .from('share_comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        users (
          id,
          nickname,
          avatar
        )
      `)
      .eq('share_id', shareId)
      .eq('status', 1)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        ...share,
        comments: comments || [],
      },
    });
  } catch (error) {
    console.error('获取晒图详情失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * POST /api/shares/[id] - 点赞
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const shareId = resolvedParams.id;

  // 验证登录
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'like') {
      // 检查是否已点赞
      const { data: existingLike } = await supabase
        .from('share_likes')
        .select('id')
        .eq('share_id', shareId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // 取消点赞
        await supabase
          .from('share_likes')
          .delete()
          .eq('id', existingLike.id);

        await supabase.rpc('decrement_likes', { share_id: parseInt(shareId) });

        return NextResponse.json({ success: true, liked: false, message: '已取消點贊' });
      } else {
        // 添加点赞
        await supabase
          .from('share_likes')
          .insert({
            share_id: parseInt(shareId),
            user_id: userId,
            created_at: new Date().toISOString(),
          });

        await supabase.rpc('increment_likes', { share_id: parseInt(shareId) });

        return NextResponse.json({ success: true, liked: true, message: '點贊成功' });
      }
    }

    if (action === 'comment') {
      const { content } = body;
      if (!content || !content.trim()) {
        return NextResponse.json({ error: '請輸入評論內容' }, { status: 400 });
      }

      const { data: comment, error } = await supabase
        .from('share_comments')
        .insert({
          share_id: parseInt(shareId),
          user_id: userId,
          content: content.trim(),
          status: 1,
          created_at: new Date().toISOString(),
        })
        .select(`
          id,
          user_id,
          content,
          created_at,
          users (
            id,
            nickname,
            avatar
          )
        `)
        .single();

      if (error) {
        return NextResponse.json({ error: '評論失敗' }, { status: 500 });
      }

      await supabase.rpc('increment_comments', { share_id: parseInt(shareId) });

      return NextResponse.json({ success: true, data: comment, message: '評論成功' });
    }

    return NextResponse.json({ error: '無效的操作' }, { status: 400 });
  } catch (error) {
    console.error('操作失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * DELETE /api/shares/[id] - 删除晒图
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const shareId = resolvedParams.id;

  // 验证登录
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
  }

  try {
    // 验证所有权
    const { data: share, error: findError } = await supabase
      .from('shares')
      .select('id, user_id')
      .eq('id', shareId)
      .single();

    if (findError || !share) {
      return NextResponse.json({ error: '內容不存在' }, { status: 404 });
    }

    if (share.user_id !== userId) {
      return NextResponse.json({ error: '無權刪除' }, { status: 403 });
    }

    // 软删除
    const { error } = await supabase
      .from('shares')
      .update({ status: 0, updated_at: new Date().toISOString() })
      .eq('id', shareId);

    if (error) {
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '已刪除' });
  } catch (error) {
    console.error('删除失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
