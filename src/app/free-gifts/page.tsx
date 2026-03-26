/**
 * @fileoverview 免费领商品列表页面
 * @description 免费领取商品，支持邮寄或到店自取
 * @module app/free-gifts/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gift,
  Truck,
  MapPin,
  ChevronRight,
  Users,
  Tag,
  Zap,
  Flame,
  Sparkles,
  UserPlus,
  RefreshCw,
  ArrowUp,
  LayoutGrid,
  List,
} from 'lucide-react';
import { SimpleCountdown } from '@/components/free-gifts/CountdownTimer';
import { GiftListSkeleton } from '@/components/free-gifts/Skeleton';
import { ShareButton } from '@/components/free-gifts/ShareButton';
import { SearchBar } from '@/components/free-gifts/SearchBar';
import { ActionButtons } from '@/components/free-gifts/FavoriteButton';
import { ReviewPreview } from '@/components/free-gifts/ReviewList';
import { getMockReviews } from '@/components/free-gifts/ReviewList';
import { CategoryFilter, SortSelector, CategoryBadge } from '@/components/free-gifts/CategoryFilter';
import { RecommendList, HotRecommendBanner } from '@/components/free-gifts/RecommendList';
import { RefreshButton } from '@/components/free-gifts/PullToRefresh';
import { CustomerService } from '@/components/free-gifts/CustomerService';

interface FreeGift {
  id: number;
  name: string;
  description: string;
  image: string | null;
  original_price: string;
  stock: number;
  claimed: number;
  limit_per_user: number;
  shipping_fee: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
  merchant_id: number;
  is_new_user_only?: boolean;
  category?: string;
  rating?: number;
  review_count?: number;
  merchant?: {
    id: number;
    name: string;
    address: string;
  };
}

type FilterType = 'all' | 'hot' | 'ending_soon' | 'new_user';

export default function FreeGiftsPage() {
  const [gifts, setGifts] = useState<FreeGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    loadGifts();
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // 滚动监听
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadGifts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/free-gifts');
      const data = await res.json();
      if (data.success || data.data) {
        const giftsData = (data.data || []).map((g: FreeGift, idx: number) => ({
          ...g,
          is_new_user_only: idx === 0,
          category: ['符箓', '飾品', '香薰', '掛件'][idx % 4],
          rating: 4.5 + Math.random() * 0.5,
          review_count: Math.floor(Math.random() * 100) + 20,
        }));
        setGifts(giftsData);
      }
    } catch (error) {
      console.error('加载免费商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGifts();
    setRefreshing(false);
  };

  const getProgress = (gift: FreeGift) => {
    const total = gift.stock + gift.claimed;
    return total > 0 ? Math.round((gift.claimed / total) * 100) : 0;
  };

  const isExpired = (gift: FreeGift) => new Date(gift.end_time) < new Date();

  const getRemainingDays = (gift: FreeGift) => {
    const end = new Date(gift.end_time).getTime();
    const now = Date.now();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      const newSearches = [keyword, ...recentSearches.filter(s => s !== keyword)].slice(0, 5);
      setRecentSearches(newSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 过滤商品
  const filteredGifts = gifts.filter((gift) => {
    if (isExpired(gift) || gift.stock <= 0) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      if (!gift.name.toLowerCase().includes(kw) && !gift.description.toLowerCase().includes(kw)) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && gift.category !== selectedCategory) {
      return false;
    }
    switch (filter) {
      case 'hot': return getProgress(gift) >= 70;
      case 'ending_soon': return getRemainingDays(gift) <= 3;
      case 'new_user': return gift.is_new_user_only;
      default: return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return b.id - a.id;
      case 'hot': return getProgress(b) - getProgress(a);
      case 'ending': return getRemainingDays(a) - getRemainingDays(b);
      case 'price_high': return parseFloat(b.original_price) - parseFloat(a.original_price);
      case 'price_low': return parseFloat(a.original_price) - parseFloat(b.original_price);
      default: return 0;
    }
  });

  const stats = {
    total: gifts.filter(g => !isExpired(g) && g.stock > 0).length,
    hot: gifts.filter(g => getProgress(g) >= 70 && !isExpired(g) && g.stock > 0).length,
    endingSoon: gifts.filter(g => getRemainingDays(g) <= 3 && !isExpired(g) && g.stock > 0).length,
    newUser: gifts.filter(g => g.is_new_user_only && !isExpired(g) && g.stock > 0).length,
  };

  const mockReviews = getMockReviews();

  // 分类数据
  const categories = [
    { id: 'all', name: '全部', icon: '🎁' },
    { id: '符箓', name: '符箓', icon: '📜', count: gifts.filter(g => g.category === '符箓').length },
    { id: '飾品', name: '飾品', icon: '📿', count: gifts.filter(g => g.category === '飾品').length },
    { id: '香薰', name: '香薰', icon: '🪔', count: gifts.filter(g => g.category === '香薰').length },
    { id: '掛件', name: '掛件', icon: '🔮', count: gifts.filter(g => g.category === '掛件').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 pb-20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-white blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-yellow-300 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-8 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Gift className="w-10 h-10" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold">免費領</h1>
          </div>
          <p className="text-white/90 text-lg mb-2">精選好物 · 免費領取 · 郵寄或到店自取</p>
          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4" />郵寄僅付運費</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />到店免費領取</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* 搜索栏 */}
        <div className="mb-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="搜索商品名稱..."
            recentKeywords={recentSearches}
            onClearRecent={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }}
          />
        </div>

        {/* 分类筛选 */}
        <div className="mb-4">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="bg-white/80 backdrop-blur h-9">
              <TabsTrigger value="all" className="text-xs px-3">全部 ({stats.total})</TabsTrigger>
              <TabsTrigger value="hot" className="text-xs px-3">熱門 ({stats.hot})</TabsTrigger>
              <TabsTrigger value="new_user" className="text-xs px-3">新人 ({stats.newUser})</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <SortSelector value={sortBy} onChange={setSortBy} />
            <RefreshButton onRefresh={handleRefresh} loading={refreshing} />
          </div>
        </div>

        {/* 搜索结果提示 */}
        {searchKeyword && (
          <div className="mb-4 flex items-center justify-between bg-white/80 rounded-lg px-4 py-2">
            <p className="text-sm">搜索「{searchKeyword}」共找到 <span className="font-medium text-primary">{filteredGifts.length}</span> 個商品</p>
            <Button variant="ghost" size="sm" onClick={() => setSearchKeyword('')}>清除</Button>
          </div>
        )}

        {/* 热门推荐横幅 */}
        {!loading && !searchKeyword && filter === 'all' && (
          <div className="mb-4">
            <HotRecommendBanner gifts={filteredGifts.filter(g => getProgress(g) >= 70)} />
          </div>
        )}

        {/* 商品列表 */}
        {loading ? (
          <GiftListSkeleton count={6} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGifts.map((gift) => {
              const progress = getProgress(gift);
              const remainingDays = getRemainingDays(gift);
              const isHot = progress >= 70;
              const isEndingSoon = remainingDays <= 3;

              return (
                <Card key={gift.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50">
                    {gift.image ? (
                      <Image src={gift.image} alt={gift.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Gift className="w-20 h-20 text-red-300" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-red-500 text-white">免費</Badge>
                      {gift.is_new_user_only && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                          <UserPlus className="w-3 h-3 mr-1" />新人專享
                        </Badge>
                      )}
                      {isHot && !gift.is_new_user_only && (
                        <Badge className="bg-orange-500 text-white"><Flame className="w-3 h-3 mr-1" />熱門</Badge>
                      )}
                      {isEndingSoon && !isHot && !gift.is_new_user_only && (
                        <Badge className="bg-yellow-500 text-white"><Zap className="w-3 h-3 mr-1" />即將結束</Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded backdrop-blur-sm">
                      原價 HK${gift.original_price}
                    </div>
                    
                    <div className="absolute top-3 right-3 mt-10 flex flex-col gap-1">
                      <ActionButtons giftId={gift.id} giftName={gift.name} endTime={gift.end_time} />
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs flex items-center justify-between">
                        <SimpleCountdown endTime={gift.end_time} />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {gift.category && <CategoryBadge category={gift.category} />}
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{gift.name}</h3>
                      </div>
                      {gift.rating && (
                        <div className="flex items-center gap-1 text-xs flex-shrink-0">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{gift.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{gift.description}</p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>已領 {gift.claimed} 件</span>
                        <span className={isHot ? 'text-orange-600 font-medium' : ''}>剩餘 {gift.stock} 件</span>
                      </div>
                      <Progress value={progress} className={`h-2 ${isHot ? '[&>div]:bg-orange-500' : ''}`} />
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1 text-orange-600"><Truck className="w-4 h-4" />郵費 HK${gift.shipping_fee}</div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-1 text-green-600"><MapPin className="w-4 h-4" />到店免費</div>
                    </div>

                    {gift.merchant && (
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{gift.merchant.name}
                      </div>
                    )}

                    <Link href={`/free-gifts/${gift.id}`}>
                      <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 group-hover:shadow-md transition-shadow">
                        立即領取
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 无数据提示 */}
        {!loading && filteredGifts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchKeyword ? `沒有找到「${searchKeyword}」相關商品` : filter === 'all' ? '暫無免費領取商品' : '沒有符合條件的商品'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">敬請期待更多活動</p>
              {(filter !== 'all' || searchKeyword || selectedCategory !== 'all') && (
                <Button variant="outline" className="mt-4" onClick={() => { setFilter('all'); setSearchKeyword(''); setSelectedCategory('all'); }}>
                  查看全部商品
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* 推荐商品 */}
        {!loading && filteredGifts.length > 0 && (
          <div className="mt-8">
            <RecommendList title="猜你喜歡" gifts={gifts} maxShow={4} />
          </div>
        )}

        {/* 用户评价 */}
        {!loading && filteredGifts.length > 0 && (
          <Card className="mt-6">
            <CardContent className="py-6">
              <ReviewPreview reviews={mockReviews} />
            </CardContent>
          </Card>
        )}

        {/* 我的领取记录 */}
        <Card className="mt-6 hover:shadow-md transition-shadow">
          <CardContent className="py-4">
            <Link href="/user/free-gifts" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">我的領取記錄</p>
                  <p className="text-sm text-muted-foreground">查看已領取的商品</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 客服浮动按钮 */}
      <CustomerService variant="fab" />

      {/* 回到顶部 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-36 right-4 z-40 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
