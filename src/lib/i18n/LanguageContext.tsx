'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import frTranslations from './translations/fr';
import enTranslations from './translations/en';
import type { TranslationType } from './translations/fr';

export type Locale = 'fr' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationType;
}

// Cast through unknown to handle readonly -> mutable conversion from `as const`
const translations: Record<Locale, TranslationType> = {
  fr: frTranslations as unknown as TranslationType,
  en: enTranslations as unknown as TranslationType,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  setLocale: () => {},
  t: translations.fr,
});

const STORAGE_KEY = 'mib-locale';

// Helper to read locale from localStorage safely
function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'fr';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with stored locale (avoids extra effect + setState cascade)
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    // Update the html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export { LanguageContext };
