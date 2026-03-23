/**
 * @fileoverview 视频播放详情页组件
 * @description 视频播放页面，包含视频播放器、信息展示和相关推荐
 * @module components/video/VideoDetailPage
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Eye,
  Clock,
  ThumbsUp,
  Share2,
  ArrowLeft,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';

/** 视频详情类型 */
interface VideoDetail {
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
  like_count: number;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

/** 相关视频类型 */
interface RelatedVideo {
  id: number;
  title: string;
  slug: string | null;
  cover_image: string | null;
  duration: number;
  author: string;
  view_count: number;
  category?: {
    id: number;
    name: string;
  };
}

interface VideoDetailPageProps {
  videoId: string;
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
 * 视频播放详情页组件
 */
export function VideoDetailPage({ videoId }: VideoDetailPageProps) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  /**
   * 加载视频详情
   */
  const loadVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/videos/${videoId}`);
      const data = await res.json();

      if (data.data) {
        setVideo(data.data);
        setRelatedVideos(data.related || []);
      } else {
        setError(data.error || '視頻不存在');
      }
    } catch (err) {
      setError('加載失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 点赞
   */
  const handleLike = async () => {
    if (!video || liked) return;
    setLiked(true);
    // 这里可以调用API更新点赞数
  };

  /**
   * 分享
   */
  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description || video.title,
          url: window.location.href,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      // 复制链接
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Play className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{error || '視頻不存在'}</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/video')}>
          返回視頻列表
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 返回按钮 */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 主内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 视频播放器 */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                {video.video_url ? (
                  <video
                    src={video.video_url}
                    poster={video.cover_image || undefined}
                    controls
                    className="w-full h-full"
                  >
                    您的浏览器不支持视频播放
                  </video>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-10 h-10 text-primary ml-1" />
                      </div>
                      <p className="text-muted-foreground">視頻加載中...</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 视频信息 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {video.category && (
                      <Link href={`/video?category=${video.category.id}`}>
                        <Badge variant="outline" className="mb-2">
                          {video.category.name}
                        </Badge>
                      </Link>
                    )}
                    <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>
                  </div>
                  {video.is_featured && (
                    <Badge className="bg-amber-500 text-white">推薦</Badge>
                  )}
                </div>

                {/* 统计信息 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.view_count.toLocaleString()} 次觀看
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(video.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(video.created_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>

                {/* 作者信息 */}
                <div className="flex items-center gap-3 mb-4">
                  {video.author_avatar ? (
                    <Image
                      src={video.author_avatar}
                      alt={video.author}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{video.author}</p>
                    <p className="text-xs text-muted-foreground">創作者</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={liked ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleLike}
                    disabled={liked}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {liked ? '已點讚' : '點讚'} {video.like_count + (liked ? 1 : 0)}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                </div>

                <Separator className="my-4" />

                {/* 视频描述 */}
                {video.description && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-base font-semibold mb-2">視頻簡介</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {video.description}
                    </p>
                  </div>
                )}

                {/* 标签 */}
                {video.tags && video.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 相关视频 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">相關視頻</h3>
                <div className="space-y-3">
                  {relatedVideos.length > 0 ? (
                    relatedVideos.map((rv) => (
                      <Link
                        key={rv.id}
                        href={`/video/${rv.slug || rv.id}`}
                        className="flex gap-3 group"
                      >
                        <div className="relative w-28 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                          {rv.cover_image ? (
                            <Image
                              src={rv.cover_image}
                              alt={rv.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-primary/10">
                              <Play className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <Badge className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1">
                            {formatDuration(rv.duration)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {rv.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rv.author}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rv.view_count.toLocaleString()} 次觀看
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      暫無相關視頻
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 返回列表 */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/video">
                    查看全部視頻
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
