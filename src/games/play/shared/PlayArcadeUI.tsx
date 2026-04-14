import React from 'react';
import './PlayArcadeUI.css';

export type PlayArcadeHeaderStat = {
    label: string;
    bestLabel?: string;
    current: React.ReactNode;
    best?: React.ReactNode;
    highlightCurrent?: boolean;
    muted?: boolean;
    widthWeight?: number;
    className?: string;
    currentClassName?: string;
    fillPercent?: number;
    fillClassName?: string;
};

type PlayArcadeHeaderProps = {
    stats: PlayArcadeHeaderStat[];
    statsAriaLabel: string;
    closeLabel: string;
    onExit: () => void;
};

export const PlayArcadeHeader: React.FC<PlayArcadeHeaderProps> = ({
    stats,
    statsAriaLabel,
    closeLabel,
    onExit,
}) => (
    <header className="play-arcade-game__header">
        <div className="play-arcade-game__header-stats" aria-label={statsAriaLabel}>
            {stats.map((stat) => (
                <div
                    className={[
                        'play-arcade-game__header-stat',
                        stat.muted ? 'play-arcade-game__header-stat--muted' : '',
                        stat.className ?? '',
                    ].filter(Boolean).join(' ')}
                    key={stat.label}
                    style={stat.widthWeight ? { flex: `${stat.widthWeight} 1 0` } : undefined}
                >
                    {stat.fillPercent !== undefined && (
                        <span
                            className={[
                                'play-arcade-game__header-stat-fill',
                                stat.fillClassName ?? '',
                            ].filter(Boolean).join(' ')}
                            style={{ width: `${Math.max(0, Math.min(100, stat.fillPercent))}%` }}
                            aria-hidden="true"
                        />
                    )}
                    <span className="play-arcade-game__header-stat-label">
                        <span>{stat.label}</span>
                        {stat.bestLabel && (
                            <>
                                <span className="play-arcade-game__header-stat-label-separator">/</span>
                                <span className="play-arcade-game__header-stat-label-best">{stat.bestLabel}</span>
                            </>
                        )}
                    </span>
                    <strong className="play-arcade-game__header-stat-value">
                        <span className={stat.highlightCurrent ? 'play-arcade-game__header-stat-current--highlight' : undefined}>
                            <span className={stat.currentClassName}>{stat.current}</span>
                        </span>
                        {stat.best !== undefined && (
                            <>
                                <span className="play-arcade-game__header-stat-separator">/</span>
                                <span className="play-arcade-game__header-stat-best">{stat.best}</span>
                            </>
                        )}
                    </strong>
                </div>
            ))}
        </div>
        <div className="play-arcade-game__header-actions">
            <button
                type="button"
                className="play-arcade-game__header-button"
                onClick={onExit}
                aria-label={closeLabel}
            >
                <i className="fas fa-xmark" aria-hidden="true" />
            </button>
        </div>
    </header>
);

export type PlayArcadeGuide = {
    keys: string[];
    text: string;
};

type PlayArcadeStartOverlayProps = {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    visual: React.ReactNode;
    guides: PlayArcadeGuide[];
    iconOnly?: boolean;
};

export const PlayArcadeStartOverlay: React.FC<PlayArcadeStartOverlayProps> = ({
    title,
    description,
    actionLabel,
    onAction,
    visual,
    guides,
    iconOnly = false,
}) => (
    <div className="play-arcade-game__overlay-screen">
        <div className="play-arcade-game__card">
            <div className="play-arcade-game__visual-shell play-arcade-game__visual-shell--floating" aria-hidden="true">
                <div className="play-arcade-game__visual-bubble">{visual}</div>
            </div>
            <div className="play-arcade-game__copy">
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
            <button
                type="button"
                className={`play-arcade-game__action${iconOnly ? ' play-arcade-game__action--icon' : ''}`}
                onClick={onAction}
                aria-label={actionLabel}
            >
                {iconOnly ? <i className="fas fa-play" aria-hidden="true" /> : actionLabel}
            </button>
            <div className="play-arcade-game__guides" aria-hidden="true">
                {guides.map((guide) => (
                    <div className="play-arcade-game__guide" key={`${guide.text}-${guide.keys.join('-')}`}>
                        <div className="play-arcade-game__guide-keys">
                            {guide.keys.map((key) => (
                                <kbd key={key}>{key}</kbd>
                            ))}
                        </div>
                        <span>{guide.text}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export type PlayArcadeRecord = {
    label: string;
    current: React.ReactNode;
    best?: React.ReactNode;
    highlighted?: boolean;
    badgeText?: string;
    tone?: 'default' | 'secondary';
    className?: string;
};

export type PlayArcadeReward = {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    tone: 'xp' | 'gro';
};

type PlayArcadeGameOverOverlayProps = {
    title: string;
    retryLabel: string;
    onRetry: () => void;
    records: PlayArcadeRecord[];
    rewards: PlayArcadeReward[];
    iconOnly?: boolean;
};

export const PlayArcadeGameOverOverlay: React.FC<PlayArcadeGameOverOverlayProps> = ({
    title,
    retryLabel,
    onRetry,
    records,
    rewards,
    iconOnly = false,
}) => (
    <div className="play-arcade-game__overlay-screen">
        <div className="play-arcade-game__card play-arcade-game__card--gameover">
            <div className="play-arcade-game__copy play-arcade-game__copy--gameover">
                <h2>{title}</h2>
            </div>
            <div className="play-arcade-game__records">
                {records.map((record) => (
                    <div
                        key={record.label}
                        className={[
                            'play-arcade-game__record',
                            record.tone === 'secondary' ? 'play-arcade-game__record--secondary' : '',
                            record.highlighted ? 'play-arcade-game__record--highlight' : '',
                            record.className ?? '',
                        ].filter(Boolean).join(' ')}
                    >
                        {record.highlighted && record.badgeText && (
                            <span className="play-arcade-game__record-badge">{record.badgeText}</span>
                        )}
                        <span className="play-arcade-game__record-label">{record.label}</span>
                        <strong className="play-arcade-game__record-value">
                            <span>{record.current}</span>
                            {record.best !== undefined && (
                                <>
                                    <span className="play-arcade-game__record-separator">/</span>
                                    <span className="play-arcade-game__record-best">{record.best}</span>
                                </>
                            )}
                        </strong>
                    </div>
                ))}
            </div>
            <div className="play-arcade-game__rewards">
                {rewards.map((reward) => (
                    <div
                        key={`${reward.tone}-${reward.label}`}
                        className={`play-arcade-game__reward-card play-arcade-game__reward-card--${reward.tone}`}
                    >
                        <div className="play-arcade-game__reward-head">
                            <span className="play-arcade-game__reward-icon">{reward.icon}</span>
                            <span className="play-arcade-game__reward-label">{reward.label}</span>
                        </div>
                        <strong className="play-arcade-game__reward-value">{reward.value}</strong>
                    </div>
                ))}
            </div>
            <button
                type="button"
                className={`play-arcade-game__action${iconOnly ? ' play-arcade-game__action--icon' : ''}`}
                onClick={onRetry}
                aria-label={retryLabel}
            >
                {iconOnly ? <i className="fas fa-rotate-right" aria-hidden="true" /> : retryLabel}
            </button>
        </div>
    </div>
);
