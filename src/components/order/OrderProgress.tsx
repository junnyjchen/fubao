/**
 * @fileoverview 订单进度可视化组件
 * @description 提供订单状态追踪、时间线、物流信息等可视化组件
 * @module components/order/OrderProgress
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle, Truck, Package, CreditCard, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 订单状态类型
 */
type OrderStatus = 
  | 'pending'        // 待付款
  | 'paid'           // 已付款
  | 'processing'     // 处理中
  | 'shipped'        // 已发货
  | 'delivering'     // 配送中
  | 'delivered'      // 已完成
  | 'cancelled'      // 已取消
  | 'refunding'      // 退款中
  | 'refunded';      // 已退款

/**
 * 订单步骤配置
 */
interface OrderStep {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  time?: string;
}

/**
 * 订单状态配置
 */
const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; description: string }> = {
  pending: { label: '待付款', color: 'text-orange-500', description: '请尽快完成付款' },
  paid: { label: '已付款', color: 'text-blue-500', description: '等待商家发货' },
  processing: { label: '处理中', color: 'text-blue-500', description: '商家正在准备商品' },
  shipped: { label: '已发货', color: 'text-purple-500', description: '商品已发出' },
  delivering: { label: '配送中', color: 'text-purple-500', description: '商品配送中' },
  delivered: { label: '已完成', color: 'text-green-500', description: '订单已完成' },
  cancelled: { label: '已取消', color: 'text-gray-500', description: '订单已取消' },
  refunding: { label: '退款中', color: 'text-orange-500', description: '正在退款' },
  refunded: { label: '已退款', color: 'text-gray-500', description: '退款完成' },
};

/**
 * 订单状态进度条
 */
interface OrderProgressProps {
  status: OrderStatus;
  steps?: OrderStep[];
  className?: string;
}

