/**
 * @fileoverview 商户商品发布页面
 * @description 商户发布新商品
 * @module app/merchant/dashboard/goods/new/page
 */

'use client';

import { useState } from 'react';
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
  Send,
  Loader2,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';

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

export default function MerchantGoodsNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    // 表单验证
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
    if (form.stock < 0) {
      toast.error('庫存不能為負數');
      return;
    }
    if (form.images.length === 0) {
      toast.error('請上傳至少一張商品圖片');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/goods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: isDraft ? 0 : 1,
          merchant_id: 1, // TODO: 从登录状态获取
        }),
      });

      const data = await res.json();

      if (data.data) {
        toast.success(isDraft ? '商品已保存為草稿' : '商品發布成功');
        router.push('/merchant/dashboard/goods');
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('发布商品失败:', error);
      toast.error('操作失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MerchantLayout title="發布商品" description="添加新商品到店鋪">
      {/* 返回按钮 */}
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
                <TabsTrigger value="cert">
                  <Shield className="w-4 h-4 mr-2" />
                  認證信息
                </TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">商品信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        商品名稱 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="請輸入商品名稱"
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {form.name.length}/100
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        商品分類 <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.category_id?.toString() || ''}
                        onValueChange={(v) => setForm({ ...form, category_id: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇分類" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">符箓類</SelectItem>
                          <SelectItem value="2">法器類</SelectItem>
                          <SelectItem value="3">書籍類</SelectItem>
                          <SelectItem value="4">服飾類</SelectItem>
                          <SelectItem value="5">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>商品簡介</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="請輸入商品簡介（用於列表展示）"
                        rows={3}
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>搜索關鍵詞</Label>
                      <Input
                        value={form.keywords}
                        onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                        placeholder="多個關鍵詞用逗號分隔"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      價格與庫存
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          售價 (HK$) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          value={form.price || ''}
                          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>原價 (HK$)</Label>
                        <Input
                          type="number"
                          value={form.original_price || ''}
                          onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00（用於顯示折扣）"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          庫存 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          value={form.stock || ''}
                          onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>單位</Label>
                        <Select
                          value={form.unit}
                          onValueChange={(v) => setForm({ ...form, unit: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="件">件</SelectItem>
                            <SelectItem value="個">個</SelectItem>
                            <SelectItem value="套">套</SelectItem>
                            <SelectItem value="本">本</SelectItem>
                            <SelectItem value="張">張</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      商品圖片
                    </CardTitle>
                    <CardDescription>第一張圖片將作為商品主圖，建議尺寸 800x800</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      value={form.images}
                      onChange={(urls) => setForm({ ...form, images: urls })}
                      maxCount={9}
                      folder="merchant/goods"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 商品详情 */}
              <TabsContent value="detail" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">商品詳情</CardTitle>
                    <CardDescription>詳細介紹商品特點、使用方法等</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="請輸入商品詳情內容（支持HTML格式）"
                      rows={12}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">商品視頻</CardTitle>
                    <CardDescription>添加商品展示視頻（選填）</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>視頻鏈接</Label>
                      <Input
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                        placeholder="請輸入視頻鏈接（支持優酷、騰訊視頻等）"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 认证信息 */}
              <TabsContent value="cert" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      一物一證認證
                    </CardTitle>
                    <CardDescription>
                      為商品開通認證服務，每個商品可生成唯一認證證書
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">開啟認證</p>
                        <p className="text-sm text-muted-foreground">
                          商品售出後自動生成認證證書
                        </p>
                      </div>
                      <Switch
                        checked={form.has_cert}
                        onCheckedChange={(checked) => setForm({ ...form, has_cert: checked })}
                      />
                    </div>

                    {form.has_cert && (
                      <div className="space-y-2">
                        <Label>認證類型</Label>
                        <Select
                          value={form.cert_type}
                          onValueChange={(v) => setForm({ ...form, cert_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇認證類型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="開光認證">開光認證</SelectItem>
                            <SelectItem value="真品認證">真品認證</SelectItem>
                            <SelectItem value="收藏認證">收藏認證</SelectItem>
                            <SelectItem value="傳承認證">傳承認證</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">認證權益</p>
                        <ul className="mt-1 space-y-1 text-blue-600">
                          <li>• 每件商品生成唯一認證編號</li>
                          <li>• 支持二維碼掃碼驗證</li>
                          <li>• 提升商品信譽與價值</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧信息 */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">發布設置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>商品狀態</Label>
                  <Select
                    value={form.status.toString()}
                    onValueChange={(v) => setForm({ ...form, status: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">草稿</SelectItem>
                      <SelectItem value="1">立即上架</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* 发布按钮 */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        發布中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        發布商品
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存草稿
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">發布須知</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 商品名稱不能超過100個字符</p>
                <p>• 商品圖片建議尺寸800x800像素</p>
                <p>• 草稿可隨時編輯發布</p>
                <p>• 上架商品需經平台審核</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </MerchantLayout>
  );
}
