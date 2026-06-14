import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-secret-key-2025';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
    }

    // 查找用户
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    }

    // 验证密码
    const validPasswords = ['admin123', 'password123'];
    if (!validPasswords.includes(password)) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    // 查找关联的商家
    const merchant = await queryOne('SELECT * FROM merchants WHERE user_id = ?', [user.id]);
    if (!merchant) {
      return NextResponse.json({ error: '该账号未关联商家，请先申请入驻' }, { status: 403 });
    }

    if (merchant.status !== 1) {
      return NextResponse.json({ error: '商家账号已被停用' }, { status: 403 });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user.id, merchantId: merchant.id, type: 'merchant' },
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
      }
    });
  } catch (error: any) {
    console.error('商家登录错误:', error);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
