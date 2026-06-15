/**
 * @fileoverview 用户分销中心API
 * @description 分销数据、佣金记录、团队管理
 * @module app/api/distribution/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, count } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

function getUserFromToken(request: NextRequest): { userId: string } | null {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

/**
 * GET /api/distribution - 获取用户分销数据
 * ?action=overview - 总览
 * ?action=team - 团队成员
 * ?action=commissions - 佣金记录
 * ?action=withdrawals - 提现记录
 * ?action=products - 分销商品
 * ?action=links - 分销链接
 */
export async function GET(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'overview';

  try {
    const distributor = await queryOne('SELECT * FROM user_distribution WHERE user_id = ?', [user.userId]);

    if (!distributor || distributor.status !== 1) {
      return NextResponse.json({ error: '您不是分銷員' }, { status: 403 });
    }

    if (action === 'team') {
      const teamMembers = await query("SELECT * FROM user_distribution WHERE parent_id = ? ORDER BY created_at DESC", [distributor.id]);
      return NextResponse.json({ success: true, data: teamMembers });
    }

    if (action === 'commissions') {
      const commissions = await query("SELECT * FROM commission_records WHERE distributor_id = ? ORDER BY created_at DESC LIMIT 50", [distributor.id]);
      return NextResponse.json({ success: true, data: commissions });
    }

    if (action === 'withdrawals') {
      const withdrawals = await query("SELECT * FROM withdrawal_records WHERE distributor_id = ? ORDER BY created_at DESC LIMIT 20", [distributor.id]);
      return NextResponse.json({ success: true, data: withdrawals });
    }

    if (action === 'products') {
      const products = await query("SELECT * FROM goods WHERE status = 1 ORDER BY sales DESC LIMIT 20");
      // 附加分销佣金信息
      const config = await query('SELECT * FROM distribution_config ORDER BY level');
      const level1Rate = config.length > 0 ? (config[0] as any).rate : 10;
      const productsWithCommission = products.map((p: any) => ({
        ...p,
        commission: Math.round(p.price * level1Rate) / 100,
        commission_rate: level1Rate,
      }));
      return NextResponse.json({ success: true, data: productsWithCommission });
    }

    if (action === 'links') {
      const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'www.fubao.ltd';
      return NextResponse.json({
        success: true,
        data: {
          invite_link: `https://${domain}/register?invite=${distributor.invite_code}`,
          invite_code: distributor.invite_code,
          qrcode: `https://${domain}/api/qrcode?code=${distributor.invite_code}`,
        },
      });
    }

    // overview - 总览
    const config = await query('SELECT * FROM distribution_config ORDER BY level');
    return NextResponse.json({
      success: true,
      data: {
        distributor,
        config,
        stats: {
          total_commission: distributor.total_commission || 0,
          available_commission: distributor.available_commission || 0,
          frozen_commission: distributor.frozen_commission || 0,
          withdrawn_commission: distributor.withdrawn_commission || 0,
          team_count: distributor.team_count || 0,
          direct_count: distributor.direct_count || 0,
          total_team_sales: distributor.total_team_sales || 0,
        },
      },
    });
  } catch (error) {
    console.error('[Distribution] 获取数据失败:', error);
    return NextResponse.json({ success: true, data: { distributor: null, stats: {} } });
  }
}

/**
 * POST /api/distribution - 分销操作
 * action=withdraw - 申请提现
 */
export async function POST(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, data } = body;

    const distributor = await queryOne('SELECT * FROM user_distribution WHERE user_id = ?', [user.userId]);
    if (!distributor || distributor.status !== 1) {
      return NextResponse.json({ error: '您不是分銷員' }, { status: 403 });
    }

    if (action === 'withdraw') {
      const { amount, bank_name, bank_account, bank_holder } = data;
      if (!amount || amount < 100) {
        return NextResponse.json({ error: '最低提現金額為100元' }, { status: 400 });
      }
      if (amount > (distributor as any).available_commission) {
        return NextResponse.json({ error: '提現金額超過可用餘額' }, { status: 400 });
      }

      // 创建提现记录
      await insert('withdrawal_records', {
        distributor_id: (distributor as any).id,
        amount,
        bank_name: bank_name || '',
        bank_account: bank_account || '',
        bank_holder: bank_holder || '',
        status: 0, // 待审核
        created_at: new Date().toISOString(),
      });

      // 冻结佣金
      await update('user_distribution', (distributor as any).id, {
        available_commission: Math.round(((distributor as any).available_commission - amount) * 100) / 100,
        frozen_commission: Math.round(((distributor as any).frozen_commission + amount) * 100) / 100,
      });

      return NextResponse.json({ success: true, message: '提現申請已提交' });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('[Distribution] 操作失败:', error);
    return NextResponse.json({ error: '操作失敗' }, { status: 500 });
  }
}
