'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  current,
  total,
  pageSize = 20,
  onChange,
  showQuickJumper = false,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const [page, setPage] = useState(current);
  const [inputValue, setInputValue] = useState(String(current));

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    setPage(current);
    setInputValue(String(current));
  }, [current]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      setInputValue(String(newPage));
      onChange?.(newPage);
    },
    [totalPages, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = parseInt(inputValue, 10);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      handlePageChange(newPage);
    } else {
      setInputValue(String(page));
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages.map((p, index) =>
      p === 'ellipsis' ? (
        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
          ...
        </span>
      ) : (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={cn(
            'min-w-[40px] h-10 px-3 rounded-md font-medium transition-colors',
            p === page
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          {p}
        </button>
      )
    );
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* 上一页 */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          'h-10 px-3 rounded-md border transition-colors',
          page === 1
            ? 'border-muted text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border hover:bg-muted'
        )}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* 页码 */}
      <div className="flex items-center gap-1">{renderPageNumbers()}</div>

      {/* 下一页 */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          'h-10 px-3 rounded-md border transition-colors',
          page === totalPages
            ? 'border-muted text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border hover:bg-muted'
        )}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* 快速跳转 */}
      {showQuickJumper && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">跳至</span>
          <form onSubmit={handleInputSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-14 h-10 px-2 text-center border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
          <span className="text-sm text-muted-foreground">页</span>
        </div>
      )}

      {/* 每页条数 */}
      {showSizeChanger && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">每页</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value, 10);
              if (onChange) {
                onChange(1); // 重置到第一页
              }
            }}
            className="h-10 px-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}条
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// 简洁版分页器
interface SimplePaginationProps {
  current: number;
  total: number;
  onChange?: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  current,
  total,
  onChange,
  className,
}: SimplePaginationProps) {
  const totalPages = Math.ceil(total / 20);
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        onClick={() => onChange?.(current - 1)}
        disabled={current === 1}
        className={cn(
          'px-4 py-2 rounded-md border transition-colors',
          current === 1
            ? 'border-muted text-muted-foreground cursor-not-allowed'
            : 'border-border hover:bg-muted'
        )}
      >
        上一页
      </button>

      <span className="text-sm text-muted-foreground">
        第 {current} / {totalPages} 页
      </span>

      <button
        onClick={() => onChange?.(current + 1)}
        disabled={current === totalPages}
        className={cn(
          'px-4 py-2 rounded-md border transition-colors',
          current === totalPages
            ? 'border-muted text-muted-foreground cursor-not-allowed'
            : 'border-border hover:bg-muted'
        )}
      >
        下一页
      </button>
    </div>
  );
}
