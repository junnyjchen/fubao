'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Gift,
  Coins,
  Zap,
  Clock,
  Trophy,
  Star,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface PointsProduct {
  id: number;
  name: string;
  image: string | null;
  points: number;
  stock: number;
  sold: number;
  category: string;
  hot?: boolean;
  new?: boolean;
}

export default function PointsMallPage() {
  const { t, isRTL } = useI18n();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PointsProduct[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: '開光平安符',
          image: null,
          points: 500,
          stock: 100,
          sold: 234,
          category: 'fuji',
          hot: true,
        },
        {
          id: 2,
          name: '招財進寶符',
          image: null,
          points: 800,
          stock: 50,
          sold: 156,
          category: 'fuji',
        },
        {
          id: 3,
          name: '道家文化書籍套裝',
          image: null,
          points: 2000,
          stock: 30,
          sold: 89,
          category: 'book',
          new: true,
        },
        {
          id: 4,
          name: '開光朱砂手串',
          image: null,
          points: 3000,
          stock: 20,
          sold: 67,
          category: 'accessory',
          hot: true,
        },
        {
          id: 5,
          name: '會員專屬積分券',
          image: null,
          points: 100,
          stock: 999,
          sold: 1234,
          category: 'coupon',
        },
        {
          id: 6,
          name: '免費配送券',
          image: null,
          points: 200,
          stock: 500,
          sold: 876,
          category: 'coupon',
        },
        {
          id: 7,
          name: '道教文化掛畫',
          image: null,
          points: 5000,
          stock: 10,
          sold: 23,
          category: 'art',
        },
        {
          id: 8,
          name: '法器模型摆件',
          image: null,
          points: 1500,
          stock: 25,
          sold: 45,
          category: 'art',
          new: true,
        },
      ]);
      setUserPoints(2800);
      setLoading(false);
    }, 500);
  }, []);

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'fuji', name: '符籙' },
    { id: 'coupon', name: '優惠券' },
    { id: 'book', name: '書籍' },
    { id: 'accessory', name: '飾品' },
    { id: 'art', name: '藝術品' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const rankingProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">積分商城</h1>
                <p className="text-white/80">用積分兌換心儀好禮</p>
              </div>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-6 py-4">
              <div className="flex items-center gap-2 justify-center">
                <Coins className="w-6 h-6" />
                <span className="text-3xl font-bold">{userPoints.toLocaleString()}</span>
              </div>
              <p className="text-sm text-white/80 mt-1">我的積分</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側：商品列表 */}
          <div className="lg:col-span-3">
            {/* 分類導航 */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className={activeCategory === cat.id ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 商品網格 */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-40 w-full rounded-none" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative aspect-square bg-muted">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
                          <Gift className="w-12 h-12 text-emerald-400" />
                        </div>
                      )}
                      {product.hot && (
                        <Badge className="absolute top-2 start-2 bg-red-500 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          熱銷
                        </Badge>
                      )}
                      {product.new && (
                        <Badge className="absolute top-2 end-2 bg-emerald-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          新品
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-lg font-bold text-amber-600">
                          {product.points.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>庫存 {product.stock}</span>
                        <span>已兌 {product.sold}</span>
                      </div>
                      <Button
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                        size="sm"
                        disabled={userPoints < product.points}
                      >
                        {userPoints < product.points ? '積分不足' : '立即兌換'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">暫無商品</p>
              </div>
            )}
          </div>

          {/* 右側：熱銷排行 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  熱銷排行
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rankingProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Coins className="w-3 h-3" />
                        {product.points}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 積分規則 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4" />
                  積分規則
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 每消費 HK$1 獲得 1 積分</p>
                <p>• 評論商品獲得 10 積分</p>
                <p>• 邀請好友註冊獲得 100 積分</p>
                <p>• 積分有效期為 12 個月</p>
                <p>• 積分不可兌換現金</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
