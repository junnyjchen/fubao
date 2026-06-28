/**
 * @fileoverview 商户商品编辑页面
 * @description 商户编辑已有商品（真实API版）
 * @module app/merchant/dashboard/goods/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  Shield,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface GoodsForm {
  name: string;
  category_id: number | null;
  price: number;
  original_price: number;
  stock: number;
  unit: string;
  description: string;
  content: string;
  images: string[];
  video_url: string;
  has_cert: boolean;
  cert_type: string;
  keywords: string;
  status: number;
}

export default function MerchantGoodsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState<GoodsForm>({
    name: '',
    category_id: null,
    price: 0,
    original_price: 0,
    stock: 0,
    unit: '件',
    description: '',
    content: '',
    images: [],
    video_url: '',
    has_cert: false,
    cert_type: '',
    keywords: '',
    status: 0,
  });

  // 加载商品数据
  useEffect(() => {
    const loadGoods = async () => {
      try {
        const merchantToken = localStorage.getItem('merchant_token');
        const res = await fetch(`/api/merchant/goods?id=${id}`, {
          headers: merchantToken ? { 'Authorization': `Bearer ${merchantToken}` } : {},
        });
        const data = await res.json();

        if (data.success && data.data) {
          const g = data.data;
          // 解析 specs
          let certType = '';
          if (g.specs) {
            try {
              const specsObj = typeof g.specs === 'string' ? JSON.parse(g.specs) : g.specs;
              certType = specsObj?.cert_type || '';
            } catch { /* ignore */ }
          }
          // 解析 images
          let images: string[] = [];
          if (Array.isArray(g.images)) {
            images = g.images;
          } else if (typeof g.images === 'string' && g.images.trim()) {
            try { images = JSON.parse(g.images); } catch { images = g.images.split(',').filter(Boolean); }
          }

          setForm({
            name: g.name || '',
            category_id: g.category_id || null,
            price: parseFloat(g.price) || 0,
            original_price: parseFloat(g.original_price) || 0,
            stock: g.stock || 0,
            unit: '件',
            description: g.description || '',
            content: g.detail || '',
            images,
            video_url: '',
            has_cert: !!g.is_certified,
            cert_type: certType,
            keywords: g.subtitle || '',
            status: g.status ?? 0,
          });
        } else {
          toast.error('商品不存在或無權訪問');
          router.push('/merchant/dashboard/goods');
        }
      } catch (error) {
        console.error('加載商品失敗:', error);
        toast.error('加載商品失敗');
        router.push('/merchant/dashboard/goods');
      } finally {
        setPageLoading(false);
      }
    };
    loadGoods();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('請填寫商品名稱');
      return;
    }
    if (!form.category_id) {
      toast.error('請選擇商品分類');
      return;
    }
    if (form.price <= 0) {
      toast.error('請填寫有效的售價');
      return;
    }

    setLoading(true);
    try {
      const merchantToken = localStorage.getItem('merchant_token');
      const res = await fetch('/api/merchant/goods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(merchantToken ? { 'Authorization': `Bearer ${merchantToken}` } : {}),
        },
        body: JSON.stringify({
          id: parseInt(id),
          name: form.name,
          subtitle: form.keywords || '',
          price: form.price,
          original_price: form.original_price || null,
          stock: form.stock,
          category_id: form.category_id,
          type: 1,
          purpose: '',
          description: form.description,
          detail: form.content || null,
          main_image: form.images[0] || '',
          images: form.images,
          is_certified: form.has_cert,
          specs: form.cert_type ? JSON.stringify({ cert_type: form.cert_type }) : null,
          status: isDraft ? 0 : 1,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('商品更新成功');
        router.push('/merchant/dashboard/goods');
      } else {
        toast.error(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('更新商品失敗:', error);
      toast.error('操作失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <MerchantLayout title="編輯商品" description="">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="編輯商品" description="修改商品信息">
      <Button variant="ghost" className="mb-4" asChild>
        <Link href="/merchant/dashboard/goods">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回商品列表
        </Link>
      </Button>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧表单 */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">
                  <Package className="w-4 h-4 mr-2" />
                  基本信息
                </TabsTrigger>
                <TabsTrigger value="detail">
                  <FileText className="w-4 h-4 mr-2" />
                  商品詳情
                </TabsTrigger>
                <TabsTrigger value="images">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  商品圖片
                </TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                    <CardDescription>填寫商品的基本屬性信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>商品名稱 *</Label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="請輸入商品名稱"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>商品分類 *</Label>
                        <Select
                          value={form.category_id?.toString() || ''}
                          onValueChange={(v) => setForm(f => ({ ...f, category_id: parseInt(v) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇分類" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">符籙</SelectItem>
                            <SelectItem value="2">法器</SelectItem>
                            <SelectItem value="3">書籍</SelectItem>
                            <SelectItem value="4">服飾</SelectItem>
                            <SelectItem value="5">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>關鍵詞</Label>
                        <Input
                          value={form.keywords}
                          onChange={(e) => setForm(f => ({ ...f, keywords: e.target.value }))}
                          placeholder="搜索關鍵詞，空格分隔"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>售價 (HKD) *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>原價 (HKD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.original_price}
                            onChange={(e) => setForm(f => ({ ...f, original_price: parseFloat(e.target.value) || 0 }))}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>庫存 *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={form.stock}
                          onChange={(e) => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <Separator />
                    <div className="space-y-2">
                      <Label>商品簡介</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="簡要描述商品特點"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 商品详情 */}
              <TabsContent value="detail">
                <Card>
                  <CardHeader>
                    <CardTitle>商品詳情</CardTitle>
                    <CardDescription>豐富的商品詳細描述</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      value={form.content}
                      onChange={(value) => setForm(f => ({ ...f, content: value }))}
                      placeholder="請輸入商品詳細描述..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 商品图片 */}
              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle>商品圖片</CardTitle>
                    <CardDescription>上傳商品圖片，第一張為封面圖，支持多張</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>商品圖片（第一張為封面）</Label>
                      <ImageUpload
                        value={form.images}
                        onChange={(images) => setForm(f => ({ ...f, images }))}
                        maxCount={9}
                        folder="merchant/goods"
                      />
                      {form.images.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">圖片預覽（拖動調整順序，第一張為封面）</p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {form.images.map((img, idx) => (
                              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                <img src={img} alt={`商品圖${idx + 1}`} className="w-full h-full object-cover" />
                                {idx === 0 && (
                                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                    封面
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const newImages = form.images.filter((_, i) => i !== idx);
                                    setForm(f => ({ ...f, images: newImages }));
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={form.has_cert}
                        onCheckedChange={(v) => setForm(f => ({ ...f, has_cert: v }))}
                      />
                      <div>
                        <Label>開光/認證商品</Label>
                        <p className="text-sm text-muted-foreground">標記此商品經過開光或認證</p>
                      </div>
                    </div>
                    {form.has_cert && (
                      <div className="space-y-2 ml-9">
                        <Label>認證類型</Label>
                        <Input
                          value={form.cert_type}
                          onChange={(e) => setForm(f => ({ ...f, cert_type: e.target.value }))}
                          placeholder="如：道教開光、佛教加持等"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧操作 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>發布設置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={form.status === 1}
                    onCheckedChange={(v) => setForm(f => ({ ...f, status: v ? 1 : 0 }))}
                  />
                  <div>
                    <Label>立即上架</Label>
                    <p className="text-sm text-muted-foreground">關閉則保存為草稿</p>
                  </div>
                </div>
                <Separator />
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  保存修改
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                >
                  保存為草稿
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>商品預覽</CardTitle>
              </CardHeader>
              <CardContent>
                {form.images.length > 0 ? (
                  <div className="space-y-2">
                    <img
                      src={form.images[0]}
                      alt={form.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {form.images.length > 1 && (
                      <div className="flex gap-1">
                        {form.images.slice(1, 5).map((img, idx) => (
                          <img key={idx} src={img} alt="" className="w-1/4 aspect-square object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <h3 className="font-medium mt-2 line-clamp-2">{form.name || '未命名商品'}</h3>
                <p className="text-primary font-bold">HK${form.price}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </MerchantLayout>
  );
}
