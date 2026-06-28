/**
 * @fileoverview 商品编辑页面
 * @description 后台编辑商品信息，支持本地上传图片和富文本编辑
 * @module app/admin/goods/[id]/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

interface GoodsForm {
  name: string;
  subtitle: string;
  category_id: string;
  type: string;
  purpose: string;
  price: string;
  original_price: string;
  stock: string;
  main_image: string;
  images: string[];
  description: string;
  is_certified: boolean;
  status: boolean;
  sort: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GoodsEditPage({ params }: PageProps) {
  const router = useRouter();
  const [goodsId, setGoodsId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [form, setForm] = useState<GoodsForm>({
    name: '',
    subtitle: '',
    category_id: '',
    type: '1',
    purpose: '',
    price: '',
    original_price: '',
    stock: '0',
    main_image: '',
    images: [],
    description: '',
    is_certified: false,
    status: true,
    sort: '0',
  });

  useEffect(() => {
    params.then(p => setGoodsId(p.id));
  }, [params]);

  useEffect(() => {
    if (goodsId) {
      loadGoods();
      loadCategories();
    }
  }, [goodsId]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadGoods = async () => {
    try {
      const res = await fetch(`/api/goods/${goodsId}`);
      const data = await res.json();
      
      if (data.data) {
        const goods = data.data;
        setForm({
          name: goods.name || '',
          subtitle: goods.subtitle || '',
          category_id: goods.category_id?.toString() || '',
          type: goods.type?.toString() || '1',
          purpose: goods.purpose || '',
          price: goods.price || '',
          original_price: goods.original_price || '',
          stock: goods.stock?.toString() || '0',
          main_image: goods.main_image || '',
          images: goods.images || [],
          description: goods.description || '',
          is_certified: goods.is_certified || false,
          status: goods.status !== false,
          sort: goods.sort?.toString() || '0',
        });
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      toast.error('加載商品失敗');
    } finally {
      setInitialLoading(false);
    }
  };

  /** 富文本编辑器内的图片上传 */
  const handleEditorImageUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'goods/content');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.data) {
      return result.data.key ? `/api/file/${result.data.key}` : result.data.url;
    }
    throw new Error(result.error || '上傳失敗');
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('請填寫商品名稱');
      return;
    }
    if (!form.price) {
      toast.error('請填寫商品價格');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/goods/${goodsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          subtitle: form.subtitle || null,
          category_id: form.category_id ? parseInt(form.category_id) : null,
          type: parseInt(form.type),
          purpose: form.purpose || null,
          price: form.price,
          original_price: form.original_price || null,
          stock: parseInt(form.stock) || 0,
          main_image: form.images.length > 0 ? form.images[0] : null,
          images: form.images.length > 0 ? form.images : null,
          description: form.description || null,
          is_certified: form.is_certified,
          status: form.status,
          sort: parseInt(form.sort) || 0,
        }),
      });

      const data = await res.json();
      
      if (data.message || data.data) {
        toast.success('商品更新成功');
        router.push('/admin/goods');
      } else {
        toast.error(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('更新商品失败:', error);
      toast.error('更新商品失敗');
    } finally {
      setLoading(false);
    }
  };

  // 构建分类树
  const buildCategoryOptions = (cats: Category[], parentId: number | null = null, level = 0): React.ReactNode[] => {
    return cats
      .filter(c => c.parent_id === parentId)
      .flatMap(cat => [
        <SelectItem key={cat.id} value={cat.id.toString()}>
          {'　'.repeat(level)}{cat.name}
        </SelectItem>,
        ...buildCategoryOptions(cats, cat.id, level + 1),
      ]);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/goods">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">編輯商品</h1>
                <p className="text-sm text-muted-foreground">ID: {goodsId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/goods">取消</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 商品名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">商品名稱 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="請輸入商品名稱"
              />
            </div>

            {/* 副标题 */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">副標題</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="簡短描述商品特點"
              />
            </div>

            {/* 售价 + 原价 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">售價 *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">原價</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={form.original_price}
                  onChange={e => setForm(prev => ({ ...prev, original_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* 库存 + 分类 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">庫存 *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">分類</Label>
                <Select
                  value={form.category_id}
                  onValueChange={v => setForm(prev => ({ ...prev, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">無分類</SelectItem>
                    {buildCategoryOptions(categories)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 商品类型 + 用途 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">商品類型</Label>
                <Select
                  value={form.type}
                  onValueChange={v => setForm(prev => ({ ...prev, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">符箓</SelectItem>
                    <SelectItem value="2">法器</SelectItem>
                    <SelectItem value="3">開光物品</SelectItem>
                    <SelectItem value="4">書籍</SelectItem>
                    <SelectItem value="5">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">用途</Label>
                <Input
                  id="purpose"
                  value={form.purpose}
                  onChange={e => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="如：鎮宅、招財"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品图片（第一张为主图） */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">商品圖片</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ImageUpload
              value={form.images}
              onChange={urls => setForm(prev => ({ ...prev, images: urls }))}
              maxCount={9}
              folder="goods"
              maxSize={5}
              placeholder="點擊或拖拽圖片上傳（第一張為主圖）"
            />
            <p className="text-xs text-muted-foreground">
              第一張圖片將作為商品主圖，建議尺寸 800x800px，支持 JPG、PNG、WebP 格式，最多9張
            </p>
          </CardContent>
        </Card>

        {/* 商品描述 - 富文本编辑器 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">商品描述</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={form.description}
              onChange={html => setForm(prev => ({ ...prev, description: html }))}
              placeholder="詳細描述商品信息"
              height={400}
              onImageUpload={handleEditorImageUpload}
            />
          </CardContent>
        </Card>

        {/* 商品选项 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">其他選項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>認證商品</Label>
                <p className="text-sm text-muted-foreground">開光/加持認證</p>
              </div>
              <Switch
                checked={form.is_certified}
                onCheckedChange={v => setForm(prev => ({ ...prev, is_certified: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>上架狀態</Label>
                <p className="text-sm text-muted-foreground">商品是否在前台展示</p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={v => setForm(prev => ({ ...prev, status: v }))}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
