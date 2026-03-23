/**
 * @fileoverview 轮播图管理页面
 * @description 后台轮播图列表和管理
 * @module app/admin/banners/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: number;
  title: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  sort: number;
  status: boolean;
  created_at: string;
}

interface BannerForm {
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  sort: string;
  status: boolean;
}

const initialForm: BannerForm = {
  title: '',
  image_url: '',
  link_url: '',
  position: 'home',
  sort: '0',
  status: true,
};

export default function BannersManagePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>(initialForm);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners(data.data || []);
    } catch (error) {
      console.error('加载轮播图失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingId(banner.id);
      setForm({
        title: banner.title || '',
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        position: banner.position,
        sort: banner.sort.toString(),
        status: banner.status,
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
    if (!form.image_url) {
      toast.error('請輸入圖片URL');
      return;
    }

    try {
      const url = '/api/banners';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...form, sort: parseInt(form.sort) || 0 }
        : { ...form, sort: parseInt(form.sort) || 0 };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.data || data.message) {
        toast.success(editingId ? '更新成功' : '添加成功');
        handleCloseDialog();
        loadBanners();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('保存轮播图失败:', error);
      toast.error('保存失敗');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: !currentStatus }),
      });

      const data = await res.json();
      if (data.message) {
        setBanners(banners.map(b => 
          b.id === id ? { ...b, status: !currentStatus } : b
        ));
        toast.success('狀態已更新');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新失敗');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此輪播圖嗎？')) return;

    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.message) {
        setBanners(banners.filter(b => b.id !== id));
        toast.success('刪除成功');
      }
    } catch (error) {
      console.error('删除轮播图失败:', error);
      toast.error('刪除失敗');
    }
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      home: '首頁',
      shop: '商城',
      user: '用戶中心',
    };
    return labels[position] || position;
  };

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
                <h1 className="text-xl font-bold">輪播圖管理</h1>
                <p className="text-sm text-muted-foreground">共 {banners.length} 張輪播圖</p>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加輪播圖
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            載入中...
          </div>
        ) : banners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暫無輪播圖數據</p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                添加第一張輪播圖
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="relative aspect-[2/1] bg-muted">
                  <img
                    src={banner.image_url}
                    alt={banner.title || '輪播圖'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect fill="%23f0f0f0" width="200" height="100"/><text x="100" y="50" text-anchor="middle" fill="%23999" font-size="14">圖片載入失敗</text></svg>';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={banner.status ? 'default' : 'secondary'}>
                      {banner.status ? '啟用' : '禁用'}
                    </Badge>
                    <Badge variant="outline">
                      {getPositionLabel(banner.position)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  {banner.title && (
                    <h3 className="font-medium mb-2 truncate">{banner.title}</h3>
                  )}
                  {banner.link_url && (
                    <p className="text-sm text-muted-foreground mb-3 truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {banner.link_url}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.status}
                        onCheckedChange={() => handleToggleStatus(banner.id, banner.status)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {banner.status ? '啟用' : '禁用'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 添加/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '編輯輪播圖' : '添加輪播圖'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">圖片URL *</Label>
              <Input
                id="image_url"
                value={form.image_url}
                onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="請輸入圖片URL"
              />
              {form.image_url && (
                <div className="aspect-[2/1] bg-muted rounded overflow-hidden">
                  <img
                    src={form.image_url}
                    alt="預覽"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect fill="%23f0f0f0" width="200" height="100"/><text x="100" y="50" text-anchor="middle" fill="%23999" font-size="14">預覽</text></svg>';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="輪播圖標題（可選）"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link_url">跳轉鏈接</Label>
              <Input
                id="link_url"
                value={form.link_url}
                onChange={e => setForm(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="點擊後跳轉的鏈接（可選）"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">展示位置</Label>
                <Select
                  value={form.position}
                  onValueChange={v => setForm(prev => ({ ...prev, position: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">首頁</SelectItem>
                    <SelectItem value="shop">商城</SelectItem>
                    <SelectItem value="user">用戶中心</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sort">排序權重</Label>
                <Input
                  id="sort"
                  type="number"
                  value={form.sort}
                  onChange={e => setForm(prev => ({ ...prev, sort: e.target.value }))}
                  placeholder="數字越小越靠前"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="status">啟用狀態</Label>
              <Switch
                id="status"
                checked={form.status}
                onCheckedChange={v => setForm(prev => ({ ...prev, status: v }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? '保存修改' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
