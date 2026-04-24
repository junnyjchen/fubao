/**
 * @fileoverview 下单提醒飘窗组件
 * @description 页面加载3秒后飘出模拟下单提醒，增强购买紧迫感
 * @module components/shop/OrderReminder
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderReminderProps {
  goodsId: number;
  goodsName: string;
}

// 模拟用户名和地区
const mockUsers = [
  { name: '陳**', location: '香港' },
  { name: '李**', location: '九龍' },
  { name: '王**', location: '新界' },
  { name: '張**', location: '澳門' },
  { name: '劉**', location: '台北' },
  { name: '黃**', location: '高雄' },
  { name: '林**', location: '台中' },
  { name: '周**', location: '新加坡' },
  { name: '吳**', location: '馬來西亞' },
  { name: '鄭**', location: '美國' },
];

const mockActions = [
  '剛剛下單購買了',
  '剛剛加入了購物車',
  '正在查看',
  '收藏了',
];

export function OrderReminder({ goodsId, goodsName }: OrderReminderProps) {
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<{
    user: typeof mockUsers[0];
    action: string;
    time: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);

  // 生成随机提醒
  const generateReminder = useCallback(() => {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const action = mockActions[Math.floor(Math.random() * mockActions.length)];
    const minutes = Math.floor(Math.random() * 5) + 1;
    const time = minutes === 1 ? '1分鐘前' : `${minutes}分鐘前`;
    
    return { user, action, time };
  }, []);

  // 显示提醒
  const showReminder = useCallback(() => {
    if (dismissed) return;
    
    setCurrentReminder(generateReminder());
    setVisible(true);
    setIsAnimating(true);
    setReminderCount(prev => prev + 1);

    // 5秒后自动隐藏
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => setVisible(false), 300); // 等待动画完成
    }, 5000);
  }, [dismissed, generateReminder]);

  useEffect(() => {
    if (dismissed) return;

    // 3秒后首次显示
    const initialTimer = setTimeout(() => {
      showReminder();
    }, 3000);

    // 之后每隔30秒尝试显示一次，最多显示5次
    const intervalTimer = setInterval(() => {
      if (reminderCount < 5 && !visible) {
        showReminder();
      }
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [dismissed, reminderCount, visible, showReminder]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, 300);
  };

  if (!currentReminder || !visible) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 z-50 max-w-xs transition-all duration-300 ease-out ${
        isAnimating 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-8'
      }`}
    >
      <div className="bg-card/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-3 relative">
        {/* 关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted hover:bg-muted/80"
          onClick={handleDismiss}
        >
          <X className="w-3 h-3" />
        </Button>

        {/* 内容 */}
        <div className="flex items-start gap-3">
          {/* 头像 */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>

          {/* 文字 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-foreground">
                {currentReminder.user.name}
              </span>
              <span className="text-muted-foreground"> 來自 </span>
              <span className="text-foreground">
                {currentReminder.user.location}
              </span>
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {currentReminder.action}
              <span className="text-primary font-medium"> {goodsName}</span>
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {currentReminder.time}
            </div>
          </div>
        </div>

        {/* 小三角 */}
        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-card/95 border-r border-b border-border transform rotate-45" />
      </div>
    </div>
  );
}
