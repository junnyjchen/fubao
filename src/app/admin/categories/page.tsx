/**
 * @fileoverview 分类管理页面
 * @description 后台分类管理
 * @module app/admin/categories/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  GripVertical,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  icon: string | null;
  sort: number;
  status: boolean;
  created_at: string;
  children?: Category[];
}

export default function CategoriesManagePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    sort: 0,
    status: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon || '',
        sort: category.sort,
        status: category.status,
      });
    } else {
      setSelectedCategory(null);
      setFormData({ name: '', slug: '', icon: '', sort: 0, status: true });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      alert('請填寫分類名稱和別名');
      return;
    }

    try {
      const url = selectedCategory
        ? `/api/categories`
        : '/api/categories';
      const method = selectedCategory ? 'PUT' : 'POST';
      const body = selectedCategory
        ? { ...formData, id: selectedCategory.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.data || data.message) {
        setEditDialogOpen(false);
        loadCategories();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('保存分类失败:', error);
      alert('保存失敗，請重試');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      const res = await fetch(`/api/categories?id=${selectedCategory.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.message) {
        setDeleteDialogOpen(false);
        loadCategories();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      alert('刪除失敗，請重試');
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          status: !category.status,
        }),
      });

      const data = await res.json();
      if (data.message) {
        loadCategories();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
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
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">分類管理</h1>
                <p className="text-sm text-muted-foreground">共 {categories.length} 個分類</p>
              </div>
            </div>
            <Button onClick={() => handleOpenEdit()}>
              <Plus className="w-4 h-4 mr-2" />
              添加分類
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                載入中...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無分類數據</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">排序</TableHead>
                    <TableHead>分類名稱</TableHead>
                    <TableHead>別名</TableHead>
                    <TableHead className="text-center">狀態</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span>{category.sort}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={category.status}
                          onCheckedChange={() => handleToggleStatus(category)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? '編輯分類' : '添加分類'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">分類名稱 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="請輸入分類名稱"
              />
            </div>
            <div>
              <Label htmlFor="slug">別名 *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="用於URL，如：fulu"
              />
            </div>
            <div>
              <Label htmlFor="icon">圖標URL（選填）</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="圖標圖片URL"
              />
            </div>
            <div>
              <Label htmlFor="sort">排序</Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort}
                onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              />
              <Label htmlFor="status">啟用</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除分類「{selectedCategory?.name}」嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>確認刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
