'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronLeft,
  RefreshCw, 
  Shield, 
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function AfterSalesHelpPage() {
  const { t, isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const returnPolicy = {
    eligible: [
      '收到商品後7天內，商品存在質量問題',
      '商品與描述嚴重不符',
      '商品在運輸過程中損壞（需提供照片證明）',
      '發錯商品或商品缺失',
    ],
    ineligible: [
      '超過7天退換貨期限',
      '已使用或人為損壞的商品',
      '定製類商品（特殊開光加持等）',
      '無原包裝或包裝嚴重破損',
      '符箓類商品（因宗教特殊性，一經使用不支持退換）',
    ],
  };

  const processSteps = [
    {
      step: 1,
      title: '提交申請',
      description: '在我的訂單中選擇需要售後的訂單，提交申請',
      action: '填寫退換原因',
    },
    {
      step: 2,
      title: '客服審核',
      description: '客服會在24小時內審核您的申請',
      action: '等待審核結果',
    },
    {
      step: 3,
      title: '寄回商品',
      description: '審核通過後，按要求寄回商品',
      action: '保留物流單號',
    },
    {
      step: 4,
      title: '驗收確認',
      description: '收到商品後進行質量驗收',
      action: '1-3個工作日',
    },
    {
      step: 5,
      title: '退款/換貨',
      description: '驗收通過後辦理退款或發貨新商品',
      action: '1-7個工作日',
    },
  ];

  const refundMethods = [
    {
      method: '原路退回',
      description: '退款至原支付賬戶',
      time: '1-7個工作日',
      fee: '無手續費',
    },
    {
      method: '賬戶餘額',
      description: '退款至平台賬戶餘額',
      time: '即時到賬',
      fee: '無手續費',
    },
  ];

  const faqs = [
    {
      question: '退換貨需要承擔運費嗎？',
      answer: '如因商品質量問題或平台原因導致的退換，運費由平台承擔。如因個人原因退換，運費由買家承擔。',
    },
    {
      question: '退款多久能到賬？',
      answer: '退款至賬戶餘額即時到賬；退款至原支付賬戶需1-7個工作日，具體時間取決於支付方式和銀行處理速度。',
    },
    {
      question: '符箓類商品可以退換嗎？',
      answer: '符箓類商品因其宗教特殊性，一經使用或開光，不支持退換。如商品存在質量問題（如印刷錯誤、損壞等），可申請售後處理。',
    },
    {
      question: '如何申請開光證書補發？',
      answer: '如開光證書丟失，可憑訂單號申請補發。補發證書需支付工本費（郵寄費另計），具體請聯繫客服辦理。',
    },
    {
      question: '商品損壞如何理賠？',
      answer: '如商品在運輸過程中損壞，請在簽收時當場拍照留證並拒收。如已簽收，請在24小時內聯繫客服，提供照片證明，我們會協助您進行理賠。',
    },
  ];

  // RTL 辅助变量
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // 动画样式
  const animationClass = mounted ? 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500' : 'opacity-0';

  return (
    <div 
      className="container mx-auto px-4 py-8"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Breadcrumb */}
      <nav 
        className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 ${animationClass}`}
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-foreground">{t.nav.home}</Link>
        <ChevronIcon className="w-4 h-4" />
        <Link href="/help" className="hover:text-foreground">{t.nav.help}</Link>
        <ChevronIcon className="w-4 h-4" />
        <span className="text-foreground">{t.helpPages.afterSales.title}</span>
      </nav>

      <div className={`max-w-4xl mx-auto ${animationClass}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <RefreshCw className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t.helpPages.afterSales.title}</h1>
          <p className="text-muted-foreground">{t.helpPages.afterSales.subtitle}</p>
        </div>

        {/* Service Guarantee */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">7天無理由</h3>
                <p className="text-sm text-muted-foreground">符合條件可享7天退換</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">快速響應</h3>
                <p className="text-sm text-muted-foreground">24小時內審核處理</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">專屬客服</h3>
                <p className="text-sm text-muted-foreground">一對一售後服務</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Return Policy */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">退換貨政策</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Eligible */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-green-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CheckCircle className="w-5 h-5" />
                  支持退換
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {returnPolicy.eligible.map((item, index) => (
                    <li key={index} className={`flex items-start gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={isRTL ? 'text-right' : ''}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Ineligible */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <XCircle className="w-5 h-5" />
                  不支持退換
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {returnPolicy.ineligible.map((item, index) => (
                    <li key={index} className={`flex items-start gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className={isRTL ? 'text-right' : ''}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Process */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">售後流程</h2>
          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <div key={index} className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div className={`flex-1 border-b pb-4 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge variant="outline" className="text-xs">{step.action}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Refund Methods */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">退款方式</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {refundMethods.map((method, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>{method.method}</h4>
                  <p className={`text-sm text-muted-foreground mb-3 ${isRTL ? 'text-right' : ''}`}>{method.description}</p>
                  <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {method.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {method.fee}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Special Notice */}
        <section className="mb-12">
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardContent className="p-6">
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">特殊商品說明</h3>
                  <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <li>• <strong>符箓類商品</strong>：因宗教特殊性，一經開光或使用，不支持退換</li>
                    <li>• <strong>定製類商品</strong>：根據個人需求定製的商品不支持無理由退換</li>
                    <li>• <strong>開光物品</strong>：開光後的商品不支持退換，請在開光前確認需求</li>
                    <li>• <strong>書籍音像</strong>：已拆封的書籍、音像製品不支持退換</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <HelpCircle className="w-5 h-5 text-primary" />
            常見問題
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>{faq.question}</h4>
                  <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">{t.helpPages.account.contactSupport}</p>
          <div className={`flex justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button asChild>
              <Link href="/user">{t.user.orders}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">{t.helpPages.account.contactButton}</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
