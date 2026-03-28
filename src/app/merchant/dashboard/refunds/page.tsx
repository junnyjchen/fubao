/**
 * @fileoverview 商户售后管理页面
 * @description 处理用户售后申请
 * @module app/merchant/dashboard/refunds/page
 */

'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
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
import { Input } from '@/components/ui/input';
import {
  RotateCcw,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  Truck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

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
  user?: { nickname: string; phone: string };
  tracking_number: string | null;
  tracking_company: string | null;
  created_at: string;
}

/** 状态配置 */
const statusConfig = {
  pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: '處理中', color: 'bg-blue-100 text-blue-800' },
  approved: { label: '已同意', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

const typeConfig = {
  refund_only: '僅退款',
  return_refund: '退貨退款',
  exchange: '換貨',
};

/**
 * 商户售后管理页面
 */
export default function MerchantRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 处理弹窗
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');
  const [replyContent, setReplyContent] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch(`/api/merchant/refunds?limit=100${status}`);
      const data = await res.json();
      setRefunds(data.data || []);
    } catch (error) {
      console.error('加载售后失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开处理弹窗
   */
  const openProcessDialog = (refund: Refund, action: 'approve' | 'reject') => {
    setSelectedRefund(refund);
    setProcessAction(action);
    setReplyContent('');
    setTrackingNumber('');
    setTrackingCompany('');
    setProcessDialogOpen(true);
  };

  /**
   * 提交处理
   */
  const handleSubmitProcess = async () => {
    if (!selectedRefund) return;

    if (!replyContent.trim()) {
      toast.error('請填寫回復內容');
      return;
    }

    setSubmitting(true);
    try {
      const updateData: {
        status: string;
        merchant_reply: string;
        tracking_number?: string;
        tracking_company?: string;
      } = {
        status: processAction === 'approve' ? 'approved' : 'rejected',
        merchant_reply: replyContent.trim(),
      };

      if (processAction === 'approve' && trackingNumber) {
        updateData.tracking_number = trackingNumber;
        updateData.tracking_company = trackingCompany;
      }

      const res = await fetch(`/api/refunds/${selectedRefund.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.message) {
        toast.success(processAction === 'approve' ? '已同意' : '已拒絕');
        setProcessDialogOpen(false);
        loadRefunds();
      } else {
        toast.error(data.error || '處理失敗');
      }
    } catch (error) {
      console.error('处理失败:', error);
      toast.error('處理失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 确认完成
   */
  const handleComplete = async (refund: Refund) => {
    try {
      const res = await fetch(`/api/refunds/${refund.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('已完成');
        loadRefunds();
      }
    } catch (error) {
      console.error('完成失败:', error);
      toast.error('操作失敗');
    }
  };

  // 筛选
  const filteredRefunds = refunds.filter(
    (r) =>
      r.order?.order_no?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 统计
  const stats = {
    total: refunds.length,
    pending: refunds.filter((r) => r.status === 'pending').length,
    processing: refunds.filter((r) => r.status === 'processing').length,
    approved: refunds.filter((r) => r.status === 'approved').length,
  };

  return (
    <MerchantLayout title="售後管理" description="處理用戶售後申請">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">總申請數</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">待處理</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-sm text-muted-foreground">處理中</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">已同意</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索訂單號或原因..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 售后列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                待處理
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processing">處理中</TabsTrigger>
              <TabsTrigger value="approved">已同意</TabsTrigger>
              <TabsTrigger value="rejected">已拒絕</TabsTrigger>
              <TabsTrigger value="all">全部</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="text-center py-16">
              <RotateCcw className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無售後申請</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRefunds.map((refund) => (
                <div
                  key={refund.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusConfig[refund.status as keyof typeof statusConfig]?.color}>
                          {statusConfig[refund.status as keyof typeof statusConfig]?.label}
                        </Badge>
                        <Badge variant="outline">
                          {typeConfig[refund.type as keyof typeof typeConfig]}
                        </Badge>
                      </div>

                      <p className="font-medium mb-1">
                        訂單號：{refund.order?.order_no || refund.order_id}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        申請原因：{refund.reason}
                      </p>

                      {refund.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          說明：{refund.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {refund.user?.nickname || '用戶'}
                        </span>
                        <span>
                          {new Date(refund.created_at).toLocaleString()}
                        </span>
                        {refund.amount && (
                          <span>退款金額：HK${refund.amount}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {refund.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openProcessDialog(refund, 'approve')}
                          >
                            同意
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openProcessDialog(refund, 'reject')}
                          >
                            拒絕
                          </Button>
                        </>
                      )}
                      {refund.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(refund)}
                        >
                          確認完成
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 处理弹窗 */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? '同意售後申請' : '拒絕售後申請'}
            </DialogTitle>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>訂單號：</strong>{selectedRefund.order?.order_no}</p>
                <p><strong>申請類型：</strong>{typeConfig[selectedRefund.type as keyof typeof typeConfig]}</p>
                <p><strong>申請原因：</strong>{selectedRefund.reason}</p>
                {selectedRefund.amount && (
                  <p><strong>退款金額：</strong>HK${selectedRefund.amount}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">回復內容 *</label>
                <Textarea
                  placeholder="請輸入回復內容..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
              </div>

              {processAction === 'approve' && selectedRefund.type === 'return_refund' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">退貨地址</label>
                    <Input placeholder="收貨地址" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    用戶退貨後請填寫物流信息
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmitProcess}
              disabled={submitting}
              variant={processAction === 'reject' ? 'destructive' : 'default'}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              確認{processAction === 'approve' ? '同意' : '拒絕'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
