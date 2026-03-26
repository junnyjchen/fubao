/**
 * @fileoverview 消息通知组件
 * @description 消息通知入口与通知列表
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  Gift,
  Clock,
  Package,
  MessageCircle,
  Megaphone,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Check,
  Settings,
  X,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'gift' | 'order' | 'activity' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'gift',
    title: '領取成功',
    content: '您已成功領取【招財符】一張，請及時到店領取',
    read: false,
    createdAt: '2024-01-15 14:30',
    actionUrl: '/free-gifts/records',
    actionText: '查看詳情',
  },
  {
    id: '2',
    type: 'activity',
    title: '新活動上線',
    content: '春節限定符箓免費領取活動已開啟，先到先得！',
    read: false,
    createdAt: '2024-01-15 10:00',
    actionUrl: '/free-gifts',
    actionText: '立即查看',
  },
  {
    id: '3',
    type: 'order',
    title: '物流更新',
    content: '您的訂單已發貨，預計明天送達',
    read: true,
    createdAt: '2024-01-14 16:20',
  },
  {
    id: '4',
    type: 'system',
    title: '系統通知',
    content: '您的賬號已完成實名認證',
    read: true,
    createdAt: '2024-01-13 09:00',
  },
];

interface NotificationCenterProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  notifications?: Notification[];
  onRead?: (id: string) => void;
  onReadAll?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

const typeConfig = {
  gift: { icon: Gift, color: 'text-red-500', bgColor: 'bg-red-100' },
  order: { icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  activity: { icon: Megaphone, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  system: { icon: Bell, color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export function NotificationCenter({
  open,
  onOpenChange,
  notifications = defaultNotifications,
  onRead,
  onReadAll,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('all');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              消息通知
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onReadAll}>
                <Check className="w-4 h-4 mr-1" />
                全部已讀
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="unread">未讀</TabsTrigger>
            <TabsTrigger value="gift">領取</TabsTrigger>
            <TabsTrigger value="activity">活動</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 min-h-0 mt-2">
            <ScrollArea className="h-full pr-2">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">暫無消息</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={onRead}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="flex-shrink-0 border-t pt-3">
            <Button variant="outline" className="w-full" onClick={onClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              清空全部消息
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * 通知项
 */
function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <Card
      className={`transition-colors ${
        notification.read ? 'bg-muted/30' : 'bg-background'
      }`}
    >
      <CardContent className="py-3">
        <div className="flex gap-3">
          <div
            className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <p className={`font-medium ${!notification.read && 'text-foreground'}`}>
                {notification.title}
              </p>
              <button
                onClick={() => onDelete?.(notification.id)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {notification.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {notification.createdAt}
              </span>
              <div className="flex items-center gap-2">
                {notification.actionUrl && (
                  <Link href={notification.actionUrl}>
                    <Button size="sm" variant="link" className="h-auto p-0">
                      {notification.actionText}
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  </Link>
                )}
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-1 text-xs"
                    onClick={() => onRead?.(notification.id)}
                  >
                    標記已讀
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 消息入口按钮（带角标）
 */
export function NotificationButton({
  count,
  onClick,
  hasNew = false,
}: {
  count?: number;
  onClick: () => void;
  hasNew?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-muted transition-colors"
    >
      {count && count > 0 ? (
        <BellRing className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
      {count && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
      {hasNew && !count && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </button>
  );
}

/**
 * 简洁通知横幅
 */
export function NotificationBanner({
  title,
  content,
  onClick,
  onClose,
}: {
  title: string;
  content: string;
  onClick?: () => void;
  onClose?: () => void;
}) {
  return (
    <div
      className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg p-3 flex items-center gap-3"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{content}</p>
      </div>
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </div>
  );
}

/**
 * 通知弹窗（Popover形式）
 */
export function NotificationPopover({
  notifications,
  onRead,
  onViewAll,
}: {
  notifications: Notification[];
  onRead?: (id: string) => void;
  onViewAll?: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <p className="font-medium">消息通知</p>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}條未讀</Badge>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-60">
          {recentNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 ${
                !n.read ? 'bg-muted/20' : ''
              }`}
              onClick={() => onRead?.(n.id)}
            >
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {n.content}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {n.createdAt}
              </p>
            </div>
          ))}
        </ScrollArea>
        {onViewAll && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full"
              size="sm"
              onClick={onViewAll}
            >
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
