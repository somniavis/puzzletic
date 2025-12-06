import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Trophy, Coins, Flame, Heart, Clock,
    Download, RotateCcw
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { playButtonSound, playJelloClickSound } from '../../../utils/sound';
import './Layout1.css';
import { useGameEngine } from './useGameEngine';

interface Layout1Props {
    title: string;
    subtitle?: string;
    description?: string;
    instructions?: { icon?: string; title: string; description: string }[];
    engine: ReturnType<typeof useGameEngine>;
    onExit: () => void;
    children: React.ReactNode;
}

export const Layout1: React.FC<Layout1Props> = ({
    title,
    subtitle,
    description,
    instructions,
    engine,
    onExit,
    children
}) => {
    const {
        gameState, score, lives, timeLeft,
        streak, bestStreak, difficultyLevel,
        gameOverReason,
        startGame
    } = engine;

    const { t } = useTranslation();
    // Removed local sound state to use global system settings
    const gameOverRef = useRef<HTMLDivElement>(null);

    // Play sound on effects
    React.useEffect(() => {
        if (gameState === 'correct') {
            playJelloClickSound();
        }
    }, [gameState]);

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
                    {/* Sound Toggle removed - using system settings */}
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
        return (
            <div className="layout1-container">
                <header className="layout1-header">
                    <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
                </header>

                <div className="overlay-screen">
                    <div ref={gameOverRef} className="overlay-content" style={{ minWidth: '300px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '3rem' }}>
                                {gameOverReason === 'cleared' ? '🏆' : '🏁'}
                            </div>
                            <div style={{ fontSize: '3rem' }}>
                                {gameOverReason === 'cleared' ? '🏆' : '🏁'}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155' }}>
                                {t('common.gameOver')}
                            </h2>
                        </div>

                        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{t('common.finalScore')}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Coins className="text-yellow-500" /> {score}
                            </div>
                        </div>

                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1rem' }}>
                            <div className="stat-card">
                                <div className="stat-label">{t('common.bestStreak')}</div>
                                <div className="stat-value"><Flame size={16} color="#f97316" /> {bestStreak}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">{t('common.difficulty')}</div>
                                <div className="stat-value"><Trophy size={16} color="#a855f7" /> {difficultyLevel}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button className="restart-btn" onClick={() => { playButtonSound(); startGame(); }} style={{ flex: 1 }}>
                                <RotateCcw size={20} /> {t('common.playAgain')}
                            </button>
                            <button className="icon-btn" onClick={() => { playButtonSound(); handleDownload(); }} style={{ borderRadius: '0.5rem', width: '3rem', background: '#e2e8f0' }}>
                                <Download size={20} />
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
                <div style={{ fontWeight: 700, color: '#334155' }}>{title}</div>
            </header>

            <div className="layout1-dashboard">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">{t('common.score')}</div>
                        <div className="stat-value"><Coins size={16} className="text-yellow-500" /> {score}</div>
                    </div>
                    <div className="stat-card">
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
                    <div className="stat-card">
                        <div className="stat-label">{t('common.streak')}</div>
                        <div className="stat-value"><Flame size={16} className="text-orange-500" /> {streak}</div>
                    </div>
                </div>

                <div className="timer-bar-container">
                    <Clock size={16} />
                    <span className="timer-text">{timeLeft}s</span>
                    <div className="timer-track">
                        <div
                            className="timer-fill"
                            style={{
                                width: `${(timeLeft / 60) * 100}%`,
                                background: timeLeft < 10 ? '#ef4444' : '#22c55e'
                            }}
                        />
                    </div>
                </div>
            </div>

            <main className="layout1-game-area">
                <div className="content-wrapper">
                    {children}
                </div>

                {/* Feedback Overlay (Correct/Wrong) - Translucent */}
                {(gameState === 'correct' || gameState === 'wrong') && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: gameState === 'correct' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        pointerEvents: 'none', borderRadius: '1rem'
                    }}>
                        <div style={{
                            fontSize: '4rem',
                            animation: 'bounce 0.5s'
                        }}>
                            {gameState === 'correct' ? '🎉' : '💔'}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
