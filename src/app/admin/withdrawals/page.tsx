/**
 * @fileoverview 后台提现审核页面
 * @description 审核用户提现申请
 * @module app/admin/withdrawals/page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Withdrawal {
  id: number;
  user_id: string;
  amount: number;
  fee: number;
  actual_amount: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  status: number;
  reject_reason?: string;
  created_at: string;
  reviewed_at?: string;
  paid_at?: string;
  transaction_no?: string;
}

const statusMap: Record<number, { label: string; color: string; icon: typeof Clock }> = {
  0: { label: '待審核', color: 'bg-amber-100 text-amber-700', icon: Clock },
  1: { label: '已通過', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  2: { label: '已拒絕', color: 'bg-red-100 text-red-700', icon: XCircle },
  3: { label: '已打款', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [transactionNo, setTransactionNo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [activeTab]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'pending' ? '0' : activeTab === 'approved' ? '1' : activeTab === 'paid' ? '3' : 'all';
      const res = await fetch(`/api/admin/withdrawals?status=${status}`);
      const result = await res.json();
      if (result.success) {
        setWithdrawals(result.data.list);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawal: Withdrawal) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          withdrawal_id: withdrawal.id,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('已批准提現申請');
        loadWithdrawals();
      } else {
        toast.error(result.error || '操作失敗');
      }
    } catch (error) {
      toast.error('操作失敗');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    if (!rejectReason.trim()) {
      toast.error('請填寫拒絕原因');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          withdrawal_id: selectedWithdrawal.id,
          reject_reason: rejectReason,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('已拒絕提現申請');
        setShowRejectDialog(false);
        setRejectReason('');
        loadWithdrawals();
      } else {
        toast.error(result.error || '操作失敗');
      }
    } catch (error) {
      toast.error('操作失敗');
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!selectedWithdrawal) return;
    if (!transactionNo.trim()) {
      toast.error('請填寫交易流水號');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay',
          withdrawal_id: selectedWithdrawal.id,
          transaction_no: transactionNo,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('已記錄打款信息');
        setShowPayDialog(false);
        setTransactionNo('');
        loadWithdrawals();
      } else {
        toast.error(result.error || '操作失敗');
      }
    } catch (error) {
      toast.error('操作失敗');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW');
  };

  const pendingCount = withdrawals.filter((w) => w.status === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">提現審核</h1>
          <p className="text-muted-foreground">審核用戶提現申請</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-700">
            {pendingCount} 筆待審核
          </Badge>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待審核</p>
                <p className="text-xl font-bold">{withdrawals.filter(w => w.status === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待打款</p>
                <p className="text-xl font-bold">{withdrawals.filter(w => w.status === 1).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">已打款</p>
                <p className="text-xl font-bold">{withdrawals.filter(w => w.status === 3).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">待審核</TabsTrigger>
          <TabsTrigger value="approved">待打款</TabsTrigger>
          <TabsTrigger value="paid">已打款</TabsTrigger>
          <TabsTrigger value="all">全部</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wallet className="w-12 h-12 mb-4" />
                  <p>暫無提現記錄</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申請時間</TableHead>
                      <TableHead>用戶ID</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>銀行信息</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => {
                      const status = statusMap[w.status];
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="text-sm">
                            {formatDate(w.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {w.user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">HK${w.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                實際到賬 HK${w.actual_amount.toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{w.bank_name}</p>
                              <p className="text-muted-foreground">{w.bank_account}</p>
                              <p className="text-muted-foreground">{w.account_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <status.icon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            {w.reject_reason && (
                              <p className="text-xs text-red-500 mt-1">{w.reject_reason}</p>
                            )}
                            {w.transaction_no && (
                              <p className="text-xs text-muted-foreground mt-1">
                                流水號: {w.transaction_no}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {w.status === 0 && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => handleApprove(w)}
                                  disabled={processing}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  批准
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setShowRejectDialog(true);
                                  }}
                                  disabled={processing}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  拒絕
                                </Button>
                              </div>
                            )}
                            {w.status === 1 && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setShowPayDialog(true);
                                }}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                確認打款
                              </Button>
                            )}
                            {w.status === 3 && (
                              <span className="text-sm text-muted-foreground">已完成</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 拒绝弹窗 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒絕提現申請</DialogTitle>
            <DialogDescription>
              請填寫拒絕原因，佣金將退還給用戶
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>拒絕原因</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="請輸入拒絕原因..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  處理中...
                </>
              ) : (
                '確認拒絕'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 打款弹窗 */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認打款</DialogTitle>
            <DialogDescription>
              提現金額: HK${selectedWithdrawal?.actual_amount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>銀行信息</Label>
              <p className="text-sm mt-1">
                {selectedWithdrawal?.bank_name} {selectedWithdrawal?.bank_account}
              </p>
              <p className="text-sm text-muted-foreground">
                戶名: {selectedWithdrawal?.account_name}
              </p>
            </div>
            <div>
              <Label>交易流水號</Label>
              <Input
                value={transactionNo}
                onChange={(e) => setTransactionNo(e.target.value)}
                placeholder="請輸入銀行打款流水號"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              取消
            </Button>
            <Button onClick={handlePay} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  處理中...
                </>
              ) : (
                '確認打款'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
