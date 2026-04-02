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

const TAIL_RUNNER_LOCALE_BUNDLES = {
    en: { translation: { games: { 'play-jello-comet': manifestEn } } },
    'en-UK': { translation: { games: { 'play-jello-comet': manifestEnUk } } },
    'es-ES': { translation: { games: { 'play-jello-comet': manifestEsEs } } },
    'fr-FR': { translation: { games: { 'play-jello-comet': manifestFrFr } } },
    'id-ID': { translation: { games: { 'play-jello-comet': manifestIdId } } },
    ja: { translation: { games: { 'play-jello-comet': manifestJa } } },
    ko: { translation: { games: { 'play-jello-comet': manifestKo } } },
    'pt-PT': { translation: { games: { 'play-jello-comet': manifestPtPt } } },
    'vi-VN': { translation: { games: { 'play-jello-comet': manifestViVn } } },
} as const;

const TAIL_RUNNER_LOCALE_MANIFESTS = {
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

Object.keys(TAIL_RUNNER_LOCALE_BUNDLES).forEach((lang) => {
    i18nCore.addResourceBundle(
        lang,
        'translation',
        TAIL_RUNNER_LOCALE_BUNDLES[lang as keyof typeof TAIL_RUNNER_LOCALE_BUNDLES].translation,
        true,
        true
    );
});

export const resolveTailRunnerLocale = (language?: string): keyof typeof TAIL_RUNNER_LOCALE_MANIFESTS => {
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

const getTailRunnerLocaleValue = (manifest: Record<string, unknown>, key: string): unknown => (
    key.split('.').reduce<unknown>((accumulator, part) => {
        if (!accumulator || typeof accumulator !== 'object') return undefined;
        return (accumulator as Record<string, unknown>)[part];
    }, manifest)
);

const formatTailRunnerLocaleString = (
    template: string,
    values?: Record<string, string | number>
) => {
    if (!values) return template;
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(values[key] ?? ''));
};

export const createTailRunnerTranslator = (language?: string) => {
    const locale = resolveTailRunnerLocale(language);
    const messages = TAIL_RUNNER_LOCALE_MANIFESTS[locale] ?? manifestEn;

    return (key: string, values?: Record<string, string | number>) => {
        const localized = getTailRunnerLocaleValue(messages as Record<string, unknown>, key);
        const fallback = getTailRunnerLocaleValue(manifestEn as Record<string, unknown>, key);
        const template = typeof localized === 'string'
            ? localized
            : typeof fallback === 'string'
                ? fallback
                : key;
        return formatTailRunnerLocaleString(template, values);
    };
};
