/**
 * @fileoverview 状态徽章组件
 * @description 用于显示各种状态的徽章组件
 * @module components/ui/StatusBadge
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 状态类型
export type StatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled';

// 订单状态
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// 支付状态
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// 商品状态
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'draft';

// 状态配置
const statusConfig: Record<StatusType, { label: string; className: string }> = {
  success: {
    label: '成功',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  warning: {
    label: '警告',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  error: {
    label: '錯誤',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  info: {
    label: '信息',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  pending: {
    label: '待處理',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  processing: {
    label: '處理中',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
  completed: {
    label: '已完成',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
};

// 订单状态配置
const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: '待付款',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  paid: {
    label: '已付款',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  shipped: {
    label: '已發貨',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
  delivered: {
    label: '已送達',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  refunded: {
    label: '已退款',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

// 支付状态配置
const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: {
    label: '待支付',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  paid: {
    label: '已支付',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  failed: {
    label: '支付失敗',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  refunded: {
    label: '已退款',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
};

// 商品状态配置
const productStatusConfig: Record<ProductStatus, { label: string; className: string }> = {
  active: {
    label: '上架中',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  inactive: {
    label: '已下架',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  out_of_stock: {
    label: '已售罄',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  draft: {
    label: '草稿',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

// 通用状态徽章
interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
}

export function StatusBadge({ status, customLabel, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {customLabel || config.label}
    </Badge>
  );
}

// 订单状态徽章
interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = orderStatusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// 支付状态徽章
interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// 商品状态徽章
interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const config = productStatusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// 自定义状态徽章
interface CustomBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function CustomBadge({ label, variant = 'default', className }: CustomBadgeProps) {
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <Badge variant="outline" className={cn(variantClasses[variant], className)}>
      {label}
    </Badge>
  );
}

// 库存徽章
interface StockBadgeProps {
  stock: number;
  lowStockThreshold?: number;
  className?: string;
}

export function StockBadge({ stock, lowStockThreshold = 10, className }: StockBadgeProps) {
  if (stock === 0) {
    return <StatusBadge status="error" customLabel="已售罄" className={className} />;
  }

  if (stock <= lowStockThreshold) {
    return <StatusBadge status="warning" customLabel={`僅剩${stock}件`} className={className} />;
  }

  return <StatusBadge status="success" customLabel="有貨" className={className} />;
}

// 认证徽章
interface VerifiedBadgeProps {
  verified: boolean;
  className?: string;
}

export function VerifiedBadge({ verified, className }: VerifiedBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        verified
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        className
      )}
    >
      {verified ? '已認證' : '未認證'}
    </Badge>
  );
}
