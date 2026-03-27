/**
 * @fileoverview 分销中心页面
 * @description 用户分销推广中心，查看佣金、团队、提现
 * @module app/distribution/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Share2,
  ChevronRight,
  Wallet,
  UserPlus,
  Award,
  Copy,
  QrCode,
  Loader2,
  Crown,
  ArrowUpRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DistributionSkeleton } from '@/components/common/PageSkeletons';

interface DistributionData {
  invite_code: string;
  invite_link: string;
  is_team_leader: boolean;
  total_commission: number;
  available_commission: number;
  frozen_commission: number;
  withdrawn_commission: number;
  team_count: number;
  direct_count: number;
  level_2_count: number;
  level_3_count: number;
  total_team_sales: number;
  today_commission: number;
  month_commission: number;
  pending_commission: number;
}

export default function DistributionCenterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DistributionData | null>(null);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    account_name: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribution');
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

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) < 100) {
      toast.error('最低提現金額為HK$100');
      return;
    }
    if (!withdrawForm.bank_name || !withdrawForm.bank_account || !withdrawForm.account_name) {
      toast.error('請填寫完整的銀行信息');
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch('/api/distribution/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawForm.amount),
          bank_name: withdrawForm.bank_name,
          bank_account: withdrawForm.bank_account,
          account_name: withdrawForm.account_name,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('提現申請已提交');
        setShowWithdrawDialog(false);
        loadData();
      } else {
        toast.error(result.error || '申請失敗');
      }
    } catch (error) {
      toast.error('申請失敗');
    } finally {
      setWithdrawing(false);
    }
  };

  const copyInviteLink = () => {
    if (data) {
      navigator.clipboard.writeText(data.invite_link);
      toast.success('邀請鏈接已複製');
    }
  };

  const copyInviteCode = () => {
    if (data) {
      navigator.clipboard.writeText(data.invite_code);
      toast.success('邀請碼已複製');
    }
  };

  if (loading) {
    return <DistributionSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加載失敗，請重試</p>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Gift,
      title: '免費領推廣',
      description: '推廣免費領活動，獲取獎勵',
      href: '/free-gifts',
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      icon: Users,
      title: '我的團隊',
      description: `直推 ${data.direct_count} 人 · 團隊 ${data.team_count} 人`,
      href: '/distribution/team',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: DollarSign,
      title: '佣金明細',
      description: `本月 HK$${data.month_commission.toFixed(2)}`,
      href: '/distribution/commissions',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Wallet,
      title: '提現記錄',
      description: `已提現 HK$${data.withdrawn_commission.toFixed(2)}`,
      href: '/distribution/withdrawals',
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      icon: Award,
      title: '分銷規則',
      description: '了解佣金計算方式',
      href: '/distribution/rules',
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">分銷中心</h1>
            {data.is_team_leader && (
              <Badge className="bg-yellow-400 text-yellow-900 gap-1">
                <Crown className="w-3 h-3" />
                團隊長
              </Badge>
            )}
          </div>

          {/* 佣金卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm opacity-80">可用佣金</p>
              <p className="text-2xl font-bold mt-1">
                HK${data.available_commission.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">待結算</p>
              <p className="text-2xl font-bold mt-1">
                HK${data.pending_commission.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">累計佣金</p>
              <p className="text-2xl font-bold mt-1">
                HK${data.total_commission.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowWithdrawDialog(true)}
            >
              <Wallet className="w-4 h-4 mr-2" />
              申請提現
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              邀請好友
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 今日数据 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">今日數據</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">今日佣金</p>
                  <p className="font-semibold">HK${data.today_commission.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">團隊人數</p>
                  <p className="font-semibold">{data.team_count} 人</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 团队概览 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">團隊概覽</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>一級分銷（直推）</span>
                  <span className="font-medium">{data.direct_count} 人</span>
                </div>
                <Progress value={(data.direct_count / data.team_count) * 100 || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>二級分銷</span>
                  <span className="font-medium">{data.level_2_count} 人</span>
                </div>
                <Progress value={(data.level_2_count / data.team_count) * 100 || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>三級分銷</span>
                  <span className="font-medium">{data.level_3_count} 人</span>
                </div>
                <Progress value={(data.level_3_count / data.team_count) * 100 || 0} className="h-2" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-muted-foreground">團隊總銷售額</span>
              <span className="font-semibold">HK${data.total_team_sales.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 功能菜单 */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <Link key={item.title} href={item.href}>
                <div className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${index > 0 ? 'border-t' : ''}`}>
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* 邀请码 */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">我的邀請碼</p>
                <p className="text-xl font-bold font-mono">{data.invite_code}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                <Copy className="w-4 h-4 mr-1" />
                複製
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提现弹窗 */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申請提現</DialogTitle>
            <DialogDescription>
              可提現金額：HK${data.available_commission.toFixed(2)}，最低提現HK$100
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>提現金額</Label>
              <Input
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                placeholder="請輸入提現金額"
              />
            </div>
            <div className="space-y-2">
              <Label>銀行名稱</Label>
              <Input
                value={withdrawForm.bank_name}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                placeholder="例如：中國銀行"
              />
            </div>
            <div className="space-y-2">
              <Label>銀行賬號</Label>
              <Input
                value={withdrawForm.bank_account}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_account: e.target.value })}
                placeholder="請輸入銀行賬號"
              />
            </div>
            <div className="space-y-2">
              <Label>賬戶名</Label>
              <Input
                value={withdrawForm.account_name}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, account_name: e.target.value })}
                placeholder="請輸入賬戶持有人姓名"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawDialog(false)}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                '確認提現'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 分享弹窗 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>邀請好友</DialogTitle>
            <DialogDescription>
              分享邀請鏈接給好友，好友註冊購物後您可獲得佣金獎勵
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">邀請碼</p>
              <p className="text-2xl font-bold font-mono">{data.invite_code}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">邀請鏈接</p>
              <p className="text-sm break-all">{data.invite_link}</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">微</span>
                </div>
                <span className="text-xs">微信</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">朋</span>
                </div>
                <span className="text-xs">朋友圈</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={copyInviteLink}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">複製</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">二維碼</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
