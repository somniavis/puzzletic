import { useState } from 'react';
import { useNurturing } from '../../../contexts/NurturingContext';
import type { FoodItem } from '../../../types/food';
import type { MedicineItem } from '../../../types/medicine';
import type { CleaningTool } from '../../../types/cleaning';
import type { ShopItem } from '../../../types/shop';
import type { CharacterAction } from '../../../types/character';
import { playButtonSound, playEatingSound, playCleaningSound } from '../../../utils/sound';
import type { EmotionCategory } from '../../../types/emotion';

interface UsePetActionsProps {
    onActionChange?: (action: CharacterAction) => void;
    showBubble: (category: EmotionCategory, level: 1 | 2 | 3, duration?: number) => void;
    action: CharacterAction;
}

export const usePetActions = ({
    onActionChange,
    showBubble,
    action
}: UsePetActionsProps) => {
    const nurturing = useNurturing();

    // Animation States
    const [flyingFood, setFlyingFood] = useState<{ icon: string; key: number; type: 'food' | 'pill' | 'syringe' } | null>(null);
    const [isShowering, setIsShowering] = useState(false);
    const [isBrushing, setIsBrushing] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [activeCleaningToolId, setActiveCleaningToolId] = useState<string | null>(null);
    const [isSequenceActive, setIsSequenceActive] = useState(false);

    // Helper check
    const isActionInProgress =
        action !== 'idle' ||
        flyingFood !== null ||
        isShowering ||
        isBrushing ||
        isCleaning ||
        isSequenceActive;

    // --- Handlers ---

    const handlePoopClick = (poopId: string, happinessBonus: number = 0) => {
        playCleaningSound();
        nurturing.clickPoop(poopId, happinessBonus);
        showBubble('joy', 1);
    };

    const handleBugClick = (bugId: string) => {
        playCleaningSound();
        nurturing.clickBug(bugId);
        showBubble('joy', 1);
    };

    const handleFeed = (food: FoodItem, onCloseMenu: () => void) => {
        if (nurturing.gro < food.price) {
            showBubble('worried', 2);
            return;
        }
        nurturing.spendGro(food.price);
        playButtonSound();
        onCloseMenu();

        setIsSequenceActive(true);
        setFlyingFood({ icon: food.icon, key: Date.now(), type: 'food' });
        playEatingSound();

        setTimeout(() => {
            setFlyingFood(null);

            setTimeout(() => {
                onActionChange?.('eating');

                const result = nurturing.feed(food);

                if (result.success) {
                    setTimeout(() => {
                        showBubble('playful', 1);
                        onActionChange?.('happy');

                        if (result.sideEffects?.poopCreated) {
                            setTimeout(() => {
                                showBubble('neutral', 1);
                            }, 1500);
                        }

                        setTimeout(() => {
                            onActionChange?.('idle');
                            setIsSequenceActive(false);
                        }, 2000);
                    }, 500);
                } else {
                    setTimeout(() => {
                        onActionChange?.('idle');
                        setIsSequenceActive(false);
                    }, 1500);
                }
            }, 100);
        }, 1200);
    };

    const handleGiveMedicine = (medicine: MedicineItem, onCloseMenu: () => void) => {
        if (nurturing.gro < medicine.price) {
            showBubble('worried', 2);
            return;
        }
        nurturing.spendGro(medicine.price);
        playButtonSound();
        onCloseMenu();

        const isSyringe = medicine.id === 'syringe';
        setIsSequenceActive(true);
        setFlyingFood({
            icon: medicine.icon,
            key: Date.now(),
            type: isSyringe ? 'syringe' : 'pill'
        });

        if (isSyringe) playCleaningSound();
        else playEatingSound();

        setTimeout(() => {
            setFlyingFood(null);

            setTimeout(() => {
                onActionChange?.(isSyringe ? 'sick' : 'eating');

                const result = nurturing.giveMedicine(medicine);

                if (result.success) {
                    setTimeout(() => {
                        showBubble('sick', 1);
                        onActionChange?.('happy');

                        setTimeout(() => {
                            onActionChange?.('idle');
                            showBubble('joy', 1);
                            setIsSequenceActive(false);
                        }, 2000);
                    }, 500);
                } else {
                    setTimeout(() => {
                        onActionChange?.('idle');
                        setIsSequenceActive(false);
                    }, 1500);
                }
            }, 100);
        }, 1200);
    };

    const handleClean = (tool: CleaningTool, onCloseMenu: () => void) => {
        if (isCleaning || isShowering || isBrushing || action !== 'idle') return;

        playButtonSound();
        setActiveCleaningToolId(tool.id);

        switch (tool.id) {
            case 'broom':
                if (nurturing.poops.length > 0) {
                    setIsCleaning(true);
                    setTimeout(() => {
                        const poopToClean = nurturing.poops[0];
                        if (poopToClean) handlePoopClick(poopToClean.id, 2);
                    }, 500);
                    setTimeout(() => setIsCleaning(false), 1000);
                }
                break;
            case 'newspaper':
                if (nurturing.bugs.length > 0) {
                    setIsCleaning(true);
                    setTimeout(() => {
                        const bugToClean = nurturing.bugs[0];
                        if (bugToClean) handleBugClick(bugToClean.id);
                        else {
                            playCleaningSound();
                            nurturing.cleanBug();
                            showBubble('joy', 1);
                        }
                    }, 500);
                    setTimeout(() => setIsCleaning(false), 1000);
                }
                break;
            case 'shower':
                if (nurturing.gro >= tool.price) {
                    nurturing.spendGro(tool.price);
                    nurturing.takeShower();
                    playCleaningSound();
                    showBubble('joy', 2);
                    setIsShowering(true);
                    setTimeout(() => setIsShowering(false), 3000);
                } else {
                    showBubble('worried', 2);
                }
                break;
            case 'robot_cleaner':
                if (nurturing.gro >= tool.price) {
                    if (nurturing.poops.length > 0 || nurturing.bugs.length > 0) {
                        setIsCleaning(true);
                        setTimeout(() => playCleaningSound(), 100);
                        const result = nurturing.cleanAll(tool.price);
                        if (result.success) showBubble('joy', 3);
                        else showBubble('worried', 2);
                        setTimeout(() => setIsCleaning(false), 2000);
                    } else {
                        showBubble('neutral', 1);
                    }
                } else {
                    showBubble('worried', 2);
                }
                break;
            case 'toothbrush':
                if (nurturing.gro >= tool.price) {
                    nurturing.spendGro(tool.price);
                    nurturing.brushTeeth();
                    playCleaningSound();
                    showBubble('joy', 2);
                    setIsBrushing(true);
                    setTimeout(() => setIsBrushing(false), 3000);
                } else {
                    showBubble('worried', 2);
                }
                break;
            case 'max_stats':
                if (nurturing.gro >= tool.price) {
                    nurturing.spendGro(tool.price);
                    nurturing.maxStats();
                    playCleaningSound();
                    showBubble('joy', 3);
                } else {
                    showBubble('worried', 2);
                }
                break;
        }
        onCloseMenu();
    };

    const handleShopItemClick = (item: ShopItem) => {
        playButtonSound();
        const isOwned = nurturing.inventory.includes(item.id);

        if (isOwned) {
            if (item.category === 'ground') {
                nurturing.equipLand(item.id);
                showBubble('joy', 1);
            } else if (item.category === 'house') {
                nurturing.equipHouse(item.id);
                showBubble('joy', 1);
            }
        } else {
            if (nurturing.gro >= item.price) {
                const success = nurturing.purchaseItem(item.id, item.price);
                if (success) {
                    playCleaningSound();
                    showBubble('joy', 2);
                    if (item.category === 'ground') nurturing.equipLand(item.id);
                    else if (item.category === 'house') nurturing.equipHouse(item.id);
                }
            } else {
                showBubble('worried', 2);
            }
        }
    };

    return {
        isActionInProgress,
        states: {
            flyingFood,
            isShowering,
            isBrushing,
            isCleaning,
            activeCleaningToolId,
            isSequenceActive
        },
        handlers: {
            handleFeed,
            handleGiveMedicine,
            handleClean,
            handleShopItemClick,
            handlePoopClick,
            handleBugClick
        }
    };
};
