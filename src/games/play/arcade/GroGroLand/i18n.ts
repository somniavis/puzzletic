import i18nCore from '../../../../i18n/config';
import manifestEnUk from './locales/en-UK';
import manifestEn from './locales/en';
import manifestEsEs from './locales/es-ES';
import manifestFrFr from './locales/fr-FR';
import manifestIdId from './locales/id-ID';
import manifestJa from './locales/ja';
import manifestKo from './locales/ko';
import manifestPtPt from './locales/pt-PT';
import manifestViVn from './locales/vi-VN';

const MESSAGES = {
    'en-UK': manifestEnUk,
    en: manifestEn,
    'es-ES': manifestEsEs,
    'fr-FR': manifestFrFr,
    'id-ID': manifestIdId,
    ja: manifestJa,
    ko: manifestKo,
    'pt-PT': manifestPtPt,
    'vi-VN': manifestViVn,
} as const;

const GROGRO_LAND_LOCALE_BUNDLES = {
    en: { translation: { games: { 'play-grogro-land': manifestEn } } },
    'en-UK': { translation: { games: { 'play-grogro-land': manifestEnUk } } },
    'es-ES': { translation: { games: { 'play-grogro-land': manifestEsEs } } },
    'fr-FR': { translation: { games: { 'play-grogro-land': manifestFrFr } } },
    'id-ID': { translation: { games: { 'play-grogro-land': manifestIdId } } },
    ja: { translation: { games: { 'play-grogro-land': manifestJa } } },
    ko: { translation: { games: { 'play-grogro-land': manifestKo } } },
    'pt-PT': { translation: { games: { 'play-grogro-land': manifestPtPt } } },
    'vi-VN': { translation: { games: { 'play-grogro-land': manifestViVn } } },
} as const;

Object.keys(GROGRO_LAND_LOCALE_BUNDLES).forEach((lang) => {
    i18nCore.addResourceBundle(
        lang,
        'translation',
        GROGRO_LAND_LOCALE_BUNDLES[lang as keyof typeof GROGRO_LAND_LOCALE_BUNDLES].translation,
        true,
        true
    );
});

const getLocaleValue = (manifest: Record<string, unknown>, key: string): unknown => (
    key.split('.').reduce<unknown>((accumulator, part) => {
        if (!accumulator || typeof accumulator !== 'object') return undefined;
        return (accumulator as Record<string, unknown>)[part];
    }, manifest)
);

const formatString = (template: string, values?: Record<string, string | number>) => {
    if (!values) return template;
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(values[key] ?? ''));
};

export const resolveGroGroLandLocale = (language?: string): keyof typeof MESSAGES => {
    if (!language) return 'en';
    if (language === 'en-UK' || language === 'es-ES' || language === 'fr-FR' || language === 'id-ID' || language === 'pt-PT' || language === 'vi-VN') {
        return language;
    }
    if (language.startsWith('ja')) return 'ja';
    if (language?.startsWith('ko')) return 'ko';
    if (language.startsWith('es')) return 'es-ES';
    if (language.startsWith('fr')) return 'fr-FR';
    if (language.startsWith('id')) return 'id-ID';
    if (language.startsWith('pt')) return 'pt-PT';
    if (language.startsWith('vi')) return 'vi-VN';
    if (language.startsWith('en-GB')) return 'en-UK';
    return 'en';
};

export const createGroGroLandTranslator = (language?: string) => {
    const locale = resolveGroGroLandLocale(language);
    const manifest = MESSAGES[locale] ?? manifestEn;

    return (key: string, values?: Record<string, string | number>) => {
        const localized = getLocaleValue(manifest as Record<string, unknown>, key);
        const fallback = getLocaleValue(manifestEn as Record<string, unknown>, key);
        const template = typeof localized === 'string'
            ? localized
            : typeof fallback === 'string'
                ? fallback
                : key;
        return formatString(template, values);
    };
};
