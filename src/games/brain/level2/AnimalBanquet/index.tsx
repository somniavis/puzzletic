import { useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useAnimalBanquetLogic, type FoodType } from './GameLogic';
import styles from './AnimalBanquet.module.css';
import { BlobBackground } from '../../../math/components/BlobBackground';
import manifest_en from './locales/en';

// Food items moved inside component or memoized to use translation?
// Ideally we keep the static definition for IDs/Icons, but Labels need translation.
// We can translate on the fly.
const FOOD_ICONS: Record<FoodType, string> = {
    meat: '🍖', banana: '🍌', honey: '🍯', bamboo: '🎋', carrot: '🥕',
    cheese: '🧀', bone: '🦴', fish: '🐟', vegetable: '🥬'
};

import { GameIds } from '../../../../constants/gameIds';
const GAME_ID = GameIds.ANIMAL_BANQUET;

interface AnimalBanquetProps {
    onExit?: () => void;
}


export default function AnimalBanquet({ onExit }: AnimalBanquetProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const handleExit = onExit || (() => navigate(-1));

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'animal-banquet': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

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
    const [showFoodHintOverlay, setShowFoodHintOverlay] = useState(false);
    const [isFoodHintOverlayExiting, setIsFoodHintOverlayExiting] = useState(false);
    const hasShownFoodHintOverlayRef = useRef(false);
    const foodHintOverlayTimerRef = useRef<number | null>(null);
    const foodHintOverlayExitTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const isFirstProblem = engine.score === 0 && engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing') {
            if (engine.gameState === 'gameover' || engine.gameState === 'idle') {
                setShowFoodHintOverlay(false);
                setIsFoodHintOverlayExiting(false);
                hasShownFoodHintOverlayRef.current = false;
            }
            return;
        }
        if (!isFirstProblem || hasShownFoodHintOverlayRef.current) return;

        hasShownFoodHintOverlayRef.current = true;
        setShowFoodHintOverlay(true);
        setIsFoodHintOverlayExiting(false);

        foodHintOverlayTimerRef.current = window.setTimeout(() => {
            setIsFoodHintOverlayExiting(true);
            foodHintOverlayExitTimerRef.current = window.setTimeout(() => {
                setShowFoodHintOverlay(false);
                setIsFoodHintOverlayExiting(false);
                foodHintOverlayExitTimerRef.current = null;
            }, 220);
            foodHintOverlayTimerRef.current = null;
        }, 1800);
    }, [engine.gameState, engine.score, engine.stats.correct, engine.stats.wrong]);

    useEffect(() => {
        return () => {
            if (foodHintOverlayTimerRef.current != null) {
                window.clearTimeout(foodHintOverlayTimerRef.current);
                foodHintOverlayTimerRef.current = null;
            }
            if (foodHintOverlayExitTimerRef.current != null) {
                window.clearTimeout(foodHintOverlayExitTimerRef.current);
                foodHintOverlayExitTimerRef.current = null;
            }
        };
    }, []);

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
            title={t('games.animal-banquet.title')}
            subtitle={t('games.animal-banquet.subtitle')}
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
                { icon: '🐯', title: t('games.animal-banquet.howToPlay.step1.title'), description: t('games.animal-banquet.howToPlay.step1.description') },
                { icon: '🍱', title: t('games.animal-banquet.howToPlay.step2.title'), description: t('games.animal-banquet.howToPlay.step2.description') },
                { icon: '1️⃣', title: t('games.animal-banquet.howToPlay.step3.title'), description: t('games.animal-banquet.howToPlay.step3.description') }
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
                    {showFoodHintOverlay && (
                        <div className={`${styles.foodHintOverlay} ${isFoodHintOverlayExiting ? styles.exiting : ''}`} aria-hidden="true">
                            <span className={styles.foodHintText}>{t('games.animal-banquet.ui.foodHint')}</span>
                        </div>
                    )}
                    {visibleFoods.map((foodId) => (
                        <button
                            key={foodId}
                            className={`${styles.foodButton} ${selectedFood === foodId ? styles.selected : ''}`}
                            onClick={() => setSelectedFood(foodId)}
                            aria-label={`Select ${t(`games.animal-banquet.foods.${foodId}`)}`}
                        >
                            {FOOD_ICONS[foodId]}
                        </button>
                    ))}
                </div>
            </div>
        </Layout2>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const manifest = {
    id: GameIds.ANIMAL_BANQUET,
    title: 'Animal Banquet',
    titleKey: 'games.animal-banquet.title',
    subtitle: 'Feed them once!',
    subtitleKey: 'games.animal-banquet.subtitle',
    category: 'brain',
    level: 2,
    component: AnimalBanquet,
    description: 'Remember who you fed! Give the right food to moving animals.',
    descriptionKey: 'games.animal-banquet.description',
    thumbnail: '🍖'
} as const;
