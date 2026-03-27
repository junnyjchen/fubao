/**
 * @fileoverview OAuth回调处理
 * @description 处理第三方登录回调，完成用户登录/注册
 * @module app/api/oauth/callback/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { generateToken } from '@/lib/auth/utils';

/**
 * OAuth提供商Token配置
 */
const OAUTH_TOKEN_CONFIGS: Record<string, {
  tokenUrl: string;
  userInfoUrl: string;
}> = {
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
  },
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
  },
  wechat: {
    tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    userInfoUrl: 'https://api.weixin.qq.com/sns/userinfo',
  },
  x: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
  },
};

/**
 * 获取OAuth访问令牌
 */
async function getAccessToken(
  provider: string,
  code: string,
  config: { client_id: string; client_secret: string; redirect_uri: string }
): Promise<string> {
  const tokenConfig = OAUTH_TOKEN_CONFIGS[provider];
  if (!tokenConfig) throw new Error('不支持的登錄方式');

  const params = new URLSearchParams({
    client_id: config.client_id,
    client_secret: config.client_secret,
    redirect_uri: config.redirect_uri,
    code,
    grant_type: 'authorization_code',
  });

  // 微信特殊处理
  if (provider === 'wechat') {
    params.set('appid', config.client_id);
    params.delete('client_id');
    params.set('secret', config.client_secret);
    params.delete('client_secret');
  }

  const response = await fetch(tokenConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('获取访问令牌失败:', errorText);
    throw new Error('獲取訪問令牌失敗');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 获取用户信息
 */
async function getUserInfo(
  provider: string,
  accessToken: string
): Promise<{ id: string; email?: string; name?: string; avatar?: string }> {
  const tokenConfig = OAUTH_TOKEN_CONFIGS[provider];
  if (!tokenConfig) throw new Error('不支持的登錄方式');

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // 添加Authorization头
  if (provider === 'x') {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(tokenConfig.userInfoUrl, {
    headers,
  });

  if (!response.ok) {
    throw new Error('獲取用戶信息失敗');
  }

  const data = await response.json();

  // 根据不同提供商解析用户信息
  switch (provider) {
    case 'google':
      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        avatar: data.picture,
      };
    case 'facebook':
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.picture?.data?.url,
      };
    case 'wechat':
      return {
        id: data.unionid || data.openid,
        name: data.nickname,
        avatar: data.headimgurl,
      };
    case 'x':
      return {
        id: data.data?.id,
        name: data.data?.name,
        avatar: data.data?.profile_image_url,
      };
    default:
      return data;
  }
}

/**
 * OAuth回调处理
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');
    const error = searchParams.get('error');

    // 用户取消授权
    if (error) {
      const redirect = stateStr 
        ? JSON.parse(Buffer.from(stateStr, 'base64url').toString()).redirect 
        : '/';
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('授權已取消')}&redirect=${redirect}`, request.url));
    }

    if (!code || !stateStr) {
      return NextResponse.redirect(new URL('/login?error=無效的回調參數', request.url));
    }

    // 解析state
    const state = JSON.parse(Buffer.from(stateStr, 'base64url').toString());
    const { provider, redirect, nonce } = state;

    // 获取cookie store（在整个函数中复用）
    const cookieStore = await cookies();

    // 验证state中的nonce，防止CSRF攻击
    const storedNonce = cookieStore.get(`oauth_state_${provider}`)?.value;
    
    if (!storedNonce || storedNonce !== nonce) {
      console.error('State验证失败:', { storedNonce, nonce });
      return NextResponse.redirect(new URL('/login?error=授權驗證失敗，請重試', request.url));
    }

    // 删除已使用的state cookie
    cookieStore.delete(`oauth_state_${provider}`);

    // 检查state是否过期（10分钟）
    if (Date.now() - state.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(new URL('/login?error=授權已過期，請重試', request.url));
    }

    // 获取提供商配置
    const client = getSupabaseClient();
    const { data: providerConfig, error: configError } = await client
      .from('oauth_providers')
      .select('*')
      .eq('provider', provider)
      .eq('enabled', true)
      .maybeSingle();

    if (configError || !providerConfig) {
      return NextResponse.redirect(new URL('/login?error=該登錄方式未啟用', request.url));
    }

    // 获取访问令牌
    const accessToken = await getAccessToken(provider, code, {
      client_id: providerConfig.client_id || '',
      client_secret: providerConfig.client_secret || '',
      redirect_uri: providerConfig.redirect_uri || `${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/oauth/callback`,
    });

    // 获取用户信息
    const userInfo = await getUserInfo(provider, accessToken);

    if (!userInfo.id) {
      return NextResponse.redirect(new URL('/login?error=獲取用戶信息失敗', request.url));
    }

    // 查找是否已绑定账号
    const { data: existingBind } = await client
      .from('user_oauth_accounts')
      .select('user_id')
      .eq('provider', provider)
      .eq('provider_user_id', userInfo.id)
      .maybeSingle();

    let userId: string;

    if (existingBind) {
      // 已绑定，直接登录
      userId = existingBind.user_id;
    } else {
      // 未绑定，检查邮箱是否存在
      let existingUser: { id: string } | null = null;
      
      if (userInfo.email) {
        const { data } = await client
          .from('users')
          .select('id')
          .eq('email', userInfo.email)
          .maybeSingle();
        existingUser = data;
      }

      if (existingUser) {
        // 邮箱已存在，绑定账号
        userId = existingUser.id;
        await client.from('user_oauth_accounts').insert({
          user_id: userId,
          provider,
          provider_user_id: userInfo.id,
          provider_email: userInfo.email,
          provider_name: userInfo.name,
          provider_avatar: userInfo.avatar,
          access_token: accessToken,
        });
      } else {
        // 创建新用户
        const { data: newUser, error: createError } = await client
          .from('users')
          .insert({
            name: userInfo.name || `用戶${Date.now().toString(36)}`,
            email: userInfo.email || `${userInfo.id}@${provider}.oauth`,
            avatar: userInfo.avatar,
            status: true,
            language: 'zh-TW',
          })
          .select('id')
          .maybeSingle();

        if (createError || !newUser) {
          console.error('创建用户失败:', createError);
          return NextResponse.redirect(new URL('/login?error=創建賬號失敗', request.url));
        }

        userId = newUser.id;

        // 绑定OAuth账号
        await client.from('user_oauth_accounts').insert({
          user_id: userId,
          provider,
          provider_user_id: userInfo.id,
          provider_email: userInfo.email,
          provider_name: userInfo.name,
          provider_avatar: userInfo.avatar,
          access_token: accessToken,
        });
      }
    }

    // 获取用户完整信息
    const { data: user } = await client
      .from('users')
      .select('id, name, email, phone, avatar, language')
      .eq('id', userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=用戶不存在', request.url));
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      email: user.email || '',
    });

    // 设置Cookie
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.COZE_PROJECT_ENV === 'PROD',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // 重定向到目标页面
    return NextResponse.redirect(new URL(redirect, request.url));
  } catch (error) {
    console.error('OAuth回调处理失败:', error);
    return NextResponse.redirect(new URL('/login?error=登錄失敗，請重試', request.url));
  }
}
