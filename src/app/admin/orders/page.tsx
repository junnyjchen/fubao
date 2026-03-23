'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Order {
  id: string;
  order_no: string;
  user: {
    id: number;
    nickname: string;
    email: string;
  };
  status: string;
  payment_status: string;
  shipping_status: string;
  total_amount: string;
  shipping_fee: string;
  discount_amount: string;
  payment_method: string;
  shipping_address: string;
  shipping_name: string;
  shipping_phone: string;
  tracking_no: string | null;
  remark: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  items: Array<{
    id: number;
    goods_name: string;
    quantity: number;
    price: string;
    image: string | null;
  }>;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: 'bg-yellow-500' },
  paid: { label: '已付款', color: 'bg-blue-500' },
  shipped: { label: '已發貨', color: 'bg-purple-500' },
  completed: { label: '已完成', color: 'bg-green-500' },
  cancelled: { label: '已取消', color: 'bg-gray-500' },
  refunded: { label: '已退款', color: 'bg-red-500' },
};

const shippingStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待發貨', color: 'secondary' },
  shipped: { label: '已發貨', color: 'default' },
  delivered: { label: '已簽收', color: 'default' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { keyword: searchQuery }),
      });

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();

      if (data.orders) {
        setOrders(data.orders);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/orders/stats');
      const data = await res.json();
      if (data.stats) {
        setOrderStats(data.stats);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const handleShip = async (orderId: string) => {
    if (!trackingNo.trim()) {
      alert('請輸入物流單號');
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_no: trackingNo }),
      });

      const data = await res.json();
      if (data.message) {
        alert('發貨成功');
        loadOrders();
        loadStats();
        setTrackingNo('');
        setSelectedOrder(null);
      } else {
        alert(data.error || '發貨失敗');
      }
    } catch (error) {
      console.error('发货失败:', error);
      alert('發貨失敗');
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('確定要取消此訂單嗎？')) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.message) {
        alert('訂單已取消');
        loadOrders();
        loadStats();
      } else {
        alert(data.error || '取消失敗');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      alert('取消失敗');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const formatPrice = (price: string) => {
    return `HK$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">訂單管理</h1>
            <p className="text-muted-foreground">管理所有訂單信息</p>
          </div>
          <Button onClick={() => { loadOrders(); loadStats(); }} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">全部訂單</span>
              </div>
              <p className="text-2xl font-bold mt-2">{orderStats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">待付款</span>
              </div>
              <p className="text-2xl font-bold mt-2">{orderStats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">已付款</span>
              </div>
              <p className="text-2xl font-bold mt-2">{orderStats.paid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">已發貨</span>
              </div>
              <p className="text-2xl font-bold mt-2">{orderStats.shipped}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">已完成</span>
              </div>
              <p className="text-2xl font-bold mt-2">{orderStats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">已取消</span>
              </div>
              <p className="text-2xl font-bold mt-2">{orderStats.cancelled}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索訂單編號、用戶..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="訂單狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="pending">待付款</SelectItem>
                  <SelectItem value="paid">已付款</SelectItem>
                  <SelectItem value="shipped">已發貨</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>搜索</Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單編號</TableHead>
                <TableHead>用戶</TableHead>
                <TableHead>商品</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>下單時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    載入中...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暫無訂單數據
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.order_no}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.user?.nickname || '未知'}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm truncate">
                            {item.goods_name} x{item.quantity}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.items.length - 2} 件商品
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusMap[order.status]?.color || 'bg-gray-500'} text-white`}>
                        {statusMap[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>訂單詳情 - {order.order_no}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Order Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">訂單狀態</p>
                                  <Badge className={`${statusMap[order.status]?.color} text-white mt-1`}>
                                    {statusMap[order.status]?.label}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">支付方式</p>
                                  <p className="font-medium">{order.payment_method || '未支付'}</p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">商品列表</p>
                                <div className="space-y-2">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                        {item.image ? (
                                          <img src={item.image} alt="" className="w-full h-full object-cover rounded" />
                                        ) : (
                                          <Package className="w-5 h-5 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium">{item.goods_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {formatPrice(item.price)} x {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-medium">{formatPrice((parseFloat(item.price) * item.quantity).toString())}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping */}
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">收貨信息</p>
                                <div className="p-3 bg-muted/50 rounded">
                                  <p><strong>收貨人：</strong>{order.shipping_name}</p>
                                  <p><strong>電話：</strong>{order.shipping_phone}</p>
                                  <p><strong>地址：</strong>{order.shipping_address}</p>
                                  {order.tracking_no && (
                                    <p><strong>物流單號：</strong>{order.tracking_no}</p>
                                  )}
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="border-t pt-4">
                                <div className="flex justify-between text-sm">
                                  <span>商品金額</span>
                                  <span>{formatPrice(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>運費</span>
                                  <span>{formatPrice(order.shipping_fee)}</span>
                                </div>
                                {parseFloat(order.discount_amount) > 0 && (
                                  <div className="flex justify-between text-sm text-red-600">
                                    <span>優惠</span>
                                    <span>-{formatPrice(order.discount_amount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold mt-2">
                                  <span>訂單總額</span>
                                  <span className="text-primary">{formatPrice((parseFloat(order.total_amount) + parseFloat(order.shipping_fee) - parseFloat(order.discount_amount)).toFixed(2))}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              {order.status === 'paid' && (
                                <div className="flex gap-2 pt-4 border-t">
                                  <Input
                                    placeholder="輸入物流單號"
                                    value={trackingNo}
                                    onChange={(e) => setTrackingNo(e.target.value)}
                                  />
                                  <Button onClick={() => handleShip(order.id)}>確認發貨</Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {order.status === 'paid' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/orders/${order.id}/ship`}>
                              <Truck className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}

                        {order.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(order.id)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
