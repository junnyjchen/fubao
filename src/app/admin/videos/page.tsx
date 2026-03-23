/**
 * @fileoverview 后台视频管理页面
 * @description 管理视频分类和视频内容
 * @module app/admin/videos/page
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Eye,
  Clock,
  Search,
  Loader2,
} from 'lucide-react';

/** 视频分类类型 */
interface VideoCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
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
  view_count: number;
  is_published: boolean;
  is_featured: boolean;
  tags: string[];
  category?: VideoCategory;
  created_at: string;
}

/** 视频表单类型 */
interface VideoFormData {
  title: string;
  category_id: string;
  description: string;
  cover_image: string;
  video_url: string;
  duration: number;
  author: string;
  is_published: boolean;
  is_featured: boolean;
  tags: string;
}

/** 分类表单类型 */
interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
}

/**
 * 格式化视频时长
 */
function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 后台视频管理页面组件
 */
export default function AdminVideosPage() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 视频表单状态
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState<VideoFormData>({
    title: '',
    category_id: '',
    description: '',
    cover_image: '',
    video_url: '',
    duration: 0,
    author: '符寶網官方',
    is_published: false,
    is_featured: false,
    tags: '',
  });

  // 分类表单状态
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VideoCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, videoRes] = await Promise.all([
        fetch('/api/videos/categories'),
        fetch('/api/videos?limit=100'),
      ]);

      const [catData, videoData] = await Promise.all([
        catRes.json(),
        videoRes.json(),
      ]);

      setCategories(catData.data || []);
      setVideos(videoData.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存视频
   */
  const handleSaveVideo = async () => {
    try {
      const method = editingVideo ? 'PUT' : 'POST';
      const url = editingVideo
        ? `/api/videos/${editingVideo.id}`
        : '/api/videos';

      const body = {
        ...videoForm,
        category_id: videoForm.category_id ? parseInt(videoForm.category_id) : null,
        tags: videoForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setVideoDialogOpen(false);
        loadData();
        resetVideoForm();
      }
    } catch (error) {
      console.error('保存视频失败:', error);
    }
  };

  /**
   * 删除视频
   */
  const handleDeleteVideo = async (id: number) => {
    if (!confirm('確定要刪除這個視頻嗎？')) return;

    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('删除视频失败:', error);
    }
  };

  /**
   * 保存分类
   */
  const handleSaveCategory = async () => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `/api/videos/categories/${editingCategory.id}`
        : '/api/videos/categories';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        setCategoryDialogOpen(false);
        loadData();
        resetCategoryForm();
      }
    } catch (error) {
      console.error('保存分类失败:', error);
    }
  }

  /**
   * 删除分类
   */
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('確定要刪除這個分類嗎？')) return;

    try {
      const res = await fetch(`/api/videos/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('删除分类失败:', error);
    }
  };

  /**
   * 重置视频表单
   */
  const resetVideoForm = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      category_id: '',
      description: '',
      cover_image: '',
      video_url: '',
      duration: 0,
      author: '符寶網官方',
      is_published: false,
      is_featured: false,
      tags: '',
    });
  };

  /**
   * 重置分类表单
   */
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: '',
      sort_order: 0,
    });
  };

  /**
   * 编辑视频
   */
  const editVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      category_id: video.category?.id?.toString() || '',
      description: video.description || '',
      cover_image: video.cover_image || '',
      video_url: video.video_url || '',
      duration: video.duration,
      author: video.author,
      is_published: video.is_published,
      is_featured: video.is_featured,
      tags: video.tags?.join(', ') || '',
    });
    setVideoDialogOpen(true);
  };

  /**
   * 编辑分类
   */
  const editCategory = (category: VideoCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order,
    });
    setCategoryDialogOpen(true);
  };

  // 筛选视频
  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">視頻管理</h1>
        </div>

        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="videos">視頻列表</TabsTrigger>
            <TabsTrigger value="categories">分類管理</TabsTrigger>
          </TabsList>

          {/* 视频列表 */}
          <TabsContent value="videos" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索視頻..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetVideoForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增視頻
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVideo ? '編輯視頻' : '新增視頻'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>標題 *</Label>
                      <Input
                        value={videoForm.title}
                        onChange={(e) =>
                          setVideoForm({ ...videoForm, title: e.target.value })
                        }
                        placeholder="視頻標題"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>分類</Label>
                      <Select
                        value={videoForm.category_id}
                        onValueChange={(v) =>
                          setVideoForm({ ...videoForm, category_id: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇分類" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.icon && `${cat.icon} `}{cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>描述</Label>
                      <Textarea
                        value={videoForm.description}
                        onChange={(e) =>
                          setVideoForm({ ...videoForm, description: e.target.value })
                        }
                        placeholder="視頻描述"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>封面圖片URL</Label>
                        <Input
                          value={videoForm.cover_image}
                          onChange={(e) =>
                            setVideoForm({ ...videoForm, cover_image: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>視頻URL</Label>
                        <Input
                          value={videoForm.video_url}
                          onChange={(e) =>
                            setVideoForm({ ...videoForm, video_url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>作者</Label>
                        <Input
                          value={videoForm.author}
                          onChange={(e) =>
                            setVideoForm({ ...videoForm, author: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>時長（秒）</Label>
                        <Input
                          type="number"
                          value={videoForm.duration}
                          onChange={(e) =>
                            setVideoForm({
                              ...videoForm,
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>標籤（逗號分隔）</Label>
                      <Input
                        value={videoForm.tags}
                        onChange={(e) =>
                          setVideoForm({ ...videoForm, tags: e.target.value })
                        }
                        placeholder="符籙, 道教, 入門"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={videoForm.is_published}
                          onCheckedChange={(v) =>
                            setVideoForm({ ...videoForm, is_published: v })
                          }
                        />
                        <Label>發布</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={videoForm.is_featured}
                          onCheckedChange={(v) =>
                            setVideoForm({ ...videoForm, is_featured: v })
                          }
                        />
                        <Label>推薦</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setVideoDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button onClick={handleSaveVideo}>保存</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>標題</TableHead>
                        <TableHead>分類</TableHead>
                        <TableHead>作者</TableHead>
                        <TableHead>時長</TableHead>
                        <TableHead>觀看</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVideos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            暫無視頻數據
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVideos.map((video) => (
                          <TableRow key={video.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-10 rounded bg-muted flex items-center justify-center">
                                  <Play className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium">{video.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {video.category?.name || '-'}
                            </TableCell>
                            <TableCell>{video.author}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(video.duration)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {video.view_count}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {video.is_published ? (
                                  <Badge variant="default">已發布</Badge>
                                ) : (
                                  <Badge variant="secondary">草稿</Badge>
                                )}
                                {video.is_featured && (
                                  <Badge variant="outline">推薦</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editVideo(video)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVideo(video.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 分类管理 */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetCategoryForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增分類
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? '編輯分類' : '新增分類'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>名稱 *</Label>
                      <Input
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Slug</Label>
                      <Input
                        value={categoryForm.slug}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, slug: e.target.value })
                        }
                        placeholder="URL標識"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>描述</Label>
                      <Textarea
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>圖標</Label>
                        <Input
                          value={categoryForm.icon}
                          onChange={(e) =>
                            setCategoryForm({ ...categoryForm, icon: e.target.value })
                          }
                          placeholder="📜"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>排序</Label>
                        <Input
                          type="number"
                          value={categoryForm.sort_order}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              sort_order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCategoryDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button onClick={handleSaveCategory}>保存</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>圖標</TableHead>
                      <TableHead>名稱</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>排序</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          暫無分類數據
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="text-xl">
                            {category.icon || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description || '-'}
                          </TableCell>
                          <TableCell>{category.sort_order}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editCategory(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
