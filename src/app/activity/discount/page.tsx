/**
 * @fileoverview 满减优惠活动页面
 * @description 满额立减优惠活动
 * @module app/activity/discount/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gift,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Tag,
  Heart,
  ChevronLeft,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { ShareButton } from '@/components/free-gifts/ShareButton';

/** 满减规则 */
interface DiscountRule {
  id: number;
  min_amount: number;
  discount_amount: number;
  description: string;
}

/** 参与商品 */
interface DiscountGoods {
  id: number;
  name: string;
  main_image: string | null;
  price: string;
  original_price: string | null;
  sales: number;
  merchants?: { name: string } | null;
}

/** 收藏状态 */
interface FavoriteState {
  [key: number]: boolean;
}

/** 购物车金额统计 */
interface CartSummary {
  total: number;
  discount: number;
  finalAmount: number;
}

/**
 * 满减优惠活动页面组件
 */
export default function DiscountPage() {
  const [goods, setGoods] = useState<DiscountGoods[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<FavoriteState>({});
  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);
  const [calculatorAmount, setCalculatorAmount] = useState<string>('');

  // 满减规则
  const discountRules: DiscountRule[] = [
    { id: 1, min_amount: 200, discount_amount: 20, description: '滿200減20' },
    { id: 2, min_amount: 500, discount_amount: 60, description: '滿500減60' },
    { id: 3, min_amount: 1000, discount_amount: 150, description: '滿1000減150' },
    { id: 4, min_amount: 2000, discount_amount: 400, description: '滿2000減400' },
  ];

  useEffect(() => {
    loadGoods();
  }, [activeCategory]);

  const loadGoods = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '12' });
      if (activeCategory !== 'all') {
        params.set('category', activeCategory);
      }
      
      const res = await fetch(`/api/goods?${params.toString()}`);
      const data = await res.json();
      setGoods(data.data || []);
    } catch (error) {
      console.error('加载商品失败:', error);
      setGoods(getMockGoods());
    } finally {
      setLoading(false);
    }
  };

  // 加入购物车
  const handleAddToCart = async (goodsId: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goodsId, quantity: 1 }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('已加入購物車');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      toast.error('操作失敗，請重試');
    }
  };

  // 切换收藏
  const handleToggleFavorite = async (item: DiscountGoods) => {
    setFavoriteLoading(item.id);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const isFavorited = favorites[item.id];
    setFavorites(prev => ({
      ...prev,
      [item.id]: !prev[item.id]
    }));
    setFavoriteLoading(null);
    
    toast.success(isFavorited ? '已取消收藏' : '已添加收藏');
  };

  // 计算折扣
  const calculateDiscount = (amount: number): CartSummary => {
    let discount = 0;
    
    // 找到最大符合条件的满减规则
    for (let i = discountRules.length - 1; i >= 0; i--) {
      if (amount >= discountRules[i].min_amount) {
        discount = discountRules[i].discount_amount;
        break;
      }
    }
    
    return {
      total: amount,
      discount,
      finalAmount: Math.max(0, amount - discount)
    };
  };

  // 当前计算的优惠
  const currentCalculation = calculatorAmount ? calculateDiscount(parseFloat(calculatorAmount) || 0) : null;

  // 模拟数据
  function getMockGoods(): DiscountGoods[] {
    return [
      {
        id: 1,
        name: '太上老君鎮宅符',
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        price: '388.00',
        original_price: '488.00',
        sales: 1256,
        merchants: { name: '龍虎山道觀法物店' },
      },
      {
        id: 2,
        name: '五雷護身符',
        main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
        price: '288.00',
        original_price: '358.00',
        sales: 2080,
        merchants: { name: '龍虎山道觀法物店' },
      },
      {
        id: 3,
        name: '桃木七星劍',
        main_image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
        price: '1280.00',
        original_price: '1580.00',
        sales: 458,
        merchants: { name: '龍虎山道觀法物店' },
      },
      {
        id: 4,
        name: '武當檀香唸珠',
        main_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
        price: '688.00',
        original_price: '888.00',
        sales: 856,
        merchants: { name: '武當山法器專營' },
      },
    ];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-background">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12 relative">
        {/* 返回按钮 */}
        <Link href="/activity" className="absolute left-4 top-4 md:left-8 md:top-6">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回活動中心
          </Button>
        </Link>
        
        {/* 分享按钮 */}
        <div className="absolute right-4 top-4 md:right-8 md:top-6">
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title="滿減優惠活動"
            description="滿額立減，多買多減！"
            variant="ghost"
            size="sm"
            showText={false}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tag className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">滿減優惠</h1>
          </div>
          <p className="text-center text-orange-100 mb-8">
            滿額立減，多買多減，優惠享不停
          </p>
          
          {/* 满减规则展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {discountRules.map((rule) => (
              <Card key={rule.id} className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    滿{rule.min_amount}
                  </div>
                  <div className="text-lg">
                    減{rule.discount_amount}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 优惠说明 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 mb-1">優惠說明</p>
                  <ul className="text-orange-700 space-y-1">
                    <li>• 活動期間，全場商品參與滿減優惠</li>
                    <li>• 滿減金額自動抵扣，無需領取優惠券</li>
                    <li>• 可與店鋪優惠券疊加使用</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 优惠计算器 */}
          <Card className="bg-gradient-to-r from-orange-100 to-amber-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calculator className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-800 mb-2">優惠試算</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-orange-700">輸入金額：</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">HK$</span>
                      <input
                        type="number"
                        value={calculatorAmount}
                        onChange={(e) => setCalculatorAmount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </div>
                  </div>
                  {currentCalculation && currentCalculation.total > 0 && (
                    <div className="bg-white/80 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">商品金額</span>
                        <span>HK${currentCalculation.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">滿減優惠</span>
                        <span className="text-red-500">-HK${currentCalculation.discount.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>實付金額</span>
                        <span className="text-orange-600">HK${currentCalculation.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {currentCalculation && currentCalculation.discount === 0 && currentCalculation.total > 0 && (
                    <p className="text-xs text-orange-600 mt-2">
                      再購買 HK${(200 - currentCalculation.total).toFixed(2)} 即可享受滿減優惠
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 商品分类 */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="fulu">符籙</TabsTrigger>
            <TabsTrigger value="faqie">法器</TabsTrigger>
            <TabsTrigger value="nianzhu">唸珠</TabsTrigger>
            <TabsTrigger value="jingshu">經書</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 商品列表 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {goods.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative aspect-square bg-muted">
                  {item.main_image ? (
                    <Image
                      src={item.main_image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-100 to-orange-50">
                      <Gift className="w-16 h-16 text-orange-300" />
                    </div>
                  )}
                  
                  {/* 满减标签 */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-orange-500 text-white">
                      <Tag className="w-3 h-3 mr-1" />
                      滿減
                    </Badge>
                  </div>
                  
                  {/* 收藏按钮 */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleToggleFavorite(item)}
                    disabled={favoriteLoading === item.id}
                  >
                    {favoriteLoading === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : favorites[item.id] ? (
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <Link href={`/shop/${item.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {/* 价格 */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-orange-600">
                      HK${item.price}
                    </span>
                    {item.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        HK${item.original_price}
                      </span>
                    )}
                  </div>
                  
                  {/* 店铺 */}
                  {item.merchants && (
                    <div className="text-xs text-muted-foreground mb-3">
                      {item.merchants.name}
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => handleAddToCart(item.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    加入購物車
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* 查看更多 */}
        <div className="text-center mt-8">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              查看更多商品
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 活动规则 */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">活動規則</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>1. 活動期間，訂單滿足條件自動享受滿減優惠；</li>
              <li>2. 滿減金額不設上限，訂單金額越高優惠越多；</li>
              <li>3. 滿減優惠可與店鋪優惠券疊加使用；</li>
              <li>4. 如訂單發生退貨，按實際支付金額退款；</li>
              <li>5. 本活動最終解釋權歸平台所有。</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
