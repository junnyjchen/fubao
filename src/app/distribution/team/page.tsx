/**
 * @fileoverview 我的团队页面
 * @description 查看分销团队成员
 * @module app/distribution/team/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Loader2,
  ChevronRight,
  Crown,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';

interface TeamMember {
  user_id: string;
  nickname: string;
  avatar_url: string;
  level: number;
  join_time: string;
  total_orders: number;
  total_sales: number;
  total_commission: number;
  is_team_leader: boolean;
  children_count: number;
}

interface TeamData {
  total_count: number;
  direct_count: number;
  level_2_count: number;
  level_3_count: number;
  members: TeamMember[];
}

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeamData | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribution/team');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!data) return [];
    switch (activeTab) {
      case 'level1':
        return data.members.filter((m) => m.level === 1);
      case 'level2':
        return data.members.filter((m) => m.level === 2);
      case 'level3':
        return data.members.filter((m) => m.level === 3);
      default:
        return data.members;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW');
  };

  const maskedName = (name: string) => {
    if (!name) return '用戶';
    return name.slice(0, 1) + '***' + name.slice(-1);
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return '一級';
      case 2:
        return '二級';
      case 3:
        return '三級';
      default:
        return '';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-amber-100 text-amber-700';
      case 2:
        return 'bg-blue-100 text-blue-700';
      case 3:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加載失敗，請重試</p>
      </div>
    );
  }

  const filteredMembers = filterMembers();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部 */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/distribution">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">我的團隊</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 团队统计 */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{data.total_count}</p>
              <p className="text-xs text-muted-foreground mt-1">團隊總人數</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{data.direct_count}</p>
              <p className="text-xs text-muted-foreground mt-1">直推人數</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {data.level_2_count + data.level_3_count}
              </p>
              <p className="text-xs text-muted-foreground mt-1">間推人數</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab 切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="level1">一級</TabsTrigger>
            <TabsTrigger value="level2">二級</TabsTrigger>
            <TabsTrigger value="level3">三級</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">暫無團隊成員</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.nickname?.[0] || '用'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {maskedName(member.nickname)}
                            </span>
                            <Badge className={getLevelColor(member.level)}>
                              {getLevelText(member.level)}
                            </Badge>
                            {member.is_team_leader && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            加入時間：{formatDate(member.join_time)}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-semibold">
                            HK${member.total_sales.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">銷售額</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{member.total_orders}</p>
                          <p className="text-xs text-muted-foreground">訂單數</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-600">
                            HK${member.total_commission.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">貢獻佣金</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 推广提示 */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">邀請更多好友</p>
                <p className="text-sm text-muted-foreground">
                  分享邀請鏈接，好友註冊購物後您可獲得佣金獎勵
                </p>
              </div>
              <Link href="/distribution">
                <Button size="sm">立即邀請</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
