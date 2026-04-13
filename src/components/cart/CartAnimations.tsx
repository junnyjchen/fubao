/**
 * @fileoverview 购物车动画组件
 * @description 提供加入购物车、飞入动画等效果
 * @module components/cart/CartAnimations
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ShoppingCart, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 飞入动画元素接口
 */
interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  image?: string;
}

/**
 * 购物车动画上下文
 */
interface CartAnimationContextValue {
  flyToCart: (element: HTMLElement, imageUrl?: string) => void;
  cartRef: React.RefObject<HTMLButtonElement | null>;
  itemCount: number;
  setItemCount: (count: number) => void;
}

const CartAnimationContext = createContext<CartAnimationContextValue | null>(null);

/**
 * 购物车动画提供者
 */
export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const cartRef = useRef<HTMLButtonElement>(null);

  const flyToCart = useCallback((element: HTMLElement, imageUrl?: string) => {
    const cartButton = cartRef.current;
    if (!cartButton) return;

    const elementRect = element.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    const flyingItem: FlyingItem = {
      id: `${Date.now()}-${Math.random()}`,
      startX: elementRect.left + elementRect.width / 2,
      startY: elementRect.top + elementRect.height / 2,
      endX: cartRect.left + cartRect.width / 2,
      endY: cartRect.top + cartRect.height / 2,
      image: imageUrl,
    };

    setFlyingItems((prev) => [...prev, flyingItem]);

    // 动画结束后移除
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== flyingItem.id));
      setItemCount((prev) => prev + 1);
    }, 600);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ flyToCart, cartRef, itemCount, setItemCount }}>
      {children}
      {/* 飞行动画 */}
      {flyingItems.map((item) => (
        <FlyingItem key={item.id} item={item} />
      ))}
    </CartAnimationContext.Provider>
  );
}

/**
 * 使用购物车动画上下文
 */
export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error('useCartAnimation must be used within CartAnimationProvider');
  }
  return context;
}

/**
 * 飞行动画元素
 */
function FlyingItem({ item }: { item: FlyingItem }) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // 贝塞尔曲线路径
  const controlPointOffset = 100;
  const t = progress;
  const x = Math.pow(1 - t, 2) * item.startX + 2 * (1 - t) * t * (item.startX + controlPointOffset) + Math.pow(t, 2) * item.endX;
  const y = Math.pow(1 - t, 2) * item.startY + 2 * (1 - t) * t * (item.startY - controlPointOffset) + Math.pow(t, 2) * item.endY;

  const scale = 1 - progress * 0.5;
  const opacity = 1 - progress * 0.3;

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

/**
 * 加入购物车按钮
 */
interface AddToCartButtonProps {
  onClick: () => Promise<void> | void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  showSuccessAnimation?: boolean;
}

export function AddToCartButton({
  onClick,
  disabled,
  loading,
  children = '加入购物车',
  className,
  showSuccessAnimation = true,
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'success'>('idle');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async () => {
    if (disabled || loading || status === 'adding') return;

    setStatus('adding');
    
    // 触发动画
    if (showSuccessAnimation && buttonRef.current) {
      const { flyToCart } = useCartAnimation();
      // 这个需要在 CartAnimationProvider 内部使用
    }

    try {
      await onClick();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <Button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading || status === 'adding'}
      className={cn(
        'relative transition-all duration-200',
        status === 'success' && 'bg-green-500 hover:bg-green-600',
        className
      )}
      {...(status === 'success' && { 'data-added': true })}
    >
      {status === 'adding' && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {status === 'success' && (
        <Check className="w-4 h-4 mr-2" />
      )}
      {status === 'idle' && <ShoppingCart className="w-4 h-4 mr-2" />}
      {status === 'idle' && children}
      {status === 'adding' && '加入中...'}
      {status === 'success' && '已加入'}
    </Button>
  );
}

/**
 * 数量加减组件
 */
interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const [isAnimating, setIsAnimating] = useState<'up' | 'down' | null>(null);

  const handleDecrease = () => {
    if (value <= min || disabled) return;
    setIsAnimating('down');
    onChange(value - 1);
    setTimeout(() => setIsAnimating(null), 150);
  };

  const handleIncrease = () => {
    if (value >= max || disabled) return;
    setIsAnimating('up');
    onChange(value + 1);
    setTimeout(() => setIsAnimating(null), 150);
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  const buttonSizeClasses = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 减少按钮 */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min || disabled}
        className={cn(
          'h-full px-3 rounded-l-md border border-r-0 transition-all duration-150',
          'flex items-center justify-center',
          'hover:bg-muted/50 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          buttonSizeClasses[size]
        )}
      >
        <span className={cn(
          'transition-transform duration-150',
          isAnimating === 'down' && 'scale-75'
        )}>
          −
        </span>
      </button>

      {/* 数值显示 */}
      <div
        className={cn(
          'h-full px-3 min-w-[3rem] border-y flex items-center justify-center font-medium',
          'transition-all duration-150',
          sizeClasses[size]
        )}
      >
        <span className={cn(
          'tabular-nums transition-transform duration-150',
          isAnimating === 'up' && '-translate-y-1',
          isAnimating === 'down' && 'translate-y-1'
        )}>
          {value}
        </span>
      </div>

      {/* 增加按钮 */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max || disabled}
        className={cn(
          'h-full px-3 rounded-r-md border border-l-0 transition-all duration-150',
          'flex items-center justify-center',
          'hover:bg-muted/50 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          buttonSizeClasses[size]
        )}
      >
        <span className={cn(
          'transition-transform duration-150',
          isAnimating === 'up' && 'scale-125'
        )}>
          +
        </span>
      </button>
    </div>
  );
}

/**
 * 购物车震动效果
 */
export function CartShake({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
  return (
    <div className={cn(
      'transition-transform',
      trigger && 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both'
    )}>
      {children}
    </div>
  );
}

/**
 * 购物车弹跳效果
 */
export function CartBounce({ children, trigger, count }: { children: React.ReactNode; trigger: boolean; count: number }) {
  return (
    <div
      className={cn(
        'transition-transform duration-200',
        trigger && 'animate-bounce'
      )}
      style={{ '--tw-bounce-bounce': `${count * 0.2}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * 徽章弹出动画
 */
export function BadgePop({ children, show, className }: { children: React.ReactNode; show: boolean; className?: string }) {
  return (
    <div className={cn(
      'relative',
      className
    )}>
      {children}
      {show && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
        </span>
      )}
    </div>
  );
}
