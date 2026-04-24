'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Star,
  Check,
  Gift,
  TrendingUp,
  Zap,
  Shield,
  Users,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface VipLevel {
  level: number;
  name: string;
  nameEn: string;
  color: string;
  bgColor: string;
  icon: string;
  price: number;
  originalPrice: number;
  benefits: string[];
  highlighted?: boolean;
}

export default function VipPage() {
  const { t, isRTL } = useI18n();
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const vipLevels: VipLevel[] = [
    {
      level: 1,
      name: '普通會員',
      nameEn: 'Member',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      icon: 'M',
      price: 0,
      originalPrice: 0,
      benefits: [
        '基礎購物權限',
        '積分累計',
        '生日禮遇',
      ],
    },
    {
      level: 2,
      name: '白銀會員',
      nameEn: 'Silver',
      color: 'text-gray-400',
      bgColor: 'bg-gradient-to-br from-gray-200 to-gray-300',
      icon: 'S',
      price: 199,
      originalPrice: 299,
      benefits: [
        '普通會員全部權限',
        '9.8折購物優惠',
        '專屬客服通道',
        '免費配送服務',
        '生日雙倍積分',
      ],
    },
    {
      level: 3,
      name: '黃金會員',
      nameEn: 'Gold',
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      icon: 'G',
      price: 599,
      originalPrice: 899,
      benefits: [
        '白銀會員全部權限',
        '9.5折購物優惠',
        '限量商品搶購權',
        '優先發貨',
        '專屬禮品包',
        '年度體檢服務',
      ],
    },
    {
      level: 4,
      name: '鑽石會員',
      nameEn: 'Diamond',
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-400 to-purple-500',
      icon: 'D',
      price: 1999,
      originalPrice: 2999,
      benefits: [
        '黃金會員全部權限',
        '9折購物優惠',
        '一對一專屬顧問',
        '免費使用所有付費功能',
        '線下活動優先權',
        '終身會員資格',
        '商務接待服務',
      ],
      highlighted: true,
    },
  ];

  const privileges = [
    {
      icon: Crown,
      title: '專屬折扣',
      desc: '全場商品專屬會員折扣',
    },
    {
      icon: Gift,
      title: '生日禮遇',
      desc: '生日當月雙倍積分',
    },
    {
      icon: Zap,
      title: '優先發貨',
      desc: 'VIP優先配貨發貨',
    },
    {
      icon: Shield,
      title: '專屬客服',
      desc: '7x24小時專屬客服',
    },
    {
      icon: Users,
      title: '線下活動',
      desc: '受邀參加線下活動',
    },
    {
      icon: TrendingUp,
      title: '升級有禮',
      desc: '升級時享受特別禮遇',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10" />
            <h1 className="text-3xl font-bold">VIP 會員中心</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            加入 VIP 會員，享受專屬折扣、優先服務和更多特權
          </p>
          {currentLevel > 1 && (
            <Badge className="mt-4 bg-white/20 text-white border-0">
              當前：{vipLevels[currentLevel - 1]?.name}
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 會員特權 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            會員特權
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {privileges.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 等級套餐 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            等級套餐
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vipLevels.map((level) => (
              <Card
                key={level.level}
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  level.highlighted ? 'ring-2 ring-amber-500 scale-105' : ''
                }`}
              >
                {level.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
                    最受歡迎
                  </div>
                )}
                <CardHeader className={`text-center pb-2 ${level.highlighted ? 'pt-12' : ''}`}>
                  <div
                    className={`w-16 h-16 rounded-full ${level.bgColor} ${level.color} flex items-center justify-center text-2xl font-bold mx-auto mb-3`}
                  >
                    {level.icon}
                  </div>
                  <CardTitle className={level.color}>{level.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{level.nameEn}</p>
                </CardHeader>
                <CardContent className="text-center">
                  {level.price > 0 ? (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">HK${level.price}</span>
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        HK${level.originalPrice}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">/年</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-muted-foreground">免費</span>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <ul className="space-y-2 text-left">
                    {level.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${
                      level.level <= currentLevel
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : level.highlighted
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                        : ''
                    }`}
                    disabled={level.level <= currentLevel}
                    asChild={level.level > currentLevel}
                  >
                    {level.level <= currentLevel ? (
                      <span>已擁有</span>
                    ) : (
                      <Link href={`/checkout?vip=${level.level}`}>
                        立即開通
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 常見問題 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">常見問題</h2>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">VIP會員有效期是多久？</h3>
                <p className="text-sm text-muted-foreground">
                  VIP會員有效期為1年，從開通之日起計算。期滿後可續費繼續享受會員特權。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">升級會員後可以退款嗎？</h3>
                <p className="text-sm text-muted-foreground">
                  升級會員後7天內如未使用任何會員特權，可申請全額退款。超過7天或已使用特權，不予退款。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">會員折扣可以與其他優惠叠加嗎？</h3>
                <p className="text-sm text-muted-foreground">
                  會員折扣通常可與積分抵扣、優惠券叠加使用，但不與限時特價商品同享。具體以商品頁面展示為準。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
