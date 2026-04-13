import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from './supabase-client';

/**
 * 服务端 Supabase Admin 客户端（延迟初始化）
 * 用于 API 路由和 Server Actions 中需要管理员权限的操作
 */
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const { url, anonKey } = getSupabaseCredentials();
  
  // 使用 service role key 如果存在，否则降级使用 anon key
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || anonKey;
  
  supabaseAdminInstance = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

/**
 * @deprecated 使用 getSupabaseAdmin() 替代
 */
export const supabaseAdmin = {
  get client() {
    return getSupabaseAdmin();
  }
} as unknown as SupabaseClient;
