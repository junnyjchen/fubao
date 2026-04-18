/**
 * @fileoverview 商户订单管理页面
 * @description 商户查看和管理订单列表
 * @module app/merchant/dashboard/orders/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Download,
  Eye,
  Send,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: number;
  order_no: string;
  total_amount: number;
  pay_amount: number;
  pay_type: string;
  status: number;
  pay_time: string | null;
  ship_time: string | null;
  created_at: string;
  users: {
    id: number;
    nickname: string;
    phone: string;
  };
  items: OrderItem[];
}

const statusConfig = {
  0: { label: '待付款', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  1: { label: '已付款', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  2: { label: '已發貨', color: 'bg-purple-100 text-purple-800', icon: Truck },
  3: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  5: { label: '已退款', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function MerchantOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeStatus, setActiveStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 发货弹窗
  const [shipDialog, setShipDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [logisticsCompany, setLogisticsCompany] = useState('');
  const [logisticsNo, setLogisticsNo] = useState('');
  const [shipping, setShipping] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [page, activeStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOrders: Order[] = [
        {
          id: 1,
          order_no: 'FB2026031500001',
          total_amount: 288,
          pay_amount: 288,
          pay_type: 'wechat',
          status: 1,
          pay_time: '2026-03-15 10:30:00',
          ship_time: null,
          created_at: '2026-03-15 10:25:00',
          users: { id: 101, nickname: '張三', phone: '138****1234' },
          items: [
            { id: 1, goods_id: 1, goods_name: '開光平安符', goods_image: '/goods/pinganfu.jpg', price: 288, quantity: 1, total_price: 288 },
          ],
        },
        {
          id: 2,
          order_no: 'FB2026031500002',
          total_amount: 576,
          pay_amount: 576,
          pay_type: 'alipay',
          status: 2,
          pay_time: '2026-03-14 15:20:00',
          ship_time: '2026-03-14 16:00:00',
          created_at: '2026-03-14 15:15:00',
          users: { id: 102, nickname: '李四', phone: '139****5678' },
          items: [
            { id: 2, goods_id: 1, goods_name: '開光平安符', goods_image: '/goods/pinganfu.jpg', price: 288, quantity: 2, total_price: 576 },
          ],
        },
        {
          id: 3,
          order_no: 'FB2026031500003',
          total_amount: 188,
          pay_amount: 188,
          pay_type: 'wechat',
          status: 3,
          pay_time: '2026-03-13 09:00:00',
          ship_time: '2026-03-13 10:30:00',
          created_at: '2026-03-13 08:55:00',
          users: { id: 103, nickname: '王五', phone: '137****9012' },
          items: [
            { id: 3, goods_id: 2, goods_name: '道家手串', goods_image: '/goods/shouchuan.jpg', price: 188, quantity: 1, total_price: 188 },
          ],
        },
      ];

      setOrders(mockOrders);
      setTotal(3);
    } catch (error) {
      console.error('加载订单失败:', error);
      toast.error('加載訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async () => {
    if (!currentOrder) return;
    if (!logisticsCompany.trim()) {
      toast.error('請選擇物流公司');
      return;
    }
    if (!logisticsNo.trim()) {
      toast.error('請輸入物流單號');
      return;
    }

    setShipping(true);
    try {
      const res = await fetch('/api/merchant/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: currentOrder.id,
          logistics_company: logisticsCompany,
          logistics_no: logisticsNo,
        }),
      });

      const data = await res.json();
      
      if (data.message) {
        toast.success('發貨成功');
        setShipDialog(false);
        setLogisticsCompany('');
        setLogisticsNo('');
        loadOrders();
      } else {
        toast.error(data.error || '發貨失敗');
      }
    } catch (error) {
      console.error('发货失败:', error);
      toast.error('發貨失敗');
    } finally {
      setShipping(false);
    }
  };

  const openShipDialog = (order: Order) => {
    setCurrentOrder(order);
    setShipDialog(true);
  };

  const handleSearch = () => {
    setPage(1);
    loadOrders();
  };

  const handleExport = () => {
    toast.success('訂單導出功能開發中');
  };

  // 统计数据
  const stats = {
    all: total,
    pending: orders.filter(o => o.status === 1).length,
    shipped: orders.filter(o => o.status === 2).length,
    completed: orders.filter(o => o.status === 3).length,
  };

  return (
    <MerchantLayout title="訂單管理" description="管理您的訂單">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatus('all')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.all}</p>
            <p className="text-sm text-muted-foreground">全部訂單</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatus('1')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">待發貨</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatus('2')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            <p className="text-sm text-muted-foreground">已發貨</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveStatus('3')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索訂單號"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-36"
              />
              <span className="text-muted-foreground">至</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-36"
              />
            </div>
            <Button onClick={handleSearch}>搜索</Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              導出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">訂單列表</CardTitle>
            <Tabs value={activeStatus} onValueChange={setActiveStatus}>
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="1">待發貨</TabsTrigger>
                <TabsTrigger value="2">已發貨</TabsTrigger>
                <TabsTrigger value="3">已完成</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暫無訂單</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const config = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = config?.icon || Clock;

                return (
                  <div key={order.id} className="border rounded-lg overflow-hidden">
                    {/* 订单头部 */}
                    <div className="bg-muted/50 px-4 py-2 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-mono">{order.order_no}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{order.users?.nickname || '未知用戶'}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{order.created_at}</span>
                      </div>
                      <Badge className={config?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config?.label}
                      </Badge>
                    </div>

                    {/* 订单商品 */}
                    <div className="p-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.goods_image}
                              alt={item.goods_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.goods_name}</p>
                            <p className="text-sm text-muted-foreground">
                              HK$ {item.price} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">HK$ {item.total_price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 订单底部 */}
                    <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">訂單金額：</span>
                        <span className="font-medium text-lg">HK$ {order.pay_amount}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/merchant/dashboard/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            詳情
                          </Button>
                        </Link>
                        {order.status === 1 && (
                          <Button size="sm" onClick={() => openShipDialog(order)}>
                            <Send className="w-4 h-4 mr-1" />
                            發貨
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                共 {total} 條記錄
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-4">{page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= total}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 发货弹窗 */}
      <Dialog open={shipDialog} onOpenChange={setShipDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>訂單發貨</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              訂單號：{currentOrder?.order_no}
            </div>
            <div className="space-y-2">
              <Label>物流公司 <span className="text-destructive">*</span></Label>
              <Select value={logisticsCompany} onValueChange={setLogisticsCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇物流公司" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sf">順豐速運</SelectItem>
                  <SelectItem value="sto">申通快遞</SelectItem>
                  <SelectItem value="yto">圓通速遞</SelectItem>
                  <SelectItem value="zto">中通快遞</SelectItem>
                  <SelectItem value="ems">EMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>物流單號 <span className="text-destructive">*</span></Label>
              <Input
                value={logisticsNo}
                onChange={(e) => setLogisticsNo(e.target.value)}
                placeholder="請輸入物流單號"
              />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea placeholder="可選填備註信息" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialog(false)}>
              取消
            </Button>
            <Button onClick={handleShip} disabled={shipping}>
              {shipping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  處理中...
                </>
              ) : (
                '確認發貨'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
