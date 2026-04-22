/**
 * @fileoverview 需要登录的包装组件
 * @description 如果用户未登录，重定向到登录页面
 * @module components/auth/RequireAuth
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAuthProps {
  children: React.ReactNode;
  /** 登录后重定向的页面，默认为当前页面 */
  redirectTo?: string;
  /** 显示加载状态 */
  showLoading?: boolean;
}

/**
 * 需要登录才能访问的组件包装器
 * 未登录用户会被重定向到登录页面
 */
export function RequireAuth({ 
  children, 
  redirectTo,
  showLoading = true 
}: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // 等待加载完成
    if (loading) return;
    
    // 如果用户未登录，重定向到登录页面
    if (!user) {
      const currentPath = window.location.pathname;
      const destination = redirectTo || currentPath;
      // 将目标页面编码后传递
      const encodedPath = encodeURIComponent(destination);
      router.push(`/login?redirect=${encodedPath}`);
    }
  }, [user, loading, mounted, router, redirectTo]);

  // SSR 或加载中时显示骨架屏
  if (!mounted || loading) {
    if (showLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }
    return null;
  }

  // 如果用户已登录，显示内容
  if (user) {
    return <>{children}</>;
  }

  // 未登录用户不应该看到内容
  return null;
}

/**
 * 检查用户是否已登录
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requireAuth = (callback?: () => void) => {
    if (!mounted) return;
    if (loading) return;
    
    if (!user) {
      const currentPath = window.location.pathname;
      const encodedPath = encodeURIComponent(currentPath);
      router.push(`/login?redirect=${encodedPath}`);
      return;
    }
    
    callback?.();
  };

  return {
    isAuthenticated: !!user,
    isLoading: loading || !mounted,
    requireAuth,
  };
}
