'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  User, 
  Lock,
  Shield,
  Key,
  Smartphone,
  Mail,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function AccountHelpPage() {
  const accountFeatures = [
    {
      icon: User,
      title: '個人資料',
      description: '修改暱稱、頭像、個人簡介',
      path: '/user/settings',
    },
    {
      icon: Lock,
      title: '密碼管理',
      description: '修改登錄密碼',
      path: '/user/settings',
    },
    {
      icon: Mail,
      title: '郵箱綁定',
      description: '綁定或更換郵箱地址',
      path: '/user/settings',
    },
    {
      icon: Smartphone,
      title: '手機綁定',
      description: '綁定或更換手機號碼',
      path: '/user/settings',
    },
    {
      icon: Key,
      title: '支付密碼',
      description: '設置支付密碼',
      path: '/user/settings',
    },
    {
      icon: Shield,
      title: '賬號安全',
      description: '查看賬號安全狀態',
      path: '/user/settings',
    },
  ];

  const faqs = [
    {
      question: '如何註冊賬號？',
      answer: '點擊頁面右上角「登錄」按鈕，選擇「註註冊」，輸入郵箱地址和密碼即可完成註冊。我們會向您的郵箱發送驗證郵件，請點擊郵件中的鏈接完成驗證。',
    },
    {
      question: '忘記密碼怎麼辦？',
      answer: '在登錄頁面點擊「忘記密碼」，輸入註冊時使用的郵箱地址，我們會發送密碼重置鏈接到您的郵箱。鏈接有效期為24小時。',
    },
    {
      question: '如何更換綁定的手機號？',
      answer: '進入「個人中心」>「賬號設置」>「手機綁定」，先驗證原手機號，再綁定新手機號。如原手機號已無法使用，請聯繫客服協助處理。',
    },
    {
      question: '賬號被盜怎麼辦？',
      answer: '如發現賬號異常，請立即修改密碼並聯繫客服。我們會協助您核實情況，凍結賬號並進行安全處理。建議開啟二次驗證以增強賬號安全。',
    },
    {
      question: '如何註銷賬號？',
      answer: '進入「個人中心」>「賬號設置」>「賬號安全」>「註銷賬號」。註銷前請確保賬號內無未完成的訂單和餘額。賬號註銷後數據將無法恢復，請謹慎操作。',
    },
    {
      question: '可以合併多個賬號嗎？',
      answer: '目前不支持賬號合併。建議您使用同一賬號登錄，將常用賬號設為主賬號使用。',
    },
  ];

  const securityTips = [
    '定期更換密碼，使用強密碼（字母+數字+符號）',
    '不要在公共電腦上保存登錄狀態',
    '開啟二次驗證，增加賬號安全性',
    '警惕釣魚網站，確認網站地址是否正確',
    '不要將賬號密碼告知他人',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">首頁</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/help" className="hover:text-foreground">幫助中心</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">賬號管理</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">賬號管理</h1>
          <p className="text-muted-foreground">管理您的賬號信息與安全設置</p>
        </div>

        {/* Account Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">賬號功能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-medium">{feature.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Security Tips */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-3">賬號安全提示</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {securityTips.map((tip, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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
          <p className="text-muted-foreground mb-4">賬號問題無法解決？</p>
          <Button asChild>
            <Link href="/contact">聯繫客服</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
