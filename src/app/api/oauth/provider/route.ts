/**
 * @fileoverview OAuth 第三方登录 API
 */
import { NextResponse } from 'next/server';

/** OAuth 回调 - 占位实现 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'unknown';
  return NextResponse.json({ success: false, error: `${provider} 登錄暫未開通` }, { status: 501 });
}

export async function POST(request: Request) {
  return NextResponse.json({ success: false, error: '第三方登錄暫未開通' }, { status: 501 });
}
