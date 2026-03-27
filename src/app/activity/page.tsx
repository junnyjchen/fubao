/**
 * @fileoverview 活动中心页面
 * @description 展示所有活动
 * @module app/activity/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Gift,
  Sparkles,
  Calendar,
  ArrowRight,
  Clock,
  Truck,
  MapPin,
  Users,
  Share2,
  Star,
  Bell,
} from 'lucide-react';
import { ShareButton } from '@/components/free-gifts/ShareButton';
import { ActivitySkeleton } from '@/components/common/PageSkeletons';

/** 活动类型 */
type ActivityType = 'seckill' | 'discount' | 'new_user' | 'festival';

/** 活动状态 */
type ActivityStatus = 'upcoming' | 'active' | 'ended';

/** 活动接口 */
interface Activity {
  id: number;
  name: string;
  type: ActivityType;
  description: string | null;
  cover_image: string | null;
  start_time: string;
  end_time: string;
  status: ActivityStatus;
  sort: number;
}

/** 活动类型配置 */
const activityTypeConfig: Record<ActivityType, { label: string; icon: typeof Zap; color: string; bgColor: string }> = {
  seckill: { label: '限時秒殺', icon: Zap, color: 'text-red-500', bgColor: 'bg-red-500' },
  discount: { label: '滿減優惠', icon: Gift, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  new_user: { label: '新人專享', icon: Sparkles, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  festival: { label: '節日活動', icon: Calendar, color: 'text-pink-500', bgColor: 'bg-pink-500' },
};

/** 活动状态配置 */
const activityStatusConfig: Record<ActivityStatus, { label: string; color: string }> = {
  upcoming: { label: '即將開始', color: 'bg-blue-100 text-blue-800' },
  active: { label: '進行中', color: 'bg-green-100 text-green-800' },
  ended: { label: '已結束', color: 'bg-gray-100 text-gray-800' },
};

/**
 * 活动中心页面组件
 */
export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActivityType | 'all'>('all');

  // 快捷入口配置
  const quickEntries = [
    {
      title: '限時秒殺',
      description: '定時開搶，手慢無',
      icon: Zap,
      href: '/activity/seckill',
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      title: '積分商城',
      description: '積分兌好禮',
      icon: Star,
      href: '/points-mall',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      title: '新人專享',
      description: '新人福利包',
      icon: Sparkles,
      href: '/activity/new-user',
      color: 'from-purple-500 to-violet-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
    },
    {
      title: '滿減優惠',
      description: '多買多減',
      icon: Gift,
      href: '/activity/discount',
      color: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
  ];

  useEffect(() => {
    loadActivities();
  }, [activeTab]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.set('type', activeTab);
      }
      
      const res = await fetch(`/api/activities?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取活动跳转链接
  const getActivityLink = (activity: Activity) => {
    switch (activity.type) {
      case 'seckill':
        return '/activity/seckill';
      case 'new_user':
        return '/activity/new-user';
      case 'discount':
        return '/activity/discount';
      default:
        return `/activity/${activity.id}`;
    }
  };

  // 过滤活动
  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'all') return true;
    return activity.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 relative">
        {/* 分享按钮 */}
        <div className="absolute right-4 top-4 md:right-8 md:top-6">
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title="符寶網活動中心"
            description="精彩活動不斷，優惠享不停！"
            variant="ghost"
            size="sm"
            showText={false}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">活動中心</h1>
          </div>
          <p className="text-center text-primary-foreground/80">
            精彩活動不斷，優惠享不停
          </p>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityType | 'all')}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="seckill">限時秒殺</TabsTrigger>
            <TabsTrigger value="discount">滿減優惠</TabsTrigger>
            <TabsTrigger value="new_user">新人專享</TabsTrigger>
            <TabsTrigger value="festival">節日活動</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 快捷入口 */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link key={entry.href} href={entry.href}>
                <Card className={`bg-gradient-to-r ${entry.color} text-white overflow-hidden hover:shadow-lg transition-all cursor-pointer group`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${entry.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${entry.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.title}</h3>
                        <p className="text-sm text-white/80">{entry.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 免费领专属入口 */}
      <div className="container mx-auto px-4 pb-6">
        <Link href="/free-gifts">
          <Card className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-0">
              <div className="relative p-6 md:p-8">
                {/* 背景装饰 */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-yellow-300/20 blur-xl" />
                </div>
                
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl md:text-2xl font-bold">免費領好禮</h3>
                        <Badge className="bg-white/30 text-white border-0 animate-pulse">
                          限時活動
                        </Badge>
                      </div>
                      <p className="text-white/90 text-sm md:text-base">
                        精選玄門好物免費領取，支持郵寄或到店自取
                      </p>
                    </div>
                  </div>
                  
                  {/* 特点 */}
                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      郵寄僅付運費
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      到店免費領取
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-5 py-2.5 group-hover:bg-white/30 transition-colors">
                    <span className="font-medium">立即領取</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 活动订阅提醒 */}
      <div className="container mx-auto px-4 pb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">活動提醒</h3>
                  <p className="text-sm text-blue-600">訂閱後，新活動開始時會通知您</p>
                </div>
              </div>
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-100">
                <Bell className="w-4 h-4 mr-2" />
                訂閱提醒
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 活动列表 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <ActivitySkeleton />
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暫無活動</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => {
              const typeConfig = activityTypeConfig[activity.type];
              const statusConfig = activityStatusConfig[activity.status];
              const Icon = typeConfig.icon;
              
              return (
                <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  {/* 封面图 */}
                  <div className="relative aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5">
                    {activity.cover_image ? (
                      <Image
                        src={activity.cover_image}
                        alt={activity.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Icon className={`w-16 h-16 ${typeConfig.color}`} />
                      </div>
                    )}
                    
                    {/* 活动类型标签 */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${typeConfig.bgColor} text-white`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>
                    
                    {/* 活动状态 */}
                    <div className="absolute top-3 right-3">
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {activity.name}
                    </h3>
                    
                    {activity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {activity.description}
                      </p>
                    )}
                    
                    {/* 活动时间 */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDate(activity.start_time)} - {formatDate(activity.end_time)}
                      </span>
                    </div>
                    
                    {/* 参与按钮 */}
                    <Link href={getActivityLink(activity)}>
                      <Button className="w-full group-hover:bg-primary transition-colors">
                        {activity.status === 'active' ? '立即參與' : activity.status === 'upcoming' ? '敬請期待' : '已結束'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
