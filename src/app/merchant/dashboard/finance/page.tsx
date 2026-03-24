/**
 * @fileoverview 商户财务对账页面
 * @description 商户收入、结算、对账管理
 * @module app/merchant/dashboard/finance/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FinanceOverview {
  totalRevenue: number;
  monthRevenue: number;
  pendingSettlement: number;
  settled: number;
  withdrawable: number;
}

interface Transaction {
  id: string;
  order_no: string;
  type: 'income' | 'withdraw' | 'refund';
  amount: number;
  status: 'pending' | 'settled' | 'failed';
  created_at: string;
  settled_at?: string;
  remark?: string;
}

interface Settlement {
  id: string;
  period: string;
  orderCount: number;
  totalAmount: number;
  fee: number;
  settleAmount: number;
  status: 'pending' | 'settled';
  created_at: string;
}

export default function MerchantFinancePage() {
  const [overview, setOverview] = useState<FinanceOverview>({
    totalRevenue: 0,
    monthRevenue: 0,
    pendingSettlement: 0,
    settled: 0,
    withdrawable: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settlements'>('overview');
  const [dateRange, setDateRange] = useState('month');
  const [detailDialog, setDetailDialog] = useState<Transaction | null>(null);

  useEffect(() => {
    loadFinanceData();
  }, [dateRange]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // TODO: 调用真实API
      // 模拟数据
      setOverview({
        totalRevenue: 256800,
        monthRevenue: 86500,
        pendingSettlement: 12500,
        settled: 74000,
        withdrawable: 74000,
      });

      setTransactions([
        {
          id: 'T20260324001',
          order_no: 'FB20260324001',
          type: 'income',
          amount: 288,
          status: 'settled',
          created_at: '2026-03-24T08:30:00',
          settled_at: '2026-03-24T10:00:00',
          remark: '開光平安符訂單',
        },
        {
          id: 'T20260324002',
          order_no: 'FB20260324002',
          type: 'income',
          amount: 680,
          status: 'pending',
          created_at: '2026-03-24T09:15:00',
          remark: '桃木劍訂單',
        },
        {
          id: 'T20260323003',
          order_no: 'FB20260323003',
          type: 'refund',
          amount: -168,
          status: 'settled',
          created_at: '2026-03-23T15:00:00',
          remark: '八卦鏡退款',
        },
        {
          id: 'T20260320004',
          order_no: '',
          type: 'withdraw',
          amount: -50000,
          status: 'settled',
          created_at: '2026-03-20T10:00:00',
          settled_at: '2026-03-20T14:00:00',
          remark: '商戶提現',
        },
      ]);

      setSettlements([
        {
          id: 'S202603',
          period: '2026年3月',
          orderCount: 156,
          totalAmount: 86500,
          fee: 2595,
          settleAmount: 83905,
          status: 'pending',
          created_at: '2026-03-24T00:00:00',
        },
        {
          id: 'S202602',
          period: '2026年2月',
          orderCount: 142,
          totalAmount: 78200,
          fee: 2346,
          settleAmount: 75854,
          status: 'settled',
          created_at: '2026-03-01T00:00:00',
        },
        {
          id: 'S202601',
          period: '2026年1月',
          orderCount: 128,
          totalAmount: 68500,
          fee: 2055,
          settleAmount: 66445,
          status: 'settled',
          created_at: '2026-02-01T00:00:00',
        },
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      income: { label: '收入', className: 'bg-green-100 text-green-800' },
      withdraw: { label: '提現', className: 'bg-blue-100 text-blue-800' },
      refund: { label: '退款', className: 'bg-red-100 text-red-800' },
    };
    const t = types[type] || types.income;
    return <Badge className={t.className}>{t.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { label: '待結算', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      settled: { label: '已結算', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: '失敗', className: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    const s = statuses[status] || statuses.pending;
    const Icon = s.icon;
    return (
      <Badge className={s.className}>
        <Icon className="w-3 h-3 mr-1" />
        {s.label}
      </Badge>
    );
  };

  const statCards = [
    {
      title: '本月營收',
      value: `HK$${overview.monthRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+12.5%',
    },
    {
      title: '待結算金額',
      value: `HK$${overview.pendingSettlement.toLocaleString()}`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: '已結算金額',
      value: `HK$${overview.settled.toLocaleString()}`,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '可提現金額',
      value: `HK$${overview.withdrawable.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <MerchantLayout title="財務對賬" description="收入結算與賬務管理">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tab切换 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
        >
          <FileText className="w-4 h-4 mr-2" />
          財務概覽
        </Button>
        <Button
          variant={activeTab === 'transactions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('transactions')}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          交易明細
        </Button>
        <Button
          variant={activeTab === 'settlements' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settlements')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          結算記錄
        </Button>
      </div>

      {/* 财务概览 */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">收入趨勢</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>收入趨勢圖表</p>
                  <p className="text-sm">（圖表組件待集成）</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">收支構成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">商品銷售</span>
                  <span className="font-medium">HK$258,500</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">退款</span>
                  <span className="font-medium text-red-600">-HK$1,700</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>淨收入</span>
                    <span className="text-green-600">HK$256,800</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">最近交易</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                查看全部
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易單號</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>時間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                      <TableCell>{getTypeBadge(tx.type)}</TableCell>
                      <TableCell className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount >= 0 ? '+' : ''}HK${Math.abs(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString('zh-TW', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 交易明细 */}
      {activeTab === 'transactions' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="搜索交易單號或訂單號..." className="sm:w-64" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今日</SelectItem>
                  <SelectItem value="week">本週</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                  <SelectItem value="quarter">本季度</SelectItem>
                  <SelectItem value="year">本年</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                導出報表
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>交易單號</TableHead>
                  <TableHead>訂單號</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>時間</TableHead>
                  <TableHead>備註</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.order_no || '-'}</TableCell>
                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                    <TableCell className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {tx.amount >= 0 ? '+' : ''}HK${Math.abs(tx.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(tx.created_at).toLocaleString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.remark}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetailDialog(tx)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 结算记录 */}
      {activeTab === 'settlements' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">2026年</SelectItem>
                    <SelectItem value="last_year">2025年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                導出對賬單
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>結算週期</TableHead>
                  <TableHead>訂單數</TableHead>
                  <TableHead>總金額</TableHead>
                  <TableHead>手續費</TableHead>
                  <TableHead>結算金額</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>生成時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.period}</TableCell>
                    <TableCell>{s.orderCount}</TableCell>
                    <TableCell>HK${s.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">-HK${s.fee.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      HK${s.settleAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(s.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(s.created_at).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        查看詳情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 详情弹窗 */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>交易詳情</DialogTitle>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">交易單號</p>
                  <p className="font-mono">{detailDialog.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">訂單號</p>
                  <p className="font-mono">{detailDialog.order_no || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">交易類型</p>
                  <p>{getTypeBadge(detailDialog.type)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">交易狀態</p>
                  <p>{getStatusBadge(detailDialog.status)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">交易金額</p>
                  <p className={detailDialog.amount >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {detailDialog.amount >= 0 ? '+' : ''}HK${Math.abs(detailDialog.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">交易時間</p>
                  <p>{new Date(detailDialog.created_at).toLocaleString('zh-TW')}</p>
                </div>
                {detailDialog.settled_at && (
                  <div>
                    <p className="text-muted-foreground">結算時間</p>
                    <p>{new Date(detailDialog.settled_at).toLocaleString('zh-TW')}</p>
                  </div>
                )}
              </div>
              {detailDialog.remark && (
                <div className="pt-4 border-t">
                  <p className="text-muted-foreground text-sm">備註</p>
                  <p className="text-sm">{detailDialog.remark}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialog(null)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
