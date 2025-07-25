import { useAppContext } from '@/contexts/AppContext';
import en from '@/translations/en';
import hi from '@/translations/hi';
import te from '@/translations/te';

const translations = {
  en,
  hi,
  te,
};

export function useTranslation() {
  const { language } = useAppContext();
  const currentTranslations = translations[language as keyof typeof translations] || translations.en;

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = currentTranslations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return value || key;
  };

  return { t };
}
