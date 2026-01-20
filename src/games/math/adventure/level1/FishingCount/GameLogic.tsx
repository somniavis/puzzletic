import { useState, useEffect, useCallback, useRef } from 'react';
import { playButtonSound } from '../../../../../utils/sound';

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

export const useFishingCountLogic = () => {
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

    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', isFinal?: boolean, id: number } | null>(null);
    const [roundStartTime, setRoundStartTime] = useState<number>(0);

    // Bounds for the pond (will be updated via resize observer or ref, but for now fixed simple percentage logic)
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    const generateRound = useCallback(() => {
        // Random target 1-5
        const count = Math.floor(Math.random() * 5) + 1;
        setTargetCount(count);
        setCaughtCount(0);
        setRoundStartTime(Date.now());

        // Random animal
        const target = SEA_ANIMALS[Math.floor(Math.random() * SEA_ANIMALS.length)];
        setTargetAnimal(target);

        // Generate animals (Targets + Distractors)
        const newAnimals: Animal[] = [];
        const totalAnimals = 8 + Math.floor(Math.random() * 5); // 8 to 12 total animals

        // Add targets
        for (let i = 0; i < count; i++) {
            newAnimals.push(createAnimal(target));
        }

        // Add distractors
        let remaining = totalAnimals - count;
        while (remaining > 0) {
            const distractor = SEA_ANIMALS[Math.floor(Math.random() * SEA_ANIMALS.length)];
            if (distractor !== target) {
                newAnimals.push(createAnimal(distractor));
                remaining--;
            }
        }

        setAnimals(newAnimals);
    }, []);

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
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }, []);

    const lastTimeRef = useRef<number>(0);

    // Game Loop for Movement
    const updatePositions = useCallback((timestamp: number) => {
        if (!gameState.isPlaying) return;

        if (lastTimeRef.current === 0) {
            lastTimeRef.current = timestamp;
        }

        const deltaTime = timestamp - lastTimeRef.current;
        const timeScale = deltaTime / 16.67; // Normalize to 60FPS (16.67ms per frame)

        // Cap max timescale to prevent huge jumps if tab was inactive
        const cappedTimeScale = Math.min(timeScale, 3.0);

        setAnimals(prevAnimals => {
            return prevAnimals.map(animal => {
                let newX = animal.x + (animal.vx * cappedTimeScale);
                let newY = animal.y + (animal.vy * cappedTimeScale);

                // Bounce off walls (0-100%)
                if (newX <= 0 || newX >= 90) { // Assuming 10% width item roughly
                    animal.vx *= -1;
                    newX = Math.max(0, Math.min(newX, 90));
                }
                if (newY <= 0 || newY >= 75) { // Avoid net area at very bottom
                    animal.vy *= -1;
                    newY = Math.max(0, Math.min(newY, 75));
                }

                return { ...animal, x: newX, y: newY };
            });
        });

        lastTimeRef.current = timestamp;
        requestRef.current = requestAnimationFrame(updatePositions);
    }, [gameState.isPlaying]);

    useEffect(() => {
        if (gameState.isPlaying) {
            lastTimeRef.current = 0; // Reset time tracking on start/resume
            requestRef.current = requestAnimationFrame(updatePositions);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState.isPlaying, updatePositions]);

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

            // Trigger Layout0 feedback
            const newCaught = caughtCount + 1;
            setCaughtCount(newCaught);

            const isRoundComplete = newCaught >= targetCount;
            // isFinal: true if round complete, false if intermediate
            setLastEvent({ type: 'correct', isFinal: isRoundComplete, id: Date.now() });

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
            setLastEvent({ type: 'wrong', id: Date.now() });

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
