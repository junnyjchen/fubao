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
import { RequireAuth } from '@/components/auth/RequireAuth';
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
import { useI18n } from '@/lib/i18n';

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
  return (
    <RequireAuth>
      <DistributionCenterContent />
    </RequireAuth>
  );
}

function DistributionCenterContent() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const d = t.distribution;
  
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
      toast.error(d.withdraw.minAmount);
      return;
    }
    if (!withdrawForm.bank_name || !withdrawForm.bank_account || !withdrawForm.account_name) {
      toast.error(d.withdraw.fillBankInfo);
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
        toast.success(d.withdraw.success);
        setShowWithdrawDialog(false);
        loadData();
      } else {
        toast.error(result.error || d.withdraw.failed);
      }
    } catch (error) {
      toast.error(d.withdraw.failed);
    } finally {
      setWithdrawing(false);
    }
  };

  const copyInviteLink = () => {
    if (data) {
      navigator.clipboard.writeText(data.invite_link);
      toast.success(d.share.linkCopied);
    }
  };

  const copyInviteCode = () => {
    if (data) {
      navigator.clipboard.writeText(data.invite_code);
      toast.success(d.share.codeCopied);
    }
  };

  if (loading) {
    return <DistributionSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{d.loadFailed}</p>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Gift,
      title: d.freeGiftPromo,
      description: d.freeGiftPromoDesc,
      href: '/free-gifts',
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      icon: Users,
      title: d.myTeam,
      description: d.teamDesc.replace('{direct}', String(data.direct_count)).replace('{team}', String(data.team_count)),
      href: '/distribution/team',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: DollarSign,
      title: d.commissions,
      description: d.monthAmount.replace('{amount}', data.month_commission.toFixed(2)),
      href: '/distribution/commissions',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Wallet,
      title: d.withdrawals,
      description: d.withdrawnAmount.replace('{amount}', data.withdrawn_commission.toFixed(2)),
      href: '/distribution/withdrawals',
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      icon: Award,
      title: d.rules,
      description: d.rulesDesc,
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
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h1 className="text-2xl font-bold">{d.title}</h1>
            {data.is_team_leader && (
              <Badge className="bg-yellow-400 text-yellow-900 gap-1">
                <Crown className="w-3 h-3" />
                {d.teamLeader}
              </Badge>
            )}
          </div>

          {/* 佣金卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm opacity-80">{d.availableCommission}</p>
              <p className="text-2xl font-bold mt-1">
                HK${data.available_commission.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">{d.frozenCommission}</p>
              <p className="text-2xl font-bold mt-1">
                HK${data.pending_commission.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">{d.totalCommission}</p>
              <p className="text-2xl font-bold mt-1">
                HK${data.total_commission.toFixed(2)}
              </p>
            </div>
          </div>

          <div className={`flex gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowWithdrawDialog(true)}
            >
              <Wallet className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
              {d.applyWithdraw}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
              {d.inviteFriends}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 今日数据 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={`text-base ${isRTL ? 'text-right' : ''}`}>{d.todayData}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{d.todayCommission}</p>
                  <p className="font-semibold">HK${data.today_commission.toFixed(2)}</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{d.teamCount}</p>
                  <p className="font-semibold">{data.team_count}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 团队概览 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={`text-base ${isRTL ? 'text-right' : ''}`}>{d.teamOverview}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className={`flex justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{d.level1}</span>
                  <span className="font-medium">{data.direct_count}</span>
                </div>
                <Progress value={(data.direct_count / data.team_count) * 100 || 0} className="h-2" />
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{d.level2}</span>
                  <span className="font-medium">{data.level_2_count}</span>
                </div>
                <Progress value={(data.level_2_count / data.team_count) * 100 || 0} className="h-2" />
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{d.level3}</span>
                  <span className="font-medium">{data.level_3_count}</span>
                </div>
                <Progress value={(data.level_3_count / data.team_count) * 100 || 0} className="h-2" />
              </div>
            </div>
            <div className={`mt-4 pt-4 border-t flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-muted-foreground">{d.totalSales}</span>
              <span className="font-semibold">HK${data.total_team_sales.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 功能菜单 */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <Link key={item.title} href={item.href}>
                <div className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${index > 0 ? 'border-t' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* 邀请码 */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardContent className="py-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-muted-foreground">{d.inviteCode}</p>
                <p className="text-xl font-bold font-mono">{data.invite_code}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                <Copy className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
                {t.common.copied}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提现弹窗 */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : ''}>{d.withdraw.title}</DialogTitle>
            <DialogDescription className={isRTL ? 'text-right' : ''}>
              {d.availableCommission}：HK${data.available_commission.toFixed(2)}，{d.minWithdraw} HK$100
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>{d.withdrawAmount}</Label>
              <Input
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>{d.bankName}</Label>
              <Input
                value={withdrawForm.bank_name}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>{d.bankAccount}</Label>
              <Input
                value={withdrawForm.bank_account}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_account: e.target.value })}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>{d.accountName}</Label>
              <Input
                value={withdrawForm.account_name}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, account_name: e.target.value })}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
          </div>
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button className="flex-1" onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ms-2' : 'me-2'}`} />
                  {t.common.loading}
                </>
              ) : (
                t.common.confirm
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 分享弹窗 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : ''}>{d.inviteFriends}</DialogTitle>
            <DialogDescription className={isRTL ? 'text-right' : ''}>
              {d.share.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">{d.inviteCode}</p>
              <p className="text-2xl font-bold font-mono">{data.invite_code}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className={`text-sm text-muted-foreground mb-2 ${isRTL ? 'text-right' : ''}`}>{d.inviteLink}</p>
              <p className={`text-sm break-all ${isRTL ? 'text-right' : ''}`}>{data.invite_link}</p>
            </div>
            <div className={`grid grid-cols-4 gap-3 ${isRTL ? 'direction-rtl' : ''}`}>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">微</span>
                </div>
                <span className="text-xs">WeChat</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">友</span>
                </div>
                <span className="text-xs">Timeline</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={copyInviteLink}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">{d.share.copyLink}</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">QR</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
