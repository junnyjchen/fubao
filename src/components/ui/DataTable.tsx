/**
 * @fileoverview 数据表格增强组件
 * @description 支持排序、筛选、分页、批量操作的数据表格
 * @module components/ui/DataTable
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Download,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/Skeleton';
import { exportToCSV, exportToExcel } from '@/lib/export';

// 排序方向
type SortDirection = 'asc' | 'desc' | null;

// 列定义
export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

// 表格配置
interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onSearch?: (keyword: string) => void;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel') => void;
  onBatchDelete?: (ids: string[]) => void;
  batchActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (ids: string[]) => void;
  }[];
  emptyText?: string;
  className?: string;
  rowClassName?: string | ((row: T) => string);
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  pagination,
  selectable = false,
  onSelectionChange,
  searchable = false,
  searchPlaceholder = '搜索...',
  searchKeys,
  onSearch,
  onRefresh,
  onExport,
  onBatchDelete,
  batchActions = [],
  emptyText = '暫無數據',
  className,
  rowClassName,
}: DataTableProps<T>) {
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 排序状态
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // 选中项
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 本地搜索过滤
  const filteredData = useMemo(() => {
    if (!searchKeyword || !searchKeys || onSearch) {
      return data;
    }
    
    const keyword = searchKeyword.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        return String(value).toLowerCase().includes(keyword);
      })
    );
  }, [data, searchKeyword, searchKeys, onSearch]);

  // 本地排序
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return filteredData;
    }
    
    return [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.id === sortKey);
      if (!column) return 0;
      
      let aValue: unknown;
      let bValue: unknown;
      
      if (typeof column.accessor === 'function') {
        aValue = column.accessor(a);
        bValue = column.accessor(b);
      } else {
        aValue = a[column.accessor];
        bValue = b[column.accessor];
      }
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // 处理排序
  const handleSort = useCallback((columnId: string) => {
    if (sortKey === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(columnId);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  // 处理全选
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === sortedData.length) {
      setSelectedIds([]);
      onSelectionChange?.([]);
    } else {
      const allIds = sortedData.map((row) => row.id);
      setSelectedIds(allIds);
      onSelectionChange?.(allIds);
    }
  }, [selectedIds, sortedData, onSelectionChange]);

  // 处理单选
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newIds = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      onSelectionChange?.(newIds);
      return newIds;
    });
  }, [onSelectionChange]);

  // 处理搜索
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    if (onSearch) {
      onSearch(keyword);
    }
  }, [onSearch]);

  // 导出数据
  const handleExport = useCallback((format: 'csv' | 'excel') => {
    if (onExport) {
      onExport(format);
      return;
    }
    
    const exportColumns = columns.map((col) => ({
      key: col.id as keyof T,
      header: col.header,
    }));
    
    if (format === 'csv') {
      exportToCSV(sortedData, exportColumns, 'export');
    } else {
      exportToExcel(sortedData, exportColumns, 'export');
    }
  }, [columns, sortedData, onExport]);

  // 批量删除
  const handleBatchDelete = useCallback(() => {
    if (onBatchDelete && selectedIds.length > 0) {
      onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  }, [onBatchDelete, selectedIds]);

  // 获取单元格值
  const getCellValue = useCallback((row: T, column: ColumnDef<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  }, []);

  // 获取排序图标
  const getSortIcon = useCallback((columnId: string) => {
    if (sortKey !== columnId) {
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4" />;
    }
    return <ChevronDown className="w-4 h-4" />;
  }, [sortKey, sortDirection]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-4">
        {/* 左侧：搜索 */}
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Badge variant="secondary">
              已選擇 {selectedIds.length} 項
            </Badge>
          )}
          
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          
          {onExport !== null && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  導出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  導出 CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  導出 Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {selectedIds.length > 0 && onBatchDelete && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              批量刪除
            </Button>
          )}
          
          {selectedIds.length > 0 && batchActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  更多操作
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {batchActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.onClick(selectedIds)}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* 选择列 */}
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === sortedData.length && sortedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              
              {/* 数据列 */}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className={cn(
                    column.sortable && 'cursor-pointer select-none',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.id)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              // 加载骨架屏
              Array.from({ length: pagination?.pageSize || 10 }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="w-4 h-4" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              // 空状态
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              // 数据行
              sortedData.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={selectedIds.includes(row.id) ? 'selected' : undefined}
                  className={typeof rowClassName === 'function' ? rowClassName(row) : rowClassName}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={() => handleSelect(row.id)}
                      />
                    </TableCell>
                  )}
                  
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(value, row, index)
                          : String(value ?? '-')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {pagination.total} 條記錄
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每頁</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => {
                  pagination.onChange(1, Number(value));
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">條</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onChange(pagination.page - 1, pagination.pageSize)}
                disabled={pagination.page <= 1}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm">
                第 {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)} 頁
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onChange(pagination.page + 1, pagination.pageSize)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 便捷的数据表格Hook
export function useDataTable<T extends { id: string }>(
  fetchData: (params: { page: number; pageSize: number; keyword?: string }) => Promise<{
    data: T[];
    total: number;
  }>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchData({ page, pageSize, keyword });
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, keyword]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleSearch = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
    setPage(1);
  }, []);

  return {
    data,
    loading,
    pagination: {
      page,
      pageSize,
      total,
      onChange: handlePageChange,
    },
    search: {
      keyword,
      onSearch: handleSearch,
    },
    refresh,
    load,
  };
}
