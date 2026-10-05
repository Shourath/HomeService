'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, DICTIONARIES, SUPPORTED_LANGUAGES, LanguageOption } from './config';

type Dictionary = typeof DICTIONARIES['en'];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Dictionary;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('homeservice_lang') as LanguageCode;
    if (saved && DICTIONARIES[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (DICTIONARIES[lang]) {
      setLanguageState(lang);
      localStorage.setItem('homeservice_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const t = DICTIONARIES[language] || DICTIONARIES['en'];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
