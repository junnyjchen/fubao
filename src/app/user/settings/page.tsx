/**
 * @fileoverview 用户设置页面
 * @description 用户个人账号设置
 * @module app/user/settings/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  ExternalLink,
  Unlink,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n, languages } from '@/lib/i18n';

interface UserSettings {
  nickname: string;
  email: string;
  phone: string;
  language: string;
  emailNotification: boolean;
  smsNotification: boolean;
  orderNotification: boolean;
  promotionNotification: boolean;
}

/** OAuth提供商绑定状态 */
interface OAuthProviderStatus {
  provider: string;
  display_name: string;
  enabled: boolean;
  icon_url: string | null;
  bound: boolean;
  account: {
    id: string;
    email: string | null;
    name: string | null;
    avatar: string | null;
    bound_at: string;
  } | null;
}

/** 提供商图标和样式 */
const PROVIDER_STYLES: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  google: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bgColor: 'bg-white border border-gray-200',
  },
  facebook: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bgColor: 'bg-[#1877F2] text-white',
  },
  wechat: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553C23.087 18.615 24 16.893 24 14.929c0-3.367-3.056-6.01-7.062-6.071zM13.567 13.02c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983zm4.844 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983z"/>
      </svg>
    ),
    bgColor: 'bg-[#07C160] text-white',
  },
  x: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    bgColor: 'bg-black text-white',
  },
};

