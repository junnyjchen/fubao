'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatCount, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  Heart,
  Star,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Dashboard Stats Card
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-orange-500/10 text-orange-500',
    danger: 'bg-red-500/10 text-red-500',
    info: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                )}
                {trend === 'down' && (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend === 'up' && 'text-green-500',
                    trend === 'down' && 'text-red-500'
                  )}
                >
                  {change > 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stats Dashboard
interface DashboardStats {
  overview: {
    total_users: number;
    total_orders: number;
    total_revenue: number;
    total_goods: number;
    user_growth: number;
    order_growth: number;
    revenue_growth: number;
    goods_growth: number;
  };
  today: {
    orders: number;
    revenue: number;
    users: number;
    visitors: number;
  };
  hotGoods: Array<{
    id: number;
    name: string;
    sales: number;
    cover_image: string;
  }>;
  recentOrders: Array<{
    id: number;
    order_no: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
}

interface StatsDashboardProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function StatsDashboard({ stats, loading }: StatsDashboardProps) {
  if (loading) {
    return <StatsDashboardSkeleton />;
  }

  const { overview, today, hotGoods, recentOrders } = stats;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总用户数"
          value={formatCount(overview.total_users)}
          change={overview.user_growth}
          changeLabel="较上月"
          icon={<Users className="w-6 h-6" />}
          trend={overview.user_growth >= 0 ? 'up' : 'down'}
          color="info"
        />
        <StatCard
          title="总订单数"
          value={formatCount(overview.total_orders)}
          change={overview.order_growth}
          changeLabel="较上月"
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={overview.order_growth >= 0 ? 'up' : 'down'}
          color="primary"
        />
        <StatCard
          title="总收入"
          value={formatPrice(overview.total_revenue)}
          change={overview.revenue_growth}
          changeLabel="较上月"
          icon={<DollarSign className="w-6 h-6" />}
          trend={overview.revenue_growth >= 0 ? 'up' : 'down'}
          color="success"
        />
        <StatCard
          title="商品总数"
          value={formatCount(overview.total_goods)}
          change={overview.goods_growth}
          changeLabel="较上月"
          icon={<Package className="w-6 h-6" />}
          trend={overview.goods_growth >= 0 ? 'up' : 'down'}
          color="warning"
        />
      </div>

      {/* Today Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            今日概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{today.orders}</p>
              <p className="text-sm text-muted-foreground">今日订单</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{formatPrice(today.revenue)}</p>
              <p className="text-sm text-muted-foreground">今日收入</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{today.users}</p>
              <p className="text-sm text-muted-foreground">新增用户</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{formatCount(today.visitors)}</p>
              <p className="text-sm text-muted-foreground">访问量</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Goods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              热销商品 TOP10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotGoods.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 && 'bg-yellow-500 text-white',
                    index === 1 && 'bg-gray-400 text-white',
                    index === 2 && 'bg-amber-600 text-white',
                    index > 2 && 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.cover_image}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">销量 {formatCount(item.sales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              最新订单
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.order_no}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at, 'MM-DD HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-500">
                      {formatPrice(order.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Chart Components
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 200, color = 'hsl(var(--primary))' }: LineChartProps) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }}>
      {/* Grid lines */}
      <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" className="text-muted/30" strokeWidth="0.2" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-muted/30" strokeWidth="0.2" />
      <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" className="text-muted/30" strokeWidth="0.2" />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />

      {/* Area */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={color}
        opacity="0.1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 200, color = 'hsl(var(--primary))' }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }}>
      {/* Grid line */}
      <line x1="0" y1="95" x2="100" y2="95" stroke="currentColor" className="text-muted/30" strokeWidth="0.2" />

      {/* Bars */}
      {data.map((d, i) => {
        const barWidth = 80 / data.length;
        const barHeight = (d.value / max) * 80;
        const x = 10 + i * (80 / data.length) + barWidth / 2 - 3;
        const y = 95 - barHeight;

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="6"
            height={barHeight}
            fill={color}
            rx="1"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {data.map((d, i) => {
        const angle = (d.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return <path key={i} d={path} fill={d.color} />;
      })}

      {/* Center hole */}
      <circle cx="50" cy="50" r="20" fill="currentColor" className="text-background" />
    </svg>
  );
}

// Legend
interface LegendProps {
  items: Array<{ label: string; color: string; value?: string | number }>;
}

export function Legend({ items }: LegendProps) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm">{item.label}</span>
          {item.value && (
            <span className="text-sm text-muted-foreground">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Skeleton
export function StatsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
