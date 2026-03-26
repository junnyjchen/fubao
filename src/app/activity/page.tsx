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
  Loader2,
} from 'lucide-react';

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
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
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

      {/* 活动列表 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
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
