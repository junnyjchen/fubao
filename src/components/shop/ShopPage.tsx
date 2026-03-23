'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Grid, List, ShoppingCart } from 'lucide-react';

interface Merchant {
  id: number;
  name: string;
  type: number;
  logo: string | null;
  certification_level: number | null;
}

interface Goods {
  id: number;
  name: string;
  main_image: string | null;
  price: string;
  original_price: string | null;
  is_certified: boolean;
  sales: number;
  stock: number;
  merchants: Merchant;
}

export function ShopPage() {
  const { t } = useI18n();
  const [goods, setGoods] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');

  const typeOptions = [
    { value: 'all', label: t.shop.filter.all },
    { value: '1', label: t.shop.filter.fu },
    { value: '2', label: t.shop.filter.qi },
    { value: '3', label: t.shop.filter.offering },
    { value: '4', label: t.shop.filter.practice },
  ];

  const purposeOptions = [
    { value: 'all', label: t.shop.purpose.all },
    { value: '鎮宅化煞', label: t.shop.purpose.zhenZhai },
    { value: '招財旺運', label: t.shop.purpose.zhaoCai },
    { value: '健康平安', label: t.shop.purpose.pingAn },
    { value: '學業功名', label: t.shop.purpose.xueYe },
    { value: '姻緣和合', label: t.shop.purpose.yinYuan },
  ];

  useEffect(() => {
    async function fetchGoods() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (typeFilter !== 'all') params.append('type', typeFilter);
        if (purposeFilter !== 'all') params.append('purpose', purposeFilter);
        params.append('limit', '20');

        const res = await fetch(`/api/goods?${params.toString()}`);
        const data = await res.json();
        if (data.data) {
          let sortedGoods = data.data;
          if (sortBy === 'price-asc') {
            sortedGoods.sort((a: Goods, b: Goods) => parseFloat(a.price) - parseFloat(b.price));
          } else if (sortBy === 'price-desc') {
            sortedGoods.sort((a: Goods, b: Goods) => parseFloat(b.price) - parseFloat(a.price));
          } else if (sortBy === 'sales') {
            sortedGoods.sort((a: Goods, b: Goods) => b.sales - a.sales);
          }
          setGoods(sortedGoods);
        }
      } catch (error) {
        console.error('Failed to fetch goods:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGoods();
  }, [typeFilter, purposeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.shop.title}</h1>
              <p className="text-lg text-muted-foreground">{t.shop.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">✓ 正品保障</span>
              <span>·</span>
              <span className="flex items-center gap-1">✓ 平台擔保</span>
              <span>·</span>
              <span className="flex items-center gap-1">✓ 全球配送</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-background rounded-lg border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder={t.shop.filter.all} />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Purpose Filter */}
            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder={t.shop.purpose.all} />
              </SelectTrigger>
              <SelectContent>
                {purposeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默認排序</SelectItem>
                <SelectItem value="sales">銷量優先</SelectItem>
                <SelectItem value="price-asc">價格從低到高</SelectItem>
                <SelectItem value="price-desc">價格從高到低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            {t.common.loading}
          </div>
        ) : goods.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {goods.map((item) => (
              <ProductCard key={item.id} item={item} t={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {t.common.noData}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductCard({ item, t }: { item: Goods; t: ReturnType<typeof useI18n>['t'] }) {
  const isOutOfStock = item.stock <= 0;

  return (
    <Link href={`/shop/${item.id}`}>
      <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 h-full ${isOutOfStock ? 'opacity-60' : ''}`}>
        <div className="relative aspect-square bg-muted">
          {item.main_image ? (
            <Image
              src={item.main_image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-5xl text-primary/30">符</span>
            </div>
          )}
          {item.is_certified && (
            <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground">
              {t.shop.certified}
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="destructive">{t.shop.soldOut}</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[40px]">
            {item.name}
          </h3>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-primary">HK${item.price}</span>
            {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
              <span className="text-xs text-muted-foreground line-through">
                HK${item.original_price}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>已售 {item.sales}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            {item.merchants.logo ? (
              <Image
                src={item.merchants.logo}
                alt={item.merchants.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                {item.merchants.name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate flex-1">
              {item.merchants.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
