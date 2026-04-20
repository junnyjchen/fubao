'use client';

import { useEffect, useState } from 'react';
import Link from 'next';
import Image from 'next/image';
import { api } from '@/lib/api-request';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Sparkles, 
  Truck, 
  CheckCircle, 
  Gift,
  ArrowRight,
  Star,
  Heart,
  Users
} from 'lucide-react';

interface FreeGood {
  id: number;
  name: string;
  subtitle: string;
  description?: string;
  main_image: string;
  images?: string[];
  price: string;
  original_price: string;
  is_certified: boolean;
  sales: number;
  stock: number;
  purpose: string;
  is_free: boolean;
  merchant: {
    id: number;
    name: string;
    certification_level: number;
    rating: number;
    total_sales: number;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  claim_limit?: number;
  claim_instructions?: string;
}

export default function FreePage() {
  const [goods, setGoods] = useState<FreeGood[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [claimed, setClaimed] = useState<number[]>([]);

  useEffect(() => {
    loadFreeGoods();
  }, []);

  const loadFreeGoods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/free-goods');
      if (response.data) {
        setGoods(response.data);
      }
    } catch (error) {
      console.error('加载免费商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (goodsId: number) => {
    setClaiming(goodsId);
    try {
      // 模拟领取过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      setClaimed(prev => [...prev, goodsId]);
    } catch (error) {
      console.error('领取失败:', error);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Gift className="w-5 h-5" />
            <span className="font-medium">限時免費</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            免費領取 <span className="text-primary">平安符</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            符寶網為回饋廣大信眾，特推出免費平安符領取活動
            <br />
            由正統道觀開光加持，心誠則靈
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>正品保證</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>道祖加持</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="w-4 h-4 text-blue-500" />
              <span>順豐包郵</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>已領取 {goods[0]?.sales?.toLocaleString() || 1523}+</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Product */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="overflow-hidden">
                <Skeleton className="h-80 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ) : goods.length > 0 ? (
              <Card className="overflow-hidden border-2 border-primary/20">
                {/* Product Image */}
                <div className="relative h-80 md:h-96">
                  <Image
                    src={goods[0].main_image}
                    alt={goods[0].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-red-500 text-white px-3 py-1">
                      <Gift className="w-4 h-4 mr-1" />
                      免費領取
                    </Badge>
                    {goods[0].is_certified && (
                      <Badge variant="secondary" className="px-3 py-1">
                        <Shield className="w-4 h-4 mr-1 text-green-500" />
                        官方認證
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{goods[0].name}</h2>
                      <p className="text-muted-foreground">{goods[0].subtitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">免費</div>
                      <div className="text-sm text-muted-foreground line-through">
                        原價 {formatPrice(parseFloat(goods[0].original_price))}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-y">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{goods[0].sales.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">已領取</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{goods[0].stock > 9999 ? '9999+' : goods[0].stock}</div>
                      <div className="text-xs text-muted-foreground">剩餘數量</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{goods[0].merchant.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">商戶評分</div>
                    </div>
                  </div>

                  {/* Description */}
                  {goods[0].description && (
                    <div 
                      className="prose prose-sm max-w-none mt-6"
                      dangerouslySetInnerHTML={{ __html: goods[0].description }}
                    />
                  )}

                  {/* Merchant Info */}
                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {goods[0].merchant.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{goods[0].merchant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          已服務 {goods[0].merchant.total_sales.toLocaleString()} 位信眾
                        </div>
                      </div>
                      <Badge variant="outline">
                        等級 {goods[0].merchant.certification_level}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  {claimed.includes(goods[0].id) ? (
                    <div className="w-full">
                      <Button disabled className="w-full h-12 text-lg bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        已領取成功！
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        請前往會員中心查看領取記錄
                      </p>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleClaim(goods[0].id)}
                      disabled={claiming === goods[0].id}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                    >
                      {claiming === goods[0].id ? (
                        <>
                          <span className="animate-spin mr-2">◌</span>
                          正在領取中...
                        </>
                      ) : (
                        <>
                          <Gift className="w-5 h-5 mr-2" />
                          立即免費領取
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                  
                  {goods[0].claim_instructions && (
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      {goods[0].claim_instructions}
                    </p>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">暫無免費商品</h3>
                <p className="text-muted-foreground">敬請期待更多免費好禮</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How to Claim */}
            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  如何領取
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-medium">點擊領取按鈕</div>
                    <p className="text-sm text-muted-foreground">點擊上方「立即免費領取」</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-medium">填寫收貨地址</div>
                    <p className="text-sm text-muted-foreground">填寫快遞收貨信息</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-medium">快遞送貨上門</div>
                    <p className="text-sm text-muted-foreground">3-5個工作日送達</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  符咒功效
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    護佑人身安全
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    化解小人是非
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    出入平安
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    逢凶化吉
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  信眾評價
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">林小姐</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    「收到後立馬供奉，效果很好！感謝符寶網！」
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">陳先生</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    「做工精細，快遞很快，推薦給大家」
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">更多道教好物</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  瀏覽我們的精選商品
                </p>
                <Button asChild className="w-full">
                  <Link href="/shop">
                    進入商城
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
