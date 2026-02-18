import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { playButtonSound, playClearSound, playEatingSound, playJelloClickSound } from '../../../../../utils/sound';

export interface Animal {
    id: number;
    type: string; // Emoji
    x: number;
    y: number;
    vx: number;
    vy: number;
    faceLeft: boolean;
}

export interface GameState {
    score: number;
    timeLeft: number;
    lives: number;
    combo: number;
    bestCombo: number;
    isGameOver: boolean;
    isPlaying: boolean;
    gameOverReason?: 'time' | 'lives';
    stats: {
        correct: number;
        wrong: number;
    };
}

const SEA_ANIMALS = ['🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🪼', '🦀', '🦞', '🦐', '🦑'];

const getSeaAnimalPool = () => {
    if (typeof navigator === 'undefined') return SEA_ANIMALS;

    const ua = navigator.userAgent || '';
    const isIOSDevice = /iP(hone|od|ad)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOSDevice) return SEA_ANIMALS;

    // iPhone 7 and other old iOS Safari versions may not render some recent emoji.
    const iosVersionMatch = ua.match(/OS (\d+)_/);
    const iosMajorVersion = iosVersionMatch ? parseInt(iosVersionMatch[1], 10) : null;
    const isLegacyIOS = iosMajorVersion !== null && iosMajorVersion <= 15;
    if (!isLegacyIOS) return SEA_ANIMALS;

    return SEA_ANIMALS.map((emoji) => {
        if (emoji === '🦭') return '🐬';
        if (emoji === '🪼') return '🐢';
        return emoji;
    });
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getMinDistractorsByTarget = (targetCount: number) => {
    if (targetCount <= 3) return 2;
    if (targetCount <= 6) return 3;
    return 4;
};

