/**
 * @fileoverview 提现记录页面
 * @description 查看提现申请记录
 * @module app/distribution/withdrawals/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { DistributionSubSkeleton } from '@/components/common/PageSkeletons';

interface Withdrawal {
  id: number;
  amount: number;
  fee: number;
  actual_amount: number;
  status: number;
  bank_name?: string;
  bank_account?: string;
  transaction_no?: string;
  reject_reason?: string;
  created_at: string;
  reviewed_at?: string;
  paid_at?: string;
}

interface WithdrawalData {
  total_withdrawn: number;
  pending_amount: number;
  withdrawals: Withdrawal[];
}

export default function WithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WithdrawalData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribution/withdraw');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return {
          text: '審核中',
          icon: <Clock className="w-4 h-4" />,
          className: 'bg-amber-100 text-amber-700',
        };
      case 1:
        return {
          text: '審核通過',
          icon: <CheckCircle className="w-4 h-4" />,
          className: 'bg-blue-100 text-blue-700',
        };
      case 2:
        return {
          text: '審核拒絕',
          icon: <XCircle className="w-4 h-4" />,
          className: 'bg-red-100 text-red-700',
        };
      case 3:
        return {
          text: '已打款',
          icon: <CheckCircle className="w-4 h-4" />,
          className: 'bg-green-100 text-green-700',
        };
      default:
        return {
          text: '未知',
          icon: <AlertCircle className="w-4 h-4" />,
          className: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <DistributionSubSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加載失敗，請重試</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部 */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/distribution">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">提現記錄</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 统计 */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                HK${data.total_withdrawn.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">已到賬金額</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                HK${data.pending_amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">處理中</p>
            </CardContent>
          </Card>
        </div>

        {/* 提现记录列表 */}
        {data.withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暫無提現記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.withdrawals.map((withdrawal) => {
              const statusInfo = getStatusInfo(withdrawal.status);
              return (
                <Card key={withdrawal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">提現申請</p>
                          <Badge className={statusInfo.className}>
                            <span className="flex items-center gap-1">
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {withdrawal.bank_name} 尾號 {withdrawal.bank_account?.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">HK${withdrawal.amount.toFixed(2)}</p>
                        {withdrawal.fee > 0 && (
                          <p className="text-xs text-muted-foreground">
                            手續費 HK${withdrawal.fee.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>申請時間</span>
                        <span>{formatDate(withdrawal.created_at)}</span>
                      </div>
                      {withdrawal.reviewed_at && (
                        <div className="flex justify-between">
                          <span>審核時間</span>
                          <span>{formatDate(withdrawal.reviewed_at)}</span>
                        </div>
                      )}
                      {withdrawal.paid_at && (
                        <div className="flex justify-between">
                          <span>打款時間</span>
                          <span>{formatDate(withdrawal.paid_at)}</span>
                        </div>
                      )}
                      {withdrawal.transaction_no && (
                        <div className="flex justify-between">
                          <span>交易流水號</span>
                          <span className="font-mono">{withdrawal.transaction_no}</span>
                        </div>
                      )}
                      {withdrawal.reject_reason && (
                        <div className="text-red-500">
                          拒絕原因：{withdrawal.reject_reason}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 说明 */}
        <Card className="bg-muted/50">
          <CardContent className="py-4 text-sm text-muted-foreground">
            <h3 className="font-medium mb-2">提現說明</h3>
            <ul className="space-y-1">
              <li>· 最低提現金額：HK$100</li>
              <li>· 提現審核時間：1-3 個工作日</li>
              <li>· 打款時間：審核通過後 1-2 個工作日</li>
              <li>· 如有疑問請聯繫客服</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
