import React, { type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuModal } from '../MenuModal';
import { SettingsMenu } from '../../SettingsMenu/SettingsMenu';
import { FOOD_ITEMS, FOOD_CATEGORIES, type FoodCategory, type FoodItem } from '../../../types/food';
import { MEDICINE_ITEMS, type MedicineItem } from '../../../types/medicine';
import { CLEANING_TOOLS, type CleaningTool } from '../../../types/cleaning';
import { SHOP_ITEMS, SHOP_CATEGORIES, PET_ITEMS, type ShopCategory, type ShopItem } from '../../../types/shop';
import { playButtonSound } from '../../../utils/sound';
import { useNurturing } from '../../../contexts/NurturingContext';
import type { CharacterAction } from '../../../types/character';

interface PetRoomMenusProps {
    // States
    showFoodMenu: boolean;
    setShowFoodMenu: Dispatch<SetStateAction<boolean>>;
    showMedicineMenu: boolean;
    setShowMedicineMenu: Dispatch<SetStateAction<boolean>>;
    showCleanMenu: boolean;
    setShowCleanMenu: Dispatch<SetStateAction<boolean>>;
    showShopMenu: boolean;
    setShowShopMenu: Dispatch<SetStateAction<boolean>>;
    showSettingsMenu: boolean;
    setShowSettingsMenu: Dispatch<SetStateAction<boolean>>;

    // Selections
    selectedFoodCategory: FoodCategory;
    setSelectedFoodCategory: Dispatch<SetStateAction<FoodCategory>>;
    selectedShopCategory: ShopCategory;
    setSelectedShopCategory: Dispatch<SetStateAction<ShopCategory>>;

    // Handlers
    onFeed: (food: FoodItem, onClose: () => void) => void;
    onGiveMedicine: (medicine: MedicineItem, onClose: () => void) => void;
    onClean: (tool: CleaningTool, onClose: () => void) => void;
    onShopItemClick: (item: ShopItem) => void;

