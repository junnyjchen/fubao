/**
 * @fileoverview 权限定义 API
 * @description 获取所有权限定义
 * @module app/api/admin/permissions/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 预设权限列表 */
const defaultPermissions = [
  // 系统管理
  { id: 1, name: '系统设置', code: 'system.settings', group_name: 'system', description: '管理系统设置' },
  { id: 2, name: '角色管理', code: 'system.roles', group_name: 'system', description: '管理角色' },
  { id: 3, name: '管理员管理', code: 'system.admins', group_name: 'system', description: '管理管理员账户' },
  
  // 内容管理
  { id: 10, name: '内容管理', code: 'content.view', group_name: 'content', description: '查看内容' },
  { id: 11, name: '新闻管理', code: 'content.news', group_name: 'content', description: '管理新闻' },
  { id: 12, name: '百科管理', code: 'content.wiki', group_name: 'content', description: '管理百科' },
  { id: 13, name: '视频管理', code: 'content.video', group_name: 'content', description: '管理视频' },
  
  // 商品管理
  { id: 20, name: '商品管理', code: 'goods.view', group_name: 'goods', description: '查看商品' },
  { id: 21, name: '商品编辑', code: 'goods.edit', group_name: 'goods', description: '编辑商品' },
  { id: 22, name: '商品上下架', code: 'goods.status', group_name: 'goods', description: '商品上下架' },
  { id: 23, name: '商品删除', code: 'goods.delete', group_name: 'goods', description: '删除商品' },
  
  // 商户管理
  { id: 30, name: '商户管理', code: 'merchant.view', group_name: 'merchant', description: '查看商户' },
  { id: 31, name: '商户审核', code: 'merchant.audit', group_name: 'merchant', description: '审核商户' },
  { id: 32, name: '商户编辑', code: 'merchant.edit', group_name: 'merchant', description: '编辑商户' },
  
  // 订单管理
  { id: 40, name: '订单管理', code: 'order.view', group_name: 'order', description: '查看订单' },
  { id: 41, name: '订单处理', code: 'order.process', group_name: 'order', description: '处理订单' },
  { id: 42, name: '退款管理', code: 'order.refund', group_name: 'order', description: '处理退款' },
  
  // 用户管理
  { id: 50, name: '用户管理', code: 'user.view', group_name: 'user', description: '查看用户' },
  { id: 51, name: '用户编辑', code: 'user.edit', group_name: 'user', description: '编辑用户' },
  
  // 运营管理
  { id: 60, name: 'Banner管理', code: 'operation.banner', group_name: 'operation', description: '管理Banner' },
  { id: 61, name: '页面装修', code: 'operation.page', group_name: 'operation', description: '页面装修' },
  { id: 62, name: '活动管理', code: 'operation.activity', group_name: 'operation', description: '活动管理' },
  { id: 63, name: '优惠券管理', code: 'operation.coupon', group_name: 'operation', description: '优惠券管理' },
  
  // 数据统计
  { id: 70, name: '数据统计', code: 'data.stats', group_name: 'data', description: '查看统计数据' },
  { id: 71, name: '数据导出', code: 'data.export', group_name: 'data', description: '导出数据' },
];

/** 权限分组 */
const permissionGroups = [
  { key: 'system', name: '系统管理', icon: 'Settings' },
  { key: 'content', name: '内容管理', icon: 'FileText' },
  { key: 'goods', name: '商品管理', icon: 'ShoppingBag' },
  { key: 'merchant', name: '商户管理', icon: 'Store' },
  { key: 'order', name: '订单管理', icon: 'ClipboardList' },
  { key: 'user', name: '用户管理', icon: 'Users' },
  { key: 'operation', name: '运营管理', icon: 'BarChart' },
  { key: 'data', name: '数据统计', icon: 'PieChart' },
];

// GET - 获取权限列表
export async function GET() {
  try {
    const client = getSupabaseClient();

    try {
      const { data, error } = await client
        .from('permissions')
        .select('*')
        .order('group_name', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            permissions: data,
            groups: permissionGroups,
          },
        });
      }
    } catch (dbErr) {
      console.error('数据库查询失败:', dbErr);
    }

    // 返回默认数据
    return NextResponse.json({
      success: true,
      data: {
        permissions: defaultPermissions,
        groups: permissionGroups,
      },
    });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return NextResponse.json({
      success: true,
      data: {
        permissions: defaultPermissions,
        groups: permissionGroups,
      },
    });
  }
}
