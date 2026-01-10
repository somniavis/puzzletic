import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

type GameEngineInterface = ReturnType<typeof useGameEngine>;

// --- Definitions ---
export type FoodType = 'meat' | 'banana' | 'honey' | 'bamboo' | 'carrot' | 'cheese' | 'bone' | 'fish' | 'vegetable';
export type SpeciesType = 'lion' | 'monkey' | 'bear' | 'panda' | 'rabbit' | 'mouse' | 'dog' | 'cat' | 'cow';

interface SpeciesDef {
    id: SpeciesType;
    icon: string;
    food: FoodType;
    color: string;
}

const SPECIES_DATA: Record<SpeciesType, SpeciesDef> = {
    lion: { id: 'lion', icon: '🦁', food: 'meat', color: '#FCA5A5' },
    monkey: { id: 'monkey', icon: '🐵', food: 'banana', color: '#FDE047' },
    bear: { id: 'bear', icon: '🐻', food: 'honey', color: '#B45309' },
    panda: { id: 'panda', icon: '🐼', food: 'bamboo', color: '#F0FDF4' },
    rabbit: { id: 'rabbit', icon: '🐰', food: 'carrot', color: '#FDBA74' },
    mouse: { id: 'mouse', icon: '🐭', food: 'cheese', color: '#E5E7EB' },
    dog: { id: 'dog', icon: '🐶', food: 'bone', color: '#D4D4D8' },
    cat: { id: 'cat', icon: '🐱', food: 'fish', color: '#93C5FD' },
    cow: { id: 'cow', icon: '🐮', food: 'vegetable', color: '#A7F3D0' },
};

interface AnimalEntity {
    id: string;
    species: SpeciesType;
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
    vx: number; // Velocity X
    vy: number; // Velocity Y
    isFed: boolean;
    state: 'idle' | 'eating' | 'full' | 'angry'; // Visual state
    feedbackText?: string; // "Yum!", "Full!", etc.
}

// Physics Config
const ANIMAL_SIZE_PCT = 15; // Rough size in % for collision
const BASE_SPEED = 0.2; // Speed multiplier

