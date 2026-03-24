/**
 * @fileoverview 视频详情页面
 * @description 视频播放与学习
 * @module app/videos/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  ChevronRight,
  User,
  MessageSquare,
  Loader2,
} from 'lucide-react';

interface VideoDetail {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  video_url: string;
  duration: number;
  category_id: number;
  category_name: string;
  author: string;
  author_avatar?: string;
  author_intro?: string;
  views: number;
  likes: number;
  dislikes: number;
  is_free: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  chapters: Array<{ title: string; time: number }>;
  related_videos: Array<{
    id: number;
    title: string;
    cover_image: string;
    duration: number;
    views: number;
  }>;
  created_at: string;
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userLiked, setUserLiked] = useState<'like' | 'dislike' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [resolvedParams.id]);

  const loadVideo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${resolvedParams.id}`);
      const data = await res.json();
      setVideo(data.data || null);
    } catch (error) {
      console.error('加载视频失败:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">視頻不存在</p>
        <Button asChild>
          <Link href="/videos">返回視頻列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 返回按钮 */}
      <div className="bg-background border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/videos">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回視頻學堂
            </Link>
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 视频播放器 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 播放器 */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
              <img
                src={video.cover_image}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-primary" />
                  ) : (
                    <Play className="w-10 h-10 text-primary ml-1" />
                  )}
                </button>
              </div>
              
              {/* 控制栏 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 text-white">
                  <button onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 h-1 bg-white/30 rounded-full">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm">0:00 / {formatDuration(video.duration)}</span>
                  <button>
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 视频信息 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{video.category_name}</Badge>
                    {getLevelBadge(video.level)}
                    {video.is_free && <Badge className="bg-green-500">免費</Badge>}
                  </div>
                  <h1 className="text-xl font-bold">{video.title}</h1>
                </div>
              </div>

              {/* 统计和操作 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views.toLocaleString()} 次觀看
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(video.created_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={userLiked === 'like' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserLiked(userLiked === 'like' ? null : 'like')}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {video.likes + (userLiked === 'like' ? 1 : 0)}
                  </Button>
                  <Button
                    variant={userLiked === 'dislike' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserLiked(userLiked === 'dislike' ? null : 'dislike')}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {video.dislikes + (userLiked === 'dislike' ? 1 : 0)}
                  </Button>
                  <Button
                    variant={isBookmarked ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 讲师信息 */}
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {video.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{video.author}</p>
                  {video.author_intro && (
                    <p className="text-sm text-muted-foreground">{video.author_intro}</p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  關注
                </Button>
              </div>

              <Separator />

              {/* 视频简介 */}
              <div>
                <h3 className="font-semibold mb-2">視頻簡介</h3>
                <p className="text-muted-foreground whitespace-pre-line">{video.description}</p>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* 章节 */}
              {video.chapters && video.chapters.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">課程目錄</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {video.chapters.map((chapter, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              {i + 1}
                            </span>
                            <span className="text-sm">{chapter.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(chapter.time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 评论区 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    評論 ({video.views})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea placeholder="發表您的看法..." rows={2} />
                      <div className="flex justify-end mt-2">
                        <Button size="sm">發表評論</Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground py-4">
                    暫無評論，快來發表第一條評論吧！
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右侧推荐 */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">相關推薦</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {video.related_videos.map((v) => (
                    <Link key={v.id} href={`/videos/${v.id}`}>
                      <div className="flex gap-3 p-3 hover:bg-muted/50 transition-colors">
                        <div className="w-32 aspect-video bg-muted rounded overflow-hidden relative flex-shrink-0">
                          <img src={v.cover_image} alt={v.title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                            {formatDuration(v.duration)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{v.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {v.views.toLocaleString()} 次觀看
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">學習須知</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 請在安靜環境下觀看學習</p>
                <p>• 建議佩戴耳機獲得更好體驗</p>
                <p>• 課程內容僅供學習參考</p>
                <p>• 請勿用於商業用途</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
