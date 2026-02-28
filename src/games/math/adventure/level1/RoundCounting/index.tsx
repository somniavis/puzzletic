import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useRoundCountingLogic } from './GameLogic';
import manifest_en from './locales/en';

import './RoundCounting.css';
import { BlobBackground } from '../../../components/BlobBackground';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

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
        combo,
        bestCombo,
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
        usePowerUp: activatePowerUp,
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
    }, [stopTimer]);

    const derivedGameState = gameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle');

    const layoutEngine = {
        ...useRoundCountingLogicReturns,
        gameState: derivedGameState,
        score,
        lives,
        timeLeft,
        combo,
        bestCombo,
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
            onClick: () => activatePowerUp('timeFreeze'),
            disabledConfig: timeFrozen,
            status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife,
            color: "red",
            icon: "❤️",
            title: t('games.math-round-counting.powerups.life'),
            onClick: () => activatePowerUp('extraLife'),
            disabledConfig: lives >= 3,
            status: (lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore,
            color: "yellow",
            icon: "⚡",
            title: t('games.math-round-counting.powerups.double'),
            onClick: () => activatePowerUp('doubleScore'),
            disabledConfig: doubleScoreActive,
            status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    const targetValue = currentProblem ? (currentProblem.targetCount - foundIds.length) : 0;
    const targetInline = (
        <span className="round-target-inline">
            <span className="round-target-inline-emoji">{currentProblem?.targetEmoji || '❓'}</span>
            <span className="round-target-inline-number">{targetValue}</span>
        </span>
    );

    return (
        <Layout3
            title={t('games.math-round-counting.title')}
            subtitle={t('games.math-round-counting.subtitle')}
            gameId={GameIds.MATH_ROUND_COUNTING}
            engine={layoutEngine as typeof useRoundCountingLogicReturns}
            instructions={[
                { icon: '🎯', title: t('games.math-round-counting.howToPlay.step1.title'), description: t('games.math-round-counting.howToPlay.step1.description') },
                { icon: '👆', title: t('games.math-round-counting.howToPlay.step2.title'), description: t('games.math-round-counting.howToPlay.step2.description') },
                { icon: '🔄', title: t('games.math-round-counting.howToPlay.step3.title'), description: t('games.math-round-counting.howToPlay.step3.description') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
            target={{
                value: targetInline,
                label: currentProblem
                    ? t('games.math-round-counting.ui.clinks')
                    : t('games.math-round-counting.ui.ready')
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

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_ROUND_COUNTING,
    title: 'Round Counting',
    titleKey: 'games.math-round-counting.title',
    subtitle: 'Count the circles!',
    subtitleKey: 'games.math-round-counting.subtitle',
    description: 'Count items within the circle.',
    descriptionKey: 'games.math-round-counting.description',
    category: 'math',
    level: 1,
    component: RoundCounting,
    thumbnail: '🌀'
};
