import React, { useRef } from 'react';
import { useSound } from '../../../../contexts/SoundContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Coins, Flame, Heart, Clock
} from 'lucide-react';
import { playButtonSound, playJelloClickSound, playClearSound, playEatingSound, startBackgroundMusic } from '../../../../utils/sound';
import './Layout0.css';
import { useGameEngine } from './useGameEngine';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { calculateMinigameReward } from '../../../../services/rewardService';
import type { RewardCalculation, MinigameDifficulty } from '../../../../types/gameMechanics';
import { GameOverScreen } from '../shared/GameOverScreen';

interface Layout0Props {
    title: string;
    subtitle?: string;
    gameId?: string; // Optional for backward compatibility, but recommended
    description?: string;
    instructions?: { icon?: string; title: string; description: string }[];
    engine: ReturnType<typeof useGameEngine>;
    onExit: () => void;
    children: React.ReactNode;
}

export const Layout0: React.FC<Layout0Props> = ({
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
        combo, bestCombo,
        stats, // Destructure stats
        gameOverReason,
        startGame
    } = engine;

    const { settings, toggleBgm } = useSound();

    // Enforce BGM Playback when game is active or idle (if enabled)
    // This fixes issues where BGM stops (e.g. after Game Over) and doesn't resume strictly via SoundContext
    React.useEffect(() => {
        if (settings.bgmEnabled && (gameState === 'playing' || gameState === 'idle')) {
            startBackgroundMusic();
        }
    }, [gameState, settings.bgmEnabled]);

    const lastEvent = (engine as any).lastEvent;

    // Manage overlapping animation bursts
    // const [activeBursts, setActiveBursts] = React.useState<{ id: number; type: 'correct' | 'wrong' }[]>([]); // Replaced by Particles

    const [showShake, setShowShake] = React.useState(false);
    const [showSuccessFlash, setShowSuccessFlash] = React.useState(false);

    const { evolutionStage, addRewards } = useNurturing();
    const [rewardResult, setRewardResult] = React.useState<RewardCalculation | null>(null);

    // High Score State
    const [highScore, setHighScore] = React.useState<number>(0);
    const [prevBest, setPrevBest] = React.useState<number>(0);
    const initialBestRef = React.useRef<number>(0); // Store initial best for stable comparison
    const [isNewRecord, setIsNewRecord] = React.useState(false);

    // Particle System
    const [particles, setParticles] = React.useState<{ id: number; emoji: string; x: number; y: number; vx: number; vy: number; }[]>([]);

    // Debug: Log particle count
    React.useEffect(() => {
        if (particles.length > 0) {
            console.log('Layout0: Particles active:', particles.length);
        }
    }, [particles]);

    const generateParticles = (type: 'correct' | 'wrong', count = 10, emojiOverride?: string) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Math.random(),
                // 정답일 때 사용할 이모지들
                emoji: emojiOverride || (type === 'correct' ? ['🎉', '✨', '❤️', '💯', '🌟'][Math.floor(Math.random() * 5)] : '❌'),
                x: Math.random() * 100, // 화면 가로 위치 (%)
                y: Math.random() * 100, // 화면 세로 위치 (%)
                vx: (Math.random() - 0.5) * 4, // 가로 속도
                vy: (Math.random() - 0.5) * 4  // 세로 속도
            });
        }
        setParticles(newParticles);
        // 2초 뒤에 입자들을 제거하여 메모리 관리
        setTimeout(() => setParticles([]), 2000);
    };

    // Load High Score on Mount
    const { user } = useAuth();

    // User-specific storage key helper
    const getHighScoreKey = (gId: string) => {
        if (user?.uid) {
            return `minigame_highscore_${user.uid}_${gId}`;
        }
        return `minigame_highscore_${gId}`;
    };

    React.useEffect(() => {
        if (gameId) {
            const savedkey = getHighScoreKey(gameId);
            const savedScore = localStorage.getItem(savedkey);
            if (savedScore) {
                const parsed = parseInt(savedScore, 10);
                setHighScore(parsed);
                initialBestRef.current = parsed; // Capture stable initial best
            } else {
                // Reset if no score found for this user (crucial for user switching)
                setHighScore(0);
                initialBestRef.current = 0;
            }
        }
    }, [gameId, user?.uid]);

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
                const savedkey = getHighScoreKey(gameId);
                const currentScore = score;

                // Get fresh high score from storage for accurate comparison
                const storedScore = localStorage.getItem(savedkey);
                const currentBest = storedScore ? parseInt(storedScore, 10) : 0;

                // Use stableBest for "Prev Best" display if we break the record
                // If it's the first time playing on this device/account (0), Prev Best will be 0.
                const prevRecord = currentBest;

                if (currentScore > currentBest) {
                    localStorage.setItem(savedkey, currentScore.toString());
                    setPrevBest(prevRecord);
                    setHighScore(currentScore);
                    setIsNewRecord(true);

                    // Update the ref for next round within the same mount session
                    initialBestRef.current = currentScore;
                } else {
                    setHighScore(currentBest);
                    setIsNewRecord(false);
                    // Ensure prevBest is not displayed as 0 if it's just a normal game
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
            // Prevent duplicate processing of the same event ID
            if (processedEventIds.current.has(lastEvent.id)) return;
            processedEventIds.current.add(lastEvent.id);

            if (lastEvent.type === 'correct') {
                // Progressive Feedback Logic
                // If isFinal is explicitly false, it is an intermediate step (small feedback)
                // If isFinal is true OR undefined, it is a final step/single-step game (big feedback)
                const isFinal = lastEvent.isFinal !== false;

                if (isFinal) {
                    // Final / Round Clear: Big Feedback
                    playClearSound(); // Cleaning Sound
                    generateParticles('correct', 20); // More particles for celebration
                    setShowSuccessFlash(true);
                    setTimeout(() => setShowSuccessFlash(false), 500);
                } else {
                    // Intermediate: Small Feedback
                    // Use a lighter sound (e.g., eating or button click)
                    // Currently using Eating sound as requested/suggested
                    playEatingSound();
                    generateParticles('correct', 5, '✨'); // Fewer, smaller particles (Sparkles)
                }
            } else if (lastEvent.type === 'wrong') {
                playJelloClickSound();
                setShowShake(true);
                setTimeout(() => setShowShake(false), 500);
            }
        }
    }, [lastEvent]);

    const { t } = useTranslation();

    // Render Start Screen
    if (gameState === 'idle') {
        return (
            <div className="layout0-container">
                <header className="layout0-header">
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
                            ▶ {t('common.startGame')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Game Over Screen
    if (gameState === 'gameover') {
        return (
            <div className="layout0-container">
                <header className="layout0-header">
                    <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                    <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                        {settings.bgmEnabled ? '🎵' : '🔇'}
                    </button>
                </header>

                <GameOverScreen
                    title={title}
                    gameOverReason={gameOverReason || 'time_up'}
                    score={score}
                    highScore={highScore}
                    prevBest={prevBest}
                    isNewRecord={isNewRecord}
                    bestCombo={bestCombo}
                    stats={stats}
                    rewardResult={rewardResult}
                    onRestart={() => { playButtonSound(); startGame(); }}
                />
            </div>
        );
    }

    // Render Playing State
    return (
        <div className="layout0-container">
            <header className="layout0-header">
                <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                <div className="header-title">{title}</div>
                <button className="icon-btn" onClick={() => { playButtonSound(); toggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                    {settings.bgmEnabled ? '🎵' : '🔇'}
                </button>
            </header>

            <div className="layout0-dashboard">
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
                    <div className="stat-card combo-card">
                        <div className="stat-label">{t('common.combo')}</div>
                        <div className="stat-value"><Flame size={16} className="text-orange-500" /> {combo}</div>
                    </div>
                    <div className="stat-card time-card">
                        <div className="stat-label">{t('common.time')}</div>
                        <div className="stat-value" style={{ color: timeLeft < 10 ? '#ef4444' : '#1e293b' }}>
                            <Clock size={16} /> {timeLeft}
                        </div>
                    </div>
                </div>
            </div>

            <main className="layout0-game-area">
                <div className="content-wrapper">
                    {children}
                </div>

                {/* Feedback Overlay (Correct/Wrong) - Particles */}
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            animation: 'particleFloatUp 2s ease-out forwards' // 아래의 float 애니메이션 적용
                        }}
                    >
                        {p.emoji}
                    </div>
                ))}

                {showShake && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(239, 68, 68, 0.2)',
                        pointerEvents: 'none', borderRadius: '1rem',
                        zIndex: 5000
                    }}>
                        <div style={{ fontSize: '4rem', animation: 'bounce 0.5s' }}>💔</div>
                    </div>
                )}

                {showSuccessFlash && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(34, 197, 94, 0.2)', // green-500 equivalent with opacity
                        pointerEvents: 'none', borderRadius: '1rem',
                        transition: 'opacity 0.2s ease-out',
                        zIndex: 5000
                    }} />
                )}
            </main>
        </div>
    );
};
