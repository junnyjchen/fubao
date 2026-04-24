/**
 * @fileoverview 商户后台入口页面
 * @description 商户独立登录入口
 * @module app/merchant/login/page
 */

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
  Store,
  User,
  Lock,
  Loader2,
  ChevronRight,
  Shield,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const features = [
    {
      icon: Store,
      title: '店鋪管理',
      description: '輕鬆管理您的店鋪信息',
    },
    {
      icon: TrendingUp,
      title: '銷售數據',
      description: '實時查看銷售統計',
    },
    {
      icon: Users,
      title: '客戶管理',
      description: '維護客戶關係',
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '數據安全有保障',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error('請輸入賬號');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('請輸入密碼');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // 检查用户是否是商户
        const merchantRes = await fetch('/api/merchant/me');
        const merchantData = await merchantRes.json();

        if (merchantData.isMerchant) {
          toast.success('登錄成功');
          router.push('/merchant/dashboard');
        } else {
          toast.error('您還不是商戶，請先申請入駐');
          router.push('/merchant/apply');
        }
      } else {
        toast.error(data.error || '登錄失敗');
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast.error('登錄失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* 左侧品牌区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
              符
            </div>
            <div>
              <span className="text-xl font-semibold">符寶網</span>
              <p className="text-sm opacity-80">商戶後台</p>
            </div>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              歡迎回來
            </h1>
            <p className="text-lg opacity-80">
              管理您的店鋪，查看訂單，分析數據
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm opacity-70">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-sm opacity-60">
          © 2026 符寶網 fubao.ltd 版權所有
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* 移动端 Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                符
              </div>
              <span className="text-xl font-semibold">商戶後台</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">商戶登錄</CardTitle>
              <CardDescription>
                登錄您的商戶後台管理店鋪
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">賬號</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="請輸入郵箱或手機號"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="請輸入密碼"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={formData.remember}
                      onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">
                      記住我
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    忘記密碼？
                  </Link>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
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

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  還不是商戶？
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/merchant/apply">
                    申請入駐
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>

              {/* 其他登录方式 */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      其他登錄方式
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <Button variant="outline" size="icon" className="w-10 h-10">
                    <span className="text-green-600 font-bold">微</span>
                  </Button>
                  <Button variant="outline" size="icon" className="w-10 h-10">
                    <span className="text-blue-600 font-bold">企</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 底部链接 */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              返回首頁
            </Link>
            <span className="mx-2">|</span>
            <Link href="/help" className="hover:text-foreground">
              幫助中心
            </Link>
            <span className="mx-2">|</span>
            <Link href="/contact" className="hover:text-foreground">
              聯繫客服
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
