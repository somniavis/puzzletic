import React from 'react';
import {
    LEVEL_ONE_SAILBOAT_DECORATIONS,
    LEVEL_ONE_WATER_DECORATIONS,
    LEVEL_THREE_WIND_DECORATIONS,
    LEVEL_TWO_BIRD_DECORATIONS,
    LEVEL_TWO_ENVIRA_DECORATIONS,
    LEVEL_TWO_LEAF_DECORATIONS,
} from './playAdventureBoardDecorations';

interface PlayAdventureBoardLevelDecorProps {
    level: number;
}

export const PlayAdventureBoardLevelDecor: React.FC<PlayAdventureBoardLevelDecorProps> = ({ level }) => {
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
