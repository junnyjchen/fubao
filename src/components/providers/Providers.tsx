'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth/context';
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
