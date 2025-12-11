import React, { useRef } from 'react';
import { useSound } from '../../../contexts/SoundContext';
import { useTranslation } from 'react-i18next';
import {
    Coins, Flame, Heart, Clock,
    Download, RotateCcw
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { playButtonSound, playJelloClickSound, playClearSound } from '../../../utils/sound';
import './Layout1.css';
import { useGameEngine } from './useGameEngine';
import { useNurturing } from '../../../contexts/NurturingContext';
import { calculateMinigameReward } from '../../../services/rewardService';
import type { RewardCalculation, MinigameDifficulty } from '../../../types/gameMechanics';

interface Layout1Props {
    title: string;
    subtitle?: string;
    gameId?: string; // Optional for backward compatibility, but recommended
    description?: string;
    instructions?: { icon?: string; title: string; description: string }[];
    engine: ReturnType<typeof useGameEngine>;
    onExit: () => void;
    children: React.ReactNode;
}

export const Layout1: React.FC<Layout1Props> = ({
    title,
    subtitle,
    gameId,
    description,
    instructions,
    engine,
    onExit,
    children
}) => {
    const {
        gameState, score, lives, timeLeft,
        streak, bestStreak,
        stats, // Destructure stats
        gameOverReason,
        startGame
    } = engine;

    const lastEvent = (engine as any).lastEvent;

    // Manage overlapping animation bursts
    const [activeBursts, setActiveBursts] = React.useState<{ id: number; type: 'correct' | 'wrong' }[]>([]);
    const [showShake, setShowShake] = React.useState(false);

    const { evolutionStage, addRewards } = useNurturing();
    const [rewardResult, setRewardResult] = React.useState<RewardCalculation | null>(null);

    // High Score State
    const [highScore, setHighScore] = React.useState<number>(0);
    const [prevBest, setPrevBest] = React.useState<number>(0);
    const initialBestRef = React.useRef<number>(0); // Store initial best for stable comparison
    const [isNewRecord, setIsNewRecord] = React.useState(false);

    // Load High Score on Mount
    React.useEffect(() => {
        if (gameId) {
            const savedkey = `minigame_highscore_${gameId}`;
            const savedScore = localStorage.getItem(savedkey);
            if (savedScore) {
                const parsed = parseInt(savedScore, 10);
                setHighScore(parsed);
                initialBestRef.current = parsed; // Capture stable initial best
            }
        }
    }, [gameId]);

    // Calculate and award rewards on Game Over + Check High Score
    React.useEffect(() => {
        if (gameState === 'gameover' && !rewardResult) {
            // ... existing reward logic ...
            const totalAttempts = (stats?.correct || 0) + (stats?.wrong || 0);
            const accuracyVal = totalAttempts > 0 ? (stats?.correct || 0) / totalAttempts : 0;

            const calculated = calculateMinigameReward({
                difficulty: engine.difficultyLevel as MinigameDifficulty,
                accuracy: accuracyVal,
                isPerfect: lives === 3,
                masteryBonus: 1.0
            }, evolutionStage as any);

            setRewardResult(calculated);
            addRewards(calculated.xpEarned, calculated.groEarned);

            // High Score Logic
            if (gameId) {
                const savedkey = `minigame_highscore_${gameId}`;
                const currentScore = score;
                // Compare against stable ref, not live localStorage which might be updated by strict mode double-run
                const stableBest = initialBestRef.current;

                if (currentScore > stableBest) {
                    localStorage.setItem(savedkey, currentScore.toString());
                    setPrevBest(stableBest);
                    setHighScore(currentScore);
                    setIsNewRecord(true);
                } else {
                    setHighScore(stableBest);
                    setIsNewRecord(false);
                }
            }
        } else if (gameState === 'playing' || gameState === 'idle') {
            if (rewardResult) setRewardResult(null);
            setIsNewRecord(false);
        }
    }, [gameState, rewardResult, score, lives, engine.difficultyLevel, evolutionStage, addRewards, gameId, stats]);

    React.useEffect(() => {
        if (lastEvent) {
            if (lastEvent.type === 'correct') {
                const newBurst = { id: lastEvent.id, type: lastEvent.type };
                setActiveBursts(prev => [...prev, newBurst as any]);
                // Remove after 2.5s (animation duration + buffer)
                setTimeout(() => {
                    setActiveBursts(prev => prev.filter(b => b.id !== newBurst.id));
                }, 2500);
            } else if (lastEvent.type === 'wrong') {
                setShowShake(true);
                setTimeout(() => setShowShake(false), 500);
            }
        }
    }, [lastEvent]);

    const { t } = useTranslation();
    const { settings, toggleBgm } = useSound();
    const gameOverRef = useRef<HTMLDivElement>(null);

    // Play sound on effects (migrated from singular state)
    React.useEffect(() => {
        if (lastEvent?.type === 'correct') {
            playClearSound();
        } else if (lastEvent?.type === 'wrong') {
            playJelloClickSound();
        }
    }, [lastEvent]);
    // Remove old sound effect dependency on gameState
    // React.useEffect(() => { if (gameState === 'correct') playJelloClickSound(); }, [gameState]); 

    const handleDownload = async () => {
        if (!gameOverRef.current) return;
        try {
            const dataUrl = await toPng(gameOverRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-result.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    // Render Start Screen
    if (gameState === 'idle') {
        return (
            <div className="layout1-container">
                <header className="layout1-header">
                    <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                    <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                        {settings.bgmEnabled ? '🎵' : '🔇'}
                    </button>
                </header>

                <div className="overlay-screen start-screen-layout">
                    <div className="start-header-section">
                        <h1 className="game-title">{title}</h1>
                        {subtitle && <h2 className="game-subtitle">{subtitle}</h2>}
                    </div>

                    <div className="start-content-scroll custom-scrollbar">
                        <div className="how-to-play-box">
                            <h3 className="section-title">{t('common.howToPlay') || 'How to Play'}</h3>
                            {description && <p className="game-description-text">{description}</p>}

                            {instructions && instructions.length > 0 && (
                                <div className="instructions-list">
                                    {instructions.map((inst, index) => (
                                        <div key={index} className="instruction-item">
                                            {inst.icon && <span className="instruction-icon">{inst.icon}</span>}
                                            <div className="instruction-text">
                                                <strong>{inst.title}</strong>
                                                <p>{inst.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="start-footer-section">
                        <button className="start-btn" onClick={() => { playButtonSound(); startGame(); }}>
                            ▶ Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Game Over Screen
    if (gameState === 'gameover') {
        const earnedXp = rewardResult?.xpEarned || 0;
        const earnedGro = rewardResult?.groEarned || 0;

        return (
            <div className="layout1-container">
                <header className="layout1-header">
                    <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                    <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                        {settings.bgmEnabled ? '🎵' : '🔇'}
                    </button>
                </header>

                <div className="overlay-screen start-screen-layout">
                    {/* Compact Header */}
                    <div className="game-over-header-compact">
                        <div className="game-over-icon">
                            {gameOverReason === 'cleared' ? '🏆' : '🏁'}
                        </div>
                        <h1 className="game-over-title">
                            {gameOverReason === 'cleared' ? (t('common.stageClear') || 'Stage Clear!') : (t('common.gameOver') || 'Game Over!')}
                        </h1>
                    </div>

                    <div ref={gameOverRef} className="start-content-scroll custom-scrollbar" style={{ marginTop: '0.5rem' }}>
                        <div className="result-cards-container">

                            {/* Box 1: Game Stats */}
                            {/* Box 1: Game Stats */}
                            <div className="result-card main-stats">
                                <div className="score-display-wrapper">
                                    {/* Left Side: ALWAYS Final Score (Big) */}
                                    <div className="score-display-large">
                                        <span className="score-label">
                                            {isNewRecord ? (t('common.newRecord') || 'NEW RECORD!') : (t('common.finalScore') || 'FINAL SCORE')}
                                        </span>
                                        <span className={`score-value-huge ${isNewRecord ? 'record-pulse' : ''}`}>
                                            {score}
                                        </span>
                                    </div>

                                    {/* Right Side: ALWAYS Best/Prev Score (Small) */}
                                    <div className="score-display-sub">
                                        <span className="sub-score-label">
                                            {isNewRecord ? (t('common.previousBest') || 'PREV BEST') : (t('common.bestScore') || 'BEST SCORE')}
                                        </span>
                                        <span className="sub-score-value">
                                            {isNewRecord ? prevBest : highScore}
                                        </span>
                                    </div>
                                </div>
                                <div className="sub-stats-row">
                                    <div className="sub-stat-item">
                                        <span className="sub-stat-label">{t('common.bestStreak') || 'BEST STREAK'}</span>
                                        <span className="sub-stat-value text-orange">
                                            <Flame size={18} className="text-orange-500" /> {bestStreak}
                                        </span>
                                    </div>
                                    <div className="sub-stat-item">
                                        <span className="sub-stat-label">ACCURACY</span>
                                        <span className="sub-stat-value text-blue">
                                            {/* Display calculated accuracy from render time (or use stats directly if loop risk) */}
                                            {(() => {
                                                const total = (stats?.correct || 0) + (stats?.wrong || 0);
                                                return total > 0 ? Math.round(((stats?.correct || 0) / total) * 100) : 0;
                                            })()}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Rewards (Split & Colored) */}
                            <div className="rewards-grid-split">
                                <div className="reward-card-split xp">
                                    <span className="reward-icon">✨</span>
                                    <span className="reward-amount text-purple">+{earnedXp}</span>
                                    <span className="reward-label text-purple">XP</span>
                                </div>
                                <div className="reward-card-split gro">
                                    <span className="reward-icon">💰</span>
                                    <span className="reward-amount text-yellow">+{earnedGro}</span>
                                    <span className="reward-label text-yellow">GRO</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="start-footer-section">
                        <div className="game-over-buttons">
                            <button className="restart-btn" onClick={() => { playButtonSound(); startGame(); }} style={{ marginTop: 0, flex: 1 }}>
                                <RotateCcw size={32} strokeWidth={2.5} />
                            </button>

                            <button className="download-btn" onClick={() => { playButtonSound(); handleDownload(); }} title="Download Result">
                                <Download size={32} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render Playing State
    return (
        <div className="layout1-container">
            <header className="layout1-header">
                <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                <div className="header-title">{title}</div>
                <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                    {settings.bgmEnabled ? '🎵' : '🔇'}
                </button>
            </header>

            <div className="layout1-dashboard">
                <div className="stats-grid-row">
                    <div className="stat-card score-card">
                        <div className="stat-label">{t('common.score')}</div>
                        <div className="stat-value"><Coins size={16} className="text-yellow-500" /> {score}</div>
                    </div>
                    <div className="stat-card lives-card">
                        <div className="stat-label">{t('common.lives')}</div>
                        <div className="stat-value">
                            {[...Array(3)].map((_, i) => (
                                <Heart key={i} size={16}
                                    fill={i < lives ? "#ef4444" : "none"}
                                    color={i < lives ? "#ef4444" : "#cbd5e1"}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="stat-card streak-card">
                        <div className="stat-label">{t('common.streak')}</div>
                        <div className="stat-value"><Flame size={16} className="text-orange-500" /> {streak}</div>
                    </div>
                    <div className="stat-card time-card">
                        <div className="stat-label">Time</div>
                        <div className="stat-value" style={{ color: timeLeft < 10 ? '#ef4444' : '#1e293b' }}>
                            <Clock size={16} /> {timeLeft}
                        </div>
                    </div>
                </div>
            </div>

            <main className="layout1-game-area">
                <div className="content-wrapper">
                    {children}
                </div>

                {/* Feedback Overlay (Correct/Wrong) - Overlapping Bursts */}
                {activeBursts.map(burst => (
                    <React.Fragment key={burst.id}>
                        {/* Spawn multiple stars with random offsets */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="celebration-star"
                                style={{
                                    left: `${50 + (Math.random() * 60 - 30)}%`,
                                    top: `${50 + (Math.random() * 60 - 30)}%`,
                                    animationDelay: `${Math.random() * 0.2}s`,
                                    fontSize: `${0.8 + Math.random() * 1.2}rem`
                                }}
                            >
                                🌟
                            </div>
                        ))}
                    </React.Fragment>
                ))}

                {showShake && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(239, 68, 68, 0.2)',
                        pointerEvents: 'none', borderRadius: '1rem'
                    }}>
                        <div style={{ fontSize: '4rem', animation: 'bounce 0.5s' }}>💔</div>
                    </div>
                )}
            </main>
        </div>
    );
};
