import React from 'react';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import type { Character } from '../../../../types/character';
import {
    PlayArcadeGameOverOverlay,
    PlayArcadeHeader,
    PlayArcadeStartOverlay,
} from '../../shared/PlayArcadeUI';
import type { TailRunnerHudState } from './types';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

type HeaderProps = {
    gt: TranslateFn;
    hudState: TailRunnerHudState;
    isScoreBeyondBest: boolean;
    isTailBeyondBest: boolean;
    onExit: () => void;
};

export const TailRunnerHeader: React.FC<HeaderProps> = ({
    gt,
    hudState,
    isScoreBeyondBest,
    isTailBeyondBest,
    onExit,
}) => (
    <PlayArcadeHeader
        statsAriaLabel={gt('headerStatsLabel')}
        closeLabel={gt('closeButton')}
        onExit={onExit}
        stats={[
            {
                label: gt('stats.score'),
                bestLabel: gt('stats.best'),
                current: hudState.score,
                best: hudState.highScore,
                highlightCurrent: isScoreBeyondBest,
            },
            {
                label: gt('stats.tail'),
                bestLabel: gt('stats.best'),
                current: hudState.tailLength,
                best: hudState.bestTail,
                highlightCurrent: isTailBeyondBest,
            },
        ]}
    />
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
    <PlayArcadeStartOverlay
        title={gt('startTitle')}
        description={gt('startDescription')}
        actionLabel={gt('startButton')}
        onAction={onStart}
        iconOnly
        visual={(
            <JelloAvatar
                character={runnerCharacter}
                speciesId={runnerCharacter.speciesId}
                responsive
                disableAnimation
            />
        )}
        guides={[
            {
                keys: ['←', '→'],
                text: gt('controlsTurnShort'),
            },
            {
                keys: ['⚡', 'SPACE'],
                text: gt('controlsShieldShort'),
            },
        ]}
    />
);

type GameOverScreenProps = {
    gt: TranslateFn;
    hudState: TailRunnerHudState;
    gameOverHighlights: { score: boolean; tail: boolean };
    rewards: { xp: number; gro: number };
    onRetry: () => void;
};

export const TailRunnerGameOverScreen: React.FC<GameOverScreenProps> = ({
    gt,
    hudState,
    gameOverHighlights,
    rewards,
    onRetry,
}) => (
    <PlayArcadeGameOverOverlay
        title={gt('gameOverTitle')}
        retryLabel={gt('retryButton')}
        onRetry={onRetry}
        iconOnly
        records={[
            {
                label: `${gt('stats.score')} / ${gt('stats.best')}`,
                current: hudState.score,
                best: hudState.highScore,
                highlighted: gameOverHighlights.score,
                badgeText: gt('newBest'),
            },
            {
                label: `${gt('stats.tail')} / ${gt('stats.best')}`,
                current: hudState.tailLength,
                best: hudState.bestTail,
                highlighted: gameOverHighlights.tail,
                badgeText: gt('newBest'),
                tone: 'secondary',
            },
        ]}
        rewards={[
                {
                    icon: '✨',
                    label: 'XP',
                    value: `+${rewards.xp}`,
                    tone: 'xp',
                },
                {
                    icon: '💰',
                    label: 'GRO',
                    value: `+${rewards.gro}`,
                    tone: 'gro',
            },
        ]}
    />
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
