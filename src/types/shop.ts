export interface ShopItem {
    id: string;
    nameKey: string; // i18n key
    descriptionKey?: string;
    icon: string;
    category: ShopCategory;
    price: number;
    isOwned?: boolean; // For future use
}

export type ShopCategory = 'ground' | 'house';

export const SHOP_CATEGORIES: Record<ShopCategory, { nameKey: string; icon: string }> = {
    ground: { nameKey: 'shop.categories.ground', icon: '🏞️' },
    house: { nameKey: 'shop.categories.house', icon: '🏠' },
};

export const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'default_ground',
        nameKey: 'shop.items.default_ground',
        descriptionKey: 'shop.items.default_ground.desc',
        icon: '🟫',
        category: 'ground',
        price: 0,
        isOwned: true,
    },
    {
        id: 'forest_ground',
        nameKey: 'shop.items.forest_ground',
        descriptionKey: 'shop.items.forest_ground.desc',
        category: 'ground',
        price: 100,
        icon: '🌲',
    },
    {
        id: 'tropical_ground',
        nameKey: 'shop.items.tropical_ground',
        descriptionKey: 'shop.items.tropical_ground.desc',
        icon: '🏝️',
        category: 'ground',
        price: 250,
        isOwned: false,
    },
    {
        id: 'desert_ground',
        nameKey: 'shop.items.desert_ground',
        descriptionKey: 'shop.items.desert_ground.desc',
        price: 250,
        category: 'ground',
        icon: '🏜️',
    },
    {
        id: 'arctic_ground',
        nameKey: 'shop.items.arctic_ground',
        descriptionKey: 'shop.items.arctic_ground.desc',
        icon: '❄️',
        category: 'ground',
        price: 300,
        isOwned: false,
    },
    {
        id: 'volcanic_ground',
        nameKey: 'shop.items.volcanic_ground',
        descriptionKey: 'shop.items.volcanic_ground.desc',
        icon: '🌋',
        category: 'ground',
        price: 300,
        isOwned: false,
    },
    {
        id: 'shape_ground',
        nameKey: 'shop.items.shape_ground', // "Shape Land"
        descriptionKey: 'shop.items.shape_ground.desc',
        icon: '💠',
        category: 'ground',
        price: 500,
        isOwned: false,
    },
    {
        id: 'sweet_ground',
        nameKey: 'shop.items.sweet_ground',
        descriptionKey: 'shop.items.sweet_ground.desc',
        icon: '🍭',
        category: 'ground',
        price: 500,
        isOwned: false,
    },
    {
        id: 'night_city',
        nameKey: 'shop.items.night_city',
        descriptionKey: 'shop.items.night_city.desc',
        icon: '🌃',
        category: 'ground',
        price: 500,
        isOwned: false,
    },
    {
        id: 'deep_sea_ground',
        nameKey: 'shop.items.deep_sea_ground',
        descriptionKey: 'shop.items.deep_sea_ground.desc',
        icon: '🌊',
        category: 'ground',
        price: 500,
        isOwned: false,
    },
    {
        id: 'layout1_template',
        nameKey: 'shop.items.layout1_template',
        descriptionKey: 'shop.items.layout1_template.desc',
        icon: '🏗️',
        category: 'ground',
        price: 0,
        isOwned: false,
    },
    // Houses
    {
        id: 'tent',
        nameKey: 'shop.items.tent',
        descriptionKey: 'shop.items.tent.desc',
        icon: '⛺',
        category: 'house',
        price: 0,
        isOwned: true,
    },
    {
        id: 'old_house',
        nameKey: 'shop.items.old_house',
        icon: '🏚️',
        category: 'house',
        price: 100,
    },
    {
        id: 'house',
        nameKey: 'shop.items.house',
        icon: '🏠',
        category: 'house',
        price: 200,
    },
    {
        id: 'garden_house',
        nameKey: 'shop.items.garden_house',
        icon: '🏡',
        category: 'house',
        price: 300,
    },
    {
        id: 'building',
        nameKey: 'shop.items.building',
        icon: '🏢',
        category: 'house',
        price: 500,
    },
    {
        id: 'hotel',
        nameKey: 'shop.items.hotel',
        icon: '🏨',
        category: 'house',
        price: 600,
    },
    {
        id: 'factory',
        nameKey: 'shop.items.factory',
        icon: '🏭',
        category: 'house',
        price: 700,
    },
    {
        id: 'circus',
        nameKey: 'shop.items.circus',
        icon: '🎪',
        category: 'house',
        price: 800,
    },
    {
        id: 'stadium',
        nameKey: 'shop.items.stadium',
        icon: '🏟️',
        category: 'house',
        price: 900,
    },
    {
        id: 'church',
        nameKey: 'shop.items.church',
        icon: '⛪',
        category: 'house',
        price: 1100,
    },
    {
        id: 'mosque',
        nameKey: 'shop.items.mosque',
        icon: '🕌',
        category: 'house',
        price: 1100,
    },
    {
        id: 'hindu_temple',
        nameKey: 'shop.items.hindu_temple',
        icon: '🛕',
        category: 'house',
        price: 1100,
    },
    {
        id: 'synagogue',
        nameKey: 'shop.items.synagogue',
        icon: '🕍',
        category: 'house',
        price: 1100,
    },
    {
        id: 'greek_temple',
        nameKey: 'shop.items.greek_temple',
        icon: '🏛️',
        category: 'house',
        price: 1100,
    },
    {
        id: 'kaaba',
        nameKey: 'shop.items.kaaba',
        icon: '🕋',
        category: 'house',
        price: 1100,
    },
    {
        id: 'japanese_castle',
        nameKey: 'shop.items.japanese_castle',
        icon: '🏯',
        category: 'house',
        price: 1800,
    },
    {
        id: 'european_castle',
        nameKey: 'shop.items.european_castle',
        icon: '🏰',
        category: 'house',
        price: 1800,
    },
];
