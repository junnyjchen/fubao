/**
 * @fileoverview Supabase 服务端客户端
 * @description 用于API路由中的服务端Supabase客户端
 * @module lib/supabase/server
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 创建服务端Supabase客户端
 * 用于API路由中获取用户认证信息
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseCredentials();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 在Server Component中无法设置cookie
          // 这个错误可以忽略
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
