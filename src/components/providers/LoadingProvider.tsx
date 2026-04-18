'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  progress: number;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
  setProgress: (value: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('加載中...');
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const startLoading = useCallback((text = '加載中...') => {
    setIsLoading(true);
    setLoadingText(text);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setShowProgress(false);
    }, 300);
  }, []);

  const handleSetProgress = useCallback((value: number) => {
    setProgress(value);
    setShowProgress(true);
  }, []);

  // 页面路由变化时自动显示loading
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleStart = () => {
      timeout = setTimeout(() => {
        startLoading('頁面加載中...');
      }, 200);
    };

    const handleComplete = () => {
      clearTimeout(timeout);
      stopLoading();
    };

    // 可以在这里添加路由事件监听
    // 例如 Next.js 的 router.events

    return () => {
      clearTimeout(timeout);
    };
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingText,
        progress,
        startLoading,
        stopLoading,
        setProgress: handleSetProgress,
      }}
    >
      {children}
      
      {/* 全局加载指示器 */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* 顶部进度条 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress || 50}%` }}
            />
          </div>

          {/* 中心加载动画（仅在长时间加载时显示） */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm',
              'opacity-0 transition-opacity duration-300',
              progress === 0 && 'opacity-100'
            )}
          >
            <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl shadow-lg">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{loadingText}</p>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
