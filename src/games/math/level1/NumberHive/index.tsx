import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Layout1';
import { useNumberHiveLogic } from './GameLogic';
import manifest_en from './locales/en';
import './NumberHive.css';
import type { GameManifest } from '../../../types';

interface NumberHiveProps {
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
                width: '3.5rem', height: '2rem', // Fixed size
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
                backgroundColor: '#facc15', // yellow-400
                color: '#000000',
                transform: 'scale(1.1)',
                zIndex: 10,
                border: '1px solid #eab308', // Darker yellow border
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' // Floating shadow
            };
        }
        if (isActuallyDisabled) {
            // Disabled (0 count): White Card style (Empty Slot look)
            return {
                width: '3.5rem', height: '2rem', // Fixed size
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
                backgroundColor: '#ffffff', // White background
                color: '#e5e7eb', // Gray-200 for placeholder icon (faint)
                cursor: 'not-allowed',
                border: '1px solid #e5e7eb', // Faint border
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // Subtle shadow for empty state
            };
        }
        // Normal/Maxed state
        return {
            width: '3.5rem', height: '2rem', // Fixed size
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
            backgroundColor: colors[color][status === 'maxed' ? 'maxed' : 'normal'],
            color: '#ffffff',
            cursor: status === 'maxed' ? 'not-allowed' : 'pointer',
            border: '1px solid rgba(0,0,0,0.1)', // Border for definition
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // Standard shadow
        };
    };

    const handleClick = () => {
        if (disabledConfig || count === 0) return;
        onClick();
    };

    // Base layout classes
    // Base layout classes: Fixed width/height
    // Base layout classes: Fixed width/height
    const baseClasses = "relative w-14 h-8 rounded-xl transition-all shadow-md flex items-center justify-center flex-shrink-0 powerup-btn";
    // Add ring for active state
    const activeClasses = isHereActive ? "ring-4 ring-yellow-200" : "";

    return (
        <button
            onClick={handleClick}
            disabled={isActuallyDisabled}
            style={{
                ...getButtonStyle(),
                backgroundColor: isHereActive ? '#facc15' : (isActuallyDisabled ? 'rgba(255, 255, 255, 0.3)' : colors[color][status === 'maxed' ? 'maxed' : 'normal'])
            }}
            className={`${baseClasses} ${activeClasses}`}
            title={title}
        >
            {icon}
            <span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none shadow-sm"
                style={{ zIndex: 20 }}
            >
                {count}
            </span>
        </button>
    );
};


export const NumberHive: React.FC<NumberHiveProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const useLogic = useNumberHiveLogic(); // Call hook directly
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
        // Load translations
        const newResources = { en: { translation: { games: { 'math-number-hive': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    // Derived Game State for Layout Adapter
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

    return (
        <Layout1
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
        >
            <div className="number-hive-container">
                {/* Header Information */}
                <div className="hive-header">
                    {/* Power-ups Row */}
                    <div className="powerup-row">
                        <PowerUpBtn
                            count={powerUps.timeFreeze}
                            color="blue"
                            icon="❄️"
                            title="Freeze Time"
                            onClick={() => usePowerUp('timeFreeze')}
                            disabledConfig={timeFrozen}
                            status={timeFrozen ? 'active' : 'normal'}
                        />
                        <PowerUpBtn
                            count={powerUps.extraLife}
                            color="red"
                            icon="❤️"
                            title="Extra Life"
                            onClick={() => usePowerUp('extraLife')}
                            disabledConfig={lives >= 3}
                            status={lives >= 3 ? 'maxed' : 'normal'}
                        />
                        <PowerUpBtn
                            count={powerUps.doubleScore}
                            color="yellow"
                            icon="⚡"
                            title="Double Score"
                            onClick={() => usePowerUp('doubleScore')}
                            disabledConfig={doubleScoreActive}
                            status={doubleScoreActive ? 'active' : 'normal'}
                        />
                    </div>

                    {/* Target Display matched to Round Counting */}
                    <div className="target-display-card">
                        <span className="target-emoji">🎯</span>
                        <span className="target-count">{currentNumber}</span>
                    </div>
                </div>

                {/* Game Area */}
                <div className="hive-grid-area">
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
                    {/* New Bees */}
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
                            {/* Group cells into rows for controlled staggering */}
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
        </Layout1>
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
