/**
 * @fileoverview 新人专享活动页面
 * @description 新用户专享优惠活动
 * @module app/activity/new-user/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Gift,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Users,
  Clock,
  Ticket,
  Heart,
  ChevronLeft,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ShareButton } from '@/components/free-gifts/ShareButton';
import { InviteFriend } from '@/components/free-gifts/InviteFriend';

/** 新人专享优惠券 */
interface NewUserCoupon {
  id: number;
  name: string;
  type: 'cash' | 'discount';
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  end_time: string;
  description: string;
  status: 'available' | 'received' | 'used';
}

/** 新人专享商品 */
interface NewUserGoods {
  id: number;
  goods_id: number;
  special_price: string;
  stock: number;
  sales: number;
  limit_per_user: number;
  goods: {
    id: number;
    name: string;
    main_image: string | null;
    price: string;
    original_price: string | null;
    sales: number;
    merchants?: { name: string } | null;
  } | null;
}

/** 新人任务 */
interface NewUserTask {
  id: number;
  title: string;
  description: string;
  reward: string;
  reward_type: 'coupon' | 'points' | 'balance';
  status: 'pending' | 'completed';
  action_url: string;
}

/** 收藏状态 */
interface FavoriteState {
  [key: number]: boolean;
}

/**
 * 新人专享活动页面组件
 */
