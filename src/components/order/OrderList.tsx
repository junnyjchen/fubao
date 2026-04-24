'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice, formatDate, getOrderStatusText, getOrderStatusColor } from '@/lib/format';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface OrderItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  specs?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  order_no: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  freight_amount: number;
  pay_amount: number;
  pay_time?: string;
  created_at: string;
  items: OrderItem[];
  merchant_name?: string;
  address: {
    consignee: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
  };
}

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onCancel?: (id: number) => Promise<void>;
  onConfirm?: (id: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function OrderList({
  orders,
  loading = false,
  onLoadMore,
  hasMore = false,
  onCancel,
  onConfirm,
  onDelete,
}: OrderListProps) {
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error } = useToast();

  const handleCancel = async () => {
    if (!onCancel || cancelId === null) return;
    try {
      await onCancel(cancelId);
      success('订单已取消');
    } catch (err) {
      error('取消失败');
    } finally {
      setCancelId(null);
    }
  };

  const handleConfirm = async () => {
    if (!onConfirm || confirmId === null) return;
    try {
      await onConfirm(confirmId);
      success('已确认收货');
    } catch (err) {
      error('操作失败');
    } finally {
      setConfirmId(null);
    }
  };

  if (loading && orders.length === 0) {
    return <OrderListSkeleton count={3} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-12 h-12" />}
        title="暂无订单"
        description="快去选购心仪的商品吧"
        action={
          <Link href="/shop">
            <Button>去购物</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancel={() => setCancelId(order.id)}
            onConfirm={() => setConfirmId(order.id)}
            onDelete={onDelete}
          />
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

      <ConfirmDialog
        isOpen={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="取消订单"
        message="确定要取消该订单吗？"
        type="warning"
      />

      <ConfirmDialog
        isOpen={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleConfirm}
        title="确认收货"
        message="请确认已收到商品且商品完好"
        type="info"
      />
    </>
  );
}

interface OrderCardProps {
  order: Order;
  onCancel?: () => void;
  onConfirm?: () => void;
  onDelete?: (id: number) => Promise<void>;
  showActions?: boolean;
}

export function OrderCard({ order, onCancel, onConfirm, showActions = true }: OrderCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
    pending: { icon: Clock, label: '待支付', color: 'text-orange-500' },
    paid: { icon: CheckCircle, label: '已支付', color: 'text-blue-500' },
    shipped: { icon: Truck, label: '已发货', color: 'text-purple-500' },
    delivered: { icon: Truck, label: '待收货', color: 'text-purple-500' },
    completed: { icon: CheckCircle, label: '已完成', color: 'text-green-500' },
    cancelled: { icon: XCircle, label: '已取消', color: 'text-gray-500' },
    refunded: { icon: XCircle, label: '已退款', color: 'text-red-500' },
  };

  const config = statusConfig[order.status] || statusConfig.pending;

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {order.merchant_name && (
                <span className="text-sm font-medium">{order.merchant_name}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(order.created_at, 'YYYY-MM-DD HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', config.color)}>
                {config.label}
              </span>
              {showActions && (onCancel || onConfirm) && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg z-10 min-w-[120px]">
                      {order.status === 'pending' && onCancel && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onCancel();
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-muted"
                        >
                          取消订单
                        </button>
                      )}
                      {(order.status === 'shipped' || order.status === 'delivered') && onConfirm && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onConfirm();
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-muted"
                        >
                          确认收货
                        </button>
                      )}
                      <Link
                        href={`/order/${order.id}`}
                        className="block px-4 py-2 text-sm hover:bg-muted"
                      >
                        订单详情
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <Link
                key={item.id}
                href={`/goods/${item.goods_id}`}
                className="flex gap-3"
              >
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.goods_image}
                    alt={item.goods_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{item.goods_name}</h4>
                  {item.specs && (
                    <p className="text-xs text-muted-foreground mt-1">{item.specs}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-red-500">{formatPrice(item.price)}</span>
                    <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div>
              {order.items.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  共{order.items.length}件商品
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">实付款</span>
              <span className="text-lg font-bold text-red-500">
                {formatPrice(order.pay_amount)}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex justify-end gap-2 mt-3">
              <Link href={`/order/${order.id}`}>
                <Button variant="outline" size="sm">
                  查看详情
                </Button>
              </Link>
              {order.status === 'pending' && (
                <Button size="sm">去支付</Button>
              )}
              {order.status === 'shipped' && (
                <Button size="sm">查看物流</Button>
              )}
              {order.status === 'completed' && (
                <Button variant="outline" size="sm">
                  再次购买
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Order Detail
interface OrderDetailProps {
  order: Order;
  onCancel?: () => Promise<void>;
  onConfirm?: () => Promise<void>;
  onPay?: () => void;
}

export function OrderDetail({ order, onCancel, onConfirm, onPay }: OrderDetailProps) {
  const fullAddress = `${order.address.province}${order.address.city}${order.address.district}${order.address.address}`;

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              {order.status === 'pending' && <Clock className="w-6 h-6 text-primary" />}
              {order.status === 'paid' && <CheckCircle className="w-6 h-6 text-blue-500" />}
              {order.status === 'shipped' && <Truck className="w-6 h-6 text-purple-500" />}
              {order.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-500" />}
            </div>
            <div>
              <h3 className="font-medium">{getOrderStatusText(order.status)}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {order.status === 'pending' && '请尽快完成支付'}
                {order.status === 'paid' && '支付成功，商家正在准备商品'}
                {order.status === 'shipped' && '商品已发货，请注意查收'}
                {order.status === 'completed' && '感谢您的购买，欢迎再次光临'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">收货信息</h3>
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{order.address.consignee} {order.address.phone}</p>
              <p className="text-sm text-muted-foreground mt-1">{fullAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">商品信息</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <Link
                key={item.id}
                href={`/goods/${item.goods_id}`}
                className="flex gap-3"
              >
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.goods_image} alt={item.goods_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.goods_name}</h4>
                  {item.specs && (
                    <p className="text-xs text-muted-foreground mt-1">{item.specs}</p>
                  )}
                  <div className="flex justify-between mt-2">
                    <span className="text-red-500">{formatPrice(item.price)}</span>
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">订单信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">订单编号</span>
              <span className="font-mono">{order.order_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">下单时间</span>
              <span>{formatDate(order.created_at, 'YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            {order.pay_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">支付时间</span>
                <span>{formatDate(order.pay_time, 'YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            )}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品总价</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">优惠</span>
                <span className="text-green-500">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">运费</span>
              <span>{order.freight_amount > 0 ? formatPrice(order.freight_amount) : '免运费'}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>实付款</span>
              <span className="text-lg text-red-500">{formatPrice(order.pay_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background p-4 border-t">
        {order.status === 'pending' && onPay && (
          <Button onClick={onPay}>去支付</Button>
        )}
        {order.status === 'pending' && onCancel && (
          <Button variant="outline" onClick={onCancel}>取消订单</Button>
        )}
        {(order.status === 'shipped' || order.status === 'delivered') && onConfirm && (
          <Button onClick={onConfirm}>确认收货</Button>
        )}
        <Link href={`/order/${order.id}`}>
          <Button variant="outline">订单详情</Button>
        </Link>
      </div>
    </div>
  );
}

// Skeleton
export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-muted animate-pulse rounded" />
              <div className="w-16 h-4 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
                <div className="w-1/2 h-3 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
