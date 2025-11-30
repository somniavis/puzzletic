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

];
