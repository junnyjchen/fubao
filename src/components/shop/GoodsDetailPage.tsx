/**
 * @fileoverview 商品详情页面组件
 * @description 展示商品详细信息、购买操作
 * @module components/shop/GoodsDetailPage
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Shield,
  Truck,
  Package,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Store,
  Award,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { ReviewSection } from '@/components/review/ReviewSection';
import { SharePoster } from '@/components/share/SharePoster';
import { OrderReminder } from '@/components/shop/OrderReminder';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { toast } from 'sonner';
import { Ticket } from 'lucide-react';

interface Goods {
  id: number;
  name: string;
  subtitle: string | null;
  price: string;
  original_price: string | null;
  stock: number;
  sales: number;
  main_image: string | null;
  images: string[] | null;
  description: string | null;
  purpose: string | null;
  is_certified: boolean;
  status: boolean;
  merchant: {
    id: number;
    name: string;
    logo: string | null;
    certification_level: number;
    rating: string;
    total_sales: number;
  } | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  certificate: {
    certificate_no: string;
    issue_date: string;
    issued_by: string;
  } | null;
  relatedGoods: Array<{
    id: number;
    name: string;
    price: string;
    main_image: string | null;
    sales: number;
  }>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export function GoodsDetailPage() {
  const router = useRouter();
  const [goodsId, setGoodsId] = useState<string | null>(null);
  const [goods, setGoods] = useState<Goods | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState(0);

  // 从URL获取商品ID
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    setGoodsId(id);
  }, []);

  // 加载商品详情
  useEffect(() => {
    if (!goodsId) return;

    const loadGoods = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/goods/${goodsId}`);
        const data = await res.json();
        if (data.data) {
          setGoods(data.data);
          // 检查是否已收藏
          checkFavoriteStatus(parseInt(goodsId));
        } else {
          router.push('/shop');
        }
      } catch (error) {
        console.error('加载商品失败:', error);
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    };
    loadGoods();
  }, [goodsId, router]);

  // 检查收藏状态
  const checkFavoriteStatus = async (goodsId: number) => {
    try {
      const res = await fetch(`/api/favorites?targetType=goods`);
      const data = await res.json();
      if (data.data) {
        const isFav = data.data.some((f: { target_id: number }) => f.target_id === goodsId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!goods) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= goods.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!goods) return;

    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goodsId: goods.id,
          quantity,
        }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('已添加到購物車');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('添加到购物车失败:', error);
      toast.error('添加失敗，請重試');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!goods) return;

    setAddingToCart(true);
    try {
      // 先添加到购物车
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goodsId: goods.id,
          quantity,
        }),
      });

      const data = await res.json();
      if (data.message) {
        // 跳转到购物车
        router.push('/cart');
      }
    } catch (error) {
      console.error('购买失败:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!goods) return;

    try {
      if (isFavorite) {
        // 取消收藏
        const res = await fetch(
          `/api/favorites?targetType=goods&targetId=${goods.id}`,
          { method: 'DELETE' }
        );
        const data = await res.json();
        if (data.success) {
          setIsFavorite(false);
          toast.success('已取消收藏');
        }
      } else {
        // 添加收藏
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType: 'goods',
            targetId: goods.id,
          }),
        });
        const data = await res.json();
        if (data.data) {
          setIsFavorite(true);
          toast.success('已添加到收藏');
        } else if (data.error) {
          toast.error(data.error);
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast.error('操作失敗，請重試');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!goods) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">商品不存在</h2>
            <Button asChild className="mt-4">
              <Link href="/shop">返回商城</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = goods.images?.length ? goods.images : goods.main_image ? [goods.main_image] : [];
  const discount = goods.original_price
    ? Math.round((1 - parseFloat(goods.price) / parseFloat(goods.original_price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 面包屑 */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">首頁</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground">商城</Link>
            {goods.category && (
              <>
                <span>/</span>
                <Link href={`/category/${goods.category.slug}`} className="hover:text-foreground">
                  {goods.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{goods.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 商品主信息 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 图片区域 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={goods.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  暫無圖片
                </div>
              )}
              
              {/* 图片切换按钮 */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : images.length - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={() => setCurrentImageIndex(i => (i < images.length - 1 ? i + 1 : 0))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* 认证标签 */}
              {goods.is_certified && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    已認證
                  </Badge>
                </div>
              )}
            </div>

            {/* 缩略图 */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden ${
                      currentImageIndex === idx ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 信息区域 */}
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <h1 className="text-2xl font-semibold mb-2">{goods.name}</h1>
              {goods.subtitle && (
                <p className="text-muted-foreground">{goods.subtitle}</p>
              )}
            </div>

            {/* 价格 */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    HK${goods.price}
                  </span>
                  {goods.original_price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        HK${goods.original_price}
                      </span>
                      <Badge variant="destructive">-{discount}%</Badge>
                    </>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>已售 {goods.sales} 件</span>
                  <span>庫存 {goods.stock} 件</span>
                </div>
              </CardContent>
            </Card>

            {/* 优惠券入口 */}
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowCoupon(true)}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" />
                <span>優惠券</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>3張可領取</span>
                <span className="text-primary">{'>'}</span>
              </div>
            </Button>

            {/* 用途标签 */}
            {goods.purpose && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">用途：</span>
                <Badge variant="outline">{goods.purpose}</Badge>
              </div>
            )}

            {/* 商家信息 */}
            {goods.merchant && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{goods.merchant.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            {goods.merchant.rating}
                          </span>
                          <span>|</span>
                          <span>銷量 {goods.merchant.total_sales}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      {Array.from({ length: goods.merchant.certification_level }).map((_, i) => (
                        <Award key={i} className="w-4 h-4" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 购买操作 */}
            <div className="space-y-4">
              {/* 数量选择 */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-16">數量</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-none"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-none"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= goods.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  （庫存 {goods.stock} 件）
                </span>
              </div>

              {/* 按钮组 */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart || !goods.status}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  加入購物車
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={addingToCart || !goods.status}
                >
                  立即購買
                </Button>
              </div>

              {/* 功能按钮 */}
              <div className="flex gap-4 justify-center">
                <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowShare(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
            </div>

            {/* 服务保障 */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                正品保證
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-blue-600" />
                滿額免運
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-yellow-600" />
                開光加持
              </span>
            </div>
          </div>
        </div>

        {/* 详情选项卡 */}
        <Card className="mb-8">
          <Tabs defaultValue="description">
            <CardHeader className="pb-0">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">商品詳情</TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  用戶評價
                </TabsTrigger>
                <TabsTrigger value="certificate">認證信息</TabsTrigger>
                <TabsTrigger value="service">售後服務</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-sm max-w-none">
                  {goods.description ? (
                    <p className="whitespace-pre-wrap">{goods.description}</p>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      暫無商品詳情
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <ReviewSection goodsId={goods.id} />
              </TabsContent>

              <TabsContent value="certificate" className="mt-0">
                {goods.certificate ? (
                  <div className="space-y-4">
                    {/* 认证状态卡片 */}
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">已認證商品</p>
                        <p className="text-sm text-green-600">該商品已通過一物一證認證</p>
                      </div>
                    </div>

                    {/* 认证信息 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">認證編號</span>
                        <p className="font-mono font-semibold">{goods.certificate.certificate_no}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">頒發機構</span>
                        <p>{goods.certificate.issued_by}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">頒發日期</span>
                        <p>{new Date(goods.certificate.issue_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* 验证链接 */}
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/verify/${goods.certificate.certificate_no}`} target="_blank">
                          <Shield className="w-4 h-4 mr-2" />
                          查看完整認證信息
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">該商品暫無認證信息</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      如需了解認證詳情，請聯繫商戶
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="service" className="mt-0">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">配送服務</p>
                      <p className="text-muted-foreground">香港境內訂單滿HK$500免運費，偏遠地區需補運費差價</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">退換貨政策</p>
                      <p className="text-muted-foreground">符籙類商品為特殊商品，一經售出概不退換；法器類商品簽收後7天內可申請退換</p>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-muted-foreground text-center">
                    如有任何問題，請聯繫客服
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* 相关商品 */}
        {goods.relatedGoods && goods.relatedGoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">相關商品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {goods.relatedGoods.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.id}`}
                    className="group"
                  >
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                      {item.main_image ? (
                        <img
                          src={item.main_image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          暫無圖片
                        </div>
                      )}
                    </div>
                    <p className="text-sm truncate group-hover:text-primary">{item.name}</p>
                    <p className="text-sm text-primary font-semibold">HK${item.price}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 分享弹窗 */}
      <SharePoster
        open={showShare}
        onOpenChange={setShowShare}
        type="goods"
        goods={{
          id: goods.id.toString(),
          name: goods.name,
          price: parseFloat(goods.price),
          image: goods.main_image || '',
          description: goods.subtitle || undefined,
          shop_name: goods.merchant?.name,
        }}
      />

      {/* 下单提醒飘窗 */}
      <OrderReminder goodsId={goods.id} goodsName={goods.name} />

      {/* 优惠券选择弹窗 */}
      <CouponSelector
        open={showCoupon}
        onOpenChange={setShowCoupon}
        mode="receive"
      />
    </div>
  );
}
