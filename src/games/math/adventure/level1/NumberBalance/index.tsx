import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useNumberBalanceLogic } from './GameLogic';
import type { NumberItem } from './GameLogic';
import { BlobBackground } from '../../../components/BlobBackground';

import manifest_en from './locales/en';
import './NumberBalance.css';

import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

interface NumberBalanceProps {
    onExit: () => void;
}

export const NumberBalance: React.FC<NumberBalanceProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const engine = useNumberBalanceLogic();
    const {
        lives, gameOver,
        currentProblem, rightPanItems, scaleAngle, powerUps, timeFrozen, doubleScoreActive,
        startGame, stopGame, handleDrop, handleRemoveFromPan, usePowerUp: activatePowerUp, lastEvent
    } = engine;

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-number-balance': manifest_en } } } };
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

    const derivedGameState = gameOver ? 'gameover' : (engine.isPlaying ? 'playing' : 'idle');

    const layoutEngine = {
        ...engine,
        gameState: derivedGameState,
        difficultyLevel: engine.difficultyLevel,
        maxLevel: 1,
        onPause: stopGame,
        onResume: startGame,
        onRestart: startGame,
        onExit: onExit,
        lastEvent: lastEvent
    };

    // --- Drag and Drop Logic ---
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [showOptionsHint, setShowOptionsHint] = useState(false);
    const draggingRef = useRef<{ item: NumberItem; el: HTMLElement; startX: number; startY: number; rect: DOMRect } | null>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const wasPlayingRef = useRef(false);
    const hasShownHintRef = useRef(false);
    const hintTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (engine.isPlaying && !wasPlayingRef.current) {
            hasShownHintRef.current = false;
            setShowOptionsHint(false);
            if (hintTimerRef.current) {
                window.clearTimeout(hintTimerRef.current);
                hintTimerRef.current = null;
            }
        }
        wasPlayingRef.current = engine.isPlaying;
    }, [engine.isPlaying]);

    useEffect(() => {
        if (!engine.isPlaying || !currentProblem || hasShownHintRef.current) return;

        const isFirstQuestion =
            engine.score === 0 &&
            engine.stats.correct === 0 &&
            engine.stats.wrong === 0;

        if (!isFirstQuestion) return;

        hasShownHintRef.current = true;
        setShowOptionsHint(true);
        hintTimerRef.current = window.setTimeout(() => {
            setShowOptionsHint(false);
            hintTimerRef.current = null;
        }, 1800);
    }, [engine.isPlaying, currentProblem, engine.score, engine.stats.correct, engine.stats.wrong]);

    useEffect(() => {
        return () => {
            if (hintTimerRef.current) {
                window.clearTimeout(hintTimerRef.current);
            }
        };
    }, []);

    const onGlobalPointerMove = (e: PointerEvent) => {
        if (!draggingRef.current || !ghostRef.current) return;
        const deltaX = e.clientX - draggingRef.current.startX;
        const deltaY = e.clientY - draggingRef.current.startY;
        ghostRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const onGlobalPointerUp = () => {
        window.removeEventListener('pointermove', onGlobalPointerMove);
        window.removeEventListener('pointerup', onGlobalPointerUp);

        if (!draggingRef.current) return;

        const dropZone = dropZoneRef.current;
        if (dropZone && ghostRef.current) {
            const ghostRect = ghostRef.current.getBoundingClientRect();
            const dropRect = dropZone.getBoundingClientRect();

            const overlap = !(
                ghostRect.right < dropRect.left ||
                ghostRect.left > dropRect.right ||
                ghostRect.bottom < dropRect.top ||
                ghostRect.top > dropRect.bottom
            );

            if (overlap) {
                handleDrop(draggingRef.current.item);
            }
        }

        if (ghostRef.current) {
            document.body.removeChild(ghostRef.current);
            ghostRef.current = null;
        }
        draggingRef.current = null;
        setDraggingId(null);
    };

    const handlePointerDown = (e: React.PointerEvent, item: NumberItem) => {
        if (!engine.isPlaying || gameOver) return;
        e.preventDefault();

        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        draggingRef.current = { item, el: target, startX: e.clientX, startY: e.clientY, rect };
        setDraggingId(item.id);

        const ghost = target.cloneNode(true) as HTMLDivElement;
        ghost.classList.add('dragging');
        Object.assign(ghost.style, {
            position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
            width: `${rect.width}px`, height: `${rect.height}px`,
            pointerEvents: 'none', zIndex: '9999', willChange: 'transform',
            transform: 'translate3d(0,0,0)'
        });
        document.body.appendChild(ghost);
        ghostRef.current = ghost;

        window.addEventListener('pointermove', onGlobalPointerMove);
        window.addEventListener('pointerup', onGlobalPointerUp);
    };

    const availableOptions = currentProblem?.options.filter(opt =>
        !rightPanItems.some(placed => placed.id === opt.id)
    ) || [];

    const powerUpConfig: PowerUpBtnProps[] = [
        {
            count: powerUps.timeFreeze, color: "blue", icon: "❄️", title: t('games.math-number-balance.powerups.freeze'),
            onClick: () => activatePowerUp('timeFreeze'), disabledConfig: timeFrozen, status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife, color: "red", icon: "❤️", title: t('games.math-number-balance.powerups.life'),
            onClick: () => activatePowerUp('extraLife'), disabledConfig: lives >= 3, status: (lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore, color: "yellow", icon: "⚡", title: t('games.math-number-balance.powerups.double'),
            onClick: () => activatePowerUp('doubleScore'), disabledConfig: doubleScoreActive, status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    return (
        <Layout2
            title={t('games.math-number-balance.title')}
            subtitle={t('games.math-number-balance.subtitle')}
            gameId={GameIds.MATH_NUMBER_BALANCE}
            engine={layoutEngine}
            instructions={[
                { icon: '⚖️', title: t('games.math-number-balance.howToPlay.step1.title'), description: t('games.math-number-balance.howToPlay.step1.description') },
                { icon: '🔢', title: t('games.math-number-balance.howToPlay.step2.title'), description: t('games.math-number-balance.howToPlay.step2.description') },
                { icon: '🎯', title: t('games.math-number-balance.howToPlay.step3.title'), description: t('games.math-number-balance.howToPlay.step3.description') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
        >
            <BlobBackground />
            <div className="number-balance-container" style={{ padding: 0 }}>
                {currentProblem && (
                    <>
                        <div className="scale-wrapper">
                            <div className="balance-assembly">
                                <div className="scale-beam-container" style={{ transform: `rotate(${scaleAngle}deg)` }}>
                                    <div className="scale-beam-bar"></div>
                                    <div className="scale-pan pan-left">
                                        <div className="pan-string-left"></div>
                                        <div className="pan-string-left-inner"></div>
                                        <div className="pan-plate">
                                            <div className="pan-plate-visual"></div>
                                            <div className="pan-content">
                                                <div className="target-block">
                                                    <div className="block-number">{currentProblem.targetValue}</div>
                                                    <div className="block-emojis">
                                                        {[...Array(currentProblem.targetValue)].map((_, i) => (
                                                            <span key={i} className="emoji-icon">{currentProblem.targetEmoji}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="scale-pan pan-right">
                                        <div className="pan-string-right"></div>
                                        <div className="pan-string-right-inner"></div>
                                        <div
                                            ref={dropZoneRef}
                                            className={`pan-plate pan-drop-zone ${draggingId ? 'drop-zone-highlight' : ''}`}
                                        >
                                            <div className="pan-plate-visual"></div>
                                            <div className="pan-content">
                                                <div className="item-stack-row">
                                                    {rightPanItems.map((item, idx) => (
                                                        <div key={item.id} className="number-block" onClick={() => handleRemoveFromPan(idx)} style={{ cursor: 'pointer', scale: '0.8' }}>
                                                            <div className="block-number">{item.value}</div>
                                                            <div className="block-emojis">
                                                                {[...Array(item.value)].map((_, i) => (
                                                                    <span key={i} className="emoji-icon">{item.emoji}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="scale-stand"></div>
                                <div className="scale-stand-base"></div>
                            </div>
                        </div>

                        <div className="options-area">
                            {showOptionsHint && (
                                <div className="options-hint-overlay" aria-hidden="true">
                                    <span className="options-hint-text">{t('games.math-number-balance.ui.dragDropHint')}</span>
                                </div>
                            )}
                            {availableOptions.map(item => (
                                <div
                                    key={`${item.id}-${currentProblem ? currentProblem.targetValue : 'void'}`}
                                    className={`number-block ${draggingId === item.id ? 'opacity-0' : ''}`}
                                    onPointerDown={(e) => handlePointerDown(e, item)}
                                >
                                    <div className="block-number">{item.value}</div>
                                    <div className="block-emojis">
                                        {[...Array(item.value)].map((_, i) => (
                                            <span key={i} className="emoji-icon">{item.emoji}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_NUMBER_BALANCE,
    title: 'Number Balance',
    titleKey: 'games.math-number-balance.title',
    subtitle: 'Balance the scale!',
    subtitleKey: 'games.math-number-balance.subtitle',
    description: 'Find two numbers that add up to the target weight.',
    descriptionKey: 'games.math-number-balance.description',
    category: 'math',
    level: 1,
    component: NumberBalance,
    thumbnail: '⚖️'
};
