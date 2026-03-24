/**
 * @fileoverview 数据库初始化API路由
 * @description 初始化晒图相关数据库表
 * @module app/api/init/shares/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/init/shares - 初始化晒图表结构
 */
export async function POST(request: NextRequest) {
  try {
    // 检查 shares 表是否存在
    const { error: checkError } = await supabase
      .from('shares')
      .select('id')
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: '曬圖表已存在',
      });
    }

    // 创建 shares 表
    const createSharesTable = `
      CREATE TABLE IF NOT EXISTS shares (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        goods_id BIGINT,
        order_id BIGINT,
        content TEXT NOT NULL,
        images TEXT[] DEFAULT '{}',
        video_url VARCHAR(500),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        is_anonymous BOOLEAN DEFAULT FALSE,
        status SMALLINT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const createLikesTable = `
      CREATE TABLE IF NOT EXISTS share_likes (
        id BIGSERIAL PRIMARY KEY,
        share_id BIGINT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(share_id, user_id)
      );
    `;

    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS share_comments (
        id BIGSERIAL PRIMARY KEY,
        share_id BIGINT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        status SMALLINT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 执行创建表的SQL
    const { error: sharesError } = await supabase.rpc('exec_sql', { sql: createSharesTable });
    const { error: likesError } = await supabase.rpc('exec_sql', { sql: createLikesTable });
    const { error: commentsError } = await supabase.rpc('exec_sql', { sql: createCommentsTable });

    if (sharesError || likesError || commentsError) {
      console.error('创建表失败:', { sharesError, likesError, commentsError });
      
      // 即使RPC失败，也尝试直接插入测试数据来创建表结构
      return NextResponse.json({
        success: false,
        message: '需要在 Supabase 控制台手動執行建表腳本',
        sql: `
-- 請在 Supabase SQL Editor 中執行以下腳本：

CREATE TABLE IF NOT EXISTS shares (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  goods_id BIGINT,
  order_id BIGINT,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS share_likes (
  id BIGSERIAL PRIMARY KEY,
  share_id BIGINT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(share_id, user_id)
);

CREATE TABLE IF NOT EXISTS share_comments (
  id BIGSERIAL PRIMARY KEY,
  share_id BIGINT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: '曬圖表創建成功',
    });
  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: '初始化失敗',
      message: '請在 Supabase SQL Editor 中執行 /scripts/create-shares-tables.sql 腳本',
    }, { status: 500 });
  }
}

/**
 * GET /api/init/shares - 检查晒图表状态
 */
export async function GET(request: NextRequest) {
  const results: Record<string, boolean> = {};
  
  try {
    // 检查 shares 表
    const { error: sharesError } = await supabase.from('shares').select('id').limit(1);
    results.shares = !sharesError;
    
    // 检查 share_likes 表
    const { error: likesError } = await supabase.from('share_likes').select('id').limit(1);
    results.share_likes = !likesError;
    
    // 检查 share_comments 表
    const { error: commentsError } = await supabase.from('share_comments').select('id').limit(1);
    results.share_comments = !commentsError;

    const allExist = results.shares && results.share_likes && results.share_comments;

    return NextResponse.json({
      success: true,
      tables: results,
      initialized: allExist,
      message: allExist 
        ? '所有曬圖表已就緒' 
        : '部分表缺失，請執行建表腳本',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      tables: results,
      initialized: false,
    });
  }
}
