'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatCount, formatPrice, formatDate } from '@/lib/format';
import {
  MessageSquare,
  Zap,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AIUsageStats {
  period: string;
  overview: {
    total_calls: number;
    total_tokens: number;
    error_count: number;
    error_rate: number;
    unique_users: number;
    avg_latency: number;
  };
  today: {
    calls: number;
    tokens: number;
  };
  daily_trend: Array<{
    date: string;
    calls: number;
    tokens: number;
    avg_latency: number;
  }>;
  top_questions: Array<{
    content: string;
    count: number;
  }>;
  error_distribution: Array<{
    type: string;
    count: number;
  }>;
  recent_users: Array<{
    id: number;
    nickname: string;
    avatar?: string;
    call_count: number;
    last_used: string;
  }>;
}

interface AIStatsDashboardProps {
  stats: AIUsageStats;
  loading?: boolean;
}

export function AIStatsDashboard({ stats, loading }: AIStatsDashboardProps) {
  const [period, setPeriod] = useState('7days');

  if (loading) {
    return <AIStatsDashboardSkeleton />;
  }

  const { overview, today, daily_trend, top_questions, error_distribution, recent_users } = stats;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI使用統計</h2>
        <div className="flex gap-2">
          {['today', '7days', '30days', '90days'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === 'today' ? '今日' : p === '7days' ? '7天' : p === '30days' ? '30天' : '90天'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="總調用次數"
          value={formatCount(overview.total_calls)}
          icon={<MessageSquare className="w-5 h-5" />}
          color="primary"
        />
        <StatCard
          title="總消耗Token"
          value={formatCount(overview.total_tokens)}
          icon={<Zap className="w-5 h-5" />}
          color="info"
        />
        <StatCard
          title="獨立用戶"
          value={formatCount(overview.unique_users)}
          icon={<Users className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          title="平均延遲"
          value={`${overview.avg_latency}ms`}
          icon={<Clock className="w-5 h-5" />}
          color="warning"
        />
        <StatCard
          title="錯誤次數"
          value={overview.error_count}
          icon={<AlertCircle className="w-5 h-5" />}
          color="danger"
        />
        <StatCard
          title="錯誤率"
          value={`${overview.error_rate}%`}
          icon={<Activity className="w-5 h-5" />}
          color={overview.error_rate > 5 ? 'danger' : 'success'}
        />
      </div>

      {/* Today Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            今日概覽
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold">{today.calls}</p>
              <p className="text-sm text-muted-foreground">今日調用</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold">{formatCount(today.tokens)}</p>
              <p className="text-sm text-muted-foreground">消耗Token</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold">{overview.unique_users}</p>
              <p className="text-sm text-muted-foreground">活躍用戶</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold">{overview.avg_latency}ms</p>
              <p className="text-sm text-muted-foreground">平均延遲</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              每日趨勢
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {daily_trend.slice(-7).map((day, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-20">
                    {formatDate(day.date, 'MM-DD')}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary rounded transition-all"
                      style={{
                        width: `${Math.min(100, (day.calls / Math.max(...daily_trend.map(d => d.calls))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {day.calls}次
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              熱門問題 TOP10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top_questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    i === 0 && 'bg-yellow-500 text-white',
                    i === 1 && 'bg-gray-400 text-white',
                    i === 2 && 'bg-amber-600 text-white',
                    i > 2 && 'bg-muted text-muted-foreground'
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{q.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCount(q.count)} 次提問
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              錯誤分佈
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error_distribution.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暫無錯誤</p>
            ) : (
              <div className="space-y-3">
                {error_distribution.map((err, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        err.type === '超時' && 'bg-orange-500',
                        err.type === '頻率限制' && 'bg-red-500',
                        err.type === 'API Key錯誤' && 'bg-purple-500',
                        err.type === '其他錯誤' && 'bg-gray-500'
                      )} />
                      <span className="text-sm">{err.type}</span>
                    </div>
                    <Badge variant="secondary">{err.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              活躍用戶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {user.nickname?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.nickname || '訪客'}</p>
                    <p className="text-xs text-muted-foreground">
                      最後使用: {formatDate(user.last_used, 'MM-DD HH:mm')}
                    </p>
                  </div>
                  <Badge variant="secondary">{user.call_count}次</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: number;
}

function StatCard({ title, value, icon, color = 'primary', trend }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-orange-500/10 text-orange-500',
    danger: 'bg-red-500/10 text-red-500',
    info: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton
export function AIStatsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
