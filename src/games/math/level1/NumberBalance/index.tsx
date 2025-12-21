import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Layout1';
import { useNumberBalanceLogic } from './GameLogic';
import type { NumberItem } from './GameLogic';

import manifest_en from './locales/en';
import './NumberBalance.css';

interface NumberBalanceProps {
    onExit: () => void;
}

// Reusing PowerUpBtn structure from RoundCounting logic (inline for now or import if shared)
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
    // Standard Colors
    const colors = {
        blue: { normal: '#3b82f6', maxed: '#93c5fd' },
        red: { normal: '#ef4444', maxed: '#fca5a5' },
        yellow: { normal: '#eab308', maxed: '#fde047' }
    };
    const isHereActive = status === 'active';
    const isActuallyDisabled = count === 0 && !isHereActive;

    const getButtonStyle = (): React.CSSProperties => {
        if (isHereActive) {
            return { backgroundColor: '#facc15', color: '#000', transform: 'scale(1.1)', zIndex: 10 };
        }
        if (isActuallyDisabled) {
            return {
                backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#9CA3AF',
                cursor: 'not-allowed', backdropFilter: 'blur(4px)'
            };
        }
        return {
            backgroundColor: colors[color][status === 'maxed' ? 'maxed' : 'normal'],
            color: '#fff',
            cursor: status === 'maxed' ? 'not-allowed' : 'pointer'
        };
    };

    return (
        <button
            onClick={() => !disabledConfig && count > 0 && onClick()}
            disabled={isActuallyDisabled}
            style={getButtonStyle()}
            className={`relative p-2 rounded-full transition-all shadow-md flex items-center justify-center ${isHereActive ? 'ring-4 ring-yellow-200' : ''}`}
            title={title}
        >
            {icon}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm" style={{ zIndex: 20 }}>
                {count}
            </span>
        </button>
    );
};


