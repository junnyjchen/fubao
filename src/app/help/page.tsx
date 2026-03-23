/**
 * @fileoverview 帮助中心页面
 * @description 提供用户帮助和常见问题解答
 * @module app/help/page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  Search,
  ShoppingCart,
  CreditCard,
  Package,
  User,
  Shield,
  Truck,
  ArrowRight,
  MessageCircle,
  Mail,
  Phone,
} from 'lucide-react';

// 帮助分类
const helpCategories = [
  {
    icon: ShoppingCart,
    title: '購物指南',
    description: '了解如何選購商品',
    href: '/help/shopping',
    articles: 12,
  },
  {
    icon: CreditCard,
    title: '支付問題',
    description: '支付方式和支付流程',
    href: '/help/payment',
    articles: 8,
  },
  {
    icon: Truck,
    title: '配送說明',
    description: '物流配送相關問題',
    href: '/help/shipping',
    articles: 6,
  },
  {
    icon: Package,
    title: '售後服務',
    description: '退換貨和售後保障',
    href: '/help/after-sales',
    articles: 10,
  },
  {
    icon: User,
    title: '賬號管理',
    description: '賬號註冊和安全設置',
    href: '/help/account',
    articles: 8,
  },
  {
    icon: Shield,
    title: '安全保障',
    description: '交易安全和隱私保護',
    href: '/help/security',
    articles: 5,
  },
];

// 常见问题
const faqItems = [
  {
    category: '購物相關',
    questions: [
      {
        q: '如何購買商品？',
        a: '您可以在商城瀏覽商品，選擇心儀的商品加入購物車，然後在購物車中確認訂單信息，選擇支付方式完成支付即可。支持支付寶、微信支付、PayPal等多種支付方式。',
      },
      {
        q: '商品是否正品保證？',
        a: '符寶網所有入駐商戶都經過嚴格審核，認證商品均配有「一物一證」防偽證書，您可以通過掃描證書上的二維碼查驗真偽。',
      },
      {
        q: '什麼是「一物一證」？',
        a: '「一物一證」是符寶網的特色認證服務，每件認證商品都有唯一的防偽證書，記錄商品的來源、材質、製作工藝等信息，確保商品的真實性和收藏價值。',
      },
    ],
  },
  {
    category: '支付相關',
    questions: [
      {
        q: '支持哪些支付方式？',
        a: '目前支持PayPal國際支付，後續將陸續開通支付寶、微信支付等更多支付方式。',
      },
      {
        q: '支付失敗怎麼辦？',
        a: '請檢查您的網絡連接和支付賬戶狀態，確認支付金額是否正確。如仍有問題，請聯繫客服獲取幫助。',
      },
      {
        q: '如何申請退款？',
        a: '在訂單詳情頁點擊「申請退款」，填寫退款原因後提交申請。我們會在1-3個工作日內處理您的申請。',
      },
    ],
  },
  {
    category: '配送相關',
    questions: [
      {
        q: '配送範圍是哪些地區？',
        a: '我們支持全球配送，香港、澳門、台灣地區一般2-5個工作日送達，其他國家和地區根據具體地址確定配送時間。',
      },
      {
        q: '運費如何計算？',
        a: '訂單金額滿HK$500即可享受免運費服務，未滿則收取HK$30運費。偏遠地區可能需要額外運費。',
      },
      {
        q: '如何查看物流信息？',
        a: '在「我的訂單」中選擇相應訂單，點擊「查看物流」即可查看實時物流狀態。',
      },
    ],
  },
  {
    category: '售後相關',
    questions: [
      {
        q: '退換貨政策是什麼？',
        a: '收到商品後7天內，如商品存在質量問題或與描述不符，可申請退換貨。認證商品需保持原包裝和證書完整。',
      },
      {
        q: '如何聯繫客服？',
        a: '您可以通過在線客服、郵件support@fubao.ltd或客服熱線與我們聯繫，工作時間為週一至週五 9:00-18:00。',
      },
    ],
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">幫助中心</h1>
          <p className="text-lg opacity-80 mb-8">
            有問題？我們隨時為您解答
          </p>
          
          {/* 搜索框 */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索問題..."
              className="pl-12 h-12 bg-background text-foreground"
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 帮助分类 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">選擇問題類型</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.href} href={category.href}>
                  <Card className="h-full hover:shadow-md transition-all hover:border-primary/30 group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {category.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.articles} 篇文章
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">常見問題</h2>
          <div className="max-w-3xl mx-auto">
            {faqItems.map((category, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  {category.category}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIndex) => (
                    <AccordionItem key={qIndex} value={`${index}-${qIndex}`}>
                      <AccordionTrigger className="text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* 联系我们 */}
        <section>
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">還沒找到答案？</CardTitle>
              <CardDescription>
                我們的客服團隊隨時為您服務
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">在線客服</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    即時解答您的問題
                  </p>
                  <Button variant="outline" size="sm">
                    開始對話
                  </Button>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">郵件支持</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    support@fubao.ltd
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@fubao.ltd">發送郵件</a>
                  </Button>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">客服熱線</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    週一至週五 9:00-18:00
                  </p>
                  <p className="text-sm font-medium text-primary">
                    +852 XXXX XXXX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
