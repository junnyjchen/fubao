/**
 * @fileoverview 邮件服务 API
 * @description SMTP 连接测试 + 邮件发送
 * @module app/api/admin/email/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { testConnection, sendMail, getSmtpConfigFromDB } from '@/lib/email/service';

/**
 * POST - 测试 SMTP 连接 / 发送测试邮件
 * Body: { action: 'test' | 'send', to?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'test', to } = body;

    if (action === 'test') {
      // 测试 SMTP 连接
      const result = await testConnection();
      if (result.success) {
        return NextResponse.json({ success: true, message: 'SMTP 連接成功' });
      }
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    if (action === 'send') {
      // 发送测试邮件
      if (!to) {
        return NextResponse.json({ error: '請提供收件人郵箱' }, { status: 400 });
      }

      const config = await getSmtpConfigFromDB();
      if (!config) {
        return NextResponse.json({ error: 'SMTP 未配置，請先在設置中填寫SMTP信息' }, { status: 400 });
      }

      const result = await sendMail({
        to,
        subject: '符寶網 - 郵件服務測試',
        html: `
          <div style="max-width: 500px; margin: 0 auto; font-family: sans-serif; padding: 24px;">
            <div style="background: linear-gradient(135deg, #d4a853 0%, #b8860b 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h2 style="color: #fff; margin: 0;">符寶網</h2>
            </div>
            <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #333;">郵件服務測試成功！</p>
              <p style="color: #666;">如果您收到此郵件，說明SMTP配置正確，郵件服務運行正常。</p>
              <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-top: 16px;">
                <p style="margin: 0; color: #999; font-size: 13px;">發送時間：${new Date().toLocaleString('zh-TW')}</p>
                <p style="margin: 4px 0 0; color: #999; font-size: 13px;">SMTP伺服器：${config.host}:${config.port}</p>
                <p style="margin: 4px 0 0; color: #999; font-size: 13px;">發件人：${config.user}</p>
              </div>
            </div>
          </div>
        `,
      });

      if (result.success) {
        return NextResponse.json({ success: true, message: `測試郵件已發送至 ${to}` });
      }
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ error: '無效的操作' }, { status: 400 });
  } catch (error) {
    console.error('[Email API] 错误:', error);
    return NextResponse.json({ error: '郵件服務錯誤' }, { status: 500 });
  }
}

/**
 * GET - 查询 SMTP 配置状态
 */
export async function GET() {
  try {
    const config = await getSmtpConfigFromDB();
    if (!config) {
      return NextResponse.json({ configured: false, message: 'SMTP 未配置' });
    }

    return NextResponse.json({
      configured: true,
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      fromName: config.fromName,
    });
  } catch (error) {
    console.error('[Email API] 查询配置错误:', error);
    return NextResponse.json({ configured: false, message: '查詢配置失敗' });
  }
}
