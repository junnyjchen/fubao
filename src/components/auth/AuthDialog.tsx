/**
 * @fileoverview 用户登录弹窗组件
 * @description 提供登录和注册功能
 * @module components/auth/AuthDialog
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

export function AuthDialog({ open, onOpenChange, defaultTab = 'login' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  // 登录表单
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // 注册表单
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          action: 'login',
        }),
      });

      const data = await res.json();

      if (data.message) {
        toast.success('登錄成功', { description: '歡迎回來！' });
        onOpenChange(false);
        // 刷新页面以更新用户状态
        setTimeout(() => window.location.reload(), 500);
      } else if (data.error) {
        toast.error('登錄失敗', { description: data.error });
      }
    } catch (error) {
      toast.error('登錄失敗', { description: '網絡錯誤，請重試' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('註冊失敗', { description: '兩次輸入的密碼不一致' });
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('註冊失敗', { description: '密碼長度至少6位' });
      return;
    }

    if (!registerForm.email) {
      toast.error('註冊失敗', { description: '請輸入郵箱' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          name: registerForm.name,
          action: 'register',
        }),
      });

      const data = await res.json();

      if (data.message) {
        toast.success('註冊成功', { description: '歡迎加入符寶網！' });
        onOpenChange(false);
        setTimeout(() => window.location.reload(), 500);
      } else if (data.error) {
        toast.error('註冊失敗', { description: data.error });
      }
    } catch (error) {
      toast.error('註冊失敗', { description: '網絡錯誤，請重試' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">符寶網</DialogTitle>
          <DialogDescription className="text-center">
            全球玄門文化科普交易平台
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登錄</TabsTrigger>
            <TabsTrigger value="register">註冊</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">郵箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="請輸入郵箱"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">密碼</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="請輸入密碼"
                    className="pl-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
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
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="請輸入姓名（選填）"
                    className="pl-10"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">郵箱 *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="請輸入郵箱"
                    className="pl-10"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">密碼 *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="請輸入密碼（至少6位）"
                    className="pl-10"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">確認密碼 *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="請再次輸入密碼"
                    className="pl-10"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
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
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="text-center text-xs text-muted-foreground">
          登錄或註冊即表示您同意我們的
          <a href="/terms" className="underline mx-1">服務條款</a>
          和
          <a href="/privacy" className="underline mx-1">隱私政策</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
