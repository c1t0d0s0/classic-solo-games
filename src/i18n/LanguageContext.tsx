import React, { createContext, useContext, useMemo } from 'react';
import { SupportedLanguage, translations } from './translations';
import { UserSettings } from '../types/common';

export const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = (
    navigator.language ||
    (navigator as unknown as { userLanguage?: string }).userLanguage ||
    'en'
  ).toLowerCase();
  return lang.startsWith('ja') ? 'ja' : 'en';
};

interface LanguageContextValue {
  language: SupportedLanguage;
  languageSetting: 'auto' | 'ja' | 'en';
  t: (key: keyof typeof translations.ja) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ja',
  languageSetting: 'auto',
  t: (key) => translations.ja[key] || key,
});

interface LanguageProviderProps {
  settings: UserSettings;
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  settings,
  children,
}) => {
  const languageSetting = settings.language || 'auto';

  const language: SupportedLanguage = useMemo(() => {
    if (languageSetting === 'auto') {
      return detectBrowserLanguage();
    }
    return languageSetting;
  }, [languageSetting]);

  const t = (key: keyof typeof translations.ja): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.ja[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, languageSetting, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
