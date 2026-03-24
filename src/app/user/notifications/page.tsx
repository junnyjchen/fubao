/**
 * @fileoverview 消息通知列表页面
 * @description 用户查看所有消息通知
 * @module app/user/notifications/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Package,
  Ticket,
  TrendingUp,
  Info,
  Loader2,
  Check,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  link: string | null;
  image: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
      setLoading(false);
      return;
    }
    
    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user?.id}&pageSize=50`);
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, notificationId: id }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, markAll: true }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('已全部標為已讀');
        fetchNotifications();
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此消息嗎？')) return;
    
    try {
      const res = await fetch(`/api/notifications?id=${id}&userId=${user?.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        toast.success('刪除成功');
        fetchNotifications();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'coupon':
        return <Ticket className="w-5 h-5 text-green-500" />;
      case 'distribution':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return '訂單消息';
      case 'coupon':
        return '優惠券';
      case 'distribution':
        return '分銷消息';
      default:
        return '系統消息';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  const filterNotifications = (type: string) => {
    if (type === 'all') return notifications;
    return notifications.filter(n => n.type === type);
  };

  const currentNotifications = filterNotifications(activeTab);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              消息通知
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}條未讀
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">查看您的消息通知</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <Check className="w-4 h-4 mr-2" />
              全部已讀
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 类型筛选 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="order">訂單</TabsTrigger>
            <TabsTrigger value="coupon">優惠券</TabsTrigger>
            <TabsTrigger value="distribution">分銷</TabsTrigger>
            <TabsTrigger value="system">系統</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 消息列表 */}
        {currentNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">暫無消息</h3>
              <p className="text-muted-foreground">這裏空空如也~</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden transition-all hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-4">
                    {/* 类型图标 */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.is_read && (
                            <span className="text-xs text-primary font-medium">
                              未讀
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      
                      <h3 className={`font-medium mb-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.content}
                      </p>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-3 mt-3">
                        {notification.link && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={notification.link}>
                              查看詳情
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            標為已讀
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          刪除
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}

// 模拟数据
function getMockNotifications(): Notification[] {
  return [
    {
      id: 1,
      type: 'order',
      title: '訂單發貨通知',
      content: '您的訂單 #20260324001 已發貨，預計3-5個工作日送達，請注意查收。如有問題請聯繫客服。',
      link: '/user/orders/1',
      image: null,
      is_read: false,
      created_at: '2026-03-24T10:00:00',
      read_at: null,
    },
    {
      id: 2,
      type: 'coupon',
      title: '優惠券即將到期',
      content: '您的"新用戶專享券"將在7天後到期，快去使用吧！滿HK$200即可抵扣HK$50。',
      link: '/user/coupons',
      image: null,
      is_read: false,
      created_at: '2026-03-23T15:00:00',
      read_at: null,
    },
    {
      id: 3,
      type: 'system',
      title: '歡迎加入符寶網',
      content: '感謝您註冊符寶網，開啟您的玄門文化之旅！立即領取新用戶專屬優惠券。',
      link: null,
      image: null,
      is_read: true,
      created_at: '2026-03-20T09:00:00',
      read_at: '2026-03-20T10:00:00',
    },
    {
      id: 4,
      type: 'distribution',
      title: '分銷佣金到賬',
      content: '您的好友完成了購物，您獲得分銷佣金 HK$15.00，已自動轉入您的賬戶餘額。',
      link: '/distribution/commissions',
      image: null,
      is_read: false,
      created_at: '2026-03-22T14:30:00',
      read_at: null,
    },
    {
      id: 5,
      type: 'order',
      title: '訂單確認收貨',
      content: '您的訂單 #20260320001 已確認收貨，感謝您的購買！歡迎曬單分享您的購物體驗。',
      link: '/user/orders/2',
      image: null,
      is_read: true,
      created_at: '2026-03-21T16:00:00',
      read_at: '2026-03-21T18:00:00',
    },
  ];
}
