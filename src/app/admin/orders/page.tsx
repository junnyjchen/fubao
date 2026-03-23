/**
 * @fileoverview 订单管理页面
 * @description 订单列表、详情查看、状态管理
 * @module app/admin/orders/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  MapPin,
  Phone,
  CreditCard,
} from 'lucide-react';

/** 订单数据类型 */
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

/** 订单商品类型 */
interface OrderItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  price: string;
  quantity: number;
  total_price: string;
}

/** 订单状态配置 */
const orderStatusConfig: Record<number, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  '-1': { label: '已取消', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  '0': { label: '待付款', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  '1': { label: '待發貨', color: 'bg-blue-100 text-blue-800', icon: Package },
  '2': { label: '已發貨', color: 'bg-purple-100 text-purple-800', icon: Truck },
  '3': { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

/** 支付方式映射 */
const payMethodMap: Record<string, string> = {
  paypal: 'PayPal',
  wechat: '微信支付',
  alipay: '支付寶',
};

/**
 * 订单管理页面组件
 * @returns 订单管理页面
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // 分页状态
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  /**
   * 加载订单列表
   */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        includeAll: 'true', // 后台查询所有订单
      });
      
      // 根据标签筛选状态
      if (activeTab !== 'all') {
        params.set('status', activeTab);
      }
      
      const response = await fetch(`/api/orders?${params}`);
      const result = await response.json();
      
      if (result.data) {
        setOrders(result.data);
        setTotal(result.total || result.data.length);
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /**
   * 查看订单详情
   */
  const handleViewDetail = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`);
      const result = await response.json();
      
      if (result.data) {
        setSelectedOrder(result.data);
        setDetailOpen(true);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
    }
  };

  /**
   * 更新订单状态
   */
  const handleUpdateStatus = async (orderId: number, action: string) => {
    const actionText: Record<string, string> = {
      ship: '確認發貨',
      receive: '確認收貨',
      cancel: '取消訂單',
    };

    if (!confirm(`確定要${actionText[action]}嗎？`)) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        loadOrders();
        if (selectedOrder?.id === orderId) {
          const result = await response.json();
          setSelectedOrder(result.data);
        }
      }
    } catch (error) {
      console.error('更新订单状态失败:', error);
    }
  };

  /** 表格列配置 */
  const columns: Column<Order>[] = [
    {
      key: 'order_no',
      title: '訂單編號',
      width: '160px',
      render: (record) => (
        <span className="font-mono text-sm">{record.order_no}</span>
      ),
    },
    {
      key: 'shipping_name',
      title: '收貨人',
      width: '100px',
      render: (record) => (
        <div>
          <p className="font-medium">{record.shipping_name}</p>
          <p className="text-xs text-muted-foreground">{record.shipping_phone}</p>
        </div>
      ),
    },
    {
      key: 'pay_amount',
      title: '金額',
      width: '100px',
      align: 'right',
      render: (record) => (
        <span className="font-semibold text-primary">HK${record.pay_amount}</span>
      ),
    },
    {
      key: 'pay_method',
      title: '支付方式',
      width: '100px',
      align: 'center',
      render: (record) =>
        record.pay_method ? (
          <span className="text-sm">{payMethodMap[record.pay_method] || record.pay_method}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'order_status',
      title: '狀態',
      width: '100px',
      align: 'center',
      render: (record) => {
        const status = orderStatusConfig[record.order_status];
        if (!status) return null;
        return (
          <Badge className={status.color}>
            {status.label}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      title: '創建時間',
      width: '120px',
      render: (record) => (
        <span className="text-sm text-muted-foreground">
          {record.created_at?.split('T')[0]}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout
      title="訂單管理"
      description="管理所有訂單"
    >
      <div className="space-y-4">
        {/* 状态标签 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="0">待付款</TabsTrigger>
            <TabsTrigger value="1">待發貨</TabsTrigger>
            <TabsTrigger value="2">已發貨</TabsTrigger>
            <TabsTrigger value="3">已完成</TabsTrigger>
            <TabsTrigger value="-1">已取消</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 订单表格 */}
        <AdminTable
          columns={columns}
          data={orders}
          rowKey="id"
          searchable
          searchPlaceholder="搜尋訂單編號、收貨人..."
          loading={loading}
          emptyText="暫無訂單"
          pagination={{
            page,
            pageSize,
            total,
          }}
          onPaginationChange={(p) => setPage(p.page)}
          actions={(record) => {
            const order = record as Order;
            return (
              <>
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
                    onClick={() => handleUpdateStatus(order.id, 'ship')}
                    title="發貨"
                  >
                    <Truck className="w-4 h-4" />
                  </Button>
                )}
              </>
            );
          }}
        />
      </div>

      {/* 订单详情对话框 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>訂單詳情</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">訂單編號</p>
                  <p className="font-mono font-medium">{selectedOrder.order_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">訂單狀態</p>
                  <Badge className={orderStatusConfig[selectedOrder.order_status]?.color}>
                    {orderStatusConfig[selectedOrder.order_status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">創建時間</p>
                  <p>{selectedOrder.created_at}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">支付方式</p>
                  <p>{selectedOrder.pay_method ? payMethodMap[selectedOrder.pay_method] : '-'}</p>
                </div>
              </div>

              <Separator />

              {/* 收货信息 */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  收貨信息
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p>
                    <span className="font-medium">{selectedOrder.shipping_name}</span>
                    <span className="ml-4 text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedOrder.shipping_phone}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                </div>
              </div>

              <Separator />

              {/* 商品列表 */}
              <div>
                <h4 className="font-medium mb-3">商品清單</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                        {item.goods_image ? '圖' : '暫無'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.goods_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm">HK${item.price}</span>
                          <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">HK${item.total_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 金额信息 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品金額</span>
                  <span>HK${selectedOrder.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">運費</span>
                  <span className="text-green-600">免運費</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>實付金額</span>
                  <span className="text-primary">HK${selectedOrder.pay_amount}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              {selectedOrder.order_status === 1 && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'ship');
                    }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    確認發貨
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
