/**
 * @fileoverview 后台设置页面
 * @description 系统设置管理
 * @module app/admin/settings/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Save,
  Settings,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Mail,
  MailCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingItem {
  id: number;
  key: string;
  value: string;
  label: string;
  type: string;
  group: string;
  description?: string;
  options?: string;
  sort: number;
}

interface Settings {
  basic: SettingItem[];
  payment: SettingItem[];
  shipping: SettingItem[];
  notification: SettingItem[];
  security: SettingItem[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    basic: [],
    payment: [],
    shipping: [],
    notification: [],
    security: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const result = await res.json();
      if (result.data) {
        // 确保所有分组都存在
        setSettings({
          basic: result.data.basic || [],
          payment: result.data.payment || [],
          shipping: result.data.shipping || [],
          notification: result.data.notification || [],
          security: result.data.security || [],
        });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (group: keyof Settings, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [group]: (prev[group] || []).map(item =>
        item.key === key ? { ...item, value } : item
      ),
    }));
  };

  const handleTestEmailConnection = async () => {
    setEmailTesting(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('SMTP 連接成功', { description: '郵件伺服器連接正常' });
      } else {
        toast.error('SMTP 連接失敗', { description: data.error || '請檢查配置' });
      }
    } catch {
      toast.error('連接測試失敗', { description: '網絡錯誤' });
    } finally {
      setEmailTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim()) {
      toast.error('請輸入收件人郵箱');
      return;
    }
    setEmailSending(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', to: testEmailTo.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('測試郵件已發送', { description: `請檢查 ${testEmailTo} 的收件箱` });
      } else {
        toast.error('發送失敗', { description: data.error || '請檢查SMTP配置' });
      }
    } catch {
      toast.error('發送失敗', { description: '網絡錯誤' });
    } finally {
      setEmailSending(false);
    }
  };

  const handleSave = async (group: keyof Settings) => {
    setSaving(true);
    try {
      const groupSettings = settings[group] || [];
      // 转换为 { key: value } 对象格式
      const updates: Record<string, string> = {};
      groupSettings.forEach(item => {
        updates[item.key] = item.value;
      });

      // 获取管理员 token
      const token = localStorage.getItem('admin_token');

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ group, settings: updates }),
      });

      const data = await res.json();
      console.log('保存设置响应:', data);
      if (data.message) {
        toast.success('保存成功', { description: data.mock ? '設置已更新（本地模式）' : '設置已更新' });
      } else if (data.error) {
        toast.error('保存失敗', { description: data.error });
      }
    } catch (error) {
      toast.error('保存失敗', { description: '網絡錯誤，請重試' });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (item: SettingItem, group: keyof Settings) => {
    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label>{item.label}</Label>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
            <Switch
              checked={item.value === 'true'}
              onCheckedChange={(checked) =>
                handleValueChange(group, item.key, checked.toString())
              }
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label>{item.label}</Label>
            <Select
              value={item.value}
              onValueChange={(value) => handleValueChange(group, item.key, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {item.options?.split(',').map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label>{item.label}</Label>
            <Textarea
              value={item.value}
              onChange={(e) => handleValueChange(group, item.key, e.target.value)}
              placeholder={`請輸入${item.label}`}
            />
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label>{item.label}</Label>
            <Input
              type="number"
              value={item.value}
              onChange={(e) => handleValueChange(group, item.key, e.target.value)}
            />
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="space-y-2">
            <Label>{item.label}</Label>
            <Input
              type="password"
              value={item.value}
              onChange={(e) => handleValueChange(group, item.key, e.target.value)}
              placeholder="••••••••"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>{item.label}</Label>
            <Input
              value={item.value}
              onChange={(e) => handleValueChange(group, item.key, e.target.value)}
              placeholder={`請輸入${item.label}`}
            />
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">系統設置</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            載入中...
          </div>
        ) : (
          <Tabs defaultValue="basic">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                基本設置
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                支付設置
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                運費設置
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

            {(['basic', 'payment', 'shipping', 'notification', 'security'] as const).map((group) => (
              <TabsContent key={group} value={group}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {group === 'basic' && '基本設置'}
                      {group === 'payment' && '支付設置'}
                      {group === 'shipping' && '運費設置'}
                      {group === 'notification' && '通知設置'}
                      {group === 'security' && '安全設置'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(settings[group] || []).map((item, index) => (
                      <div key={item.key}>
                        {index > 0 && <Separator className="mb-6" />}
                        {renderField(item, group)}
                      </div>
                    ))}

                    <Separator />

                    {/* 邮件测试区域 - 仅通知设置分组显示 */}
                    {group === 'notification' && (
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="w-4 h-4" />
                          郵件服務測試
                        </div>
                        <p className="text-xs text-muted-foreground">
                          先保存SMTP配置，再測試連接。QQ郵箱需使用授權碼（非QQ密碼），在 QQ郵箱 → 設置 → 賬戶 → POP3/SMTP服務 中生成。
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTestEmailConnection}
                            disabled={emailTesting}
                          >
                            {emailTesting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <MailCheck className="w-4 h-4 mr-2" />
                            )}
                            測試SMTP連接
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="email"
                            placeholder="輸入收件人郵箱"
                            value={testEmailTo}
                            onChange={(e) => setTestEmailTo(e.target.value)}
                            className="max-w-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendTestEmail}
                            disabled={emailSending || !testEmailTo.trim()}
                          >
                            {emailSending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 mr-2" />
                            )}
                            發送測試郵件
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={() => handleSave(group)} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? '保存中...' : '保存設置'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
}
