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

    useEffect(() => {
        setIsSliced(false);
        setIsSlicingAction(false);
        setSlicingKnifeValue(null);
    }, [currentProblem?.id]);

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
            onClick: () => usePowerUp('timeFreeze'), disabledConfig: timeFrozen, status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife, color: "red", icon: "❤️", title: t('games.math-fruit-slice.powerups.life'),
            onClick: () => usePowerUp('extraLife'), disabledConfig: gameState.lives >= 3, status: (gameState.lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore, color: "yellow", icon: "⚡", title: t('games.math-fruit-slice.powerups.double'),
            onClick: () => usePowerUp('doubleScore'), disabledConfig: doubleScoreActive, status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    // Build custom Target text for Layout3
    const targetLabel = currentProblem ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', justifyContent: 'center' }}>
            <span className="equation-part" style={{ fontSize: '2.5rem', lineHeight: 1 }}>{currentProblem.fruit.equationA}</span>
            <span style={{ fontSize: '2rem', margin: '0 0.2rem' }}>-</span>
            <div style={{
                width: '3.5rem',
                height: '3.5rem',
                border: '3px dashed #9CA3AF',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9CA3AF',
                fontSize: '2rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                margin: '0 0.2rem'
            }}>?</div>
            <span style={{ fontSize: '2rem', margin: '0 0.2rem' }}>=</span>
            <span className="equation-part" style={{ fontSize: '2.5rem', lineHeight: 1 }}>{currentProblem.fruit.equationResult}</span>
        </div>
    ) : null;

    return (
        <Layout3
            title={t('games.math-fruit-slice.title')}
            subtitle={t('games.math-fruit-slice.subtitle')}
            gameId={GameIds.MATH_FRUIT_SLICE}
            engine={layoutEngine as any}
            instructions={[
                { icon: '🧮', title: t('games.math-fruit-slice.howToPlay.step1.title'), description: t('games.math-fruit-slice.howToPlay.step1.description') },
                { icon: '🔪', title: t('games.math-fruit-slice.howToPlay.step2.title'), description: t('games.math-fruit-slice.howToPlay.step2.description') },
                { icon: '🍎', title: t('games.math-fruit-slice.howToPlay.step3.title'), description: t('games.math-fruit-slice.howToPlay.step3.description') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
            target={{
                // Layout3 expects value/icon/label. Using 'value' slot to render complex ReactNode via type coercion or adaptation
                // Layout3 renders: {target.icon && ...} <span className="target-count">{target.value}</span>
                // So we pass the complex JSX as 'value'
                value: targetLabel as any,
                icon: "" // No separate icon needed as it's part of the equation
            }}
        >
            <BlobBackground />
            <div className="fruit-slice-game" style={{ padding: 0, position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {currentProblem && (
                    <>
                        <div className="fruit-stage">
                            {isSlicingAction && slicingKnifeValue !== null && (
                                <div className="number-knife knife-slicing-anim">
                                    <span className="knife-value">{slicingKnifeValue}</span>
                                    <div className="number-knife-bolster"></div>
                                </div>
                            )}

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
