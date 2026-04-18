/**
 * @fileoverview 新闻资讯管理页面
 * @description 后台新闻列表和管理
 * @module app/admin/news/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Search,
  Pin,
} from 'lucide-react';
import { toast } from 'sonner';

interface News {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  cover_image: string | null;
  category: string;
  is_top: boolean;
  status: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

interface NewsForm {
  title: string;
  summary: string;
  content: string;
  cover_image: string;
  category: string;
  is_top: boolean;
  status: boolean;
}

const initialForm: NewsForm = {
  title: '',
  summary: '',
  content: '',
  cover_image: '',
  category: 'news',
  is_top: false,
  status: true,
};

const categoryLabels: Record<string, string> = {
  news: '新聞動態',
  culture: '玄門文化',
  knowledge: '符箓知識',
  notice: '公告通知',
};

export default function NewsManagePage() {
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NewsForm>(initialForm);
  const limit = 15;

  // 图片上传回调
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || '上传失败');
    return data.url;
  }, []);

  useEffect(() => {
    loadNews();
  }, [page, categoryFilter]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeAll: 'true',
      });

      if (categoryFilter !== 'all') {
        params.set('category', categoryFilter);
      }

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();

      setNews(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('加载新闻失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: News) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        title: item.title,
        summary: item.summary || '',
        content: item.content || '',
        cover_image: item.cover_image || '',
        category: item.category,
        is_top: item.is_top,
        status: item.status,
      });
    } else {
      setEditingId(null);
      setForm(initialForm);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('請填寫新聞標題');
      return;
    }

    try {
      const url = '/api/news';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...form }
        : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.data || data.message) {
        toast.success(editingId ? '更新成功' : '添加成功');
        handleCloseDialog();
        loadNews();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('保存新闻失败:', error);
      toast.error('保存失敗');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: !currentStatus }),
      });

      const data = await res.json();
      if (data.message) {
        setNews(news.map(n => 
          n.id === id ? { ...n, status: !currentStatus } : n
        ));
        toast.success('狀態已更新');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新失敗');
    }
  };

  const handleToggleTop = async (id: number, currentTop: boolean) => {
    try {
      const res = await fetch('/api/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_top: !currentTop }),
      });

      const data = await res.json();
      if (data.message) {
        setNews(news.map(n => 
          n.id === id ? { ...n, is_top: !currentTop } : n
        ));
        toast.success(currentTop ? '已取消置頂' : '已置頂');
      }
    } catch (error) {
      console.error('更新置顶失败:', error);
      toast.error('更新失敗');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此新聞嗎？')) return;

    try {
      const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.message) {
        setNews(news.filter(n => n.id !== id));
        toast.success('刪除成功');
      }
    } catch (error) {
      console.error('删除新闻失败:', error);
      toast.error('刪除失敗');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">新聞資訊管理</h1>
                <p className="text-sm text-muted-foreground">共 {total} 篇新聞</p>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              發布新聞
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="搜索新聞標題..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={() => { setPage(1); loadNews(); }}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="分類篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分類</SelectItem>
                  <SelectItem value="news">新聞動態</SelectItem>
                  <SelectItem value="culture">玄門文化</SelectItem>
                  <SelectItem value="knowledge">符箓知識</SelectItem>
                  <SelectItem value="notice">公告通知</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                載入中...
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無新聞數據</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>標題</TableHead>
                    <TableHead className="w-[100px]">分類</TableHead>
                    <TableHead className="w-[80px] text-center">瀏覽</TableHead>
                    <TableHead className="w-[100px] text-center">狀態</TableHead>
                    <TableHead className="w-[120px]">發布時間</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.is_top && (
                            <Pin className="w-4 h-4 text-primary" />
                          )}
                          <span className="font-medium truncate max-w-[300px]">
                            {item.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[item.category] || item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {item.view_count}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.status ? 'default' : 'secondary'}>
                          {item.status ? '已發布' : '草稿'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.published_at 
                          ? new Date(item.published_at).toLocaleDateString('zh-TW')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(item)}
                            title="編輯"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleTop(item.id, item.is_top)}
                            title={item.is_top ? '取消置頂' : '置頂'}
                          >
                            <Pin className={`w-4 h-4 ${item.is_top ? 'text-primary' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            title={item.status ? '下線' : '發布'}
                          >
                            {item.status ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  第 {page} / {totalPages} 頁
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 添加/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '編輯新聞' : '發布新聞'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">標題 *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="請輸入新聞標題"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分類</Label>
                <Select
                  value={form.category}
                  onValueChange={v => setForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">新聞動態</SelectItem>
                    <SelectItem value="culture">玄門文化</SelectItem>
                    <SelectItem value="knowledge">符箓知識</SelectItem>
                    <SelectItem value="notice">公告通知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cover_image">封面圖片URL</Label>
                <Input
                  id="cover_image"
                  value={form.cover_image}
                  onChange={e => setForm(prev => ({ ...prev, cover_image: e.target.value }))}
                  placeholder="請輸入封面圖片URL"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea
                id="summary"
                value={form.summary}
                onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="請輸入新聞摘要（選填）"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">內容</Label>
              <RichTextEditor
                value={form.content}
                onChange={(content) => setForm(prev => ({ ...prev, content }))}
                placeholder="請輸入新聞內容..."
                onImageUpload={handleImageUpload}
              />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_top"
                  checked={form.is_top}
                  onCheckedChange={v => setForm(prev => ({ ...prev, is_top: v }))}
                />
                <Label htmlFor="is_top">置頂顯示</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="status"
                  checked={form.status}
                  onCheckedChange={v => setForm(prev => ({ ...prev, status: v }))}
                />
                <Label htmlFor="status">立即發布</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? '保存修改' : '發布'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
