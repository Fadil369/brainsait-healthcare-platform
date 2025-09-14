// Enhanced translation hook for App Router compatibility with full i18n support
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useAppStore } from '@/stores';

// Import the JSON files directly for fallback
import commonEn from '../../public/locales/en/common.json';
import commonAr from '../../public/locales/ar/common.json';
import productsEn from '../../public/locales/en/products.json';
import productsAr from '../../public/locales/ar/products.json';

// Enhanced fallback translations that match the JSON structure
const fallbackTranslations = {
  en: {
    common: commonEn,
    products: productsEn,
  },
  ar: {
    common: commonAr,
    products: productsAr,
  }
};

export function useTranslation(namespace = 'common') {
  const { language } = useAppStore();
  const { t: i18nT, i18n, ready } = useI18nextTranslation(namespace);
  
  // Ensure i18n language is synced with app store
  if (ready && i18n.language !== language) {
    i18n.changeLanguage(language);
  }
  
  const t = (key: string, options?: any) => {
    // If i18next is ready and the translation exists, use it
    if (ready) {
      const translation = i18nT(key, options);
      // If translation is not the key itself (meaning it was found), return it
      if (translation !== key) {
        return translation;
      }
    }
    
    // Fallback to static translations
    const keys = key.split('.');
    let value: any = fallbackTranslations[language as keyof typeof fallbackTranslations]?.[namespace as keyof typeof fallbackTranslations.en];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // If still no translation found, return the key for debugging
    return value || key;
  };
  
  return { 
    t,
    ready,
    language,
    i18n,
    // Expose additional utilities
    changeLanguage: i18n.changeLanguage,
    exists: (key: string) => i18n.exists(key),
  };
}