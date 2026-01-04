import React, { useRef } from 'react';
import { useSound } from '../../../contexts/SoundContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Coins, Flame, Heart, Clock,
    Download, RotateCcw
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { playButtonSound, playJelloClickSound, playClearSound, playEatingSound, startBackgroundMusic } from '../../../utils/sound';
import './Layout2.css'; // Use Layout2 CSS
import { useGameEngine } from '../Layout0/useGameEngine';
import { useNurturing } from '../../../contexts/NurturingContext';
import { calculateMinigameReward } from '../../../services/rewardService';
import type { RewardCalculation, MinigameDifficulty } from '../../../types/gameMechanics';
import { PowerUpBtn } from '../../../components/Game/PowerUpBtn';
import type { PowerUpBtnProps } from '../../../components/Game/PowerUpBtn';

interface Layout2Props {
    title: string;
    subtitle?: string;
    gameId?: string;
    description?: string;
    instructions?: { icon?: string; title: string; description: string }[];
    engine: ReturnType<typeof useGameEngine>;
    onExit: () => void;
    children: React.ReactNode;
    // Props for Layout2 - PowerUps only, no Target
    powerUps: PowerUpBtnProps[];
    background?: React.ReactNode; // Optional Background Slot
    cardBackground?: React.ReactNode; // New: Background for the specific Game Card area
    className?: string; // Allow custom styling wrapper
}

