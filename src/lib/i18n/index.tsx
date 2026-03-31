'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKey;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// RTL 语言列表
export const rtlLanguages: Language[] = ['ar'];

// 检查是否是 RTL 语言
export function isRTLLanguage(lang: Language): boolean {
  return rtlLanguages.includes(lang);
}

// 获取语言方向
export function getLanguageDirection(lang: Language): 'ltr' | 'rtl' {
  return isRTLLanguage(lang) ? 'rtl' : 'ltr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('zh-TW');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 从 localStorage 读取语言设置
    const savedLang = localStorage.getItem('fubao-lang') as Language;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  // 当语言改变时，更新 HTML 属性
  useEffect(() => {
    if (!mounted) return;
    
    const direction = getLanguageDirection(lang);
    const html = document.documentElement;
    
    // 设置 lang 属性
    html.setAttribute('lang', lang);
    
    // 设置 dir 属性
    html.setAttribute('dir', direction);
    
    // 添加或移除 RTL class
    if (direction === 'rtl') {
      html.classList.add('rtl');
      html.classList.remove('ltr');
    } else {
      html.classList.add('ltr');
      html.classList.remove('rtl');
    }
    
    // 更新 body 的 text-align 样式（用于某些不支持 flex 的元素）
    document.body.style.direction = direction;
    
  }, [lang, mounted]);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('fubao-lang', newLang);
  };

  const isRTL = isRTLLanguage(lang);
  const direction = getLanguageDirection(lang);

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t: translations[lang], isRTL, direction }}>
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

export const languages: { code: Language; name: string; nativeName: string; direction: 'ltr' | 'rtl' }[] = [
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
];
