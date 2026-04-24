/**
 * @fileoverview 用户积分页面
 * @description 查看积分、等级和积分记录
 * @module app/user/points/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Gift,
  History,
  TrendingUp,
  ChevronRight,
  Award,
  Percent,
} from 'lucide-react';
import { PointsSkeleton } from '@/components/common/PageSkeletons';

/** 等级信息 */
interface LevelInfo {
  level: number;
  name: string;
  min_points: number;
  max_points: number | null;
  discount: number;
  color: string;
  benefits?: string[];
}

/** 积分记录 */
interface PointRecord {
  id: number;
  points: number;
  type: string;
  source: string | null;
  description: string | null;
  balance_after: number;
  created_at: string;
}

/**
 * 用户积分页面
 */
export default function UserPointsPage() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [progress, setProgress] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [nextLevel, setNextLevel] = useState<LevelInfo | null>(null);
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [allLevels, setAllLevels] = useState<LevelInfo[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [pointsRes, levelsRes] = await Promise.all([
        fetch('/api/user/points'),
        fetch('/api/user/level'),
      ]);

      const pointsData = await pointsRes.json();
      const levelsData = await levelsRes.json();

      setPoints(pointsData.points || 0);
      setLevel(pointsData.level || 1);
      setTotalPoints(pointsData.total_points || 0);
      setProgress(pointsData.progress || 0);
      setLevelInfo(pointsData.levelInfo);
      setNextLevel(pointsData.nextLevel);
      setRecords(pointsData.records || []);
      setAllLevels(levelsData.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取积分来源名称
   */
  const getSourceName = (source: string | null) => {
    const sources: Record<string, string> = {
      order: '購物獲得',
      login: '每日簽到',
      share: '分享獲得',
      register: '註冊獎勵',
      review: '評價獲得',
      admin: '系統調整',
    };
    return sources[source || ''] || source || '其他';
  };

  /**
   * 获取积分类型样式
   */
  const getTypeStyle = (type: string) => {
    if (type === 'earn') {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  if (loading) {
    return <PointsSkeleton />;
  }

  return (
    <UserLayout title="我的積分">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="overview">積分概覽</TabsTrigger>
          <TabsTrigger value="records">積分明細</TabsTrigger>
        </TabsList>

        {/* 积分概览 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 当前积分卡片 */}
          <Card className="overflow-hidden">
            <div
              className="h-2"
              style={{ backgroundColor: levelInfo?.color || '#9CA3AF' }}
            />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">當前積分</p>
                  <p className="text-4xl font-bold text-primary">{points}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5" style={{ color: levelInfo?.color }} />
                    <span className="font-semibold" style={{ color: levelInfo?.color }}>
                      {levelInfo?.name || '善信初學'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    累計獲得 {totalPoints} 積分
                  </p>
                </div>
              </div>

              {/* 升级进度 */}
              {nextLevel && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>距離 {nextLevel.name} 還需</span>
                    <span className="font-medium">
                      {nextLevel.min_points - totalPoints} 積分
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* 等级特权 */}
              {levelInfo?.discount && levelInfo.discount < 100 && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center gap-2">
                  <Percent className="w-5 h-5 text-primary" />
                  <span className="text-sm">
                    專享 {levelInfo.discount / 10} 折購物優惠
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 等级权益 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="w-5 h-5 text-primary" />
                等級權益
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allLevels.map((lv) => (
                  <div
                    key={lv.level}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      lv.level === level
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: lv.color }}
                        >
                          {lv.level}
                        </div>
                        <span className="font-medium">{lv.name}</span>
                      </div>
                      {lv.discount < 100 && (
                        <Badge variant="secondary">{lv.discount / 10}折</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lv.min_points.toLocaleString()}
                      {lv.max_points ? ` - ${lv.max_points.toLocaleString()}` : '+'} 積分
                    </p>
                    {lv.benefits && lv.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lv.benefits.map((benefit, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 获取积分方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" />
                獲取積分方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Gift, label: '購物獲得', desc: '消費1元=1積分' },
                  { icon: Star, label: '每日簽到', desc: '每日簽到得5積分' },
                  { icon: Gift, label: '評價商品', desc: '每條評價得10積分' },
                  { icon: Star, label: '分享商品', desc: '每次分享得2積分' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 积分明细 */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-primary" />
                積分明細
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">暫無積分記錄</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">
                          {record.description || getSourceName(record.source)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTypeStyle(record.type)}`}>
                          {record.type === 'earn' ? '+' : '-'}
                          {Math.abs(record.points)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          餘額: {record.balance_after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
