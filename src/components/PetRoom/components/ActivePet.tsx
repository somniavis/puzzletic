import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PET_ITEMS, type PetSpeed } from '../../../types/shop';
import { useNurturing } from '../../../contexts/NurturingContext';
import './styles/ActivePet.css';

interface ActivePetProps {
    petId: string;
}

const MOVE_INTERVAL = 3000;
const SPEED_MULTIPLIERS: Record<PetSpeed, number> = {
    fast: 1.2,      // 1.5 * 0.8
    normal: 0.8,    // 1.0 * 0.8
    slow: 0.56,     // 0.7 * 0.8
    very_slow: 0.4, // 0.5 * 0.8 (approx)
};

export const ActivePet: React.FC<ActivePetProps> = ({ petId }) => {
    const { petCharacter, petExpiresAt } = useNurturing();
    const petData = useMemo(() => PET_ITEMS.find(p => p.id === petId), [petId]);

    // Position State (Percent)
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [isMoving, setIsMoving] = useState(false);
    const [emojiReaction, setEmojiReaction] = useState<string | null>(null);

    // Fallback for Legacy Saves (r2_pet_1 = Paw Print)
    // If user has the 'trigger' item equipped, show a stable random image using petExpiresAt as seed
    const resolvedIcon = useMemo(() => {
        if (petData?.id === 'r2_pet_1') {
            // Hardcoded fallback list (matches shop.ts hidden variants)
            const variants = [
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/Pet1.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet2.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet3.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet4.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet5.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet6.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet7.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet8.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet9.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet10.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet11.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet12.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet13.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet15.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet16.png',
                'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/pet_img/pet17.png'
            ];

            // Use petExpiresAt as seed if available.
            // petExpiresAt is undefined if no pet is active, but here we likely have one.
            // If undefined fallback to Date.now() (which shouldn't happen for valid pet)
            const seed = petExpiresAt || 12345;
            const index = Math.floor(seed % variants.length);
            return variants[index];
        }
        return petData?.icon || '';
    }, [petData, petExpiresAt]);

    const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Random Movement Logic
    const moveRandomly = useCallback(() => {
        if (!petData) return;

        const MAX_STEP = 15; // Max distance to move in one tick

        setPosition((prev) => {
            // Calculate random step
            const deltaX = (Math.random() - 0.5) * MAX_STEP * 2;
            const deltaY = (Math.random() - 0.5) * MAX_STEP * 2;

            // Apply step to previous position
            let newX = prev.x + deltaX;
            let newY = prev.y + deltaY;

            // Clamp to boundary area (Full Floor Range)
            // X: 10% (Left) to 90% (Right)
            // Y: 30% (Top of floor) to 90% (Bottom of floor)
            newX = Math.max(10, Math.min(90, newX));
            newY = Math.max(30, Math.min(90, newY));

            const direction = newX > prev.x ? 'right' : 'left';
            setDirection(direction);
            return { x: newX, y: newY };
        });
        setIsMoving(true);

        // Stop moving animation after some time
        const speed = petData?.speed || 'normal';
        // Fallback to 1 if speed key not found (though types prevent this)
        const multiplier = SPEED_MULTIPLIERS[speed] || 1;
        setTimeout(() => setIsMoving(false), 2000 / multiplier);

    }, [petData]); // Removed position.x dependency

    useEffect(() => {
        // Initial move
        moveRandomly();

        const speed = petData?.speed || 'normal';
        const intervalTime = MOVE_INTERVAL / (SPEED_MULTIPLIERS[speed] || 1) + Math.random() * 2000;

        const interval = setInterval(moveRandomly, intervalTime);
        moveTimerRef.current = interval;

        return () => clearInterval(interval);
    }, [moveRandomly, petData]);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();

        // Show Heart Emoji
        const reactions = ['❤️', '💖', '🥰', '😍'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        setEmojiReaction(randomReaction);

        // Clear emoji after 1s
        setTimeout(() => setEmojiReaction(null), 1000);

        // Add affection/happiness (small amount)
        petCharacter(1, 1);
    };

    if (!petData) return null;

    // Construct Transition Style based on speed
    const transitionDuration = isMoving ? `${2 / (SPEED_MULTIPLIERS[petData.speed] || 1)}s` : '0.5s';

    return (
        <div
            className="active-pet-container"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transition: `all ${transitionDuration} ease-in-out`,
                zIndex: Math.floor(position.y) // Simple Z-index based on Y
            }}
            onClick={handleInteraction}
            onTouchStart={handleInteraction}
        >
            <div className={`pet-sprite ${isMoving ? 'moving' : ''} ${direction}`}>
                {resolvedIcon.startsWith('http') ? (
                    <img
                        src={resolvedIcon}
                        alt="pet"
                        style={{
                            width: '3rem',
                            height: '3rem',
                            objectFit: 'contain',
                            pointerEvents: 'none' // Ensure clicks pass through to container
                        }}
                    />
                ) : (
                    <span className="pet-icon" style={{ fontSize: '2.5rem' }}>{resolvedIcon}</span>
                )}
            </div>

            {emojiReaction && (
                <div className="pet-reaction-emoji">
                    {emojiReaction}
                </div>
            )}
        </div>
    );
};
