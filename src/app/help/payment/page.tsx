'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  CreditCard, 
  Wallet, 
  Smartphone,
  Shield,
  Clock,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function PaymentHelpPage() {
  const { t } = useI18n();

  const paymentMethods = [
    {
      icon: CreditCard,
      name: '信用卡/借記卡',
      description: '支持Visa、MasterCard、銀聯等主流銀行卡',
      fee: '免手續費',
      time: '即時到賬',
      supported: ['Visa', 'MasterCard', '銀聯', 'JCB'],
    },
    {
      icon: Wallet,
      name: 'PayPal',
      description: '全球領先的在線支付平台',
      fee: '免手續費',
      time: '即時到賬',
      supported: ['全球賬戶'],
    },
    {
      icon: Smartphone,
      name: '微信支付',
      description: '掃碼支付，方便快捷',
      fee: '免手續費',
      time: '即時到賬',
      supported: ['微信App'],
    },
    {
      icon: Smartphone,
      name: '支付寶',
      description: '支付寶掃碼或在線支付',
      fee: '免手續費',
      time: '即時到賬',
      supported: ['支付寶App'],
    },
  ];

  const faqs = [
    {
      question: '支付失敗怎麼辦？',
      answer: '請檢查您的銀行卡餘額是否充足，或嘗試更換支付方式。如問題持續，請聯繫客服協助處理。',
    },
    {
      question: '支持哪些貨幣？',
      answer: '平台支持港幣(HKD)、人民幣(CNY)、美元(USD)三種貨幣結算，系統會根據您的所在地自動選擇默認貨幣。',
    },
    {
      question: '付款後多久能看到訂單？',
      answer: '正常情況下，支付成功後訂單會即時更新。如超過5分鐘仍未更新，請聯繫客服核實。',
    },
    {
      question: '是否支持分期付款？',
      answer: '部分商品支持分期付款，具體以商品詳情頁標注為準。分期付款需使用指定銀行信用卡。',
    },
    {
      question: '支付安全嗎？',
      answer: '平台採用銀行級加密技術，所有支付信息均經過SSL加密傳輸，確保您的資金安全。',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">首頁</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/help" className="hover:text-foreground">幫助中心</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">支付問題</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">支付問題</h1>
          <p className="text-muted-foreground">了解平台支持的支付方式及常見問題解答</p>
        </div>

        {/* Payment Methods */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            支持的支付方式
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{method.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {method.supported.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {method.fee}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {method.time}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Security Info */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">支付安全保障</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      採用256位SSL加密傳輸，確保數據安全
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      PCI-DSS認證，符合國際支付安全標準
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      平台擔保交易，資金安全有保障
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      異常交易實時監控，主動防範風險
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            常見問題
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">還有其他問題？</p>
          <Button asChild>
            <Link href="/contact">聯繫客服</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
