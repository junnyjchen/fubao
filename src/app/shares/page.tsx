/**
 * @fileoverview 晒图分享列表页面
 * @description 如愿 - 用户晒图分享专区
 * @module app/shares/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RequireAuth } from '@/components/auth/RequireAuth';
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Play,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ImageIcon,
} from 'lucide-react';

interface Share {
  id: number;
  user_id: string;
  goods_id: number | null;
  content: string;
  images: string[];
  video_url: string | null;
  likes_count: number;
  comments_count: number;
  is_anonymous: boolean;
  created_at: string;
  users: {
    id: string;
    nickname: string;
    avatar: string | null;
  } | null;
  goods: {
    id: number;
    name: string;
    images: string[];
  } | null;
}

export default function SharesPage() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    if (!hasMore && page > 1) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/shares?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();

      if (data.success) {
        if (page === 1) {
          setShares(data.data.list);
        } else {
          setShares(prev => [...prev, ...data.data.list]);
        }
        setTotal(data.data.total);
        setHasMore(data.data.list.length === pageSize);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    loadShares();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-TW');
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold">如願</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                分享您的心願達成，記錄美好時刻
              </p>
            </div>
            <Link href="/shares/publish">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                發布分享
              </Button>
            </Link>
          </div>

          {/* 搜索和标签 */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索分享內容..." className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">全部</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">平安符</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">開光法器</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">心願達成</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">靈驗分享</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 分享列表 - 瀑布流布局 */}
      <div className="container mx-auto px-4 py-8">
        {loading && shares.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : shares.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">還沒有分享內容</p>
            <Link href="/shares/publish">
              <Button>成為第一個分享者</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shares.map((share) => (
                <Link key={share.id} href={`/shares/${share.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    {/* 图片或视频 */}
                    <div className="relative aspect-square bg-muted">
                      {share.images && share.images.length > 0 ? (
                        <Image
                          src={share.images[0]}
                          alt=""
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                          <ImageIcon className="w-12 h-12 text-primary/20" />
                        </div>
                      )}
                      
                      {/* 视频标识 */}
                      {share.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary ml-1" />
                          </div>
                        </div>
                      )}
                      
                      {/* 图片数量 */}
                      {share.images && share.images.length > 1 && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {share.images.length}張
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-3">
                      {/* 用户信息 */}
                      <div className="flex items-center gap-2 mb-2">
                        {share.is_anonymous ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs">匿</span>
                            </div>
                            <span className="text-xs text-muted-foreground">匿名用戶</span>
                          </>
                        ) : share.users ? (
                          <>
                            {share.users.avatar ? (
                              <Image
                                src={share.users.avatar}
                                alt=""
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs text-primary">
                                  {share.users.nickname?.[0] || '用'}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground truncate">
                              {share.users.nickname}
                            </span>
                          </>
                        ) : null}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(share.created_at)}
                        </span>
                      </div>

                      {/* 内容 */}
                      <p className="text-sm line-clamp-2 mb-2">{share.content}</p>

                      {/* 关联商品 */}
                      {share.goods && (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                          <div className="w-8 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                            {share.goods.images?.[0] && (
                              <Image
                                src={share.goods.images[0]}
                                alt=""
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="truncate text-muted-foreground">
                            {share.goods.name}
                          </span>
                        </div>
                      )}

                      {/* 互动数据 */}
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="w-3.5 h-3.5" />
                          {share.likes_count}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {share.comments_count}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 加载更多 */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      加載中...
                    </>
                  ) : (
                    '加載更多'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
