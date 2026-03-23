/**
 * @fileoverview 商品新增页面
 * @description 后台添加新商品
 * @module app/admin/goods/new/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { SingleImageUpload, ImageUpload } from '@/components/upload/ImageUpload';

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

export default function GoodsNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

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
      const res = await fetch('/api/goods', {
        method: 'POST',
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
          main_image: form.main_image || null,
          images: form.images.length > 0 ? form.images : null,
          description: form.description || null,
          is_certified: form.is_certified,
          status: form.status,
          sort: parseInt(form.sort) || 0,
        }),
      });

      const data = await res.json();
      
      if (data.data) {
        toast.success('商品添加成功');
        router.push('/admin/goods');
      } else {
        toast.error(data.error || '添加失敗');
      }
    } catch (error) {
      console.error('添加商品失败:', error);
      toast.error('添加商品失敗');
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

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/goods">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">添加商品</h1>
                <p className="text-sm text-muted-foreground">填寫商品信息</p>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存商品'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="media">圖片媒體</TabsTrigger>
            <TabsTrigger value="detail">詳細描述</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品名稱與分類</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">商品名稱 *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="請輸入商品名稱"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">商品副標題</Label>
                    <Input
                      id="subtitle"
                      value={form.subtitle}
                      onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="簡短描述商品特點"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">商品分類</Label>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品類型與用途</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="purpose">用途功效</Label>
                    <Select
                      value={form.purpose}
                      onValueChange={v => setForm(prev => ({ ...prev, purpose: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇用途" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peace">平安祈福</SelectItem>
                        <SelectItem value="wealth">招財進寶</SelectItem>
                        <SelectItem value="health">健康長壽</SelectItem>
                        <SelectItem value="love">姻緣和合</SelectItem>
                        <SelectItem value="career">事業順利</SelectItem>
                        <SelectItem value="study">學業進步</SelectItem>
                        <SelectItem value="protection">驅邪避凶</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">價格與庫存</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">售價 (HK$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="original_price">原價 (HK$)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={form.original_price}
                      onChange={e => setForm(prev => ({ ...prev, original_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">庫存數量</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={form.stock}
                      onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sort">排序權重</Label>
                    <Input
                      id="sort"
                      type="number"
                      value={form.sort}
                      onChange={e => setForm(prev => ({ ...prev, sort: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品狀態</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>認證商品</Label>
                    <p className="text-sm text-muted-foreground">是否為一物一證認證商品</p>
                  </div>
                  <Switch
                    checked={form.is_certified}
                    onCheckedChange={v => setForm(prev => ({ ...prev, is_certified: v }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 图片媒体 */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品主圖</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SingleImageUpload
                    value={form.main_image}
                    onChange={url => setForm(prev => ({ ...prev, main_image: url }))}
                    folder="goods"
                    maxSize={5}
                    placeholder="上傳主圖"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  建議尺寸: 800x800px，支持 JPG、PNG、WebP 格式
                </p>
                {/* URL输入备选 */}
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">或輸入圖片URL</Label>
                  <Input
                    value={form.main_image}
                    onChange={e => setForm(prev => ({ ...prev, main_image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品圖集</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={form.images}
                  onChange={urls => setForm(prev => ({ ...prev, images: urls }))}
                  maxCount={9}
                  folder="goods/gallery"
                  maxSize={5}
                  placeholder="點擊或拖拽圖片上傳商品圖集"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 详细描述 */}
          <TabsContent value="detail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品詳情</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="請輸入商品詳細描述..."
                  rows={12}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  支持換行和段落分隔，詳細描述會顯示在商品詳情頁面
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
