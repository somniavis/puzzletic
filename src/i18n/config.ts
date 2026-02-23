import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { enUK } from './locales/en-UK';
import { esES } from './locales/es-ES';
import { ptPT } from './locales/pt-PT';
import { viVN } from './locales/vi-VN';
import { idID } from './locales/id-ID';
import { ko } from './locales/ko';
import { ja } from './locales/ja';

const resources = {
  en: {
    translation: en,
  },
  'en-US': {
    translation: en,
  },
  'en-UK': {
    translation: enUK,
  },
  es: {
    translation: esES,
  },
  'es-ES': {
    translation: esES,
  },
  pt: {
    translation: ptPT,
  },
  'pt-PT': {
    translation: ptPT,
  },
  vi: {
    translation: viVN,
  },
  'vi-VN': {
    translation: viVN,
  },
  id: {
    translation: idID,
  },
  'id-ID': {
    translation: idID,
  },
  ko: {
    translation: ko,
  },
  ja: {
    translation: ja,
  },
  'ja-JP': {
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
    ? 'ja-JP'
    : navigator.language.startsWith('es')
      ? 'es-ES'
      : navigator.language.startsWith('pt')
        ? 'pt-PT'
        : navigator.language.startsWith('vi')
          ? 'vi-VN'
          : navigator.language.startsWith('id')
            ? 'id-ID'
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
