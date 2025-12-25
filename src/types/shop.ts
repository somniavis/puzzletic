export interface ShopItem {
    id: string;
    nameKey: string; // i18n key
    descriptionKey?: string;
    icon: string;
    category: ShopCategory;
    price: number;
    isOwned?: boolean; // For future use
}

export type ShopCategory = 'ground';

export const SHOP_CATEGORIES: Record<ShopCategory, { nameKey: string; icon: string }> = {
    ground: { nameKey: 'shop.categories.ground', icon: '🏞️' },
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
        price: 110,
        icon: '🌲',
    },
    {
        id: 'tropical_ground',
        nameKey: 'shop.items.tropical_ground',
        descriptionKey: 'shop.items.tropical_ground.desc',
        icon: '🏝️',
        category: 'ground',
        price: 300,
        isOwned: false,
    },
    {
        id: 'desert_ground',
        nameKey: 'shop.items.desert_ground',
        descriptionKey: 'shop.items.desert_ground.desc',
        price: 350,
        category: 'ground',
        icon: '🏜️',
    },
    {
        id: 'arctic_ground',
        nameKey: 'shop.items.arctic_ground',
        descriptionKey: 'shop.items.arctic_ground.desc',
        icon: '❄️',
        category: 'ground',
        price: 400,
        isOwned: false,
    },
    {
        id: 'volcanic_ground',
        nameKey: 'shop.items.volcanic_ground',
        descriptionKey: 'shop.items.volcanic_ground.desc',
        icon: '🌋',
        category: 'ground',
        price: 500,
        isOwned: false,
    },
    {
        id: 'shape_ground',
        nameKey: 'shop.items.shape_ground', // "Shape Land"
        descriptionKey: 'shop.items.shape_ground.desc',
        icon: '💠',
        category: 'ground',
        price: 450,
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
];
