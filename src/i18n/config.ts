import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ko } from './locales/ko';

type TranslationResource = Record<string, unknown>;

const normalizeTranslationResource = (translation: TranslationResource): TranslationResource => {
  const normalized: TranslationResource = { ...translation };
  const common = normalized.common as Record<string, unknown> | undefined;
  const commonGame = common?.game as Record<string, unknown> | undefined;

  if (commonGame && !normalized.game) {
    normalized.game = commonGame;
  }

  return normalized;
};

const staticResources = {
  en: {
    translation: normalizeTranslationResource(en),
  },
  'en-US': {
    translation: normalizeTranslationResource(en),
  },
  ko: {
    translation: normalizeTranslationResource(ko),
  },
};

const dynamicResourceLoaders: Record<string, () => Promise<TranslationResource>> = {
  'en-UK': async () => (await import('./locales/en-UK')).enUK,
  es: async () => (await import('./locales/es-ES')).esES,
  'es-ES': async () => (await import('./locales/es-ES')).esES,
  pt: async () => (await import('./locales/pt-PT')).ptPT,
  'pt-PT': async () => (await import('./locales/pt-PT')).ptPT,
  vi: async () => (await import('./locales/vi-VN')).viVN,
  'vi-VN': async () => (await import('./locales/vi-VN')).viVN,
  id: async () => (await import('./locales/id-ID')).idID,
  'id-ID': async () => (await import('./locales/id-ID')).idID,
  fr: async () => (await import('./locales/fr-FR')).frFR,
  'fr-FR': async () => (await import('./locales/fr-FR')).frFR,
  ja: async () => (await import('./locales/ja')).ja,
  'ja-JP': async () => (await import('./locales/ja')).ja,
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
            : navigator.language.startsWith('fr')
              ? 'fr-FR'
              : navigator.language.startsWith('en-GB')
                ? 'en-UK'
                : 'en';

const requestedLanguage = savedLanguage || browserLanguage;
const initialLanguage = requestedLanguage in staticResources ? requestedLanguage : 'en';

const ensureLanguageLoaded = async (language: string) => {
  if (i18n.hasResourceBundle(language, 'translation')) {
    return;
  }

  const loader = dynamicResourceLoaders[language];
  if (!loader) {
    return;
  }

  const translation = normalizeTranslationResource(await loader());
  i18n.addResourceBundle(language, 'translation', translation, true, true);
};

i18n
  .use(initReactI18next)
  .init({
    resources: staticResources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: true,
  });

const originalChangeLanguage = i18n.changeLanguage.bind(i18n);

i18n.changeLanguage = (async (language: string, callback?: (err: Error | null, t: (key: string) => string) => void) => {
  try {
    await ensureLanguageLoaded(language);
    return originalChangeLanguage(language, callback);
  } catch (error) {
    console.error(`[i18n] Failed to load language bundle: ${language}`, error);
    return originalChangeLanguage('en', callback);
  }
}) as typeof i18n.changeLanguage;

if (requestedLanguage !== initialLanguage) {
  void i18n.changeLanguage(requestedLanguage);
}

export default i18n;
