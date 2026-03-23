/**
 * @fileoverview 后台管理表格组件
 * @description 提供统一的数据表格展示，支持排序、分页等功能
 * @module components/admin/AdminTable
 */

'use client';

import { ReactNode, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

/** 表格列配置 */
export interface Column<T> {
  /** 列标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 列宽度 */
  width?: string;
  /** 是否可排序 */
  sortable?: boolean;
  /** 自定义渲染函数 */
  render?: (record: T, index: number) => ReactNode;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
}

/** 分页配置 */
export interface Pagination {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总数量 */
  total: number;
}

/** AdminTable 组件属性 */
interface AdminTableProps<T> {
  /** 表格列配置 */
  columns: Column<T>[];
  /** 表格数据 */
  data: T[];
  /** 数据唯一标识字段 */
  rowKey: keyof T;
  /** 是否显示搜索框 */
  searchable?: boolean;
  /** 搜索字段 */
  searchPlaceholder?: string;
  /** 分页配置 */
  pagination?: Pagination;
  /** 分页变化回调 */
  onPaginationChange?: (pagination: Pagination) => void;
  /** 是否加载中 */
  loading?: boolean;
  /** 空数据提示 */
  emptyText?: string;
  /** 行点击事件 */
  onRowClick?: (record: T) => void;
  /** 操作列 */
  actions?: (record: T) => ReactNode;
}

/**
 * 后台管理表格组件
 * @param props - 组件属性
 * @returns 表格组件
 */
export function AdminTable<T extends object>({
  columns,
  data,
  rowKey,
  searchable = false,
  searchPlaceholder = '搜尋...',
  pagination,
  onPaginationChange,
  loading = false,
  emptyText = '暫無數據',
  onRowClick,
  actions,
}: AdminTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  /**
   * 处理排序
   * @param key - 排序字段
   */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  /**
   * 过滤和排序后的数据
   */
  const processedData = useMemo(() => {
    let result = [...data];

    // 搜索过滤
    if (searchValue) {
      result = result.filter((item) =>
        Object.values(item as Record<string, unknown>).some(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }

    // 排序
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchValue, sortKey, sortOrder]);

  /**
   * 计算总页数
   */
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  /**
   * 获取列对齐样式
   */
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-background rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-sm font-medium text-muted-foreground',
                      getAlignClass(column.align),
                      column.sortable && 'cursor-pointer hover:bg-muted select-none'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.title}
                      {column.sortable && sortKey === column.key && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground text-right">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    載入中...
                  </td>
                </tr>
              ) : processedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {emptyText}
                  </td>
                </tr>
              ) : (
                processedData.map((record, index) => (
                  <tr
                    key={String(record[rowKey])}
                    className={cn(
                      'border-b last:border-0 hover:bg-muted/30 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(record)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm',
                          getAlignClass(column.align)
                        )}
                      >
                        {column.render
                          ? column.render(record, index)
                          : String((record as Record<string, unknown>)[column.key] ?? '-')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions(record)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {pagination && onPaginationChange && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>共 {pagination.total} 條</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) =>
                  onPaginationChange({
                    ...pagination,
                    pageSize: Number(value),
                    page: 1,
                  })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 條/頁</SelectItem>
                  <SelectItem value="20">20 條/頁</SelectItem>
                  <SelectItem value="50">50 條/頁</SelectItem>
                  <SelectItem value="100">100 條/頁</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    page: pagination.page - 1,
                  })
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {pagination.page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= totalPages}
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    page: pagination.page + 1,
                  })
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
