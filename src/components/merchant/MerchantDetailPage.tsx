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
import { Star, MapPin, ChevronRight, Store } from 'lucide-react';

interface Goods {
  id: number;
  name: string;
  main_image: string | null;
  price: string;
  original_price: string | null;
  sales: number;
  is_certified: boolean;
  type: number;
  purpose: string | null;
}

interface MerchantDetail {
  id: number;
  name: string;
  type: number;
  logo: string | null;
  cover: string | null;
  description: string | null;
  certification_level: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  rating: string;
  total_sales: number;
  goods: Goods[];
}

const typeLabels = ['道觀', '寺廟', '其他'];

export function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMerchant() {
      try {
        const res = await fetch(`/api/merchants/${params.id}`);
        const data = await res.json();
        if (data.data) {
          setMerchant(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch merchant:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMerchant();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">店鋪不存在</p>
        <Button className="mt-4" onClick={() => router.push('/shop')}>
          返回商城
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Cover & Profile */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10">
          {merchant.cover && (
            <Image src={merchant.cover} alt="" fill className="object-cover" />
          )}
        </div>

        {/* Profile Section */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
            {/* Logo */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-lg bg-background border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
              {merchant.logo ? (
                <Image src={merchant.logo} alt={merchant.name} fill className="object-cover" />
              ) : (
                <Store className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{merchant.name}</h1>
                {merchant.certification_level && merchant.certification_level >= 2 && (
                  <Badge className="bg-gold text-gold-foreground">
                    {merchant.certification_level === 3 ? '祖庭認證' : '官方認證'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{typeLabels[merchant.type - 1]}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  {merchant.rating}
                </span>
                <span>已售 {merchant.total_sales}</span>
              </div>
            </div>

            {/* Contact Button */}
            <Button variant="outline" className="mb-4">
              聯繫店鋪
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{merchant.goods.length}</div>
              <div className="text-sm text-muted-foreground">在售商品</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{merchant.total_sales}</div>
              <div className="text-sm text-muted-foreground">累計銷量</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{merchant.rating}</div>
              <div className="text-sm text-muted-foreground">店鋪評分</div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {merchant.description && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">店鋪簡介</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {merchant.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">聯繫方式</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {merchant.contact_name && (
                <div>
                  <span className="text-muted-foreground">聯繫人：</span>
                  {merchant.contact_name}
                </div>
              )}
              {merchant.contact_phone && (
                <div>
                  <span className="text-muted-foreground">電話：</span>
                  {merchant.contact_phone}
                </div>
              )}
              {merchant.address && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">地址：</span>
                  {merchant.province}{merchant.city}{merchant.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goods */}
        <div>
          <h2 className="text-xl font-bold mb-4">店鋪商品</h2>
          {merchant.goods.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {merchant.goods.map((item) => (
                <Link key={item.id} href={`/shop/${item.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative aspect-square bg-muted">
                      {item.main_image ? (
                        <Image src={item.main_image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-4xl text-primary/20">符</span>
                        </div>
                      )}
                      {item.is_certified && (
                        <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground text-xs">
                          一物一證
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-primary font-bold">HK${item.price}</span>
                        {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${item.original_price}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        已售 {item.sales}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              暫無商品
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
