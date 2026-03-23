/**
 * @fileoverview 购物指南页面
 * @description 帮助用户了解购物流程
 * @module app/help/shopping/page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Heart,
  CreditCard,
  CheckCircle,
  Package,
  ArrowRight,
} from 'lucide-react';

const shoppingSteps = [
  {
    step: 1,
    icon: Search,
    title: '搜索商品',
    description: '在商城頁面使用搜索功能，或通過分類瀏覽找到您心儀的商品。您可以根據商品類型、用途、價格等條件進行篩選。',
  },
  {
    step: 2,
    icon: Heart,
    title: '選擇商品',
    description: '點擊商品查看詳細信息，包括商品介紹、價格、庫存等。認證商品可查看「一物一證」詳情。',
  },
  {
    step: 3,
    icon: ShoppingCart,
    title: '加入購物車',
    description: '選擇商品數量後點擊「加入購物車」，您可以在購物車中修改商品數量或刪除商品。',
  },
  {
    step: 4,
    icon: CreditCard,
    title: '確認訂單',
    description: '在購物車中選擇要購買的商品，點擊「去結算」，填寫收貨信息和選擇支付方式。',
  },
  {
    step: 5,
    icon: CheckCircle,
    title: '完成支付',
    description: '確認訂單信息無誤後，完成支付。訂單支付成功後，商戶將在規定時間內發貨。',
  },
  {
    step: 6,
    icon: Package,
    title: '收貨確認',
    description: '收到商品後，請及時確認收貨並進行評價。如有問題，可在訂單詳情頁申請售後服務。',
  },
];

const tips = [
  {
    title: '關注優惠活動',
    content: '定期查看首頁輪播圖和優惠專區，獲取最新優惠信息。',
  },
  {
    title: '收藏喜歡的商品',
    content: '點擊商品詳情頁的收藏按鈕，方便日後快速找到心儀商品。',
  },
  {
    title: '查看商戶評價',
    content: '購買前可以查看商戶的評分和其他用戶的評價，選擇信譽良好的商戶。',
  },
  {
    title: '確認認證信息',
    content: '購買認證商品時，請仔細核對「一物一證」的證書信息。',
  },
];

export default function ShoppingGuidePage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/help">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">購物指南</h1>
            <p className="text-sm text-muted-foreground">了解如何在符寶網購買商品</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 购物流程 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">購物流程</h2>
          <div className="space-y-4">
            {shoppingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.step}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 购物提示 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">購物小貼士</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {tip.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{tip.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 底部导航 */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Button variant="ghost" asChild>
            <Link href="/help">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回幫助中心
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/help/payment">
              支付問題
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
