import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 默认货币数据
const DEFAULT_CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币', rate: 1, locale: 'zh-CN', is_default: 1 },
  { code: 'USD', symbol: '$', name: '美元', rate: 7.25, locale: 'en-US', is_default: 0 },
  { code: 'EUR', symbol: '€', name: '欧元', rate: 7.89, locale: 'de-DE', is_default: 0 },
  { code: 'GBP', symbol: '£', name: '英镑', rate: 9.18, locale: 'en-GB', is_default: 0 },
  { code: 'JPY', symbol: '¥', name: '日元', rate: 0.048, locale: 'ja-JP', is_default: 0 },
  { code: 'KRW', symbol: '₩', name: '韩元', rate: 0.0054, locale: 'ko-KR', is_default: 0 },
  { code: 'TWD', symbol: 'NT$', name: '新台币', rate: 0.23, locale: 'zh-TW', is_default: 0 },
  { code: 'HKD', symbol: 'HK$', name: '港币', rate: 0.93, locale: 'zh-HK', is_default: 0 },
  { code: 'SGD', symbol: 'S$', name: '新加坡元', rate: 5.42, locale: 'en-SG', is_default: 0 },
  { code: 'MYR', symbol: 'RM', name: '马来西亚林吉特', rate: 1.55, locale: 'ms-MY', is_default: 0 },
];

// GET /api/currencies - 获取货币列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    let currencies = await query('SELECT * FROM currencies ORDER BY is_default DESC, code ASC');

    // 如果数据库为空，初始化默认数据
    if (!currencies || currencies.length === 0) {
      for (const c of DEFAULT_CURRENCIES) {
        await query(
          `INSERT INTO currencies (code, symbol, name, rate, locale, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
          [c.code, c.symbol, c.name, c.rate, c.locale, c.is_default]
        );
      }
      currencies = await query('SELECT * FROM currencies ORDER BY is_default DESC, code ASC');
    }

    if (code) {
      currencies = (currencies || []).filter((c: any) => c.code === code);
    }

    return NextResponse.json({ currencies });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
