import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { GENIUS_UNLOCK_THRESHOLD } from '../../utils/progression';

interface DrillItemProps {
    game: GameManifest;
    unlocked: boolean;
    clearCount: number;
    isMastered: boolean;
    reason?: string;
    onPlay: (game: GameManifest, isLocked: boolean, reason?: string) => void;
}

export const DrillItem: React.FC<DrillItemProps> = ({
    game,
    unlocked,
    clearCount,
    isMastered,
    reason,
    onPlay
}) => {
    const { t } = useTranslation();

    const handleClick = () => {
        onPlay(game, !unlocked, reason);
    };

    return (
        <div
            className={`drill-item ${unlocked ? 'unlocked' : ''}`}
            onClick={handleClick}
        >
            <div className="drill-icon">
                {isMastered ? (
                    <span style={{ fontSize: '1.5rem' }}>🏅</span>
                ) : (
                    game.thumbnail && typeof game.thumbnail === 'string' && game.thumbnail.startsWith('http') ? (
                        <img src={game.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        game.thumbnail || game.level
                    )
                )}
            </div>
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
                            color: '#64748b', // Slate-500
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
