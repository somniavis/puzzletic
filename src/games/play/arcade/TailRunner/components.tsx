import React from 'react';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import type { Character } from '../../../../types/character';
import type { TailRunnerHudState } from './types';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

type HeaderProps = {
    gt: TranslateFn;
    hudState: TailRunnerHudState;
    isScoreBeyondBest: boolean;
    isTailBeyondBest: boolean;
    onOpenHelp: () => void;
    onExit: () => void;
};

export const TailRunnerHeader: React.FC<HeaderProps> = ({
    gt,
    hudState,
    isScoreBeyondBest,
    isTailBeyondBest,
    onOpenHelp,
    onExit,
}) => (
    <header className="tail-runner__header">
        <div className="tail-runner__header-stats" aria-label={gt('headerStatsLabel')}>
            <div className="tail-runner__header-stat">
                <span className="tail-runner__header-stat-label">
                    <span>{gt('stats.score')}</span>
                    <span className="tail-runner__header-stat-label-separator">/</span>
                    <span className="tail-runner__header-stat-label-best">{gt('stats.best')}</span>
                </span>
                <strong className="tail-runner__header-stat-value">
                    <span className={isScoreBeyondBest ? 'tail-runner__header-stat-current--highlight' : undefined}>{hudState.score}</span>
                    <span className="tail-runner__header-stat-separator">/</span>
                    <span className="tail-runner__header-stat-best">{hudState.highScore}</span>
                </strong>
            </div>
            <div className="tail-runner__header-stat">
                <span className="tail-runner__header-stat-label">
                    <span>{gt('stats.tail')}</span>
                    <span className="tail-runner__header-stat-label-separator">/</span>
                    <span className="tail-runner__header-stat-label-best">{gt('stats.best')}</span>
                </span>
                <strong className="tail-runner__header-stat-value">
                    <span className={isTailBeyondBest ? 'tail-runner__header-stat-current--highlight' : undefined}>{hudState.tailLength}</span>
                    <span className="tail-runner__header-stat-separator">/</span>
                    <span className="tail-runner__header-stat-best">{hudState.bestTail}</span>
                </strong>
            </div>
        </div>
        <div className="tail-runner__header-actions">
            <button
                type="button"
                className="tail-runner__close tail-runner__help"
                onClick={onOpenHelp}
                aria-label={gt('controlsTitle')}
            >
                <span className="tail-runner__help-mark">?</span>
            </button>
            <button
                type="button"
                className="tail-runner__close"
                onClick={onExit}
                aria-label={gt('closeButton')}
            >
                <i className="fas fa-xmark" aria-hidden="true" />
            </button>
        </div>
    </header>
);

type OverlayProps = {
    runnerCharacter: Character;
    liveShieldActive: boolean;
    liveShieldWarning: boolean;
    liveMagnetActive: boolean;
    heartBursts: number[];
    scoreBursts: Array<{ id: number; label: string }>;
};

export const TailRunnerPlayerOverlay: React.FC<OverlayProps> = ({
    runnerCharacter,
    liveShieldActive,
    liveShieldWarning,
    liveMagnetActive,
    heartBursts,
    scoreBursts,
}) => (
    <div className="tail-runner__player-overlay" aria-hidden="true">
        <div className={`tail-runner__avatar-core${liveShieldActive ? ' tail-runner__avatar-core--shielded' : ''}`}>
            <div className="tail-runner__avatar-glow" aria-hidden="true" />
            {liveMagnetActive && <div className="tail-runner__magnet-ring" aria-hidden="true">🧲</div>}
            {liveShieldActive && (
                <div className={`tail-runner__shield-ring${liveShieldWarning ? ' tail-runner__shield-ring--warning' : ''}`} aria-hidden="true">
                    <span className="tail-runner__shield-ring-beam tail-runner__shield-ring-beam--one" />
                    <span className="tail-runner__shield-ring-beam tail-runner__shield-ring-beam--two" />
                </div>
            )}
            <div className="tail-runner__heart-layer" aria-hidden="true">
                {heartBursts.map((burstId) => (
                    <span key={burstId} className="tail-runner__heart-burst">♥️</span>
                ))}
                {scoreBursts.map((burst) => (
                    <span key={burst.id} className="tail-runner__score-burst">{burst.label}</span>
                ))}
            </div>
            <JelloAvatar
                character={runnerCharacter}
                speciesId={runnerCharacter.speciesId}
                responsive
                disableAnimation
            />
        </div>
    </div>
);

type StartScreenProps = {
    gt: TranslateFn;
    runnerCharacter: Character;
    onStart: () => void;
};

