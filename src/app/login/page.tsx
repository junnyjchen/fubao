'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // 登录成功，跳转到用户中心或之前的页面
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/user';
        router.push(redirectTo);
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
