'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import { 
  Minus, 
  Plus, 
  ShoppingCart,
  Trash2,
  Loader2,
  Check,
  Gift,
  AlertCircle,
} from 'lucide-react';

interface CartItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  specs?: string;
  price: number;
  original_price?: number;
  quantity: number;
  stock: number;
  checked?: boolean;
  merchant_id?: number;
  merchant_name?: string;
}

interface CartListProps {
  items: CartItem[];
  loading?: boolean;
  onUpdateQuantity: (id: number, quantity: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onSelect: (ids: number[]) => void;
  selectedIds?: number[];
  onCheckout?: () => void;
}

export function CartList({
  items,
  loading = false,
  onUpdateQuantity,
  onRemove,
  onSelect,
  selectedIds = [],
  onCheckout,
}: CartListProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { success, error } = useToast();

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelect([]);
    } else {
      onSelect(items.map((item) => item.id));
    }
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((i) => i !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      setRemovingId(id);
      await onRemove(id);
      success('已删除');
    } catch (err) {
      error('删除失败');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading && items.length === 0) {
    return <CartListSkeleton count={3} />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">购物车是空的</p>
        <Button variant="outline" onClick={() => window.location.href = '/shop'}>
          去逛逛
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded border-input"
          />
          <span className="text-sm">全选</span>
        </label>
        <span className="text-sm text-muted-foreground">
          共 {items.length} 件商品
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            selected={selectedIds.includes(item.id)}
            onSelect={() => handleSelect(item.id)}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={() => handleRemove(item.id)}
            removing={removingId === item.id}
          />
        ))}
      </div>

      {/* Footer */}
      <Card className="sticky bottom-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                已选 {totalCount} 件商品
              </p>
              <p className="text-xl font-bold text-red-500">
                {formatPrice(totalAmount)}
              </p>
            </div>
            <Button
              size="lg"
              disabled={selectedIds.length === 0}
              onClick={onCheckout}
              className="px-8"
            >
              结算 ({selectedIds.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CartItemCardProps {
  item: CartItem;
  selected?: boolean;
  onSelect: () => void;
  onUpdateQuantity: (id: number, quantity: number) => Promise<void>;
  onRemove: () => void;
  removing?: boolean;
}

function CartItemCard({
  item,
  selected = false,
  onSelect,
  onUpdateQuantity,
  onRemove,
  removing = false,
}: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);
  const { error } = useToast();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.stock) return;
    
    setQuantity(newQuantity);
    try {
      setUpdating(true);
      await onUpdateQuantity(item.id, newQuantity);
    } catch (err) {
      setQuantity(item.quantity);
      error('更新失败');
    } finally {
      setUpdating(false);
    }
  };

  const hasDiscount = item.original_price && item.original_price > item.price;
  const isOutOfStock = item.stock === 0;

  return (
    <Card className={cn(
      'transition-opacity',
      isOutOfStock && 'opacity-50',
      removing && 'opacity-50'
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              disabled={isOutOfStock}
              className="w-5 h-5 rounded border-input"
            />
          </div>

          {/* Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.goods_image}
              alt={item.goods_name}
              className="w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs">缺货</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">{item.goods_name}</h4>
            {item.specs && (
              <p className="text-xs text-muted-foreground mt-1">{item.specs}</p>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-red-500">
                  {formatPrice(item.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(item.original_price!)}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || updating}
                  className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-muted disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= item.stock || updating}
                  className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-muted disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onRemove}
                disabled={removing}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              >
                {removing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Cart Summary
interface CartSummaryProps {
  totalAmount: number;
  discount: number;
  freight: number;
  onCheckout?: () => void;
}

export function CartSummary({
  totalAmount,
  discount,
  freight,
  onCheckout,
}: CartSummaryProps) {
  const actualAmount = totalAmount - discount + freight;

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-medium">费用明细</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">商品总价</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">优惠</span>
          <span className="text-green-600">-{formatPrice(discount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">运费</span>
          <span>{freight === 0 ? '免运费' : formatPrice(freight)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between">
          <span className="font-medium">应付</span>
          <span className="text-xl font-bold text-red-500">
            {formatPrice(actualAmount)}
          </span>
        </div>
        <Button className="w-full" size="lg" onClick={onCheckout}>
          提交订单
        </Button>
      </CardContent>
    </Card>
  );
}

// Add to Cart Button
interface AddToCartButtonProps {
  goodsId: number;
  goodsName?: string;
  price?: number;
  onSuccess?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AddToCartButton({
  goodsId,
  goodsName,
  onSuccess,
  size = 'md',
  className,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { success, error } = useToast();

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      success('已加入购物车');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onSuccess?.();
    } catch (err) {
      error('加入购物车失败');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading || showSuccess}
      className={cn(
        sizeClasses[size],
        showSuccess && 'bg-green-500 hover:bg-green-500',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : showSuccess ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          已添加
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          加入购物车
        </>
      )}
    </Button>
  );
}

// Skeleton
export function CartListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-5 h-5 rounded bg-muted animate-pulse" />
              <div className="w-24 h-24 rounded-lg bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
                <div className="w-1/2 h-3 bg-muted animate-pulse rounded" />
                <div className="w-1/4 h-4 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
