'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Eye, Clock } from 'lucide-react';

// 模拟视频数据
const mockVideos = [
  {
    id: 1,
    title: '道長說符：鎮宅符的正確貼法',
    cover: null,
    duration: 285,
    category: 1,
    views: 12580,
    author: '青城山道長',
  },
  {
    id: 2,
    title: '法器開箱：開光銅錢劍',
    cover: null,
    duration: 420,
    category: 2,
    views: 8920,
    author: '符寶網官方',
  },
  {
    id: 3,
    title: '龍虎山天師府巡禮',
    cover: null,
    duration: 680,
    category: 3,
    views: 15600,
    author: '玄門遊記',
  },
  {
    id: 4,
    title: '開光法會現場直播回放',
    cover: null,
    duration: 3600,
    category: 4,
    views: 25400,
    author: '武當山道觀',
  },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPage() {
  const { t } = useI18n();

  const categoryOptions = [
    { id: 'all', label: '全部' },
    { id: '1', label: t.video.categories.master },
    { id: '2', label: t.video.categories.unboxing },
    { id: '3', label: t.video.categories.tour },
    { id: '4', label: t.video.categories.live },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.video.title}</h1>
          <p className="text-lg text-muted-foreground">道長說符 · 法器開箱 · 宮觀巡禮</p>
        </div>
      </section>

      {/* Video Grid */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            {categoryOptions.map((opt) => (
              <TabsTrigger key={opt.id} value={opt.id}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockVideos.map((video) => (
                <Link key={video.id} href={`/video/${video.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-video bg-muted">
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <Play className="w-8 h-8 text-primary ml-1" />
                        </div>
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                        {formatDuration(video.duration)}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{video.author}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
