'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { 
  Scale, 
  Plus, 
  X, 
  Check, 
  Minus,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface CompareItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  specs?: Record<string, string>;
  [key: string]: unknown;
}

interface CompareField {
  key: string;
  label: string;
  render?: (value: unknown) => React.ReactNode;
}

interface ProductCompareProps {
  items: CompareItem[];
  fields: CompareField[];
  maxItems?: number;
  onRemove?: (id: number) => void;
  onAddToCart?: (item: CompareItem) => void;
}

export function ProductCompare({
  items,
  fields,
  maxItems = 4,
  onRemove,
  onAddToCart,
}: ProductCompareProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = useCallback(async (id: number) => {
    if (!onRemove) return;
    try {
      setRemovingId(id);
      await onRemove(id);
    } finally {
      setRemovingId(null);
    }
  }, [onRemove]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无对比商品</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        {/* Header */}
        <thead>
          <tr>
            <th className="text-left p-4 bg-muted/50 border-b w-32">
              <span className="text-sm font-medium">商品</span>
            </th>
            {items.map((item) => (
              <th key={item.id} className="p-4 border-b min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                  >
                    {removingId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </button>
                  <Link href={`/goods/${item.id}`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square rounded-lg overflow-hidden mb-3"
                    />
                    <p className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                      {item.name}
                    </p>
                  </Link>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-red-500">
                      ¥{item.price.toFixed(2)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ¥{item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {onAddToCart && (
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => onAddToCart(item)}
                    >
                      加入购物车
                    </Button>
                  )}
                </div>
              </th>
            ))}
            {/* Empty cells for padding */}
            {Array.from({ length: maxItems - items.length }).map((_, i) => (
              <th key={`empty-${i}`} className="p-4 border-b min-w-[200px]">
                <div className="border-2 border-dashed border-muted rounded-lg h-full min-h-[300px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">添加商品</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {fields.map((field) => (
            <tr key={field.key}>
              <td className="p-4 bg-muted/50 border-b">
                <span className="text-sm font-medium">{field.label}</span>
              </td>
              {items.map((item) => {
                const value = item[field.key];
                return (
                  <td key={item.id} className="p-4 border-b text-center">
                    <span className="text-sm">
                      {field.render ? field.render(value) : String(value ?? '-')}
                    </span>
                  </td>
                );
              })}
              {Array.from({ length: maxItems - items.length }).map((_, i) => (
                <td key={`empty-${i}`} className="p-4 border-b" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Compare Button (floating)
interface CompareButtonProps {
  count: number;
  onClick: () => void;
  maxItems?: number;
}

export function CompareButton({ count, onClick, maxItems = 4 }: CompareButtonProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-4 z-40',
        'flex items-center gap-2 px-4 py-3',
        'bg-primary text-primary-foreground rounded-full shadow-lg',
        'hover:bg-primary/90 transition-all',
        'animate-in slide-in-from-right'
      )}
    >
      <Scale className="w-5 h-5" />
      <span className="font-medium">对比 ({count}/{maxItems})</span>
    </button>
  );
}

// Compare Provider (manages compare state)
interface CompareProviderProps {
  children: React.ReactNode;
  storageKey?: string;
  maxItems?: number;
}

interface CompareContextType {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  isComparing: boolean;
  setIsComparing: (value: boolean) => void;
}

import { createContext, useContext } from 'react';

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({
  children,
  storageKey = 'product_compare',
  maxItems = 4,
}: CompareProviderProps) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse compare items', e);
      }
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev;
      }
      if (prev.length >= maxItems) {
        return [...prev.slice(1), item];
      }
      return [...prev, item];
    });
  }, [maxItems]);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return (
    <CompareContext.Provider
      value={{ items, addItem, removeItem, clearAll, isComparing, setIsComparing }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}

// Quick Compare Entry
interface QuickCompareProps {
  currentProductId: number;
  currentProduct: CompareItem;
  onAdd: () => void;
  isAdded?: boolean;
}

export function QuickCompare({
  currentProductId,
  currentProduct,
  onAdd,
  isAdded = false,
}: QuickCompareProps) {
  const { items, addItem, removeItem } = useCompare();
  const isInCompare = items.some((i) => i.id === currentProductId);

  const handleClick = () => {
    if (isInCompare) {
      removeItem(currentProductId);
    } else {
      addItem(currentProduct);
    }
    onAdd();
  };

  return (
    <Button
      variant={isInCompare ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      className="gap-2"
    >
      {isInCompare ? (
        <>
          <Check className="w-4 h-4" />
          已加入对比
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          加入对比
        </>
      )}
    </Button>
  );
}
