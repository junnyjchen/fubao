/**
 * @fileoverview 管理后台 - 权限管理 API
 */
import { NextResponse } from 'next/server';

/** 获取权限列表 */
export async function GET() {
  try {
    // 返回预定义权限列表
    const permissions = [
      { id: 1, name: 'goods', label: '商品管理', actions: ['view', 'create', 'update', 'delete'] },
      { id: 2, name: 'orders', label: '訂單管理', actions: ['view', 'update'] },
      { id: 3, name: 'users', label: '用戶管理', actions: ['view', 'update', 'delete'] },
      { id: 4, name: 'merchants', label: '商家管理', actions: ['view', 'update', 'audit'] },
      { id: 5, name: 'news', label: '新聞管理', actions: ['view', 'create', 'update', 'delete'] },
      { id: 6, name: 'settings', label: '系統設置', actions: ['view', 'update'] },
      { id: 7, name: 'ai', label: 'AI管理', actions: ['view', 'update'] },
      { id: 8, name: 'finance', label: '財務管理', actions: ['view', 'audit'] },
    ];
    return NextResponse.json({ success: true, data: permissions });
  } catch {
    return NextResponse.json({ success: false, error: '獲取權限失敗' }, { status: 500 });
  }
}
