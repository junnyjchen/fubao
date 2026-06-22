/**
 * @fileoverview 系统设置 API
 * @description 提供系统设置的查询和更新接口
 * @module app/api/settings/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insert, update as dbUpdate } from '@/lib/db';

/** 默认设置配置 */
const defaultSettings = [
  // 基础设置
  { key: 'site_name', value: '符寶網', label: '網站名稱', type: 'text', group: 'basic', sort: 1, description: '顯示在瀏覽器標籤和網站頂部' },
  { key: 'site_logo', value: '', label: '網站Logo', type: 'text', group: 'basic', sort: 2 },
  { key: 'site_title', value: '符寶網 - 全球玄門文化科普交易平台', label: '網站標題', type: 'text', group: 'basic', sort: 3 },
  { key: 'site_description', value: '全球玄門文化科普交易平台', label: '網站描述', type: 'textarea', group: 'basic', sort: 4 },
  { key: 'site_keywords', value: '符籙,法器,玄門文化', label: '網站關鍵詞', type: 'text', group: 'basic', sort: 5 },
  { key: 'contact_email', value: 'support@fubao.ltd', label: '聯繫郵箱', type: 'text', group: 'basic', sort: 6 },
  { key: 'contact_phone', value: '+852 2888 8888', label: '聯繫電話', type: 'text', group: 'basic', sort: 7 },
  { key: 'contact_address', value: '香港九龍觀塘巧明街100號', label: '聯繫地址', type: 'text', group: 'basic', sort: 8 },
  { key: 'default_language', value: 'zh-TW', label: '默認語言', type: 'select', group: 'basic', sort: 9, options: 'zh-TW,zh-CN,en' },
  { key: 'default_currency', value: 'HKD', label: '默認貨幣', type: 'select', group: 'basic', sort: 10, options: 'HKD,CNY,USD' },
  // 支付设置
  { key: 'alipay_enabled', value: 'true', label: '啟用支付寶', type: 'boolean', group: 'payment', sort: 1, description: '啟用後用戶可使用支付寶付款' },
  { key: 'alipay_app_id', value: '', label: '支付寶App ID', type: 'text', group: 'payment', sort: 2, description: '支付寶開放平台應用App ID' },
  { key: 'alipay_private_key', value: '', label: '支付寶私鑰', type: 'password', group: 'payment', sort: 3 },
  { key: 'alipay_public_key', value: '', label: '支付寶公鑰', type: 'password', group: 'payment', sort: 4 },
  { key: 'wechat_enabled', value: 'true', label: '啟用微信支付', type: 'boolean', group: 'payment', sort: 5, description: '啟用後用戶可使用微信支付' },
  { key: 'wechat_app_id', value: '', label: '微信App ID', type: 'text', group: 'payment', sort: 6 },
  { key: 'wechat_mch_id', value: '', label: '微信商戶號', type: 'text', group: 'payment', sort: 7 },
  { key: 'wechat_api_key', value: '', label: '微信API密鑰', type: 'password', group: 'payment', sort: 8 },
  { key: 'paypal_enabled', value: 'false', label: '啟用PayPal', type: 'boolean', group: 'payment', sort: 9, description: '啟用後用戶可使用PayPal付款' },
  { key: 'paypal_client_id', value: '', label: 'PayPal Client ID', type: 'text', group: 'payment', sort: 10 },
  { key: 'paypal_secret', value: '', label: 'PayPal Secret', type: 'password', group: 'payment', sort: 11 },
  { key: 'paypal_sandbox', value: 'true', label: '沙盒模式', type: 'boolean', group: 'payment', sort: 12, description: '開發測試時使用沙盒環境' },
  // Pay Protocol 设置
  { key: 'payprotocol_enabled', value: 'false', label: '啟用Pay Protocol', type: 'boolean', group: 'payment', sort: 13, description: '啟用後用戶可使用Pay Protocol加密貨幣付款' },
  { key: 'payprotocol_api_key', value: '', label: 'Pay Protocol API Key', type: 'text', group: 'payment', sort: 14, description: 'Pay Protocol商戶API Key' },
  { key: 'payprotocol_api_secret', value: '', label: 'Pay Protocol API Secret', type: 'password', group: 'payment', sort: 15, description: 'Pay Protocol商戶API Secret' },
  { key: 'payprotocol_sandbox', value: 'true', label: 'Pay Protocol沙盒模式', type: 'boolean', group: 'payment', sort: 16, description: '開發測試時使用沙盒環境' },
  { key: 'payprotocol_chain_id', value: '136', label: 'Pay Protocol鏈ID', type: 'text', group: 'payment', sort: 17, description: '平台內部鏈ID，136=Tron Nile測試鏈' },
  { key: 'payprotocol_currency', value: 'USDT', label: 'Pay Protocol報價幣種', type: 'select', group: 'payment', sort: 18, options: 'USDT,USDC,ETH,TRX,HKD,USD,CNY', description: '報價幣種符號' },
  { key: 'payprotocol_is_legal_tender', value: '0', label: '法幣報價', type: 'select', group: 'payment', sort: 19, options: '0,1', description: '0=數字貨幣報價,1=法幣報價' },
  // 物流设置
  { key: 'free_shipping_enabled', value: 'true', label: '啟用免運費', type: 'boolean', group: 'shipping', sort: 1, description: '訂單金額達到門檻後免運費' },
  { key: 'free_shipping_amount', value: '99', label: '免運費門檻', type: 'number', group: 'shipping', sort: 2, description: '訂單金額達到此數值免運費' },
  { key: 'default_shipping_fee', value: '10', label: '默認運費', type: 'number', group: 'shipping', sort: 3, description: '未滿免運費門檻時的默認運費' },
  { key: 'shipping_regions', value: '香港,台灣,中國大陸', label: '配送地區', type: 'text', group: 'shipping', sort: 4, description: '支援配送的地區，逗號分隔' },
  { key: 'international_shipping_enabled', value: 'false', label: '啟用國際配送', type: 'boolean', group: 'shipping', sort: 5 },
  { key: 'international_shipping_fee', value: '50', label: '國際運費', type: 'number', group: 'shipping', sort: 6 },
  // 通知设置 - QQ邮箱SMTP默认配置
  { key: 'email_notification_enabled', value: 'false', label: '啟用郵件通知', type: 'boolean', group: 'notification', sort: 1, description: '訂單狀態變更時發送郵件通知（需配置SMTP）' },
  { key: 'smtp_host', value: 'smtp.qq.com', label: 'SMTP伺服器', type: 'text', group: 'notification', sort: 2, description: 'QQ郵箱：smtp.qq.com' },
  { key: 'smtp_port', value: '465', label: 'SMTP端口', type: 'select', group: 'notification', sort: 3, options: '465,587', description: '465=SSL加密, 587=STARTTLS' },
  { key: 'smtp_ssl', value: 'true', label: '啟用SSL加密', type: 'boolean', group: 'notification', sort: 4, description: 'QQ郵箱需啟用SSL' },
  { key: 'smtp_user', value: '', label: 'SMTP用戶名（QQ郵箱地址）', type: 'text', group: 'notification', sort: 5, description: '填寫完整的QQ郵箱地址，如 123456789@qq.com' },
  { key: 'smtp_password', value: '', label: 'SMTP密碼（授權碼）', type: 'password', group: 'notification', sort: 6, description: 'QQ郵箱需使用授權碼而非QQ密碼，在QQ郵箱設置→賬戶→POP3/SMTP服務中生成' },
  { key: 'smtp_from_name', value: '符寶網', label: '發件人名稱', type: 'text', group: 'notification', sort: 7, description: '收件人看到的發件人名稱' },
  { key: 'sms_enabled', value: 'false', label: '啟用短信通知', type: 'boolean', group: 'notification', sort: 8 },
  { key: 'order_notification', value: 'true', label: '訂單通知', type: 'boolean', group: 'notification', sort: 9, description: '新訂單時通知管理員' },
  { key: 'shipment_notification', value: 'true', label: '發貨通知', type: 'boolean', group: 'notification', sort: 10, description: '發貨時通知用戶' },
  { key: 'welcome_email', value: 'true', label: '註冊歡迎郵件', type: 'boolean', group: 'notification', sort: 11, description: '新用戶註冊時發送歡迎郵件' },
  // 安全设置
  { key: 'captcha_enabled', value: 'false', label: '啟用驗證碼', type: 'boolean', group: 'security', sort: 1, description: '登錄和註冊時啟用圖形驗證碼' },
  { key: 'login_attempt_limit', value: '5', label: '登錄嘗試次數', type: 'number', group: 'security', sort: 2, description: '超過次數後鎖定賬戶30分鐘' },
  { key: 'session_timeout', value: '30', label: '會話超時(分鐘)', type: 'number', group: 'security', sort: 3, description: '用戶無操作後自動登出的時間' },
  { key: 'two_factor_enabled', value: 'false', label: '啟用雙因素認證', type: 'boolean', group: 'security', sort: 4, description: '管理員登錄需要雙因素認證' },
  { key: 'ip_whitelist', value: '', label: 'IP白名單', type: 'textarea', group: 'security', sort: 5, description: '允許訪問管理後台的IP，每行一個' },
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
      rows = await query('SELECT * FROM settings WHERE `group_name` = ? ORDER BY id', [group]);
    } else {
      rows = await query('SELECT * FROM settings ORDER BY `group_name`, id');
    }

    // 确保所有分组的默认设置都存在
    const existingKeys = new Set((rows as any[]).map((r: any) => r.key));
    const missingSettings = defaultSettings.filter(s => !existingKeys.has(s.key));

    if (missingSettings.length > 0) {
      for (const setting of missingSettings) {
        await insert('settings', {
          'group_name': setting.group,
          'key': setting.key,
          value: setting.value,
        });
      }
      // 重新查询
      if (group) {
        rows = await query('SELECT * FROM settings WHERE `group_name` = ? ORDER BY id', [group]);
      } else {
        rows = await query('SELECT * FROM settings ORDER BY `group_name`, id');
      }
    }

    // 合并默认设置中的 label/type/description 信息
    const data = (rows as any[]).map((row: any) => {
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
    const grouped: Record<string, any[]> = {};
    for (const item of data) {
      const g = String(item.group || 'basic');
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(item);
    }

    return NextResponse.json({ success: true, data: grouped });
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json({ success: true, data: {} });
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
      const existingRows = await query('SELECT id FROM settings WHERE `key` = ?', [key]);
      if (existingRows && (existingRows as any[]).length > 0) {
        await dbUpdate('settings', { value }, { key });
      } else {
        // 找到默认设置中的 group
        const defaultItem = defaultSettings.find(s => s.key === key);
        await insert('settings', { 'group_name': defaultItem?.group || 'basic', 'key': key, value });
      }
    }

    return NextResponse.json({ success: true, message: '設置保存成功' });
  } catch (error) {
    console.error('保存设置失败:', error);
    return NextResponse.json({ error: '保存設置失敗' }, { status: 500 });
  }
}