export function OrderProgress({ status, steps, className }: OrderProgressProps) {
  // 默认步骤
  const defaultSteps: OrderStep[] = [
    { key: 'paid', label: '已付款', icon: <CreditCard className="w-5 h-5" /> },
    { key: 'processing', label: '处理中', icon: <Package className="w-5 h-5" /> },
    { key: 'shipped', label: '已发货', icon: <Truck className="w-5 h-5" /> },
    { key: 'delivered', label: '已完成', icon: <Check className="w-5 h-5" /> },
  ];

  const activeSteps = steps || defaultSteps;

  // 获取当前步骤索引
  const statusOrder: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivering', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  // 特殊状态处理
  const isCancelled = status === 'cancelled' || status === 'refunded';
  const isRefunding = status === 'refunding';

  return (
    <div className={cn('space-y-4', className)}>
      {/* 当前状态 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">订单状态</h3>
          <p className={cn('text-sm', ORDER_STATUS_CONFIG[status].color)}>
            {ORDER_STATUS_CONFIG[status].description}
          </p>
        </div>
        <Badge
          variant={status === 'delivered' ? 'default' : 'secondary'}
          className={cn(
            'text-sm px-3 py-1',
            status === 'pending' && 'bg-orange-100 text-orange-700',
            status === 'delivered' && 'bg-green-100 text-green-700',
            (status === 'cancelled' || status === 'refunded') && 'bg-gray-100 text-gray-700'
          )}
        >
          {ORDER_STATUS_CONFIG[status].label}
        </Badge>
      </div>

      {/* 进度条 */}
      {!isCancelled && !isRefunding && (
        <div className="relative">
          {/* 连接线 */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentIndex / (activeSteps.length - 1)) * 100)}%`,
              }}
            />
          </div>

          {/* 步骤点 */}
          <div className="relative flex justify-between">
            {activeSteps.map((step, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && 'bg-background border-primary text-primary ring-4 ring-primary/20',
                      isPending && 'bg-background border-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium',
                      isCompleted && 'text-primary',
                      isCurrent && 'text-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 取消/退款状态 */}
      {(isCancelled || isRefunding) && (
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground">
            {isCancelled ? '此订单已取消' : '退款处理中，请耐心等待'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 物流时间线
 */
interface LogisticsEvent {
  time: string;
  title: string;
  description?: string;
  location?: string;
}

interface LogisticsTimelineProps {
  events: LogisticsEvent[];
  className?: string;
}

export function LogisticsTimeline({ events, className }: LogisticsTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, index) => (
        <div key={index} className="relative pl-8 pb-6 last:pb-0">
          {/* 连接线 */}
          {index < events.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
          )}

          {/* 时间点 */}
          <div
            className={cn(
              'absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center',
              index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {index === 0 ? (
              <Circle className="w-4 h-4 fill-current" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-current" />
            )}
          </div>

          {/* 内容 */}
          <div className="ml-2">
            <p className={cn('font-medium', index === 0 && 'text-primary')}>
              {event.title}
            </p>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {event.description}
              </p>
            )}
            {event.location && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {event.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 订单卡片
 */
interface OrderCardProps {
  order: {
    id: string;
    status: OrderStatus;
    createdAt: string;
    totalAmount: number;
    itemCount: number;
    items?: Array<{
      name: string;
      image?: string;
      price: number;
      quantity: number;
    }>;
  };
  onClick?: () => void;
  className?: string;
}

export function OrderCard({ order, onClick, className }: OrderCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">订单号：{order.id}</span>
          <Badge
            variant="secondary"
            className={cn(
              order.status === 'delivered' && 'bg-green-100 text-green-700',
              order.status === 'pending' && 'bg-orange-100 text-orange-700'
            )}
          >
            {ORDER_STATUS_CONFIG[order.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* 商品预览 */}
        <div className="flex gap-3 mb-3">
          {order.items?.slice(0, 3).map((item, index) => (
            <div key={index} className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {order.itemCount > 3 && (
            <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              +{order.itemCount - 3}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {new Date(order.createdAt).toLocaleDateString('zh-CN')}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">¥{order.totalAmount.toFixed(2)}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 订单详情卡片
 */
interface OrderDetailCardProps {
  order: {
    id: string;
    status: OrderStatus;
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    totalAmount: number;
    shippingFee?: number;
    discount?: number;
    items: Array<{
      id: string;
      name: string;
      image?: string;
      price: number;
      quantity: number;
      specs?: Record<string, string>;
    }>;
    shippingAddress?: {
      name: string;
      phone: string;
      address: string;
    };
    logistics?: {
      company: string;
      trackingNumber: string;
      events: LogisticsEvent[];
    };
  };
  className?: string;
}

export function OrderDetailCard({ order, className }: OrderDetailCardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* 状态进度 */}
      <Card>
        <CardContent className="pt-6">
          <OrderProgress status={order.status} />
        </CardContent>
      </Card>

      {/* 物流信息 */}
      {order.logistics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5" />
              物流信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">{order.logistics.company}</p>
              <p className="font-mono">{order.logistics.trackingNumber}</p>
            </div>
            <LogisticsTimeline events={order.logistics.events} />
          </CardContent>
        </Card>
      )}

      {/* 收货地址 */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              收货地址
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
            <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress.address}</p>
          </CardContent>
        </Card>
      )}

      {/* 商品清单 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">商品清单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-4">
                {item.image && (
                  <div className="w-20 h-20 rounded border overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  {item.specs && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {Object.entries(item.specs).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">x{item.quantity}</span>
                    <span className="font-medium">¥{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 金额汇总 */}
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品总价</span>
              <span>¥{order.totalAmount.toFixed(2)}</span>
            </div>
            {order.shippingFee !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">运费</span>
                <span>{order.shippingFee > 0 ? `¥${order.shippingFee.toFixed(2)}` : '免运费'}</span>
              </div>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>优惠</span>
                <span>-¥{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>实付款</span>
              <span className="text-primary">¥{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时间线 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">订单时间</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">下单时间</span>
              <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">付款时间</span>
                <span>{new Date(order.paidAt).toLocaleString('zh-CN')}</span>
              </div>
            )}
            {order.shippedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">发货时间</span>
                <span>{new Date(order.shippedAt).toLocaleString('zh-CN')}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">完成时间</span>
                <span>{new Date(order.deliveredAt).toLocaleString('zh-CN')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
