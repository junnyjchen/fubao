/**
 * @fileoverview 余额充值页面
 * @description 用户余额充值入口
 * @module app/user/wallet/page
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  CreditCard,
  Smartphone,
  Gift,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { UserLayout } from '@/components/user/UserLayout';

interface BalanceInfo {
  balance: number;
  frozen_balance: number;
  total_recharge: number;
  total_consumed: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  remark: string;
  created_at: string;
}

interface RechargeRecord {
  id: number;
  recharge_no: string;
  amount: number;
  bonus_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface BonusRule {
  minAmount: number;
  bonusRate: number;
  bonusAmount: number;
}

const paymentMethods = [
  { value: 'alipay', label: '支付寶', icon: Wallet, enabled: true },
  { value: 'wechat', label: '微信支付', icon: Smartphone, enabled: true },
  { value: 'paypal', label: 'PayPal', icon: CreditCard, enabled: true },
];

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

const typeLabels: Record<string, { label: string; color: string }> = {
  recharge: { label: '充值', color: 'text-green-600' },
  consume: { label: '消費', color: 'text-red-600' },
  withdraw: { label: '提現', color: 'text-orange-600' },
  refund: { label: '退款', color: 'text-blue-600' },
  bonus: { label: '贈送', color: 'text-purple-600' },
};

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
  const [bonusRules, setBonusRules] = useState<BonusRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [submitting, setSubmitting] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      fetchBalanceInfo();
      fetchRechargeRecords();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const actualAmount = customAmount ? parseInt(customAmount) : amount;
    let bonus = 0;
    for (let i = bonusRules.length - 1; i >= 0; i--) {
      if (actualAmount >= bonusRules[i].minAmount) {
        bonus = Math.floor(actualAmount * bonusRules[i].bonusRate);
        break;
      }
    }
    setBonusAmount(bonus);
  }, [amount, customAmount, bonusRules]);

  const fetchBalanceInfo = async () => {
    try {
      const res = await fetch('/api/user/balance?transactions=true');
      const data = await res.json();
      if (data.data) {
        setBalanceInfo(data.data.balance);
        setTransactions(data.data.transactions || []);
      }
    } catch (error) {
      console.error('获取余额信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRechargeRecords = async () => {
    try {
      const res = await fetch('/api/recharge?limit=10');
      const data = await res.json();
      if (data.data) {
        setRechargeRecords(data.data);
        setBonusRules(data.bonusRules || []);
      }
    } catch (error) {
      console.error('获取充值记录失败:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const actualAmount = customAmount ? parseInt(customAmount) : amount;
    if (actualAmount < 10) {
      alert('充值金額不能少於HK$10');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: actualAmount,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.data) {
        const callbackRes = await fetch('/api/recharge', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recharge_no: data.data.recharge.recharge_no,
            transaction_id: `TXN${Date.now()}`,
          }),
        });

        const callbackData = await callbackRes.json();
        if (callbackData.message) {
          alert(`充值成功！到賬HK$${callbackData.data.total_amount}`);
          fetchBalanceInfo();
          fetchRechargeRecords();
        } else {
          alert(callbackData.error || '充值失敗');
        }
      } else {
        alert(data.error || '創建充值訂單失敗');
      }
    } catch (error) {
      console.error('充值失败:', error);
      alert('充值失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* 余额卡片 */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wallet className="w-5 h-5" />
                  <span>賬戶餘額</span>
                </div>
                <div className="text-4xl font-bold">
                  HK${balanceInfo?.balance?.toFixed(2) || '0.00'}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>凍結: HK${balanceInfo?.frozen_balance?.toFixed(2) || '0.00'}</span>
                  <span>累計充值: HK${balanceInfo?.total_recharge?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <div className="text-right">
                <Link href="/user/wallet/withdraw">
                  <Button variant="outline">
                    提現
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="recharge">
          <TabsList>
            <TabsTrigger value="recharge">餘額充值</TabsTrigger>
            <TabsTrigger value="records">充值記錄</TabsTrigger>
            <TabsTrigger value="transactions">餘額明細</TabsTrigger>
          </TabsList>

          <TabsContent value="recharge" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  充值優惠
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {bonusRules.map((rule, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                        (customAmount ? parseInt(customAmount) : amount) >= rule.minAmount
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => { setAmount(rule.minAmount); setCustomAmount(''); }}
                    >
                      <div className="text-lg font-bold">HK${rule.minAmount}</div>
                      <div className="text-sm text-primary flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        送 HK${rule.bonusAmount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>選擇充值金額</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={amount === amt && !customAmount ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    >
                      HK${amt}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label>自定義金額</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">HK$</span>
                    <Input
                      type="number"
                      placeholder="輸入充值金額"
                      className="pl-12"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min={10}
                      max={50000}
                    />
                  </div>
                </div>

                {bonusAmount > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <Gift className="w-5 h-5 text-primary" />
                    <span>充值滿額贈送 <strong className="text-primary">HK${bonusAmount}</strong></span>
                  </div>
                )}

                <Separator />

                <div>
                  <Label>選擇支付方式</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.value}
                          className={`flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                            paymentMethod === method.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setPaymentMethod(method.value)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{method.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>充值金額</span>
                    <span>HK${customAmount || amount}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div className="flex justify-between mb-2 text-primary">
                      <span>贈送金額</span>
                      <span>+HK${bonusAmount}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>實際到賬</span>
                    <span className="text-primary">HK${(parseInt(customAmount || amount.toString()) + bonusAmount).toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />充值中...</> : '立即充值'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="mt-4">
            <Card>
              <CardHeader><CardTitle>充值記錄</CardTitle></CardHeader>
              <CardContent>
                {rechargeRecords.length > 0 ? (
                  <div className="space-y-4">
                    {rechargeRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">HK${record.amount}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.recharge_no}
                            {record.bonus_amount > 0 && <Badge variant="secondary" className="ml-2">贈送HK${record.bonus_amount}</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(record.created_at).toLocaleString('zh-TW')}</div>
                        </div>
                        <Badge variant={record.status === 'success' ? 'default' : 'secondary'}>
                          {record.status === 'success' ? '成功' : '處理中'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">暫無充值記錄</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader><CardTitle>餘額明細</CardTitle></CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className={`font-medium ${typeLabels[tx.type]?.color || ''}`}>{typeLabels[tx.type]?.label || tx.type}</div>
                          <div className="text-sm text-muted-foreground">{tx.remark}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(tx.created_at).toLocaleString('zh-TW')}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount >= 0 ? '+' : ''}HK${tx.amount}
                          </div>
                          <div className="text-xs text-muted-foreground">餘額: HK${tx.balance_after}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">暫無餘額變動記錄</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </UserLayout>
  );
}
