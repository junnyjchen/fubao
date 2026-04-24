/**
 * @fileoverview 搜索栏组件
 * @description 商品搜索功能
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, TrendingUp, Clock } from 'lucide-react';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
  hotKeywords?: string[];
  recentKeywords?: string[];
  onClearRecent?: () => void;
}

export function SearchBar({
  onSearch,
  placeholder = '搜索商品...',
  hotKeywords = ['平安符', '手環', '香囊', '開光'],
  recentKeywords = [],
  onClearRecent,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
      setShowDropdown(false);
    }
  };

  const handleKeywordClick = (kw: string) => {
    setKeyword(kw);
    onSearch(kw);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-white/80 backdrop-blur"
        />
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* 下拉面板 */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 p-4">
          {/* 热门搜索 */}
          <div className="mb-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span>熱門搜索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleKeywordClick(kw)}
                  className="px-3 py-1.5 bg-muted/50 rounded-full text-sm hover:bg-muted transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* 最近搜索 */}
          {recentKeywords.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>最近搜索</span>
                </div>
                <button
                  onClick={onClearRecent}
                  className="text-xs hover:text-foreground"
                >
                  清空
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleKeywordClick(kw)}
                    className="px-3 py-1.5 bg-muted/50 rounded-full text-sm hover:bg-muted transition-colors"
                  >
                    {kw}
                  </button>
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
 * 简易搜索栏（无下拉）
 */
export function SimpleSearchBar({
  onSearch,
  placeholder = '搜索商品...',
}: {
  onSearch: (keyword: string) => void;
  placeholder?: string;
}) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </form>
  );
}
