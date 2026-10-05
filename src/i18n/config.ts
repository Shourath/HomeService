import en from './dictionaries/en.json';
import ta from './dictionaries/ta.json';
import hi from './dictionaries/hi.json';
import te from './dictionaries/te.json';
import kn from './dictionaries/kn.json';
import ml from './dictionaries/ml.json';

export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

export const DICTIONARIES: Record<LanguageCode, typeof en> = {
  en,
  ta: ta as unknown as typeof en,
  hi: hi as unknown as typeof en,
  te: te as unknown as typeof en,
  kn: kn as unknown as typeof en,
  ml: ml as unknown as typeof en,
};