    // Context
    nurturing: ReturnType<typeof useNurturing>;
    action: CharacterAction;
    flyingFood: any;
}
const PetShopContent: React.FC<{ nurturing: any, onPetGacha: () => void }> = ({ nurturing, onPetGacha }) => {
    const { currentPetId, petExpiresAt } = nurturing;
    const [timeRemaining, setTimeRemaining] = React.useState<string>('');
    const { t } = useTranslation();

    React.useEffect(() => {
        if (currentPetId && petExpiresAt) {
            const updateTimer = () => {
                const now = Date.now();
                const diff = petExpiresAt - now;
                if (diff <= 0) {
                    setTimeRemaining(t('shop.items.pet.expired'));
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setTimeRemaining(`${hours}h ${minutes}m`);
                }
            };
            updateTimer();
            const interval = setInterval(updateTimer, 60000);
            return () => clearInterval(interval);
        } else {
            setTimeRemaining('');
        }
    }, [currentPetId, petExpiresAt, t]); // Added t dependency

    const currentPet = PET_ITEMS.find(p => p.id === currentPetId);

    return (
        <div className="pet-shop-container">
            {/* Top: Gacha Button */}
            <div className="pet-gacha-section">
                {currentPet && (
                    <div className="pet-status-info">
                        <div className="current-pet-status">
                            <span>{t('shop.items.pet.partner')}: {currentPet.icon}</span>
                            <span className="time-remaining">{t('shop.items.pet.timeRemaining')}: {timeRemaining}</span>
                        </div>
                    </div>
                )}

                <button className="gacha-button" onClick={onPetGacha}>
                    <span className="gacha-icon">🐾</span>
                    <div className="gacha-text">
                        <span className="gacha-title">{t('shop.items.pet.gacha.title')}</span>
                        <span className="gacha-desc">{t('shop.items.pet.gacha.desc')}</span>
                        <div className="gacha-price-tag">{t('shop.items.pet.gacha.price')}</div>
                    </div>
                </button>
            </div>

            <div className="shop-divider"></div>

            {/* Bottom: Showcase */}
            <div className="pet-showcase-grid">
                <div className="showcase-items">
                    {PET_ITEMS.map((pet) => {
                        const isCurrent = currentPetId === pet.id;
                        // Rarity Color Logic (Optional)
                        let borderColor = 'transparent';
                        if (isCurrent) borderColor = '#ff6b6b';

                        return (
                            <div key={pet.id} className={`showcase-item ${isCurrent ? 'active' : ''}`} style={{ borderColor }}>
                                <div className="pet-icon" style={{ fontSize: '2rem' }}>{pet.icon}</div>
                                {isCurrent && <div className="pet-active-badge">✅</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export const PetRoomMenus: React.FC<PetRoomMenusProps> = ({
    showFoodMenu, setShowFoodMenu,
    showMedicineMenu, setShowMedicineMenu,
    showCleanMenu, setShowCleanMenu,
    showShopMenu, setShowShopMenu,
    showSettingsMenu, setShowSettingsMenu,
    selectedFoodCategory, setSelectedFoodCategory,
    selectedShopCategory, setSelectedShopCategory,
    onFeed,
    onGiveMedicine,
    onClean,
    onShopItemClick,
    nurturing,
    action,
    flyingFood
}) => {
    const { t } = useTranslation();

    const filteredFoods = FOOD_ITEMS.filter(food => food.category === selectedFoodCategory);
    const filteredShopItems = SHOP_ITEMS.filter(item => item.category === selectedShopCategory);

    return (
        <>
            {/* Food Menu Submenu */}
            {showFoodMenu && (
                <MenuModal
                    title={t('food.menu.title')}
                    onClose={() => setShowFoodMenu(false)}
                    headerContent={
                        <div className="food-categories">
                            {(Object.keys(FOOD_CATEGORIES) as FoodCategory[]).map((category) => (
                                <button
                                    key={category}
                                    className={`category-tab ${selectedFoodCategory === category ? 'active' : ''}`}
                                    onClick={() => { playButtonSound(); setSelectedFoodCategory(category); }}
                                >
                                    <span className="category-icon">{FOOD_CATEGORIES[category].icon}</span>
                                    <span className="category-name">{t(FOOD_CATEGORIES[category].nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    }
                >
                    {filteredFoods.map((food) => (
                        <button
                            key={food.id}
                            className="food-item"
                            onClick={() => onFeed(food, () => setShowFoodMenu(false))}
                            disabled={action !== 'idle' || flyingFood !== null || nurturing.gro < food.price}
                        >
                            <span className="food-item-icon">{food.icon}</span>
                            <span className="food-item-name">{t(food.nameKey)}</span>
                            <div className="food-item-effects">
                                <span className="food-item-price">💰 {food.price}</span>
                            </div>
                        </button>
                    ))}
                </MenuModal>
            )}

            {/* Medicine Menu Submenu */}
            {showMedicineMenu && (
                <MenuModal
                    title={t('medicine.menu.title')}
                    onClose={() => setShowMedicineMenu(false)}
                >
                    {MEDICINE_ITEMS.map((medicine) => (
                        <button
                            key={medicine.id}
                            className="food-item"
                            onClick={() => onGiveMedicine(medicine, () => setShowMedicineMenu(false))}
                            disabled={action !== 'idle' || flyingFood !== null || nurturing.gro < medicine.price || nurturing.stats.health >= 60}
                        >
                            <span className="food-item-icon">{medicine.icon}</span>
                            <span className="food-item-name">{t(medicine.nameKey)}</span>
                            <div className="food-item-effects">
                                <span className="food-item-price">💰 {medicine.price}</span>
                            </div>
                        </button>
                    ))}
                </MenuModal>
            )}

            {/* Clean Menu Submenu */}
            {showCleanMenu && (
                <MenuModal
                    title={t('cleanMenu.title')}
                    onClose={() => setShowCleanMenu(false)}
                >
                    {CLEANING_TOOLS.map((tool) => (
                        <button
                            key={tool.id}
                            className="food-item"
                            onClick={() => onClean(tool, () => setShowCleanMenu(false))}
                            disabled={
                                action !== 'idle' ||
                                (tool.id === 'broom' && nurturing.poops.length === 0) ||
                                (tool.id === 'newspaper' && nurturing.bugs.length === 0) ||
                                (tool.id === 'shower' && nurturing.gro < tool.price) ||
                                (tool.id === 'robot_cleaner' && (nurturing.gro < tool.price || (nurturing.poops.length === 0 && nurturing.bugs.length === 0)))
                            }
                        >
                            <span className="food-item-icon">{tool.icon}</span>
                            <span className="food-item-name">{t(tool.nameKey)}</span>
                            <div className="food-item-effects">
                                <span className="effect">{t(tool.descriptionKey)}</span>
                            </div>
                            <div className="food-item-price">
                                {tool.price > 0 ? `💰 ${tool.price}` : 'Free'}
                            </div>
                        </button>
                    ))}
                </MenuModal>
            )}

            {/* Shop Menu Submenu */}
            {showShopMenu && (
                <MenuModal
                    title={t('shop.menu.title', 'Shop')}
                    onClose={() => setShowShopMenu(false)}
                    variant="custom"
                    headerContent={
                        <div className="food-categories">
                            {(Object.keys(SHOP_CATEGORIES) as ShopCategory[]).map((category) => (
                                <button
                                    key={category}
                                    className={`category-tab ${selectedShopCategory === category ? 'active' : ''}`}
                                    onClick={() => { playButtonSound(); setSelectedShopCategory(category); }}
                                >
                                    <span className="cat-icon">{SHOP_CATEGORIES[category].icon}</span>
                                    <span className="cat-name">{t(SHOP_CATEGORIES[category].nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="shop-content">
                        {selectedShopCategory === 'pet' ? (
                            <PetShopContent
                                nurturing={nurturing}
                                onPetGacha={async () => {
                                    const result = nurturing.purchaseRandomPet();
                                    if (result.success) {
                                        playButtonSound();
                                        // Show toast or alert? For now alert is simple, or use a local state for toast
                                        alert(result.message);
                                    } else {
                                        alert(result.message);
                                    }
                                }}
                            />
                        ) : (
                            <div className="food-items-grid" style={{ padding: 0, maxHeight: 'none' }}>
                                {filteredShopItems.map((item) => (
                                    <button
                                        key={item.id}
                                        className={`food-item ${(item.category === 'ground' && nurturing.currentLand === item.id) ||
                                            (item.category === 'house' && nurturing.currentHouseId === item.id)
                                            ? 'active-item' : ''
                                            }`}
                                        onClick={() => onShopItemClick(item)}
                                        style={
                                            (item.category === 'ground' && nurturing.currentLand === item.id) ||
                                                (item.category === 'house' && nurturing.currentHouseId === item.id)
                                                ? { borderColor: '#FFD700', backgroundColor: '#FFF9E6' } : {}
                                        }
                                    >
                                        <span className="food-item-icon">
                                            {item.id === 'shape_ground' ? (
                                                <span className="custom-icon-shape-ground" />
                                            ) : (
                                                item.icon
                                            )}
                                        </span>
                                        <span className="food-item-name">{t(item.nameKey)}</span>
                                        <div className="food-item-effects">
                                            {nurturing.inventory.includes(item.id) || (item.category === 'house' && item.id === 'tent') ? (
                                                (item.category === 'ground' && nurturing.currentLand === item.id) ||
                                                    (item.category === 'house' && nurturing.currentHouseId === item.id) ? (
                                                    <span className="food-item-price">✅ Owned</span>
                                                ) : (
                                                    <span className="food-item-price">Owned</span>
                                                )
                                            ) : (
                                                <span className="food-item-price">💰 {item.price}</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </MenuModal >
            )}

            {/* Settings Menu */}
            <SettingsMenu
                isOpen={showSettingsMenu}
                onClose={() => setShowSettingsMenu(false)}
            />
        </>
    );
};


