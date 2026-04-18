'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BackToTop } from '@/components/ui/BackToTop';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={300}>
          {children}
          
          {/* Toast通知 */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          
          {/* 回到顶部按钮 */}
          <BackToTop 
            threshold={300} 
            position="bottom-right"
            showProgress
          />
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
