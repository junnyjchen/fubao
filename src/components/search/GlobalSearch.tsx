/**
 * @fileoverview 全局搜索建议组件
 * @description 支持商品、百科、视频、商家搜索建议
 * @module components/search/GlobalSearch
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Package,
  BookOpen,
  Video,
  Store,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'goods' | 'wiki' | 'videos' | 'merchants' | 'keyword';
  id?: number;
  name: string;
  subtitle?: string;
  image?: string;
  url?: string;
}

interface GlobalSearchProps {
  /** 占位符文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 初始关键词 */
  initialKeyword?: string;
  /** 是否显示热门搜索 */
  showHotSearch?: boolean;
  /** 是否显示搜索历史 */
  showHistory?: boolean;
  /** 最小输入字符触发搜索 */
  minChars?: number;
  /** 提交回调 */
  onSubmit?: (keyword: string) => void;
}

/** 热门搜索词 */
const HOT_KEYWORDS = [
  { keyword: '平安符', count: 12580 },
  { keyword: '招財符', count: 9820 },
  { keyword: '太歲符', count: 8650 },
  { keyword: '開光手串', count: 7230 },
  { keyword: '桃木劍', count: 6540 },
  { keyword: '八卦鏡', count: 5890 },
  { keyword: '道教書籍', count: 4320 },
  { keyword: '香燭套裝', count: 3980 },
];

/** 搜索历史存储键 */
const SEARCH_HISTORY_KEY = 'fubao_search_history';
const MAX_HISTORY = 10;

export function GlobalSearch({
  placeholder = '搜索商品、符箓、法器...',
  className,
  initialKeyword = '',
  showHotSearch = true,
  showHistory = true,
  minChars = 1,
  onSubmit,
}: GlobalSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 加载搜索历史
  useEffect(() => {
    if (showHistory) {
      try {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch {
        setSearchHistory([]);
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

  // 获取搜索建议
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < minChars) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [minChars]);

  // 防抖搜索
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (keyword.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(keyword);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword, fetchSuggestions]);

  // 保存搜索历史
  const saveSearchHistory = useCallback((term: string) => {
    if (!term.trim()) return;

    setSearchHistory(prev => {
      const newHistory = [term, ...prev.filter(h => h !== term)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch {
        // localStorage 可能不可用
      }
      return newHistory;
    });
  }, []);

  // 清除单条历史
  const removeHistoryItem = useCallback((term: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(h => h !== term);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch {
        // localStorage 可能不可用
      }
      return newHistory;
    });
  }, []);

  // 清除全部历史
  const clearAllHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // localStorage 可能不可用
    }
  }, []);

  // 执行搜索
  const handleSubmit = useCallback(() => {
    const term = keyword.trim();
    if (!term) return;

    saveSearchHistory(term);
    setShowDropdown(false);
    
    if (onSubmit) {
      onSubmit(term);
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  }, [keyword, saveSearchHistory, onSubmit, router]);

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allItems = [
      ...suggestions.map((s, i) => ({ type: 'suggestion' as const, index: i })),
      ...searchHistory.map((_, i) => ({ type: 'history' as const, index: i })),
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && allItems[activeIndex]) {
          const item = allItems[activeIndex];
          if (item.type === 'suggestion') {
            const suggestion = suggestions[item.index];
            handleSuggestionClick(suggestion);
          } else {
            setKeyword(searchHistory[item.index]);
            handleSubmit();
          }
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  }, [suggestions, searchHistory, activeIndex, handleSubmit]);

  // 点击建议项
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'keyword') {
      setKeyword(suggestion.name);
      handleSubmit();
    } else if (suggestion.url) {
      saveSearchHistory(keyword);
      setShowDropdown(false);
      router.push(suggestion.url);
    }
  }, [keyword, handleSubmit, router, saveSearchHistory]);

  // 获取图标
  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'goods': return Package;
      case 'wiki': return BookOpen;
      case 'videos': return Video;
      case 'merchants': return Store;
      default: return Search;
    }
  };

  const showDropdownContent = showDropdown && (
    (keyword.trim().length >= minChars && (suggestions.length > 0 || loading)) ||
    (searchHistory.length > 0 && keyword.trim() === '')
  );

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-10 bg-muted/50 border-0 focus:bg-background"
        />
        {keyword && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setKeyword('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* 下拉建议框 */}
      {showDropdownContent && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden z-50"
        >
          {/* 搜索建议 */}
          {keyword.trim().length >= minChars && suggestions.length > 0 && (
            <div className="p-2 border-b">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                搜索建议
              </div>
              {suggestions.slice(0, 8).map((suggestion, index) => {
                const Icon = getIcon(suggestion.type);
                return (
                  <button
                    key={`${suggestion.type}-${suggestion.id || index}`}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                      activeIndex === index
                        ? 'bg-muted'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{suggestion.name}</div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 搜索历史 */}
          {searchHistory.length > 0 && keyword.trim() === '' && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  搜索历史
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={clearAllHistory}
                >
                  清除全部
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="cursor-pointer hover:bg-muted gap-1 pl-2 pr-1"
                    onClick={() => {
                      setKeyword(term);
                      handleSubmit();
                    }}
                  >
                    {term}
                    <X
                      className="w-3 h-3 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(term);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          {showHotSearch && keyword.trim() === '' && (
            <div className="p-2 border-t">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                热门搜索
              </div>
              <div className="grid grid-cols-2 gap-1">
                {HOT_KEYWORDS.slice(0, 6).map((item, index) => (
                  <button
                    key={item.keyword}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setKeyword(item.keyword);
                      handleSubmit();
                    }}
                  >
                    <span className={cn(
                      'w-5 h-5 rounded text-xs flex items-center justify-center flex-shrink-0',
                      index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {index + 1}
                    </span>
                    <span className="text-sm truncate">{item.keyword}</span>
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