export default function UserSettingsPage() {
  const { lang, setLang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthProviders, setOauthProviders] = useState<OAuthProviderStatus[]>([]);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [unbindDialog, setUnbindDialog] = useState<{ open: boolean; provider: string | null }>({
    open: false,
    provider: null,
  });
  
  const [settings, setSettings] = useState<UserSettings>({
    nickname: '',
    email: '',
    phone: '',
    language: lang,
    emailNotification: true,
    smsNotification: false,
    orderNotification: true,
    promotionNotification: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadUserSettings();
    loadOAuthProviders();
  }, []);

  const loadOAuthProviders = async () => {
    try {
      const res = await fetch('/api/user/oauth-accounts');
      const data = await res.json();
      if (data.providers) {
        setOauthProviders(data.providers);
      }
    } catch (error) {
      console.error('加载OAuth提供商失败:', error);
    }
  };

  const handleOAuthBind = async (provider: string) => {
    setOauthLoading(provider);
    try {
      const res = await fetch(`/api/oauth/authorize?provider=${provider}&redirect=${encodeURIComponent('/user/settings')}`);
      const data = await res.json();

      if (data.authorizeUrl) {
        window.location.href = data.authorizeUrl;
      } else {
        toast.error(data.error || '獲取授權鏈接失敗');
        setOauthLoading(null);
      }
    } catch (error) {
      console.error('OAuth绑定失败:', error);
      toast.error('綁定失敗');
      setOauthLoading(null);
    }
  };

  const handleOAuthUnbind = async () => {
    if (!unbindDialog.provider) return;
    
    setOauthLoading(unbindDialog.provider);
    try {
      const res = await fetch(`/api/user/oauth-accounts?provider=${unbindDialog.provider}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (data.message) {
        toast.success('解綁成功');
        loadOAuthProviders();
      } else {
        toast.error(data.error || '解綁失敗');
      }
    } catch (error) {
      console.error('解绑失败:', error);
      toast.error('解綁失敗');
    } finally {
      setOauthLoading(null);
      setUnbindDialog({ open: false, provider: null });
    }
  };

  const loadUserSettings = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (data.user) {
        setSettings(prev => ({
          ...prev,
          nickname: data.user.nickname || data.user.username || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        }));
      }
    } catch (error) {
      console.error('加载用户设置失败:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: settings.nickname,
          email: settings.email,
          phone: settings.phone,
        }),
      });

      const data = await res.json();
      
      if (data.message || data.user) {
        toast.success('個人資料已更新');
      } else {
        toast.error(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('請填寫完整密碼信息');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('兩次輸入的新密碼不一致');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('密碼長度至少6位');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      
      if (data.message) {
        toast.success('密碼修改成功');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || '修改失敗');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      toast.error('修改失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // 模拟保存通知设置
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('通知設置已更新');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLanguage = async (language: string) => {
    setLang(language as any);
    setSettings(prev => ({ ...prev, language }));
    toast.success('語言設置已更新');
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/user">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">賬號設置</h1>
              <p className="text-primary-foreground/80 text-sm">管理您的個人信息與偏好</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">個人資料</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">賬號安全</span>
            </TabsTrigger>
            <TabsTrigger value="oauth" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">第三方賬號</span>
            </TabsTrigger>
            <TabsTrigger value="notification" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">通知設置</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">語言</span>
            </TabsTrigger>
          </TabsList>

          {/* 个人资料 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>個人資料</CardTitle>
                <CardDescription>更新您的個人信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">暱稱</Label>
                    <Input
                      id="nickname"
                      value={settings.nickname}
                      onChange={e => setSettings(prev => ({ ...prev, nickname: e.target.value }))}
                      placeholder="請輸入暱稱"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">電子郵箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="請輸入郵箱"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">手機號碼</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="請輸入手機號碼"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 账号安全 */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>修改密碼</CardTitle>
                <CardDescription>定期修改密碼可以提高賬號安全性</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">當前密碼</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="請輸入當前密碼"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密碼</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="請輸入新密碼（至少6位）"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">確認新密碼</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="請再次輸入新密碼"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={loading}>
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? '修改中...' : '修改密碼'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>賬號註銷</CardTitle>
                <CardDescription>註銷賬號後，所有數據將無法恢復</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => toast.error('此功能暫未開放')}>
                  申請註銷賬號
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 第三方账号 */}
          <TabsContent value="oauth">
            <Card>
              <CardHeader>
                <CardTitle>第三方賬號綁定</CardTitle>
                <CardDescription>管理您的第三方登錄賬號綁定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {oauthProviders.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {oauthProviders.map((provider) => {
                      const style = PROVIDER_STYLES[provider.provider] || {
                        icon: '?',
                        bgColor: 'bg-gray-500',
                      };

                      return (
                        <div
                          key={provider.provider}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div
                              className={`w-10 h-10 rounded-lg ${style.bgColor} flex items-center justify-center font-bold`}
                            >
                              {style.icon}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{provider.display_name}</span>
                                {provider.bound ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    已綁定
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    未綁定
                                  </Badge>
                                )}
                              </div>
                              {provider.bound && provider.account && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {provider.account.email || provider.account.name || '已綁定賬號'}
                                </p>
                              )}
                              {!provider.enabled && !provider.bound && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  此登錄方式暫未開放
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {provider.bound ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUnbindDialog({ open: true, provider: provider.provider })}
                                disabled={oauthLoading === provider.provider}
                              >
                                {oauthLoading === provider.provider ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Unlink className="w-4 h-4 mr-1" />
                                    解綁
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOAuthBind(provider.provider)}
                                disabled={oauthLoading === provider.provider || !provider.enabled}
                              >
                                {oauthLoading === provider.provider ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Link2 className="w-4 h-4 mr-1" />
                                    綁定
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    綁定第三方賬號後，您可以使用該賬號快速登錄。解綁後將無法使用該方式登錄，但不會影響您已綁定的其他登錄方式。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notification">
            <Card>
              <CardHeader>
                <CardTitle>通知設置</CardTitle>
                <CardDescription>管理您接收通知的方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>郵件通知</Label>
                      <p className="text-sm text-muted-foreground">接收訂單更新和促銷信息的郵件通知</p>
                    </div>
                    <Switch
                      checked={settings.emailNotification}
                      onCheckedChange={v => setSettings(prev => ({ ...prev, emailNotification: v }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>短信通知</Label>
                      <p className="text-sm text-muted-foreground">接收重要訂單狀態變更的短信提醒</p>
                    </div>
                    <Switch
                      checked={settings.smsNotification}
                      onCheckedChange={v => setSettings(prev => ({ ...prev, smsNotification: v }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>訂單通知</Label>
                      <p className="text-sm text-muted-foreground">訂單狀態變更時通知您</p>
                    </div>
                    <Switch
                      checked={settings.orderNotification}
                      onCheckedChange={v => setSettings(prev => ({ ...prev, orderNotification: v }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>促銷通知</Label>
                      <p className="text-sm text-muted-foreground">接收優惠活動和促銷信息</p>
                    </div>
                    <Switch
                      checked={settings.promotionNotification}
                      onCheckedChange={v => setSettings(prev => ({ ...prev, promotionNotification: v }))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? '保存中...' : '保存設置'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 语言设置 */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>語言設置</CardTitle>
                <CardDescription>選擇您偏好的顯示語言</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>選擇語言</Label>
                  <Select
                    value={lang}
                    onValueChange={handleSaveLanguage}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.nativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    語言設置將影響網站界面、郵件和通知的顯示語言。
                    部分內容可能暫未完全翻譯，我們正在持續完善中。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 解绑确认对话框 */}
      <Dialog open={unbindDialog.open} onOpenChange={(open) => setUnbindDialog({ open, provider: open ? unbindDialog.provider : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              確認解綁
            </DialogTitle>
            <DialogDescription>
              確定要解綁 {unbindDialog.provider ? oauthProviders.find(p => p.provider === unbindDialog.provider)?.display_name : ''} 賬號嗎？解綁後將無法使用該方式登錄。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnbindDialog({ open: false, provider: null })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleOAuthUnbind} disabled={oauthLoading === unbindDialog.provider}>
              {oauthLoading === unbindDialog.provider ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  解綁中...
                </>
              ) : (
                '確認解綁'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
