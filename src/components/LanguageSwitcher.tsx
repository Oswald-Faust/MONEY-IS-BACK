'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      onClick={toggleLocale}
      className="relative flex items-center w-[52px] h-7 rounded-full bg-glass-bg border border-glass-border hover:border-accent-primary/40 transition-all duration-300 cursor-pointer overflow-hidden group"
      aria-label="Switch language"
      title={locale === 'fr' ? 'Switch to English' : 'Passer en Français'}
    >
      {/* Sliding background pill */}
      <motion.div
        layout
        className="absolute top-[2px] w-[24px] h-[22px] rounded-full bg-accent-primary/20 backdrop-blur-sm border border-accent-primary/30"
        animate={{
          left: locale === 'fr' ? '2px' : '24px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />

      {/* FR label */}
      <span
        className={`relative z-10 flex-1 text-center text-[10px] font-bold tracking-wide transition-colors duration-200 ${
          locale === 'fr' ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-dim'
        }`}
      >
        FR
      </span>

      {/* EN label */}
      <span
        className={`relative z-10 flex-1 text-center text-[10px] font-bold tracking-wide transition-colors duration-200 ${
          locale === 'en' ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-dim'
        }`}
      >
        EN
      </span>
    </button>
  );
};
