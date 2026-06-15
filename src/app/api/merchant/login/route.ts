import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-secret-key-2025';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // 支持邮箱、用户名或登录账号
    const loginAccount = email || username;

    if (!loginAccount || !password) {
      return NextResponse.json({ error: '請輸入賬號和密碼' }, { status: 400 });
    }

    // 优先从 merchants 表的 login_account 字段查找
    let merchant = await queryOne('SELECT * FROM merchants WHERE login_account = ?', [loginAccount]);

    // 兼容旧数据：如果没有 login_account，尝试通过 contact_email 或 name 查找
    if (!merchant) {
      merchant = await queryOne('SELECT * FROM merchants WHERE contact_email = ?', [loginAccount]);
    }
    if (!merchant) {
      merchant = await queryOne('SELECT * FROM merchants WHERE name = ?', [loginAccount]);
    }

    if (!merchant) {
      return NextResponse.json({ error: '商家賬號不存在' }, { status: 401 });
    }

    // 验证密码
    // 优先使用商家自己的 login_password
    const storedPassword = merchant.login_password;
    if (!storedPassword) {
      // 兼容旧数据：没有设置密码的商家使用默认密码
      const validPasswords = ['admin123', 'password123'];
      if (!validPasswords.includes(password)) {
        return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
      }
    } else {
      if (password !== storedPassword) {
        return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
      }
    }

    if (merchant.status !== 1) {
      return NextResponse.json({ error: '商家賬號已被停用' }, { status: 403 });
    }

    // 生成 token
    const token = jwt.sign(
      { merchantId: merchant.id, type: 'merchant' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        type: merchant.type,
        verified: merchant.verified,
        status: merchant.status,
        contact_name: merchant.contact_name,
        contact_phone: merchant.contact_phone,
        contact_email: merchant.contact_email,
        address: merchant.address,
        description: merchant.description,
        logo: merchant.logo || '',
        login_account: merchant.login_account || merchant.contact_email || merchant.name,
      }
    });
  } catch (error: any) {
    console.error('商家登录错误:', error);
    return NextResponse.json({ error: '登錄失敗' }, { status: 500 });
  }
}
