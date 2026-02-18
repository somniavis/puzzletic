import React from 'react';
import { useSound } from '../../../../contexts/SoundContext';
import { startBackgroundMusic } from '../../../../utils/sound';
import './Layout3.css';
import { useGameEngine } from '../Layout0/useGameEngine';
import type { MinigameDifficulty } from '../../../../types/gameMechanics';
import { PowerUpBtn } from '../../../../components/Game/PowerUpBtn';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

// Shared Imports
import { useGameEffects } from '../shared/useGameEffects';
import { useGameScoring } from '../shared/useGameScoring';
import { GameLayoutHeader } from '../shared/GameLayoutHeader';
import { GameLayoutDashboard } from '../shared/GameLayoutDashboard';
import { GameStartScreen } from '../shared/GameStartScreen';
import { GameOverScreen } from '../shared/GameOverScreen';

interface Layout3Props {
    title: string;
    subtitle?: string;
    gameId?: string;
    description?: string;
    instructions?: { icon?: string; title: string; description: string }[];
    engine: ReturnType<typeof useGameEngine>;
    onExit: () => void;
    children: React.ReactNode;
    powerUps: PowerUpBtnProps[];
    target: { value: React.ReactNode; icon?: string; label?: string; overlay?: React.ReactNode; };
    background?: React.ReactNode;
    cardBackground?: React.ReactNode;
    className?: string;
}

export const Layout3: React.FC<Layout3Props> = ({
    title,
    subtitle,
    gameId,
    description,
    instructions,
    engine,
    onExit,
    children,
    powerUps,
    target,
    background,
    cardBackground,
    className
}) => {
    const renderTargetValue = React.useCallback((value: React.ReactNode) => {
        if (typeof value !== 'string' && typeof value !== 'number') return value;

        const text = String(value);
        const parts = text.split(/([+\-×÷=xX?])/g).filter((part) => part.length > 0);

        return (
            <>
                {parts.map((part, idx) => {
                    const isOperator = /^[+\-×÷=xX?]$/.test(part);
                    return (
                        <span
                            key={`${part}-${idx}`}
                            className={isOperator ? 'target-token-operator' : 'target-token-number'}
                        >
                            {part}
                        </span>
                    );
                })}
            </>
        );
    }, []);

    const {
        gameState, score, lives, timeLeft,
        combo, bestCombo,
        stats,
        gameOverReason,
        startGame,
        lastEvent
    } = engine;

    const { settings, toggleBgm } = useSound();

    // 1. Effects
    const { particles, showShake, showSuccessFlash } = useGameEffects(lastEvent);

    // 2. Scoring
    const { rewardResult, highScore, prevBest, isNewRecord } = useGameScoring({
        gameState,
        score,
        lives,
        gameId,
        engineDifficulty: engine.difficultyLevel as MinigameDifficulty,
        stats: stats || { correct: 0, wrong: 0 },
        gameOverReason
    });

    // 3. BGM Management
    React.useEffect(() => {
        if (settings.bgmEnabled && (gameState === 'playing' || gameState === 'idle')) {
            startBackgroundMusic();
        }
    }, [gameState, settings.bgmEnabled]);

    // RENDER: Idle
    if (gameState === 'idle') {
        return (
            <div className={`layout3-container ${className || ''}`}>
                {background && <div className="layout-background-layer">{background}</div>}
                <GameLayoutHeader title={title} bgmEnabled={settings.bgmEnabled} onExit={onExit} onToggleBgm={toggleBgm} className="layout3-header" />
                <GameStartScreen title={title} subtitle={subtitle} description={description} instructions={instructions} onStart={() => { startGame(); }} />
            </div>
        );
    }

    // RENDER: Game Over
    if (gameState === 'gameover') {
        return (
            <div className={`layout3-container ${className || ''}`}>
                {background && <div className="layout-background-layer">{background}</div>}
                <GameLayoutHeader title={title} bgmEnabled={settings.bgmEnabled} onExit={onExit} onToggleBgm={toggleBgm} className="layout3-header" />
                <GameOverScreen title={title} gameOverReason={gameOverReason || 'time_up'} score={score} highScore={highScore} prevBest={prevBest} isNewRecord={isNewRecord} bestCombo={bestCombo} stats={stats} rewardResult={rewardResult} onRestart={() => { startGame(); }} />
            </div>
        );
    }

    // RENDER: Playing
    return (
        <div className={`layout3-container ${className || ''}`}>
            {background && <div className="layout-background-layer">{background}</div>}

            <GameLayoutHeader title={title} bgmEnabled={settings.bgmEnabled} onExit={onExit} onToggleBgm={toggleBgm} className="layout3-header" />

            {/* Layout3 uses standard dashboard */}
            <GameLayoutDashboard score={score} lives={lives} combo={combo} timeLeft={timeLeft} className="layout3-dashboard" />

            <main className="layout3-game-area">
                {cardBackground && <div className="layout-card-background">{cardBackground}</div>}

                {/* Layout3 Specific: Common Header (PowerUps + Target) */}
                <div className="layout3-sub-header">
                    <div className="powerup-row">
                        {powerUps.map((p, idx) => (
                            <PowerUpBtn key={idx} {...p} />
                        ))}
                    </div>
                    <div className={`target-display-card ${target.label ? 'with-label' : ''}`}>
                        {target.icon && <span className="target-emoji">{target.icon}</span>}
                        <span className="target-count">{renderTargetValue(target.value)}</span>
                        {target.label && <span className="target-pill">{target.label}</span>}
                        {target.overlay && (
                            <div className="target-overlay-layer" aria-live="polite">
                                {target.overlay}
                            </div>
                        )}
                    </div>
                </div>

                <div className="layout3-grid-wrapper">
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
