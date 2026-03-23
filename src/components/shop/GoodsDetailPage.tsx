'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Heart,
  Share2,
  ShieldCheck,
  Store,
  Star,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Minus,
  Plus,
  ChevronRight,
} from 'lucide-react';

interface Merchant {
  id: number;
  name: string;
  type: number;
  logo: string | null;
  cover: string | null;
  description: string | null;
  certification_level: number | null;
  rating: string;
  total_sales: number;
  city: string | null;
  province: string | null;
}

interface Certificate {
  id: number;
  certificate_no: string;
  inspection_result: string | null;
  issue_date: string;
  valid_until: string | null;
  images: string[] | null;
  issued_by: string | null;
}

interface Review {
  id: number;
  rating: number;
  content: string | null;
  images: string[] | null;
  created_at: string;
}

interface RelatedGoods {
  id: number;
  name: string;
  main_image: string | null;
  price: string;
  sales: number;
  is_certified: boolean;
}

interface GoodsDetail {
  id: number;
  name: string;
  subtitle: string | null;
  type: number;
  purpose: string | null;
  price: string;
  original_price: string | null;
  stock: number;
  sales: number;
  images: string[] | null;
  main_image: string | null;
  description: string | null;
  is_certified: boolean;
  merchant: Merchant | null;
  certificate: Certificate | null;
  reviews: Review[];
  relatedGoods: RelatedGoods[];
}

const typeLabels = ['符箓', '法器', '供品', '修行用品'];
const purposeLabels: Record<string, string> = {
  '鎮宅化煞': '鎮宅化煞',
  '招財旺運': '招財旺運',
  '健康平安': '健康平安',
  '學業功名': '學業功名',
  '姻緣和合': '姻緣和合',
};

export function GoodsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [goods, setGoods] = useState<GoodsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchGoods() {
      try {
        const res = await fetch(`/api/goods/${params.id}`);
        const data = await res.json();
        if (data.data) {
          setGoods(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch goods:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchGoods();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!goods) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">商品不存在</p>
        <Button className="mt-4" onClick={() => router.push('/shop')}>
          返回商城
        </Button>
      </div>
    );
  }

  const images = goods.images?.length ? goods.images : goods.main_image ? [goods.main_image] : [];

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= goods.stock) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">首頁</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-foreground">{t.nav.shop}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{goods.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-background rounded-lg overflow-hidden border">
              {images[activeImage] ? (
                <Image
                  src={images[activeImage]}
                  alt={goods.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                  <span className="text-8xl text-primary/20">符</span>
                </div>
              )}
              {goods.is_certified && (
                <Badge className="absolute top-4 left-4 bg-gold text-gold-foreground">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  一物一證
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-20 h-20 rounded border overflow-hidden ${
                      activeImage === index ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{goods.name}</h1>
              {goods.subtitle && (
                <p className="text-muted-foreground">{goods.subtitle}</p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{typeLabels[goods.type - 1]}</Badge>
              {goods.purpose && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {purposeLabels[goods.purpose] || goods.purpose}
                </Badge>
              )}
              {goods.is_certified && (
                <Badge className="bg-gold text-gold-foreground">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  一物一證
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">HK$</span>
                <span className="text-3xl font-bold text-primary">{goods.price}</span>
                {goods.original_price && parseFloat(goods.original_price) > parseFloat(goods.price) && (
                  <span className="text-muted-foreground line-through">
                    HK${goods.original_price}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>已售 {goods.sales}</span>
                <span>庫存 {goods.stock}</span>
              </div>
            </div>

            {/* Certificate Info */}
            {goods.certificate && (
              <Card className="border-gold/30 bg-gold/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="font-medium">平台認證</div>
                      <div className="text-sm text-muted-foreground">
                        證書編號：{goods.certificate.certificate_no}
                      </div>
                    </div>
                    <Button variant="link" className="ml-auto">
                      查看證書
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">數量</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= goods.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t.shop.addToCart}
              </Button>
              <Button size="lg" variant="default" className="flex-1">
                {t.shop.buyNow}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Merchant Info */}
            {goods.merchant && (
              <Card>
                <CardContent className="p-4">
                  <Link href={`/merchant/${goods.merchant.id}`} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {goods.merchant.logo ? (
                        <Image src={goods.merchant.logo} alt="" fill className="object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{goods.merchant.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {goods.merchant.certification_level && goods.merchant.certification_level >= 2 && (
                          <Badge variant="outline" className="text-xs">
                            官方認證
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          {goods.merchant.rating}
                        </span>
                        <span>已售 {goods.merchant.total_sales}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Service Guarantees */}
            <div className="flex items-center justify-around text-sm text-muted-foreground py-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>正品保障</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>平台擔保</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>全球配送</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Details, Certificate, Reviews */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">商品詳情</TabsTrigger>
              <TabsTrigger value="certificate">認證信息</TabsTrigger>
              <TabsTrigger value="reviews">用戶評價 ({goods.reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {goods.description ? (
                    <div className="prose prose-sm max-w-none whitespace-pre-line">
                      {goods.description}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暫無詳細信息</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificate" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {goods.certificate ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">證書編號</div>
                          <div className="font-mono font-medium">{goods.certificate.certificate_no}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">頒發日期</div>
                          <div>{new Date(goods.certificate.issue_date).toLocaleDateString('zh-TW')}</div>
                        </div>
                        {goods.certificate.valid_until && (
                          <div>
                            <div className="text-sm text-muted-foreground">有效期至</div>
                            <div>{new Date(goods.certificate.valid_until).toLocaleDateString('zh-TW')}</div>
                          </div>
                        )}
                        {goods.certificate.issued_by && (
                          <div>
                            <div className="text-sm text-muted-foreground">頒發機構</div>
                            <div>{goods.certificate.issued_by}</div>
                          </div>
                        )}
                      </div>
                      {goods.certificate.inspection_result && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">檢驗結果</div>
                          <div className="whitespace-pre-line">{goods.certificate.inspection_result}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">該商品暫無認證信息</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {goods.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {goods.reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-gold text-gold'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('zh-TW')}
                            </span>
                          </div>
                          {review.content && (
                            <p className="text-sm">{review.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暫無評價</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Goods */}
        {goods.relatedGoods.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">同店商品</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {goods.relatedGoods.map((item) => (
                <Link key={item.id} href={`/shop/${item.id}`}>
                  <Card className="group overflow-hidden hover:shadow-md transition-all">
                    <div className="relative aspect-square bg-muted">
                      {item.main_image ? (
                        <Image src={item.main_image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-4xl text-primary/20">符</span>
                        </div>
                      )}
                      {item.is_certified && (
                        <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground text-xs">
                          認證
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm line-clamp-2 mb-2">{item.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-primary font-bold">HK${item.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
