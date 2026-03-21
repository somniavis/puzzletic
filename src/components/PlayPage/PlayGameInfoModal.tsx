import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { AdventureCard } from './AdventureCard';

interface PlayGameInfoModalProps {
    game: GameManifest;
    unlocked: boolean;
    displayReason?: string;
    clearCount: number;
    isMastered: boolean;
    isPremiumLocked: boolean;
    onPlay: (game: GameManifest, isLocked: boolean, reason?: string) => void;
    onClose: () => void;
}

export const PlayGameInfoModal: React.FC<PlayGameInfoModalProps> = ({
    game,
    unlocked,
    displayReason,
    clearCount,
    isMastered,
    isPremiumLocked,
    onPlay,
    onClose,
}) => {
    const { t } = useTranslation();

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="play-game-modal-overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="play-game-modal-card"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={game.titleKey ? t(game.titleKey) : game.title}
            >
                <div className="play-game-modal-header">
                    <button
                        type="button"
                        className="play-game-modal-close"
                        onClick={onClose}
                        aria-label={t('common.close', { defaultValue: 'Close' })}
                    >
                        <i className="fas fa-xmark" aria-hidden="true" />
                    </button>
                </div>
                <AdventureCard
                    game={game}
                    unlocked={unlocked}
                    displayReason={displayReason}
                    clearCount={clearCount}
                    isMastered={isMastered}
                    onPlay={onPlay}
                    isPremiumLocked={isPremiumLocked}
                />
            </div>
        </div>
    );
};
