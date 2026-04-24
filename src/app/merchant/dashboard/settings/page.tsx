/**
 * @fileoverview 商户店铺设置页面
 * @description 商户管理店铺基本信息、运营设置
 * @module app/merchant/dashboard/settings/page
 */

'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Store,
  Save,
  Shield,
  Bell,
  Truck,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';

interface MerchantSettings {
  id: number;
  name: string;
  type: number;
  logo: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  province: string;
  city: string;
  status: boolean;
  rating: number;
  total_sales: number;
  // 运营设置
  auto_accept_order: boolean;
  order_timeout: number;
  shipping_free_threshold: number;
  default_shipping_fee: number;
  open_notification: boolean;
  // 认证信息
  verified: boolean;
  qualifications: string[];
}

export default function MerchantSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setSettings({
        id: 1,
        name: '武當山道觀官方店',
        type: 3,
        logo: '/merchants/wudang-logo.png',
        description: '武當山道觀官方認證店鋪，提供正宗符箓法器。傳承千年道家文化，弘揚正統玄門精髓。',
        contact_name: '張道長',
        contact_phone: '+86 123 4567 8900',
        contact_email: 'wudang@fubao.ltd',
        address: '武當山經濟旅遊特區',
        province: '湖北省',
        city: '十堰市',
        status: true,
        rating: 4.9,
        total_sales: 1256,
        auto_accept_order: false,
        order_timeout: 30,
        shipping_free_threshold: 500,
        default_shipping_fee: 20,
        open_notification: true,
        verified: true,
        qualifications: ['/cert/business-license.jpg', '/cert/taoist-cert.jpg'],
      });
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('設置保存成功');
    } catch (error) {
      toast.error('保存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: number) => {
    const types: Record<number, { label: string; color: string }> = {
      1: { label: '個人商戶', color: 'bg-blue-100 text-blue-800' },
      2: { label: '企業商戶', color: 'bg-purple-100 text-purple-800' },
      3: { label: '認證商戶', color: 'bg-green-100 text-green-800' },
    };
    return types[type] || types[1];
  };

  if (loading || !settings) {
    return (
      <MerchantLayout title="店鋪設置" description="管理店鋪信息">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="店鋪設置" description="管理店鋪信息與運營設置">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="basic">
            <Store className="w-4 h-4 mr-2" />
            基本信息
          </TabsTrigger>
          <TabsTrigger value="operation">
            <Clock className="w-4 h-4 mr-2" />
            運營設置
          </TabsTrigger>
          <TabsTrigger value="notification">
            <Bell className="w-4 h-4 mr-2" />
            通知設置
          </TabsTrigger>
          <TabsTrigger value="verify">
            <Shield className="w-4 h-4 mr-2" />
            認證信息
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">店鋪信息</CardTitle>
                  <CardDescription>設置店鋪的基本展示信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>店鋪名稱</Label>
                      <Input
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>商戶類型</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeLabel(settings.type).color}>
                          {getTypeLabel(settings.type).label}
                        </Badge>
                        {settings.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已認證
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>店鋪簡介</Label>
                    <Textarea
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      rows={4}
                      maxLength={500}
                      placeholder="請輸入店鋪簡介"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {settings.description.length}/500
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>店鋪Logo</Label>
                    <ImageUpload
                      value={settings.logo ? [settings.logo] : []}
                      onChange={(urls) => setSettings({ ...settings, logo: urls[0] || '' })}
                      maxCount={1}
                      folder="merchant/logos"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">聯繫信息</CardTitle>
                  <CardDescription>用於客戶聯繫和訂單通知</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          聯繫電話
                        </div>
                      </Label>
                      <Input
                        value={settings.contact_phone}
                        onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                        type="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          電子郵箱
                        </div>
                      </Label>
                      <Input
                        value={settings.contact_email}
                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>聯繫人</Label>
                    <Input
                      value={settings.contact_name}
                      onChange={(e) => setSettings({ ...settings, contact_name: e.target.value })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        經營地址
                      </div>
                    </Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        value={settings.province}
                        onChange={(e) => setSettings({ ...settings, province: e.target.value })}
                        placeholder="省份"
                      />
                      <Input
                        value={settings.city}
                        onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                        placeholder="城市"
                      />
                      <Input
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        placeholder="詳細地址"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧状态卡片 */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">店鋪狀態</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">營業狀態</span>
                    <Switch
                      checked={settings.status}
                      onCheckedChange={(checked) => setSettings({ ...settings, status: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">店鋪評分</span>
                    <span className="font-medium text-yellow-600">⭐ {settings.rating}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">累計銷量</span>
                    <span className="font-medium">{settings.total_sales}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={`/merchant/${settings.id}`} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      預覽店鋪
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowVerifyDialog(true)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    申請認證
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 运营设置 */}
        <TabsContent value="operation">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">訂單設置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">自動接單</p>
                    <p className="text-sm text-muted-foreground">新訂單自動確認，無需手動處理</p>
                  </div>
                  <Switch
                    checked={settings.auto_accept_order}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_accept_order: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>訂單超時時間（分鐘）</Label>
                  <Select
                    value={settings.order_timeout.toString()}
                    onValueChange={(v) => setSettings({ ...settings, order_timeout: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 分鐘</SelectItem>
                      <SelectItem value="30">30 分鐘</SelectItem>
                      <SelectItem value="60">60 分鐘</SelectItem>
                      <SelectItem value="120">2 小時</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">訂單未支付自動取消時間</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  配送設置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>滿額包郵金額（HK$）</Label>
                  <Input
                    type="number"
                    value={settings.shipping_free_threshold}
                    onChange={(e) => setSettings({ ...settings, shipping_free_threshold: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">訂單金額達到此數值免運費</p>
                </div>

                <div className="space-y-2">
                  <Label>默認運費（HK$）</Label>
                  <Input
                    type="number"
                    value={settings.default_shipping_fee}
                    onChange={(e) => setSettings({ ...settings, default_shipping_fee: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notification">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">通知設置</CardTitle>
              <CardDescription>管理店鋪通知和消息推送</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">開啟通知</p>
                  <p className="text-sm text-muted-foreground">接收新訂單、評價等通知</p>
                </div>
                <Switch
                  checked={settings.open_notification}
                  onCheckedChange={(checked) => setSettings({ ...settings, open_notification: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">通知類型</h4>
                <div className="space-y-3">
                  {[
                    { label: '新訂單通知', description: '有新訂單時通知', enabled: true },
                    { label: '支付成功通知', description: '訂單支付成功時通知', enabled: true },
                    { label: '評價通知', description: '收到客戶評價時通知', enabled: true },
                    { label: '庫存預警', description: '商品庫存不足時通知', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 认证信息 */}
        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                商戶認證
              </CardTitle>
              <CardDescription>
                完成認證可獲得認證標識，提升店鋪信譽
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">已認證商戶</p>
                  <p className="text-sm text-green-600">您的店鋪已完成認證審核</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">已上傳資質</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {settings.qualifications.map((url, i) => (
                    <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                      <img src={url} alt={`资质${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">認證權益</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, title: '認證標識', desc: '店鋪展示認證徽章' },
                    { icon: CheckCircle, title: '優先展示', desc: '搜索結果優先排序' },
                    { icon: CreditCard, title: '快速結算', desc: '縮短結算週期' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="p-4 border rounded-lg text-center">
                        <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="fixed bottom-6 right-6">
        <Button onClick={handleSave} disabled={saving} className="shadow-lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存設置
            </>
          )}
        </Button>
      </div>

      {/* 认证申请弹窗 */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申請商戶認證</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">您已完成認證，無需重複申請</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
