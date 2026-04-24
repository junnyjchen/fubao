/**
 * @fileoverview 管理后台财务对账页面
 * @description 平台财务报表、商户结算、收入统计
 * @module app/admin/finance/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Store,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  Wallet,
} from 'lucide-react';

interface FinanceOverview {
  totalRevenue: number;
  monthRevenue: number;
  platformFee: number;
  pendingSettlement: number;
  settled: number;
  orderCount: number;
}

interface MerchantSettlement {
  id: string;
  merchant_id: number;
  merchant_name: string;
  period: string;
  orderCount: number;
  totalAmount: number;
  platformFee: number;
  settleAmount: number;
  status: 'pending' | 'settled' | 'failed';
  created_at: string;
  settled_at?: string;
}

interface Transaction {
  id: string;
  order_no: string;
  merchant_name: string;
  type: 'income' | 'settlement' | 'refund';
  amount: number;
  platform_fee: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export default function AdminFinancePage() {
  const [overview, setOverview] = useState<FinanceOverview>({
    totalRevenue: 0,
    monthRevenue: 0,
    platformFee: 0,
    pendingSettlement: 0,
    settled: 0,
    orderCount: 0,
  });
  const [settlements, setSettlements] = useState<MerchantSettlement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'settlements' | 'transactions'>('overview');
  const [dateRange, setDateRange] = useState('month');
  const [detailDialog, setDetailDialog] = useState<MerchantSettlement | null>(null);

  useEffect(() => {
    loadFinanceData();
  }, [dateRange]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setOverview({
        totalRevenue: 1256800,
        monthRevenue: 386500,
        platformFee: 37590,
        pendingSettlement: 86500,
        settled: 348910,
        orderCount: 1256,
      });

      setSettlements([
        {
          id: 'S202603',
          merchant_id: 1,
          merchant_name: '武當山道觀官方店',
          period: '2026年3月',
          orderCount: 156,
          totalAmount: 86500,
          platformFee: 2595,
          settleAmount: 83905,
          status: 'pending',
          created_at: '2026-03-24',
        },
        {
          id: 'S202603-2',
          merchant_id: 2,
          merchant_name: '龍虎山天師府店',
          period: '2026年3月',
          orderCount: 98,
          totalAmount: 52600,
          platformFee: 1578,
          settleAmount: 51022,
          status: 'pending',
          created_at: '2026-03-24',
        },
        {
          id: 'S202602',
          merchant_id: 1,
          merchant_name: '武當山道觀官方店',
          period: '2026年2月',
          orderCount: 142,
          totalAmount: 78200,
          platformFee: 2346,
          settleAmount: 75854,
          status: 'settled',
          created_at: '2026-03-01',
          settled_at: '2026-03-05',
        },
        {
          id: 'S202602-2',
          merchant_id: 3,
          merchant_name: '青城山道觀店',
          period: '2026年2月',
          orderCount: 86,
          totalAmount: 45800,
          platformFee: 1374,
          settleAmount: 44426,
          status: 'settled',
          created_at: '2026-03-01',
          settled_at: '2026-03-05',
        },
      ]);

      setTransactions([
        {
          id: 'T20260324001',
          order_no: 'FB20260324001',
          merchant_name: '武當山道觀官方店',
          type: 'income',
          amount: 288,
          platform_fee: 8.64,
          status: 'completed',
          created_at: '2026-03-24T08:30:00',
        },
        {
          id: 'T20260324002',
          order_no: 'FB20260324002',
          merchant_name: '龍虎山天師府店',
          type: 'income',
          amount: 680,
          platform_fee: 20.4,
          status: 'completed',
          created_at: '2026-03-24T09:15:00',
        },
        {
          id: 'T20260323003',
          order_no: 'FB20260323003',
          merchant_name: '青城山道觀店',
          type: 'refund',
          amount: -168,
          platform_fee: 0,
          status: 'completed',
          created_at: '2026-03-23T15:00:00',
        },
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; className: string }> = {
      pending: { label: '待結算', className: 'bg-yellow-100 text-yellow-800' },
      settled: { label: '已結算', className: 'bg-green-100 text-green-800' },
      failed: { label: '失敗', className: 'bg-red-100 text-red-800' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
    };
    const s = statuses[status] || statuses.pending;
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      income: { label: '收入', className: 'bg-green-100 text-green-800' },
      settlement: { label: '結算', className: 'bg-blue-100 text-blue-800' },
      refund: { label: '退款', className: 'bg-red-100 text-red-800' },
    };
    const t = types[type] || types.income;
    return <Badge className={t.className}>{t.label}</Badge>;
  };

  const statCards = [
    {
      title: '平台總營收',
      value: `HK$${overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '本月營收',
      value: `HK$${overview.monthRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+15.2%',
    },
    {
      title: '平台手續費',
      value: `HK$${overview.platformFee.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: '待結算金額',
      value: `HK$${overview.pendingSettlement.toLocaleString()}`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">財務對賬</h1>
                <p className="text-sm text-muted-foreground">平台財務管理與結算</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                導出報表
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
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
            variant={activeTab === 'settlements' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settlements')}
          >
            <Store className="w-4 h-4 mr-2" />
            商戶結算
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
          >
            <Wallet className="w-4 h-4 mr-2" />
            交易明細
          </Button>
        </div>

        {/* 财务概览 */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">營收趨勢</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>營收趨勢圖表</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">商戶營收排名</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['武當山道觀官方店', '龍虎山天師府店', '青城山道觀店'].map((name, i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{name}</span>
                      </div>
                      <span className="font-medium">HK${[86500, 52600, 45800][i].toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">待處理結算</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('settlements')}>
                  查看全部
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商戶</TableHead>
                      <TableHead>結算週期</TableHead>
                      <TableHead>訂單數</TableHead>
                      <TableHead>結算金額</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.filter(s => s.status === 'pending').slice(0, 5).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.merchant_name}</TableCell>
                        <TableCell>{s.period}</TableCell>
                        <TableCell>{s.orderCount}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          HK${s.settleAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDetailDialog(s)}>
                            處理
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 商户结算 */}
        {activeTab === 'settlements' && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">本月</SelectItem>
                    <SelectItem value="quarter">本季度</SelectItem>
                    <SelectItem value="year">本年</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  導出結算單
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商戶</TableHead>
                    <TableHead>結算週期</TableHead>
                    <TableHead>訂單數</TableHead>
                    <TableHead>總金額</TableHead>
                    <TableHead>平台手續費</TableHead>
                    <TableHead>結算金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.merchant_name}</TableCell>
                      <TableCell>{s.period}</TableCell>
                      <TableCell>{s.orderCount}</TableCell>
                      <TableCell>HK${s.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-HK${s.platformFee.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        HK${s.settleAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDetailDialog(s)}>
                          詳情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 交易明细 */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input placeholder="搜索交易單號..." className="sm:w-64" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">今日</SelectItem>
                    <SelectItem value="week">本週</SelectItem>
                    <SelectItem value="month">本月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易單號</TableHead>
                    <TableHead>訂單號</TableHead>
                    <TableHead>商戶</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>手續費</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>時間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                      <TableCell className="font-mono text-sm">{tx.order_no}</TableCell>
                      <TableCell>{tx.merchant_name}</TableCell>
                      <TableCell>{getTypeBadge(tx.type)}</TableCell>
                      <TableCell className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount >= 0 ? '+' : ''}HK${Math.abs(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        HK${tx.platform_fee.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString('zh-TW')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 详情弹窗 */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>結算詳情</DialogTitle>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">商戶</p>
                  <p className="font-medium">{detailDialog.merchant_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">結算週期</p>
                  <p>{detailDialog.period}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">訂單數量</p>
                  <p>{detailDialog.orderCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">狀態</p>
                  <p>{getStatusBadge(detailDialog.status)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">總金額</p>
                  <p>HK${detailDialog.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">平台手續費</p>
                  <p className="text-red-600">-HK${detailDialog.platformFee.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">結算金額</span>
                  <span className="text-xl font-bold text-green-600">
                    HK${detailDialog.settleAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {detailDialog?.status === 'pending' && (
              <Button>確認結算</Button>
            )}
            <Button variant="outline" onClick={() => setDetailDialog(null)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
