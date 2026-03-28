'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SingleImageUpload } from '@/components/upload/ImageUpload';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

// 与数据库字段一致的 Banner 类型
interface Banner {
  id: number;
  title: string | null;
  image: string;
  link: string | null;
  position: string;
  sort: number;
  status: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    position: 'home',
    sort: 0,
    status: true,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.banners) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('加載輪播圖失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '',
      position: 'home',
      sort: 0,
      status: true,
      start_date: '',
      end_date: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      image: banner.image,
      link: banner.link || '',
      position: banner.position,
      sort: banner.sort,
      status: banner.status,
      start_date: banner.start_date?.split('T')[0] || '',
      end_date: banner.end_date?.split('T')[0] || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此輪播圖嗎？')) return;

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadBanners();
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          status: !banner.status,
        }),
      });

      if (res.ok) {
        loadBanners();
      }
    } catch (error) {
      console.error('更新狀態失敗:', error);
    }
  };

  const handleMoveUp = async (banner: Banner) => {
    const index = banners.findIndex(b => b.id === banner.id);
    if (index <= 0) return;

    try {
      const res = await fetch('/api/admin/banners/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          direction: 'up',
        }),
      });

      if (res.ok) {
        loadBanners();
      }
    } catch (error) {
      console.error('排序失敗:', error);
    }
  };

  const handleMoveDown = async (banner: Banner) => {
    const index = banners.findIndex(b => b.id === banner.id);
    if (index >= banners.length - 1) return;

    try {
      const res = await fetch('/api/admin/banners/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          direction: 'down',
        }),
      });

      if (res.ok) {
        loadBanners();
      }
    } catch (error) {
      console.error('排序失敗:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert('請上傳輪播圖片');
      return;
    }

    setSubmitting(true);
    try {
      const url = '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';
      const body = editingBanner
        ? { ...formData, id: editingBanner.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setDialogOpen(false);
        loadBanners();
      } else {
        const data = await res.json();
        alert(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('提交失敗:', error);
      alert('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  // 判断是否为外部链接
  const isExternalLink = (link: string | null) => {
    if (!link) return false;
    return link.startsWith('http://') || link.startsWith('https://');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">輪播圖管理</h1>
            <p className="text-muted-foreground">管理首頁及其他頁面的輪播圖</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadBanners} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              新增輪播圖
            </Button>
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 建議輪播圖尺寸：1920 x 500 像素，支持 JPG、PNG 格式，文件大小不超過 5MB
            </p>
          </CardContent>
        </Card>

        {/* Banners Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">排序</TableHead>
                <TableHead className="w-24">預覽</TableHead>
                <TableHead>標題</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>鏈接</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>有效期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    載入中...
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暫無輪播圖數據
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveUp(banner)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveDown(banner)}
                          disabled={index === banners.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20 h-12 rounded overflow-hidden bg-muted">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title || 'Banner'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{banner.title || '(無標題)'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {banner.position === 'home' ? '首頁' : banner.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          {isExternalLink(banner.link) && <ExternalLink className="w-3 h-3" />}
                          {banner.link.length > 20 ? banner.link.slice(0, 20) + '...' : banner.link}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">無鏈接</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.status}
                        onCheckedChange={() => handleToggleStatus(banner)}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {banner.start_date && banner.end_date ? (
                        <span>
                          {formatDate(banner.start_date)} ~ {formatDate(banner.end_date)}
                        </span>
                      ) : (
                        '長期有效'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? '編輯輪播圖' : '新增輪播圖'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="請輸入標題（選填）"
              />
            </div>

            <div className="space-y-2">
              <Label>輪播圖片 *</Label>
              <SingleImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                maxSize={5}
                folder="banners"
                placeholder="點擊上傳輪播圖片"
              />
              <p className="text-xs text-muted-foreground">
                建議尺寸：1920 x 500 像素，支持 JPG、PNG 格式
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">鏈接地址</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/shop 或 https://example.com"
              />
              <p className="text-xs text-muted-foreground">
                站內鏈接請輸入路徑（如 /shop），站外鏈接請輸入完整 URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">顯示位置</Label>
              <Select
                value={formData.position}
                onValueChange={(v) => setFormData({ ...formData, position: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">首頁</SelectItem>
                  <SelectItem value="shop">商城頁</SelectItem>
                  <SelectItem value="baike">百科頁</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">開始時間</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">結束時間</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="status">啟用狀態</Label>
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(v) => setFormData({ ...formData, status: v })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '提交中...' : '保存'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
