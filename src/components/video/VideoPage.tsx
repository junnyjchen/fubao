/**
 * @fileoverview 视频学堂首页组件
 * @description 视频列表展示页面
 * @module components/video/VideoPage
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Eye, Clock, Loader2 } from 'lucide-react';

/** 视频分类类型 */
interface VideoCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  video_count?: number;
}

/** 视频类型 */
interface Video {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  video_url: string | null;
  duration: number;
  author: string;
  author_avatar: string | null;
  view_count: number;
  is_featured: boolean;
  tags: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * 格式化视频时长
 */
function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 视频卡片组件
 */
function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/video/${video.slug || video.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-video bg-muted">
          {video.cover_image ? (
            <Image
              src={video.cover_image}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Play className="w-8 h-8 text-primary ml-1" />
              </div>
            </div>
          )}
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70">
            {formatDuration(video.duration)}
          </Badge>
          {video.is_featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white hover:bg-amber-500">
              推薦
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[60%]">{video.author}</span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <Eye className="w-3 h-3" />
              {video.view_count.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * 视频学堂首页组件
 */
export function VideoPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, videosRes, featuredRes] = await Promise.all([
        fetch('/api/videos/categories'),
        fetch('/api/videos?limit=12&is_published=true'),
        fetch('/api/videos?limit=3&is_published=true&is_featured=true'),
      ]);

      const [catData, videosData, featuredData] = await Promise.all([
        catRes.json(),
        videosRes.json(),
        featuredRes.json(),
      ]);

      setCategories(catData.data || []);
      setVideos(videosData.data || []);
      setFeaturedVideos(featuredData.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 根据分类筛选视频
   */
  const filteredVideos = activeCategory === 'all'
    ? videos
    : videos.filter((v) => v.category?.id === parseInt(activeCategory));

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{t.video.title}</h1>
              <p className="text-lg text-muted-foreground">道長說符 · 法器開箱 · 宮觀巡禮</p>
            </div>
          </div>

          {/* 推荐视频横幅 */}
          {featuredVideos.length > 0 && (
            <div className="mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                {featuredVideos.map((video, index) => (
                  <Link key={video.id} href={`/video/${video.slug || video.id}`}>
                    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}>
                      <div className={`relative bg-muted ${index === 0 ? 'aspect-video' : 'aspect-video'}`}>
                        {video.cover_image ? (
                          <Image
                            src={video.cover_image}
                            alt={video.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                              <Play className="w-8 h-8 text-primary ml-1" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <Badge className="bg-amber-500 text-white mb-2 hover:bg-amber-500">
                            推薦
                          </Badge>
                          <h3 className={`font-semibold mb-1 group-hover:text-primary-foreground/80 transition-colors ${
                            index === 0 ? 'text-xl' : 'text-sm'
                          }`}>
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-white/80">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(video.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {video.view_count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Video Grid */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="all">全部</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id.toString()}>
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                  {cat.video_count !== undefined && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({cat.video_count})
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory}>
              {filteredVideos.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Play className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">暫無視頻</h3>
                    <p className="text-muted-foreground">該分類下暫無視頻內容</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>

      {/* 订阅提示 */}
      <section className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">訂閱符寶網視頻學堂</h3>
            <p className="text-muted-foreground mb-4">
              第一時間獲取道長說符、法器開箱、宮觀巡禮等精彩內容
            </p>
            <div className="flex gap-2 justify-center">
              <Badge variant="outline" className="px-4 py-2">
                📜 符籙知識
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                🗡️ 法器介紹
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                🏛️ 宮觀文化
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
