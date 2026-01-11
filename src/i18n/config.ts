import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ko } from './locales/ko';

const resources = {
  en: {
    translation: en,
  },
  ko: {
    translation: ko,
  },
};

const savedLanguage = localStorage.getItem('language');
const browserLanguage = navigator.language.startsWith('ko') ? 'ko' : 'en';

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
