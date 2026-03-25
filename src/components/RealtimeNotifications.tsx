/**
 * @fileoverview 实时通知组件
 * @description 展示WebSocket实时推送的通知
 * @module components/RealtimeNotifications
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { WsMessage } from '@/lib/ws-client';

interface Notification {
  id: string;
  type: 'order' | 'coupon' | 'distribution' | 'system';
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface RealtimeNotificationsProps {
  userId: number | null;
}

export function RealtimeNotifications({ userId }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 从本地存储加载历史通知
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch {
          // 忽略解析错误
        }
      }
    }
  }, []);

  // 保存通知到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && notifications.length > 0) {
      // 只保存最近50条
      const toSave = notifications.slice(0, 50);
      localStorage.setItem('notifications', JSON.stringify(toSave));
    }
  }, [notifications]);

  // WebSocket连接
  const { isConnected } = useWebSocket({
    path: userId ? `/ws/notifications?userId=${userId}` : '/ws/notifications',
    onMessage: (msg: WsMessage) => {
      if (msg.type === 'notification' || msg.type === 'broadcast') {
        const payload = msg.payload as Omit<Notification, 'read'>;
        setNotifications((prev) => [
          {
            ...payload,
            read: false,
          },
          ...prev,
        ]);

        // 显示浏览器通知（如果已授权）
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.title, { body: payload.content });
        }
      }
    },
    enabled: !!userId,
  });

  // 标记为已读
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // 全部标记为已读
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // 清除所有通知
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'coupon':
        return '🎟️';
      case 'distribution':
        return '👥';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {isConnected() && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">通知中心</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                全部已读
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearAll}>
              清空
            </Button>
          </div>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              暫無通知
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                    !notification.read && 'bg-primary/5'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {getTypeIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString(
                          'zh-TW'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
