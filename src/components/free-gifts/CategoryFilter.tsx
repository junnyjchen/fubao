/**
 * @fileoverview 商品分类筛选组件
 * @description 分类标签筛选
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Folder } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selected?: string;
  onSelect: (categoryId: string) => void;
  showCount?: boolean;
  showAll?: boolean;
}

const defaultCategories: Category[] = [
  { id: 'all', name: '全部', icon: '🎁' },
  { id: 'talisman', name: '符箓', icon: '📜', count: 12 },
  { id: 'jewelry', name: '飾品', icon: '📿', count: 8 },
  { id: 'incense', name: '香薰', icon: '🪔', count: 6 },
  { id: 'pendant', name: '掛件', icon: '🔮', count: 10 },
  { id: 'book', name: '典籍', icon: '📕', count: 4 },
  { id: 'other', name: '其他', icon: '✨', count: 5 },
];

export function CategoryFilter({
  categories = defaultCategories,
  selected = 'all',
  onSelect,
  showCount = true,
  showAll = true,
}: CategoryFilterProps) {
  const displayCategories = showAll 
    ? categories 
    : categories.filter(c => c.id !== 'all');

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {displayCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all flex-shrink-0
                ${selected === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {category.icon && <span>{category.icon}</span>}
              <span>{category.name}</span>
              {showCount && category.count !== undefined && category.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={`ml-1 h-5 px-1.5 text-xs ${
                    selected === category.id 
                      ? 'bg-white/20 text-white' 
                      : ''
                  }`}
                >
                  {category.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}

/**
 * 分类选择器（网格布局）
 */
export function CategoryGrid({
  categories = defaultCategories.filter(c => c.id !== 'all'),
  selected,
  onSelect,
}: {
  categories?: Category[];
  selected?: string;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`
            flex flex-col items-center gap-2 p-3 rounded-xl
            transition-all
            ${selected === category.id
              ? 'bg-primary/10 border-2 border-primary'
              : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
            }
          `}
        >
          <span className="text-2xl">{category.icon}</span>
          <span className="text-xs font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * 分类徽章（用于商品卡片）
 */
export function CategoryBadge({ 
  category,
  className = '',
}: { 
  category: string;
  className?: string;
}) {
  const categoryMap: Record<string, { icon: string; color: string }> = {
    '符箓': { icon: '📜', color: 'bg-amber-100 text-amber-800' },
    '飾品': { icon: '📿', color: 'bg-purple-100 text-purple-800' },
    '香薰': { icon: '🪔', color: 'bg-green-100 text-green-800' },
    '掛件': { icon: '🔮', color: 'bg-blue-100 text-blue-800' },
    '典籍': { icon: '📕', color: 'bg-red-100 text-red-800' },
    '其他': { icon: '✨', color: 'bg-gray-100 text-gray-800' },
  };

  const config = categoryMap[category] || categoryMap['其他'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.color} ${className}`}>
      <span>{config.icon}</span>
      {category}
    </span>
  );
}

/**
 * 排序选择器
 */
export function SortSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    { id: 'default', name: '綜合排序' },
    { id: 'newest', name: '最新上架' },
    { id: 'hot', name: '熱門優先' },
    { id: 'ending', name: '即將結束' },
    { id: 'price_high', name: '原價從高到低' },
    { id: 'price_low', name: '原價從低到高' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-muted/50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}
