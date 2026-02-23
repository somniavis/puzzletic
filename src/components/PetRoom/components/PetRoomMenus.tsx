import React, { type Dispatch, type SetStateAction, useMemo, useEffect } from 'react';
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
    const { currentPetId } = nurturing;
    const { t } = useTranslation();

    // Auto-scroll to active pet when it changes (e.g., after purchase)
    useEffect(() => {
        if (currentPetId) {
            // Small timeout to ensure DOM is updated
            const timer = setTimeout(() => {
                const activeItem = document.querySelector('.food-items-grid .active-item');
                if (activeItem) {
                    activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentPetId]);

    return (
        <div className="pet-shop-container">
            {/* Top: Gacha Button */}
            <div className="pet-gacha-section">

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
            {/* Bottom: Showcase */}
            <div className="food-items-grid" style={{ padding: '0 4px 20px 4px', maxHeight: 'none', marginTop: 0 }}>
                {PET_ITEMS.filter(pet => !pet.isHidden).map((pet) => {
                    const isCurrent = currentPetId === pet.id || (currentPetId && currentPetId.startsWith('special_pet_')); // Keep highlighted if special variant is active? 
                    // check logic: if we want to highlight the 'special pet' button when a variant is active.
                    // But wait, the button for special pet has id 'r2_pet_1'.
                    // If currentPetId is 'special_pet_3', 'r2_pet_1' button should probably be highlighted.

                    const effectiveIsCurrent = currentPetId === pet.id || (pet.id === 'r2_pet_1' && currentPetId?.startsWith('special_pet_'));

                    return (
                        <button
                            key={pet.id}
                            className={`food-item ${effectiveIsCurrent ? 'active-item' : ''}`}
                            onClick={() => { /* No click action for now as it is gacha */ }}
                            style={effectiveIsCurrent ? { borderColor: '#FFD700', backgroundColor: '#FFF9E6', cursor: 'default' } : { cursor: 'default' }}
                        >
                            <span className="food-item-icon" style={{ fontSize: '2.5rem' }}>{pet.icon}</span>
                                <span className="food-item-name">{t(pet.nameKey)}</span>
                                <div className="food-item-effects">
                                    {isCurrent && (
                                        <span className="food-item-price">✅ {t('shop.status.active')}</span>
                                    )}
                                </div>
                            </button>
                    );
                })}
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

    const filteredFoods = useMemo(() => FOOD_ITEMS.filter(food => food.category === selectedFoodCategory), [selectedFoodCategory]);
    const filteredShopItems = useMemo(() => SHOP_ITEMS.filter(item => item.category === selectedShopCategory), [selectedShopCategory]);

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
                                {tool.price > 0 ? `💰 ${tool.price}` : t('shop.status.free')}
                            </div>
                        </button>
                    ))}
                </MenuModal>
            )}

            {/* Shop Menu Submenu */}
            {showShopMenu && (
                <MenuModal
                    title={t('shop.menu.title')}
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
                                    <span className="category-icon">{SHOP_CATEGORIES[category].icon}</span>
                                    <span className="category-name">{t(SHOP_CATEGORIES[category].nameKey)}</span>
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
                                        // Success alert removed as per request
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
                                            {item.icon}
                                        </span>
                                        <span className="food-item-name">{t(item.nameKey)}</span>
                                        <div className="food-item-effects">
                                            {nurturing.inventory.includes(item.id) || (item.category === 'house' && item.id === 'tent') ? (
                                                (item.category === 'ground' && nurturing.currentLand === item.id) ||
                                                    (item.category === 'house' && nurturing.currentHouseId === item.id) ? (
                                                    <span className="food-item-price">✅ {t('shop.status.owned')}</span>
                                                ) : (
                                                    <span className="food-item-price">{t('shop.status.owned')}</span>
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
