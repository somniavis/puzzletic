import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout0 } from '../../../layouts/Layout0';
import { useFishingCountLogic } from './GameLogic';
import manifest_en from './locales/en';
import './FishingCount.css';
import type { GameManifest } from '../../../types';

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
    const draggingRef = useRef<{ id: number; startX: number; startY: number; currentX: number; currentY: number } | null>(null);

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-fishing-count': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        // startGame handled by Layout start screen interaction
    }, []);

    // Force blur on target change (Safari Focus Fix)
    useEffect(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, [targetCount]);

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
        const el = document.getElementById(`animal-${draggingRef.current.id}`);
        if (el) {
            el.style.transform = ''; // Clear transform
        }

        setDraggedAnimalId(null);
        setNetHighlight(false);
        draggingRef.current = null;
    };


    return (
        <Layout0
            title={t('games.math-fishing-count.title')}
            subtitle={t('games.math-fishing-count.sub')}
            gameId="math-fishing-count"
            engine={layoutEngine as any} // Cast safely
            instructions={[
                { icon: '🐟', title: t('games.math-fishing-count.howToPlay.goal.title'), description: t('games.math-fishing-count.howToPlay.goal.desc') },
                { icon: '👆', title: t('games.math-fishing-count.howToPlay.action.title'), description: t('games.math-fishing-count.howToPlay.action.desc') },
                { icon: '🔢', title: t('games.math-fishing-count.howToPlay.math.title'), description: t('games.math-fishing-count.howToPlay.math.desc') }
            ]}
            onExit={onExit}
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
                {/* Header Info */}
                <div className="fishing-header">
                    <div className="target-info">
                        <span>Target:</span>
                        <span className="target-emoji-display">{targetAnimal}</span>
                        <span>x {targetCount - caughtCount}</span>
                    </div>
                </div>

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
                            {animal.type}
                        </div>
                    ))}


                    {/* Sand Ground */}
                    <div className="sand-ground"></div>

                    {/* Net */}
                    <div
                        id="fishing-net"
                        className={`fishing-net-zone ${netHighlight ? 'highlight' : ''}`}
                    >
                        <div className="net-emoji">🕸️</div>
                        <div className="net-label">DROP HERE</div>
                    </div>

                    {/* Coral & Decor Mix */}
                    <div className="rock-deco" style={{ left: '2%' }}>🪨</div>
                    <div className="coral-deco large" style={{ left: '8%' }}>🪸</div>
                    <div className="shell-deco" style={{ left: '18%' }}>🐚</div>
                    <div className="coral-deco small" style={{ left: '22%' }}>🪸</div>

                    {/* Moved coral further left to avoid Net intersection */}
                    <div className="coral-deco" style={{ left: '30%' }}>🪸</div>

                    <div className="coral-deco small" style={{ right: '35%' }}>🪸</div>

                    {/* Rocks: Diagonal overlap, Upper one bigger, Lower one smaller */}
                    <div className="rock-deco" style={{ right: '15%', bottom: '18px', fontSize: '3.2rem', zIndex: 0 }}>🪨</div>
                    <div className="rock-deco" style={{ right: '22%', bottom: '5px', fontSize: '2rem', zIndex: 2 }}>🪨</div>

                    <div className="coral-deco large" style={{ right: '5%' }}>🪸</div>
                    <div className="shell-deco" style={{ right: '2%' }}>🐚</div>
                </div>
            </div>
        </Layout0>
    );
};

export const manifest: GameManifest = {
    id: 'math-fishing-count',
    title: 'Fishing Count',
    titleKey: 'games.math-fishing-count.title',
    subtitle: 'Count the fish!',
    subtitleKey: 'games.math-fishing-count.sub',
    description: 'Catch the requested number of fish.',
    descriptionKey: 'games.math-fishing-count.desc',
    category: 'math',
    level: 1,
    component: FishingCount,
    thumbnail: '🎣'
};
