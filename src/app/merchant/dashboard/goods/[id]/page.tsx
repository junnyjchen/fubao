/**
 * @fileoverview 商户商品编辑页面
 * @description 商户编辑已发布商品
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Package,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Shield,
  AlertCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';

interface GoodsData {
  id: number;
  name: string;
  category_id: number;
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
  sales: number;
  created_at: string;
}

export default function MerchantGoodsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [form, setForm] = useState<GoodsData | null>(null);

  useEffect(() => {
    loadGoods();
  }, [resolvedParams.id]);

  const loadGoods = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setForm({
        id: parseInt(resolvedParams.id),
        name: '開光平安符',
        category_id: 1,
        price: 288,
        original_price: 388,
        stock: 156,
        unit: '件',
        description: '武當山道觀開光加持，保佑平安吉祥',
        content: '<h2>商品詳情</h2><p>這是一款經過正統道教開光儀式加持的平安符...</p>',
        images: ['/goods/pinganfu-1.jpg', '/goods/pinganfu-2.jpg'],
        video_url: '',
        has_cert: true,
        cert_type: '開光認證',
        keywords: '平安符,開光,武當山',
        status: 1,
        sales: 1250,
        created_at: '2026-03-01',
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      toast.error('加載商品失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!form) return;

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

    setSaving(true);
    try {
      // 调用API更新商品
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(isDraft ? '商品已保存為草稿' : '商品更新成功');
      router.push('/merchant/dashboard/goods');
    } catch (error) {
      console.error('更新商品失败:', error);
      toast.error('操作失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('商品已刪除');
      router.push('/merchant/dashboard/goods');
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  if (loading || !form) {
    return (
      <MerchantLayout title="編輯商品" description="修改商品信息">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="編輯商品" description="修改商品信息">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" asChild>
          <Link href="/merchant/dashboard/goods">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回商品列表
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Link href={`/shop/${form.id}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              預覽商品
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            刪除商品
          </Button>
        </div>
      </div>

      {/* 商品状态信息 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">商品ID</p>
                <p className="font-mono">{form.id}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <p className="text-sm text-muted-foreground">狀態</p>
                <Badge className={form.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {form.status === 1 ? '銷售中' : '已下架'}
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <p className="text-sm text-muted-foreground">銷量</p>
                <p className="font-medium">{form.sales}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <p className="text-sm text-muted-foreground">創建時間</p>
                <p>{form.created_at}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
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
                      <Label>商品名稱 <span className="text-destructive">*</span></Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="請輸入商品名稱"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>商品分類 <span className="text-destructive">*</span></Label>
                      <Select
                        value={form.category_id?.toString()}
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
                        placeholder="請輸入商品簡介"
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
                        <Label>售價 (HK$) <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>原價 (HK$)</Label>
                        <Input
                          type="number"
                          value={form.original_price}
                          onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>庫存 <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          value={form.stock}
                          onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
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
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="請輸入商品詳情內容"
                      rows={12}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">商品視頻</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>視頻鏈接</Label>
                      <Input
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                        placeholder="請輸入視頻鏈接"
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧信息 */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">保存設置</CardTitle>
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
                      <SelectItem value="0">下架</SelectItem>
                      <SelectItem value="1">上架銷售</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存修改
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmit(true)}
                    disabled={saving}
                  >
                    保存為草稿
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* 删除确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              確認刪除
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>確定要刪除商品「{form.name}」嗎？</p>
            <p className="text-sm text-muted-foreground mt-2">此操作不可恢復，已產生的訂單數據將保留。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
