'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

/** OAuth提供商 */
interface OAuthProvider {
  provider: string;
  display_name: string;
  icon_url: string | null;
}

/** 提供商图标和样式 */
const PROVIDER_ICONS: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  google: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bgColor: 'bg-white hover:bg-gray-50 border border-gray-200',
  },
  facebook: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bgColor: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
  },
  wechat: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553C23.087 18.615 24 16.893 24 14.929c0-3.367-3.056-6.01-7.062-6.071zM13.567 13.02c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983zm4.844 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983z"/>
      </svg>
    ),
    bgColor: 'bg-[#07C160] hover:bg-[#06AD56] text-white',
  },
  x: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    bgColor: 'bg-black hover:bg-gray-800 text-white',
  },
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // 获取URL参数
  const redirectParam = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');
  const successParam = searchParams.get('success');

  useEffect(() => {
    // 显示URL中的错误或成功消息
    if (errorParam) {
      setError(errorParam);
    }
    if (successParam) {
      toast.success(successParam);
    }

    // 加载OAuth提供商
    loadOAuthProviders();
  }, [errorParam, successParam]);

  const loadOAuthProviders = async () => {
    try {
      const res = await fetch('/api/oauth/providers');
      const data = await res.json();
      if (data.providers) {
        setOauthProviders(data.providers);
      }
    } catch (err) {
      console.error('加载OAuth提供商失败:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginType === 'email' ? email : undefined,
          phone: loginType === 'phone' ? phone : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (data.user) {
        router.push(redirectParam);
      } else {
        setError(data.error || '登錄失敗，請重試');
      }
    } catch (err) {
      console.error('登录失败:', err);
      setError('登錄失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setOauthLoading(provider);
    try {
      const res = await fetch(`/api/oauth/authorize?provider=${provider}&redirect=${encodeURIComponent(redirectParam)}`);
      const data = await res.json();

      if (data.authorizeUrl) {
        window.location.href = data.authorizeUrl;
      } else {
        setError(data.error || '獲取授權鏈接失敗');
        setOauthLoading(null);
      }
    } catch (err) {
      console.error('OAuth登录失败:', err);
      setError('登錄失敗，請稍後重試');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回首頁
          </Link>
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              符
            </div>
            <span className="text-2xl font-semibold">符寶網</span>
          </Link>
          <p className="text-muted-foreground mt-2">全球玄門文化科普交易平台</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">登錄賬號</CardTitle>
            <CardDescription>
              歡迎回來，請登錄您的賬號
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Login Type Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={loginType === 'email' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoginType('email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                郵箱登錄
              </Button>
              <Button
                variant={loginType === 'phone' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoginType('phone')}
              >
                手機登錄
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginType === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="email">電子郵箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="請輸入郵箱地址"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone">手機號碼</Label>
                  <div className="flex gap-2">
                    <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="+852">+852</option>
                      <option value="+86">+86</option>
                      <option value="+886">+886</option>
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="請輸入手機號碼"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密碼</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    忘記密碼？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    記住我
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登錄中...
                  </>
                ) : (
                  '登錄'
                )}
              </Button>
            </form>

            {/* OAuth Login */}
            {oauthProviders.length > 0 && (
              <>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground">
                    或使用以下方式登錄
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {oauthProviders.map((provider) => {
                    const style = PROVIDER_ICONS[provider.provider] || {
                      icon: <span className="font-bold">{provider.display_name[0]}</span>,
                      bgColor: 'bg-gray-500 hover:bg-gray-600',
                    };

                    return (
                      <Button
                        key={provider.provider}
                        type="button"
                        variant="outline"
                        className={`${style.bgColor} text-white border-0 h-11`}
                        onClick={() => handleOAuthLogin(provider.provider)}
                        disabled={oauthLoading === provider.provider}
                      >
                        {oauthLoading === provider.provider ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span className="w-5 h-5 flex items-center justify-center mr-2">
                              {style.icon}
                            </span>
                            {provider.display_name}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}

            <Separator className="my-6" />

            {/* Register Link */}
            <p className="text-center text-sm text-muted-foreground">
              還沒有賬號？{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                立即註冊
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          登錄即表示您同意我們的{' '}
          <Link href="/terms" className="hover:underline">用戶協議</Link>
          {' '}和{' '}
          <Link href="/privacy" className="hover:underline">隱私政策</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
