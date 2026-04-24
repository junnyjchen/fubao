/**
 * @fileoverview 数据导出API
 * @description 支持导出订单、商品、用户等数据
 * @module app/api/admin/export/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 导出类型配置
const exportConfigs = {
  orders: {
    table: 'orders',
    columns: [
      'id', 'order_no', 'user_id', 'total_amount', 'discount_amount',
      'shipping_fee', 'final_amount', 'order_status', 'pay_status',
      'payment_method', 'shipping_name', 'shipping_phone', 
      'shipping_address', 'created_at', 'paid_at', 'shipped_at'
    ],
    headers: {
      id: '訂單ID',
      order_no: '訂單編號',
      user_id: '用戶ID',
      total_amount: '商品總額',
      discount_amount: '優惠金額',
      shipping_fee: '運費',
      final_amount: '實付金額',
      order_status: '訂單狀態',
      pay_status: '支付狀態',
      payment_method: '支付方式',
      shipping_name: '收貨人',
      shipping_phone: '聯繫電話',
      shipping_address: '收貨地址',
      created_at: '創建時間',
      paid_at: '支付時間',
      shipped_at: '發貨時間',
    },
    statusMap: {
      order_status: {
        0: '待付款',
        1: '待發貨',
        2: '已發貨',
        3: '已完成',
        4: '已取消',
        5: '已退款',
      },
      pay_status: {
        0: '未支付',
        1: '已支付',
        2: '已退款',
      },
    },
  },
  goods: {
    table: 'goods',
    columns: [
      'id', 'name', 'category_id', 'merchant_id', 'price', 'original_price',
      'stock', 'sales', 'status', 'is_certified', 'created_at'
    ],
    headers: {
      id: '商品ID',
      name: '商品名稱',
      category_id: '分類ID',
      merchant_id: '商戶ID',
      price: '售價',
      original_price: '原價',
      stock: '庫存',
      sales: '銷量',
      status: '狀態',
      is_certified: '是否認證',
      created_at: '創建時間',
    },
  },
  users: {
    table: 'users',
    columns: [
      'id', 'username', 'email', 'phone', 'level', 'points',
      'balance', 'status', 'created_at', 'last_login_at'
    ],
    headers: {
      id: '用戶ID',
      username: '用戶名',
      email: '郵箱',
      phone: '手機',
      level: '會員等級',
      points: '積分',
      balance: '餘額',
      status: '狀態',
      created_at: '註冊時間',
      last_login_at: '最後登錄',
    },
  },
  merchants: {
    table: 'merchants',
    columns: [
      'id', 'name', 'type', 'contact_name', 'contact_phone',
      'province', 'city', 'rating', 'total_sales', 'status', 'created_at'
    ],
    headers: {
      id: '商戶ID',
      name: '商戶名稱',
      type: '類型',
      contact_name: '聯繫人',
      contact_phone: '聯繫電話',
      province: '省份',
      city: '城市',
      rating: '評分',
      total_sales: '總銷量',
      status: '狀態',
      created_at: '創建時間',
    },
  },
  certificates: {
    table: 'certificates',
    columns: [
      'id', 'certificate_no', 'goods_id', 'merchant_id',
      'issue_date', 'valid_until', 'issued_by', 'created_at'
    ],
    headers: {
      id: 'ID',
      certificate_no: '證書編號',
      goods_id: '商品ID',
      merchant_id: '商戶ID',
      issue_date: '簽發日期',
      valid_until: '有效期至',
      issued_by: '簽發機構',
      created_at: '創建時間',
    },
  },
  coupons: {
    table: 'coupons',
    columns: [
      'id', 'name', 'code', 'type', 'value', 'min_amount',
      'total_count', 'used_count', 'start_time', 'end_time', 'status'
    ],
    headers: {
      id: 'ID',
      name: '名稱',
      code: '優惠碼',
      type: '類型',
      value: '優惠值',
      min_amount: '最低消費',
      total_count: '總數量',
      used_count: '已使用',
      start_time: '開始時間',
      end_time: '結束時間',
      status: '狀態',
    },
  },
};

type ExportType = keyof typeof exportConfigs;

/**
 * 导出数据
 * GET /api/admin/export?type=orders&format=csv
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ExportType;
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!type || !exportConfigs[type]) {
      return NextResponse.json(
        { error: '無效的導出類型' },
        { status: 400 }
      );
    }

    const config = exportConfigs[type];
    const client = getSupabaseClient();

    // 构建查询
    let query = client
      .from(config.table)
      .select(config.columns.join(','));

    // 添加日期筛选
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // 限制导出数量
    query = query.limit(10000);

    const { data, error } = await query;

    if (error) {
      console.error('导出数据失败:', error);
      return NextResponse.json(
        { error: '導出失敗' },
        { status: 500 }
      );
    }

    // 转换数据
    const processedData = (data || []).map(row => {
      const processed: Record<string, unknown> = {};
      config.columns.forEach(col => {
        let value = row[col as keyof typeof row];
        
        // 状态值转换
        const configWithStatusMap = config as typeof config & { statusMap?: Record<string, Record<number, string>> };
        const statusMap = configWithStatusMap.statusMap?.[col];
        if (statusMap && value !== null) {
          value = statusMap[value as number] || value;
        }
        
        // 格式化日期
        if (col.endsWith('_at') && value) {
          value = new Date(value as string).toLocaleString('zh-TW');
        }
        
        // 格式化金额
        if (['price', 'amount', 'balance', 'value'].some(k => col.includes(k)) && value !== null) {
          value = parseFloat(value as string).toFixed(2);
        }
        
        // 格式化布尔值
        if (typeof value === 'boolean') {
          value = value ? '是' : '否';
        }
        
        processed[config.headers[col as keyof typeof config.headers]] = value;
      });
      return processed;
    });

    // 根据格式生成响应
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: processedData,
        total: processedData.length,
      });
    }

    // CSV格式
    const headers = Object.keys(config.headers).map(k => config.headers[k as keyof typeof config.headers]);
    const csvRows = [headers.join(',')];
    
    processedData.forEach(row => {
      const values = headers.map(header => {
        const value = String(row[header] ?? '');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csv = '\uFEFF' + csvRows.join('\n'); // BOM for Chinese support

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('导出错误:', error);
    return NextResponse.json(
      { error: '導出失敗' },
      { status: 500 }
    );
  }
}
