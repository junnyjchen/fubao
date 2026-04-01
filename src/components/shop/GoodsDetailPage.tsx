/**
 * @fileoverview 商品详情页面组件
 * @description 展示商品详细信息、购买操作
 * @module components/shop/GoodsDetailPage
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
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
  Ticket,
} from 'lucide-react';
import { ReviewSection } from '@/components/review/ReviewSection';
import { SharePoster } from '@/components/share/SharePoster';
import { OrderReminder } from '@/components/shop/OrderReminder';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { DetailRecommendations } from '@/components/shop/ProductRecommendations';
import { GoodsDetailSkeleton } from '@/components/shop/GoodsDetailSkeleton';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

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

// 相关商品卡片组件
const RelatedGoodsCard = memo(function RelatedGoodsCard({ 
  item,
  t 
}: { 
  item: Goods['relatedGoods'][0];
  t: any;
}) {
  return (
    <Link href={`/shop/${item.id}`} className="group block">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
        {item.main_image ? (
          <Image
            src={item.main_image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            {t.shop.detail.noImage}
          </div>
        )}
      </div>
      <p className="text-sm truncate group-hover:text-primary transition-colors">{item.name}</p>
      <p className="text-sm text-primary font-semibold">HK${item.price}</p>
    </Link>
  );
});

export function GoodsDetailPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const [goodsId, setGoodsId] = useState<string | null>(null);
  const [goods, setGoods] = useState<Goods | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

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
          checkFavoriteStatus(parseInt(goodsId));
          recordBrowseHistory(parseInt(goodsId));
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

  // 记录浏览历史
  const recordBrowseHistory = async (goodsId: number) => {
    try {
      await fetch('/api/user/browse-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          goods_id: goodsId,
          view_duration: 0,
        }),
      });
    } catch (error) {
      console.error('记录浏览历史失败:', error);
    }
  };

  const handleQuantityChange = useCallback((delta: number) => {
    if (!goods) return;
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty >= 1 && newQty <= goods.stock) return newQty;
      return prev;
    });
  }, [goods]);

  const handleAddToCart = useCallback(async () => {
    if (!goods) return;
    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goodsId: goods.id, quantity }),
      });
      const data = await res.json();
      if (data.message) {
        toast.success(t.shop.detail.addedToCart);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(t.shop.detail.addFailed);
    } finally {
      setAddingToCart(false);
    }
  }, [goods, quantity, t]);

  const handleBuyNow = useCallback(async () => {
    if (!goods) return;
    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goodsId: goods.id, quantity }),
      });
      const data = await res.json();
      if (data.message) {
        router.push('/cart');
      }
    } catch (error) {
      console.error('购买失败:', error);
    } finally {
      setAddingToCart(false);
    }
  }, [goods, quantity, router]);

  const handleToggleFavorite = useCallback(async () => {
    if (!goods) return;
    try {
      if (isFavorite) {
        const res = await fetch(`/api/favorites?targetType=goods&targetId=${goods.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setIsFavorite(false);
          toast.success(t.shop.detail.favoriteRemoved);
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType: 'goods', targetId: goods.id }),
        });
        const data = await res.json();
        if (data.data) {
          setIsFavorite(true);
          toast.success(t.shop.detail.favoriteAdded);
        } else if (data.error) {
          toast.error(data.error);
        }
      }
    } catch (error) {
      toast.error(t.shop.detail.operationFailed);
    }
  }, [goods, isFavorite, t]);

  if (loading) {
    return <GoodsDetailSkeleton />;
  }

  if (!goods) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md animate-fade-in">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.shop.detail.notFound}</h2>
            <Button asChild className="mt-4">
              <Link href="/shop">{t.shop.detail.backToShop}</Link>
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
  const detail = t.shop.detail;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 面包屑 */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">{detail.breadcrumb.home}</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">{detail.breadcrumb.shop}</Link>
            {goods.category && (
              <>
                <span>/</span>
                <Link href={`/category/${goods.category.slug}`} className="hover:text-foreground transition-colors">
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
          <div className="space-y-4 animate-fade-in-up">
            {/* 主图 */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <Image
                  src={images[currentImageIndex]}
                  alt={goods.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {detail.noImage}
                </div>
              )}
              
              {/* 图片切换按钮 */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white ${isRTL ? 'right-2' : 'left-2'}`}
                    onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : images.length - 1))}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white ${isRTL ? 'left-2' : 'right-2'}`}
                    onClick={() => setCurrentImageIndex(i => (i < images.length - 1 ? i + 1 : 0))}
                    aria-label="Next image"
                  >
                    <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </>
              )}

              {/* 认证标签 */}
              {goods.is_certified && (
                <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <Badge className="bg-green-600">
                    <Shield className="w-3 h-3 me-1" />
                    {detail.certified}
                  </Badge>
                </div>
              )}
            </div>

            {/* 缩略图 */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Product images">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden transition-all ${
                      currentImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    role="tab"
                    aria-selected={currentImageIndex === idx}
                    aria-label={`Image ${idx + 1}`}
                  >
                    <Image src={img} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 信息区域 */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
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
                  <span className="text-3xl font-bold text-primary">HK${goods.price}</span>
                  {goods.original_price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">HK${goods.original_price}</span>
                      <Badge variant="destructive">-{discount}%</Badge>
                    </>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{t.shop.sold} {goods.sales} {detail.units}</span>
                  <span>{detail.stock} {goods.stock} {detail.units}</span>
                </div>
              </CardContent>
            </Card>

            {/* 优惠券入口 */}
            <Button variant="outline" className="w-full justify-between group" onClick={() => setShowCoupon(true)}>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" />
                <span>{detail.coupon}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>3{detail.couponsAvailable}</span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </div>
            </Button>

            {/* 用途标签 */}
            {goods.purpose && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{detail.purpose}：</span>
                <Badge variant="outline">{goods.purpose}</Badge>
              </div>
            )}

            {/* 商家信息 */}
            {goods.merchant && (
              <Card className="hover:shadow-md transition-shadow">
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
                            <Star className="w-3 h-3 text-yellow-500 me-1" />
                            {goods.merchant.rating}
                          </span>
                          <span>|</span>
                          <span>{t.shop.sold} {goods.merchant.total_sales}</span>
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
                <span className="text-sm text-muted-foreground w-16">{detail.quantity}</span>
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-none" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium" aria-live="polite">{quantity}</span>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-none" onClick={() => handleQuantityChange(1)} disabled={quantity >= goods.stock} aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">（{detail.stock} {goods.stock} {detail.units}）</span>
              </div>

              {/* 按钮组 */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" size="lg" onClick={handleAddToCart} disabled={addingToCart || !goods.status}>
                  {addingToCart ? <Loader2 className="w-5 h-5 me-2 animate-spin" /> : <ShoppingCart className="w-5 h-5 me-2" />}
                  {t.shop.addToCart}
                </Button>
                <Button className="flex-1" size="lg" onClick={handleBuyNow} disabled={addingToCart || !goods.status}>
                  {t.shop.buyNow}
                </Button>
              </div>

              {/* 快速下单按钮 */}
              <Link href={`/quick-order?goods_id=${goods.id}`} className="block">
                <Button variant="secondary" className="w-full" size="lg">
                  <Package className="w-5 h-5 me-2" />
                  {detail.quickOrder}
                </Button>
              </Link>

              {/* 功能按钮 */}
              <div className="flex gap-4 justify-center">
                <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
                  <Heart className={`w-4 h-4 me-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? detail.favorited : detail.favorite}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowShare(true)}>
                  <Share2 className="w-4 h-4 me-2" />
                  {detail.share}
                </Button>
              </div>
            </div>

            {/* 服务保障 */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                {detail.service.authentic}
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-blue-600" />
                {detail.service.freeShipping}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-yellow-600" />
                {detail.service.blessed}
              </span>
            </div>
          </div>
        </div>

        {/* 详情选项卡 */}
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Tabs defaultValue="description">
            <CardHeader className="pb-0">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                <TabsTrigger value="description">{detail.tabs.description}</TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="w-4 h-4 me-1" />
                  {detail.tabs.reviews}
                </TabsTrigger>
                <TabsTrigger value="certificate">{detail.tabs.certificate}</TabsTrigger>
                <TabsTrigger value="service">{detail.tabs.afterSales}</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-sm max-w-none">
                  {goods.description ? (
                    <p className="whitespace-pre-wrap">{goods.description}</p>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">{detail.noDescription}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <ReviewSection goodsId={goods.id} />
              </TabsContent>

              <TabsContent value="certificate" className="mt-0">
                {goods.certificate ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-300">{detail.certificateInfo.title}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{detail.certificateInfo.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">{detail.certificateInfo.certificateNo}</span>
                        <p className="font-mono font-semibold">{goods.certificate.certificate_no}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">{detail.certificateInfo.issuedBy}</span>
                        <p>{goods.certificate.issued_by}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">{detail.certificateInfo.issueDate}</span>
                        <p>{new Date(goods.certificate.issue_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/verify/${goods.certificate.certificate_no}`} target="_blank">
                          <Shield className="w-4 h-4 me-2" />
                          {detail.certificateInfo.viewFull}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{detail.certificateInfo.notCertified}</p>
                    <p className="text-sm text-muted-foreground mt-2">{detail.certificateInfo.contactMerchant}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="service" className="mt-0">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{detail.afterSalesInfo.shipping.title}</p>
                      <p className="text-muted-foreground">{detail.afterSalesInfo.shipping.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{detail.afterSalesInfo.return.title}</p>
                      <p className="text-muted-foreground">{detail.afterSalesInfo.return.desc}</p>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-muted-foreground text-center">{detail.afterSalesInfo.contact}</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* 相关商品 */}
        {goods.relatedGoods && goods.relatedGoods.length > 0 && (
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">{detail.relatedProducts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {goods.relatedGoods.map((item) => (
                  <RelatedGoodsCard key={item.id} item={item} t={t} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐商品 */}
        <DetailRecommendations currentProductId={goods.id} categoryId={goods.category?.id} />
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
      <CouponSelector open={showCoupon} onOpenChange={setShowCoupon} mode="receive" />
    </div>
  );
}
