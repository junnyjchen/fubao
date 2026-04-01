'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronLeft,
  Shield, 
  Lock,
  Eye,
  FileCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SecurityHelpPage() {
  const { t, isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const securityFeatures = [
    {
      icon: Lock,
      title: '數據加密',
      description: '所有敏感數據採用AES-256加密存儲',
    },
    {
      icon: Shield,
      title: 'SSL安全傳輸',
      description: '全站HTTPS加密傳輸，防止數據截取',
    },
    {
      icon: Eye,
      title: '隱私保護',
      description: '嚴格遵守隱私政策，不對外洩露用戶信息',
    },
    {
      icon: FileCheck,
      title: '實名認證',
      description: '商戶實名認證，確保交易真實可靠',
    },
  ];

  const transactionSafety = [
    {
      title: '平台擔保',
      description: '買家付款後資金由平台託管，確認收貨後才會打給商戶，確保交易安全。',
      icon: '🔐',
    },
    {
      title: '一物一證',
      description: '認證商品配有唯一防偽證書，可掃碼查驗真偽，杜絕假貨。',
      icon: '📜',
    },
    {
      title: '退款保障',
      description: '符合條件的訂單支持7天無理由退換，平台介入處理糾紛。',
      icon: '💰',
    },
    {
      title: '商戶審核',
      description: '入駐商戶經過嚴格審核，確保經營資質和商品質量。',
      icon: '✅',
    },
  ];

  const faqs = [
    {
      question: '平台如何保護我的個人信息？',
      answer: '我們嚴格遵守隱私政策，所有個人信息均加密存儲，不會向第三方洩露。您可以在「隱私設置」中管理您的信息授權。',
    },
    {
      question: '支付安全嗎？',
      answer: '我們採用銀行級加密技術，所有支付信息均通過SSL加密傳輸。同時，支付環節由第三方支付平台處理，我們不會存儲您的銀行卡信息。',
    },
    {
      question: '如何識別釣魚網站？',
      answer: '請確認網站地址為 fubao.ltd，注意檢查瀏覽器地址欄的安全鎖圖標。我們不會通過郵件或短信要求您提供密碼或銀行卡信息。',
    },
    {
      question: '遇到詐騙怎麼辦？',
      answer: '如發現可疑交易或收到詐騙信息，請立即聯繫客服並保留相關證據。我們會協助您核實情況，必要時會配合執法機關處理。',
    },
    {
      question: '如何舉報違規商戶？',
      answer: '在商戶頁面點擊「舉報」按鈕，填寫舉報原因並提交。我們會在24小時內審核處理，並對違規商戶進行處罰。',
    },
  ];

  const fraudPrevention = [
    '不要相信「低價代購」等非官方渠道',
    '不要點擊來歷不明的鏈接',
    '不要向任何人透露您的密碼或驗證碼',
    '收到可疑消息請先核實發送方身份',
    '發現異常請立即聯繫客服',
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
        <span className="text-foreground">{t.helpPages.security.title}</span>
      </nav>

      <div className={`max-w-4xl mx-auto ${animationClass}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t.helpPages.security.title}</h1>
          <p className="text-muted-foreground">{t.helpPages.security.subtitle}</p>
        </div>

        {/* Security Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">安全技術</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-5">
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <h3 className="font-medium mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Transaction Safety */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">交易保障</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {transactionSafety.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">{item.icon}</span>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Fraud Prevention */}
        <section className="mb-12">
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <CardContent className="p-6">
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-semibold mb-3 text-red-800 dark:text-red-200">防詐騙提示</h3>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    {fraudPrevention.map((tip, index) => (
                      <li key={index} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
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
          <Button asChild>
            <Link href="/contact">{t.helpPages.account.contactButton}</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
