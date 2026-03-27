/**
 * @fileoverview OAuth授权URL生成
 * @description 生成第三方登录授权URL
 * @module app/api/oauth/authorize/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 生成随机字符串
 */
function generateNonce(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * OAuth提供商配置
 */
const OAUTH_CONFIGS: Record<string, {
  authorizeUrl: string;
  scopeParam: string;
  defaultScopes: string[];
}> = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopeParam: 'scope',
    defaultScopes: ['openid', 'email', 'profile'],
  },
  facebook: {
    authorizeUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopeParam: 'scope',
    defaultScopes: ['email', 'public_profile'],
  },
  wechat: {
    authorizeUrl: 'https://open.weixin.qq.com/connect/qrconnect',
    scopeParam: 'scope',
    defaultScopes: ['snsapi_login'],
  },
  x: {
    authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
    scopeParam: 'scope',
    defaultScopes: ['tweet.read', 'users.read', 'offline.access'],
  },
};

/**
 * 生成OAuth授权URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const redirect = searchParams.get('redirect') || '/';
    const action = searchParams.get('action') || 'login'; // login 或 bind

    if (!provider || !OAUTH_CONFIGS[provider]) {
      return NextResponse.json({ error: '不支持的登錄方式' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data: providerConfig, error } = await client
      .from('oauth_providers')
      .select('*')
      .eq('provider', provider)
      .eq('enabled', true)
      .maybeSingle();

    if (error || !providerConfig) {
      return NextResponse.json({ error: '該登錄方式未啟用' }, { status: 400 });
    }

    const config = OAUTH_CONFIGS[provider];
    
    // 生成随机nonce用于CSRF防护
    const nonce = generateNonce(32);
    const state = Buffer.from(JSON.stringify({
      provider,
      redirect,
      action,
      nonce,
      timestamp: Date.now(),
    })).toString('base64url');

    // 将nonce存储到cookie中，用于后续验证
    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${provider}`, nonce, {
      httpOnly: true,
      secure: process.env.COZE_PROJECT_ENV === 'PROD',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10分钟有效
      path: '/',
    });

    // 构建授权URL
    const params = new URLSearchParams({
      client_id: providerConfig.client_id || '',
      redirect_uri: providerConfig.redirect_uri || `${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/oauth/callback`,
      response_type: 'code',
      state,
    });

    // 添加scope
    const scopes = providerConfig.scope ? providerConfig.scope.split(',').map((s: string) => s.trim()) : config.defaultScopes;
    params.set(config.scopeParam, scopes.join(' '));

    // 特殊处理微信
    if (provider === 'wechat') {
      params.set('appid', providerConfig.client_id || '');
      params.delete('client_id');
    }

    // X (Twitter) 需要添加 code_challenge (PKCE)
    if (provider === 'x') {
      // 简化处理：使用state作为code_verifier
      const codeChallenge = Buffer.from(nonce).toString('base64url').substring(0, 43);
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'plain');
    }

    const authorizeUrl = `${config.authorizeUrl}?${params.toString()}`;

    return NextResponse.json({ authorizeUrl });
  } catch (error) {
    console.error('生成授权URL失败:', error);
    return NextResponse.json({ error: '生成授權鏈接失敗' }, { status: 500 });
  }
}
