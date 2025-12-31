import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Layout1';
import { useFruitSliceLogic, FRUITS } from './GameLogic';
import manifest_en from './locales/en';
import './FruitSlice.css';

interface FruitSliceProps {
    onExit: () => void;
}

interface PowerUpBtnProps {
    count: number;
    color: 'blue' | 'red' | 'yellow';
    icon: string;
    title: string;
    onClick: () => void;
    disabledConfig: boolean;
    status: 'active' | 'maxed' | 'normal';
}

const PowerUpBtn: React.FC<PowerUpBtnProps> = ({ count, color, icon, title, onClick, disabledConfig, status }) => {
    // Explicit colors to guarantee correct rendering and avoid global CSS overrides
    const colors = {
        blue: { normal: '#3b82f6', maxed: '#93c5fd' }, // blue-500, blue-300
        red: { normal: '#ef4444', maxed: '#fca5a5' }, // red-500, red-300
        yellow: { normal: '#eab308', maxed: '#fde047' } // yellow-500, yellow-300
    };

    const isHereActive = status === 'active';
    const isActuallyDisabled = count === 0 && !isHereActive;

    const getButtonStyle = (): React.CSSProperties => {
        if (isHereActive) {
            // Active: Bright Yellow background, Black text
            return {
                width: '3.5rem', height: '2rem', // Fixed size
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
                backgroundColor: '#facc15', // yellow-400
                color: '#000000',
                transform: 'scale(1.1)',
                zIndex: 10,
                border: '1px solid #eab308', // Darker yellow border
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' // Floating shadow
            };
        }
        if (isActuallyDisabled) {
            // Disabled (0 count): White Card style (Empty Slot look)
            return {
                width: '3.5rem', height: '2rem', // Fixed size
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
                backgroundColor: '#ffffff', // White background
                color: '#e5e7eb', // Gray-200 for placeholder icon (faint)
                cursor: 'not-allowed',
                border: '1px solid #e5e7eb', // Faint border
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // Subtle shadow for empty state
            };
        }
        // Normal/Maxed state
        return {
            width: '3.5rem', height: '2rem', // Fixed size
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
            backgroundColor: colors[color][status === 'maxed' ? 'maxed' : 'normal'],
            color: '#ffffff',
            cursor: status === 'maxed' ? 'not-allowed' : 'pointer',
            border: '1px solid rgba(0,0,0,0.1)', // Border for definition
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // Standard shadow
        };
    };

    const handleClick = () => {
        if (disabledConfig || count === 0) return;
        onClick();
    };

    // Base layout classes: Fixed width/height
    const baseClasses = "relative w-14 h-8 rounded-xl transition-all shadow-md flex items-center justify-center flex-shrink-0 powerup-btn";
    const activeClasses = isHereActive ? "ring-4 ring-yellow-200" : "";

    return (
        <button
            onClick={handleClick}
            disabled={isActuallyDisabled}
            style={getButtonStyle()}
            className={`${baseClasses} ${activeClasses}`}
            title={title}
        >
            {icon}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none shadow-sm" style={{ zIndex: 20 }}>
                {count}
            </span>
        </button>
    );
};

