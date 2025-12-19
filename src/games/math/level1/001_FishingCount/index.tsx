import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Layout1';
import { useFishingCountLogic } from './GameLogic';
import manifest_en from './locales/en';
import './FishingCount.css';
import type { GameManifest } from '../../../types';

interface FishingCountProps {
    onExit: () => void;
}

export const FishingCount: React.FC<FishingCountProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const {
        gameState,
        targetAnimal,
        targetCount,
        caughtCount,
        animals,
        containerRef,
        startGame,
        stopGame,
        handleCatch,
        lastEvent
    } = useFishingCountLogic();

    const [draggedAnimalId, setDraggedAnimalId] = useState<number | null>(null);
    const [netHighlight, setNetHighlight] = useState(false);
    const draggingRef = useRef<{ id: number; startX: number; startY: number; currentX: number; currentY: number } | null>(null);

    useEffect(() => {
        // Load locales
        const newResources = {
            en: { translation: { games: { 'math-01-fishing-count': manifest_en } } }
        };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });

        return () => stopGame();
    }, []);

    // Layout Engine Adaptor
    const layoutEngine = {
        gameState: gameState.isGameOver ? 'gameover' : (gameState.isPlaying ? 'playing' : 'idle'),
        score: gameState.score,
        lives: gameState.lives,
        timeLeft: gameState.timeLeft,
        streak: gameState.streak,
        bestStreak: gameState.bestStreak,
        gameOverReason: gameState.gameOverReason,
        difficultyLevel: 1,
        maxLevel: 1,
        startGame: startGame,
        onPause: stopGame,
        onResume: startGame, // Resume logic same as start for now/simple pause
        onExit: onExit,
        onRestart: startGame,
        lastEvent: lastEvent
    };

    // --- Custom Drag Handling ---
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
        if (!gameState.isPlaying) return;

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
        <Layout1
            title={t('games.math-01-fishing-count.title')}
            subtitle={t('games.math-01-fishing-count.sub')}
            gameId="math-01-fishing-count"
            engine={layoutEngine as any}
            instructions={[
                { icon: '🎯', title: t('games.math-01-fishing-count.howToPlay.goal.title'), description: t('games.math-01-fishing-count.howToPlay.goal.desc') },
                { icon: '👆', title: t('games.math-01-fishing-count.howToPlay.controls.title'), description: t('games.math-01-fishing-count.howToPlay.controls.desc') }
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

                    {/* Coral Decorations */}
                    <div className="coral-deco large" style={{ left: '5%' }}>🪸</div>
                    <div className="coral-deco small" style={{ left: '15%' }}>🪸</div>
                    <div className="coral-deco" style={{ left: '25%' }}>🪸</div>

                    <div className="coral-deco small" style={{ right: '25%' }}>🪸</div>
                    <div className="coral-deco large" style={{ right: '10%' }}>🪸</div>
                    <div className="coral-deco" style={{ right: '5%' }}>🪸</div>
                </div>
            </div>
        </Layout1>
    );
};

export const manifest: GameManifest = {
    id: 'math-01-fishing-count',
    title: 'Fishing Count',
    titleKey: 'games.math-01-fishing-count.title',
    subtitle: 'Catch them all!',
    subtitleKey: 'games.math-01-fishing-count.sub',
    description: 'Learn counting by fishing sea friends.',
    descriptionKey: 'games.math-01-fishing-count.desc',
    category: 'math',
    level: 1,
    component: FishingCount,
    thumbnail: '🎣'
};
