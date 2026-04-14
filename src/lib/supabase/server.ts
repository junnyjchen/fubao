/**
 * @fileoverview Supabase 服务端客户端
 * @description 用于API路由中的服务端Supabase客户端（MySQL实现）
 * @module lib/supabase/server
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { DatabaseClient } from '@/storage/database/supabase-client';

/**
 * 创建服务端Supabase客户端
 * 用于API路由中获取用户认证信息
 * 注意：MySQL实现不支持真实的auth，使用本地存储的user_id
 */
export async function createClient(): Promise<DatabaseClient> {
  // 返回 MySQL 数据库客户端
  // auth相关操作会返回mock数据
  return getSupabaseClient();
}
