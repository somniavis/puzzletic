import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../layouts/Layout3';
import { useDeepSeaLogic } from './GameLogic';
import { DeepSeaBackground } from '../../components/DeepSeaBackground';
import manifest_en from './locales/en';
import './DeepSeaDive.css';
import type { GameManifest } from '../../../types';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

interface DeepSeaDiveProps {
    onExit: () => void;
}

export const DeepSeaDive: React.FC<DeepSeaDiveProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const gameLogic = useDeepSeaLogic();
    const {
        stats, isPlaying, gameOver, lives,
        currentProblem, currentAnimal, isDiving,
        startGame, stopTimer, handleAnswer, lastEvent, diveTargetIndex,
        powerUps: logicPowerUps, usePowerUp, timeFrozen, doubleScoreActive
    } = gameLogic;

    // Load translations
    React.useEffect(() => {
        const newResources = { en: { translation: { games: { 'deep-sea-dive': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        return () => stopTimer();
    }, []);

    // Memoize engine to prevent re-renders
    const engine = React.useMemo(() => ({
        ...gameLogic,
        stats: { correct: stats.correct, wrong: stats.wrong },
        gameState: gameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle'),
        maxLevel: 3,
        onPause: stopTimer,
        onResume: startGame,
        onExit: onExit,
        onRestart: () => window.location.reload(),
        currentProblem: currentProblem
    }), [gameLogic, stats, gameOver, isPlaying, currentProblem, stopTimer, startGame, onExit]);

    // Memoize PowerUps config
    const powerUps: PowerUpBtnProps[] = React.useMemo(() => [
        {
            title: t('games.deep-sea-dive.powerups.timeFreeze'),
            icon: '❄️',
            color: 'blue',
            count: logicPowerUps.timeFreeze,
            status: timeFrozen ? 'active' : 'normal',
            disabledConfig: logicPowerUps.timeFreeze <= 0 || timeFrozen,
            onClick: () => usePowerUp('freeze')
        },
        {
            title: t('games.deep-sea-dive.powerups.extraLife'),
            icon: '❤️',
            color: 'red',
            count: logicPowerUps.extraLife,
            status: lives >= 3 ? 'maxed' : 'normal',
            disabledConfig: logicPowerUps.extraLife <= 0 || lives >= 3,
            onClick: () => usePowerUp('extraLife')
        },
        {
            title: t('games.deep-sea-dive.powerups.doubleScore'),
            icon: '⚡',
            color: 'yellow',
            count: logicPowerUps.doubleScore,
            status: doubleScoreActive ? 'active' : 'normal',
            disabledConfig: logicPowerUps.doubleScore <= 0 || doubleScoreActive,
            onClick: () => usePowerUp('doubleScore')
        }
    ], [t, logicPowerUps, timeFrozen, lives, doubleScoreActive, usePowerUp]);

    // Helper for vertical position calculation
    const getVerticalPosition = (index: number | null | undefined): string => {
        if (index === null || index === undefined) return '-8%';
        return `${16.6 + (index * 33.3)}%`;
    };

    return (
        <Layout3
            title={t('games.deep-sea-dive.title')}
            subtitle={t('games.deep-sea-dive.sub')}
            gameId="deep-sea-dive"
            engine={engine as any} // Layout3 types might drag
            powerUps={powerUps}
            onExit={onExit}
            target={{
                value: currentProblem?.equation || "Ready?",
                icon: "🤿"
            }}
            instructions={[
                { icon: '🔢', title: t('games.deep-sea-dive.howToPlay.goal.title'), description: t('games.deep-sea-dive.howToPlay.goal.desc') },
                { icon: '👇', title: t('games.deep-sea-dive.howToPlay.action.title'), description: t('games.deep-sea-dive.howToPlay.action.desc') },
                { icon: '🌊', title: t('games.deep-sea-dive.howToPlay.rule.title'), description: t('games.deep-sea-dive.howToPlay.rule.desc') }
            ]}
        >
            <>
                <DeepSeaBackground />
                <div className="deep-sea-game-container">
                    {/* Left: Diver */}
                    <div className="diver-area">
                        {currentAnimal && (
                            <div
                                className={`diver-animal 
                                    ${isDiving ? 'diving' : ''} 
                                    ${lastEvent?.type === 'correct' ? 'correct-anim' : ''}
                                    ${lastEvent?.type === 'wrong' ? 'wrong-anim' : ''}
                                `}
                                style={{
                                    top: getVerticalPosition(diveTargetIndex)
                                } as React.CSSProperties}
                            >
                                {currentAnimal}
                            </div>
                        )}
                        {isDiving && (
                            <div
                                className="splash"
                                style={{ top: getVerticalPosition(diveTargetIndex || 0) }}
                            >
                                🤿
                            </div>
                        )}
                    </div>

                    {/* Right: Depth Gauge (Options) */}
                    <div className="depth-gauge">
                        {/* Render options if game is playing, otherwise generic ticks */}
                        {/* Idle State Placeholders or Active Options */}
                        <div className="gauge-spacer" /> {/* Top Spacer (flex 1) */}

                        {(isPlaying && currentProblem) ? (
                            currentProblem.options.map((opt, idx) => (
                                <React.Fragment key={`${opt}-${currentProblem.equation}`}>
                                    {idx > 0 && <div className="gauge-rope" />} {/* Rope between items (flex 2) */}
                                    <div
                                        className="depth-marker"
                                        onClick={() => handleAnswer(opt, idx)}
                                    >
                                        {opt}
                                    </div>
                                </React.Fragment>
                            ))
                        ) : (
                            // Idle State
                            <>
                                <div className="depth-marker">?</div>
                                <div className="gauge-rope" />
                                <div className="depth-marker">?</div>
                                <div className="gauge-rope" />
                                <div className="depth-marker">?</div>
                            </>
                        )}

                        <div className="gauge-spacer" /> {/* Bottom Spacer (flex 1) */}
                    </div>
                </div>
            </>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: 'deep-sea-dive',
    title: 'Deep Sea Dive',
    titleKey: 'games.deep-sea-dive.title',
    subtitle: 'Dive deep with correct answers!',
    subtitleKey: 'games.deep-sea-dive.sub',
    description: 'Solve the subtraction problem and choose the correct depth to dive.',
    descriptionKey: 'games.deep-sea-dive.desc',
    category: 'math',
    level: 2,
    component: DeepSeaDive,
    thumbnail: '🤿'
};
