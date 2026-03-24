/**
 * @fileoverview 商户订单管理页面
 * @description 商户处理订单、发货、退款等
 * @module app/merchant/dashboard/orders/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Eye,
  Truck,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
} from 'lucide-react';

interface Order {
  id: number;
  order_no: string;
  user_id: string;
  goods_name: string;
  goods_image: string | null;
  quantity: number;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  created_at: string;
  pay_time: string | null;
}

const statusMap: Record<number, { label: string; className: string }> = {
  0: { label: '待付款', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '待發貨', className: 'bg-blue-100 text-blue-800' },
  2: { label: '已發貨', className: 'bg-purple-100 text-purple-800' },
  3: { label: '已完成', className: 'bg-green-100 text-green-800' },
  4: { label: '已取消', className: 'bg-gray-100 text-gray-800' },
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [shipInfo, setShipInfo] = useState({
    company: '',
    tracking_no: '',
    remark: '',
  });
  const limit = 15;

  useEffect(() => {
    loadOrders();
  }, [activeTab, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // TODO: 调用真实API
      // 模拟数据
      const mockOrders: Order[] = [
        {
          id: 1,
          order_no: 'FB20260324001',
          user_id: 'user-001',
          goods_name: '開光平安符',
          goods_image: null,
          quantity: 1,
          total_amount: '288',
          pay_amount: '288',
          pay_status: 1,
          order_status: 1,
          shipping_name: '張三',
          shipping_phone: '13800138001',
          shipping_address: '香港九龍旺角彌敦道123號',
          created_at: '2026-03-24T08:30:00',
          pay_time: '2026-03-24T08:35:00',
        },
        {
          id: 2,
          order_no: 'FB20260324002',
          user_id: 'user-002',
          goods_name: '桃木劍',
          goods_image: null,
          quantity: 1,
          total_amount: '680',
          pay_amount: '680',
          pay_status: 0,
          order_status: 0,
          shipping_name: '李四',
          shipping_phone: '13900139002',
          shipping_address: '台灣台北市信義區信義路五段7號',
          created_at: '2026-03-24T09:15:00',
          pay_time: null,
        },
        {
          id: 3,
          order_no: 'FB20260324003',
          user_id: 'user-003',
          goods_name: '八卦鏡',
          goods_image: null,
          quantity: 2,
          total_amount: '336',
          pay_amount: '336',
          pay_status: 1,
          order_status: 2,
          shipping_name: '王五',
          shipping_phone: '13600136003',
          shipping_address: '廣東省深圳市南山區科技園',
          created_at: '2026-03-23T10:00:00',
          pay_time: '2026-03-23T10:10:00',
        },
      ];

      let filtered = mockOrders;
      if (activeTab !== 'all') {
        const statusMap2: Record<string, number> = {
          unpaid: 0,
          unshipped: 1,
          shipped: 2,
          completed: 3,
          cancelled: 4,
        };
        filtered = mockOrders.filter(o => o.order_status === statusMap2[activeTab]);
      }

      setOrders(filtered);
      setTotal(filtered.length);
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async () => {
    if (!selectedOrder) return;
    if (!shipInfo.company || !shipInfo.tracking_no) {
      alert('請填寫物流公司和運單號');
      return;
    }

    // TODO: 调用发货API
    alert(`訂單 ${selectedOrder.order_no} 已發貨`);
    setShipDialogOpen(false);
    loadOrders();
  };

  const getStatusBadge = (status: number) => {
    const s = statusMap[status] || statusMap[0];
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const filteredOrders = orders.filter(order => 
    order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.goods_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_name.includes(searchTerm)
  );

  const totalPages = Math.ceil(total / limit);

  const stats = [
    { key: 'all', label: '全部', count: total },
    { key: 'unpaid', label: '待付款', count: orders.filter(o => o.order_status === 0).length },
    { key: 'unshipped', label: '待發貨', count: orders.filter(o => o.order_status === 1).length },
    { key: 'shipped', label: '已發貨', count: orders.filter(o => o.order_status === 2).length },
    { key: 'completed', label: '已完成', count: orders.filter(o => o.order_status === 3).length },
  ];

  return (
    <MerchantLayout title="訂單管理" description="處理訂單、發貨、退款">
      {/* 统计 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {stats.map(stat => (
          <Button
            key={stat.key}
            variant={activeTab === stat.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveTab(stat.key); setPage(1); }}
          >
            {stat.label}
            <Badge variant="secondary" className="ml-2">{stat.count}</Badge>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {/* 搜索栏 */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索訂單號、商品或收貨人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                導出
              </Button>
            </div>
          </div>

          {/* 订单列表 */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">載入中...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無訂單</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>訂單信息</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>收貨人</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>下單時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{order.order_no}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.pay_status === 1 ? '已支付' : '待支付'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            商品
                          </div>
                          <div>
                            <p className="font-medium">{order.goods_name}</p>
                            <p className="text-xs text-muted-foreground">×{order.quantity}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{order.shipping_name}</p>
                          <p className="text-muted-foreground">{order.shipping_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-primary">HK${order.pay_amount}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('zh-TW', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.order_status === 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShipDialogOpen(true);
                              }}
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 頁，共 {total} 條
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

      {/* 订单详情弹窗 */}
      <Dialog open={!!selectedOrder && !shipDialogOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>訂單詳情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono">{selectedOrder.order_no}</span>
                {getStatusBadge(selectedOrder.order_status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品</span>
                  <span>{selectedOrder.goods_name} ×{selectedOrder.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">實付金額</span>
                  <span className="font-semibold text-primary">HK${selectedOrder.pay_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">下單時間</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString('zh-TW')}</span>
                </div>
                {selectedOrder.pay_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付時間</span>
                    <span>{new Date(selectedOrder.pay_time).toLocaleString('zh-TW')}</span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t space-y-2 text-sm">
                <p className="font-medium">收貨信息</p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_name} {selectedOrder.shipping_phone}
                </p>
                <p className="text-muted-foreground">{selectedOrder.shipping_address}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedOrder?.order_status === 1 && (
              <Button onClick={() => setShipDialogOpen(true)}>
                <Truck className="w-4 h-4 mr-2" />
                發貨
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 发货弹窗 */}
      <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>訂單發貨</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <p className="text-sm text-muted-foreground">
                訂單號：{selectedOrder.order_no}
              </p>
            )}
            <div className="space-y-2">
              <Label>物流公司 *</Label>
              <Select value={shipInfo.company} onValueChange={(v) => setShipInfo(prev => ({ ...prev, company: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇物流公司" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sf">順豐速運</SelectItem>
                  <SelectItem value="jd">京東物流</SelectItem>
                  <SelectItem value="zt">中通快遞</SelectItem>
                  <SelectItem value="yt">圓通速遞</SelectItem>
                  <SelectItem value="ems">EMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>運單號 *</Label>
              <Input
                value={shipInfo.tracking_no}
                onChange={(e) => setShipInfo(prev => ({ ...prev, tracking_no: e.target.value }))}
                placeholder="請輸入運單號"
              />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea
                value={shipInfo.remark}
                onChange={(e) => setShipInfo(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="選填"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialogOpen(false)}>取消</Button>
            <Button onClick={handleShip}>確認發貨</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
