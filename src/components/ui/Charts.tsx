/**
 * @fileoverview 数据可视化增强组件
 * @description 统计图表和数据展示组件
 * @module components/ui/Charts
 */

'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// 主题颜色
const COLORS = {
  primary: '#1A5F3C',
  secondary: '#8B5A2B',
  accent: '#D4AF37',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.info,
  COLORS.success,
  COLORS.warning,
];

// 通用图表容器
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

// 折线图
interface LineChartWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  lines: { key: string; name: string; color?: string }[];
  height?: number;
  className?: string;
}

export function LineChartWidget({
  title,
  subtitle,
  data,
  xKey,
  lines,
  height = 300,
  className,
}: LineChartWidgetProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={xKey}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// 面积图
interface AreaChartWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  areas: { key: string; name: string; color?: string }[];
  height?: number;
  className?: string;
}

export function AreaChartWidget({
  title,
  subtitle,
  data,
  xKey,
  areas,
  height = 300,
  className,
}: AreaChartWidgetProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={xKey}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {areas.map((area, index) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.name}
              stroke={area.color || CHART_COLORS[index % CHART_COLORS.length]}
              fill={area.color || CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// 柱状图
interface BarChartWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  bars: { key: string; name: string; color?: string }[];
  height?: number;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export function BarChartWidget({
  title,
  subtitle,
  data,
  xKey,
  bars,
  height = 300,
  className,
  layout = 'horizontal',
}: BarChartWidgetProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={xKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// 饼图
interface PieChartWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number }>;
  height?: number;
  className?: string;
  innerRadius?: number;
}

export function PieChartWidget({
  title,
  subtitle,
  data,
  height = 300,
  className,
  innerRadius = 0,
}: PieChartWidgetProps) {
  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// 统计卡片
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              'text-xs mt-1',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            <span className="text-muted-foreground ml-1">較上月</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// 进度条
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  color?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  color,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color || COLORS.primary,
          }}
        />
      </div>
    </div>
  );
}

// 迷你图表（用于表格内）
interface MiniChartProps {
  data: number[];
  type?: 'line' | 'bar';
  width?: number;
  height?: number;
  color?: string;
}

export function MiniChart({
  data,
  type = 'line',
  width = 80,
  height = 30,
  color,
}: MiniChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const chartColor = color || COLORS.primary;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <Bar dataKey="value" fill={chartColor} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// 环形进度
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 100,
  strokeWidth = 10,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* 中心文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}
