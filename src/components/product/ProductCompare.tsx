/**
 * @fileoverview 商品对比功能
 * @description 提供商品对比功能组件
 * @module components/product/ProductCompare
 */

'use client';

import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { X, Plus, Check, GitCompare, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * 商品对比项
 */
interface CompareItem {
  id: number;
  name: string;
  image?: string;
  price: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  specs?: Record<string, string | number | boolean>;
}

/**
 * 商品对比上下文
 */
interface CompareContextValue {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  isInCompare: (id: number) => boolean;
  maxItems: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);

/**
 * 商品对比提供者
 */
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const maxItems = 4;

  // 从 localStorage 恢复
  useEffect(() => {
    try {
      const saved = localStorage.getItem('product_compare');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // 忽略错误
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('product_compare', JSON.stringify(items));
    } catch {
      // 忽略错误
    }
  }, [items]);

  const addItem = useCallback((item: CompareItem) => {
    setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      if (prev.length >= maxItems) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const isInCompare = useCallback((id: number) => {
    return items.some(item => item.id === id);
  }, [items]);

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearAll, isInCompare, maxItems }}>
      {children}
    </CompareContext.Provider>
  );
}

/**
 * 使用对比上下文
 */
export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}

/**
 * 对比按钮
 */
interface CompareButtonProps {
  product: CompareItem;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function CompareButton({ product, size = 'md', showLabel = false, className }: CompareButtonProps) {
  const { addItem, removeItem, isInCompare } = useCompare();
  const isInList = isInCompare(product.id);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  // Map 'md' to undefined (default), keep 'sm' and 'lg' as-is
  const buttonSize = size === 'md' ? undefined : size;

  return (
    <Button
      variant={isInList ? 'default' : 'outline'}
      size={buttonSize}
      onClick={() => isInList ? removeItem(product.id) : addItem(product)}
      className={cn('gap-1.5', sizeClasses[size], className)}
    >
      {isInList ? (
        <>
          <Check className="w-4 h-4" />
          {showLabel && '已加入对比'}
        </>
      ) : (
        <>
          <GitCompare className="w-4 h-4" />
          {showLabel && '加入对比'}
        </>
      )}
    </Button>
  );
}

/**
 * 对比栏（底部悬浮）
 */
export function CompareBar() {
  const { items, clearAll, maxItems } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-8 px-3 text-base font-medium">
            {items.length}/{maxItems}
          </Badge>
          <span className="text-sm text-muted-foreground">
            已选择 {items.length} 件商品进行对比
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearAll}>
            清空
          </Button>
          <Button asChild>
            <Link href="/compare" className="gap-1.5">
              开始对比
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * 商品对比表格
 */
interface ProductCompareTableProps {
  className?: string;
}

export function ProductCompareTable({ className }: ProductCompareTableProps) {
  const { items, removeItem, clearAll } = useCompare();

  if (items.length < 2) {
    return (
      <div className="text-center py-12">
        <GitCompare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">至少选择 2 件商品</h3>
        <p className="text-muted-foreground mb-4">
          请在商品列表或详情页选择至少 2 件商品进行对比
        </p>
        <Button variant="outline" asChild>
          <Link href="/shop">去选购</Link>
        </Button>
      </div>
    );
  }

  // 收集所有规格键
  const allSpecKeys = new Set<string>();
  items.forEach(item => {
    item.specs && Object.keys(item.specs).forEach(key => allSpecKeys.add(key));
  });
  const specKeys = Array.from(allSpecKeys);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">商品对比</h2>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          清空对比
        </Button>
      </div>

      {/* 对比表格 */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* 商品列 */}
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-[200px] p-4 text-left font-medium bg-muted/50">商品</th>
                  {items.map(item => (
                    <th key={item.id} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                          />
                        )}
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                        {item.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 价格 */}
                <tr className="border-t">
                  <td className="p-4 font-medium bg-muted/30">价格</td>
                  {items.map(item => (
                    <td key={item.id} className="p-4 text-center">
                      <span className="text-lg font-bold text-primary">
                        ¥{item.price.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 评分 */}
                <tr className="border-t">
                  <td className="p-4 font-medium bg-muted/30">评分</td>
                  {items.map(item => (
                    <td key={item.id} className="p-4 text-center">
                      {item.rating ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{item.rating.toFixed(1)}</span>
                          {item.reviewCount && (
                            <span className="text-sm text-muted-foreground">
                              ({item.reviewCount})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">暂无评分</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 库存 */}
                <tr className="border-t">
                  <td className="p-4 font-medium bg-muted/30">库存状态</td>
                  {items.map(item => (
                    <td key={item.id} className="p-4 text-center">
                      {item.stock !== undefined ? (
                        item.stock > 0 ? (
                          <Badge variant="default" className="bg-green-500">有货</Badge>
                        ) : (
                          <Badge variant="destructive">缺货</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 规格对比 */}
                {specKeys.map(key => (
                  <tr key={key} className="border-t">
                    <td className="p-4 font-medium bg-muted/30">{key}</td>
                    {items.map(item => (
                      <td key={item.id} className="p-4 text-center">
                        {item.specs?.[key] !== undefined
                          ? String(item.specs[key])
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* 操作 */}
                <tr className="border-t">
                  <td className="p-4 bg-muted/30"></td>
                  {items.map(item => (
                    <td key={item.id} className="p-4 text-center">
                      <Button size="sm" className="gap-1.5">
                        <ShoppingCart className="w-4 h-4" />
                        加入购物车
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

/**
 * 商品对比页面
 */
export default function ComparePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">商品对比</h1>
      <ProductCompareTable />
    </div>
  );
}
