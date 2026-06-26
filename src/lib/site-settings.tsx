'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_title: string;
  site_description: string;
  site_keywords: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  currency: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: string;
  [key: string]: string;
}

/** 货币代码 → 符号映射 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  HKD: 'HK$',
  CNY: '¥',
  USD: '$',
  TWD: 'NT$',
  JPY: '¥',
  KRW: '₩',
  EUR: '€',
  GBP: '£',
};

const defaultSettings: SiteSettings = {
  site_name: '符寶網',
  site_logo: '',
  site_title: '全球玄門文化科普交易平台',
  site_description: '科普先行 · 交易放心 · 一物一證',
  site_keywords: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  currency: 'HK$',
  smtp_host: '',
  smtp_port: '',
  smtp_user: '',
  smtp_pass: '',
  smtp_secure: '',
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: defaultSettings,
  loading: false,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children, initialSettings }: { children: React.ReactNode; initialSettings?: Record<string, string> }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      return { ...defaultSettings, ...initialSettings };
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(!initialSettings || Object.keys(initialSettings).length === 0);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          // Convert settings array to key-value object
          const settingsMap: SiteSettings = { ...defaultSettings };
          if (Array.isArray(data.data)) {
            data.data.forEach((item: { key: string; value: string }) => {
              if (item.key) {
                settingsMap[item.key] = item.value || '';
              }
            });
          }
          // Convert default_currency code to currency symbol
          const currencyCode = settingsMap['default_currency'] || 'HKD';
          settingsMap.currency = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
          setSettings(settingsMap);
        }
      }
    } catch {
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch from client if no initial settings provided (SSR already loaded them)
    if (!initialSettings || Object.keys(initialSettings).length === 0) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [fetchSettings, initialSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