export const useFishingCountLogic = () => {
    const seaAnimals = useMemo(() => getSeaAnimalPool(), []);

    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        timeLeft: 60,
        lives: 3,
        combo: 0,
        bestCombo: 0,
        isGameOver: false,
        isPlaying: false,
        stats: { correct: 0, wrong: 0 }
    });

    const [targetAnimal, setTargetAnimal] = useState<string>('');
    const [targetCount, setTargetCount] = useState<number>(1);
    const [caughtCount, setCaughtCount] = useState<number>(0);
    const [animals, setAnimals] = useState<Animal[]>([]);

    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', isFinal?: boolean, id: number; sfx?: 'auto' | 'none' } | null>(null);
    const [roundStartTime, setRoundStartTime] = useState<number>(0);

    // Bounds for the pond (will be updated via resize observer or ref, but for now fixed simple percentage logic)
    const containerRef = useRef<HTMLDivElement>(null);

    const generateRound = useCallback(() => {
        // Random target 1-10
        const count = Math.floor(Math.random() * 10) + 1;
        setTargetCount(count);
        setCaughtCount(0);
        setRoundStartTime(Date.now());

        // Random animal
        const target = seaAnimals[Math.floor(Math.random() * seaAnimals.length)];
        setTargetAnimal(target);

        // Generate animals (Targets + Distractors)
        const newAnimals: Animal[] = [];

        // Keep per-round total stable and avoid too-few distractors on high target counts.
        const maxDistractors = Math.min(7, 15 - count);
        const requestedMinDistractors = getMinDistractorsByTarget(count);
        const minDistractors = Math.min(requestedMinDistractors, maxDistractors);
        const distractorCount = randInt(minDistractors, maxDistractors);

        // Add targets
        for (let i = 0; i < count; i++) {
            newAnimals.push(createAnimal(target));
        }

        // Add distractors with diversity (at least 2~3 types when possible)
        const distractorPool = seaAnimals.filter(a => a !== target);
        const desiredTypeCount = distractorCount >= 5 ? 3 : 2;
        const actualTypeCount = Math.min(desiredTypeCount, distractorPool.length, distractorCount);
        const selectedTypes = distractorPool
            .sort(() => Math.random() - 0.5)
            .slice(0, actualTypeCount);

        for (let i = 0; i < distractorCount; i++) {
            const distractor = selectedTypes[i % selectedTypes.length];
            newAnimals.push(createAnimal(distractor));
        }

        setAnimals(newAnimals);
    }, [seaAnimals]);

    const createAnimal = (type: string): Animal => {
        return {
            id: Math.random(),
            type,
            x: Math.random() * 80 + 10, // 10% to 90%
            y: Math.random() * 60 + 5, // 5% to 65% (avoid hitting net at bottom initially)
            vx: (Math.random() - 0.5) * 0.3, // Velocity
            vy: (Math.random() - 0.5) * 0.3,
            faceLeft: Math.random() < 0.5 // 50% chance to face left (default) or right (flipped)
        };
    };

    const startGame = useCallback(() => {
        setGameState({
            score: 0,
            timeLeft: 60,
            lives: 3,
            combo: 0,
            bestCombo: 0,
            isGameOver: false,
            isPlaying: true,
            stats: { correct: 0, wrong: 0 }
        });
        generateRound();
    }, [generateRound]);

    const stopGame = useCallback(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    // Timer
    useEffect(() => {
        let interval: any;
        if (gameState.isPlaying && gameState.timeLeft > 0) {
            interval = setInterval(() => {
                setGameState(prev => {
                    const newTime = prev.timeLeft - 1;
                    if (newTime <= 0) {
                        return { ...prev, timeLeft: 0, isGameOver: true, isPlaying: false, gameOverReason: 'time' };
                    }
                    return { ...prev, timeLeft: newTime };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState.isPlaying, gameState.timeLeft]);


    const handleCatch = useCallback((animalId: number) => {
        /* Prevent interactions if game is over or paused */
        if (!gameState.isPlaying) return;

        const animal = animals.find(a => a.id === animalId);
        if (!animal) return;

        // ...
        // Correct Catch
        if (animal.type === targetAnimal) {
            // Sound is handled by Layout0 (playClearSound -> cleaning sound) via lastEvent
            // playPlopSound(); // Removed as per user request to use only cleaning sound: Use cleaning sound only

            const newCaught = caughtCount + 1;
            setCaughtCount(newCaught);

            const isRoundComplete = newCaught >= targetCount;
            // Play SFX immediately in interaction flow (iOS Safari gesture-safe)
            if (isRoundComplete) {
                playClearSound();
            } else {
                playEatingSound();
            }

            // Trigger layout visual feedback (skip shared SFX to avoid duplicate playback)
            // isFinal: true if round complete, false if intermediate
            setLastEvent({ type: 'correct', isFinal: isRoundComplete, id: Date.now(), sfx: 'none' });

            // Remove animal
            setAnimals(prev => prev.filter(a => a.id !== animalId));

            // Update Correct Stats immediately
            setGameState(prev => ({
                ...prev,
                stats: { ...prev.stats, correct: prev.stats.correct + 1 }
            }));

            if (isRoundComplete) {
                // Round Win - Update Score & Combo HERE
                playButtonSound();
                setGameState(prev => {
                    const newCombo = prev.combo + 1;

                    // Standardized Score Logic
                    // ... score calc ...
                    const baseScore = 50 * targetCount;
                    const responseTime = Date.now() - roundStartTime;
                    const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
                    const comboBonus = newCombo * 10;
                    const gainedScore = baseScore + timeBonus + comboBonus;

                    return {
                        ...prev,
                        combo: newCombo,
                        bestCombo: Math.max(prev.bestCombo, newCombo),
                        score: prev.score + gainedScore,
                        // stats updated separately above to ensure it counts per item
                    };
                });
                setTimeout(generateRound, 500);
            }
        } else {
            // Wrong Catch
            // Play wrong SFX immediately in interaction flow (iOS Safari gesture-safe)
            playJelloClickSound(0.8);
            setLastEvent({ type: 'wrong', id: Date.now(), sfx: 'none' });

            setGameState(prev => {
                const newLives = prev.lives - 1;
                const isOver = newLives <= 0;
                return {
                    ...prev,
                    lives: Math.max(0, newLives),
                    combo: 0, // Reset combo
                    isGameOver: isOver,
                    isPlaying: !isOver,
                    gameOverReason: isOver ? 'lives' : undefined,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
        }
    }, [animals, targetAnimal, caughtCount, targetCount, generateRound, setLastEvent, gameState.isPlaying, roundStartTime]);

    return {
        ...gameState, // Expose score, lives, timeLeft, combo, bestCombo, gameOverReason, stats
        targetAnimal,
        targetCount,
        caughtCount,
        animals,
        containerRef,
        startGame,
        stopGame,
        handleCatch,
        lastEvent,
        difficultyLevel: 1 // FishingCount currently fixed diff or needs to use it from state if added
    };
};
