import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { enUK } from './locales/en-UK';
import { ko } from './locales/ko';
import { ja } from './locales/ja';

const resources = {
  en: {
    translation: en,
  },
  'en-UK': {
    translation: enUK,
  },
  ko: {
    translation: ko,
  },
  ja: {
    translation: ja,
  },
};

const safeStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('[i18n] localStorage.getItem failed:', error);
    return null;
  }
};

const savedLanguage = safeStorageGet('language');
const browserLanguage = navigator.language.startsWith('ko')
  ? 'ko'
  : navigator.language.startsWith('ja')
    ? 'ja'
    : navigator.language.startsWith('en-GB')
      ? 'en-UK'
    : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || browserLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    debug: true,
  });

export default i18n;
