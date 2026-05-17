/**
 * @fileoverview 系统设置 API
 * @description 提供系统设置的查询和更新接口 - MySQL 实现
 * @module app/api/settings/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate } from '@/lib/db';

/** 默认设置配置 */
const defaultSettings = [
  // 基础设置
  { key: 'site_name', value: '符寶網', label: '網站名稱', type: 'text', group: 'basic', sort: 1, description: '顯示在瀏覽器標籤和網站頂部' },
  { key: 'site_logo', value: '', label: '網站Logo', type: 'text', group: 'basic', sort: 2 },
  { key: 'site_title', value: '符寶網 - 全球玄門文化科普交易平台', label: '網站標題', type: 'text', group: 'basic', sort: 3 },
  { key: 'site_description', value: '全球玄門文化科普交易平台', label: '網站描述', type: 'textarea', group: 'basic', sort: 4 },
  { key: 'site_keywords', value: '符籙,法器,玄門文化', label: '網站關鍵詞', type: 'text', group: 'basic', sort: 5 },
  { key: 'contact_email', value: 'contact@fubao.com', label: '聯繫郵箱', type: 'text', group: 'basic', sort: 6 },
  { key: 'contact_phone', value: '400-888-8888', label: '聯繫電話', type: 'text', group: 'basic', sort: 7 },
  { key: 'default_language', value: 'zh-TW', label: '默認語言', type: 'select', group: 'basic', sort: 8, options: 'zh-TW,zh-CN,en' },
  { key: 'default_currency', value: 'HKD', label: '默認貨幣', type: 'select', group: 'basic', sort: 9, options: 'HKD,CNY,USD' },
  // 支付设置
  { key: 'alipay_enabled', value: 'false', label: '啟用支付寶', type: 'boolean', group: 'payment', sort: 1 },
  { key: 'wechat_enabled', value: 'false', label: '啟用微信支付', type: 'boolean', group: 'payment', sort: 2 },
  { key: 'paypal_enabled', value: 'false', label: '啟用PayPal', type: 'boolean', group: 'payment', sort: 3 },
  // 物流设置
  { key: 'free_shipping_enabled', value: 'true', label: '啟用免運費', type: 'boolean', group: 'shipping', sort: 1 },
  { key: 'free_shipping_amount', value: '99', label: '免運費門檻', type: 'number', group: 'shipping', sort: 2 },
  { key: 'default_shipping_fee', value: '10', label: '默認運費', type: 'number', group: 'shipping', sort: 3 },
  // 通知设置
  { key: 'email_notification_enabled', value: 'false', label: '啟用郵件通知', type: 'boolean', group: 'notification', sort: 1 },
  // 安全设置
  { key: 'captcha_enabled', value: 'false', label: '啟用驗證碼', type: 'boolean', group: 'security', sort: 1 },
  { key: 'login_attempt_limit', value: '5', label: '登錄嘗試次數', type: 'number', group: 'security', sort: 2 },
];

/**
 * GET - 获取设置
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');

    let rows;
    if (group) {
      rows = await query('SELECT * FROM settings WHERE `group` = ? ORDER BY id', [group]);
    } else {
      rows = await query('SELECT * FROM settings ORDER BY `group`, id');
    }

    // 如果数据库为空，用默认设置初始化
    if (!rows || rows.length === 0) {
      for (const setting of defaultSettings) {
        await dbInsert('settings', {
          'group': setting.group,
          'key': setting.key,
          value: setting.value,
        });
      }
      rows = await query('SELECT * FROM settings ORDER BY `group`, id');
    }

    // 合并默认设置中的 label/type/description 信息
    const data = rows.map((row: Record<string, unknown>) => {
      const defaultItem = defaultSettings.find(s => s.key === row.key);
      return {
        ...row,
        label: defaultItem?.label || row.key,
        type: defaultItem?.type || 'text',
        description: defaultItem?.description || '',
        sort: defaultItem?.sort || 0,
        options: defaultItem?.options || '',
      };
    });

    // 按 group 分组
    const grouped: Record<string, unknown[]> = {};
    for (const item of data) {
      const g = String(item.group || 'basic');
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(item);
    }

    return NextResponse.json({ data: grouped });
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json({ data: {} });
  }
}

/**
 * PUT - 更新设置
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: '無效的設置數據' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      // Try update first, insert if not exists
      const existing = await queryOne('SELECT id FROM settings WHERE `key` = ?', [key]);
      if (existing) {
        await dbUpdate('settings', { value }, { key });
      } else {
        await dbInsert('settings', { 'group': 'basic', 'key': key, value });
      }
    }

    return NextResponse.json({ message: '設置保存成功' });
  } catch (error) {
    console.error('保存设置失败:', error);
    return NextResponse.json({ error: '保存設置失敗' }, { status: 500 });
  }
}