export const FruitSlice: React.FC<FruitSliceProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const {
        gameState,
        currentProblem,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        stopTimer,
        handleAnswer,
        usePowerUp,
        lastEvent
    } = useFruitSliceLogic();

    // Load translations
    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-fruit-slice': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        // startGame handled by Layout start screen interaction
    }, []);

    // Drag & Drop State
    const [draggingKnifeId, setDraggingKnifeId] = useState<number | null>(null);
    const [draggingKnifeValue, setDraggingKnifeValue] = useState<number | null>(null); // New state to track value globally
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const fruitRef = useRef<HTMLDivElement>(null);

    // Animation state
    const [isSliced, setIsSliced] = useState(false);
    const [isSlicingAction, setIsSlicingAction] = useState(false);
    const [slicingKnifeValue, setSlicingKnifeValue] = useState<number | null>(null);

    // Reset states on new problem
    useEffect(() => {
        setIsSliced(false);
        setIsSlicingAction(false);
        setSlicingKnifeValue(null);
    }, [currentProblem?.id]);

    const handlePointerDown = (e: React.PointerEvent, knifeId: number, knifeValue: number) => {
        // Block interaction if game over, already sliced, or currently performing slice action
        if (gameState.gameOver || isSliced || isSlicingAction) return;

        // Don't capture pointer on the element, rely on window listeners
        setDraggingKnifeId(knifeId);
        setDraggingKnifeValue(knifeValue);
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    // Global Event Listeners for robust Drag & Drop
    useEffect(() => {
        if (draggingKnifeId === null) return;

        const handleGlobalPointerMove = (e: PointerEvent) => {
            setDragPosition({ x: e.clientX, y: e.clientY });
        };

        const handleGlobalPointerUp = (e: PointerEvent) => {
            if (draggingKnifeId === null) return;

            // Check Drop Target
            if (fruitRef.current) {
                const fruitRect = fruitRef.current.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;

                if (x >= fruitRect.left && x <= fruitRect.right && y >= fruitRect.top && y <= fruitRect.bottom) {
                    // Trigger Slice Action Animation first
                    setIsSlicingAction(true);
                    setSlicingKnifeValue(draggingKnifeValue);

                    // Wait for animation (400ms) then check answer
                    setTimeout(() => {
                        if (draggingKnifeValue !== null) {
                            handleAnswer(draggingKnifeValue);
                        }
                    }, 350);
                }
            }

            // Clean up drag state
            setDraggingKnifeId(null);
            setDraggingKnifeValue(null);
        };

        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);

        return () => {
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
        };
    }, [draggingKnifeId, draggingKnifeValue, handleAnswer]);

    // Watch for Correct event to trigger Slice animation (Fruit split)
    useEffect(() => {
        if (lastEvent?.type === 'correct') {
            setIsSliced(true);
        } else if (lastEvent?.type === 'wrong') {
            // If wrong, we need to reset the slicing action so they can try again
            setIsSlicingAction(false);
        }
    }, [lastEvent]);


    const layoutEngine = {
        gameState: gameState.gameOver ? 'gameover' : (gameState.isPlaying ? 'playing' : 'idle'),
        score: gameState.score,
        lives: gameState.lives,
        timeLeft: gameState.timeLeft,
        streak: gameState.streak,
        bestStreak: gameState.bestStreak,
        gameOverReason: gameState.gameOverReason,
        difficultyLevel: gameState.difficultyLevel,
        maxLevel: 3,
        startGame: startGame,
        onPause: stopTimer,
        onResume: startGame,
        onExit: onExit,
        onRestart: () => window.location.reload(),
        lastEvent: lastEvent,
        stats: gameState.stats
    };

    const hexToRgba = (hex: string, alpha: number) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : hex;
    };

    const currentFruit = FRUITS.find(f => f.type === currentProblem?.fruit.fruitType);

    return (
        <Layout1
            title={t('games.math-fruit-slice.title')}
            subtitle={t('games.math-fruit-slice.sub')}
            gameId="math-fruit-slice"
            engine={layoutEngine as any} // Cast safely as types match structure
            instructions={[
                { icon: '🍉', title: t('games.math-fruit-slice.howToPlay.goal.title'), description: t('games.math-fruit-slice.howToPlay.goal.desc') },
                { icon: '🔪', title: t('games.math-fruit-slice.howToPlay.action.title'), description: t('games.math-fruit-slice.howToPlay.action.desc') },
                { icon: '🔢', title: t('games.math-fruit-slice.howToPlay.math.title'), description: t('games.math-fruit-slice.howToPlay.math.desc') }
            ]}
            onExit={onExit}
        >
            <div className="fruit-slice-container">
                {/* Unified Header */}
                <div className="slice-header">
                    <div className="powerup-row">
                        <PowerUpBtn
                            count={powerUps.timeFreeze} color="blue" icon="❄️" title={t('games.math-fruit-slice.powerups.freeze')}
                            onClick={() => usePowerUp('timeFreeze')} disabledConfig={timeFrozen} status={timeFrozen ? 'active' : 'normal'}
                        />
                        <PowerUpBtn
                            count={powerUps.extraLife} color="red" icon="❤️" title={t('games.math-fruit-slice.powerups.life')}
                            onClick={() => usePowerUp('extraLife')} disabledConfig={gameState.lives >= 3} status={gameState.lives >= 3 ? 'maxed' : 'normal'}
                        />
                        <PowerUpBtn
                            count={powerUps.doubleScore} color="yellow" icon="⚡" title={t('games.math-fruit-slice.powerups.double')}
                            onClick={() => usePowerUp('doubleScore')} disabledConfig={doubleScoreActive} status={doubleScoreActive ? 'active' : 'normal'}
                        />
                    </div>

                    {currentProblem && (
                        <div className="target-display-card">
                            <span className="equation-part">{currentProblem.fruit.equationA}</span>
                            <span>-</span>
                            <div className="mystery-box">?</div>
                            <span>=</span>
                            <span className="equation-part">{currentProblem.fruit.equationResult}</span>
                        </div>
                    )}
                </div>

                {currentProblem && (
                    <>

                        <div className="fruit-stage">
                            {/* Visual Slicing Knife Animation */}
                            {isSlicingAction && slicingKnifeValue !== null && (
                                <div className="number-knife knife-slicing-anim">
                                    <span className="knife-value">{slicingKnifeValue}</span>
                                    <div className="number-knife-bolster"></div>
                                </div>
                            )}

                            {/* Fruit Drop Target Area */}
                            <div
                                ref={fruitRef}
                                className="fruit-target-bg"
                                style={{
                                    backgroundColor: currentFruit ? hexToRgba(currentFruit.color, 0.2) : 'rgba(0,0,0,0.1)',
                                    borderColor: currentFruit ? hexToRgba(currentFruit.color, 0.4) : 'transparent'
                                }}
                            >
                                {!isSliced ? (
                                    <div
                                        className={`target-fruit fruit-enter ${lastEvent?.type === 'wrong' ? 'animate-shake' : ''}`}
                                        style={{ color: currentFruit?.color }}
                                    >
                                        {currentFruit?.emoji}
                                    </div>
                                ) : (
                                    <div className="target-fruit sliced">
                                        {/* Ghost element for sizing */}
                                        <div style={{ visibility: 'hidden' }}>{currentFruit?.emoji}</div>

                                        {/* Left Part */}
                                        <div className="sliced-wrapper left">
                                            <div className="sliced-inner" style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }}>
                                                {currentFruit?.emoji}
                                            </div>
                                        </div>

                                        {/* Right Part */}
                                        <div className="sliced-wrapper right">
                                            <div className="sliced-inner" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}>
                                                {currentFruit?.emoji}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="knife-rack">
                            {currentProblem.knives.map(knife => (
                                <div
                                    key={knife.id}
                                    className={`number-knife ${draggingKnifeId === knife.id ? 'dragging' : ''}`}
                                    onPointerDown={(e) => handlePointerDown(e, knife.id, knife.value)}
                                    style={{
                                        ...(draggingKnifeId === knife.id ? {
                                            position: 'fixed',
                                            left: dragPosition.x,
                                            top: dragPosition.y,
                                            transform: 'translate(-50%, -50%) scale(1.1) rotate(-15deg)',
                                            zIndex: 100,
                                            pointerEvents: 'none'
                                        } : {}),
                                        // Hide the knife from the rack if it is currently being used in the slice animation
                                        visibility: (isSlicingAction && slicingKnifeValue === knife.value) ? 'hidden' : 'visible'
                                    }}
                                >
                                    <span className="knife-value">{knife.value}</span>
                                    <div className="number-knife-bolster"></div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout1>
    );
};

import type { GameManifest } from '../../../types';

export const manifest: GameManifest = {
    id: 'math-fruit-slice',
    title: 'Fruit Slice',
    titleKey: 'games.math-fruit-slice.title',
    subtitle: 'Slice the fruits!',
    subtitleKey: 'games.math-fruit-slice.sub',
    description: 'Slice matching fruits to count correctly.',
    descriptionKey: 'games.math-fruit-slice.desc',
    category: 'math',
    level: 1,
    component: FruitSlice,
    thumbnail: '🍉'
};
