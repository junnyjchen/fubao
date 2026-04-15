'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Loader2,
  History,
} from 'lucide-react';

interface SearchSuggestion {
  id: string | number;
  type: 'goods' | 'article' | 'keyword';
  text: string;
  image?: string;
  url?: string;
}

interface SearchHistory {
  keyword: string;
  timestamp: number;
}

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
  autoFocus?: boolean;
  onSearch?: (keyword: string) => void;
  className?: string;
}

export function SearchBar({
  defaultValue = '',
  placeholder = '搜索商品、文章...',
  size = 'md',
  showButton = true,
  autoFocus = false,
  onSearch,
  className,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(() => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    
    setIsLoading(true);
    onSearch?.(trimmed);
    
    // Save to history
    const history = getSearchHistory();
    const newHistory = [
      { keyword: trimmed, timestamp: Date.now() },
      ...history.filter((h) => h.keyword !== trimmed),
    ].slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
    
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsLoading(false);
  }, [keyword, onSearch, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div className={cn('relative flex gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn('pl-10 pr-4', sizeClasses[size])}
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
      {showButton && (
        <Button onClick={handleSearch} disabled={isLoading} size={size}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '搜索'}
        </Button>
      )}
    </div>
  );
}

// Search History & Suggestions Dropdown
interface SearchDropdownProps {
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  trending: string[];
  onSelect: (keyword: string) => void;
  onClearHistory: () => void;
  isLoading?: boolean;
}

export function SearchDropdown({
  suggestions,
  history,
  trending,
  onSelect,
  onClearHistory,
  isLoading = false,
}: SearchDropdownProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (suggestions.length === 0 && history.length === 0 && trending.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
      {/* History */}
      {history.length > 0 && (
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">搜索历史</span>
            <button
              onClick={onClearHistory}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => onSelect(h.keyword)}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors"
              >
                <Clock className="w-3 h-3" />
                {h.keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-3">
          <span className="text-sm font-medium text-muted-foreground mb-2 block">搜索建议</span>
          <div className="space-y-1">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.text)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                {s.image && (
                  <Image
                    src={s.image}
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <span className="flex-1 truncate">{s.text}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {s.type === 'goods' ? '商品' : s.type === 'article' ? '文章' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      {trending.length > 0 && suggestions.length === 0 && (
        <div className="p-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">热门搜索</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map((t, i) => (
              <button
                key={i}
                onClick={() => onSelect(t)}
                className="px-2 py-1 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Search with Dropdown
interface SearchWithDropdownProps {
  onSearch: (keyword: string) => void;
}

export function SearchWithDropdown({ onSearch }: SearchWithDropdownProps) {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [trending] = useState(['开光符咒', '道家法器', '平安符', '招财转运']);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const stored = localStorage.getItem('search_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const handleSearch = useCallback((kw: string) => {
    if (!kw.trim()) {
      setSuggestions([]);
      return;
    }

    // In real app, fetch from API
    // Simulate suggestions
    setSuggestions([
      { id: 1, type: 'goods', text: `${kw} 开光符咒`, image: '/placeholder.png' },
      { id: 2, type: 'goods', text: `${kw} 道家法器` },
      { id: 3, type: 'article', text: `${kw} 文化解读` },
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    setShowDropdown(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSelect = (kw: string) => {
    setKeyword(kw);
    setShowDropdown(false);

    // Save to history
    const newHistory = [
      { keyword: kw, timestamp: Date.now() },
      ...history.filter((h) => h.keyword !== kw),
    ].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));

    onSearch(kw);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  return (
    <div className="relative">
      <SearchBar
        value={keyword}
        onChange={handleInputChange}
        onSearch={handleSelect}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowDropdown(false);
          }
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="搜索符咒、法器、文化..."
      />

      {showDropdown && (keyword || history.length > 0 || trending.length > 0) && (
        <SearchDropdown
          suggestions={keyword ? suggestions : []}
          history={keyword ? [] : history}
          trending={keyword ? [] : trending}
          onSelect={handleSelect}
          onClearHistory={handleClearHistory}
        />
      )}
    </div>
  );
}

// Helper function
function getSearchHistory(): SearchHistory[] {
  try {
    const stored = localStorage.getItem('search_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