export const TailRunnerStartScreen: React.FC<StartScreenProps> = ({ gt, runnerCharacter, onStart }) => (
    <div className="tail-runner__start-screen">
        <div className="tail-runner__start-card tail-runner__start-card--welcome">
            <div className="tail-runner__start-icon-shell" aria-hidden="true">
                <div className="tail-runner__start-icon-bubble">
                    <JelloAvatar
                        character={runnerCharacter}
                        speciesId={runnerCharacter.speciesId}
                        responsive
                        disableAnimation
                    />
                </div>
            </div>
            <div className="tail-runner__start-copy">
                <h2>{gt('startTitle')}</h2>
                <p>{gt('startDescription')}</p>
            </div>
            <button
                type="button"
                className="tail-runner__start-btn tail-runner__start-btn--hero"
                onClick={onStart}
                aria-label={gt('startButton')}
            >
                <i className="fas fa-play" aria-hidden="true" />
            </button>
            <div className="tail-runner__start-guide" aria-hidden="true">
                <div className="tail-runner__start-guide-item">
                    <div className="tail-runner__start-guide-keys">
                        <kbd>←</kbd>
                        <kbd>→</kbd>
                    </div>
                    <span>{gt('controlsTurnShort')}</span>
                </div>
                <div className="tail-runner__start-guide-item">
                    <div className="tail-runner__start-guide-keys">
                        <kbd>⚡</kbd>
                        <kbd>SPACE</kbd>
                    </div>
                    <span>{gt('controlsShieldShort')}</span>
                </div>
            </div>
        </div>
    </div>
);

type GameOverScreenProps = {
    gt: TranslateFn;
    hudState: TailRunnerHudState;
    gameOverHighlights: { score: boolean; tail: boolean };
    onRetry: () => void;
};

export const TailRunnerGameOverScreen: React.FC<GameOverScreenProps> = ({
    gt,
    hudState,
    gameOverHighlights,
    onRetry,
}) => (
    <div className="tail-runner__start-screen">
        <div className="tail-runner__start-card tail-runner__start-card--gameover">
            <div className="tail-runner__gameover-icon-shell" aria-hidden="true">
                <div className="tail-runner__gameover-icon-bubble">💥</div>
            </div>
            <div className="tail-runner__start-copy">
                <h2>{gt('gameOverTitle')}</h2>
            </div>
            <div className="tail-runner__gameover-records">
                <div className={`tail-runner__gameover-record-card${gameOverHighlights.score ? ' tail-runner__gameover-record-card--highlight' : ''}`}>
                    {gameOverHighlights.score && (
                        <span className="tail-runner__gameover-record-badge">
                            {gt('newBest')}
                        </span>
                    )}
                    <span className="tail-runner__gameover-record-label">
                        {gt('stats.score')} / {gt('stats.best')}
                    </span>
                    <strong className="tail-runner__gameover-record-value">
                        <span>{hudState.score}</span>
                        <span className="tail-runner__gameover-record-separator">/</span>
                        <span className="tail-runner__gameover-record-best">{hudState.highScore}</span>
                    </strong>
                </div>
                <div className={`tail-runner__gameover-record-card tail-runner__gameover-record-card--tail${gameOverHighlights.tail ? ' tail-runner__gameover-record-card--highlight' : ''}`}>
                    {gameOverHighlights.tail && (
                        <span className="tail-runner__gameover-record-badge">
                            {gt('newBest')}
                        </span>
                    )}
                    <span className="tail-runner__gameover-record-label">
                        {gt('stats.tail')} / {gt('stats.best')}
                    </span>
                    <strong className="tail-runner__gameover-record-value">
                        <span>{hudState.tailLength}</span>
                        <span className="tail-runner__gameover-record-separator">/</span>
                        <span className="tail-runner__gameover-record-best">{hudState.bestTail}</span>
                    </strong>
                </div>
            </div>
            <button type="button" className="tail-runner__start-btn tail-runner__start-btn--gameover" onClick={onRetry}>
                <i className="fas fa-rotate-right" aria-hidden="true" />
                {gt('retryButton')}
            </button>
        </div>
    </div>
);

type TouchControlsProps = {
    gt: TranslateFn;
    gamePhase: 'start' | 'playing' | 'gameOver';
    liveShieldActive: boolean;
    shieldCharges: number;
    onSetInputPressed: (key: 'left' | 'right' | 'boost', value: boolean) => void;
    onActivateShield: () => void;
};

