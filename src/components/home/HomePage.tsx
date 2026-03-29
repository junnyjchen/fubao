'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { AnnouncementBar } from '@/components/announcement/AnnouncementBar';
import { HomeRecommendations } from '@/components/shop/ProductRecommendations';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { 
  ShieldCheck, 
  Building2, 
  Shield, 
  Store, 
  ArrowRight,
  Play,
  Eye,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  Plus,
  Image as ImageIcon,
  TrendingUp,
  Gift,
} from 'lucide-react';

// 类型定义
interface Banner {
  id: number;
  title: string | null;
  image: string;
  link: string | null;
}

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
  merchants: Merchant;
}

interface News {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  type: number;
  views: number;
  published_at: string | null;
}

interface Article {
  id: number;
  title: string;
  slug: string | null;
  cover_image: string | null;
  summary: string | null;
  view_count: number;
  created_at: string;
}

interface Video {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  duration: number;
  views: number;
  author: string;
  category: { name: string } | null;
}

// 功能入口组件
function FeatureCard({ icon: Icon, title, href }: { icon: React.ElementType; title: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/30">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

// 商品卡片组件
function GoodsCard({ item, t }: { item: Goods; t: any }) {
  return (
    <Link href={`/shop/${item.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-square bg-muted">
          {item.main_image ? (
            <Image
              src={item.main_image}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl text-primary/30">符</span>
            </div>
          )}
          {item.is_certified && (
            <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground">
              {t.home.certified}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">HK${item.price}</span>
              {item.original_price && (
                <span className="text-xs text-muted-foreground line-through">
                  HK${item.original_price}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{t.home.sold} {item.sales}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            {item.merchants.logo && (
              <Image
                src={item.merchants.logo}
                alt={item.merchants.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {item.merchants.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// 新闻卡片组件
function NewsCard({ item, t }: { item: News; t: any }) {
  const typeLabels = [
    t.newsTypes.global, 
    t.newsTypes.industry, 
    t.newsTypes.activity, 
    t.newsTypes.interaction
  ];
  
  return (
    <Link href={`/news/${item.slug || item.id}`}>
      <Card className="group flex gap-4 p-4 hover:shadow-md transition-all duration-300">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {item.cover ? (
            <Image
              src={item.cover}
              alt={item.title}
              fill
              sizes="96px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-2xl text-primary/30">玄</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {typeLabels[item.type - 1] || t.newsTypes.industry}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.views}
            </span>
          </div>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {item.summary}
            </p>
          )}
          {item.published_at && (
            <span className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.published_at).toLocaleDateString('zh-TW')}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

// 视频卡片组件
function VideoCard({ item }: { item: Video }) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/videos/${item.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-video bg-muted">
          {item.cover ? (
            <Image
              src={item.cover}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Play className="text-4xl text-primary/30 w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(item.duration)}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.author}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.views}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { t } = useI18n();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [goods, setGoods] = useState<Goods[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [todayArticle, setTodayArticle] = useState<Article | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 并行获取数据
        const [bannersRes, goodsRes, newsRes, wikiRes, videosRes] = await Promise.all([
          fetch('/api/banners?position=home'),
          fetch('/api/goods?hot=true&limit=8'),
          fetch('/api/news?limit=4'),
          fetch('/api/wiki/articles?limit=1&is_featured=true'),
          fetch('/api/videos?limit=4&is_featured=true'),
        ]);

        const [bannersData, goodsData, newsData, wikiData, videosData] = await Promise.all([
          bannersRes.json(),
          goodsRes.json(),
          newsRes.json(),
          wikiRes.json(),
          videosRes.json(),
        ]);

        if (bannersData.data) setBanners(bannersData.data);
        if (goodsData.data) setGoods(goodsData.data);
        if (newsData.data) setNews(newsData.data);
        if (wikiData.data?.[0]) setTodayArticle(wikiData.data[0]);
        if (videosData.data) setVideos(videosData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Banner 自动轮播
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const features = [
    { icon: Gift, title: t.home.features.freeGift, href: '/free-gifts' },
    { icon: ShieldCheck, title: t.nav.verify, href: '/verify' },
    { icon: BookOpen, title: t.home.features.wiki, href: '/wiki' },
    { icon: Sparkles, title: t.nav.aiAssistant, href: '/ai-assistant' },
  ];

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* 公告栏 */}
      <AnnouncementBar />
      
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        {banners.length > 0 ? (
          <>
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBanner ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
              </div>
            ))}
            {/* Banner 内容 */}
            <div className="absolute inset-0 flex items-end pb-16">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                    {t.home.banner.title}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mb-6">
                    {t.home.banner.subtitle}
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/shop">
                      {t.home.banner.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            {/* Banner 指示器 */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBanner
                        ? 'w-8 bg-primary'
                        : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* 默认背景 */
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            <div className="absolute inset-0 flex items-end pb-16">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    {t.home.banner.title}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mb-6">
                    {t.home.banner.subtitle}
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/shop">
                      {t.home.banner.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 功能入口 */}
      <section className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* 今日符箓 */}
      {todayArticle && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t.home.wiki}</h2>
            <Button variant="ghost" asChild>
              <Link href="/wiki" className="text-muted-foreground hover:text-foreground">
                {t.home.viewMore}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <Link href={`/wiki/${todayArticle.slug || todayArticle.id}`}>
            <Card className="group overflow-hidden md:flex hover:shadow-lg transition-all duration-300">
              <div className="relative w-full md:w-80 h-48 md:h-auto flex-shrink-0">
                {todayArticle.cover_image ? (
                  <Image
                    src={todayArticle.cover_image}
                    alt={todayArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/10">
                    <BookOpen className="text-6xl text-primary/30 w-16 h-16" />
                  </div>
                )}
              </div>
              <CardContent className="flex-1 p-6 md:p-8">
                <Badge className="mb-4">{t.home.recommendedReading}</Badge>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {todayArticle.title}
                </h3>
                {todayArticle.summary && (
                  <p className="text-muted-foreground line-clamp-3">
                    {todayArticle.summary}
                  </p>
                )}
                <Button variant="link" className="mt-4 p-0 text-primary">
                  {t.home.readFull}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* 免费领专属入口 */}
      <section className="container mx-auto px-4 py-4 -mt-4">
        <Link href="/free-gifts">
          <Card className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-0">
              <div className="relative p-6 md:p-8">
                {/* 背景装饰 */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-yellow-300/20 blur-xl" />
                  <Sparkles className="absolute top-4 right-20 w-6 h-6 text-yellow-200/60 animate-pulse" />
                  <Sparkles className="absolute bottom-6 right-32 w-4 h-4 text-yellow-200/40 animate-pulse delay-500" />
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl md:text-2xl font-bold">{t.home.freeGiftBanner.title}</h3>
                        <Badge className="bg-white/30 text-white border-0 animate-pulse">
                          {t.home.freeGiftBanner.limited}
                        </Badge>
                      </div>
                      <p className="text-white/90 text-sm md:text-base">
                        {t.home.freeGiftBanner.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-5 py-2.5 group-hover:bg-white/30 transition-colors">
                    <span className="font-medium">{t.home.freeGiftBanner.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <ArrowRight className="md:hidden w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* 热门法器 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t.home.hotGoods}</h2>
          <Button variant="ghost" asChild>
            <Link href="/shop" className="text-muted-foreground hover:text-foreground">
              {t.home.viewMore}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {goods.length > 0 ? (
            goods.map((item) => <GoodsCard key={item.id} item={item} t={t} />)
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t.common.noData}
            </div>
          )}
        </div>
      </section>

      {/* 精选推荐 */}
      <section className="bg-muted/30 py-8">
        <HomeRecommendations />
      </section>

      {/* 精选视频 */}
      {videos.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t.home.featuredVideos}</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/videos" className="text-muted-foreground hover:text-foreground">
                {t.home.moreVideos}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 玄门头条 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t.home.news}</h2>
          <Button variant="ghost" asChild>
            <Link href="/news" className="text-muted-foreground hover:text-foreground">
              {t.home.viewMore}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {news.length > 0 ? (
            news.map((item) => <NewsCard key={item.id} item={item} t={t} />)
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t.common.noData}
            </div>
          )}
        </div>
      </section>

      {/* 视频学堂入口 */}
      <section className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{t.nav.video}</h3>
                <p className="text-muted-foreground">{t.home.videoCategories}</p>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link href="/videos">
                {t.home.exploreVideos}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* 如愿 - 晒图分享入口 */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-primary/10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🙏</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{t.home.ruyuan.title}</h3>
                </div>
                <p className="text-muted-foreground text-lg mb-4">
                  {t.home.ruyuan.subtitle}
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t.home.ruyuan.description}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/shares">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {t.home.ruyuan.browse}
                  </Button>
                </Link>
                <Link href="/shares/publish">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="w-5 h-5" />
                    {t.home.ruyuan.publish}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
