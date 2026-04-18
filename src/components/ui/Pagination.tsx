/**
 * @fileoverview 分页组件
 * @description 通用分页导航组件
 * @module components/ui/Pagination
 */

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 显示的页码数量 */
  siblingCount?: number;
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean;
  /** 是否显示总数 */
  showTotal?: boolean;
  /** 总数量 */
  total?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 自定义类名 */
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showQuickJumper = false,
  showTotal = false,
  total = 0,
  pageSize = 10,
  className,
}: PaginationProps) {
  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const totalNumbers = siblingCount * 2 + 3; // 左右兄弟 + 当前页 + 首页 + 尾页

    // 如果总页数小于显示数量，显示所有页码
    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 2;

    // 首页
    pages.push(1);

    // 左侧省略号
    if (showLeftEllipsis) {
      pages.push('ellipsis');
    } else {
      // 填充左侧页码
      for (let i = 2; i < leftSiblingIndex; i++) {
        pages.push(i);
      }
    }

    // 中间页码
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // 右侧省略号
    if (showRightEllipsis) {
      pages.push('ellipsis');
    } else {
      // 填充右侧页码
      for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
        pages.push(i);
      }
    }

    // 尾页
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = parseInt(e.currentTarget.value, 10);
      if (target >= 1 && target <= totalPages && target !== currentPage) {
        onPageChange(target);
      }
      e.currentTarget.value = '';
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 总数显示 */}
      {showTotal && (
        <span className="text-sm text-muted-foreground mr-4">
          共 {total} 條記錄
        </span>
      )}

      {/* 上一页按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 页码 */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}

      {/* 下一页按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* 快速跳转 */}
      {showQuickJumper && (
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">跳至</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            className="w-12 h-8 text-center border rounded"
            onKeyDown={handleQuickJump}
          />
          <span className="text-sm text-muted-foreground">頁</span>
        </div>
      )}
    </div>
  );
}

// 简化版分页（仅显示上一页/下一页）
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        上一頁
      </Button>

      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        下一頁
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// 加载更多按钮
interface LoadMoreProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  className?: string;
}

export function LoadMore({
  onLoadMore,
  hasMore,
  loading = false,
  className,
}: LoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className={cn('flex justify-center py-8', className)}>
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? '加載中...' : '加載更多'}
      </Button>
    </div>
  );
}
