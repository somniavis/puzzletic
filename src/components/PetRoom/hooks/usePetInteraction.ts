import { useState, useRef, useEffect, useMemo } from 'react';
import { useNurturing } from '../../../contexts/NurturingContext';
import type { CharacterAction } from '../../../types/character';
import { CHARACTER_SPECIES, type CharacterSpeciesId } from '../../../data/species';
import { calculateClickResponse, getClickEmotionCategory } from '../../../constants/personality';
import { playJelloClickSound } from '../../../utils/sound';
import type { EmotionCategory } from '../../../types/emotion';
import { useEmotionBubbles } from '../../../hooks/useEmotionBubbles';

interface UsePetInteractionProps {
    speciesId: CharacterSpeciesId;

    onActionChange?: (action: CharacterAction) => void;
    action: CharacterAction;
    showGiftBox: boolean;
    isShowering: boolean;
    showBubble: (category: EmotionCategory, level: 1 | 2 | 3, duration?: number) => void;
    bubble: { category: EmotionCategory; level: 1 | 2 | 3; key: number } | null;
}

export const usePetInteraction = ({
    speciesId,


    onActionChange,
    action,
    showGiftBox,
    isShowering,
    showBubble,
    bubble
}: UsePetInteractionProps) => {
    const nurturing = useNurturing();

    // Movement State
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isMoving, setIsMoving] = useState(false);
    const interactionLockRef = useRef(false);

    // Emotion Bubbles Logic (using existing hook)
    useEmotionBubbles({
        stats: nurturing.stats,
        condition: nurturing.condition,
        poops: nurturing.poops,
        showBubble,
        bubble
    });

    // Random Movement Logic
    useEffect(() => {
        if (showGiftBox) return;

        const moveRandomly = () => {
            if (isMoving || action !== 'idle' || isShowering) return;

            if (Math.random() > 0.3) return; // 30% chance

            const newX = 6 + Math.random() * 88;
            const newY = 6 + Math.random() * 69;

            setIsMoving(true);
            setPosition({ x: newX, y: newY });

            setTimeout(() => {
                setIsMoving(false);
            }, 1000);
        };

        const interval = setInterval(moveRandomly, 3000);
        return () => clearInterval(interval);
    }, [isMoving, action, isShowering, showGiftBox]);

    // Click Handlers
    const handleCharacterClick = () => {
        playJelloClickSound();

        const species = CHARACTER_SPECIES[speciesId];
        const personality = species.personality;
        const { happiness, health, fullness } = nurturing.stats;

        const happinessChange = calculateClickResponse(personality, happiness, health, fullness);
        const { category, level } = getClickEmotionCategory(happinessChange);

        showBubble(category, level, 1800);

        // Update Global Context Logic (Fix for UI sync)
        nurturing.petCharacter(happinessChange, 1);



        if (action === 'idle' && onActionChange) {
            onActionChange('eating'); // Pulse animation reuse
            setTimeout(() => onActionChange('idle'), 1800);
        }
    };

    // Bubbles for showering
    const bubbles = useMemo(() => {
        if (!isShowering) return [];
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: 10 + Math.random() * 20,
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 2,
        }));
    }, [isShowering]);

    return {
        position,
        isMoving,
        interactionLockRef,
        handleCharacterClick,
        bubbles
    };
};
