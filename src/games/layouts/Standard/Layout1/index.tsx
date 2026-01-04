import React from 'react';
import { useSound } from '../../../../contexts/SoundContext';
import { useTranslation } from 'react-i18next';
import { playButtonSound, startBackgroundMusic } from '../../../../utils/sound';
import './Layout1.css';
import { useGameEngine } from '../Layout0/useGameEngine';
import type { MinigameDifficulty } from '../../../../types/gameMechanics';

// Shared Imports
import { useGameEffects } from '../shared/useGameEffects';
import { useGameScoring } from '../shared/useGameScoring';
import { GameLayoutHeader } from '../shared/GameLayoutHeader';
import { GameLayoutDashboard } from '../shared/GameLayoutDashboard';
import { GameStartScreen } from '../shared/GameStartScreen';
import { GameOverScreen } from '../shared/GameOverScreen';

interface Layout1Props {
    title: string;
    subtitle?: string;
    gameId?: string;
    description?: string;
    instructions?: { icon?: string; title: string; description: string }[];
    engine: ReturnType<typeof useGameEngine>;
    onExit: () => void;
    children: React.ReactNode;
    background?: React.ReactNode;
    cardBackground?: React.ReactNode;
}

export const Layout1: React.FC<Layout1Props> = ({
    title,
    subtitle,
    gameId,
    description,
    instructions,
    engine,
    onExit,
    children,
    background,
    cardBackground
}) => {
    const {
        gameState, score, lives, timeLeft,
        streak, bestStreak,
        stats,
        gameOverReason,
        startGame,
        lastEvent
    } = engine;

    const { settings, toggleBgm } = useSound();

    // 1. Effects (Particles, Shake, Sound)
    const { particles, showShake, showSuccessFlash } = useGameEffects(lastEvent);

    // 2. Scoring (HighScore, Rewards, Storage)
    const { rewardResult, highScore, prevBest, isNewRecord } = useGameScoring({
        gameState,
        score,
        lives,
        gameId,
        engineDifficulty: engine.difficultyLevel as MinigameDifficulty,
        stats: stats || { correct: 0, wrong: 0 }
    });

    // 3. BGM Management
    React.useEffect(() => {
        if (settings.bgmEnabled && (gameState === 'playing' || gameState === 'idle')) {
            startBackgroundMusic();
        }
    }, [gameState, settings.bgmEnabled]);

    // RENDER: Idle (Start Screen)
    if (gameState === 'idle') {
        return (
            <div className="layout1-container">
                {background && <div className="layout-background-layer">{background}</div>}
                <GameLayoutHeader
                    title={title}
                    bgmEnabled={settings.bgmEnabled}
                    onExit={onExit}
                    onToggleBgm={toggleBgm}
                    className="layout1-header"
                />
                <GameStartScreen
                    title={title}
                    subtitle={subtitle}
                    description={description}
                    instructions={instructions}
                    onStart={() => { playButtonSound(); startGame(); }}
                />
            </div>
        );
    }

    // RENDER: Game Over
    if (gameState === 'gameover') {
        return (
            <div className="layout1-container">
                {background && <div className="layout-background-layer">{background}</div>}
                <GameLayoutHeader
                    title={title}
                    bgmEnabled={settings.bgmEnabled}
                    onExit={onExit}
                    onToggleBgm={toggleBgm}
                    className="layout1-header"
                />
                <GameOverScreen
                    title={title}
                    gameOverReason={gameOverReason || 'time_up'}
                    score={score}
                    highScore={highScore}
                    prevBest={prevBest}
                    isNewRecord={isNewRecord}
                    bestStreak={bestStreak}
                    stats={stats}
                    rewardResult={rewardResult}
                    onRestart={() => { playButtonSound(); startGame(); }}
                />
            </div>
        );
    }

    // RENDER: Playing
    return (
        <div className="layout1-container">
            {background && <div className="layout-background-layer">{background}</div>}

            <GameLayoutHeader
                title={title}
                bgmEnabled={settings.bgmEnabled}
                onExit={onExit}
                onToggleBgm={toggleBgm}
                className="layout1-header"
            />

            <GameLayoutDashboard
                score={score}
                lives={lives}
                streak={streak}
                timeLeft={timeLeft}
                className="layout1-dashboard"
            />

            <main className="layout1-game-area">
                {cardBackground && <div className="layout-card-background">{cardBackground}</div>}

                <div className="layout1-grid-wrapper">
                    {children}
                </div>

                {/* Feedback Layers */}
                {particles.map(p => (
                    <div key={p.id} className="particle" style={{ left: `${p.x}%`, top: `${p.y}%`, animation: 'particleFloatUp 2s ease-out forwards' }}>
                        {p.emoji}
                    </div>
                ))}
                {showShake && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.2)', pointerEvents: 'none', borderRadius: '1rem', zIndex: 5000 }}><div style={{ fontSize: '4rem', animation: 'bounce 0.5s' }}>💔</div></div>}
                {showSuccessFlash && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(34, 197, 94, 0.2)', pointerEvents: 'none', borderRadius: '1rem', transition: 'opacity 0.2s ease-out', zIndex: 5000 }} />}
            </main>
        </div>
    );
};
