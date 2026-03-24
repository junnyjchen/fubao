/**
 * @fileoverview 后台公告管理页面
 * @description 管理平台公告
 * @module app/admin/announcements/page
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Search,
  Pin,
  Megaphone,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

/** 公告数据类型 */
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'notice' | 'activity' | 'update' | 'warning';
  is_pinned: boolean;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

/** 公告类型配置 */
const typeConfig = {
  notice: { label: '通知', color: 'bg-blue-100 text-blue-800', icon: Info },
  activity: { label: '活動', color: 'bg-green-100 text-green-800', icon: Megaphone },
  update: { label: '更新', color: 'bg-purple-100 text-purple-800', icon: Bell },
  warning: { label: '警告', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

/**
 * 后台公告管理页面
 */
export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'notice' as 'notice' | 'activity' | 'update' | 'warning',
    is_pinned: false,
    is_active: true,
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  /**
   * 加载公告列表
   */
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      setAnnouncements(data.data || []);
    } catch (error) {
      console.error('加载公告失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开新建弹窗
   */
  const openCreateDialog = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'notice',
      is_pinned: false,
      is_active: true,
      start_time: '',
      end_time: '',
    });
    setDialogOpen(true);
  };

  /**
   * 打开编辑弹窗
   */
  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_pinned: announcement.is_pinned,
      is_active: announcement.is_active,
      start_time: announcement.start_time?.split('T')[0] || '',
      end_time: announcement.end_time?.split('T')[0] || '',
    });
    setDialogOpen(true);
  };

  /**
   * 打开删除弹窗
   */
  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('請填寫公告標題和內容');
      return;
    }

    setSubmitting(true);
    try {
      const url = selectedAnnouncement
        ? `/api/admin/announcements/${selectedAnnouncement.id}`
        : '/api/admin/announcements';
      const method = selectedAnnouncement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
        }),
      });

      const data = await res.json();
      if (data.message || data.data) {
        toast.success(selectedAnnouncement ? '更新成功' : '創建成功');
        setDialogOpen(false);
        loadAnnouncements();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 删除公告
   */
  const handleDelete = async () => {
    if (!selectedAnnouncement) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/announcements/${selectedAnnouncement.id}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      if (data.message) {
        toast.success('刪除成功');
        setDeleteDialogOpen(false);
        loadAnnouncements();
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('刪除失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 切换状态
   */
  const toggleStatus = async (announcement: Announcement) => {
    try {
      const res = await fetch(
        `/api/admin/announcements/${announcement.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !announcement.is_active }),
        }
      );

      const data = await res.json();
      if (data.message) {
        loadAnnouncements();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新失敗');
    }
  };

  /**
   * 切换置顶
   */
  const togglePinned = async (announcement: Announcement) => {
    try {
      const res = await fetch(
        `/api/admin/announcements/${announcement.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_pinned: !announcement.is_pinned }),
        }
      );

      const data = await res.json();
      if (data.message) {
        loadAnnouncements();
      }
    } catch (error) {
      console.error('更新置顶失败:', error);
      toast.error('更新失敗');
    }
  };

  // 筛选公告
  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      a.content.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <AdminLayout title="公告管理">
      {/* 操作栏 */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索公告..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              發布公告
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 公告列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            公告列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無公告</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">置頂</TableHead>
                  <TableHead>標題</TableHead>
                  <TableHead className="w-24">類型</TableHead>
                  <TableHead className="w-24">狀態</TableHead>
                  <TableHead className="w-32">有效期</TableHead>
                  <TableHead className="w-32">創建時間</TableHead>
                  <TableHead className="w-32 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => {
                  const typeInfo = typeConfig[announcement.type];
                  return (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <button
                          onClick={() => togglePinned(announcement)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <Pin
                            className={`w-4 h-4 ${
                              announcement.is_pinned
                                ? 'text-primary fill-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {announcement.is_pinned && (
                            <Badge variant="secondary" className="text-xs">
                              置頂
                            </Badge>
                          )}
                          <span className="font-medium">
                            {announcement.title}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {announcement.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={announcement.is_active}
                          onCheckedChange={() => toggleStatus(announcement)}
                        />
                      </TableCell>
                      <TableCell>
                        {announcement.start_time && announcement.end_time ? (
                          <div className="text-xs">
                            <div>{announcement.start_time.split('T')[0]}</div>
                            <div className="text-muted-foreground">至</div>
                            <div>{announcement.end_time.split('T')[0]}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            長期有效
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(announcement)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(announcement)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAnnouncement ? '編輯公告' : '發布公告'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                公告標題 *
              </label>
              <Input
                placeholder="請輸入公告標題"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                公告內容 *
              </label>
              <Textarea
                placeholder="請輸入公告內容"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  公告類型
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notice">通知</SelectItem>
                    <SelectItem value="activity">活動</SelectItem>
                    <SelectItem value="update">更新</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">狀態</label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <span className="text-sm">
                    {formData.is_active ? '已啟用' : '已停用'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_pinned}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_pinned: checked })
                }
              />
              <span className="text-sm">置頂顯示</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  生效日期
                </label>
                <Input
                  type="date"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  截止日期
                </label>
                <Input
                  type="date"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              不設置日期則長期有效
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedAnnouncement ? '保存' : '發布'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除公告「{selectedAnnouncement?.title}」嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
