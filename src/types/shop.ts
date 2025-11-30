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
        id: 'tropical_ground',
        nameKey: 'shop.items.tropical_ground',
        descriptionKey: 'shop.items.tropical_ground.desc',
        icon: '🏝️',
        category: 'ground',
        price: 150,
        isOwned: false,
    },
    {
        id: 'arctic_ground',
        nameKey: 'shop.items.arctic_ground',
        descriptionKey: 'shop.items.arctic_ground.desc',
        icon: '❄️',
        category: 'ground',
        price: 200,
        isOwned: false,
    },
    {
        id: 'volcanic_ground',
        nameKey: 'shop.items.volcanic_ground',
        descriptionKey: 'shop.items.volcanic_ground.desc',
        icon: '🌋',
        category: 'ground',
        price: 250,
        isOwned: false,
    },
];
