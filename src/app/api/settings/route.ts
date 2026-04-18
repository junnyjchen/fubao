/* @ts-nocheck */
/**
 * @fileoverview 系统设置 API
 * @description 提供系统设置的查询和更新接口
 * @module app/api/settings/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 设置项类型 */
interface SettingItem {
  id?: number;
  key: string;
  value: string;
  label: string;
  type: string;
  group: string;
  options?: string;
  description?: string;
  sort: number;
}

/** 默认设置配置 */
const defaultSettings: SettingItem[] = [
  // 基础设置
  { key: 'site_name', value: '符寶網', label: '網站名稱', type: 'text', group: 'basic', sort: 1, description: '顯示在瀏覽器標籤和網站頂部' },
  { key: 'site_logo', value: '', label: '網站Logo', type: 'text', group: 'basic', sort: 2, description: '輸入Logo圖片URL' },
  { key: 'site_description', value: '全球玄門文化科普交易平台', label: '網站描述', type: 'textarea', group: 'basic', sort: 3, description: '用於SEO描述' },
  { key: 'site_keywords', value: '符籙,法器,玄門文化', label: '網站關鍵詞', type: 'text', group: 'basic', sort: 4, description: '用於SEO，用逗號分隔' },
  { key: 'contact_email', value: '', label: '聯繫郵箱', type: 'text', group: 'basic', sort: 5 },
  { key: 'contact_phone', value: '', label: '聯繫電話', type: 'text', group: 'basic', sort: 6 },
  { key: 'contact_address', value: '', label: '聯繫地址', type: 'textarea', group: 'basic', sort: 7 },
  { key: 'default_language', value: 'zh-TW', label: '默認語言', type: 'select', group: 'basic', sort: 8, options: 'zh-TW,zh-CN,en', description: '繁體中文,簡體中文,English' },
  { key: 'default_currency', value: 'HKD', label: '默認貨幣', type: 'select', group: 'basic', sort: 9, options: 'HKD,CNY,USD', description: '港幣,人民幣,美元' },
  // 支付设置
  { key: 'alipay_enabled', value: 'false', label: '啟用支付寶', type: 'boolean', group: 'payment', sort: 1 },
  { key: 'alipay_app_id', value: '', label: '支付寶AppID', type: 'text', group: 'payment', sort: 2 },
  { key: 'wechat_enabled', value: 'false', label: '啟用微信支付', type: 'boolean', group: 'payment', sort: 3 },
  { key: 'wechat_app_id', value: '', label: '微信AppID', type: 'text', group: 'payment', sort: 4 },
  { key: 'paypal_enabled', value: 'false', label: '啟用PayPal', type: 'boolean', group: 'payment', sort: 5 },
  { key: 'paypal_client_id', value: '', label: 'PayPal Client ID', type: 'text', group: 'payment', sort: 6 },
  // 物流设置
  { key: 'free_shipping_enabled', value: 'true', label: '啟用免運費', type: 'boolean', group: 'shipping', sort: 1 },
  { key: 'free_shipping_amount', value: '500', label: '免運費門檻', type: 'number', group: 'shipping', sort: 2, description: '訂單金額超過此數值免運費' },
  { key: 'default_shipping_fee', value: '30', label: '默認運費', type: 'number', group: 'shipping', sort: 3, description: '默認運費金額' },
  // 通知设置
  { key: 'email_notification_enabled', value: 'false', label: '啟用郵件通知', type: 'boolean', group: 'notification', sort: 1 },
  { key: 'smtp_host', value: '', label: 'SMTP服務器', type: 'text', group: 'notification', sort: 2 },
  { key: 'smtp_port', value: '587', label: 'SMTP端口', type: 'number', group: 'notification', sort: 3 },
  { key: 'smtp_user', value: '', label: 'SMTP用戶名', type: 'text', group: 'notification', sort: 4 },
  { key: 'smtp_password', value: '', label: 'SMTP密碼', type: 'password', group: 'notification', sort: 5 },
  // 安全设置
  { key: 'captcha_enabled', value: 'false', label: '啟用驗證碼', type: 'boolean', group: 'security', sort: 1 },
  { key: 'login_attempt_limit', value: '5', label: '登錄嘗試次數', type: 'number', group: 'security', sort: 2, description: '超過次數後鎖定賬戶' },
  { key: 'session_timeout', value: '30', label: '會話超時時間(分鐘)', type: 'number', group: 'security', sort: 3 },
  { key: 'https_only', value: 'true', label: '強制HTTPS', type: 'boolean', group: 'security', sort: 4 },
];

