import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { PremiumLockOverlay } from '../Premium/PremiumLockOverlay';
import { GENIUS_UNLOCK_THRESHOLD } from '../../utils/progression';

interface DrillItemProps {
    game: GameManifest;
    unlocked: boolean;
    clearCount: number;
    isMastered: boolean;
    reason?: string;
    onPlay: (game: GameManifest, isLocked: boolean, reason?: string) => void;
    isPremiumLocked?: boolean;
}

export const DrillItem: React.FC<DrillItemProps> = ({
    game,
    unlocked,
    clearCount,
    isMastered,
    reason,
    onPlay,
    isPremiumLocked = false
}) => {
    const { t } = useTranslation();
    const [showTooltip, setShowTooltip] = React.useState(false);

    const handleClick = () => {
        onPlay(game, !unlocked, reason);
    };

    const handleMedalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!showTooltip) {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000);
        }
    };

    const getTooltipMessage = () => {
        // Bronze: 3-9 plays (Target 10)
        // Silver: 10-19 plays (Target 20)
        // Gold: 20+ plays
        if (clearCount >= 20) return t('games.medal.gold');
        if (clearCount >= 10) return t('games.medal.silver', { count: 20 - clearCount });
        return t('games.medal.bronze', { count: 10 - clearCount });
    };

    const medalClass = clearCount >= 20 ? 'gold' : clearCount >= 10 ? 'silver' : 'bronze';

    return (
        <div
            className={`drill-item ${unlocked ? 'unlocked' : ''} ${isPremiumLocked ? 'locked' : ''}`}
            onClick={handleClick}
            style={{ position: 'relative' }}
        >
            {isPremiumLocked && <PremiumLockOverlay />}
            {isMastered ? (
                <div
                    className={`badge-box ${medalClass}`}
                    onClick={handleMedalClick}
                    style={{ width: '3rem', height: '3rem', fontSize: '1.25rem', zIndex: 2 }}
                >
                    <i className="fas fa-medal"></i>
                    {showTooltip && (
                        <div className="medal-tooltip right-side">
                            {getTooltipMessage()}
                        </div>
                    )}
                </div>
            ) : (
                <div className="drill-icon">
                    {game.thumbnail && typeof game.thumbnail === 'string' && game.thumbnail.startsWith('http') ? (
                        <img src={game.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        game.thumbnail || game.level
                    )}
                </div>
            )}

            <div className="drill-info">
                <h4 className="drill-title">
                    {game.titleKey ? t(game.titleKey) : game.title}
                </h4>
                <div className="drill-meta">
                    <span
                        style={{
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.25rem',
                            color: '#64748b',
                            fontStyle: clearCount > 0 && !isMastered ? 'italic' : 'normal',
                            fontWeight: clearCount > 0 && !isMastered ? 'bold' : 'normal'
                        }}
                    >
                        {(() => {
                            if (clearCount === 0) return game.subtitleKey ? t(game.subtitleKey, game.subtitle || 'Start Drill') : (game.subtitle || 'Start Drill');
                            if (!isMastered) return t('games.mission.challenge10', { current: clearCount, total: GENIUS_UNLOCK_THRESHOLD, defaultValue: `Challenge! (${clearCount}/${GENIUS_UNLOCK_THRESHOLD})` });
                            return game.subtitleKey ? t(game.subtitleKey, game.subtitle || 'Mastered') : (game.subtitle || 'Mastered');
                        })()}
                    </span>
                </div>
            </div>

            <div className="drill-action">
                {unlocked ? (
                    <div className="action-btn-mini"><i className="fas fa-play"></i></div>
                ) : (
                    <span style={{ color: '#cbd5e1' }}><i className="fas fa-lock"></i></span>
                )}
            </div>
        </div>
    );
};
