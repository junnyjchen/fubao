/**
 * @fileoverview 用户申请售后页面
 * @description 申请售后退款
 * @module app/user/refunds/page
 */

'use client';

import { useState, useEffect, use } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  RotateCcw,
  Loader2,
  MessageSquare,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { RefundListSkeleton } from '@/components/common/PageSkeletons';

/** 售后数据类型 */
interface Refund {
  id: number;
  order_id: number;
  order?: { order_no: string };
  type: string;
  reason: string;
  description: string | null;
  images: string[] | null;
  amount: string | null;
  status: string;
  merchant_reply: string | null;
  tracking_number: string | null;
  tracking_company: string | null;
  created_at: string;
  processed_at: string | null;
}

/** 状态配置 */
const statusConfig = {
  pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: '處理中', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  approved: { label: '已同意', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

/** 类型配置 */
const typeConfig = {
  refund_only: '僅退款',
  return_refund: '退貨退款',
  exchange: '換貨',
};

/**
 * 用户售后页面
 */
export default function UserRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // 申请弹窗状态
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 申请表单
  const [applyForm, setApplyForm] = useState({
    order_id: '',
    type: 'refund_only',
    reason: '',
    description: '',
  });

  useEffect(() => {
    loadRefunds();
  }, [activeTab]);

  /**
   * 加载售后列表
   */
  const loadRefunds = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const res = await fetch(`/api/user/refunds?limit=50${status}`);
      const data = await res.json();
      setRefunds(data.data || []);
    } catch (error) {
      console.error('加载售后列表失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 提交申请
   */
  const handleSubmitApply = async () => {
    if (!applyForm.order_id || !applyForm.reason) {
      toast.error('請填寫完整信息');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('申請成功');
        setApplyDialogOpen(false);
        setApplyForm({
          order_id: '',
          type: 'refund_only',
          reason: '',
          description: '',
        });
        loadRefunds();
      } else {
        toast.error(data.error || '申請失敗');
      }
    } catch (error) {
      console.error('提交申请失败:', error);
      toast.error('申請失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 查看详情
   */
  const openDetail = async (refund: Refund) => {
    try {
      const res = await fetch(`/api/refunds/${refund.id}`);
      const data = await res.json();
      setSelectedRefund(data.data);
      setDetailDialogOpen(true);
    } catch (error) {
      console.error('获取详情失败:', error);
    }
  };

  /**
   * 取消申请
   */
  const handleCancel = async (refund: Refund) => {
    try {
      const res = await fetch(`/api/refunds/${refund.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('已取消');
        loadRefunds();
      }
    } catch (error) {
      console.error('取消失败:', error);
      toast.error('取消失敗');
    }
  };

  return (
    <UserLayout title="售後服務">
      {/* 操作栏 */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="pending">待處理</TabsTrigger>
                <TabsTrigger value="processing">處理中</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => setApplyDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              申請售後
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 售后列表 */}
      {loading ? (
        <RefundListSkeleton />
      ) : refunds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <RotateCcw className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暫無售後記錄</h3>
            <p className="text-muted-foreground mb-4">
              如有問題可在訂單詳情頁申請售後
            </p>
            <Button asChild>
              <Link href="/user/orders">查看訂單</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => {
            const statusInfo = statusConfig[refund.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo?.icon || Clock;

            return (
              <Card key={refund.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusInfo?.color}>
                          {statusInfo?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {typeConfig[refund.type as keyof typeof typeConfig]}
                        </span>
                      </div>

                      <p className="text-sm font-medium mb-1">
                        訂單號：{refund.order?.order_no || refund.order_id}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        申請原因：{refund.reason}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          申請時間：{new Date(refund.created_at).toLocaleString()}
                        </span>
                        {refund.amount && (
                          <span>退款金額：HK${refund.amount}</span>
                        )}
                      </div>

                      {/* 商家回复 */}
                      {refund.merchant_reply && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium text-primary mb-1">
                            商家回復
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {refund.merchant_reply}
                          </p>
                        </div>
                      )}

                      {/* 物流信息 */}
                      {refund.tracking_number && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="w-4 h-4" />
                          {refund.tracking_company}：{refund.tracking_number}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(refund)}
                      >
                        查看詳情
                      </Button>
                      {refund.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => handleCancel(refund)}
                        >
                          取消申請
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 申请售后弹窗 */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申請售後</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">訂單ID *</label>
              <input
                type="number"
                placeholder="請輸入訂單ID"
                value={applyForm.order_id}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, order_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">申請類型 *</label>
              <Select
                value={applyForm.type}
                onValueChange={(value) =>
                  setApplyForm({ ...applyForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund_only">僅退款</SelectItem>
                  <SelectItem value="return_refund">退貨退款</SelectItem>
                  <SelectItem value="exchange">換貨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">申請原因 *</label>
              <Select
                value={applyForm.reason}
                onValueChange={(value) =>
                  setApplyForm({ ...applyForm, reason: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="請選擇原因" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="商品質量問題">商品質量問題</SelectItem>
                  <SelectItem value="商品與描述不符">商品與描述不符</SelectItem>
                  <SelectItem value="收到商品損壞">收到商品損壞</SelectItem>
                  <SelectItem value="發錯商品">發錯商品</SelectItem>
                  <SelectItem value="商品未收到">商品未收到</SelectItem>
                  <SelectItem value="其他原因">其他原因</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">詳細說明</label>
              <Textarea
                placeholder="請詳細描述您的問題..."
                value={applyForm.description}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitApply} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              提交申請
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>售後詳情</DialogTitle>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[selectedRefund.status as keyof typeof statusConfig]?.color}>
                  {statusConfig[selectedRefund.status as keyof typeof statusConfig]?.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">申請類型</span>
                  <p className="font-medium">
                    {typeConfig[selectedRefund.type as keyof typeof typeConfig]}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">申請原因</span>
                  <p className="font-medium">{selectedRefund.reason}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">申請時間</span>
                  <p className="font-medium">
                    {new Date(selectedRefund.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedRefund.amount && (
                  <div>
                    <span className="text-muted-foreground">退款金額</span>
                    <p className="font-medium text-primary">HK${selectedRefund.amount}</p>
                  </div>
                )}
              </div>

              {selectedRefund.description && (
                <div>
                  <span className="text-sm text-muted-foreground">詳細說明</span>
                  <p className="text-sm mt-1">{selectedRefund.description}</p>
                </div>
              )}

              {selectedRefund.merchant_reply && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-primary mb-1">商家回復</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRefund.merchant_reply}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
