import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../layouts/Layout3';
import { useNumberHiveLogic } from './GameLogic';
import manifest_en from './locales/en';
import './NumberHive.css';
import type { GameManifest } from '../../../types';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

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

    return (
        <Layout3
            title={t('games.math-number-hive.title')}
            subtitle={t('games.math-number-hive.sub')}
            gameId="math-number-hive"
            engine={layoutEngine as any}
            instructions={[
                { icon: '🔢', title: t('games.math-number-hive.howToPlay.goal.title'), description: t('games.math-number-hive.howToPlay.goal.desc') },
                { icon: '👆', title: t('games.math-number-hive.howToPlay.action.title'), description: t('games.math-number-hive.howToPlay.action.desc') },
                { icon: '📜', title: t('games.math-number-hive.howToPlay.rule.title'), description: t('games.math-number-hive.howToPlay.rule.desc') }
            ]}
            onExit={onExit}
            powerUps={powerUpConfig}
            target={{
                value: currentNumber,
                icon: "🐝"
            }}
        >
            {/* Game Content: Bees and Grid */}
            <>
                {/* Bee Background Decors */}
                <div className="bee-deco" style={{ top: '10%', left: '10%' }}>
                    <span className="bee-inner">🐝</span>
                </div>
                <div className="bee-deco" style={{ bottom: '20%', right: '10%', animationDelay: '1s' }}>
                    <span className="bee-inner bee-flipped">🐝</span>
                </div>
                <div className="bee-deco" style={{ top: '40%', right: '5%', animationDelay: '2s', fontSize: '2rem' }}>
                    <span className="bee-inner">🐝</span>
                </div>
                <div className="bee-deco" style={{ top: '60%', left: '5%', animationDelay: '3s', fontSize: '2.5rem' }}>
                    <span className="bee-inner bee-flipped">🐝</span>
                </div>
                <div className="bee-deco" style={{ bottom: '10%', left: '30%', animationDelay: '1.5s', fontSize: '1.5rem', opacity: 0.05 }}>
                    <span className="bee-inner">🐝</span>
                </div>
                <div className="bee-deco" style={{ top: '15%', right: '30%', animationDelay: '4s', fontSize: '2.2rem' }}>
                    <span className="bee-inner bee-flipped">🐝</span>
                </div>

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
            </>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: 'math-number-hive',
    title: 'Number Hive',
    titleKey: 'games.math-number-hive.title',
    subtitle: 'Find sequences!',
    subtitleKey: 'games.math-number-hive.sub',
    description: 'Find the numbers in order on the honeycomb grid.',
    descriptionKey: 'games.math-number-hive.desc',
    category: 'math',
    level: 1, // Start level
    component: NumberHive,
    thumbnail: '🐝'
};
