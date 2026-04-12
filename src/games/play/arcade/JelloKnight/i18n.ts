import i18nCore from '../../../../i18n/config';
import manifestEn from './locales/en';
import manifestEnUk from './locales/en-UK';
import manifestEsEs from './locales/es-ES';
import manifestFrFr from './locales/fr-FR';
import manifestIdId from './locales/id-ID';
import manifestJa from './locales/ja';
import manifestKo from './locales/ko';
import manifestPtPt from './locales/pt-PT';
import manifestViVn from './locales/vi-VN';

const JELLO_KNIGHT_GAME_KEY = 'play-jello-knight';

const JELLO_KNIGHT_LOCALE_BUNDLES = {
    en: { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestEn } } },
    'en-UK': { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestEnUk } } },
    'es-ES': { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestEsEs } } },
    'fr-FR': { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestFrFr } } },
    'id-ID': { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestIdId } } },
    ja: { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestJa } } },
    ko: { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestKo } } },
    'pt-PT': { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestPtPt } } },
    'vi-VN': { translation: { games: { [JELLO_KNIGHT_GAME_KEY]: manifestViVn } } },
} as const;

const JELLO_KNIGHT_LOCALE_MANIFESTS = {
    en: manifestEn,
    'en-UK': manifestEnUk,
    'es-ES': manifestEsEs,
    'fr-FR': manifestFrFr,
    'id-ID': manifestIdId,
    ja: manifestJa,
    ko: manifestKo,
    'pt-PT': manifestPtPt,
    'vi-VN': manifestViVn,
} as const;

Object.keys(JELLO_KNIGHT_LOCALE_BUNDLES).forEach((lang) => {
    i18nCore.addResourceBundle(
        lang,
        'translation',
        JELLO_KNIGHT_LOCALE_BUNDLES[lang as keyof typeof JELLO_KNIGHT_LOCALE_BUNDLES].translation,
        true,
        true
    );
});

export const resolveJelloKnightLocale = (language?: string): keyof typeof JELLO_KNIGHT_LOCALE_MANIFESTS => {
    if (!language) return 'en';
    if (language === 'en-UK' || language === 'es-ES' || language === 'fr-FR' || language === 'id-ID' || language === 'pt-PT' || language === 'vi-VN') {
        return language;
    }
    if (language.startsWith('ko')) return 'ko';
    if (language.startsWith('ja')) return 'ja';
    if (language.startsWith('es')) return 'es-ES';
    if (language.startsWith('fr')) return 'fr-FR';
    if (language.startsWith('id')) return 'id-ID';
    if (language.startsWith('pt')) return 'pt-PT';
    if (language.startsWith('vi')) return 'vi-VN';
    if (language.startsWith('en-GB')) return 'en-UK';
    return 'en';
};

const getJelloKnightLocaleValue = (manifest: Record<string, unknown>, key: string): unknown => (
    key.split('.').reduce<unknown>((accumulator, part) => {
        if (!accumulator || typeof accumulator !== 'object') return undefined;
        return (accumulator as Record<string, unknown>)[part];
    }, manifest)
);

const formatJelloKnightLocaleString = (
    template: string,
    values?: Record<string, string | number>
) => {
    if (!values) return template;
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(values[key] ?? ''));
};

export const createJelloKnightTranslator = (language?: string) => {
    const locale = resolveJelloKnightLocale(language);
    const messages = JELLO_KNIGHT_LOCALE_MANIFESTS[locale] ?? manifestEn;

    return (key: string, values?: Record<string, string | number>) => {
        const localized = getJelloKnightLocaleValue(messages as Record<string, unknown>, key);
        const fallback = getJelloKnightLocaleValue(manifestEn as Record<string, unknown>, key);
        const template = typeof localized === 'string'
            ? localized
            : typeof fallback === 'string'
                ? fallback
                : key;
        return formatJelloKnightLocaleString(template, values);
    };
};
