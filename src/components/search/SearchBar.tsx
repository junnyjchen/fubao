/**
 * @fileoverview 搜索栏组件
 * @description 提供商品搜索功能
 * @module components/search/SearchBar
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  /** 占位符文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 是否显示热门搜索 */
  showHotSearch?: boolean;
  /** 是否显示搜索历史 */
  showHistory?: boolean;
  /** 是否在输入时自动搜索 */
  autoSearch?: boolean;
  /** 搜索回调 */
  onSearch?: (keyword: string) => void;
}

/** 热门搜索词 */
const HOT_KEYWORDS = [
  '平安符',
  '招財符',
  '太歲符',
  '開光手串',
  '桃木劍',
  '八卦鏡',
  '道教書籍',
  '香燭',
];

/** 搜索历史存储键 */
const SEARCH_HISTORY_KEY = 'fubao_search_history';
const MAX_HISTORY = 10;

export function SearchBar({
  placeholder = '搜索商品、符箓、法器...',
  className,
  showHotSearch = true,
  showHistory = true,
  autoSearch = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 加载搜索历史
  useEffect(() => {
    if (showHistory) {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        try {
          setSearchHistory(JSON.parse(history));
        } catch {
          setSearchHistory([]);
        }
      }
    }
  }, [showHistory]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 保存搜索历史
  const saveSearchHistory = useCallback((term: string) => {
    if (!term.trim()) return;

    setSearchHistory(prev => {
      const newHistory = [term, ...prev.filter(h => h !== term)].slice(0, MAX_HISTORY);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // 执行搜索
  const handleSearch = useCallback((searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    saveSearchHistory(term);
    setShowDropdown(false);

    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`/search?keyword=${encodeURIComponent(term)}`);
    }
  }, [saveSearchHistory, onSearch, router]);

  // 提交搜索
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(keyword);
  };

  // 清除搜索词
  const handleClear = () => {
    setKeyword('');
    inputRef.current?.focus();
  };

  // 清除搜索历史
  const clearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };

  // 点击搜索项
  const handleClickItem = (term: string) => {
    setKeyword(term);
    handleSearch(term);
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (autoSearch && e.target.value.trim()) {
              handleSearch(e.target.value);
            }
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="pr-20"
        />
        {keyword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* 搜索下拉框 */}
      {showDropdown && (showHistory || showHotSearch) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {/* 搜索历史 */}
          {showHistory && searchHistory.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  搜索歷史
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={clearHistory}
                >
                  清除
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleClickItem(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          {showHotSearch && (
            <div className="p-3 border-t">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                <TrendingUp className="w-3 h-3" />
                熱門搜索
              </span>
              <div className="flex flex-wrap gap-2">
                {HOT_KEYWORDS.map((term, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleClickItem(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 紧凑型搜索栏
 */
export function CompactSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn('relative', className)}>
      <Input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索..."
        className="pr-9"
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0 h-full w-9"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
