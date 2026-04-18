'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import {
  Gift,
  Plus,
  Minus,
  Star,
  Crown,
  TrendingUp,
  History,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';

interface PointsInfo {
  points: number;
  total_points: number;
  level: number;
  level_name: string;
  exp: number;
  next_exp: number;
  progress: number;
  level_icon: string;
}

interface PointsLog {
  id: number;
  points: number;
  type: string;
  remark: string;
  created_at: string;
}

interface PointsCenterProps {
  info: PointsInfo;
  loading?: boolean;
  onRefresh: () => void;
}

export function PointsCenter({ info, loading, onRefresh }: PointsCenterProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Points */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {info.level_icon}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{info.points.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">积分</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  累计获得 {info.total_points.toLocaleString()} 积分
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRules(true)}>
                <Gift className="w-4 h-4 mr-1" />
                积分规则
              </Button>
              <Button size="sm" onClick={onRefresh} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                签到
              </Button>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>{info.level_name}</span>
              </div>
              <span className="text-muted-foreground">
                {info.exp} / {info.next_exp} EXP
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                style={{ width: `${info.progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Modal */}
      <Modal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        title="积分规则"
        size="md"
      >
        <PointsRules />
      </Modal>
    </>
  );
}

// Points Rules
function PointsRules() {
  const rules = [
    {
      icon: '📝',
      name: '每日签到',
      points: '+5',
      description: '每日签到可获得积分，连续签到有额外奖励',
    },
    {
      icon: '🛒',
      name: '购物返积分',
      points: '+1%',
      description: '每消费1元返1%积分（可设置）',
    },
    {
      icon: '⭐',
      name: '商品评价',
      points: '+10',
      description: '完成商品评价可获得积分',
    },
    {
      icon: '👥',
      name: '邀请好友',
      points: '+50',
      description: '成功邀请好友注册可获得积分',
    },
    {
      icon: '🔗',
      name: '分享商品',
      points: '+2',
      description: '分享商品链接可获得积分，每日最多5次',
    },
  ];

  return (
    <div className="space-y-4">
      {rules.map((rule, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <span className="text-2xl">{rule.icon}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{rule.name}</h4>
              <span className="text-primary font-medium">{rule.points}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Points History
interface PointsHistoryProps {
  logs: PointsLog[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function PointsHistory({ logs, loading, onLoadMore, hasMore }: PointsHistoryProps) {
  if (loading && logs.length === 0) {
    return <PointsHistorySkeleton />;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无积分记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between p-3 bg-card border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                log.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              )}
            >
              {log.points > 0 ? <TrendingUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-sm">{log.remark || getLogTypeName(log.type)}</p>
              <p className="text-xs text-muted-foreground">{log.created_at}</p>
            </div>
          </div>
          <span
            className={cn(
              'font-bold',
              log.points > 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {log.points > 0 ? '+' : ''}{log.points}
          </span>
        </div>
      ))}

      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}

function getLogTypeName(type: string): string {
  const names: Record<string, string> = {
    sign: '每日签到',
    order: '购物返积分',
    review: '评价返积分',
    invite: '邀请返积分',
    share: '分享返积分',
    exchange: '积分兑换',
    refund: '退款返还',
  };
  return names[type] || type;
}

// Points Exchange
interface PointsExchangeProps {
  goods: {
    id: number;
    name: string;
    image: string;
    points: number;
    stock: number;
  }[];
  userPoints: number;
  onExchange: (goodsId: number) => Promise<void>;
}

export function PointsExchange({ goods, userPoints, onExchange }: PointsExchangeProps) {
  const [exchangeId, setExchangeId] = useState<number | null>(null);
  const { success, error } = useToast();

  const handleExchange = async (goodsId: number) => {
    const item = goods.find((g) => g.id === goodsId);
    if (!item) return;

    if (item.points > userPoints) {
      error('积分不足');
      return;
    }

    if (item.stock <= 0) {
      error('库存不足');
      return;
    }

    try {
      setExchangeId(goodsId);
      await onExchange(goodsId);
      success('兑换成功');
    } catch (err) {
      error('兑换失败');
    } finally {
      setExchangeId(null);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {goods.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="aspect-square bg-muted relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
              {item.points}积分
            </div>
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              剩余 {item.stock} 件
            </p>
            <Button
              size="sm"
              className="w-full mt-3"
              disabled={item.points > userPoints || item.stock <= 0 || exchangeId === item.id}
              onClick={() => handleExchange(item.id)}
            >
              {exchangeId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Gift className="w-4 h-4 mr-1" />
              )}
              兑换
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sign Calendar
interface SignCalendarProps {
  signedDays: number[];
  onSign: () => Promise<void>;
  canSign: boolean;
}

export function SignCalendar({ signedDays, onSign, canSign }: SignCalendarProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleSign = async () => {
    try {
      setLoading(true);
      await onSign();
      success('签到成功');
    } catch (err) {
      error('签到失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {currentYear}年{currentMonth + 1}月签到
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const isToday = date.toDateString() === today.toDateString();
            const isSigned = signedDays.includes(day);
            const isFuture = date > today;

            return (
              <div
                key={day}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-lg text-sm',
                  isSigned && 'bg-green-100 text-green-600 font-medium',
                  isToday && !isSigned && 'bg-primary/10 text-primary font-medium ring-2 ring-primary',
                  isFuture && 'text-muted-foreground/50'
                )}
              >
                {isSigned ? <Check className="w-4 h-4" /> : day}
              </div>
            );
          })}
        </div>

        {/* Sign button */}
        <Button
          className="w-full mt-4"
          onClick={handleSign}
          disabled={loading || !canSign}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {canSign ? '立即签到' : '今日已签到'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Skeleton
function PointsHistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="w-1/2 h-4 bg-muted animate-pulse rounded" />
            <div className="w-1/4 h-3 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
