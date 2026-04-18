/**
 * @fileoverview 收藏/点赞动画组件
 * @description 提供收藏、点赞等交互的动画效果
 * @module components/interactions/InteractionAnimations
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Heart, ThumbsUp, Star, Check, Sparkles } from 'lucide-react';

/**
 * 收藏按钮状态
 */
type FavoriteStatus = 'idle' | 'animating' | 'favorited' | 'removing';

/**
 * 收藏按钮组件
 */
interface FavoriteButtonProps {
  /** 是否已收藏 */
  isFavorited: boolean;
  /** 点击回调 */
  onToggle: () => Promise<void> | void;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示文字 */
  showLabel?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function FavoriteButton({
  isFavorited,
  onToggle,
  size = 'md',
  showLabel = false,
  disabled,
  className,
}: FavoriteButtonProps) {
  const [status, setStatus] = useState<FavoriteStatus>(isFavorited ? 'favorited' : 'idle');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 同步外部状态
  useEffect(() => {
    if (!isFavorited && status === 'favorited') {
      setStatus('removing');
      setTimeout(() => setStatus('idle'), 300);
    }
  }, [isFavorited]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || status === 'animating') return;

    // 生成粒子
    if (!isFavorited) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.cos((i * 45) * (Math.PI / 180)) * 30,
        y: Math.sin((i * 45) * (Math.PI / 180)) * 30,
      }));
      setParticles(newParticles);
    }

    setStatus('animating');

    try {
      await onToggle();
      setStatus(isFavorited ? 'removing' : 'favorited');
      setTimeout(() => {
        setStatus(isFavorited ? 'idle' : 'favorited');
        setParticles([]);
      }, 400);
    } catch {
      setStatus(isFavorited ? 'favorited' : 'idle');
      setParticles([]);
    }
  };

  const sizeClasses = {
    sm: { button: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs' },
    md: { button: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { button: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all duration-200',
          'hover:scale-110 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          classes.button,
          status === 'favorited' && 'text-pink-500',
          status === 'animating' && 'scale-125',
          (status === 'idle' || status === 'removing') && !isFavorited && 'text-muted-foreground hover:text-pink-500',
          className
        )}
      >
        <Heart
          className={cn(
            classes.icon,
            'transition-all duration-300',
            (status === 'favorited' || status === 'animating') && '[&_path]:fill-current'
          )}
        />

        {/* 粒子效果 */}
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-pink-500"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              animation: 'particle-fade 0.5s ease-out forwards',
            }}
          />
        ))}
      </button>

      {showLabel && (
        <span className={cn(
          'ml-1.5',
          classes.text,
          status === 'favorited' ? 'text-pink-500' : 'text-muted-foreground'
        )}>
          {status === 'favorited' ? '已收藏' : '收藏'}
        </span>
      )}
    </div>
  );
}

/**
 * 点赞按钮组件
 */
interface LikeButtonProps {
  /** 是否已点赞 */
  isLiked: boolean;
  /** 点赞数 */
  count?: number;
  /** 点击回调 */
  onToggle: () => Promise<void> | void;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示数量 */
  showCount?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function LikeButton({
  isLiked,
  count = 0,
  onToggle,
  size = 'md',
  showCount = true,
  disabled,
  className,
}: LikeButtonProps) {
  const [status, setStatus] = useState<'idle' | 'animating' | 'liked' | 'unliked'>(
    isLiked ? 'liked' : 'idle'
  );
  const [displayCount, setDisplayCount] = useState(count);
  const [ripples, setRipples] = useState<Array<{ id: number; size: number }>>([]);

  useEffect(() => {
    if (isLiked && status === 'idle') {
      setStatus('liked');
    } else if (!isLiked && status === 'liked') {
      setStatus('unliked');
      setTimeout(() => setStatus('idle'), 300);
    }
  }, [isLiked, status]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || status === 'animating') return;

    // 添加涟漪效果
    const newRipple = {
      id: Date.now(),
      size: size === 'sm' ? 40 : size === 'md' ? 50 : 60,
    };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    setStatus('animating');

    try {
      await onToggle();
      setStatus(isLiked ? 'unliked' : 'liked');
      setDisplayCount((prev) => (isLiked ? prev - 1 : prev + 1));
      setTimeout(() => setStatus(isLiked ? 'idle' : 'liked'), 400);
    } catch {
      setStatus(isLiked ? 'liked' : 'idle');
    }
  };

  const sizeClasses = {
    sm: { button: 'w-7 h-7', icon: 'w-3.5 h-3.5', text: 'text-xs', count: 'text-xs' },
    md: { button: 'w-9 h-9', icon: 'w-4 h-4', text: 'text-sm', count: 'text-sm' },
    lg: { button: 'w-11 h-11', icon: 'w-5 h-5', text: 'text-base', count: 'text-base' },
  };

  const classes = sizeClasses[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center gap-1.5 rounded-full transition-all duration-200',
        'hover:bg-muted/50 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'px-3 py-1.5',
        status === 'liked' && 'text-blue-500 bg-blue-50 dark:bg-blue-950',
        (status === 'idle' || status === 'unliked') && !isLiked && 'text-muted-foreground',
        className
      )}
    >
      {/* 涟漪效果 */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute inset-0 rounded-full bg-blue-500/30"
          style={{
            width: ripple.size,
            height: ripple.size,
            margin: 'auto',
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}

      <ThumbsUp
        className={cn(
          classes.icon,
          'transition-all duration-200',
          status === 'liked' && '[&_path]:fill-current'
        )}
      />

      {showCount && (
        <span className={cn(classes.count, 'tabular-nums font-medium')}>
          {displayCount > 9999 ? `${(displayCount / 10000).toFixed(1)}w` : displayCount}
        </span>
      )}
    </button>
  );
}

/**
 * 星级评分组件
 */
interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 'md',
  readonly = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState(-1);

  const handleClick = (index: number) => {
    if (readonly) return;
    onChange?.(index);
    setAnimatingIndex(index);
    setTimeout(() => setAnimatingIndex(-1), 300);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const activeValue = hoverValue || value;

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={() => !readonly && setHoverValue(0)}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeValue;
        const isHalf = starValue - 0.5 <= activeValue && starValue > activeValue;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            disabled={readonly}
            className={cn(
              'relative transition-transform duration-150',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default',
              animatingIndex === starValue && 'animate-bounce'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors duration-150',
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 [&_path:first-child]:fill-amber-400/50'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * 确认动画组件
 */
interface ConfirmAnimationProps {
  children: React.ReactNode;
  show: boolean;
  onAnimationEnd?: () => void;
  className?: string;
}

export function ConfirmAnimation({
  children,
  show,
  onAnimationEnd,
  className,
}: ConfirmAnimationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
        onAnimationEnd?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show, onAnimationEnd]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'transition-all duration-300',
        show ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 打赏/赞赏按钮
 */
interface RewardButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function RewardButton({ onClick, disabled, className }: RewardButtonProps) {
  const [showEffect, setShowEffect] = useState(false);

  const handleClick = () => {
    setShowEffect(true);
    onClick();
    setTimeout(() => setShowEffect(false), 1500);
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative px-4 py-2 rounded-full transition-all duration-200',
          'bg-gradient-to-r from-amber-500 to-orange-500',
          'text-white font-medium',
          'hover:shadow-lg hover:scale-105 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <Sparkles className="w-4 h-4 mr-1.5 inline" />
        赞赏
      </button>

      {/* 闪光效果 */}
      {showEffect && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-400"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
                animation: 'sparkle 1s ease-out forwards',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
