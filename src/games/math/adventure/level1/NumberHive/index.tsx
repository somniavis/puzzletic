import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useNumberHiveLogic } from './GameLogic';
import manifest_en from './locales/en';
import './NumberHive.css';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

interface NumberHiveProps {
    onExit: () => void;
}

export const NumberHive: React.FC<NumberHiveProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const useLogic = useNumberHiveLogic();
    const {
        currentLevel,
        currentNumber,
        handleCellClick,
        shakeId,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        usePowerUp,
        startGame,
        stopGame,
        isPlaying,
        gameOver,
        lives
    } = useLogic;

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'math-number-hive': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    // Force blur on problem change (Safari Focus Fix)
    useEffect(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, [currentNumber]);

    const derivedGameState = gameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle');

    const layoutEngine = {
        ...useLogic,
        gameState: derivedGameState,
        onPause: stopGame,
        onResume: startGame,
        onRestart: startGame,
        onExit: onExit,
        difficultyLevel: useLogic.difficultyLevel,
        maxLevel: 2
    };

    const powerUpConfig: PowerUpBtnProps[] = [
        {
            count: powerUps.timeFreeze,
            color: 'blue',
            icon: "❄️",
            title: "Freeze Time",
            onClick: () => usePowerUp('timeFreeze'),
            disabledConfig: timeFrozen,
            status: (timeFrozen ? 'active' : 'normal')
        },
        {
            count: powerUps.extraLife,
            color: 'red',
            icon: "❤️",
            title: "Extra Life",
            onClick: () => usePowerUp('extraLife'),
            disabledConfig: lives >= 3,
            status: (lives >= 3 ? 'maxed' : 'normal')
        },
        {
            count: powerUps.doubleScore,
            color: 'yellow',
            icon: "⚡",
            title: "Double Score",
            onClick: () => usePowerUp('doubleScore'),
            disabledConfig: doubleScoreActive,
            status: (doubleScoreActive ? 'active' : 'normal')
        }
    ];

    const beeDecorations: Array<{
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
        animationDelay: string;
        fontSize: string;
        opacity?: number;
        flipped?: boolean;
    }> = [
            { top: '8%', left: '8%', animationDelay: '0s', fontSize: '3rem', opacity: 0.1 },
            { top: '12%', right: '18%', animationDelay: '1.1s', fontSize: '2.4rem', opacity: 0.09, flipped: true },
            { top: '18%', left: '32%', animationDelay: '2.6s', fontSize: '1.7rem', opacity: 0.08 },
            { top: '22%', right: '6%', animationDelay: '3.4s', fontSize: '2.8rem', opacity: 0.1 },
            { top: '28%', left: '58%', animationDelay: '1.8s', fontSize: '2rem', opacity: 0.07, flipped: true },
            { top: '34%', left: '14%', animationDelay: '4.2s', fontSize: '2.2rem', opacity: 0.08 },
            { top: '38%', right: '24%', animationDelay: '2.1s', fontSize: '1.5rem', opacity: 0.07 },
            { top: '44%', left: '4%', animationDelay: '3.1s', fontSize: '2.6rem', opacity: 0.09, flipped: true },
            { top: '48%', right: '12%', animationDelay: '0.9s', fontSize: '1.9rem', opacity: 0.08 },
            { top: '54%', left: '42%', animationDelay: '4.6s', fontSize: '2.9rem', opacity: 0.1 },
            { top: '60%', right: '34%', animationDelay: '1.5s', fontSize: '1.6rem', opacity: 0.07, flipped: true },
            { top: '66%', left: '10%', animationDelay: '2.9s', fontSize: '2.3rem', opacity: 0.08 },
            { top: '70%', right: '6%', animationDelay: '3.8s', fontSize: '2.1rem', opacity: 0.08, flipped: true },
            { top: '74%', left: '26%', animationDelay: '1.3s', fontSize: '1.8rem', opacity: 0.07 },
            { top: '78%', right: '22%', animationDelay: '4.1s', fontSize: '2.7rem', opacity: 0.09 },
            { bottom: '24%', left: '18%', animationDelay: '2.4s', fontSize: '1.6rem', opacity: 0.06 },
            { bottom: '20%', right: '10%', animationDelay: '0.7s', fontSize: '2.5rem', opacity: 0.09, flipped: true },
            { bottom: '14%', left: '34%', animationDelay: '3.3s', fontSize: '2rem', opacity: 0.08 },
            { bottom: '10%', right: '28%', animationDelay: '1.9s', fontSize: '1.4rem', opacity: 0.06, flipped: true },
            { bottom: '6%', left: '50%', animationDelay: '4.8s', fontSize: '2.8rem', opacity: 0.09 }
        ];

    return (
        <Layout3
            title={t('games.math-number-hive.title')}
            subtitle={t('games.math-number-hive.subtitle')}
            gameId={GameIds.MATH_NUMBER_HIVE}
            engine={layoutEngine as any}
            instructions={[
                { icon: '🎯', title: t('games.math-number-hive.howToPlay.step1.title'), description: t('games.math-number-hive.howToPlay.step1.description') },
                { icon: '🔢', title: t('games.math-number-hive.howToPlay.step2.title'), description: t('games.math-number-hive.howToPlay.step2.description') },
                { icon: '🍯', title: t('games.math-number-hive.howToPlay.step3.title'), description: t('games.math-number-hive.howToPlay.step3.description') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
            target={{
                value: currentNumber,
                icon: "🐝"
            }}
        >
            {/* Game Content: Bees and Grid */}
            <div className="number-hive-container">
                {/* Bee Background Decors */}
                {beeDecorations.map((bee, idx) => (
                    <div
                        key={`bee-${idx}`}
                        className="bee-deco"
                        style={{
                            top: bee.top,
                            right: bee.right,
                            bottom: bee.bottom,
                            left: bee.left,
                            animationDelay: bee.animationDelay,
                            fontSize: bee.fontSize,
                            opacity: bee.opacity
                        }}
                    >
                        <span className={`bee-inner${bee.flipped ? ' bee-flipped' : ''}`}>🐝</span>
                    </div>
                ))}

                <div className="hive-grid-area">
                    {currentLevel && (
                        <div className={`honeycomb-container grid-${currentLevel.gridSize}`}>
                            {Array.from({ length: Math.ceil(currentLevel.cells.length / currentLevel.gridSize) }).map((_, rowIndex) => (
                                <div key={rowIndex} className={`hex-row ${rowIndex % 2 !== 0 ? 'even' : 'odd'}`}>
                                    {currentLevel.cells
                                        .slice(rowIndex * currentLevel.gridSize, (rowIndex + 1) * currentLevel.gridSize)
                                        .map((cell: any) => (
                                            <div
                                                key={cell.id}
                                                className={`hex-cell ${cell.isRevealed ? 'revealed' : ''} ${shakeId === cell.id ? 'shaking' : ''}`}
                                                onClick={() => handleCellClick(cell)}
                                            >
                                                {cell.value}
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_NUMBER_HIVE,
    title: 'Number Hive',
    titleKey: 'games.math-number-hive.title',
    subtitle: 'Find sequences!',
    subtitleKey: 'games.math-number-hive.subtitle',
    description: 'Find the numbers in order on the honeycomb grid.',
    descriptionKey: 'games.math-number-hive.description',
    category: 'math',
    level: 1, // Start level
    component: NumberHive,
    thumbnail: '🐝'
};
