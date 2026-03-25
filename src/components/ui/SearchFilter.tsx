/**
 * @fileoverview 搜索过滤器组件
 * @description 高级搜索和过滤功能组件
 * @module components/ui/SearchFilter
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  X,
  CalendarIcon,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';

// 过滤器类型
export type FilterType = 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';

// 过滤器选项
export interface FilterOption {
  label: string;
  value: string;
}

// 过滤器配置
export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[]; // 用于select类型
  placeholder?: string;
  defaultValue?: unknown;
}

// 过滤值
export interface FilterValue {
  [key: string]: unknown;
}

interface SearchFilterProps {
  filters?: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onSearch?: (keyword: string) => void;
  onReset?: () => void;
  searchPlaceholder?: string;
  className?: string;
  showSearch?: boolean;
  showFilterCount?: boolean;
}

export function SearchFilter({
  filters = [],
  values,
  onChange,
  onSearch,
  onReset,
  searchPlaceholder = '搜索...',
  className,
  showSearch = true,
  showFilterCount = true,
}: SearchFilterProps) {
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // 活动过滤器数量
  const activeFilterCount = useMemo(() => {
    return Object.entries(values).filter(([key, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }, [values]);

  // 处理搜索
  const handleSearch = useCallback(() => {
    onSearch?.(keyword);
  }, [keyword, onSearch]);

  // 处理输入回车
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // 更新过滤器值
  const updateFilter = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange]
  );

  // 清除单个过滤器
  const clearFilter = useCallback(
    (key: string) => {
      const newValues = { ...values };
      delete newValues[key];
      onChange(newValues);
    },
    [values, onChange]
  );

  // 重置所有过滤器
  const resetAll = useCallback(() => {
    onChange({});
    setKeyword('');
    onReset?.();
  }, [onChange, onReset]);

  // 渲染过滤器控件
  const renderFilterControl = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `輸入${filter.label}`}
            value={(value as string) || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="w-48"
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => updateFilter(filter.key, val)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filter.placeholder || '請選擇'} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {value ? format(new Date(value as string), 'yyyy-MM-dd') : filter.placeholder || '選擇日期'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value as string) : undefined}
                onSelect={(date) => updateFilter(filter.key, date?.toISOString())}
              />
            </PopoverContent>
          </Popover>
        );

      case 'dateRange':
        const range = value as { start?: string; end?: string } | undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-56 justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {range?.start && range?.end
                  ? `${format(new Date(range.start), 'MM/dd')} - ${format(new Date(range.end), 'MM/dd')}`
                  : filter.placeholder || '選擇日期範圍'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: range?.start ? new Date(range.start) : undefined,
                  to: range?.end ? new Date(range.end) : undefined,
                }}
                onSelect={(selected) => {
                  updateFilter(filter.key, {
                    start: selected?.from?.toISOString(),
                    end: selected?.to?.toISOString(),
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `輸入${filter.label}`}
            value={(value as number) || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value ? Number(e.target.value) : undefined)}
            className="w-32"
          />
        );

      case 'numberRange':
        const numRange = value as { min?: number; max?: number } | undefined;
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="最小值"
              value={numRange?.min || ''}
              onChange={(e) =>
                updateFilter(filter.key, {
                  ...numRange,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-24"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="最大值"
              value={numRange?.max || ''}
              onChange={(e) =>
                updateFilter(filter.key, {
                  ...numRange,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-24"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // 获取过滤器的显示值
  const getFilterDisplayValue = (filter: FilterConfig): string | null => {
    const value = values[filter.key];
    if (value === undefined || value === null || value === '') return null;

    switch (filter.type) {
      case 'select':
        const option = filter.options?.find((opt) => opt.value === value);
        return option?.label || String(value);

      case 'date':
        return format(new Date(value as string), 'yyyy-MM-dd');

      case 'dateRange':
        const range = value as { start?: string; end?: string };
        if (range.start && range.end) {
          return `${format(new Date(range.start), 'MM/dd')} - ${format(new Date(range.end), 'MM/dd')}`;
        }
        return null;

      case 'numberRange':
        const numRange = value as { min?: number; max?: number };
        if (numRange.min !== undefined || numRange.max !== undefined) {
          return `${numRange.min || '∞'} - ${numRange.max || '∞'}`;
        }
        return null;

      default:
        return String(value);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* 主搜索栏 */}
      <div className="flex items-center gap-3">
        {/* 搜索框 */}
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
        )}

        {/* 过滤器下拉 */}
        {filters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                過濾器
                {showFilterCount && activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">過濾器</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetAll}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      重置
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {filters.map((filter) => (
                    <div key={filter.key} className="space-y-1">
                      <label className="text-sm font-medium">
                        {filter.label}
                      </label>
                      {renderFilterControl(filter)}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 搜索按钮 */}
        {showSearch && (
          <Button onClick={handleSearch}>搜索</Button>
        )}

        {/* 重置按钮 */}
        {(activeFilterCount > 0 || keyword) && (
          <Button variant="ghost" onClick={resetAll}>
            <X className="w-4 h-4 mr-1" />
            清除
          </Button>
        )}
      </div>

      {/* 活动过滤器标签 */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">已選過濾條件：</span>
          {filters.map((filter) => {
            const displayValue = getFilterDisplayValue(filter);
            if (!displayValue) return null;

            return (
              <Badge
                key={filter.key}
                variant="secondary"
                className="gap-1"
              >
                <span>{filter.label}:</span>
                <span className="font-normal">{displayValue}</span>
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => clearFilter(filter.key)}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 预设过滤器配置
export const filterPresets = {
  // 订单状态
  orderStatus: {
    key: 'status',
    label: '訂單狀態',
    type: 'select' as FilterType,
    options: [
      { label: '待付款', value: 'pending' },
      { label: '已付款', value: 'paid' },
      { label: '已發貨', value: 'shipped' },
      { label: '已送達', value: 'delivered' },
      { label: '已取消', value: 'cancelled' },
    ],
  },

  // 支付状态
  paymentStatus: {
    key: 'payment_status',
    label: '支付狀態',
    type: 'select' as FilterType,
    options: [
      { label: '待支付', value: 'pending' },
      { label: '已支付', value: 'paid' },
      { label: '已退款', value: 'refunded' },
    ],
  },

  // 商品状态
  productStatus: {
    key: 'status',
    label: '商品狀態',
    type: 'select' as FilterType,
    options: [
      { label: '上架中', value: 'active' },
      { label: '已下架', value: 'inactive' },
      { label: '已售罄', value: 'out_of_stock' },
    ],
  },

  // 日期范围
  dateRange: {
    key: 'date',
    label: '日期範圍',
    type: 'dateRange' as FilterType,
  },

  // 价格范围
  priceRange: {
    key: 'price',
    label: '價格範圍',
    type: 'numberRange' as FilterType,
  },

  // 用户等级
  userLevel: {
    key: 'level',
    label: '會員等級',
    type: 'select' as FilterType,
    options: [
      { label: '普通會員', value: '1' },
      { label: '銀卡會員', value: '2' },
      { label: '金卡會員', value: '3' },
      { label: '鉑金會員', value: '4' },
      { label: '鑽石會員', value: '5' },
    ],
  },
};

// 组合过滤器预设
export const filterGroups = {
  order: [
    filterPresets.orderStatus,
    filterPresets.paymentStatus,
    filterPresets.dateRange,
  ],

  product: [
    filterPresets.productStatus,
    filterPresets.priceRange,
  ],

  user: [
    filterPresets.userLevel,
    filterPresets.dateRange,
  ],
};

// 导出 Hook
export function useSearchFilter(defaultValues: FilterValue = {}) {
  const [values, setValues] = useState<FilterValue>(defaultValues);

  const updateValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearValue = useCallback((key: string) => {
    setValues((prev) => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  }, []);

  const resetValues = useCallback(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  return {
    values,
    setValues,
    updateValue,
    clearValue,
    resetValues,
  };
}
