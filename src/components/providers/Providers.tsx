'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth/context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18nProvider>
  );
}
