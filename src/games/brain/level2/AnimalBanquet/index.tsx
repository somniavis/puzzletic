import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useAnimalBanquetLogic, type FoodType } from './GameLogic';
import styles from './AnimalBanquet.module.css';
import { BlobBackground } from '../../../math/components/BlobBackground';

// Type Definitions
interface FoodItem {
    id: FoodType;
    icon: string;
    label: string;
}

const FOOD_ITEMS: FoodItem[] = [
    { id: 'meat', icon: '🍖', label: 'Meat' },
    { id: 'banana', icon: '🍌', label: 'Banana' },
    { id: 'honey', icon: '🍯', label: 'Honey' },
    { id: 'bamboo', icon: '🎋', label: 'Bamboo' },
    { id: 'carrot', icon: '🥕', label: 'Carrot' },
    { id: 'cheese', icon: '🧀', label: 'Cheese' },
    { id: 'bone', icon: '🦴', label: 'Bone' },
    { id: 'fish', icon: '🐟', label: 'Fish' },
    { id: 'vegetable', icon: '🥬', label: 'Veg' },
];

const GAME_ID = 'brain-level2-animal-banquet';

interface AnimalBanquetProps {
    onExit?: () => void;
}


export default function AnimalBanquet({ onExit }: AnimalBanquetProps) {
    const navigate = useNavigate();
    const handleExit = onExit || (() => navigate(-1));

    // Standard Game Engine
    const engine = useGameEngine({
        initialTime: 90, // 90s standard round time
    });

    // Core Logic
    const {
        animals,
        selectedFood,
        setSelectedFood,
        handleAnimalClick,
        SPECIES_DATA,
        visibleFoods
    } = useAnimalBanquetLogic(engine);

    // Standard PowerUps
    const powerUps = useMemo(() => [
        {
            count: engine.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => engine.activatePowerUp('timeFreeze'),
            status: (engine.isTimeFrozen ? 'active' : 'normal') as 'active' | 'normal',
            title: 'Time Freeze',
            disabledConfig: engine.isTimeFrozen || engine.powerUps.timeFreeze <= 0
        },
        {
            count: engine.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => engine.activatePowerUp('extraLife'),
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const,
            title: 'Extra Life',
            disabledConfig: engine.lives >= 3 || engine.powerUps.extraLife <= 0
        },
        {
            count: engine.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => engine.activatePowerUp('doubleScore'),
            status: (engine.isDoubleScore ? 'active' : 'normal') as 'active' | 'normal',
            title: 'Double Score',
            disabledConfig: engine.isDoubleScore || engine.powerUps.doubleScore <= 0
        }
    ], [engine]);

    return (
        <Layout2
            title="Animal Banquet"
            subtitle="Feed the hungry animals!"
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<BlobBackground colors={{
                blob1: '#dcfce7', // Green-100
                blob2: '#dbeafe', // Blue-100
                blob3: '#ccfbf1', // Teal-100
                blob4: '#ecfccb'  // Lime-100
            }} />}
            instructions={[
                { icon: '🦁', title: 'Feed Animals', description: 'Give correct food to each animal.' },
                { icon: '🤔', title: 'Remember', description: 'Don\'t feed the same animal twice!' },
                { icon: '⚡', title: 'Be Fast', description: 'They keep moving around.' }
            ]}
        >
            <div className={styles.gameContainer}>
                {/* Main Game Area (Animals) */}
                <div className={styles.gameArea}>
                    {animals.map(animal => (
                        <div
                            key={animal.id}
                            className={`${styles.animal} ${styles[animal.state]}`}
                            style={{
                                left: `${animal.x}%`,
                                top: `${animal.y}%`
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation(); // Prevent drag/click through
                                handleAnimalClick(animal.id);
                            }}
                        >
                            {/* Feedback Bubble */}
                            {animal.feedbackText && (
                                <div className={styles.feedbackBubble}>{animal.feedbackText}</div>
                            )}

                            {/* Animal Icon */}
                            <div className={styles.animalContent}>
                                {SPECIES_DATA[animal.species].icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Control Bar: Food Selection */}
                <div className={styles.foodSelectionBar}>
                    {visibleFoods.map((foodId) => {
                        // Find label/icon from static list or SPECIES_DATA?
                        // We have FOOD_ITEMS list. Let's find it.
                        const foodItem = FOOD_ITEMS.find(f => f.id === foodId);
                        if (!foodItem) return null;

                        return (
                            <button
                                key={foodItem.id}
                                className={`${styles.foodButton} ${selectedFood === foodItem.id ? styles.selected : ''}`}
                                onClick={() => setSelectedFood(foodItem.id)}
                                aria-label={`Select ${foodItem.label}`}
                            >
                                {foodItem.icon}
                            </button>
                        );
                    })}
                </div>
            </div>
        </Layout2>
    );
}

export const manifest = {
    id: 'brain-level2-animal-banquet',
    title: 'Animal Banquet',
    subtitle: 'Feed them once!',
    category: 'brain',
    level: 2,
    component: AnimalBanquet,
    description: 'Remember who you fed! Give the right food to moving animals.',
    thumbnail: '🍖'
} as const;
