/**
 * @fileoverview 积分商城页面
 * @description 使用积分兑换商品或优惠券
 * @module app/points-mall/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Gift,
  Ticket,
  Star,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

/** 积分商品 */
interface PointsGoods {
  id: number;
  name: string;
  type: 'goods' | 'coupon';
  image: string | null;
  points: number;
  original_price: number | null;
  stock: number;
  sales: number;
  description: string | null;
  limit_per_user: number;
}

/** 用户积分信息 */
interface UserPoints {
  points: number;
  level: number;
  total_points: number;
}

/**
 * 积分商城页面组件
 */
export default function PointsMallPage() {
  const [goods, setGoods] = useState<PointsGoods[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints>({ points: 0, level: 1, total_points: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedGoods, setSelectedGoods] = useState<PointsGoods | null>(null);
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);
  const [exchanging, setExchanging] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [goodsRes, pointsRes] = await Promise.all([
        fetch(`/api/points-goods?type=${activeTab}`),
        fetch('/api/user/points'),
      ]);

      const goodsData = await goodsRes.json();
      const pointsData = await pointsRes.json();

      if (goodsData.success || goodsData.data) {
        setGoods(goodsData.data || getMockGoods());
      } else {
        setGoods(getMockGoods());
      }

      setUserPoints({
        points: pointsData.points || 1000,
        level: pointsData.level || 1,
        total_points: pointsData.total_points || 5000,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      setGoods(getMockGoods());
      setUserPoints({ points: 1000, level: 1, total_points: 5000 });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 兑换商品
   */
  const handleExchange = async () => {
    if (!selectedGoods) return;

    if (userPoints.points < selectedGoods.points) {
      toast.error('積分不足');
      return;
    }

    setExchanging(true);
    try {
      const res = await fetch('/api/points-goods/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goods_id: selectedGoods.id }),
      });

      const data = await res.json();
      if (data.success || data.message) {
        toast.success('兌換成功');
        setShowExchangeDialog(false);
        setUserPoints((prev) => ({
          ...prev,
          points: prev.points - selectedGoods.points,
        }));
        loadData();
      } else {
        toast.error(data.error || '兌換失敗');
      }
    } catch (error) {
      console.error('兑换失败:', error);
      toast.error('兌換失敗，請重試');
    } finally {
      setExchanging(false);
    }
  };

  /**
   * 打开兑换对话框
   */
  const openExchangeDialog = (item: PointsGoods) => {
    setSelectedGoods(item);
    setShowExchangeDialog(true);
  };

  /**
   * 模拟数据
   */
  function getMockGoods(): PointsGoods[] {
    return [
      {
        id: 1,
        name: 'HK$50優惠券',
        type: 'coupon',
        image: null,
        points: 500,
        original_price: 50,
        stock: 100,
        sales: 256,
        description: '滿200可用，有效期30天',
        limit_per_user: 3,
      },
      {
        id: 2,
        name: 'HK$100優惠券',
        type: 'coupon',
        image: null,
        points: 900,
        original_price: 100,
        stock: 50,
        sales: 128,
        description: '滿500可用，有效期30天',
        limit_per_user: 2,
      },
      {
        id: 3,
        name: '道教開光手串',
        type: 'goods',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
        points: 2000,
        original_price: 200,
        stock: 20,
        sales: 45,
        description: '開光加持，保平安',
        limit_per_user: 1,
      },
      {
        id: 4,
        name: '符寶定制筆記本',
        type: 'goods',
        image: null,
        points: 800,
        original_price: 80,
        stock: 50,
        sales: 89,
        description: '精美設計，限量發行',
        limit_per_user: 2,
      },
      {
        id: 5,
        name: '9折優惠券',
        type: 'coupon',
        image: null,
        points: 300,
        original_price: null,
        stock: 200,
        sales: 512,
        description: '全場通用，最高減免100',
        limit_per_user: 5,
      },
      {
        id: 6,
        name: '道教文化典藏冊',
        type: 'goods',
        image: null,
        points: 5000,
        original_price: 500,
        stock: 10,
        sales: 23,
        description: '限量典藏版，附贈開光護身符',
        limit_per_user: 1,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">積分商城</h1>
          </div>
          
          {/* 用户积分信息 */}
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">我的積分</p>
                <p className="text-3xl font-bold">{userPoints.points.toLocaleString()}</p>
              </div>
              <Link href="/user/points">
                <Button variant="secondary" size="sm">
                  查看明細
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="mt-3 text-sm text-amber-100">
              累計獲得 {userPoints.total_points.toLocaleString()} 積分
            </div>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="coupon">優惠券</TabsTrigger>
            <TabsTrigger value="goods">實物商品</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 商品列表 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {goods.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative aspect-square bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-amber-100 to-orange-50">
                      {item.type === 'coupon' ? (
                        <Ticket className="w-16 h-16 text-amber-300" />
                      ) : (
                        <Gift className="w-16 h-16 text-amber-300" />
                      )}
                    </div>
                  )}
                  
                  {/* 类型标签 */}
                  <div className="absolute top-2 left-2">
                    <Badge className={item.type === 'coupon' ? 'bg-orange-500' : 'bg-amber-500'}>
                      {item.type === 'coupon' ? '優惠券' : '實物'}
                    </Badge>
                  </div>
                  
                  {/* 库存提示 */}
                  {item.stock <= 10 && item.stock > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="text-xs">
                        僅剩{item.stock}件
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                    {item.name}
                  </h3>
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                  
                  {/* 积分价格 */}
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-lg font-bold text-amber-600">
                      {item.points.toLocaleString()}
                    </span>
                    {item.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        HK${item.original_price}
                      </span>
                    )}
                  </div>
                  
                  {/* 限购提示 */}
                  <div className="text-xs text-muted-foreground mb-3">
                    限兌 {item.limit_per_user} 件 | 已兌 {item.sales}
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => openExchangeDialog(item)}
                    disabled={item.stock <= 0 || userPoints.points < item.points}
                  >
                    {item.stock <= 0 ? '已兌完' : userPoints.points < item.points ? '積分不足' : '立即兌換'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 兑换确认对话框 */}
      <Dialog open={showExchangeDialog} onOpenChange={setShowExchangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認兌換</DialogTitle>
            <DialogDescription>
              您確定要兌換此商品嗎？
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoods && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-16 h-16 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                  {selectedGoods.type === 'coupon' ? (
                    <Ticket className="w-8 h-8 text-amber-500" />
                  ) : (
                    <Gift className="w-8 h-8 text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedGoods.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-amber-600">
                      {selectedGoods.points.toLocaleString()} 積分
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">當前積分</span>
                <span className="font-medium">{userPoints.points.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">兌換後積分</span>
                <span className="font-medium text-amber-600">
                  {(userPoints.points - selectedGoods.points).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExchangeDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600"
              onClick={handleExchange}
              disabled={exchanging}
            >
              {exchanging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '確認兌換'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 如何获得积分 */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              如何獲得積分
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <ShoppingCart className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">購物獲得</p>
                  <p className="text-muted-foreground">消費HK$1獲得1積分</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">每日簽到</p>
                  <p className="text-muted-foreground">每日簽到得5積分</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">發表評價</p>
                  <p className="text-muted-foreground">評價商品得10積分</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">分享商品</p>
                  <p className="text-muted-foreground">分享得5積分</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
