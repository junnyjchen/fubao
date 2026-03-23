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
  User,
  Loader2,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: 填写信息, 2: 验证邮箱, 3: 注册成功

  const validateForm = () => {
    if (!nickname.trim()) {
      setError('請輸入暱稱');
      return false;
    }
    if (!email.trim()) {
      setError('請輸入郵箱地址');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('請輸入有效的郵箱地址');
      return false;
    }
    if (password.length < 6) {
      setError('密碼長度至少6位');
      return false;
    }
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return false;
    }
    if (!agreeTerms) {
      setError('請閱讀並同意用戶協議和隱私政策');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          email,
          phone: phone || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (data.user || data.message) {
        // 注册成功
        setStep(3);
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || '註冊失敗，請重試');
      }
    } catch (err) {
      console.error('注册失败:', err);
      setError('註冊失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // 注册成功页面
  if (step === 3) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">註冊成功！</h2>
            <p className="text-muted-foreground mb-6">
              您的賬號已創建成功，即將跳轉到登錄頁面...
            </p>
            <Button asChild>
              <Link href="/login">立即登錄</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-xl">註冊賬號</CardTitle>
            <CardDescription>
              創建賬號，開始您的玄門文化之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">暱稱 *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="請輸入暱稱"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">電子郵箱 *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="phone">手機號碼（選填）</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密碼 *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼（至少6位）"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認密碼 *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="請再次輸入密碼"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                  我已閱讀並同意
                  <Link href="/terms" className="text-primary hover:underline">《用戶協議》</Link>
                  和
                  <Link href="/privacy" className="text-primary hover:underline">《隱私政策》</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !agreeTerms}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    註冊中...
                  </>
                ) : (
                  '註冊'
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              已有賬號？{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                立即登錄
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
