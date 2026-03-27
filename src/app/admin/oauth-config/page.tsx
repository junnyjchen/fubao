/**
 * @fileoverview 后台OAuth配置页面
 * @description 管理第三方登录提供商配置
 * @module app/admin/oauth-config/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Settings,
  Key,
  Link as LinkIcon,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

/** OAuth提供商配置 */
interface OAuthProvider {
  id: number;
  provider: string;
  display_name: string;
  client_id: string | null;
  client_secret: string | null;
  redirect_uri: string | null;
  scopes: string[] | null;
  enabled: boolean;
  icon_url: string | null;
}

/** 提供商图标和颜色 */
const PROVIDER_STYLES: Record<string, { icon: string; color: string; bgColor: string }> = {
  google: {
    icon: 'G',
    color: 'text-white',
    bgColor: 'bg-red-500',
  },
  facebook: {
    icon: 'f',
    color: 'text-white',
    bgColor: 'bg-blue-600',
  },
  wechat: {
    icon: '微',
    color: 'text-white',
    bgColor: 'bg-green-500',
  },
  x: {
    icon: '𝕏',
    color: 'text-white',
    bgColor: 'bg-black',
  },
};

/** 提供商帮助链接 */
const PROVIDER_DOCS: Record<string, { name: string; consoleUrl: string; docsUrl: string }> = {
  google: {
    name: 'Google Cloud Console',
    consoleUrl: 'https://console.cloud.google.com/apis/credentials',
    docsUrl: 'https://developers.google.com/identity/protocols/oauth2',
  },
  facebook: {
    name: 'Facebook Developers',
    consoleUrl: 'https://developers.facebook.com/apps/',
    docsUrl: 'https://developers.facebook.com/docs/facebook-login/',
  },
  wechat: {
    name: '微信开放平台',
    consoleUrl: 'https://open.weixin.qq.com/',
    docsUrl: 'https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/WeChat_Login.html',
  },
  x: {
    name: 'Twitter Developer Portal',
    consoleUrl: 'https://developer.twitter.com/en/portal/dashboard',
    docsUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0',
  },
};

export default function OAuthConfigPage() {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editingProvider, setEditingProvider] = useState<OAuthProvider | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 获取回调地址
  const callbackUrl = `${process.env.NEXT_PUBLIC_COZE_PROJECT_DOMAIN_DEFAULT || window.location.origin}/api/oauth/callback`;

  const handleCopyCallbackUrl = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      toast.success('回調地址已複製');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('複製失敗');
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/oauth-providers');
      const data = await res.json();
      if (data.data) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加載配置失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (provider: OAuthProvider) => {
    setSaving(provider.id);
    try {
      const res = await fetch('/api/admin/oauth-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: provider.id,
          enabled: !provider.enabled,
        }),
      });

      if (res.ok) {
        setProviders(providers.map(p => 
          p.id === provider.id ? { ...p, enabled: !p.enabled } : p
        ));
        toast.success(provider.enabled ? '已禁用' : '已啟用');
      } else {
        toast.error('操作失敗');
      }
    } catch (error) {
      console.error('切换状态失败:', error);
      toast.error('操作失敗');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!editingProvider) return;
    
    setSaving(editingProvider.id);
    try {
      const res = await fetch('/api/admin/oauth-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProvider),
      });

      if (res.ok) {
        setProviders(providers.map(p => 
          p.id === editingProvider.id ? editingProvider : p
        ));
        setEditDialogOpen(false);
        toast.success('配置已保存');
      } else {
        toast.error('保存失敗');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存失敗');
    } finally {
      setSaving(null);
    }
  };

  const openEditDialog = (provider: OAuthProvider) => {
    setEditingProvider({ ...provider });
    setEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              第三方登錄配置
            </h1>
            <p className="text-sm text-muted-foreground">配置 Google、Facebook、微信、X 等第三方登錄</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => {
              const style = PROVIDER_STYLES[provider.provider] || { icon: '?', color: 'text-white', bgColor: 'bg-gray-500' };
              const docs = PROVIDER_DOCS[provider.provider];
              const isConfigured = provider.client_id && provider.client_secret;

              return (
                <Card key={provider.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className={`w-12 h-12 rounded-lg ${style.bgColor} ${style.color} flex items-center justify-center text-xl font-bold`}>
                          {style.icon}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{provider.display_name}</h3>
                            {provider.enabled ? (
                              <Badge className="bg-green-500">已啟用</Badge>
                            ) : (
                              <Badge variant="secondary">未啟用</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {isConfigured ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                已配置
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-600">
                                <XCircle className="w-4 h-4" />
                                未配置
                              </span>
                            )}
                            
                            {docs && (
                              <a 
                                href={docs.consoleUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {docs.name}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(provider)}
                        >
                          <Key className="w-4 h-4 mr-1" />
                          配置
                        </Button>
                        
                        <Switch
                          checked={provider.enabled}
                          onCheckedChange={() => handleToggleEnabled(provider)}
                          disabled={saving === provider.id || !isConfigured}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 帮助说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">配置說明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">1. 在對應的開發者平台創建應用，獲取 Client ID 和 Client Secret</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground">2. 在開發者平台配置回調地址：</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm break-all">{callbackUrl}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCallbackUrl}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <p className="text-muted-foreground">3. 在上方配置對應的 Client ID、Client Secret</p>
            <p className="text-muted-foreground">4. 開啟啟用開關，用戶即可使用該方式登錄</p>
            
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-800 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs">
                注意：回調地址必須與開發者平台配置的地址完全一致，否則授權將失敗。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              配置 {editingProvider?.display_name} 登錄
            </DialogTitle>
            <DialogDescription>
              請輸入從開發者平台獲取的配置信息
            </DialogDescription>
          </DialogHeader>

          {editingProvider && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID / App ID</Label>
                <Input
                  id="client_id"
                  value={editingProvider.client_id || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, client_id: e.target.value })}
                  placeholder="請輸入 Client ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_secret">Client Secret / App Secret</Label>
                <Input
                  id="client_secret"
                  type="password"
                  value={editingProvider.client_secret === '******' ? '' : editingProvider.client_secret || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, client_secret: e.target.value })}
                  placeholder="請輸入 Client Secret"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect_uri">
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    回調地址
                  </div>
                </Label>
                <Input
                  id="redirect_uri"
                  value={editingProvider.redirect_uri || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, redirect_uri: e.target.value })}
                  placeholder={`${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/oauth/callback`}
                />
                <p className="text-xs text-muted-foreground">
                  留空則使用默認回調地址
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scopes">授權範圍（可選）</Label>
                <Input
                  id="scopes"
                  value={editingProvider.scopes?.join(', ') || ''}
                  onChange={(e) => setEditingProvider({ 
                    ...editingProvider, 
                    scopes: e.target.value ? e.target.value.split(',').map(s => s.trim()) : null 
                  })}
                  placeholder="openid, email, profile"
                />
                <p className="text-xs text-muted-foreground">
                  多個範圍用逗號分隔，留空使用默認範圍
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveConfig} disabled={saving === editingProvider?.id}>
              {saving === editingProvider?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存配置
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
