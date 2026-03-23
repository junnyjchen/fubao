/**
 * @fileoverview 后台系统设置页面
 * @description 管理网站基础设置、支付配置、物流配置等
 * @module app/admin/settings/page
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings as SettingsIcon,
  Globe,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Save,
  CheckCircle,
} from 'lucide-react';

/** 设置项类型 */
interface SettingItem {
  id: number;
  key: string;
  value: string;
  label: string;
  type: string;
  group: string;
  sort: number;
  options?: string;
  description?: string;
}

/** 设置分组类型 */
type SettingsGroup = Record<string, SettingItem[]>;

/**
 * 后台系统设置页面组件
 * @returns 系统设置页面
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsGroup>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<Record<string, string>>({});

  /**
   * 加载设置
   */
  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      setSettings(data.data || {});

      // 初始化表单数据
      const initialFormData: Record<string, string> = {};
      Object.entries(data.data || {}).forEach(([, items]) => {
        (items as SettingItem[]).forEach((item: SettingItem) => {
          initialFormData[item.key] = item.value || '';
        });
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('加載設置失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * 更新表单值
   * @param key - 设置键
   * @param value - 设置值
   */
  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  /**
   * 保存设置
   * @param group - 设置分组
   */
  const handleSave = async (group: string) => {
    setSaving(true);
    try {
      // 只保存当前分组的设置
      const groupSettings = settings[group] || [];
      const updateData: Record<string, string> = {};
      
      groupSettings.forEach((item) => {
        updateData[item.key] = formData[item.key] || '';
      });

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.message) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.error || '保存失敗');
      }
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 渲染设置字段
   * @param item - 设置项
   */
  const renderField = (item: SettingItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={formData[item.key] === 'true'}
              onCheckedChange={(checked) =>
                updateFormData(item.key, checked ? 'true' : 'false')
              }
            />
            <span className="text-sm text-muted-foreground">
              {formData[item.key] === 'true' ? '啟用' : '禁用'}
            </span>
          </div>
        );

      case 'select':
        const options = item.options?.split(',').map((o) => o.trim()) || [];
        return (
          <Select
            value={formData[item.key]}
            onValueChange={(v) => updateFormData(item.key, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="請選擇" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={formData[item.key]}
            onChange={(e) => updateFormData(item.key, e.target.value)}
            placeholder={`請輸入${item.label}`}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={formData[item.key]}
            onChange={(e) => updateFormData(item.key, e.target.value)}
            placeholder={`請輸入${item.label}`}
          />
        );

      default:
        return (
          <Input
            type={item.type === 'password' ? 'password' : 'text'}
            value={formData[item.key]}
            onChange={(e) => updateFormData(item.key, e.target.value)}
            placeholder={`請輸入${item.label}`}
          />
        );
    }
  };

  return (
    <AdminLayout title="系統設置" description="配置網站基礎設置">
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              基礎設置
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              支付配置
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              物流配置
            </TabsTrigger>
            <TabsTrigger value="notification" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              通知設置
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              安全設置
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              載入中...
            </div>
          ) : (
            <>
              {/* 基础设置 */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>基礎設置</CardTitle>
                    <CardDescription>
                      配置網站名稱、Logo、聯繫方式等基礎信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings['basic'] || defaultBasicSettings).map((item) => (
                      <div key={item.key} className="grid gap-2">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        {renderField(item)}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-4">
                      <Button onClick={() => handleSave('basic')} disabled={saving}>
                        {saving ? (
                          '保存中...'
                        ) : saved ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            已保存
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存設置
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 支付配置 */}
              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>支付配置</CardTitle>
                    <CardDescription>
                      配置支付寶、微信、PayPal等支付方式
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings['payment'] || defaultPaymentSettings).map((item) => (
                      <div key={item.key} className="grid gap-2">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        {renderField(item)}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-4">
                      <Button onClick={() => handleSave('payment')} disabled={saving}>
                        {saving ? '保存中...' : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存設置
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 物流配置 */}
              <TabsContent value="shipping">
                <Card>
                  <CardHeader>
                    <CardTitle>物流配置</CardTitle>
                    <CardDescription>
                      配置物流公司和運費模板
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings['shipping'] || defaultShippingSettings).map((item) => (
                      <div key={item.key} className="grid gap-2">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        {renderField(item)}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-4">
                      <Button onClick={() => handleSave('shipping')} disabled={saving}>
                        {saving ? '保存中...' : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存設置
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 通知设置 */}
              <TabsContent value="notification">
                <Card>
                  <CardHeader>
                    <CardTitle>通知設置</CardTitle>
                    <CardDescription>
                      配置郵件和短信通知
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings['notification'] || defaultNotificationSettings).map((item) => (
                      <div key={item.key} className="grid gap-2">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        {renderField(item)}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-4">
                      <Button onClick={() => handleSave('notification')} disabled={saving}>
                        {saving ? '保存中...' : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存設置
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 安全设置 */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>安全設置</CardTitle>
                    <CardDescription>
                      配置網站安全相關設置
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings['security'] || defaultSecuritySettings).map((item) => (
                      <div key={item.key} className="grid gap-2">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        {renderField(item)}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-4">
                      <Button onClick={() => handleSave('security')} disabled={saving}>
                        {saving ? '保存中...' : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存設置
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
}

/** 默认基础设置 */
const defaultBasicSettings: SettingItem[] = [
  {
    id: 1,
    key: 'site_name',
    value: '符寶網',
    label: '網站名稱',
    type: 'text',
    group: 'basic',
    sort: 1,
    description: '顯示在瀏覽器標籤和網站頂部',
  },
  {
    id: 2,
    key: 'site_logo',
    value: '',
    label: '網站Logo',
    type: 'text',
    group: 'basic',
    sort: 2,
    description: '輸入Logo圖片URL',
  },
  {
    id: 3,
    key: 'site_description',
    value: '全球玄門文化科普交易平台',
    label: '網站描述',
    type: 'textarea',
    group: 'basic',
    sort: 3,
    description: '用於SEO描述',
  },
  {
    id: 4,
    key: 'site_keywords',
    value: '符籙,法器,玄門文化',
    label: '網站關鍵詞',
    type: 'text',
    group: 'basic',
    sort: 4,
    description: '用於SEO，用逗號分隔',
  },
  {
    id: 5,
    key: 'contact_email',
    value: '',
    label: '聯繫郵箱',
    type: 'text',
    group: 'basic',
    sort: 5,
  },
  {
    id: 6,
    key: 'contact_phone',
    value: '',
    label: '聯繫電話',
    type: 'text',
    group: 'basic',
    sort: 6,
  },
  {
    id: 7,
    key: 'contact_address',
    value: '',
    label: '聯繫地址',
    type: 'textarea',
    group: 'basic',
    sort: 7,
  },
  {
    id: 8,
    key: 'default_language',
    value: 'zh-TW',
    label: '默認語言',
    type: 'select',
    group: 'basic',
    sort: 8,
    options: 'zh-TW,zh-CN,en',
    description: '繁體中文,簡體中文,English',
  },
  {
    id: 9,
    key: 'default_currency',
    value: 'HKD',
    label: '默認貨幣',
    type: 'select',
    group: 'basic',
    sort: 9,
    options: 'HKD,CNY,USD',
    description: '港幣,人民幣,美元',
  },
];

/** 默认支付设置 */
const defaultPaymentSettings: SettingItem[] = [
  {
    id: 10,
    key: 'alipay_enabled',
    value: 'false',
    label: '啟用支付寶',
    type: 'boolean',
    group: 'payment',
    sort: 1,
  },
  {
    id: 11,
    key: 'alipay_app_id',
    value: '',
    label: '支付寶AppID',
    type: 'text',
    group: 'payment',
    sort: 2,
  },
  {
    id: 12,
    key: 'wechat_enabled',
    value: 'false',
    label: '啟用微信支付',
    type: 'boolean',
    group: 'payment',
    sort: 3,
  },
  {
    id: 13,
    key: 'wechat_app_id',
    value: '',
    label: '微信AppID',
    type: 'text',
    group: 'payment',
    sort: 4,
  },
  {
    id: 14,
    key: 'paypal_enabled',
    value: 'false',
    label: '啟用PayPal',
    type: 'boolean',
    group: 'payment',
    sort: 5,
  },
  {
    id: 15,
    key: 'paypal_client_id',
    value: '',
    label: 'PayPal Client ID',
    type: 'text',
    group: 'payment',
    sort: 6,
  },
];

/** 默认物流设置 */
const defaultShippingSettings: SettingItem[] = [
  {
    id: 20,
    key: 'free_shipping_enabled',
    value: 'true',
    label: '啟用免運費',
    type: 'boolean',
    group: 'shipping',
    sort: 1,
  },
  {
    id: 21,
    key: 'free_shipping_amount',
    value: '500',
    label: '免運費門檻',
    type: 'number',
    group: 'shipping',
    sort: 2,
    description: '訂單金額超過此數值免運費',
  },
  {
    id: 22,
    key: 'default_shipping_fee',
    value: '30',
    label: '默認運費',
    type: 'number',
    group: 'shipping',
    sort: 3,
    description: '默認運費金額',
  },
];

/** 默认通知设置 */
const defaultNotificationSettings: SettingItem[] = [
  {
    id: 30,
    key: 'email_notification_enabled',
    value: 'false',
    label: '啟用郵件通知',
    type: 'boolean',
    group: 'notification',
    sort: 1,
  },
  {
    id: 31,
    key: 'smtp_host',
    value: '',
    label: 'SMTP服務器',
    type: 'text',
    group: 'notification',
    sort: 2,
  },
  {
    id: 32,
    key: 'smtp_port',
    value: '587',
    label: 'SMTP端口',
    type: 'number',
    group: 'notification',
    sort: 3,
  },
  {
    id: 33,
    key: 'smtp_user',
    value: '',
    label: 'SMTP用戶名',
    type: 'text',
    group: 'notification',
    sort: 4,
  },
  {
    id: 34,
    key: 'smtp_password',
    value: '',
    label: 'SMTP密碼',
    type: 'password',
    group: 'notification',
    sort: 5,
  },
];

/** 默认安全设置 */
const defaultSecuritySettings: SettingItem[] = [
  {
    id: 40,
    key: 'captcha_enabled',
    value: 'false',
    label: '啟用驗證碼',
    type: 'boolean',
    group: 'security',
    sort: 1,
  },
  {
    id: 41,
    key: 'login_attempt_limit',
    value: '5',
    label: '登錄嘗試次數',
    type: 'number',
    group: 'security',
    sort: 2,
    description: '超過次數後鎖定賬戶',
  },
  {
    id: 42,
    key: 'session_timeout',
    value: '30',
    label: '會話超時時間(分鐘)',
    type: 'number',
    group: 'security',
    sort: 3,
  },
  {
    id: 43,
    key: 'https_only',
    value: 'true',
    label: '強制HTTPS',
    type: 'boolean',
    group: 'security',
    sort: 4,
  },
];
