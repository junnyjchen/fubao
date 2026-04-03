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
import { useI18n } from '@/lib/i18n';

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

/**
 * 活动中心页面组件
 */
export default function ActivityPage() {
  const { t, isRTL } = useI18n();
  const activity = t.activityPage;
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActivityType | 'all'>('all');

  // 活动类型配置
  const activityTypeConfig: Record<ActivityType, { label: string; icon: typeof Zap; color: string; bgColor: string }> = {
    seckill: { label: activity.types.seckill, icon: Zap, color: 'text-red-500', bgColor: 'bg-red-500' },
    discount: { label: activity.types.discount, icon: Gift, color: 'text-orange-500', bgColor: 'bg-orange-500' },
    new_user: { label: activity.types.newUser, icon: Sparkles, color: 'text-purple-500', bgColor: 'bg-purple-500' },
    festival: { label: activity.types.festival, icon: Calendar, color: 'text-pink-500', bgColor: 'bg-pink-500' },
  };

  // 活动状态配置
  const activityStatusConfig: Record<ActivityStatus, { label: string; color: string }> = {
    upcoming: { label: activity.status.upcoming, color: 'bg-blue-100 text-blue-800' },
    active: { label: activity.status.active, color: 'bg-green-100 text-green-800' },
    ended: { label: activity.status.ended, color: 'bg-gray-100 text-gray-800' },
  };

  // 快捷入口配置
  const quickEntries = [
    {
      title: activity.quickEntries.seckill.title,
      description: activity.quickEntries.seckill.desc,
      icon: Zap,
      href: '/activity/seckill',
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      title: activity.quickEntries.pointsMall.title,
      description: activity.quickEntries.pointsMall.desc,
      icon: Star,
      href: '/points-mall',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      title: activity.quickEntries.newUser.title,
      description: activity.quickEntries.newUser.desc,
      icon: Sparkles,
      href: '/activity/new-user',
      color: 'from-purple-500 to-violet-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
    },
    {
      title: activity.quickEntries.discount.title,
      description: activity.quickEntries.discount.desc,
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
  const getActivityLink = (act: Activity) => {
    switch (act.type) {
      case 'seckill':
        return '/activity/seckill';
      case 'new_user':
        return '/activity/new-user';
      case 'discount':
        return '/activity/discount';
      default:
        return `/activity/${act.id}`;
    }
  };

  // 过滤活动
  const filteredActivities = activities.filter((act) => {
    if (activeTab === 'all') return true;
    return act.type === activeTab;
  });

  // 获取活动按钮文本
  const getActivityButtonText = (status: ActivityStatus) => {
    switch (status) {
      case 'active':
        return activity.buttons.participate;
      case 'upcoming':
        return activity.buttons.comingSoon;
      case 'ended':
        return activity.buttons.ended;
      default:
        return activity.buttons.participate;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 relative">
        {/* 分享按钮 */}
        <div className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-4 md:${isRTL ? 'left-8' : 'right-8'} md:top-6`}>
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={activity.shareTitle}
            description={activity.shareDesc}
            variant="ghost"
            size="sm"
            showText={false}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Gift className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{activity.title}</h1>
          </div>
          <p className="text-center text-primary-foreground/80">
            {activity.subtitle}
          </p>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityType | 'all')}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all">{activity.tabs.all}</TabsTrigger>
            <TabsTrigger value="seckill">{activity.tabs.seckill}</TabsTrigger>
            <TabsTrigger value="discount">{activity.tabs.discount}</TabsTrigger>
            <TabsTrigger value="new_user">{activity.tabs.newUser}</TabsTrigger>
            <TabsTrigger value="festival">{activity.tabs.festival}</TabsTrigger>
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
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl ${entry.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${entry.iconColor}`} />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
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
                  <div className={`absolute -top-10 ${isRTL ? '-left-10' : '-right-10'} w-40 h-40 rounded-full bg-white/10 blur-2xl`} />
                  <div className={`absolute -bottom-10 ${isRTL ? '-right-10' : '-left-10'} w-32 h-32 rounded-full bg-yellow-300/20 blur-xl`} />
                </div>
                
                <div className={`relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className="text-xl md:text-2xl font-bold">{activity.freeGift.title}</h3>
                        <Badge className="bg-white/30 text-white border-0 animate-pulse">
                          {activity.freeGift.badge}
                        </Badge>
                      </div>
                      <p className="text-white/90 text-sm md:text-base">
                        {activity.freeGift.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* 特点 */}
                  <div className={`flex items-center gap-4 text-sm text-white/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Truck className="w-4 h-4" />
                      {activity.freeGift.shipping}
                    </span>
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-4 h-4" />
                      {activity.freeGift.pickup}
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-5 py-2.5 group-hover:bg-white/30 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="font-medium">{activity.freeGift.cta}</span>
                    <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
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
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-medium text-blue-800">{activity.reminder.title}</h3>
                  <p className="text-sm text-blue-600">{activity.reminder.desc}</p>
                </div>
              </div>
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-100">
                <Bell className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {activity.reminder.button}
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
            <p>{activity.noActivity}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => {
              const typeConfig = activityTypeConfig[act.type];
              const statusConfig = activityStatusConfig[act.status];
              const Icon = typeConfig.icon;
              
              return (
                <Card key={act.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  {/* 封面图 */}
                  <div className="relative aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5">
                    {act.cover_image ? (
                      <Image
                        src={act.cover_image}
                        alt={act.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Icon className={`w-16 h-16 ${typeConfig.color}`} />
                      </div>
                    )}
                    
                    {/* 活动类型标签 */}
                    <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                      <Badge className={`${typeConfig.bgColor} text-white`}>
                        <Icon className={`w-3 h-3 ${isRTL ? 'ms-1' : 'me-1'}`} />
                        {typeConfig.label}
                      </Badge>
                    </div>
                    
                    {/* 活动状态 */}
                    <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {act.name}
                    </h3>
                    
                    {act.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {act.description}
                      </p>
                    )}
                    
                    {/* 活动时间 */}
                    <div className={`flex items-center gap-2 text-sm text-muted-foreground mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDate(act.start_time)} - {formatDate(act.end_time)}
                      </span>
                    </div>
                    
                    {/* 参与按钮 */}
                    <Link href={getActivityLink(act)}>
                      <Button className="w-full group-hover:bg-primary transition-colors">
                        {getActivityButtonText(act.status)}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'ms-2 rotate-180' : 'ml-2'}`} />
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