export default function NewUserPage() {
  const [coupons, setCoupons] = useState<NewUserCoupon[]>([]);
  const [goods, setGoods] = useState<NewUserGoods[]>([]);
  const [tasks, setTasks] = useState<NewUserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivingCoupon, setReceivingCoupon] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<FavoriteState>({});
  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载数据
      const [couponsRes, goodsRes] = await Promise.all([
        fetch('/api/coupons?type=new_user'),
        fetch('/api/goods?new_user=true&limit=8'),
      ]);

      const [couponsData, goodsData] = await Promise.all([
        couponsRes.json(),
        goodsRes.json(),
      ]);

      if (couponsData.success || couponsData.data) {
        setCoupons(couponsData.data || getMockCoupons());
      }
      
      if (goodsData.data) {
        setGoods(formatNewUserGoods(goodsData.data));
      } else {
        setGoods(getMockGoods());
      }

      // 加载任务列表
      setTasks(getMockTasks());
    } catch (error) {
      console.error('加载数据失败:', error);
      // 使用模拟数据
      setCoupons(getMockCoupons());
      setGoods(getMockGoods());
      setTasks(getMockTasks());
    } finally {
      setLoading(false);
    }
  };

  // 格式化新人商品数据
  const formatNewUserGoods = (data: Array<{
    id: number;
    name: string;
    main_image: string | null;
    price: string;
    original_price: string | null;
    stock: number;
    sales: number;
    merchants?: { name: string } | null;
  }>): NewUserGoods[] => {
    return data.map((item, index) => ({
      id: index + 1,
      goods_id: item.id,
      special_price: (parseFloat(item.price) * 0.8).toFixed(2),
      stock: item.stock,
      sales: Math.floor(item.sales * 0.3),
      limit_per_user: 1,
      goods: item,
    }));
  };

  // 领取优惠券
  const handleReceiveCoupon = async (couponId: number) => {
    setReceivingCoupon(couponId);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_id: couponId }),
      });

      const data = await res.json();
      if (data.success || data.message) {
        toast.success('領取成功');
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, status: 'received' } : c))
        );
      } else {
        toast.error(data.error || '領取失敗');
      }
    } catch (error) {
      console.error('领取优惠券失败:', error);
      toast.error('領取失敗，請重試');
    } finally {
      setReceivingCoupon(null);
    }
  };

  // 加入购物车
  const handleAddToCart = async (item: NewUserGoods) => {
    if (!item.goods) return;

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goodsId: item.goods_id,
          quantity: 1,
        }),
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
  const handleToggleFavorite = async (item: NewUserGoods) => {
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

  // 计算任务完成进度
  const getTaskProgress = () => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100)
    };
  };

  // 模拟数据
  function getMockCoupons(): NewUserCoupon[] {
    const now = new Date();
    return [
      {
        id: 1,
        name: '新人專享禮包',
        type: 'cash',
        discount_value: 50,
        min_amount: 100,
        max_discount: null,
        end_time: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: '滿100減50',
        status: 'available',
      },
      {
        id: 2,
        name: '新人9折券',
        type: 'discount',
        discount_value: 10,
        min_amount: 200,
        max_discount: 100,
        end_time: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: '滿200享9折，最高減100',
        status: 'available',
      },
      {
        id: 3,
        name: '新人免運券',
        type: 'cash',
        discount_value: 30,
        min_amount: 0,
        max_discount: 30,
        end_time: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: '無門檻免運費',
        status: 'available',
      },
    ];
  }

  function getMockGoods(): NewUserGoods[] {
    return [
      {
        id: 1,
        goods_id: 1,
        special_price: '310.40',
        stock: 100,
        sales: 45,
        limit_per_user: 1,
        goods: {
          id: 1,
          name: '太上老君鎮宅符',
          main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
          price: '388.00',
          original_price: '488.00',
          sales: 1256,
          merchants: { name: '龍虎山道觀法物店' },
        },
      },
      {
        id: 2,
        goods_id: 2,
        special_price: '230.40',
        stock: 150,
        sales: 68,
        limit_per_user: 1,
        goods: {
          id: 2,
          name: '五雷護身符',
          main_image: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400',
          price: '288.00',
          original_price: '358.00',
          sales: 2080,
          merchants: { name: '龍虎山道觀法物店' },
        },
      },
      {
        id: 3,
        goods_id: 4,
        special_price: '550.40',
        stock: 50,
        sales: 32,
        limit_per_user: 1,
        goods: {
          id: 4,
          name: '武當檀香唸珠',
          main_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
          price: '688.00',
          original_price: '888.00',
          sales: 856,
          merchants: { name: '武當山法器專營' },
        },
      },
    ];
  }

  function getMockTasks(): NewUserTask[] {
    return [
      {
        id: 1,
        title: '完成註冊',
        description: '完成賬號註冊並完善個人信息',
        reward: '50積分',
        reward_type: 'points',
        status: 'completed',
        action_url: '/user/settings',
      },
      {
        id: 2,
        title: '首次下單',
        description: '完成首次購物下單',
        reward: '新人專屬9折券',
        reward_type: 'coupon',
        status: 'pending',
        action_url: '/shop',
      },
      {
        id: 3,
        title: '邀請好友',
        description: '成功邀請1位好友註冊',
        reward: 'HK$10餘額',
        reward_type: 'balance',
        status: 'pending',
        action_url: '/distribution',
      },
    ];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-background">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white py-12 relative">
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
            title="新人專享活動"
            description="新用戶專屬福利，首單立享優惠！"
            variant="ghost"
            size="sm"
            showText={false}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">新人專享</h1>
          </div>
          <p className="text-center text-purple-100 mb-6">
            新用戶專屬福利，首單立享優惠
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span>專屬優惠券</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>30天有效</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>新人專享價</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <>
          {/* 新人优惠券 */}
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-purple-500" />
              新人專屬優惠券
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <Card
                  key={coupon.id}
                  className={`overflow-hidden ${
                    coupon.status === 'received' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex">
                    <div className="w-24 bg-gradient-to-br from-purple-500 to-purple-600 flex flex-col items-center justify-center text-white p-4">
                      <span className="text-xs mb-1">
                        {coupon.type === 'discount' ? '折扣' : '現金'}
                      </span>
                      <span className="text-2xl font-bold">
                        {coupon.type === 'discount'
                          ? `${coupon.discount_value}折`
                          : `HK$${coupon.discount_value}`}
                      </span>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <h3 className="font-semibold mb-1">{coupon.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {coupon.description}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        有效期至 {new Date(coupon.end_time).toLocaleDateString('zh-TW')}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={coupon.status === 'received' ? 'secondary' : 'default'}
                        disabled={coupon.status === 'received' || receivingCoupon === coupon.id}
                        onClick={() => handleReceiveCoupon(coupon.id)}
                      >
                        {receivingCoupon === coupon.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : coupon.status === 'received' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            已領取
                          </>
                        ) : (
                          '立即領取'
                        )}
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 新人任务 */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-purple-500" />
                新人任務
              </h2>
              <div className="text-sm text-muted-foreground">
                已完成 {getTaskProgress().completed}/{getTaskProgress().total}
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="mb-6">
              <Progress value={getTaskProgress().percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {getTaskProgress().percentage}% 完成
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <Card 
                  key={task.id} 
                  className={`transition-all ${task.status === 'completed' ? 'border-green-200 bg-green-50/50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {task.title}
                          {task.status === 'completed' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              已完成
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-purple-600 border-purple-600">
                        獎勵: {task.reward}
                      </Badge>
                      <Link href={task.action_url}>
                        <Button 
                          size="sm" 
                          variant={task.status === 'completed' ? 'outline' : 'default'}
                          disabled={task.status === 'completed'}
                        >
                          {task.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                              已完成
                            </>
                          ) : (
                            <>
                              去完成
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 新人专享商品 */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-500" />
                新人專享價
              </h2>
              <Link href="/shop">
                <Button variant="ghost">
                  查看更多
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {goods.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative aspect-square bg-muted">
                    {item.goods?.main_image ? (
                      <Image
                        src={item.goods.main_image}
                        alt={item.goods.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-100 to-purple-50">
                        <Gift className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                    
                    {/* 新人价标签 */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-purple-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        新人價
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
                    <Link href={`/shop/${item.goods_id}`}>
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 hover:text-purple-600 transition-colors">
                        {item.goods?.name}
                      </h3>
                    </Link>
                    
                    {/* 价格 */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-purple-600">
                        HK${item.special_price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        HK${item.goods?.price}
                      </span>
                    </div>
                    
                    {/* 限购提示 */}
                    <div className="text-xs text-muted-foreground mb-3">
                      限購 {item.limit_per_user} 件
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      加入購物車
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 邀请好友 */}
          <div className="container mx-auto px-4 py-8">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">邀請好友，雙方得優惠</h3>
                      <p className="text-sm text-muted-foreground">
                        邀請好友註冊成功，雙方各得HK$10優惠券
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowInviteDialog(true)}>
                    立即邀請
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 活动规则 */}
          <div className="container mx-auto px-4 py-8">
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">活動規則</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>1. 新用戶定義：首次註冊且從未下單的用戶；</li>
                  <li>2. 新人優惠券自領取之日起30天內有效；</li>
                  <li>3. 新人專享價商品每人限購1件；</li>
                  <li>4. 優惠券不可與其他優惠同享；</li>
                  <li>5. 如有疑問，請聯繫客服諮詢。</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* 邀请好友对话框 */}
      <InviteFriend
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        inviteCode="NEWUSER2024"
        inviteLink={typeof window !== 'undefined' ? window.location.origin : ''}
      />
    </div>
  );
}
