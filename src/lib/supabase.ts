/**
 * @fileoverview Supabase 客户端
 * @description 导出 Supabase 客户端供 API 路由使用
 * @module lib/supabase
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

// 导出默认的 Supabase 客户端
export const supabase = getSupabaseClient();
