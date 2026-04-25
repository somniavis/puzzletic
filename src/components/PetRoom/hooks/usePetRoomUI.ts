import { useState, useEffect } from 'react';
import { useNurturing } from '../../../contexts/NurturingContext';
import type { FoodCategory } from '../../../types/food';
import type { ShopCategory } from '../../../types/shop';

export const usePetRoomUI = (showGiftBox: boolean, skipInitialLoadingDelay = false) => {
    const nurturing = useNurturing();

    // Loading State
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!nurturing.isGlobalLoading) {
            const delayMs = skipInitialLoadingDelay ? 0 : 1000;
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, delayMs);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(true);
        }
    }, [nurturing.isGlobalLoading, skipInitialLoadingDelay]);

    // Menu States
    const [showFoodMenu, setShowFoodMenu] = useState(false);
    const [showCleanMenu, setShowCleanMenu] = useState(false);
    const [showMedicineMenu, setShowMedicineMenu] = useState(false);
    const [showShopMenu, setShowShopMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showDailyRoutineModal, setShowDailyRoutineModal] = useState(false);

    // Category Selections
    const [selectedFoodCategory, setSelectedFoodCategory] = useState<FoodCategory>('fruit');
    const [selectedShopCategory, setSelectedShopCategory] = useState<ShopCategory>('ground');

    // Modal States
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [confirmModalType, setConfirmModalType] = useState<'sleep' | 'wake' | null>(null);

    // Auto-show nickname modal logic
    useEffect(() => {
        if (!showGiftBox && !nurturing.characterName && !showNicknameModal) {
            const timer = setTimeout(() => {
                setIsLoading(false);
                setShowNicknameModal(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showGiftBox, nurturing.characterName, showNicknameModal]);

    return {
        isLoading,
        menus: {
            showFoodMenu, setShowFoodMenu,
            showCleanMenu, setShowCleanMenu,
            showMedicineMenu, setShowMedicineMenu,
            showShopMenu, setShowShopMenu,
            showSettingsMenu, setShowSettingsMenu,
            showDailyRoutineModal, setShowDailyRoutineModal,
        },
        selections: {
            selectedFoodCategory, setSelectedFoodCategory,
            selectedShopCategory, setSelectedShopCategory,
        },
        modals: {
            showNicknameModal, setShowNicknameModal,
            confirmModalType, setConfirmModalType
        }
    };
};
