import React, { useRef } from 'react';
import './SharedStyles.css';
import { Flame, Download, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import { playButtonSound } from '../../../../utils/sound';
import type { RewardCalculation } from '../../../../types/gameMechanics';

interface GameOverProps {
    title: string;
    gameOverReason: string;
    score: number;
    highScore: number;
    prevBest: number;
    isNewRecord: boolean;
    bestCombo: number;
    stats?: { correct: number; wrong: number };
    rewardResult: RewardCalculation | null;
    onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverProps> = ({
    title,
    gameOverReason,
    score,
    highScore,
    prevBest,
    isNewRecord,
    bestCombo,
    stats,
    rewardResult,
    onRestart
}) => {
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

    const earnedXp = rewardResult?.xpEarned || 0;
    const earnedGro = rewardResult?.groEarned || 0;

    return (
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
                                <span className="sub-stat-label">{t('common.bestCombo') || 'BEST STREAK'}</span>
                                <span className="sub-stat-value text-orange"><Flame size={18} /> {bestCombo}</span>
                            </div>
                            <div className="sub-stat-item">
                                <span className="sub-stat-label">{t('common.accuracy').toUpperCase()}</span>
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
                    <button className="restart-btn" onClick={() => { playButtonSound(); onRestart(); }} style={{ marginTop: 0, flex: 1 }}><RotateCcw size={32} /></button>
                    <button className="download-btn" onClick={() => { playButtonSound(); handleDownload(); }}><Download size={32} /></button>
                </div>
            </div>
        </div>
    );
};
