import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useFruitSliceLogic, FRUITS } from './GameLogic';
import manifest_en from './locales/en';
import './FruitSlice.css';
import { BlobBackground } from '../../../components/BlobBackground';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

interface FruitSliceProps {
    onExit: () => void;
}

export const FruitSlice: React.FC<FruitSliceProps> = ({ onExit }) => {
    // ... code ...
    // Note: I cannot replace the whole file, just the import section and the render section. 
    // I will split this into two edits if needed, but I can use the provided context to do it carefully.
    // Actually, stick to one edit per "chunk" logic.
    // Let's do imports first.
    const { t, i18n } = useTranslation();
    const logic = useFruitSliceLogic();
    const {
        gameState,
        currentProblem,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        stopTimer,
        handleAnswer,
        usePowerUp: activatePowerUp,
        lastEvent
    } = logic;

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-fruit-slice': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    // Force blur on problem change (Safari Focus Fix)
    useEffect(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, [currentProblem]);

    const [draggingKnifeId, setDraggingKnifeId] = useState<number | null>(null);
    const [draggingKnifeValue, setDraggingKnifeValue] = useState<number | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const fruitRef = useRef<HTMLDivElement>(null);

    const [isSliced, setIsSliced] = useState(false);
    const [isSlicingAction, setIsSlicingAction] = useState(false);
    const [slicingKnifeValue, setSlicingKnifeValue] = useState<number | null>(null);
    const [showSliceHintOverlay, setShowSliceHintOverlay] = useState(false);
    const wasPlayingRef = useRef(false);
    const hasShownSliceHintRef = useRef(false);
    const sliceHintTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setIsSliced(false);
        setIsSlicingAction(false);
        setSlicingKnifeValue(null);
    }, [currentProblem?.id]);

    useEffect(() => {
        if (gameState.isPlaying && !wasPlayingRef.current) {
            hasShownSliceHintRef.current = false;
            setShowSliceHintOverlay(false);
            if (sliceHintTimerRef.current !== null) {
                window.clearTimeout(sliceHintTimerRef.current);
                sliceHintTimerRef.current = null;
            }
        }
        wasPlayingRef.current = gameState.isPlaying;
    }, [gameState.isPlaying]);

    useEffect(() => {
        if (!gameState.isPlaying || !currentProblem || hasShownSliceHintRef.current) return;

        const isFirstQuestion =
            gameState.score === 0 &&
            gameState.stats.correct === 0 &&
            gameState.stats.wrong === 0;

        if (!isFirstQuestion) return;

        hasShownSliceHintRef.current = true;
        setShowSliceHintOverlay(true);
        sliceHintTimerRef.current = window.setTimeout(() => {
            setShowSliceHintOverlay(false);
            sliceHintTimerRef.current = null;
        }, 1800);
    }, [gameState.isPlaying, currentProblem, gameState.score, gameState.stats.correct, gameState.stats.wrong]);

    useEffect(() => {
        return () => {
            if (sliceHintTimerRef.current !== null) {
                window.clearTimeout(sliceHintTimerRef.current);
            }
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent, knifeId: number, knifeValue: number) => {
        if (gameState.gameOver || isSliced || isSlicingAction) return;
        setDraggingKnifeId(knifeId);
        setDraggingKnifeValue(knifeValue);
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        if (draggingKnifeId === null) return;
        const handleGlobalPointerMove = (e: PointerEvent) => {
            setDragPosition({ x: e.clientX, y: e.clientY });
        };
        const handleGlobalPointerUp = (e: PointerEvent) => {
            if (draggingKnifeId === null) return;
            if (fruitRef.current) {
                const fruitRect = fruitRef.current.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                if (x >= fruitRect.left && x <= fruitRect.right && y >= fruitRect.top && y <= fruitRect.bottom) {
                    setIsSlicingAction(true);
                    setSlicingKnifeValue(draggingKnifeValue);
                    setTimeout(() => {
                        if (draggingKnifeValue !== null) {
                            handleAnswer(draggingKnifeValue);
                        }
                    }, 350);
                }
            }
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

    useEffect(() => {
        if (lastEvent?.type === 'correct') {
            setIsSliced(true);
        } else if (lastEvent?.type === 'wrong') {
            setIsSlicingAction(false);
        }
    }, [lastEvent]);

    const layoutEngine = {
        gameState: gameState.gameOver ? 'gameover' : (gameState.isPlaying ? 'playing' : 'idle'),
        score: gameState.score,
        lives: gameState.lives,
        timeLeft: gameState.timeLeft,
        combo: gameState.combo,
        bestCombo: gameState.bestCombo,
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

    const powerUpConfig: PowerUpBtnProps[] = [
        {
            count: powerUps.timeFreeze, color: "blue", icon: "❄️", title: t('games.math-fruit-slice.powerups.freeze'),
            onClick: () => activatePowerUp('timeFreeze'), disabledConfig: timeFrozen, status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife, color: "red", icon: "❤️", title: t('games.math-fruit-slice.powerups.life'),
            onClick: () => activatePowerUp('extraLife'), disabledConfig: gameState.lives >= 3, status: (gameState.lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore, color: "yellow", icon: "⚡", title: t('games.math-fruit-slice.powerups.double'),
            onClick: () => activatePowerUp('doubleScore'), disabledConfig: doubleScoreActive, status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    const targetEquation = currentProblem
        ? `${currentProblem.fruit.equationA} - ${currentProblem.fruit.equationResult} = ?`
        : '...';

    return (
        <Layout3
            title={t('games.math-fruit-slice.title')}
            subtitle={t('games.math-fruit-slice.subtitle')}
            gameId={GameIds.MATH_FRUIT_SLICE}
            engine={layoutEngine as typeof logic}
            instructions={[
                { icon: '🧮', title: t('games.math-fruit-slice.howToPlay.step1.title'), description: t('games.math-fruit-slice.howToPlay.step1.description') },
                { icon: '🔪', title: t('games.math-fruit-slice.howToPlay.step2.title'), description: t('games.math-fruit-slice.howToPlay.step2.description') },
                { icon: '🍎', title: t('games.math-fruit-slice.howToPlay.step3.title'), description: t('games.math-fruit-slice.howToPlay.step3.description') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
            target={{
                value: targetEquation,
                icon: "" // No separate icon needed as it's part of the equation
            }}
        >
            <BlobBackground />
            <div className="fruit-slice-game" style={{ padding: 0, position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {currentProblem && (
                    <>
                        <div className="fruit-stage">
                            <div
                                className="fruit-stage-panel"
                                style={{
                                    backgroundColor: currentFruit ? hexToRgba(currentFruit.color, 0.2) : 'rgba(0,0,0,0.1)',
                                    boxShadow: `0 5px 0 ${currentFruit ? hexToRgba(currentFruit.color, 0.42) : '#93c5fd'}, 0 8px 12px rgba(0, 0, 0, 0.12)`
                                }}
                            >
                                {showSliceHintOverlay && (
                                    <div className="fruit-stage-hint-overlay" aria-hidden="true">
                                        <span className="fruit-stage-hint-text">{t('games.math-fruit-slice.ui.dragSliceHint')}</span>
                                    </div>
                                )}
                                {isSlicingAction && slicingKnifeValue !== null && (
                                    <div className="number-knife knife-slicing-anim">
                                        <span className="knife-value">{slicingKnifeValue}</span>
                                        <div className="number-knife-bolster"></div>
                                    </div>
                                )}

                                <div
                                    ref={fruitRef}
                                    className="fruit-display-core"
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
                                            <div style={{ visibility: 'hidden' }}>{currentFruit?.emoji}</div>
                                            <div className="sliced-wrapper left">
                                                <div className="sliced-inner" style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }}>
                                                    {currentFruit?.emoji}
                                                </div>
                                            </div>
                                            <div className="sliced-wrapper right">
                                                <div className="sliced-inner" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}>
                                                    {currentFruit?.emoji}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
        </Layout3>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_FRUIT_SLICE,
    title: 'Fruit Slice',
    titleKey: 'games.math-fruit-slice.title',
    subtitle: 'Slice the fruits!',
    subtitleKey: 'games.math-fruit-slice.subtitle',
    description: 'Slice matching fruits to count correctly.',
    descriptionKey: 'games.math-fruit-slice.description',
    category: 'math',
    level: 1,
    component: FruitSlice,
    thumbnail: '🍉'
};
