/**
 * @fileoverview 收藏/提醒功能组件
 * @description 用户收藏商品或设置开抢提醒
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Bell,
  BellOff,
  Check,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  giftId: number;
  giftName: string;
  initialFavorited?: boolean;
  onFavoriteChange?: (favorited: boolean) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function FavoriteButton({
  giftId,
  giftName,
  initialFavorited = false,
  onFavoriteChange,
  variant = 'ghost',
  size = 'icon',
  showText = false,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setFavorited(!favorited);
    setLoading(false);
    
    toast.success(favorited ? '已取消收藏' : '已添加收藏');
    onFavoriteChange?.(!favorited);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={favorited ? 'text-red-500 hover:text-red-600' : ''}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : favorited ? (
        <>
          <Heart className="w-4 h-4 fill-current" />
          {showText && <span className="ml-1">已收藏</span>}
        </>
      ) : (
        <>
          <Heart className="w-4 h-4" />
          {showText && <span className="ml-1">收藏</span>}
        </>
      )}
    </Button>
  );
}

interface ReminderButtonProps {
  giftId: number;
  giftName: string;
  endTime: string;
  initialReminded?: boolean;
  onReminderChange?: (reminded: boolean, type?: string) => void;
}

export function ReminderButton({
  giftId,
  giftName,
  endTime,
  initialReminded = false,
  onReminderChange,
}: ReminderButtonProps) {
  const [reminded, setReminded] = useState(initialReminded);
  const [reminderType, setReminderType] = useState<string>('1hour');
  const [loading, setLoading] = useState(false);

  const handleSetReminder = async (type: string) => {
    setLoading(true);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setReminded(true);
    setReminderType(type);
    setLoading(false);
    
    const typeText = {
      '1hour': '1小時前',
      '1day': '1天前',
      '3days': '3天前',
    }[type] || type;
    
    toast.success(`已設置${typeText}提醒`);
    onReminderChange?.(true, type);
  };

  const handleCancelReminder = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setReminded(false);
    setLoading(false);
    
    toast.success('已取消提醒');
    onReminderChange?.(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={reminded ? 'text-orange-500' : ''}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : reminded ? (
            <BellOff className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {reminded ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              已設置提醒
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCancelReminder} className="text-destructive">
              <BellOff className="w-4 h-4 mr-2" />
              取消提醒
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>設置開搶提醒</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSetReminder('1hour')}>
              <Bell className="w-4 h-4 mr-2" />
              活動結束前1小時
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetReminder('1day')}>
              <Bell className="w-4 h-4 mr-2" />
              活動結束前1天
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetReminder('3days')}>
              <Bell className="w-4 h-4 mr-2" />
              活動結束前3天
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 收藏按钮组（收藏+提醒）
 */
export function ActionButtons({
  giftId,
  giftName,
  endTime,
  initialFavorited = false,
  initialReminded = false,
  onFavoriteChange,
  onReminderChange,
}: {
  giftId: number;
  giftName: string;
  endTime: string;
  initialFavorited?: boolean;
  initialReminded?: boolean;
  onFavoriteChange?: (favorited: boolean) => void;
  onReminderChange?: (reminded: boolean, type?: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <FavoriteButton
        giftId={giftId}
        giftName={giftName}
        initialFavorited={initialFavorited}
        onFavoriteChange={onFavoriteChange}
      />
      <ReminderButton
        giftId={giftId}
        giftName={giftName}
        endTime={endTime}
        initialReminded={initialReminded}
        onReminderChange={onReminderChange}
      />
    </div>
  );
}
