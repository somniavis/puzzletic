import React from 'react';
import type { GameComponentProps } from '../../types';
import './StandalonePlayGameShell.css';

type StandalonePlayGameShellProps = GameComponentProps & {
    title: string;
    emoji: string;
    description: string;
};

export const StandalonePlayGameShell: React.FC<StandalonePlayGameShellProps> = ({
    onExit,
    title,
    emoji,
    description,
}) => {
    return (
        <div className="standalone-play-shell">
            <div className="standalone-play-shell__panel">
                <header className="standalone-play-shell__header">
                    <div className="standalone-play-shell__title-wrap">
                        <p className="standalone-play-shell__eyebrow">Play Prototype</p>
                        <h1 className="standalone-play-shell__title">{title}</h1>
                    </div>
                    <button
                        type="button"
                        className="standalone-play-shell__close"
                        onClick={onExit}
                        aria-label="Exit game"
                    >
                        <i className="fas fa-xmark" aria-hidden="true" />
                    </button>
                </header>

                <section className="standalone-play-shell__hero">
                    <div className="standalone-play-shell__badge" aria-hidden="true">
                        {emoji}
                    </div>
                    <p className="standalone-play-shell__desc">{description}</p>
                    <p className="standalone-play-shell__note">
                        Custom Play game shell ready for dedicated gameplay UI
                    </p>
                </section>
            </div>
        </div>
    );
};
