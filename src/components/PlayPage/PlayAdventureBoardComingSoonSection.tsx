import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    COMING_SOON_PREVIEW_PAD_CLASSES,
    COMING_SOON_PREVIEW_TILE_CLASSES,
} from './playAdventureBoardDecorations';
import type { PlayAdventureBoardTheme } from './playAdventureBoardTypes';

interface PlayAdventureBoardComingSoonSectionProps {
    theme: PlayAdventureBoardTheme;
}

export const PlayAdventureBoardComingSoonSection: React.FC<PlayAdventureBoardComingSoonSectionProps> = ({
    theme,
}) => {
    const { t } = useTranslation();

    return (
        <section className={`play-board-coming-soon ${theme}-theme`} aria-label={t('play.comingSoon.title')}>
            <div className="play-board-coming-soon-transition" aria-hidden="true" />
            <div className="play-board-coming-soon-content">
                <p className="play-board-coming-soon-eyebrow">{t('play.comingSoon.nextAdventure')}</p>
                <h3 className="play-board-coming-soon-title">{t('play.comingSoon.title')}</h3>
                <div className="play-board-coming-soon-preview" aria-hidden="true">
                    {COMING_SOON_PREVIEW_TILE_CLASSES.map((className) => (
                        <span key={className} className={`play-board-coming-soon-tile ${className}`} />
                    ))}
                    {COMING_SOON_PREVIEW_PAD_CLASSES.map((className) => (
                        <span key={className} className={`play-board-coming-soon-pad ${className}`}>
                            <span className="play-board-coming-soon-pad-shadow" />
                            <span className="play-board-coming-soon-pad-face" />
                            <span className="play-board-coming-soon-pad-lock">
                                <i className="fas fa-lock" aria-hidden="true" />
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};
