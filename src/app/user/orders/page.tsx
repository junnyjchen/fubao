/**
 * @fileoverview 用户订单页面
 * @description 展示用户订单列表和详情
 * @module app/user/orders/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
import {
  Package,
  Eye,
  Truck,
  X,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

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

/** 订单状态映射 */
const orderStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: '待發貨', color: 'bg-blue-100 text-blue-800' },
  2: { label: '已發貨', color: 'bg-purple-100 text-purple-800' },
  3: { label: '已完成', color: 'bg-green-100 text-green-800' },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

/** 支付方式映射 */
const payMethodMap: Record<string, string> = {
  alipay: '支付寶',
  wechat: '微信支付',
  paypal: 'PayPal',
};

/**
 * 用户订单页面组件
 * @returns 订单页面
 */
export default function OrdersPage() {
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
      console.error('加載訂單失敗:', error);
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
      console.error('取消訂單失敗:', error);
    }
  };

  /**
   * 确认收货
   */
  const handleConfirmReceive = async (order: Order) => {
    if (!confirm('確認已收到貨物嗎？')) return;

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
      console.error('確認收貨失敗:', error);
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

  return (
    <UserLayout title="我的訂單" description="查看和管理您的訂單">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">全部訂單</TabsTrigger>
          <TabsTrigger value="unpaid">待付款</TabsTrigger>
          <TabsTrigger value="unshipped">待發貨</TabsTrigger>
          <TabsTrigger value="shipped">已發貨</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              載入中...
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">暫無訂單</h3>
                <p className="text-muted-foreground mb-6">去發現更多心儀的商品吧</p>
                <Button asChild>
                  <Link href="/shop">去購物</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = orderStatusMap[order.order_status] || orderStatusMap[0];
                const firstItem = order.items?.[0];
                const itemCount = order.items?.length || 0;

                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            訂單編號：{order.order_no}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        {/* 商品信息 */}
                        <div className="flex-1">
                          {firstItem && (
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                {firstItem.goods_image ? '圖片' : '商品'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {firstItem.goods_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  HK${firstItem.price} × {firstItem.quantity}
                                </p>
                                {itemCount > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    等 {itemCount} 件商品
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 金额和操作 */}
                        <div className="text-right">
                          <p className="font-semibold">
                            共 {order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} 件商品
                          </p>
                          <p className="text-primary font-semibold">
                            實付 HK${order.pay_amount}
                          </p>
                          <div className="flex gap-2 mt-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              查看詳情
                            </Button>
                            {order.order_status === 2 && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmReceive(order)}
                              >
                                <Truck className="w-4 h-4 mr-1" />
                                確認收貨
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
                                <X className="w-4 h-4 mr-1" />
                                取消訂單
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
            <DialogTitle>訂單詳情</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* 订单状态 */}
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">訂單狀態</span>
                <Badge className={orderStatusMap[selectedOrder.order_status]?.color}>
                  {orderStatusMap[selectedOrder.order_status]?.label}
                </Badge>
              </div>

              {/* 订单信息 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">訂單編號</span>
                  <span>{selectedOrder.order_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">下單時間</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
                {selectedOrder.pay_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付時間</span>
                    <span>{new Date(selectedOrder.pay_time).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支付方式</span>
                  <span>{payMethodMap[selectedOrder.pay_method] || selectedOrder.pay_method}</span>
                </div>
              </div>

              {/* 收货信息 */}
              <div className="space-y-2 text-sm border-t pt-4">
                <p className="font-medium">收貨信息</p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_name} {selectedOrder.shipping_phone}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_address}
                </p>
              </div>

              {/* 商品列表 */}
              <div className="space-y-2 border-t pt-4">
                <p className="font-medium">商品明細</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      商品
                    </div>
                    <div className="flex-1">
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
              <div className="flex justify-between font-semibold border-t pt-4">
                <span>實付金額</span>
                <span className="text-primary">HK${selectedOrder.pay_amount}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 取消订单弹窗 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              取消訂單
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            確定要取消此訂單嗎？取消後將無法恢復。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              返回
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              確認取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
