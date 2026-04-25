export type BillingOfferType = 'subscription' | 'duration';

export type BillingMarketSegment = 'developed' | 'developing';

export type BillingProductId =
    | 'subscription_3_months'
    | 'subscription_12_months'
    | 'duration_3_months'
    | 'duration_12_months';

export type BillingDurationMonths = 3 | 12;

export interface BillingProductDefinition {
    id: BillingProductId;
    offerType: BillingOfferType;
    marketSegment: BillingMarketSegment;
    durationMonths: BillingDurationMonths;
    displayName: string;
    displayPriority: number;
}

export const BILLING_PRODUCTS: BillingProductDefinition[] = [
    {
        id: 'subscription_3_months',
        offerType: 'subscription',
        marketSegment: 'developed',
        durationMonths: 3,
        displayName: '3-month subscription',
        displayPriority: 2,
    },
    {
        id: 'subscription_12_months',
        offerType: 'subscription',
        marketSegment: 'developed',
        durationMonths: 12,
        displayName: '12-month subscription',
        displayPriority: 1,
    },
    {
        id: 'duration_3_months',
        offerType: 'duration',
        marketSegment: 'developing',
        durationMonths: 3,
        displayName: '3-month pass',
        displayPriority: 1,
    },
    {
        id: 'duration_12_months',
        offerType: 'duration',
        marketSegment: 'developing',
        durationMonths: 12,
        displayName: '12-month pass',
        displayPriority: 2,
    },
];

const DEVELOPED_COUNTRY_CODES = new Set([
    'US', 'GB', 'ES', 'PT', 'FR', 'KR', 'JP',
]);

const DEVELOPING_COUNTRY_CODES = new Set([
    'VN', 'ID',
]);

const DURATION_FALLBACK_LANGUAGES = new Set(['id', 'id-ID', 'vi', 'vi-VN']);

const normalizeCountryCode = (countryCode?: string | null) => {
    if (!countryCode) return null;
    const normalized = countryCode.trim().toUpperCase();
    return normalized.length === 2 ? normalized : null;
};

export const resolveBillingMarketSegment = (
    countryCode?: string | null,
    languageCode?: string | null
): BillingMarketSegment => {
    const normalizedCountry = normalizeCountryCode(countryCode);

    if (normalizedCountry && DEVELOPING_COUNTRY_CODES.has(normalizedCountry)) {
        return 'developing';
    }

    if (normalizedCountry && DEVELOPED_COUNTRY_CODES.has(normalizedCountry)) {
        return 'developed';
    }

    // Fallback for environments where billing country is not available yet.
    if (languageCode && DURATION_FALLBACK_LANGUAGES.has(languageCode)) {
        return 'developing';
    }

    return 'developed';
};

export const resolveBillingOfferType = (
    countryCode?: string | null,
    languageCode?: string | null
): BillingOfferType => {
    return resolveBillingMarketSegment(countryCode, languageCode) === 'developing'
        ? 'duration'
        : 'subscription';
};

export const getVisibleBillingProducts = (
    countryCode?: string | null,
    languageCode?: string | null
): BillingProductDefinition[] => {
    const marketSegment = resolveBillingMarketSegment(countryCode, languageCode);

    return BILLING_PRODUCTS
        .filter((product) => product.marketSegment === marketSegment)
        .sort((a, b) => a.displayPriority - b.displayPriority);
};

export const resolveBillingProduct = (
    durationMonths: BillingDurationMonths,
    countryCode?: string | null,
    languageCode?: string | null
): BillingProductDefinition | null => {
    const offerType = resolveBillingOfferType(countryCode, languageCode);

    return BILLING_PRODUCTS.find((product) =>
        product.durationMonths === durationMonths && product.offerType === offerType
    ) || null;
};
