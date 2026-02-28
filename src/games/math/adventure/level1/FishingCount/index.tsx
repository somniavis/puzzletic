import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useFishingCountLogic } from './GameLogic';
import { FishingBackground } from './FishingBackground';
import manifest_en from './locales/en';
import './FishingCount.css';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';

interface FishingCountProps {
    onExit: () => void;
}

export const FishingCount: React.FC<FishingCountProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const useFishingCountLogicReturns = useFishingCountLogic();
    const {
        animals,
        containerRef,
        targetAnimal,
        targetCount,
        caughtCount,
        handleCatch,
        startGame,
        stopGame,
        isPlaying,
        isGameOver
    } = useFishingCountLogicReturns;

    const [draggedAnimalId, setDraggedAnimalId] = useState<number | null>(null);
    const [netHighlight, setNetHighlight] = useState(false);
    const movementRef = useRef<Record<number, { x: number; y: number; vx: number; vy: number; faceLeft: boolean }>>({});
    const rafRef = useRef<number | null>(null);
    const lastFrameRef = useRef<number>(0);
    const draggingRef = useRef<{ id: number; startX: number; startY: number; currentX: number; currentY: number } | null>(null);

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-fishing-count': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        // startGame handled by Layout start screen interaction
    }, [i18n]);

    // Force blur on target change (Safari Focus Fix)
    useEffect(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, [targetCount]);

    // Efficient movement loop: keep positions in refs and mutate DOM directly.
    useEffect(() => {
        const existingIds = new Set(animals.map(a => a.id));
        for (const animal of animals) {
            if (!movementRef.current[animal.id]) {
                movementRef.current[animal.id] = {
                    x: animal.x,
                    y: animal.y,
                    vx: animal.vx,
                    vy: animal.vy,
                    faceLeft: animal.faceLeft
                };
            }
        }
        Object.keys(movementRef.current).forEach((key) => {
            const id = Number(key);
            if (!existingIds.has(id)) {
                delete movementRef.current[id];
            }
        });
    }, [animals]);

    useEffect(() => {
        if (!isPlaying) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastFrameRef.current = 0;
            return;
        }

        const tick = (timestamp: number) => {
            if (!isPlaying) return;
            if (lastFrameRef.current === 0) {
                lastFrameRef.current = timestamp;
            }

            const deltaTime = timestamp - lastFrameRef.current;
            const timeScale = Math.min(deltaTime / 16.67, 3);

            for (const key of Object.keys(movementRef.current)) {
                const id = Number(key);
                if (draggingRef.current?.id === id) continue;

                const item = movementRef.current[id];
                if (!item) continue;

                item.x += item.vx * timeScale;
                item.y += item.vy * timeScale;

                if (item.x <= 0 || item.x >= 90) {
                    item.vx *= -1;
                    item.x = Math.max(0, Math.min(item.x, 90));
                    item.faceLeft = item.vx < 0;
                }
                if (item.y <= 0 || item.y >= 75) {
                    item.vy *= -1;
                    item.y = Math.max(0, Math.min(item.y, 75));
                }

                const el = document.getElementById(`animal-${id}`);
                if (!el) continue;

                el.style.left = `${item.x}%`;
                el.style.top = `${item.y}%`;

                const emojiEl = el.firstElementChild as HTMLElement | null;
                if (emojiEl) {
                    emojiEl.style.transform = item.faceLeft ? 'scaleX(1)' : 'scaleX(-1)';
                }
            }

            lastFrameRef.current = timestamp;
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastFrameRef.current = 0;
        };
    }, [isPlaying]);

    // Layout Engine Adaptor
    const derivedGameState = isGameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle');

    const layoutEngine = {
        ...useFishingCountLogicReturns,
        gameState: derivedGameState,
        onPause: stopGame,
        onResume: startGame,
        onRestart: startGame,
        onExit: onExit,
        difficultyLevel: 1,
        maxLevel: 1
    };

    const targetInline = (
        <span className="fishing-target-inline">
            <span className="fishing-target-inline-emoji">{targetAnimal || '❓'}</span>
            <span className="fishing-target-inline-number">{Math.max(0, targetCount - caughtCount)}</span>
        </span>
    );

    // --- Custom Drag Handling ---
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
        if (!isPlaying) return;

        // Prevent default browser drag only if it is not custom logic
        // But for MouseEvent we might need e.preventDefault() to stop text selection?
        // Actually for touch we definitely need to prevent scroll.

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        setDraggedAnimalId(id);
        draggingRef.current = {
            id,
            startX: clientX,
            startY: clientY,
            currentX: clientX,
            currentY: clientY
        };
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!draggingRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        draggingRef.current.currentX = clientX;
        draggingRef.current.currentY = clientY;

        // Visual update (direct DOM manipulation for performance or state? DOM is better for 60fps drag)
        const el = document.getElementById(`animal-${draggingRef.current.id}`);
        if (el) {
            const dx = clientX - draggingRef.current.startX;
            const dy = clientY - draggingRef.current.startY;
            el.style.transform = `translate(${dx}px, ${dy}px) scale(1.2)`;
        }

        // Check intersection with Net
        const netEl = document.getElementById('fishing-net');
        if (netEl) {
            const netRect = netEl.getBoundingClientRect();
            if (clientX >= netRect.left && clientX <= netRect.right &&
                clientY >= netRect.top && clientY <= netRect.bottom) {
                setNetHighlight(true);
            } else {
                setNetHighlight(false);
            }
        }
    };

    const handleDragEnd = () => {
        if (!draggingRef.current) return;

        // Check drop
        const netEl = document.getElementById('fishing-net');
        if (netEl) {
            const netRect = netEl.getBoundingClientRect();
            const { currentX, currentY } = draggingRef.current;

            if (currentX >= netRect.left && currentX <= netRect.right &&
                currentY >= netRect.top && currentY <= netRect.bottom) {
                // DROP SUCCESS
                handleCatch(draggingRef.current.id);
            }
        }

        // Reset
        const currentId = draggingRef.current.id;
        const el = document.getElementById(`animal-${currentId}`);
        if (el) {
            el.style.transform = ''; // Clear transform
        }

        const moveItem = movementRef.current[currentId];
        if (moveItem && draggingRef.current) {
            const dx = draggingRef.current.currentX - draggingRef.current.startX;
            const dy = draggingRef.current.currentY - draggingRef.current.startY;
            const pondRect = el?.parentElement?.getBoundingClientRect();
            const width = pondRect?.width || window.innerWidth;
            const height = pondRect?.height || window.innerHeight;
            moveItem.x = Math.max(0, Math.min(90, moveItem.x + (dx / width) * 100));
            moveItem.y = Math.max(0, Math.min(75, moveItem.y + (dy / height) * 100));
        }

        setDraggedAnimalId(null);
        setNetHighlight(false);
        draggingRef.current = null;
    };


    return (
        <Layout3
            title={t('games.math-fishing-count.title')}
            subtitle={t('games.math-fishing-count.subtitle')}
            gameId={GameIds.MATH_FISHING_COUNT}
            engine={layoutEngine as typeof useFishingCountLogicReturns}
            powerUps={[]} // No powerups for this Level 1 game yet
            target={{
                value: targetInline,
                label: t('games.math-fishing-count.ui.catchBadge')
            }}
            instructions={[
                { icon: '🎯', title: t('games.math-fishing-count.howToPlay.step1.title'), description: t('games.math-fishing-count.howToPlay.step1.description') },
                { icon: '🔢', title: t('games.math-fishing-count.howToPlay.step2.title'), description: t('games.math-fishing-count.howToPlay.step2.description') },
                { icon: '🎣', title: t('games.math-fishing-count.howToPlay.step3.title'), description: t('games.math-fishing-count.howToPlay.step3.description') },
            ]}
            onExit={onExit}
            cardBackground={<FishingBackground />}
            className="fishing-count-theme"
        >
            <div
                className="fishing-count-container"
                ref={containerRef}
                onMouseMove={handleDragMove}
                onTouchMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onTouchEnd={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >


                {/* Pond & Animals */}
                <div className="pond-area">
                    {animals.map(animal => (
                        <div
                            key={animal.id}
                            id={`animal-${animal.id}`}
                            className={`pond-animal ${draggedAnimalId === animal.id ? 'dragging' : ''}`}
                            style={{
                                left: `${animal.x}%`,
                                top: `${animal.y}%`,
                            }}
                            onMouseDown={(e) => handleDragStart(e, animal.id)}
                            onTouchStart={(e) => handleDragStart(e, animal.id)}
                        >
                            <span style={{
                                display: 'inline-block',
                                transform: animal.faceLeft ? 'scaleX(1)' : 'scaleX(-1)',
                                pointerEvents: 'none' // Ensure clicks go to parent
                            }}>
                                {animal.type}
                            </span>
                        </div>
                    ))}


                    {/* Net */}
                    <div
                        id="fishing-net"
                        className={`fishing-net-zone ${netHighlight ? 'highlight' : ''}`}
                    >
                        <div className="net-emoji">🕸️</div>
                        <div className="net-label">{t('games.math-fishing-count.ui.dropHere')}</div>
                    </div>
                </div>
            </div>
        </Layout3 >
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_FISHING_COUNT,
    title: 'Fishing Count',
    titleKey: 'games.math-fishing-count.title',
    subtitle: 'Count the fish!',
    subtitleKey: 'games.math-fishing-count.subtitle',
    description: 'Catch the requested number of fish.',
    descriptionKey: 'games.math-fishing-count.description',
    category: 'math',
    level: 1,
    component: FishingCount,
    thumbnail: '🎣'
};
