/**
 * @fileoverview 余额提现页面
 * @description 用户余额提现到SOL钱包
 * @module app/user/wallet/withdraw/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Wallet,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { UserLayout } from '@/components/user/UserLayout';
import { getAuthHeaders } from '@/lib/api-client';

interface BalanceInfo {
  balance: number;
  frozen_balance: number;
  total_recharge: number;
  total_consumed: number;
}

interface WithdrawRecord {
  id: number;
  amount: number;
  fee: number;
  actual_amount: number;
  method: string;
  address: string;
  status: string;
  remark: string;
  created_at: string;
  processed_at: string | null;
}

const SOL_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export default function WithdrawPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'sol'>('sol');
  const [solAddress, setSolAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // 平台SOL收款地址（用于显示给用户转账）
  const [platformSolAddress, setPlatformSolAddress] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [balanceRes, withdrawRes] = await Promise.all([
        fetch('/api/user/balance', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/user/withdrawals', { headers: getAuthHeaders(), credentials: 'include' }),
      ]);

      const balanceData = await balanceRes.json();
      if (balanceData.data) {
        setBalanceInfo(balanceData.data.balance);
      }

      const withdrawData = await withdrawRes.json();
      if (withdrawData.data) {
        setWithdrawRecords(withdrawData.data || []);
      }

      // 获取平台SOL地址
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.data?.platform_sol_address) {
        setPlatformSolAddress(settingsData.data.platform_sol_address);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateSolAddress = (addr: string): boolean => {
    return SOL_ADDRESS_REGEX.test(addr);
  };

  const calculateFee = (amt: number): number => {
    // 提现手续费 1%
    return Math.round(amt * 0.01 * 100) / 100;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('請輸入有效的提現金額');
      return;
    }

    if (amt < 10) {
      setError('最低提現金額為 HK$10');
      return;
    }

    if (balanceInfo && amt > balanceInfo.balance) {
      setError('提現金額超過可用餘額');
      return;
    }

    if (!solAddress.trim()) {
      setError('請輸入SOL錢包地址');
      return;
    }

    if (!validateSolAddress(solAddress.trim())) {
      setError('SOL錢包地址格式不正確');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/user/withdrawals', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: amt,
          method: 'sol',
          address: solAddress.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setAmount('');
        setSolAddress('');
        fetchData(); // 刷新余额和记录
      } else {
        setError(data.error || '提現申請失敗');
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = () => {
    if (platformSolAddress) {
      navigator.clipboard.writeText(platformSolAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">待審核</Badge>;
      case 'processing':
        return <Badge variant="default">處理中</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">已完成</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒絕</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </UserLayout>
    );
  }

  const fee = amount ? calculateFee(parseFloat(amount)) : 0;
  const actualAmount = amount ? parseFloat(amount) - fee : 0;

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Link href="/user/wallet" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回錢包
        </Link>

        {/* 余额卡片 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">可用餘額</div>
                <div className="text-3xl font-bold">HK${balanceInfo?.balance?.toFixed(2) || '0.00'}</div>
              </div>
              <Wallet className="w-10 h-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        {/* 提现表单 */}
        <Card>
          <CardHeader>
            <CardTitle>申請提現</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>提現申請已提交，請等待審核</span>
              </div>
            )}

            {/* 提现方式 */}
            <div>
              <Label className="text-base font-medium mb-3 block">提現方式</Label>
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as 'sol')}>
                <Label
                  htmlFor="method-sol"
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    method === 'sol' ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <RadioGroupItem value="sol" id="method-sol" />
                  <div className="flex-1">
                    <div className="font-medium">SOL (Solana)</div>
                    <div className="text-xs text-muted-foreground">提現到您的SOL錢包地址</div>
                  </div>
                  <Badge variant="secondary">推薦</Badge>
                </Label>
              </RadioGroup>
            </div>

            <Separator />

            {/* 提现金额 */}
            <div>
              <Label>提現金額 (HK$)</Label>
              <Input
                type="number"
                placeholder="輸入提現金額"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10}
                max={balanceInfo?.balance || 0}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                最低提現金額 HK$10，手續費 1%
              </div>
            </div>

            {/* SOL地址 */}
            <div>
              <Label>SOL 錢包地址</Label>
              <Input
                type="text"
                placeholder="輸入您的SOL錢包地址"
                value={solAddress}
                onChange={(e) => setSolAddress(e.target.value)}
                className="mt-2 font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                請確保地址正確，提現後無法撤銷
              </div>
            </div>

            {/* 费用明细 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>提現金額</span>
                <span>HK${amount || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>手續費 (1%)</span>
                <span>-HK${fee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>實際到賬</span>
                <span className="text-primary">HK${actualAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !amount || !solAddress}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                '提交提現申請'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 提现记录 */}
        <Card>
          <CardHeader>
            <CardTitle>提現記錄</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawRecords.length > 0 ? (
              <div className="space-y-4">
                {withdrawRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">HK${record.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {record.address.slice(0, 8)}...{record.address.slice(-8)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(record.created_at).toLocaleString('zh-TW')}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(record.status)}
                      {record.status === 'completed' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          實際到賬: HK${record.actual_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暫無提現記錄
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </UserLayout>
  );
}
