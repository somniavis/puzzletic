import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { getIconBackground, renderThumbnail } from '../../utils/playPageUtils';
import { PremiumLockOverlay } from '../Premium/PremiumLockOverlay';

interface AdventureCardProps {
    id?: string;
    game: GameManifest;
    unlocked: boolean;
    displayReason?: string;
    clearCount: number;
    isMastered: boolean;
    onPlay: (game: GameManifest, isLocked: boolean, reason?: string) => void;
    isPremiumLocked?: boolean;
}

export const AdventureCard: React.FC<AdventureCardProps> = ({
    id,
    game,
    unlocked,
    displayReason,
    clearCount,
    isMastered,
    onPlay,
    isPremiumLocked = false
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
        const current = clearCount;
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

    const [showTooltip, setShowTooltip] = React.useState(false);

    // Add useState to imports or use React.useState

    const handleMedalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!showTooltip) {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000);
        }
    };

    const getTooltipMessage = () => {
        if (!isMastered) return null; // Should usually be locked/gray if not mastered but unlocked game handling
        // Based on tiered logic:
        // Bronze: 4-9 plays (Target 10)
        // Silver: 10-19 plays (Target 20)
        // Gold: 20+ plays

        if (clearCount >= 20) return t('games.medal.gold');
        if (clearCount >= 10) return t('games.medal.silver', { count: 20 - clearCount });
        return t('games.medal.bronze', { count: 10 - clearCount });
    };

    return (
        <div
            id={id}
            className={`adventure-card ${game.category === 'brain' ? 'brain-card' : ''} ${(!unlocked || isPremiumLocked) ? 'locked' : ''}`}
        >
            {isPremiumLocked && <PremiumLockOverlay />}
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
                    <h3 className="card-title">
                        {(game.titleKey ? t(game.titleKey) : game.title).split(/(\(Lv\.?\d+\))/).map((part, i) =>
                            part.match(/^\(Lv\.?\d+\)$/) ? <span key={i} style={{ fontSize: '0.75em', marginLeft: '2px' }}>{part}</span> : part
                        )}
                    </h3>

                    {/* Dynamic Subtitle Area */}
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', minHeight: '1.2em' }}>
                        {subtitleContent}
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button
                    className="play-quest-btn"
                    style={{ flex: 1 }}
                    onClick={handleClick}
                >
                    <i className={`fas ${unlocked ? 'fa-play' : 'fa-lock'}`}></i>
                </button>

                {/* Mastery Badge Button */}
                <div
                    className={`badge-box ${!isMastered ? 'gray' : clearCount >= 20 ? 'gold' : clearCount >= 10 ? 'silver' : 'bronze'}`}
                    onClick={handleMedalClick}
                >
                    <i className="fas fa-medal"></i>
                    {showTooltip && isMastered && (
                        <div className="medal-tooltip">
                            {getTooltipMessage()}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
