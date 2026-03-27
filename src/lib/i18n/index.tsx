'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKey;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('zh-TW');

  useEffect(() => {
    // 从 localStorage 读取语言设置
    const savedLang = localStorage.getItem('fubao-lang') as Language;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('fubao-lang', newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
];
