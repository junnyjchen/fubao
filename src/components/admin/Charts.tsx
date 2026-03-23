/**
 * @fileoverview 销售统计图表组件
 * @description 简单的条形图展示销售数据
 * @module components/admin/SalesChart
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesData {
  label: string;
  value: number;
  percentage?: number;
}

interface SalesChartProps {
  title: string;
  data: SalesData[];
  loading?: boolean;
}

export function SalesChart({ title, data, loading }: SalesChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * @fileoverview 环形进度图组件
 * @description 展示完成进度或比例数据
 */

interface CircleProgressProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export function CircleProgress({ value, max, label, color = 'hsl(var(--primary))' }: CircleProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground text-center">{label}</p>
      <p className="text-xs text-muted-foreground">{value}/{max}</p>
    </div>
  );
}

/**
 * @fileoverview 订单状态统计组件
 */

interface OrderStatusData {
  label: string;
  count: number;
  color: string;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">訂單狀態分佈</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 条形图 */}
        <div className="flex h-4 rounded-full overflow-hidden mb-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="h-full transition-all duration-500"
              style={{
                width: `${(item.count / total) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>
        
        {/* 图例 */}
        <div className="grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
