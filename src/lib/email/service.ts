/**
 * @fileoverview 邮件服务 - 基于 Nodemailer + QQ邮箱SMTP
 * @description 提供邮件发送、连接测试等功能
 * @module lib/email/service
 */

import nodemailer from 'nodemailer';
import { queryOne } from '@/lib/db';

/** SMTP 配置 */
interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName?: string;
}

/** 邮件选项 */
interface MailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/** 从数据库获取 SMTP 配置 */
export async function getSmtpConfigFromDB(): Promise<SmtpConfig | null> {
  try {
    const host = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['smtp_host']);
    const port = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['smtp_port']);
    const user = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['smtp_user']);
    const pass = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['smtp_password']);
    const ssl = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['smtp_ssl']);
    const fromName = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['smtp_from_name']);
    const siteName = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['site_name']);

    if (!host?.value || !user?.value || !pass?.value) {
      return null;
    }

    const portNum = parseInt(port?.value || '465');
    const sslEnabled = ssl?.value !== 'false';
    return {
      host: host.value,
      port: portNum,
      secure: portNum === 465 ? true : sslEnabled,
      user: user.value,
      pass: pass.value,
      fromName: fromName?.value || siteName?.value || '符寶網',
    };
  } catch (error) {
    console.error('[Email] 获取SMTP配置失败:', error);
    return null;
  }
}

/** 创建 Nodemailer Transporter */
function createTransporter(config: SmtpConfig) {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    pool: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  } as any);
  return transport;
}

/**
 * 测试 SMTP 连接
 * @returns 成功返回 { success: true }，失败返回 { success: false, error }
 */
export async function testConnection(config?: SmtpConfig): Promise<{ success: boolean; error?: string }> {
  const smtpConfig = config || await getSmtpConfigFromDB();
  if (!smtpConfig) {
    return { success: false, error: 'SMTP 未配置，請先在設置中填寫SMTP信息' };
  }

  try {
    const transporter = createTransporter(smtpConfig);
    await transporter.verify();
    transporter.close();
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '連接失敗';
    console.error('[Email] SMTP连接测试失败:', message);
    return { success: false, error: message };
  }
}

/**
 * 发送邮件
 * @returns 成功返回 { success: true, messageId }，失败返回 { success: false, error }
 */
export async function sendMail(
  options: MailOptions,
  config?: SmtpConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const smtpConfig = config || await getSmtpConfigFromDB();
  if (!smtpConfig) {
    return { success: false, error: 'SMTP 未配置' };
  }

  try {
    const transporter = createTransporter(smtpConfig);

    const result = await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.user}>`,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc) : undefined,
      replyTo: options.replyTo,
    });

    transporter.close();
    console.log(`[Email] 邮件发送成功: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '發送失敗';
    console.error('[Email] 邮件发送失败:', message);
    return { success: false, error: message };
  }
}

/**
 * 发送订单确认邮件
 */
export async function sendOrderConfirmationEmail(
  toEmail: string,
  orderInfo: {
    orderId: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    shippingAddress?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const itemsHtml = orderInfo.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">HK$${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: linear-gradient(135deg, #d4a853 0%, #b8860b 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">符寶網</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">訂單確認通知</p>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; color: #333;">尊敬的客戶，您好！</p>
        <p style="color: #666;">您的訂單已確認，以下是訂單詳情：</p>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #333;">訂單編號：${orderInfo.orderId}</p>
          ${orderInfo.shippingAddress ? `<p style="margin: 0; color: #666; font-size: 14px;">配送地址：${orderInfo.shippingAddress}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px 12px; text-align: left; font-size: 14px; color: #666;">商品</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 14px; color: #666;">數量</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 14px; color: #666;">價格</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: 600; text-align: right; color: #333;">合計：</td>
              <td style="padding: 12px; font-weight: 700; text-align: right; color: #d4a853; font-size: 18px;">HK$${orderInfo.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #999;">
        <p style="margin: 0;">此郵件由符寶網系統自動發送，請勿回覆</p>
        <p style="margin: 4px 0 0;">如有問題請聯繫 support@fubao.ltd</p>
      </div>
    </div>
  `;

  const result = await sendMail({
    to: toEmail,
    subject: `訂單確認 - ${orderInfo.orderId} - 符寶網`,
    html,
  });

  return result;
}

/**
 * 发送注册欢迎邮件
 */
export async function sendWelcomeEmail(
  toEmail: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: linear-gradient(135deg, #d4a853 0%, #b8860b 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">歡迎加入符寶網</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px;">全球玄門文化科普交易平台</p>
      </div>
      <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 18px; color: #333;">${userName}，您好！</p>
        <p style="color: #666; line-height: 1.8;">
          感謝您註冊符寶網！在這裡，您可以：
        </p>
        <ul style="color: #666; line-height: 2;">
          <li>探索正宗符籙、法器、念珠等玄門文化產品</li>
          <li>閱讀專業的玄門百科與文化資訊</li>
          <li>與AI助手對話，獲取玄門知識解答</li>
          <li>參與免費送活動，領取結緣法器</li>
        </ul>
        <a href="/" style="display: inline-block; background: linear-gradient(135deg, #d4a853, #b8860b); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          開始探索
        </a>
      </div>
      <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #999;">
        <p style="margin: 0;">此郵件由符寶網系統自動發送，請勿回覆</p>
      </div>
    </div>
  `;

  const result = await sendMail({
    to: toEmail,
    subject: '歡迎加入符寶網 - 全球玄門文化科普交易平台',
    html,
  });

  return result;
}

/**
 * 发送发货通知邮件
 */
export async function sendShipmentNotificationEmail(
  toEmail: string,
  orderInfo: {
    orderId: string;
    trackingNumber?: string;
    shippingCompany?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: linear-gradient(135deg, #d4a853 0%, #b8860b 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">符寶網</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">發貨通知</p>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; color: #333;">尊敬的客戶，您好！</p>
        <p style="color: #666;">您的訂單已發貨，以下是物流信息：</p>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #333;">訂單編號：${orderInfo.orderId}</p>
          ${orderInfo.trackingNumber ? `<p style="margin: 0 0 4px; color: #666; font-size: 14px;">物流單號：${orderInfo.trackingNumber}</p>` : ''}
          ${orderInfo.shippingCompany ? `<p style="margin: 0; color: #666; font-size: 14px;">物流公司：${orderInfo.shippingCompany}</p>` : ''}
        </div>

        <p style="color: #666; font-size: 14px;">請留意物流動態，如有問題請聯繫客服。</p>
      </div>
      <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #999;">
        <p style="margin: 0;">此郵件由符寶網系統自動發送，請勿回覆</p>
      </div>
    </div>
  `;

  const result = await sendMail({
    to: toEmail,
    subject: `發貨通知 - ${orderInfo.orderId} - 符寶網`,
    html,
  });

  return result;
}
