import { useState, useEffect, useCallback, useRef } from 'react';
import { playButtonSound } from '../../../../utils/sound';

export interface Animal {
    id: number;
    type: string; // Emoji
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export interface GameState {
    score: number;
    timeLeft: number;
    lives: number;
    streak: number;
    bestStreak: number;
    isGameOver: boolean;
    isPlaying: boolean;
    gameOverReason?: 'time' | 'lives';
}

const SEA_ANIMALS = ['🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🪼', '🦀', '🦞', '🦐', '🦑'];

export const useFishingCountLogic = () => {
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        timeLeft: 60,
        lives: 3,
        streak: 0,
        bestStreak: 0,
        isGameOver: false,
        isPlaying: false,
    });

    const [targetAnimal, setTargetAnimal] = useState<string>('');
    const [targetCount, setTargetCount] = useState<number>(1);
    const [caughtCount, setCaughtCount] = useState<number>(0);
    const [animals, setAnimals] = useState<Animal[]>([]);

    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', id: number } | null>(null);

    // Bounds for the pond (will be updated via resize observer or ref, but for now fixed simple percentage logic)
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    const generateRound = useCallback(() => {
        // Random target 1-5
        const count = Math.floor(Math.random() * 5) + 1;
        setTargetCount(count);
        setCaughtCount(0);

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
            vy: (Math.random() - 0.5) * 0.3
        };
    };

    const startGame = useCallback(() => {
        setGameState({
            score: 0,
            timeLeft: 60,
            lives: 3,
            streak: 0,
            bestStreak: 0,
            isGameOver: false,
            isPlaying: true
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
            // Sound is handled by Layout1 (playClearSound -> cleaning sound) via lastEvent
            // playPlopSound(); // Removed as per user request to use only cleaning sound: Use cleaning sound only

            // Trigger Layout1 feedback
            setLastEvent({ type: 'correct', id: Date.now() });

            const newCaught = caughtCount + 1;
            setCaughtCount(newCaught);

            // Remove animal
            setAnimals(prev => prev.filter(a => a.id !== animalId));

            if (newCaught >= targetCount) {
                // Round Win - Update Score & Streak HERE
                playButtonSound();
                setGameState(prev => {
                    const newStreak = prev.streak + 1;
                    // Score calculation: Base round points + Streak bonus
                    // ex: 100 points per fish in target + 50 * streak
                    const gainedScore = (100 * targetCount) + (50 * newStreak);

                    return {
                        ...prev,
                        streak: newStreak,
                        bestStreak: Math.max(prev.bestStreak, newStreak),
                        score: prev.score + gainedScore,
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
                    streak: 0, // Reset streak
                    isGameOver: isOver,
                    isPlaying: !isOver,
                    gameOverReason: isOver ? 'lives' : undefined
                };
            });
        }
    }, [animals, targetAnimal, caughtCount, targetCount, generateRound, setLastEvent, gameState.isPlaying]);

    return {
        gameState,
        targetAnimal,
        targetCount,
        caughtCount,
        animals,
        containerRef,
        startGame,
        stopGame,
        handleCatch,
        lastEvent
    };
};