/**
 * 初始化默认设置
 * @param client - Supabase客户端
 */
async function initDefaultSettings(client: ReturnType<typeof getSupabaseClient>) {
  for (const setting of defaultSettings) {
    await client
      .from('settings')
      .upsert({
        key: setting.key,
        value: setting.value,
        label: setting.label,
        type: setting.type,
        group: setting.group,
        options: setting.options,
        description: setting.description,
        sort: setting.sort,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
  }
}

/**
 * 获取系统设置
 * @param request - 请求对象
 * @returns 系统设置响应
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    const client = getSupabaseClient();

    // 检查表是否存在，如果不存在则初始化默认设置
    const { error: checkError } = await client
      .from('settings')
      .select('id')
      .limit(1);

    if (checkError) {
      // 表可能刚创建，尝试初始化默认设置
      await initDefaultSettings(client);
    }

    if (key) {
      // 获取单个设置
      const { data, error } = await client
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        // 如果找不到，返回默认值
        const defaultSetting = defaultSettings.find(s => s.key === key);
        if (defaultSetting) {
          return NextResponse.json({ data: defaultSetting });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // 获取所有设置
      const { data, error } = await client
        .from('settings')
        .select('*')
        .order('group', { ascending: true })
        .order('sort', { ascending: true });

      if (error) {
        // 如果出错，返回默认设置
        const groupedData = defaultSettings.reduce(
          (acc, item) => {
            const group = item.group || 'general';
            if (!acc[group]) {
              acc[group] = [];
            }
            acc[group].push({
              id: 0,
              key: item.key,
              value: item.value,
              label: item.label,
              type: item.type,
              group: item.group,
              options: item.options,
              description: item.description,
              sort: item.sort,
            });
            return acc;
          },
          {} as Record<string, typeof defaultSettings>
        );
        return NextResponse.json({ data: groupedData });
      }

      // 按组分类
      const groupedData = (data || []).reduce(
        (acc, item) => {
          const group = item.group || 'general';
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(item);
          return acc;
        },
        {} as Record<string, typeof data>
      );

      return NextResponse.json({ data: groupedData });
    }
  } catch (error) {
    // 发生错误时返回默认设置
    const groupedData = defaultSettings.reduce(
      (acc, item) => {
        const group = item.group || 'general';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push({
          id: 0,
          key: item.key,
          value: item.value,
          label: item.label,
          type: item.type,
          group: item.group,
          options: item.options,
          description: item.description,
          sort: item.sort,
        });
        return acc;
      },
      {} as Record<string, typeof defaultSettings>
    );
    return NextResponse.json({ data: groupedData });
  }
}

/**
 * 更新系统设置
 * @param request - 请求对象
 * @returns 更新结果
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { group, settings: updates } = body;
    const client = getSupabaseClient();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: '參數錯誤' }, { status: 400 });
    }

    // 批量更新
    for (const item of updates) {
      await client
        .from('settings')
        .upsert({
          key: item.key,
          value: item.value,
          group: group,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
    }

    return NextResponse.json({ message: '設置保存成功' });
  } catch (error) {
    console.error('保存设置失败:', error);
    return NextResponse.json(
      { error: '保存設置失敗' },
      { status: 500 }
    );
  }
}

/**
 * 创建设置项
 * @param request - 请求对象
 * @returns 创建结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 批量更新
    const updates = Object.entries(body).map(async ([key, value]) => {
      // 检查是否存在
      const { data: existing } = await client
        .from('settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // 更新
        return client
          .from('settings')
          .update({
            value: String(value),
            updated_at: new Date().toISOString(),
          })
          .eq('key', key);
      } else {
        // 新增
        return client.from('settings').insert({
          key,
          value: String(value),
          group: 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ message: '設置保存成功' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
