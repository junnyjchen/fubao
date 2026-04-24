/**
 * @fileoverview 视频分类API
 * @description 提供视频分类的查询接口
 * @module app/api/video-categories/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Mock 分类数据
const mockCategories = [
  { id: 1, name: '符籙文化', slug: 'fuji', description: '道教符籙的種類、使用方法與製作', icon: '📜', video_count: 12, sort_order: 1 },
  { id: 2, name: '道教科儀', slug: 'ritual', description: '祈福、超度、驅邪等科儀詳解', icon: '🎭', video_count: 8, sort_order: 2 },
  { id: 3, name: '風水命理', slug: 'fengshui', description: '家居風水、命理推算與環境調整', icon: '🧭', video_count: 15, sort_order: 3 },
  { id: 4, name: '法器介紹', slug: 'faqi', description: '道教法器的種類、功能與開光', icon: '⚔️', video_count: 6, sort_order: 4 },
  { id: 5, name: '歷史傳承', slug: 'history', description: '道教歷史、神仙譜系與文化傳承', icon: '📚', video_count: 10, sort_order: 5 },
  { id: 6, name: '養生保健', slug: 'health', description: '道家養生、氣功與太極', icon: '🧘', video_count: 9, sort_order: 6 },
];

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('video_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      // 返回 mock 数据
      return NextResponse.json({ data: mockCategories });
    }

    // 获取每个分类的视频数量
    const categoriesWithCount = await Promise.all(
      (data || []).map(async (category) => {
        const { count } = await client
          .from('videos')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', true);

        return {
          ...category,
          video_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('获取视频分类失败:', error);
    // 发生错误时返回 mock 数据
    return NextResponse.json({ data: mockCategories });
  }
}
