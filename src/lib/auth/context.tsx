/**
 * @fileoverview 认证上下文
 * @description 提供全局用户认证状态管理
 * @module lib/auth/context
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/** 用户信息类型 */
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  language?: string;
  role?: string;
  isGuest?: boolean;
}

/** 认证上下文类型 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/** 注册数据类型 */
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** 本地存储键 */
const USER_STORAGE_KEY = 'fubao_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从本地存储恢复用户状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 先尝试从本地存储恢复
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // 然后从服务器验证
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /** 登录 */
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || '登錄失敗' };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, error: '網絡錯誤，請重試' };
    }
  };

  /** 注册 */
  const register = async (data: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.user) {
        // 注册成功后自动登录
        const loginResult = await login(data.email, data.password);
        return loginResult;
      }

      return { success: false, error: result.error || '註冊失敗' };
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, error: '網絡錯誤，請重試' };
    }
  };

  /** 登出 */
  const logout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  /** 刷新用户信息 */
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/** 使用认证上下文的Hook */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
