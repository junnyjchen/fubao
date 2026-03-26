/**
 * @fileoverview 用户钱包提现页面
 * @description 用户余额提现功能
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
  ArrowLeft,
  Wallet,
  Building2,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface BalanceInfo {
  balance: number;
  frozen_balance: number;
}

interface WithdrawRecord {
  id: number;
  withdraw_no: string;
  amount: number;
  fee: number;
  actual_amount: number;
  bank_name: string;
  bank_account: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  remark: string | null;
}

const withdrawMethods = [
  { value: 'bank', label: '銀行轉賬', icon: Building2, fee: 0 },
  { value: 'alipay', label: '支付寶', icon: Wallet, fee: 0 },
  { value: 'wechat', label: '微信', icon: Wallet, fee: 0 },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '待審核', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: '處理中', color: 'bg-blue-100 text-blue-800' },
  success: { label: '已到賬', color: 'bg-green-100 text-green-800' },
  failed: { label: '提現失敗', color: 'bg-red-100 text-red-800' },
};

export default function WithdrawPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const [amount, setAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    bank_branch: '',
    account_name: '',
    account_number: '',
  });
  const [alipayAccount, setAlipayAccount] = useState('');
  const [wechatAccount, setWechatAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceRes, withdrawRes] = await Promise.all([
        fetch('/api/user/balance'),
        fetch('/api/withdraw?limit=10'),
      ]);

      const balanceData = await balanceRes.json();
      const withdrawData = await withdrawRes.json();

      if (balanceData.data) {
        setBalanceInfo(balanceData.data.balance);
      }
      if (withdrawData.data) {
        setWithdrawRecords(withdrawData.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateBankInfo = () => {
    if (withdrawMethod === 'bank') {
      if (!bankInfo.bank_name || !bankInfo.account_name || !bankInfo.account_number) {
        toast.error('請填寫完整的銀行信息');
        return false;
      }
    } else if (withdrawMethod === 'alipay') {
      if (!alipayAccount) {
        toast.error('請填寫支付寶賬號');
        return false;
      }
    } else if (withdrawMethod === 'wechat') {
      if (!wechatAccount) {
        toast.error('請填寫微信賬號');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount < 50) {
      toast.error('最低提現金額為HK$50');
      return;
    }

    if (balanceInfo && withdrawAmount > balanceInfo.balance) {
      toast.error('提現金額不能超過可用餘額');
      return;
    }

    if (!validateBankInfo()) {
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        amount: withdrawAmount,
        withdraw_method: withdrawMethod,
      };

      if (withdrawMethod === 'bank') {
        body.bank_info = bankInfo;
      } else if (withdrawMethod === 'alipay') {
        body.alipay_account = alipayAccount;
      } else if (withdrawMethod === 'wechat') {
        body.wechat_account = wechatAccount;
      }

      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('提現申請已提交，請等待審核');
        router.push('/user/wallet');
      } else {
        toast.error(data.error || '提現申請失敗');
      }
    } catch (error) {
      console.error('提现申请失败:', error);
      toast.error('提現申請失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/user/wallet">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">餘額提現</h1>
            <p className="text-sm text-muted-foreground">提取賬戶餘額到銀行賬戶</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 提现表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 可用余额 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">可提現餘額</p>
                    <p className="text-2xl font-bold text-primary">
                      HK${balanceInfo?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">凍結金額</p>
                    <p className="text-lg">
                      HK${balanceInfo?.frozen_balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提现金额 */}
            <Card>
              <CardHeader>
                <CardTitle>提現金額</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>提現金額</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">HK$</span>
                    <Input
                      type="number"
                      placeholder="請輸入提現金額"
                      className="pl-12 h-12 text-xl"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={50}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    最低提現金額：HK$50
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[100, 200, 500, 1000, 2000].map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amt.toString())}
                    >
                      HK${amt}
                    </Button>
                  ))}
                  {balanceInfo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(balanceInfo.balance.toString())}
                    >
                      全部提現
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 提现方式 */}
            <Card>
              <CardHeader>
                <CardTitle>提現方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <div className="grid grid-cols-3 gap-3">
                    {withdrawMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.value}
                          className={`flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                            withdrawMethod === method.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setWithdrawMethod(method.value)}
                        >
                          <RadioGroupItem value={method.value} className="sr-only" />
                          <Icon className="w-5 h-5" />
                          <span>{method.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {withdrawMethod === 'bank' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>開戶銀行</Label>
                      <Input
                        className="mt-2"
                        placeholder="請輸入開戶銀行名稱"
                        value={bankInfo.bank_name}
                        onChange={(e) => setBankInfo({ ...bankInfo, bank_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>開戶支行</Label>
                      <Input
                        className="mt-2"
                        placeholder="請輸入開戶支行（選填）"
                        value={bankInfo.bank_branch}
                        onChange={(e) => setBankInfo({ ...bankInfo, bank_branch: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>開戶姓名</Label>
                      <Input
                        className="mt-2"
                        placeholder="請輸入開戶姓名"
                        value={bankInfo.account_name}
                        onChange={(e) => setBankInfo({ ...bankInfo, account_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>銀行賬號</Label>
                      <Input
                        className="mt-2"
                        placeholder="請輸入銀行賬號"
                        value={bankInfo.account_number}
                        onChange={(e) => setBankInfo({ ...bankInfo, account_number: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {withdrawMethod === 'alipay' && (
                  <div className="mt-4">
                    <Label>支付寶賬號</Label>
                    <Input
                      className="mt-2"
                      placeholder="請輸入支付寶賬號"
                      value={alipayAccount}
                      onChange={(e) => setAlipayAccount(e.target.value)}
                    />
                  </div>
                )}

                {withdrawMethod === 'wechat' && (
                  <div className="mt-4">
                    <Label>微信賬號</Label>
                    <Input
                      className="mt-2"
                      placeholder="請輸入微信賬號"
                      value={wechatAccount}
                      onChange={(e) => setWechatAccount(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 提现说明 */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-2">提現說明</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>提現申請提交後，將在1-3個工作日內處理</li>
                      <li>提現金額將扣除手續費（如適用）</li>
                      <li>請確保收款賬戶信息準確無誤</li>
                      <li>如有疑問，請聯繫客服</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提交按钮 */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
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
          </div>

          {/* 提现记录 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  提現記錄
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawRecords.length > 0 ? (
                  <div className="space-y-4">
                    {withdrawRecords.map((record) => (
                      <div key={record.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">HK${record.amount}</span>
                          <Badge className={statusLabels[record.status]?.color}>
                            {statusLabels[record.status]?.label || record.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>{record.withdraw_no}</p>
                          <p>{formatTime(record.created_at)}</p>
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
        </div>
      </main>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
