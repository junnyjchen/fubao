/**
 * @fileoverview 访客保护组件
 * @description 如果用户已登录，重定向到指定页面（用于登录/注册页面）
 * @module components/auth/GuestGuard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestGuardProps {
  children: React.ReactNode;
  /** 登录后重定向的页面，默认为首页 */
  redirectTo?: string;
}

/**
 * 访客保护组件 - 已登录用户不能访问（如登录/注册页面）
 */
export function GuestGuard({ children, redirectTo = '/' }: GuestGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (loading) return;
    
    // 如果用户已登录，重定向到首页
    if (user) {
      router.push(redirectTo);
    }
  }, [user, loading, mounted, router, redirectTo]);

  // SSR 或加载中时显示骨架屏
  if (!mounted || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // 未登录用户可以看到内容（登录/注册页面）
  if (!user) {
    return <>{children}</>;
  }

  // 已登录用户不应该看到登录页面
  return null;
}