export const useAnimalBanquetLogic = (engine: GameEngineInterface) => {
    // Game State
    const [animals, setAnimals] = useState<AnimalEntity[]>([]);
    const [selectedFood, setSelectedFood] = useState<FoodType>('meat');
    const [levelIndex, setLevelIndex] = useState(0);
    const [visibleFoods, setVisibleFoods] = useState<FoodType[]>([]);

    // Refs for Physics Loop to avoid closure staleness
    const animalsRef = useRef<AnimalEntity[]>([]);
    const reqIdRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // --- Reset Logic ---
    const prevGameState = useRef(engine.gameState);
    useEffect(() => {
        if (prevGameState.current === 'gameover' && engine.gameState === 'playing') {
            // Restart detected
            setLevelIndex(0);
        } else if (engine.gameState === 'idle') {
            // Idle reset
            setLevelIndex(0);
        }
        prevGameState.current = engine.gameState;
    }, [engine.gameState]);

    // --- Level Generation ---
    useEffect(() => {
        // Difficulty Logic (Adaptive)
        // Level 1-2 (Index 0-1): 2-3 Animals, 2 Sp, 2-3 Foods
        // Level 3-5 (Index 2-4): 4-6 Animals, 2-3 Sp, 3-4 Foods
        // Level 6+  (Index 5+):  6-8 Animals, 3-4 Sp, 4 Foods

        let minAnimals = 2, maxAnimals = 3;
        let minSpecies = 2, maxSpecies = 2;
        let minFoods = 2, maxFoods = 3;

        if (levelIndex >= 2) { // Level 3+
            minAnimals = 4; maxAnimals = 6;
            minSpecies = 2; maxSpecies = 3;
            minFoods = 3; maxFoods = 4;
        }
        if (levelIndex >= 5) { // Level 6+
            minAnimals = 6; maxAnimals = 8;
            minSpecies = 3; maxSpecies = 4;
            minFoods = 4; maxFoods = 4;
        }

        // 1. Determine exact counts
        const animalCount = Math.floor(Math.random() * (maxAnimals - minAnimals + 1)) + minAnimals;
        const speciesCount = Math.floor(Math.random() * (maxSpecies - minSpecies + 1)) + minSpecies;

        // Ensure food count is at least species count
        const rawFoodCount = Math.floor(Math.random() * (maxFoods - minFoods + 1)) + minFoods;
        const foodOptionCount = Math.max(rawFoodCount, speciesCount);

        // 2. Select Active Species (Targets)
        const allTypes = Object.keys(SPECIES_DATA) as SpeciesType[];
        const shuffledTypes = [...allTypes].sort(() => Math.random() - 0.5);
        const roundSpecies = shuffledTypes.slice(0, speciesCount);

        // 3. Select Food Options (Targets + Distractors)
        const remainingTypes = shuffledTypes.slice(speciesCount);
        const distractorCount = Math.max(0, foodOptionCount - speciesCount);
        const distractorSpecies = remainingTypes.slice(0, distractorCount);

        const foodSpecies = [...roundSpecies, ...distractorSpecies];
        // Shuffle the buttons so answers aren't always first
        const shuffledFoodSpecies = foodSpecies.sort(() => Math.random() - 0.5);
        const visibleFoodList = shuffledFoodSpecies.map(s => SPECIES_DATA[s].food);


        // 4. Generate Animals
        const newAnimals: AnimalEntity[] = [];
        for (let i = 0; i < animalCount; i++) {
            const species = roundSpecies[Math.floor(Math.random() * roundSpecies.length)];

            // Random Pos & Velocity
            const x = 15 + Math.random() * 70;
            const y = 15 + Math.random() * 70;
            const angle = Math.random() * Math.PI * 2;
            const speed = BASE_SPEED * (1 + (levelIndex * 0.08)); // Slightly faster scaling

            newAnimals.push({
                id: `animal-${i}-${Date.now()}`,
                species,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                isFed: false,
                state: 'idle'
            });
        }

        // 5. Update State
        setVisibleFoods(visibleFoodList);
        setSelectedFood(visibleFoodList[0]);
        setAnimals(newAnimals);
        animalsRef.current = newAnimals;

    }, [levelIndex]);

    // --- Physics System ---
    const updatePhysics = useCallback((time: number) => {
        // Initialize time on first run
        if (!lastTimeRef.current) lastTimeRef.current = time;

        // Calculate Delta Time
        const dt = time - lastTimeRef.current;
        lastTimeRef.current = time; // Update for next frame

        if (engine.gameState !== 'playing' && engine.gameState !== 'gameover') {
            if (engine.isTimeFrozen) {
                reqIdRef.current = requestAnimationFrame(updatePhysics);
                return; // Skip update
            }
        }

        // Cap dt to prevent huge jumps (e.g., if tab was inactive, capping at 100ms prevents warping)
        const safeDt = Math.min(dt, 100);
        // Normalization factor: target 60FPS (16.67ms)
        // If 144Hz (6.9ms), factor is 0.4. If 30Hz (33ms), factor is 2.0.
        const speedFactor = safeDt / 16.67;

        if (engine.gameState !== 'playing') {
            // Stop loop if not playing
        } else if (!engine.isTimeFrozen) {
            const currentAnimals = animalsRef.current;
            const nextAnimals = currentAnimals.map(anim => {
                let { x, y, vx, vy } = anim;

                // Move with Delta Time Scaling
                x += vx * speedFactor;
                y += vy * speedFactor;

                // Bounce Logic (Simple Box)
                const r = ANIMAL_SIZE_PCT / 2;

                if (x < r) { x = r; vx = Math.abs(vx); }
                if (x > 100 - r) { x = 100 - r; vx = -Math.abs(vx); }
                if (y < r) { y = r; vy = Math.abs(vy); }
                if (y > 100 - r) { y = 100 - r; vy = -Math.abs(vy); }

                return { ...anim, x, y, vx, vy };
            });

            animalsRef.current = nextAnimals;
            setAnimals(nextAnimals);
        }

        reqIdRef.current = requestAnimationFrame(updatePhysics);
    }, [engine.gameState, engine.isTimeFrozen]);

    useEffect(() => {
        reqIdRef.current = requestAnimationFrame(updatePhysics);
        return () => {
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
        };
    }, [updatePhysics]);


    // --- Interaction ---

    // Helper to update ref and state safely - defined before usage to satisfy linters
    const updateAnimal = (id: string, patch: Partial<AnimalEntity>) => {
        const next = animalsRef.current.map(a => a.id === id ? { ...a, ...patch } : a);
        animalsRef.current = next;
        setAnimals(next);
    };

    const triggerFeedback = (id: string, state: AnimalEntity['state'], text: string) => {
        updateAnimal(id, { state, feedbackText: text });

        // Reset visual state after 1s
        setTimeout(() => {
            updateAnimal(id, { state: 'idle', feedbackText: undefined });
        }, 1000);
    };

    const handleAnimalClick = (animalId: string) => {
        const animal = animalsRef.current.find(a => a.id === animalId);
        if (!animal) return;

        // Ignore clicks if already animating feedback (to prevent spam)
        if (animal.state !== 'idle' && animal.state !== 'eating') return;

        const speciesInfo = SPECIES_DATA[animal.species];

        // 1. Correct Food Logic
        if (selectedFood === speciesInfo.food) {

            // TRAP: Already Fed?
            if (animal.isFed) {
                // FAIL: Fed twice
                engine.submitAnswer(false); // Combo Reset, Life Lost
                engine.registerEvent({ type: 'wrong' }); // Shake/Sound
                triggerFeedback(animalId, 'full', 'I\'m Full! 🤢');
            } else {
                // SUCCESS: Fed correctly

                // Check if this is the LAST animal to be fed
                const isRoundClear = animalsRef.current.every(a => a.id === animalId || a.isFed);

                // Mark as Fed locally first for UI feedback
                updateAnimal(animalId, { isFed: true });
                triggerFeedback(animalId, 'eating', 'Yum! 😋');

                if (isRoundClear) {
                    // ROUND CLEAR!
                    // 1. Submit Answer with full feedback (Combo++ here due to round clear)
                    engine.submitAnswer(true);

                    // 2. Register Final Event (Big Celebration)
                    engine.registerEvent({ type: 'correct', isFinal: true });

                    // 3. PowerUp Reward Logic (Combo % 3)
                    const nextCombo = engine.combo + 1;
                    if (nextCombo > 0 && nextCombo % 3 === 0) {
                        // 55% Chance
                        if (Math.random() < 0.55) {
                            const types = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                            const reward = types[Math.floor(Math.random() * types.length)];
                            engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                        }
                    }

                    // 4. Level Progression
                    setTimeout(() => {
                        setLevelIndex(prev => prev + 1);
                    }, 1500);

                } else {
                    // INTERMEDIATE FEED
                    // Score only. No Combo, No Difficulty Step, No Interruption.
                    engine.submitAnswer(true, { skipFeedback: true, skipCombo: true, skipDifficulty: true });
                }
            }
        }
        // 2. Wrong Food Logic
        else {
            // FAIL: Wrong Item
            // Wrong answer always resets combo (handled by engine)
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });
            triggerFeedback(animalId, 'angry', 'No! 😡');
        }
    };

    return {
        animals,
        selectedFood,
        setSelectedFood,
        handleAnimalClick,
        SPECIES_DATA,
        visibleFoods
    };
};
