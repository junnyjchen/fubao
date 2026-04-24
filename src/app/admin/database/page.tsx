/**
 * @fileoverview 后台数据管理页面
 * @description 管理轮播图、分类等数据
 * @module app/admin/database/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Database,
  ExternalLink,
  GripVertical,
} from 'lucide-react';

/** 轮播图数据类型 */
interface Banner {
  id: number;
  title: string;
  image: string;
  link: string;
  position: string;
  status: boolean;
  sort: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

/** 位置映射 */
const positionLabels: Record<string, string> = {
  home: '首頁輪播',
  product: '商品頁',
  article: '文章頁',
  news: '新聞頁',
};

/**
 * 后台数据管理页面组件
 * @returns 数据管理页面
 */
export default function DatabaseManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [positionFilter, setPositionFilter] = useState('all');

  // 编辑弹窗状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    position: 'home',
    status: true,
    sort: 0,
    start_time: '',
    end_time: '',
  });

  /**
   * 加载轮播图列表
   */
  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        position: positionFilter,
        status: 'all',
      });

      const res = await fetch(`/api/banners?${params}`);
      const data = await res.json();

      setBanners(data.data || []);
    } catch (error) {
      console.error('加載輪播圖失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [positionFilter]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  /**
   * 打开编辑弹窗
   * @param banner - 要编辑的轮播图
   */
  const handleEdit = (banner: Banner) => {
    setEditBanner(banner);
    setFormData({
      title: banner.title || '',
      image: banner.image,
      link: banner.link || '',
      position: banner.position || 'home',
      status: banner.status,
      sort: banner.sort || 0,
      start_time: banner.start_time || '',
      end_time: banner.end_time || '',
    });
    setEditDialogOpen(true);
  };

  /**
   * 打开新增弹窗
   */
  const handleCreate = () => {
    setEditBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '',
      position: 'home',
      status: true,
      sort: 0,
      start_time: '',
      end_time: '',
    });
    setEditDialogOpen(true);
  };

  /**
   * 保存轮播图
   */
  const handleSave = async () => {
    try {
      const method = editBanner ? 'PUT' : 'POST';
      const id = editBanner ? editBanner.id : '';

      const res = await fetch(
        editBanner ? `/api/banners/${id}` : '/api/banners',
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.message) {
        setEditDialogOpen(false);
        loadBanners();
      } else {
        alert(data.error || '保存失敗');
      }
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗');
    }
  };

  /**
   * 删除轮播图
   * @param id - 轮播图ID
   */
  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此輪播圖嗎？')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.message) {
        loadBanners();
      } else {
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗');
    }
  };

  /**
   * 切换状态
   * @param banner - 轮播图
   */
  const handleToggleStatus = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !banner.status }),
      });

      const data = await res.json();

      if (data.message) {
        loadBanners();
      }
    } catch (error) {
      console.error('狀態切換失敗:', error);
    }
  };

  return (
    <AdminLayout title="數據管理" description="管理輪播圖、分類等數據">
      <div className="space-y-6">
        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 items-center">
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部位置</SelectItem>
                {Object.entries(positionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新增輪播圖
          </Button>
        </div>

        {/* 数据标签页 */}
        <Tabs defaultValue="banners">
          <TabsList>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              輪播圖管理
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              其他數據
            </TabsTrigger>
          </TabsList>

          {/* 轮播图管理 */}
          <TabsContent value="banners">
            <Card>
              <CardHeader>
                <CardTitle>輪播圖列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    載入中...
                  </div>
                ) : banners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暫無輪播圖
                  </div>
                ) : (
                  <div className="space-y-4">
                    {banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        
                        {/* 图片预览 */}
                        <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                          {banner.image ? (
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {banner.title || '未命名輪播圖'}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {positionLabels[banner.position] || banner.position}
                            </Badge>
                            {banner.link && (
                              <a
                                href={banner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <ExternalLink className="w-3 h-3" />
                                查看鏈接
                              </a>
                            )}
                            <span>排序: {banner.sort}</span>
                          </div>
                          {banner.start_time && banner.end_time && (
                            <p className="text-xs text-muted-foreground mt-1">
                              展示時間: {new Date(banner.start_time).toLocaleDateString()} - {new Date(banner.end_time).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {/* 操作 */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={banner.status ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(banner)}
                          >
                            {banner.status ? '啟用' : '禁用'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(banner.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 其他数据 */}
          <TabsContent value="other">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>商品分類</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    商品分類管理功能開發中...
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>文章分類</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    文章分類管理功能開發中...
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>支付配置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    支付配置功能開發中...
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>物流配置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    物流配置功能開發中...
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editBanner ? '編輯輪播圖' : '新增輪播圖'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="請輸入標題（選填）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">圖片URL *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="請輸入圖片URL"
              />
              {formData.image && (
                <div className="mt-2 rounded overflow-hidden border">
                  <img
                    src={formData.image}
                    alt="預覽"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">跳轉鏈接</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="點擊後跳轉的鏈接（選填）"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>展示位置</Label>
                <Select
                  value={formData.position}
                  onValueChange={(v) =>
                    setFormData({ ...formData, position: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇位置" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(positionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">排序</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                  }
                  placeholder="數字越小越靠前"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">開始時間</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">結束時間</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">啟用</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!formData.image}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
