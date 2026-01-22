import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { getIconBackground, renderThumbnail } from '../../utils/playPageUtils';

interface AdventureCardProps {
    game: GameManifest;
    unlocked: boolean;
    displayReason?: string;
    clearCount: number;
    isMastered: boolean;
    onPlay: (game: GameManifest, isLocked: boolean, reason?: string) => void;
}

export const AdventureCard: React.FC<AdventureCardProps> = ({
    game,
    unlocked,
    displayReason,
    clearCount,
    isMastered,
    onPlay
}) => {
    const { t } = useTranslation();

    const handleClick = () => {
        onPlay(game, !unlocked, displayReason);
    };

    const renderDifficultyStars = (level: number) => {
        return (
            <div className="difficulty-stars">
                {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`star ${s <= level ? 'filled' : 'empty'}`}>
                        <i className="fas fa-star"></i>
                    </span>
                ))}
            </div>
        );
    };

    let subtitleContent;
    if (clearCount === 0) {
        // First time: Show original subtitle
        subtitleContent = (
            <span className="card-subtitle-text">
                {game.subtitleKey ? t(game.subtitleKey) : (game.tags?.[0] || '')}
            </span>
        );
    } else if (!isMastered) {
        // Challenge Phase: 1-3 plays
        const current = Math.max(0, clearCount - 1);
        subtitleContent = (
            <span className="card-mission-text">
                {t('games.mission.challenge', { current, total: 3 })}
            </span>
        );
    } else {
        // Mastered Phase
        subtitleContent = (
            <span className="card-subtitle-text">
                {game.subtitleKey ? t(game.subtitleKey) : ''}
            </span>
        );
    }

    return (
        <div
            className={`adventure-card ${!unlocked ? 'locked' : ''}`}
            onClick={handleClick}
        >
            <div className="card-top">
                <div className="card-icon-box" style={{ background: getIconBackground(game.thumbnail) }}>
                    {renderThumbnail(game.thumbnail, game.category)}
                </div>
                <div className="card-info">
                    <div className="card-meta">
                        <span className="category-badge">
                            {game.tagsKey ? t(game.tagsKey) : (game.tags?.[0] || game.category.toUpperCase())}
                        </span>
                        {renderDifficultyStars(game.level)}
                    </div>
                    <h3 className="card-title">{game.titleKey ? t(game.titleKey) : game.title}</h3>

                    {/* Dynamic Subtitle Area */}
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', minHeight: '1.2em' }}>
                        {subtitleContent}
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button className="play-quest-btn" style={{ flex: 1 }}>
                    <i className={`fas ${unlocked ? 'fa-play' : 'fa-lock'}`}></i>
                </button>

                {/* Mastery Badge Button */}
                <div className={`badge-box ${!isMastered ? 'gray' : clearCount >= 20 ? 'gold' : clearCount >= 10 ? 'silver' : 'bronze'}`}>
                    <i className="fas fa-medal"></i>
                </div>
            </div>
        </div >
    );
};
