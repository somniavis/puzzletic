import React, { useRef } from 'react';
import { useSound } from '../../../contexts/SoundContext';
import { useTranslation } from 'react-i18next';
import {
    Coins, Flame, Heart, Clock,
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
        streak, bestStreak,
        gameOverReason,
        startGame
    } = engine;

    const { t } = useTranslation();
    const { settings, toggleBgm } = useSound();
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
        const earnedXp = score;
        const earnedGlo = Math.floor(score * 0.1);

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
                        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                            {gameOverReason === 'cleared' ? '🏆' : '🏁'}
                        </div>
                        <h1 className="game-title">{t('common.gameOver') || 'Game Over!'}</h1>
                    </div>

                    <div ref={gameOverRef} className="start-content-scroll custom-scrollbar">
                        <div className="how-to-play-box result-box">
                            <h3 className="section-title">{t('common.results') || 'Final Results'}</h3>

                            <div className="result-grid">
                                <div className="result-item highlight">
                                    <span className="result-label">{t('common.finalScore') || 'Final Score'}</span>
                                    <span className="result-value text-blue" style={{ color: '#b45309' }}>
                                        <Coins size={24} className="text-yellow-500" fill="#f59e0b" /> {score}
                                    </span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">{t('common.bestStreak') || 'Best Streak'}</span>
                                    <span className="result-value text-orange">
                                        <Flame size={20} className="text-orange-500" /> {bestStreak}
                                    </span>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="result-grid">
                                <div className="result-item">
                                    <span className="result-label">{t('common.earnedXp') || 'Earned XP'}</span>
                                    <span className="result-value text-purple">
                                        <span>✨</span> +{earnedXp}
                                    </span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">{t('common.earnedGlo') || 'Earned Glo'}</span>
                                    <span className="result-value text-yellow">
                                        <span>💰</span> +{earnedGlo}
                                    </span>
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