export const Layout2: React.FC<Layout2Props> = ({
    title,
    subtitle,
    gameId,
    description,
    instructions,
    engine,
    onExit,
    children,
    powerUps,
    background,
    cardBackground,
    className
}) => {
    const {
        gameState, score, lives, timeLeft,
        streak, bestStreak,
        stats,
        gameOverReason,
        startGame
    } = engine;

    const { settings, toggleBgm } = useSound();

    React.useEffect(() => {
        if (settings.bgmEnabled && (gameState === 'playing' || gameState === 'idle')) {
            startBackgroundMusic();
        }
    }, [gameState, settings.bgmEnabled]);

    const lastEvent = (engine as any).lastEvent;
    const [showShake, setShowShake] = React.useState(false);
    const [showSuccessFlash, setShowSuccessFlash] = React.useState(false);

    const { evolutionStage, addRewards } = useNurturing();
    const [rewardResult, setRewardResult] = React.useState<RewardCalculation | null>(null);

    const [highScore, setHighScore] = React.useState<number>(0);
    const [prevBest, setPrevBest] = React.useState<number>(0);
    const initialBestRef = React.useRef<number>(0);
    const [isNewRecord, setIsNewRecord] = React.useState(false);

    const [particles, setParticles] = React.useState<{ id: number; emoji: string; x: number; y: number; }[]>([]);

    const generateParticles = (type: 'correct' | 'wrong', count = 10, emojiOverride?: string) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Math.random(),
                emoji: emojiOverride || (type === 'correct' ? ['🎉', '✨', '❤️', '💯', '🌟'][Math.floor(Math.random() * 5)] : '❌'),
                x: Math.random() * 100,
                y: Math.random() * 100
            });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    const { user } = useAuth();
    const getHighScoreKey = (gId: string) => user?.uid ? `minigame_highscore_${user.uid}_${gId}` : `minigame_highscore_${gId}`;

    React.useEffect(() => {
        if (gameId) {
            const savedkey = getHighScoreKey(gameId);
            const savedScore = localStorage.getItem(savedkey);
            if (savedScore) {
                const parsed = parseInt(savedScore, 10);
                setHighScore(parsed);
                initialBestRef.current = parsed;
            } else {
                setHighScore(0);
                initialBestRef.current = 0;
            }
        }
    }, [gameId, user?.uid]);

    React.useEffect(() => {
        if (gameState === 'gameover' && !rewardResult) {
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

            if (gameId) {
                const savedkey = getHighScoreKey(gameId);
                const currentScore = score;
                const storedScore = localStorage.getItem(savedkey);
                const currentBest = storedScore ? parseInt(storedScore, 10) : 0;
                const prevRecord = currentBest;

                if (currentScore > currentBest) {
                    localStorage.setItem(savedkey, currentScore.toString());
                    setPrevBest(prevRecord);
                    setHighScore(currentScore);
                    setIsNewRecord(true);
                    initialBestRef.current = currentScore;
                } else {
                    setHighScore(currentBest);
                    setIsNewRecord(false);
                    setPrevBest(currentBest);
                }
            }
        } else if (gameState === 'playing' || gameState === 'idle') {
            if (rewardResult) setRewardResult(null);
            setIsNewRecord(false);
        }
    }, [gameState, rewardResult, score, lives, engine.difficultyLevel, evolutionStage, addRewards, gameId, stats, user?.uid]);

    const processedEventIds = useRef<Set<number>>(new Set());

    React.useEffect(() => {
        if (lastEvent) {
            if (processedEventIds.current.has(lastEvent.id)) return;
            processedEventIds.current.add(lastEvent.id);

            if (lastEvent.type === 'correct') {
                const isFinal = lastEvent.isFinal !== false;
                if (isFinal) {
                    playClearSound();
                    generateParticles('correct', 20);
                    setShowSuccessFlash(true);
                    setTimeout(() => setShowSuccessFlash(false), 500);
                } else {
                    playEatingSound();
                    generateParticles('correct', 5, '✨');
                }
            } else if (lastEvent.type === 'wrong') {
                playJelloClickSound();
                setShowShake(true);
                setTimeout(() => setShowShake(false), 500);
            }
        }
    }, [lastEvent]);

    const { t } = useTranslation();
    const gameOverRef = useRef<HTMLDivElement>(null);

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

    if (gameState === 'idle') {
        return (
            <div className={`layout2-container ${className || ''}`}>
                {background && <div className="layout-background-layer">{background}</div>}
                <header className="layout2-header">
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
                            <h3 className="section-title">{t('common.howToPlay')}</h3>
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
                        <button className="start-btn" onClick={() => { playButtonSound(); startGame(); }}>▶ Start Game</button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        const earnedXp = rewardResult?.xpEarned || 0;
        const earnedGro = rewardResult?.groEarned || 0;
        return (
            <div className={`layout2-container ${className || ''}`}>
                {background && <div className="layout-background-layer">{background}</div>}
                <header className="layout2-header">
                    <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                    <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                        {settings.bgmEnabled ? '🎵' : '🔇'}
                    </button>
                </header>
                <div className="overlay-screen start-screen-layout">
                    <div className="game-over-header-compact">
                        <div className="game-over-icon">{gameOverReason === 'cleared' ? '🏆' : '🏁'}</div>
                        <h1 className="game-over-title">{gameOverReason === 'cleared' ? (t('common.stageClear') || 'Stage Clear!') : (t('common.gameOver') || 'Game Over!')}</h1>
                    </div>
                    <div ref={gameOverRef} className="start-content-scroll custom-scrollbar" style={{ marginTop: '0.5rem' }}>
                        <div className="result-cards-container">
                            <div className="result-card main-stats">
                                <div className="score-display-wrapper">
                                    <div className="score-display-large">
                                        <span className="score-label">{isNewRecord ? (t('common.newRecord') || 'NEW RECORD!') : (t('common.finalScore') || 'FINAL SCORE')}</span>
                                        <span className={`score-value-huge ${isNewRecord ? 'record-pulse' : ''}`}>{score}</span>
                                    </div>
                                    <div className="score-display-sub">
                                        <span className="sub-score-label">{isNewRecord ? (t('common.previousBest') || 'PREV BEST') : (t('common.bestScore') || 'BEST SCORE')}</span>
                                        <span className="sub-score-value">{isNewRecord ? prevBest : highScore}</span>
                                    </div>
                                </div>
                                <div className="sub-stats-row">
                                    <div className="sub-stat-item">
                                        <span className="sub-stat-label">{t('common.bestStreak') || 'BEST STREAK'}</span>
                                        <span className="sub-stat-value text-orange"><Flame size={18} /> {bestStreak}</span>
                                    </div>
                                    <div className="sub-stat-item">
                                        <span className="sub-stat-label">ACCURACY</span>
                                        <span className="sub-stat-value text-blue">
                                            {(() => {
                                                const total = (stats?.correct || 0) + (stats?.wrong || 0);
                                                return total > 0 ? Math.round(((stats?.correct || 0) / total) * 100) : 0;
                                            })()}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="rewards-grid-split">
                                <div className="reward-card-split xp"><span className="reward-icon">✨</span><span className="reward-amount text-purple">+{earnedXp}</span><span className="reward-label text-purple">XP</span></div>
                                <div className="reward-card-split gro"><span className="reward-icon">💰</span><span className="reward-amount text-yellow">+{earnedGro}</span><span className="reward-label text-yellow">GRO</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="start-footer-section">
                        <div className="game-over-buttons">
                            <button className="restart-btn" onClick={() => { playButtonSound(); startGame(); }} style={{ marginTop: 0, flex: 1 }}><RotateCcw size={32} /></button>
                            <button className="download-btn" onClick={() => { playButtonSound(); handleDownload(); }}><Download size={32} /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`layout2-container ${className || ''}`}>
            {/* Background Layer */}
            {background && <div className="layout-background-layer">{background}</div>}

            <header className="layout2-header">
                <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                <div className="header-title">{title}</div>
                <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                    {settings.bgmEnabled ? '🎵' : '🔇'}
                </button>
            </header>

            <div className="layout2-dashboard">
                <div className="stats-grid-row">
                    <div className="stat-card score-card">
                        <div className="stat-label">{t('common.score')}</div>
                        <div className="stat-value"><Coins size={16} className="text-yellow-500" /> {score}</div>
                    </div>
                    <div className="stat-card lives-card">
                        <div className="stat-label">{t('common.lives')}</div>
                        <div className="stat-value">
                            {[...Array(3)].map((_, i) => (
                                <Heart key={i} size={16} fill={i < lives ? "#ef4444" : "none"} color={i < lives ? "#ef4444" : "#cbd5e1"} />
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

            <main className="layout2-game-area">
                {/* Card Background Layer */}
                {cardBackground && <div className="layout-card-background">{cardBackground}</div>}

                {/* Layout2 Specific: PowerUps ONLY (No Target) */}
                <div className="layout2-sub-header">
                    <div className="powerup-row">
                        {powerUps.map((p, idx) => (
                            <PowerUpBtn key={idx} {...p} />
                        ))}
                    </div>
                </div>

                {/* Game Area Wrapper (Centered) */}
                <div className="layout2-grid-wrapper">
                    {children}
                </div>

                {/* Particles/Feedback */}
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