export const NumberBalance: React.FC<NumberBalanceProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const engine = useNumberBalanceLogic();
    const {
        lives, gameOver, // Used in local logic
        currentProblem, rightPanItems, scaleAngle, powerUps, timeFrozen, doubleScoreActive,
        startGame, stopGame, handleDrop, handleRemoveFromPan, usePowerUp, lastEvent
    } = engine;

    // Load locales
    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-number-balance': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        // startGame handled by Layout start screen interaction
    }, []);

    const derivedGameState = gameOver ? 'gameover' : (engine.isPlaying ? 'playing' : 'idle');

    // Layout Engine Adaptor
    const layoutEngine = {
        ...engine,
        gameState: derivedGameState,
        difficultyLevel: engine.difficultyLevel, // Pass difficulty level
        maxLevel: 1, // Fixed level for now
        onPause: stopGame,
        onResume: startGame, // Resume essentially restarts timer/anim if needed
        onRestart: startGame,
        onExit: onExit,
        lastEvent: lastEvent // Pass event to Layout1
    };

    // --- Drag and Drop Logic ---
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const draggingRef = useRef<{ item: NumberItem; el: HTMLElement; startX: number; startY: number; rect: DOMRect } | null>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);

    const onGlobalPointerMove = (e: PointerEvent) => {
        if (!draggingRef.current || !ghostRef.current) return;

        const deltaX = e.clientX - draggingRef.current.startX;
        const deltaY = e.clientY - draggingRef.current.startY;

        ghostRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const onGlobalPointerUp = (_: PointerEvent) => {
        // Cleanup Listeners immediately
        window.removeEventListener('pointermove', onGlobalPointerMove);
        window.removeEventListener('pointerup', onGlobalPointerUp);

        if (!draggingRef.current) return;

        // Check Drop
        const dropZone = dropZoneRef.current;
        if (dropZone && ghostRef.current) {
            const ghostRect = ghostRef.current.getBoundingClientRect();
            const dropRect = dropZone.getBoundingClientRect();

            // Simple intersection check
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

        // Cleanup
        if (ghostRef.current) {
            document.body.removeChild(ghostRef.current);
            ghostRef.current = null;
        }
        draggingRef.current = null;
        setDraggingId(null);
    };


    const handlePointerDown = (e: React.PointerEvent, item: NumberItem) => {
        if (!engine.isPlaying || gameOver) return;

        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        draggingRef.current = {
            item: item,
            el: target,
            startX: e.clientX,
            startY: e.clientY,
            rect: rect
        };

        setDraggingId(item.id);

        // Create Ghost
        const ghost = target.cloneNode(true) as HTMLDivElement;
        ghost.classList.add('dragging');
        ghost.style.position = 'fixed';
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.pointerEvents = 'none'; // Let events pass to underlying elements
        ghost.style.zIndex = '9999';
        document.body.appendChild(ghost);
        ghostRef.current = ghost;

        // Attach Global Listeners
        window.addEventListener('pointermove', onGlobalPointerMove);
        window.addEventListener('pointerup', onGlobalPointerUp);
    };


    // Filter used items from options
    // Find items that are NOT in the right pan
    const availableOptions = currentProblem?.options.filter(opt =>
        !rightPanItems.some(placed => placed.id === opt.id)
    ) || [];


    return (
        <Layout1
            title={t('games.math-number-balance.title')}
            subtitle={t('games.math-number-balance.sub')}
            gameId="math-number-balance"
            engine={layoutEngine as any} // Cast safely as types match structure
            instructions={[
                { icon: '⚖️', title: t('games.math-number-balance.howToPlay.goal.title'), description: t('games.math-number-balance.howToPlay.goal.desc') },
                { icon: '👆', title: t('games.math-number-balance.howToPlay.action.title'), description: t('games.math-number-balance.howToPlay.action.desc') },
                { icon: '🔢', title: t('games.math-number-balance.howToPlay.math.title'), description: t('games.math-number-balance.howToPlay.math.desc') }
            ]}
            onExit={onExit}
        >
            <div className="number-balance-container">
                {/* Power Ups */}
                {/* Power Ups */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginBottom: '0.5rem', paddingLeft: '1rem', zIndex: 10 }}>
                    <PowerUpBtn
                        count={powerUps.timeFreeze} color="blue" icon="❄️" title={t('games.math-number-balance.powerups.freeze')}
                        onClick={() => usePowerUp('timeFreeze')} disabledConfig={timeFrozen} status={timeFrozen ? 'active' : 'normal'}
                    />
                    <PowerUpBtn
                        count={powerUps.extraLife} color="red" icon="❤️" title={t('games.math-number-balance.powerups.life')}
                        onClick={() => usePowerUp('extraLife')} disabledConfig={lives >= 3} status={lives >= 3 ? 'maxed' : 'normal'}
                    />
                    <PowerUpBtn
                        count={powerUps.doubleScore} color="yellow" icon="⚡" title={t('games.math-number-balance.powerups.double')}
                        onClick={() => usePowerUp('doubleScore')} disabledConfig={doubleScoreActive} status={doubleScoreActive ? 'active' : 'normal'}
                    />
                </div>

                {currentProblem && (
                    <>
                        <div className="scale-wrapper">
                            <div className="balance-assembly">
                                <div className="scale-beam-container" style={{ transform: `rotate(${scaleAngle}deg)` }}>
                                    <div className="scale-beam-bar"></div>
                                    {/* Left Pan (Target) */}
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
                                    {/* Right Pan (Drop Zone) */}
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

                        {/* Options Area */}
                        <div className="options-area">
                            {availableOptions.map(item => (
                                <div
                                    key={item.id}
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
        </Layout1>
    );
};

import type { GameManifest } from '../../../types';

export const manifest: GameManifest = {
    id: 'math-number-balance',
    title: 'Number Balance',
    titleKey: 'games.math-number-balance.title',
    subtitle: 'Balance the scale!',
    subtitleKey: 'games.math-number-balance.sub',
    description: 'Find two numbers that add up to the target weight.',
    descriptionKey: 'games.math-number-balance.desc',
    category: 'math',
    level: 1,
    component: NumberBalance,
    thumbnail: '⚖️'
};
