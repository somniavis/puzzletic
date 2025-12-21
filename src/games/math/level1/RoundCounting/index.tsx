import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Layout1';
import { useRoundCountingLogic } from './GameLogic';
import manifest_en from './locales/en';
import './RoundCounting.css';

interface RoundCountingProps {
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
                backgroundColor: '#facc15', // yellow-400
                color: '#000000',
                transform: 'scale(1.1)',
                zIndex: 10
            };
        }
        if (isActuallyDisabled) {
            // Disabled (0 count): Glass effect
            return {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: '#9CA3AF', // Gray-400 for visibility (was white)
                cursor: 'not-allowed',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            };
        }
        // Normal/Maxed state
        return {
            backgroundColor: colors[color][status === 'maxed' ? 'maxed' : 'normal'],
            color: '#ffffff',
            cursor: status === 'maxed' ? 'not-allowed' : 'pointer'
        };
    };

    const handleClick = () => {
        if (disabledConfig || count === 0) return;
        onClick();
    };

    // Base layout classes
    const baseClasses = "relative p-2 rounded-full transition-all shadow-md flex items-center justify-center";
    // Add ring for active state
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
            <span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                style={{ zIndex: 20 }}
            >
                {count}
            </span>
        </button>
    );
};

export const RoundCounting: React.FC<RoundCountingProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const useRoundCountingLogicReturns = useRoundCountingLogic();
    const {
        // Flattened GameState properties
        score,
        lives,
        timeLeft,
        streak,
        bestStreak,
        gameOver, // Use correct property name
        isPlaying,
        gameOverReason,
        difficultyLevel,
        stats,

        currentProblem,
        foundIds,
        incorrectClickIndex,
        isShuffling,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        handleItemClick,
        usePowerUp,
        stopTimer,
        lastEvent
    } = useRoundCountingLogicReturns;

    useEffect(() => {
        // Preload resources
        const newResources = { en: { translation: { games: { 'math-round-counting': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        // startGame handled by Layout start screen interaction
        return () => stopTimer();
    }, []);

    const derivedGameState = gameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle');

    const layoutEngine = {
        ...useRoundCountingLogicReturns,
        gameState: derivedGameState, // Use derived state
        score,
        lives,
        timeLeft,
        streak,
        bestStreak,
        gameOverReason,
        difficultyLevel,
        maxLevel: 3,
        startGame: startGame,
        onPause: stopTimer,
        onResume: startGame,
        onExit: onExit,
        onRestart: () => window.location.reload(),
        lastEvent: lastEvent,
        stats
    };

    return (
        <Layout1
            title={t('games.math-round-counting.title')}
            subtitle={t('games.math-round-counting.sub')}
            gameId="math-round-counting"
            engine={layoutEngine as any}
            instructions={[
                { icon: '⚪', title: t('games.math-round-counting.howToPlay.goal.title'), description: t('games.math-round-counting.howToPlay.goal.desc') },
                { icon: '👆', title: t('games.math-round-counting.howToPlay.action.title'), description: t('games.math-round-counting.howToPlay.action.desc') },
                { icon: '🔢', title: t('games.math-round-counting.howToPlay.math.title'), description: t('games.math-round-counting.howToPlay.math.desc') }
            ]}
            onExit={onExit}
        >
            <div className="responsive-game-container">
                {/* Power-ups */}
                <div className="w-full flex justify-start gap-4 mb-4 px-4">
                    <PowerUpBtn
                        count={powerUps.timeFreeze}
                        color="blue"
                        icon="❄️"
                        title={t('games.math-round-counting.powerups.freeze')}
                        onClick={() => usePowerUp('timeFreeze')}
                        disabledConfig={timeFrozen}
                        status={timeFrozen ? 'active' : 'normal'}
                    />
                    <PowerUpBtn
                        count={powerUps.extraLife}
                        color="red"
                        icon="❤️"
                        title={t('games.math-round-counting.powerups.life')}
                        onClick={() => usePowerUp('extraLife')}
                        disabledConfig={lives >= 3}
                        status={lives >= 3 ? 'maxed' : 'normal'} // Use flattened lives
                    />
                    <PowerUpBtn
                        count={powerUps.doubleScore}
                        color="yellow"
                        icon="⚡"
                        title={t('games.math-round-counting.powerups.double')}
                        onClick={() => usePowerUp('doubleScore')}
                        disabledConfig={doubleScoreActive}
                        status={doubleScoreActive ? 'active' : 'normal'}
                    />
                </div>

                {currentProblem && (
                    <>
                        <div className="target-display-card">
                            <span className="target-emoji">{currentProblem.targetEmoji}</span>
                            <span className="target-count">{currentProblem.targetCount - foundIds.length}</span>
                        </div>
                        <div className="grid-wrapper">
                            <div
                                className="round-counting-grid"
                                style={{ '--grid-cols': currentProblem.cols } as React.CSSProperties}
                            >
                                {currentProblem.gridItems.map((item, index) => {
                                    const isFound = foundIds.includes(item.id);
                                    const isIncorrect = incorrectClickIndex === index;
                                    const isShufflingItem = isShuffling;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleItemClick(index)}
                                            disabled={isFound || isShuffling || gameOver} // Use flattened gameOver
                                            className={`grid-item-btn
                                                ${isFound ? 'grid-item-found animate-found' : ''}
                                                ${isIncorrect ? 'grid-item-wrong animate-shake' : ''}
                                                ${isShufflingItem ? 'grid-item-shuffling' : ''}
                                            `}
                                        >
                                            <span className="emoji-content">{item.emoji}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout1>
    );
};

import type { GameManifest } from '../../../types';

export const manifest: GameManifest = {
    id: 'math-round-counting',
    title: 'Round Counting',
    titleKey: 'games.math-round-counting.title',
    subtitle: 'Count the circles!',
    subtitleKey: 'games.math-round-counting.sub',
    description: 'Count items within the circle.',
    descriptionKey: 'games.math-round-counting.desc',
    category: 'math',
    level: 1,
    component: RoundCounting,
    thumbnail: '🔢' // Emoji placeholder
};