export const TailRunnerTouchControls: React.FC<TouchControlsProps> = ({
    gt,
    gamePhase,
    liveShieldActive,
    shieldCharges,
    onSetInputPressed,
    onActivateShield,
}) => (
    <div className="tail-runner__touch-controls">
        <button
            type="button"
            className="tail-runner__touch-btn"
            onPointerDown={() => onSetInputPressed('left', true)}
            onPointerUp={() => onSetInputPressed('left', false)}
            onPointerCancel={() => onSetInputPressed('left', false)}
            onPointerLeave={() => onSetInputPressed('left', false)}
            disabled={gamePhase !== 'playing'}
        >
            <span className="tail-runner__touch-icon">←</span>
        </button>
        <button
            type="button"
            className={`tail-runner__touch-btn tail-runner__touch-btn--boost${liveShieldActive ? ' tail-runner__touch-btn--active' : ''}`}
            onClick={onActivateShield}
            disabled={gamePhase !== 'playing' || shieldCharges <= 0 || liveShieldActive}
            aria-label={gt('shieldButton', { count: shieldCharges })}
        >
            <span className="tail-runner__touch-icon">⚡</span>
            {shieldCharges > 0 && (
                <span className="tail-runner__touch-badge">{shieldCharges}</span>
            )}
        </button>
        <button
            type="button"
            className="tail-runner__touch-btn"
            onPointerDown={() => onSetInputPressed('right', true)}
            onPointerUp={() => onSetInputPressed('right', false)}
            onPointerCancel={() => onSetInputPressed('right', false)}
            onPointerLeave={() => onSetInputPressed('right', false)}
            disabled={gamePhase !== 'playing'}
        >
            <span className="tail-runner__touch-icon">→</span>
        </button>
    </div>
);

type SidebarProps = {
    gt: TranslateFn;
    runnerCharacterName: string;
    hudState: TailRunnerHudState;
    boostSpeed: number;
};

export const TailRunnerSidebar: React.FC<SidebarProps> = ({
    gt,
    runnerCharacterName,
    hudState,
    boostSpeed,
}) => (
    <div className="tail-runner__sidebar">
        <div className="tail-runner__card">
            <h2>{runnerCharacterName}</h2>
            <p>{gt('currentJelloDescription')}</p>
        </div>

        <div className="tail-runner__stats">
            <div className="tail-runner__stat">
                <span className="tail-runner__stat-label">{gt('stats.speed')}</span>
                <span className="tail-runner__stat-value">{hudState.speed.toFixed(1)}</span>
            </div>
            <div className="tail-runner__stat">
                <span className="tail-runner__stat-label">{gt('stats.boost')}</span>
                <span className="tail-runner__stat-value">{boostSpeed}</span>
            </div>
            <div className="tail-runner__stat">
                <span className="tail-runner__stat-label">{gt('stats.score')}</span>
                <span className="tail-runner__stat-value">{hudState.score}</span>
            </div>
            <div className="tail-runner__stat">
                <span className="tail-runner__stat-label">{gt('stats.tail')}</span>
                <span className="tail-runner__stat-value">{hudState.tailLength}</span>
            </div>
            <div className="tail-runner__stat">
                <span className="tail-runner__stat-label">{gt('stats.best')}</span>
                <span className="tail-runner__stat-value">{hudState.highScore}</span>
            </div>
        </div>

        <div className="tail-runner__card">
            <h3>{gt('currentPositionTitle')}</h3>
            <p>{gt('currentPositionValue', { x: hudState.positionX, y: hudState.positionY })}</p>
        </div>

        <div className="tail-runner__card">
            <h3>{gt('controlsTitle')}</h3>
            <ul className="tail-runner__controls">
                <li>{gt('controlsAuto')}</li>
                <li>{gt('controlsTurn')}</li>
                <li>{gt('controlsBoost')}</li>
                <li>{gt('controlsShield')}</li>
                <li>{gt('controlsMagnet')}</li>
                <li>{gt('controlsTouch')}</li>
            </ul>
        </div>
    </div>
);

type HelpModalProps = {
    gt: TranslateFn;
    onClose: () => void;
};

export const TailRunnerHelpModal: React.FC<HelpModalProps> = ({ gt, onClose }) => (
    <div className="tail-runner__modal-backdrop" onClick={onClose}>
        <div
            className="tail-runner__modal"
            role="dialog"
            aria-modal="true"
            aria-label={gt('controlsTitle')}
            onClick={(event) => event.stopPropagation()}
        >
            <div className="tail-runner__modal-head">
                <h3>{gt('controlsTitle')}</h3>
                <button
                    type="button"
                    className="tail-runner__modal-close"
                    onClick={onClose}
                    aria-label={gt('closeButton')}
                >
                    <i className="fas fa-xmark" aria-hidden="true" />
                </button>
            </div>
            <ul className="tail-runner__controls tail-runner__controls--modal">
                <li>{gt('controlsAuto')}</li>
                <li>{gt('controlsTurn')}</li>
                <li>{gt('controlsBoost')}</li>
                <li>{gt('controlsShield')}</li>
                <li>{gt('controlsMagnet')}</li>
                <li>{gt('controlsTouch')}</li>
            </ul>
        </div>
    </div>
);
