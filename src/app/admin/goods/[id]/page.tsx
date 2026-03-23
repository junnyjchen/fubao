/**
 * @fileoverview 商品编辑页面
 * @description 后台编辑商品信息
 * @module app/admin/goods/[id]/page
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
import { Badge } from '@/components/ui/badge';
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
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [newImageUrl, setNewImageUrl] = useState('');
  
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
      setCategories(data.data || []);
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
          main_image: form.main_image || null,
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

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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
        <div className="max-w-5xl mx-auto px-4 py-4">
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
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存修改'}
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
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        value={form.main_image}
                        onChange={e => setForm(prev => ({ ...prev, main_image: e.target.value }))}
                        placeholder="輸入圖片URL"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      建議尺寸: 800x800px，支持 JPG、PNG 格式
                    </p>
                  </div>
                  {form.main_image && (
                    <div className="relative w-24 h-24 border rounded overflow-hidden">
                      <img
                        src={form.main_image}
                        alt="主圖"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%23999" font-size="12">預覽</text></svg>';
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-5 h-5"
                        onClick={() => setForm(prev => ({ ...prev, main_image: '' }))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">商品圖集</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="輸入圖片URL"
                    onKeyDown={e => e.key === 'Enter' && addImage()}
                  />
                  <Button onClick={addImage} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative aspect-square border rounded overflow-hidden">
                        <img
                          src={img}
                          alt={`圖片 ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%23999" font-size="12">預覽</text></svg>';
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-5 h-5"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
