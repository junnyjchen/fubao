'use client';

import { cn } from '@/lib/utils';
import { Check, Circle, Truck, Package, Home } from 'lucide-react';

type OrderStatus = 
  | 'pending'      // 待支付
  | 'paid'         // 已支付
  | 'shipped'      // 已发货
  | 'delivered'    // 已收货
  | 'completed';  // 已完成

interface LogisticsStep {
  status: string;
  title: string;
  description?: string;
  time?: string;
}

interface OrderTrackerProps {
  currentStatus: OrderStatus;
  steps: LogisticsStep[];
  estimatedDelivery?: string;
}

export function OrderTracker({
  currentStatus,
  steps,
  estimatedDelivery,
}: OrderTrackerProps) {
  const statusOrder: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getIcon = (status: OrderStatus, index: number) => {
    if (index < currentIndex) return <Check className="w-5 h-5" />;
    if (index === currentIndex) {
      switch (status) {
        case 'pending':
          return <Circle className="w-5 h-5" />;
        case 'paid':
          return <Package className="w-5 h-5" />;
        case 'shipped':
          return <Truck className="w-5 h-5" />;
        case 'delivered':
          return <Home className="w-5 h-5" />;
        default:
          return <Circle className="w-5 h-5" />;
      }
    }
    return <Circle className="w-5 h-5" />;
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      {/* Header */}
      {estimatedDelivery && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground">预计送达</p>
          <p className="text-lg font-semibold text-primary">{estimatedDelivery}</p>
        </div>
      )}

      {/* Steps */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
        <div
          className="absolute left-5 top-0 w-0.5 bg-primary transition-all duration-500"
          style={{ height: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
        />

        {/* Step items */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-background border-primary text-primary',
                    isPending && 'bg-background border-border text-muted-foreground'
                  )}
                >
                  {getIcon(step.status as OrderStatus, index)}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4
                    className={cn(
                      'font-medium',
                      isCompleted && 'text-muted-foreground',
                      isCurrent && 'text-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                  {step.time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.time}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple Status Badge
interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: 'sm' | 'md';
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { text: string; className: string }> = {
    pending: { text: '待支付', className: 'bg-orange-100 text-orange-700' },
    paid: { text: '已支付', className: 'bg-blue-100 text-blue-700' },
    shipped: { text: '已发货', className: 'bg-purple-100 text-purple-700' },
    delivered: { text: '已收货', className: 'bg-indigo-100 text-indigo-700' },
    completed: { text: '已完成', className: 'bg-green-100 text-green-700' },
    cancelled: { text: '已取消', className: 'bg-gray-100 text-gray-700' },
    refunded: { text: '已退款', className: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[status] || { text: status, className: 'bg-gray-100 text-gray-700' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {config.text}
    </span>
  );
}

// Logistics Timeline
interface LogisticsEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
  isLatest?: boolean;
}

interface LogisticsTimelineProps {
  events: LogisticsEvent[];
  carrier?: string;
  trackingNo?: string;
}

export function LogisticsTimeline({
  events,
  carrier,
  trackingNo,
}: LogisticsTimelineProps) {
  return (
    <div className="bg-card rounded-lg border">
      {/* Header */}
      {(carrier || trackingNo) && (
        <div className="p-4 border-b">
          {carrier && <p className="text-sm text-muted-foreground">承运商: {carrier}</p>}
          {trackingNo && (
            <p className="text-sm text-muted-foreground mt-1">
              运单号: <span className="font-mono">{trackingNo}</span>
            </p>
          )}
        </div>
      )}

      {/* Events */}
      <div className="p-4">
        <div className="relative">
          {/* Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Dot */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full',
                    event.isLatest
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {event.isLatest ? (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Status Update
interface StatusUpdateCardProps {
  orderNo: string;
  currentStatus: OrderStatus;
  onConfirmReceived?: () => void;
  onCancel?: () => void;
}

export function StatusUpdateCard({
  orderNo,
  currentStatus,
  onConfirmReceived,
  onCancel,
}: StatusUpdateCardProps) {
  const showConfirm = currentStatus === 'shipped' || currentStatus === 'delivered';
  const showCancel = currentStatus === 'pending';

  return (
    <div className="bg-primary/5 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">订单号</p>
          <p className="font-mono font-medium">{orderNo}</p>
        </div>
        <div className="flex gap-2">
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              取消订单
            </button>
          )}
          {showConfirm && onConfirmReceived && (
            <button
              onClick={onConfirmReceived}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              确认收货
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
