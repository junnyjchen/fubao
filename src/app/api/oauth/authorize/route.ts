/**
 * @fileoverview OAuth授权URL生成
 * @description 生成第三方登录授权URL
 * @module app/api/oauth/authorize/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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

    if (!provider || !OAUTH_CONFIGS[provider]) {
      return NextResponse.json({ error: '不支持的登錄方式' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data: providerConfig, error } = await client
      .from('oauth_providers')
      .select('*')
      .eq('provider', provider)
      .eq('enabled', true)
      .single();

    if (error || !providerConfig) {
      return NextResponse.json({ error: '該登錄方式未啟用' }, { status: 400 });
    }

    const config = OAUTH_CONFIGS[provider];
    const state = Buffer.from(JSON.stringify({
      provider,
      redirect,
      timestamp: Date.now(),
    })).toString('base64url');

    // 构建授权URL
    const params = new URLSearchParams({
      client_id: providerConfig.client_id || '',
      redirect_uri: providerConfig.redirect_uri || `${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/oauth/callback`,
      response_type: 'code',
      state,
    });

    // 添加scope
    const scopes = providerConfig.scopes || config.defaultScopes;
    params.set(config.scopeParam, scopes.join(' '));

    // 特殊处理微信
    if (provider === 'wechat') {
      params.set('appid', providerConfig.client_id || '');
      params.delete('client_id');
    }

    const authorizeUrl = `${config.authorizeUrl}?${params.toString()}`;

    return NextResponse.json({ authorizeUrl });
  } catch (error) {
    console.error('生成授权URL失败:', error);
    return NextResponse.json({ error: '生成授權鏈接失敗' }, { status: 500 });
  }
}
