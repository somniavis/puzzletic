import { useState, useRef, useEffect } from 'react';
import { playClearSound, playEatingSound, playJelloClickSound } from '../../../../utils/sound';

interface GameEvent {
    id: number;
    type: 'correct' | 'wrong' | 'timeout' | string;
    isFinal?: boolean;
}

export const useGameEffects = (lastEvent: GameEvent | null | undefined) => {
    const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number; }[]>([]);
    const [showShake, setShowShake] = useState(false);
    const [showSuccessFlash, setShowSuccessFlash] = useState(false);

    // We need to track processed event IDs to avoid duplicate effects
    const processedEventIds = useRef<Set<number>>(new Set());

    const generateParticles = (type: 'correct' | 'wrong', count = 10, emojiOverride?: string) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Math.random(),
                emoji: emojiOverride || (type === 'correct' ? ['🎉', '✨', '❤️', '💯', '🌟'][Math.floor(Math.random() * 5)] : '❌'),
                x: Math.random() * 100,
                y: Math.random() * 100
            });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    useEffect(() => {
        if (lastEvent) {
            if (processedEventIds.current.has(lastEvent.id)) return;
            processedEventIds.current.add(lastEvent.id);

            if (lastEvent.type === 'correct') {
                const isFinal = lastEvent.isFinal !== false;
                if (isFinal) {
                    playClearSound();
                    generateParticles('correct', 20);
                    setShowSuccessFlash(true);
                    setTimeout(() => setShowSuccessFlash(false), 500);
                } else {
                    playEatingSound();
                    generateParticles('correct', 5, '✨');
                }
            } else if (lastEvent.type === 'wrong') {
                playJelloClickSound();
                setShowShake(true);
                setTimeout(() => setShowShake(false), 500);
            }
        }
    }, [lastEvent]);

    return {
        particles,
        showShake,
        showSuccessFlash
    };
};
