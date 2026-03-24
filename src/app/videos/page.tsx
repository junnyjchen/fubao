/**
 * @fileoverview 视频学堂页面
 * @description 玄门文化视频学习平台
 * @module app/videos/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Play,
  Clock,
  Eye,
  ThumbsUp,
  Search,
  Loader2,
  Flame,
  Star,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  description?: string;
  cover_image: string;
  video_url: string;
  duration: number;
  category_id: number;
  category_name: string;
  author?: string;
  views: number;
  likes: number;
  is_free: boolean;
  is_featured: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

interface VideoCategory {
  id: number;
  name: string;
  video_count: number;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedLevel, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, videosRes] = await Promise.all([
        fetch('/api/videos/categories'),
        fetch(`/api/videos?${buildParams()}`),
      ]);

      const catData = await catRes.json();
      const videosData = await videosRes.json();

      setCategories(catData.data || []);
      setVideos(videosData.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildParams = () => {
    const params = new URLSearchParams();
    params.set('limit', '20');
    if (keyword) params.set('keyword', keyword);
    if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
    if (selectedLevel !== 'all') params.set('level', selectedLevel);
    if (sortBy) params.set('sort', sortBy);
    return params.toString();
  };

  const handleSearch = () => {
    loadData();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelBadge = (level: string) => {
    const levels: Record<string, { label: string; className: string }> = {
      beginner: { label: '入門', className: 'bg-green-100 text-green-800' },
      intermediate: { label: '進階', className: 'bg-yellow-100 text-yellow-800' },
      advanced: { label: '高級', className: 'bg-red-100 text-red-800' },
    };
    const l = levels[level] || levels.beginner;
    return <Badge className={l.className}>{l.label}</Badge>;
  };

  // 推荐视频
  const featuredVideos = videos.filter(v => v.is_featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-white/20">視頻學堂</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                傳承道家智慧<br />開啟修行之門
              </h1>
              <p className="text-lg opacity-80 mb-6">
                匯集名家講座、儀式教學、經典解讀等優質視頻內容
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  開始學習
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-white/30 hover:bg-white/10">
                  瀏覽課程
                </Button>
              </div>
            </div>
            {featuredVideos[0] && (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={featuredVideos[0].cover_image}
                  alt={featuredVideos[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-red-500 mb-2">精選</Badge>
                  <h3 className="font-semibold text-lg">{featuredVideos[0].title}</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索視頻課程..."
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分類</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="難度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部難度</SelectItem>
              <SelectItem value="beginner">入門</SelectItem>
              <SelectItem value="intermediate">進階</SelectItem>
              <SelectItem value="advanced">高級</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新發布</SelectItem>
              <SelectItem value="popular">最多觀看</SelectItem>
              <SelectItem value="likes">最多點讚</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 分类标签 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            全部
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id.toString() ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id.toString())}
            >
              {cat.name}
              <Badge variant="secondary" className="ml-2">{cat.video_count}</Badge>
            </Button>
          ))}
        </div>

        {/* 精选视频 */}
        {featuredVideos.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-lg">精選課程</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredVideos.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={video.cover_image}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                      {video.is_free && (
                        <Badge className="absolute top-2 left-2 bg-green-500">免費</Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium line-clamp-2 text-sm mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </span>
                        {getLevelBadge(video.level)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 全部视频 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">全部課程</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暫無相關視頻</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={video.cover_image}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                      {video.is_free && (
                        <Badge className="absolute top-2 left-2 bg-green-500">免費</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{video.category_name}</Badge>
                        {getLevelBadge(video.level)}
                      </div>
                      <h3 className="font-medium line-clamp-2 mb-2">{video.title}</h3>
                      {video.author && (
                        <p className="text-sm text-muted-foreground mb-2">講師：{video.author}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {video.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* 加载更多 */}
          {videos.length >= 20 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">加載更多</Button>
            </div>
          )}
        </section>

        {/* 学习统计 */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-muted-foreground">精品課程</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-muted-foreground">知名講師</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10萬+</p>
                  <p className="text-muted-foreground">學習人次</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">98%</p>
                  <p className="text-muted-foreground">好評率</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
