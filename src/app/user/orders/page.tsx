/**
 * @fileoverview 用户订单页面
 * @description 展示用户订单列表和详情
 * @module app/user/orders/page
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Package,
  Eye,
  Truck,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { useI18n } from '@/lib/i18n';

/** 订单数据类型 */
interface OrderItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  price: string;
  quantity: number;
  total_price: string;
}

interface Order {
  id: number;
  order_no: string;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  pay_method: string;
  pay_time: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_time: string | null;
  receive_time: string | null;
  remark: string | null;
  created_at: string;
  items: OrderItem[];
}

/**
 * 用户订单页面组件
 * @returns 订单页面
 */
export default function OrdersPage() {
  const { t, isRTL } = useI18n();
  const op = t.userPage.ordersPage;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // 订单状态映射 - 使用翻译
  const getOrderStatus = (status: number) => {
    const statusMap: Record<number, { label: string; color: string }> = {
      0: { label: op.status.pending, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      1: { label: op.status.paid, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      2: { label: op.status.shipped, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      3: { label: op.status.completed, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      4: { label: op.status.cancelled, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
    };
    return statusMap[status] || statusMap[0];
  };

  // 支付方式映射 - 使用翻译
  const getPayMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      alipay: op.payMethod.alipay,
      wechat: op.payMethod.wechat,
      paypal: op.payMethod.paypal,
    };
    return methodMap[method] || method;
  };

  /**
   * 加载订单列表
   */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      if (activeTab !== 'all') {
        params.set('status', activeTab);
      }

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();

      setOrders(data.data || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error('Load orders failed:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Tab切换时重置页码
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  /**
   * 查看订单详情
   */
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  /**
   * 取消订单
   */
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: 4 }),
      });

      const data = await res.json();
      if (data.message) {
        setCancelDialogOpen(false);
        loadOrders();
      }
    } catch (error) {
      console.error('Cancel order failed:', error);
    }
  };

  /**
   * 确认收货
   */
  const handleConfirmReceive = async (order: Order) => {
    if (!confirm(op.confirm.receive)) return;

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: 3, receive_time: new Date().toISOString() }),
      });

      const data = await res.json();
      if (data.message) {
        loadOrders();
      }
    } catch (error) {
      console.error('Confirm receive failed:', error);
    }
  };

  /**
   * 筛选订单
   */
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unpaid') return order.order_status === 0;
    if (activeTab === 'unshipped') return order.order_status === 1;
    if (activeTab === 'shipped') return order.order_status === 2;
    if (activeTab === 'completed') return order.order_status === 3;
    return true;
  });

  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const ActionIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <UserLayout title={op.title} description={op.subtitle}>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{op.tabs.all}</TabsTrigger>
          <TabsTrigger value="unpaid">{op.tabs.unpaid}</TabsTrigger>
          <TabsTrigger value="unshipped">{op.tabs.unshipped}</TabsTrigger>
          <TabsTrigger value="shipped">{op.tabs.shipped}</TabsTrigger>
          <TabsTrigger value="completed">{op.tabs.completed}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.common.loading}
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState type="orders" />
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = getOrderStatus(order.order_status);
                const firstItem = order.items?.[0];
                const itemCount = order.items?.length || 0;

                return (
                  <Card key={order.id} className="animate-fade-in-up">
                    <CardHeader className="pb-2">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-muted-foreground">
                            {op.list.orderNo}：{order.order_no}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {/* 商品信息 */}
                        <div className="flex-1">
                          {firstItem && (
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden relative">
                                {firstItem.goods_image ? (
                                  <Image
                                    src={firstItem.goods_image}
                                    alt={firstItem.goods_name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="w-6 h-6" />
                                )}
                              </div>
                              <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : ''}`}>
                                <p className="font-medium truncate">
                                  {firstItem.goods_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  HK${firstItem.price} × {firstItem.quantity}
                                </p>
                                {itemCount > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    {op.list.itemsCount.replace('{count}', String(itemCount))}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 金额和操作 */}
                        <div className={`${isRTL ? 'text-start' : 'text-right'}`}>
                          <p className="font-semibold">
                            {op.list.totalItems.replace('{count}', String(order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0))}
                          </p>
                          <p className="text-primary font-semibold">
                            {op.list.actualPay} HK${order.pay_amount}
                          </p>
                          <div className={`flex gap-2 mt-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {op.list.viewDetail}
                            </Button>
                            {order.order_status === 2 && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmReceive(order)}
                              >
                                <Truck className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {op.list.confirmReceive}
                              </Button>
                            )}
                            {order.order_status === 0 && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                <X className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {op.list.cancelOrder}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showTotal
                total={totalItems}
                pageSize={pageSize}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 订单详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{op.detail.title}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* 订单状态 */}
              <div className={`flex items-center justify-between py-2 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{op.detail.orderStatus}</span>
                <Badge className={getOrderStatus(selectedOrder.order_status).color}>
                  {getOrderStatus(selectedOrder.order_status).label}
                </Badge>
              </div>

              {/* 订单信息 */}
              <div className="space-y-2 text-sm">
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{op.detail.orderNo}</span>
                  <span>{selectedOrder.order_no}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{op.detail.orderTime}</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
                {selectedOrder.pay_time && (
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-muted-foreground">{op.detail.payTime}</span>
                    <span>{new Date(selectedOrder.pay_time).toLocaleString()}</span>
                  </div>
                )}
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{op.detail.payMethod}</span>
                  <span>{getPayMethod(selectedOrder.pay_method)}</span>
                </div>
              </div>

              {/* 收货信息 */}
              <div className={`space-y-2 text-sm border-t pt-4 ${isRTL ? 'text-end' : ''}`}>
                <p className="font-medium">{op.detail.shippingInfo}</p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_name} {selectedOrder.shipping_phone}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_address}
                </p>
              </div>

              {/* 商品列表 */}
              <div className={`space-y-2 border-t pt-4 ${isRTL ? 'text-end' : ''}`}>
                <p className="font-medium">{op.detail.productList}</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden relative">
                      {item.goods_image ? (
                        <Image
                          src={item.goods_image}
                          alt={item.goods_name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 ${isRTL ? 'text-end' : ''}`}>
                      <p className="text-sm">{item.goods_name}</p>
                      <p className="text-xs text-muted-foreground">
                        HK${item.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">HK${item.total_price}</p>
                  </div>
                ))}
              </div>

              {/* 金额 */}
              <div className={`flex justify-between font-semibold border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{op.detail.actualAmount}</span>
                <span className="text-primary">HK${selectedOrder.pay_amount}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              {op.detail.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 取消订单弹窗 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              {op.cancel.title}
            </DialogTitle>
          </DialogHeader>
          <p className={`text-muted-foreground ${isRTL ? 'text-end' : ''}`}>
            {op.cancel.description}
          </p>
          <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {op.cancel.back}
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              {op.cancel.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
