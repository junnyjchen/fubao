/**
 * @fileoverview 数据库备份API
 * @description 数据库备份和恢复管理
 * @module app/api/admin/backup/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 备份记录接口
interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'partial';
  tables?: string[];
  size: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  error?: string;
}

/**
 * 获取备份列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // 获取备份记录
    const { data, error, count } = await supabase
      .from('database_backups')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      // 表可能不存在，返回空数据
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('获取备份列表失败:', error);
    return NextResponse.json(
      { error: '獲取備份列表失敗' },
      { status: 500 }
    );
  }
}

/**
 * 创建备份
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'full', tables } = body;

    // 创建备份记录
    const backupName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    
    const { data: backupRecord, error: insertError } = await supabase
      .from('database_backups')
      .insert({
        name: backupName,
        type,
        tables: tables || null,
        size: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: '創建備份記錄失敗' },
        { status: 500 }
      );
    }

    // 在实际环境中，这里应该触发后台任务执行备份
    // 这里我们模拟备份过程
    try {
      // 获取表数据统计
      const tablesToBackup = type === 'partial' && tables ? tables : [
        'users', 'goods', 'orders', 'order_items', 'categories',
        'cart', 'addresses', 'favorites', 'coupons', 'reviews',
      ];

      let totalSize = 0;
      const backupData: Record<string, unknown[]> = {};

      for (const table of tablesToBackup) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(10000);

        if (!error && data) {
          backupData[table] = data;
          totalSize += JSON.stringify(data).length;
        }
      }

      // 更新备份记录
      const { error: updateError } = await supabase
        .from('database_backups')
        .update({
          size: totalSize,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', backupRecord.id);

      if (updateError) {
        throw new Error('更新備份記錄失敗');
      }

      return NextResponse.json({
        success: true,
        message: '備份創建成功',
        data: {
          id: backupRecord.id,
          name: backupName,
          size: totalSize,
          tables: Object.keys(backupData),
          recordCount: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        },
      });
    } catch (backupError) {
      // 更新备份状态为失败
      await supabase
        .from('database_backups')
        .update({
          status: 'failed',
          error: String(backupError),
          completed_at: new Date().toISOString(),
        })
        .eq('id', backupRecord.id);

      throw backupError;
    }
  } catch (error) {
    console.error('创建备份失败:', error);
    return NextResponse.json(
      { error: '創建備份失敗' },
      { status: 500 }
    );
  }
}

/**
 * 删除备份
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '請提供備份ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('database_backups')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '備份已刪除',
    });
  } catch (error) {
    console.error('删除备份失败:', error);
    return NextResponse.json(
      { error: '刪除備份失敗' },
      { status: 500 }
    );
  }
}
