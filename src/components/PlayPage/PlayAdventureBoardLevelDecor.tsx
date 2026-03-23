import React from 'react';
import {
    BRAIN_LEVEL_PULSE_DECORATIONS,
    LEVEL_ONE_SAILBOAT_DECORATIONS,
    LEVEL_ONE_WATER_DECORATIONS,
    LEVEL_THREE_WIND_DECORATIONS,
    LEVEL_TWO_BIRD_DECORATIONS,
    LEVEL_TWO_ENVIRA_DECORATIONS,
    LEVEL_TWO_LEAF_DECORATIONS,
} from './playAdventureBoardDecorations';
import type { BrainPulseDecoration } from './playAdventureBoardTypes';
import type { PlayAdventureBoardTheme } from './playAdventureBoardTypes';

interface PlayAdventureBoardLevelDecorProps {
    level: number;
    theme: PlayAdventureBoardTheme;
}

const renderBrainPulses = (level: number, pulses: readonly BrainPulseDecoration[]) => (
    <div className="play-board-brain-decor" aria-hidden="true">
        {pulses.map((pulse, pulseIndex) => (
            <span
                key={`brain-pulse-${level}-${pulseIndex}`}
                className={`play-board-brain-pulse ${pulse.className}`}
                style={{
                    top: pulse.top,
                    left: pulse.left,
                    animationDuration: pulse.duration,
                    animationDelay: pulse.delay,
                }}
            />
        ))}
    </div>
);

export const PlayAdventureBoardLevelDecor: React.FC<PlayAdventureBoardLevelDecorProps> = ({ level, theme }) => {
    if (theme === 'brain') {
        return renderBrainPulses(level, BRAIN_LEVEL_PULSE_DECORATIONS[level] ?? []);
    }

    if (level === 1) {
        return (
            <div className="play-board-water-decor" aria-hidden="true">
                {LEVEL_ONE_WATER_DECORATIONS.map((decor, decorIndex) => (
                    <span
                        key={`water-${decorIndex}`}
                        className="play-board-water-icon"
                        style={{
                            top: decor.top,
                            left: decor.left,
                            fontSize: decor.size,
                            opacity: decor.opacity,
                            animationDuration: decor.duration,
                            animationDelay: decor.delay,
                        }}
                    >
                        <i className="fas fa-water" aria-hidden="true" />
                    </span>
                ))}
                {LEVEL_ONE_SAILBOAT_DECORATIONS.map((decor, decorIndex) => (
                    <span
                        key={`sailboat-${decorIndex}`}
                        className="play-board-sailboat-icon"
                        style={{
                            top: decor.top,
                            left: decor.left,
                            fontSize: decor.size,
                            opacity: decor.opacity,
                            animationDuration: decor.duration,
                            animationDelay: decor.delay,
                        }}
                    >
                        <i className="fas fa-sailboat" aria-hidden="true" />
                    </span>
                ))}
            </div>
        );
    }

    if (level === 2) {
        return (
            <div className="play-board-water-decor play-board-forest-decor" aria-hidden="true">
                {LEVEL_TWO_LEAF_DECORATIONS.map((decor, decorIndex) => (
                    <span
                        key={`leaf-${decorIndex}`}
                        className="play-board-leaf-icon"
                        style={{
                            top: decor.top,
                            left: decor.left,
                            fontSize: decor.size,
                            opacity: decor.opacity,
                            animationDuration: decor.duration,
                            animationDelay: decor.delay,
                        }}
                    >
                        <i className="fas fa-leaf" aria-hidden="true" />
                    </span>
                ))}
                {LEVEL_TWO_ENVIRA_DECORATIONS.map((decor, decorIndex) => (
                    <span
                        key={`envira-${decorIndex}`}
                        className="play-board-envira-icon"
                        style={{
                            top: decor.top,
                            left: decor.left,
                            fontSize: decor.size,
                            opacity: decor.opacity,
                            animationDuration: decor.duration,
                            animationDelay: decor.delay,
                        }}
                    >
                        <i className="fab fa-envira" aria-hidden="true" />
                    </span>
                ))}
                {LEVEL_TWO_BIRD_DECORATIONS.map((decor, decorIndex) => (
                    <span
                        key={`level-two-bird-${decorIndex}`}
                        className={`play-board-bird-icon ${decor.icon === 'twitter' ? 'twitter' : 'dove'}`}
                        style={{
                            top: decor.top,
                            left: decor.left,
                            fontSize: decor.size,
                            opacity: decor.opacity,
                            animationDuration: decor.duration,
                            animationDelay: decor.delay,
                        }}
                    >
                        <i
                            className={decor.icon === 'twitter' ? 'fab fa-twitter' : 'fas fa-dove'}
                            aria-hidden="true"
                        />
                    </span>
                ))}
            </div>
        );
    }

    if (level === 3) {
        return (
            <div className="play-board-water-decor play-board-wind-decor" aria-hidden="true">
                {LEVEL_THREE_WIND_DECORATIONS.map((decor, decorIndex) => (
                    <span
                        key={`wind-${decorIndex}`}
                        className="play-board-wind-icon"
                        style={{
                            top: decor.top,
                            left: decor.left,
                            fontSize: decor.size,
                            opacity: decor.opacity,
                            animationDuration: decor.duration,
                            animationDelay: decor.delay,
                        }}
                    >
                        <i className="fas fa-wind" aria-hidden="true" />
                    </span>
                ))}
            </div>
        );
    }

    return null;
};
