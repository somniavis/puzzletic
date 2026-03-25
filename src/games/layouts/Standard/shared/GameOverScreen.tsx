import React, { useEffect, useMemo, useRef, useState } from 'react';
import './SharedStyles.css';
import { Flame, Download, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import { playButtonSound, playJelloClickSound } from '../../../../utils/sound';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../data/characters';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import type { RewardCalculation } from '../../../../types/gameMechanics';
import type { CharacterAction, EvolutionStage } from '../../../../types/character';
import type { CSSProperties } from 'react';

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

interface RewardCardViewModel {
    key: 'xp' | 'gro' | 'star';
    amount: number;
    icon: string;
    label: string;
    amountClassName: string;
    labelClassName: string;
    style?: CSSProperties;
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
    const nurturing = useNurturing();
    const gameOverRef = useRef<HTMLDivElement>(null);
    const jelloResetTimerRef = useRef<number | null>(null);
    const [jelloAction, setJelloAction] = useState<CharacterAction>('idle');

    const clearJelloResetTimer = () => {
        if (jelloResetTimerRef.current) {
            window.clearTimeout(jelloResetTimerRef.current);
            jelloResetTimerRef.current = null;
        }
    };

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
    const earnedStars = rewardResult?.starsEarned || 0;
    const totalAnswers = (stats?.correct || 0) + (stats?.wrong || 0);
    const accuracy = totalAnswers > 0 ? Math.round(((stats?.correct || 0) / totalAnswers) * 100) : 0;
    const isCleared = gameOverReason === 'cleared';
    const gameOverIcon = isCleared ? '🏆' : '🏁';
    const gameOverLabel = isCleared ? t('common.stageClear') : t('common.gameOver');

    useEffect(() => {
        return () => {
            clearJelloResetTimer();
        };
    }, []);

    const handleJelloTouch = () => {
        playJelloClickSound();
        setJelloAction('eating');
        clearJelloResetTimer();

        jelloResetTimerRef.current = window.setTimeout(() => {
            setJelloAction('idle');
            jelloResetTimerRef.current = null;
        }, 1800);
    };

    const currentJello = useMemo(() => {
        const id = nurturing.speciesId || 'yellowJello';
        const char = createCharacter(id);
        char.evolutionStage = Math.min(5, Math.max(1, nurturing.evolutionStage || 1)) as EvolutionStage;
        if (nurturing.characterName) {
            char.name = nurturing.characterName;
        }
        return { id, char };
    }, [nurturing.characterName, nurturing.evolutionStage, nurturing.speciesId]);

    const jelloLaneClassName = useMemo(() => {
        const classes = ['game-over-jello-lane'];
        if (currentJello.char.evolutionStage <= 2) {
            classes.push('baby');
        }
        if (currentJello.char.evolutionStage === 5) {
            classes.push('legendary');
        }
        return classes.join(' ');
    }, [currentJello.char.evolutionStage]);

    const rewardCards: RewardCardViewModel[] = [
        {
            key: 'xp',
            amount: earnedXp,
            icon: '✨',
            label: t('common.earnedXp'),
            amountClassName: 'text-purple',
            labelClassName: 'text-purple'
        },
        {
            key: 'gro',
            amount: earnedGro,
            icon: '💰',
            label: t('common.earnedGro'),
            amountClassName: 'text-green',
            labelClassName: 'text-green'
        },
        {
            key: 'star',
            amount: earnedStars,
            icon: '⭐',
            label: t('common.earnedStar'),
            amountClassName: 'text-yellow',
            labelClassName: 'text-yellow',
            style: { opacity: earnedStars > 0 ? 1 : 0.4 }
        }
    ];

    return (
        <div className="overlay-screen start-screen-layout">
            <div className="game-over-header-compact">
                <div className="game-over-icon">{gameOverIcon}</div>
                <h1 className="game-over-title">{gameOverLabel}</h1>
            </div>
            <div ref={gameOverRef} className="start-content-scroll custom-scrollbar" style={{ marginTop: '0.2rem' }}>
                <div className="result-cards-container">
                    <div className="result-card main-stats">
                        <div className="score-display-wrapper">
                            <div className="score-display-large">
                                <span className="score-label">{isNewRecord ? t('common.newRecord') : t('common.finalScore')}</span>
                                <span className={`score-value-huge ${isNewRecord ? 'record-pulse' : ''}`}>{score}</span>
                            </div>
                            <div className="score-display-sub">
                                <span className="sub-score-label">{isNewRecord ? t('common.previousBest') : t('common.bestScore')}</span>
                                <span className="sub-score-value">{isNewRecord ? prevBest : highScore}</span>
                            </div>
                        </div>
                        <div className="sub-stats-row">
                            <div className="sub-stat-item">
                                <span className="sub-stat-label">{t('common.bestCombo')}</span>
                                <span className="sub-stat-value text-orange"><Flame size={18} /> {bestCombo}</span>
                            </div>
                            <div className="sub-stat-item">
                                <span className="sub-stat-label">{t('common.accuracy').toUpperCase()}</span>
                                <span className="sub-stat-value text-blue">{accuracy}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="rewards-grid-split">
                        {rewardCards.map((rewardCard) => (
                            <div
                                key={rewardCard.key}
                                className={`reward-card-split ${rewardCard.key}`}
                                style={rewardCard.style}
                            >
                                <div className="reward-head">
                                    <span className="reward-icon">{rewardCard.icon}</span>
                                    <span className={`reward-amount ${rewardCard.amountClassName}`}>{rewardCard.amount}</span>
                                </div>
                                <span className={`reward-label ${rewardCard.labelClassName}`}>{rewardCard.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="game-over-jello-section">
                <div className={jelloLaneClassName}>
                    <div className="game-over-jello-rail" />
                    <div className="game-over-jello-traveler">
                        <div
                            className="game-over-jello-wrapper"
                            onPointerDown={handleJelloTouch}
                            role="button"
                            tabIndex={0}
                            aria-label={t('common.pet')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleJelloTouch();
                                }
                            }}
                        >
                            <JelloAvatar
                                character={currentJello.char}
                                speciesId={currentJello.id}
                                size="small"
                                action={jelloAction}
                                customSize={104}
                            />
                        </div>
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
