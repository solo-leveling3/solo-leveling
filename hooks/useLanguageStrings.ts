// hooks/useLanguageStrings.ts
import { LanguageCode, LanguageStrings, languages } from '@/constants/Languages';
import { useAppContext } from '@/contexts/AppContext';

export function useLanguageStrings(): LanguageStrings {
  const { language } = useAppContext();
  return languages[language as LanguageCode] || languages.en;
}
