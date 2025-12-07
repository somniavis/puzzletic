import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Layout1';
import { useRoundCountingLogic } from './GameLogic';
import manifest_en from './locales/en';
import './RoundCounting.css';

interface RoundCountingProps {
    onExit: () => void;
}

export const RoundCounting: React.FC<RoundCountingProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const {
        gameState,
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
    } = useRoundCountingLogic();

    useEffect(() => {
        // Preload resources if needed
        const newResources = {
            en: { translation: { games: { 'math-01-round-counting': manifest_en } } }
        };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        // startGame(); // Removed to allow Start Screen
        return () => stopTimer();
    }, []);

    const layoutEngine = {
        gameState: gameState.gameOver ? 'gameover' : (gameState.isPlaying ? 'playing' : 'idle'),
        score: gameState.score,
        lives: gameState.lives,
        timeLeft: gameState.timeLeft,
        streak: gameState.streak,
        bestStreak: gameState.bestStreak,
        gameOverReason: gameState.gameOverReason,
        currentLevel: gameState.difficultyLevel,
        maxLevel: 3,
        startGame: startGame, // Required by Layout1 restart button
        onPause: stopTimer,
        onResume: startGame,
        onExit: onExit,
        onRestart: () => window.location.reload(),
        lastEvent: lastEvent
    };

    return (
        <Layout1
            title={t('games.math-01-round-counting.title')}
            subtitle={t('games.math-01-round-counting.sub')}
            engine={layoutEngine as any}
            instructions={[
                { icon: '🎯', title: t('games.math-01-round-counting.howToPlay.goal.title'), description: t('games.math-01-round-counting.howToPlay.goal.desc') },
                { icon: '👀', title: t('games.math-01-round-counting.howToPlay.challenge.title'), description: t('games.math-01-round-counting.howToPlay.challenge.desc') },
                { icon: '⚡', title: t('games.math-01-round-counting.howToPlay.powerups.title'), description: t('games.math-01-round-counting.howToPlay.powerups.desc') }
            ]}
            onExit={onExit}
        >
            <div className="responsive-game-container">
                {/* Power-ups */}
                <div className="w-full flex justify-start gap-4 mb-4 px-2">
                    <button
                        onClick={() => usePowerUp('timeFreeze')}
                        disabled={powerUps.timeFreeze === 0 || timeFrozen}
                        style={{ backgroundColor: powerUps.timeFreeze === 0 ? 'rgba(255, 255, 255, 0.3)' : undefined }}
                        className={`relative p-2 rounded-full transition-all text-white 
                            ${powerUps.timeFreeze === 0
                                ? 'backdrop-blur-sm cursor-not-allowed shadow-none border border-white/20'
                                : timeFrozen
                                    ? 'bg-blue-400 ring-4 ring-blue-200 shadow-md'
                                    : 'bg-blue-500 hover:bg-blue-600 shadow-md'}`}
                        title={t('games.math-01-round-counting.powerups.freeze')}
                    >
                        ❄️
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {powerUps.timeFreeze}
                        </span>
                    </button>
                    <button
                        onClick={() => usePowerUp('extraLife')}
                        disabled={powerUps.extraLife === 0 || gameState.lives >= 3}
                        style={{ backgroundColor: powerUps.extraLife === 0 ? 'rgba(255, 255, 255, 0.3)' : undefined }}
                        className={`relative p-2 rounded-full transition-all text-white
                            ${powerUps.extraLife === 0
                                ? 'backdrop-blur-sm cursor-not-allowed shadow-none border border-white/20'
                                : gameState.lives >= 3
                                    ? 'bg-red-300 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600 shadow-md'}`}
                        title={t('games.math-01-round-counting.powerups.life')}
                    >
                        ❤️
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {powerUps.extraLife}
                        </span>
                    </button>
                    <button
                        onClick={() => usePowerUp('doubleScore')}
                        disabled={powerUps.doubleScore === 0 || doubleScoreActive}
                        style={{ backgroundColor: powerUps.doubleScore === 0 ? 'rgba(255, 255, 255, 0.3)' : undefined }}
                        className={`relative p-2 rounded-full transition-all text-white
                            ${powerUps.doubleScore === 0
                                ? 'backdrop-blur-sm cursor-not-allowed shadow-none border border-white/20'
                                : doubleScoreActive
                                    ? 'bg-yellow-400 ring-4 ring-yellow-200 shadow-md'
                                    : 'bg-yellow-500 hover:bg-yellow-600 shadow-md'}`}
                        title={t('games.math-01-round-counting.powerups.double')}
                    >
                        ⚡
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {powerUps.doubleScore}
                        </span>
                    </button>
                </div>

                {currentProblem && (
                    <>
                        <div className="target-display-card">
                            <span className="text-gray-500 font-medium mr-2">
                                {t('games.math-01-round-counting.target', {
                                    count: currentProblem.targetCount - foundIds.length,
                                    emoji: ''
                                })}
                            </span>
                            <span className="target-emoji">{currentProblem.targetEmoji}</span>
                            <span className="text-3xl font-bold mx-2">x</span>
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
                                            disabled={isFound || isShuffling || gameState.gameOver}
                                            className={`grid-item-btn
                                                ${isFound ? 'grid-item-found animate-found' : ''}
                                                ${isIncorrect ? 'grid-item-wrong animate-shake' : ''}
                                                ${isShufflingItem ? 'grid-item-shuffling' : ''}
                                            `}
                                        >
                                            {item.emoji}
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
    id: 'math-01-round-counting',
    title: 'Round & Round Counting',
    titleKey: 'games.math-01-round-counting.title',
    subtitle: 'Find and Shuffle!',
    subtitleKey: 'games.math-01-round-counting.sub',
    description: 'Find the target items in the grid. Watch out, they move!',
    descriptionKey: 'games.math-01-round-counting.desc',
    category: 'math',
    level: 1,
    component: RoundCounting,
    thumbnail: '🔄' // Emoji placeholder
};
