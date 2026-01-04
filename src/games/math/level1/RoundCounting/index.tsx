import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../layouts/Layout3';
import { useRoundCountingLogic } from './GameLogic';
import manifest_en from './locales/en';

import './RoundCounting.css';
import { BlobBackground } from '../../components/BlobBackground';
import type { GameManifest } from '../../../types';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

interface RoundCountingProps {
    onExit: () => void;
}

export const RoundCounting: React.FC<RoundCountingProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const useRoundCountingLogicReturns = useRoundCountingLogic();
    const {
        score,
        lives,
        timeLeft,
        streak,
        bestStreak,
        gameOver,
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
        const newResources = { en: { translation: { games: { 'math-round-counting': manifest_en } } } };
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

    useEffect(() => {
        return () => stopTimer();
    }, []);

    const derivedGameState = gameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle');

    const layoutEngine = {
        ...useRoundCountingLogicReturns,
        gameState: derivedGameState,
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

    const powerUpConfig: PowerUpBtnProps[] = [
        {
            count: powerUps.timeFreeze,
            color: "blue",
            icon: "❄️",
            title: t('games.math-round-counting.powerups.freeze'),
            onClick: () => usePowerUp('timeFreeze'),
            disabledConfig: timeFrozen,
            status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife,
            color: "red",
            icon: "❤️",
            title: t('games.math-round-counting.powerups.life'),
            onClick: () => usePowerUp('extraLife'),
            disabledConfig: lives >= 3,
            status: (lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore,
            color: "yellow",
            icon: "⚡",
            title: t('games.math-round-counting.powerups.double'),
            onClick: () => usePowerUp('doubleScore'),
            disabledConfig: doubleScoreActive,
            status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    const targetValue = currentProblem ? (currentProblem.targetCount - foundIds.length) : 0;

    return (
        <Layout3
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
            powerUps={powerUpConfig}
            target={{
                value: targetValue,
                icon: currentProblem?.targetEmoji || '❓'
            }}
            className="round-counting-theme"
        >
            <BlobBackground />
            <div className="responsive-game-container" style={{ padding: 0, position: 'relative', zIndex: 10 }}>
                {currentProblem && (
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
                                        key={`${item.id}-${currentProblem.targetCount}`}
                                        onClick={() => handleItemClick(index)}
                                        disabled={isFound || isShuffling || gameOver}
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
                )}
            </div>
        </Layout3>
    );
};

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
    thumbnail: '🌀'
};
