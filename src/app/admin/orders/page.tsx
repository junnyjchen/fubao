/**
 * @fileoverview 订单管理页面
 * @description 后台订单列表和管理
 * @module app/admin/orders/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

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
  user_id: string;
  merchant_id: number;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  pay_method: string | null;
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

const orderStatusMap: Record<number, { label: string; color: string; icon: typeof Clock }> = {
  0: { label: '待付款', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  1: { label: '待發貨', color: 'bg-blue-100 text-blue-800', icon: Package },
  2: { label: '已發貨', color: 'bg-purple-100 text-purple-800', icon: Truck },
  3: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const payStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未支付', color: 'text-yellow-600' },
  1: { label: '已支付', color: 'text-green-600' },
};

export default function OrdersManagePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const limit = 20;

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();

      setOrders(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleShip = async (order: Order) => {
    if (!confirm('確認發貨？')) return;

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: 2,
          shipping_time: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.message) {
        loadOrders();
      }
    } catch (error) {
      console.error('发货失败:', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-TW');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">訂單管理</h1>
                <p className="text-sm text-muted-foreground">共 {total} 個訂單</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex gap-4">
              {/* 筛选 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="訂單狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="unpaid">待付款</SelectItem>
                  <SelectItem value="unshipped">待發貨</SelectItem>
                  <SelectItem value="shipped">已發貨</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                載入中...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無訂單數據</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>訂單編號</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>收貨人</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="text-center">支付狀態</TableHead>
                    <TableHead className="text-center">訂單狀態</TableHead>
                    <TableHead>創建時間</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const status = orderStatusMap[order.order_status] || orderStatusMap[0];
                    const payStatus = payStatusMap[order.pay_status] || payStatusMap[0];
                    const firstItem = order.items?.[0];
                    const itemCount = order.items?.length || 0;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.order_no}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {firstItem && (
                              <>
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                  {firstItem.goods_image ? '圖' : '品'}
                                </div>
                                <div>
                                  <p className="text-sm truncate max-w-[150px]">{firstItem.goods_name}</p>
                                  {itemCount > 1 && (
                                    <p className="text-xs text-muted-foreground">共 {itemCount} 件</p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.shipping_name}</p>
                            <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold">HK${order.pay_amount}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-medium ${payStatus.color}`}>
                            {payStatus.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.order_status === 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShip(order)}
                              >
                                <Truck className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  第 {page} / {totalPages} 頁
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 订单详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>訂單詳情</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">訂單編號</span>
                <span className="font-mono">{selectedOrder.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">訂單狀態</span>
                <Badge className={orderStatusMap[selectedOrder.order_status]?.color}>
                  {orderStatusMap[selectedOrder.order_status]?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">創建時間</span>
                <span>{formatDate(selectedOrder.created_at)}</span>
              </div>
              {selectedOrder.pay_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支付時間</span>
                  <span>{formatDate(selectedOrder.pay_time)}</span>
                </div>
              )}
              {selectedOrder.shipping_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">發貨時間</span>
                  <span>{formatDate(selectedOrder.shipping_time)}</span>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="font-medium mb-2">收貨信息</p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_name} {selectedOrder.shipping_phone}
                </p>
                <p className="text-muted-foreground">{selectedOrder.shipping_address}</p>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">商品明細</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      品
                    </div>
                    <div className="flex-1">
                      <p>{item.goods_name}</p>
                      <p className="text-xs text-muted-foreground">
                        HK${item.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">HK${item.total_price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-semibold border-t pt-4">
                <span>訂單金額</span>
                <span className="text-primary">HK${selectedOrder.pay_amount}</span>
              </div>

              {selectedOrder.remark && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-1">備註</p>
                  <p className="text-muted-foreground">{selectedOrder.remark}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              關閉
            </Button>
            {selectedOrder && selectedOrder.order_status === 1 && (
              <Button onClick={() => { handleShip(selectedOrder); setDetailDialogOpen(false); }}>
                確認發貨
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
