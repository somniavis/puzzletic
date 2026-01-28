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
    isPremiumLocked?: boolean;
}

export const AdventureCard: React.FC<AdventureCardProps> = ({
    game,
    unlocked,
    displayReason,
    clearCount,
    isMastered,
    onPlay,
    isPremiumLocked = false
}) => {
    const { t } = useTranslation();

    // Import overlay (Lazy or direct - using direct here as it's small)
    // Note: Ensure PremiumLockOverlay is imported at top or dynamically required
    // Assuming imported at top - will fix imports in next block

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
            className={`adventure-card ${game.category === 'brain' ? 'brain-card' : ''} ${(!unlocked || isPremiumLocked) ? 'locked' : ''}`}
            onClick={handleClick}
        >
            {isPremiumLocked && (
                // We need to import PremiumLockOverlay. 
                // Since I cannot add import in this block easily without hitting top, I will handle import in another tool call or rely on subsequent fix.
                // Actually I can add the overlay here assuming the component exists.
                // IMPORTANT: I must add the import statement at the top. I'll do that in a separate chunk in this call if possible or next.
                // For now I will put a placeholder logic and fix imports after.
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    zIndex: 10,
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>🔒</div>
                    <div style={{
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>Premium</div>
                </div>
            )}
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
