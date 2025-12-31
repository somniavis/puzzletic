import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Layout2';
import { useNumberBalanceLogic } from './GameLogic';
import type { NumberItem } from './GameLogic';

import manifest_en from './locales/en';
import './NumberBalance.css';

import type { GameManifest } from '../../../types';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

interface NumberBalanceProps {
    onExit: () => void;
}

export const NumberBalance: React.FC<NumberBalanceProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const engine = useNumberBalanceLogic();
    const {
        lives, gameOver,
        currentProblem, rightPanItems, scaleAngle, powerUps, timeFrozen, doubleScoreActive,
        startGame, stopGame, handleDrop, handleRemoveFromPan, usePowerUp, lastEvent
    } = engine;

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-number-balance': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, []);

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
            onClick: () => usePowerUp('timeFreeze'), disabledConfig: timeFrozen, status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife, color: "red", icon: "❤️", title: t('games.math-number-balance.powerups.life'),
            onClick: () => usePowerUp('extraLife'), disabledConfig: lives >= 3, status: (lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore, color: "yellow", icon: "⚡", title: t('games.math-number-balance.powerups.double'),
            onClick: () => usePowerUp('doubleScore'), disabledConfig: doubleScoreActive, status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    return (
        <Layout2
            title={t('games.math-number-balance.title')}
            subtitle={t('games.math-number-balance.sub')}
            gameId="math-number-balance"
            engine={layoutEngine as any}
            instructions={[
                { icon: '⚖️', title: t('games.math-number-balance.howToPlay.goal.title'), description: t('games.math-number-balance.howToPlay.goal.desc') },
                { icon: '👆', title: t('games.math-number-balance.howToPlay.action.title'), description: t('games.math-number-balance.howToPlay.action.desc') },
                { icon: '🔢', title: t('games.math-number-balance.howToPlay.math.title'), description: t('games.math-number-balance.howToPlay.math.desc') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
        >
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
        </Layout2>
    );
};

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
