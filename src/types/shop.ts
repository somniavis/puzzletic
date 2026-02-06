export interface ShopItem {
    id: string;
    nameKey: string; // i18n key
    descriptionKey?: string;
    icon: string;
    category: ShopCategory;
    price: number;
    isOwned?: boolean; // For future use
}

export type ShopCategory = 'ground' | 'house' | 'pet';

export const SHOP_CATEGORIES: Record<ShopCategory, { nameKey: string; icon: string }> = {
    ground: { nameKey: 'shop.categories.ground', icon: '🏞️' },
    house: { nameKey: 'shop.categories.house', icon: '🏠' },
    pet: { nameKey: 'shop.categories.pet', icon: '🐾' },
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
        id: 'amusement_park_ground',
        nameKey: 'shop.items.amusement_park_ground',
        descriptionKey: 'shop.items.amusement_park_ground.desc',
        icon: '🎡',
        category: 'ground',
        price: 600,
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

export type PetSpeed = 'fast' | 'normal' | 'slow' | 'very_slow';
export type PetRarity = 'common' | 'uncommon' | 'rare' | 'special';

export interface PetItem {
    id: string;
    nameKey: string; // Added nameKey
    icon: string;
    speed: PetSpeed;
    rarity: PetRarity;
    isHidden?: boolean; // New property to hide implementation variants from UI
}

export const PET_ITEMS: PetItem[] = [
    // Common (High Probability ~60%)
    { id: 'monkey', nameKey: 'shop.items.pet.monkey', icon: '🐒', speed: 'fast', rarity: 'common' },
    { id: 'hedgehog', nameKey: 'shop.items.pet.hedgehog', icon: '🦔', speed: 'normal', rarity: 'common' },
    { id: 'lizard', nameKey: 'shop.items.pet.lizard', icon: '🦎', speed: 'fast', rarity: 'common' },
    { id: 'octopus', nameKey: 'shop.items.pet.octopus', icon: '🐙', speed: 'normal', rarity: 'common' },
    { id: 'squid', nameKey: 'shop.items.pet.squid', icon: '🦑', speed: 'normal', rarity: 'common' },
    { id: 'snail', nameKey: 'shop.items.pet.snail', icon: '🐌', speed: 'very_slow', rarity: 'common' },

    // Uncommon (Medium Probability ~37%)
    { id: 'scorpion', nameKey: 'shop.items.pet.scorpion', icon: '🦂', speed: 'normal', rarity: 'uncommon' },
    { id: 'turtle', nameKey: 'shop.items.pet.turtle', icon: '🐢', speed: 'slow', rarity: 'uncommon' },
    { id: 'dodo', nameKey: 'shop.items.pet.dodo', icon: '🦤', speed: 'normal', rarity: 'uncommon' },
    { id: 'snowman', nameKey: 'shop.items.pet.snowman', icon: '⛄', speed: 'slow', rarity: 'uncommon' },

    // Rare (Low Probability ~3%)
    { id: 'dino', nameKey: 'shop.items.pet.dino', icon: '🦖', speed: 'slow', rarity: 'rare' },
    { id: 'phoenix', nameKey: 'shop.items.pet.phoenix', icon: '🐦‍🔥', speed: 'fast', rarity: 'rare' },

    // Special (Displayed in Gacha List)
    { id: 'r2_pet_1', nameKey: 'shop.items.pet.r2_pet_1', icon: '🐾', speed: 'normal', rarity: 'special' },

    // Hidden Variants (Selected via Logic)
    { id: 'special_pet_0', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/Pet1.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_1', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet2.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_2', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet3.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_3', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet4.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_4', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet5.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_5', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet6.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_6', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet7.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_7', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet8.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_8', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet9.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_9', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet10.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_10', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet11.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_11', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet12.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_12', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet13.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_13', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet15.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_14', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet16.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },
    { id: 'special_pet_15', nameKey: 'shop.items.pet.r2_pet_1', icon: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet17.png', speed: 'normal', rarity: 'special' as PetRarity, isHidden: true },];
