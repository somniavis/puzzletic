import React from 'react';
import { TAIL_RUNNER_GEM_COLORS } from '../arcade/TailRunner/constants';
import type { TailRunnerGemTier } from '../arcade/TailRunner/types';
import {
    getPlaySharedGemPointString,
    PLAY_SHARED_GEM_GLOW_RADIUS,
    PLAY_SHARED_GEM_LINE_SETS,
    PLAY_SHARED_GEM_OUTER_POINTS,
    PLAY_SHARED_GEM_TOP_POINTS,
    PLAY_SHARED_GEM_UNIT,
} from './gemVisuals';
import './GemPickup.css';

type GemPickupProps = {
    tier: TailRunnerGemTier;
    size?: number;
    className?: string;
};

const GEM_OUTER_POINT_STRING = getPlaySharedGemPointString(PLAY_SHARED_GEM_OUTER_POINTS);
const GEM_TOP_POINT_STRING = getPlaySharedGemPointString(PLAY_SHARED_GEM_TOP_POINTS);

export const GemPickup: React.FC<GemPickupProps> = ({
    tier,
    size = 38,
    className,
}) => {
    const palette = TAIL_RUNNER_GEM_COLORS[tier];
    const classes = ['play-shared-gem-pickup', className].filter(Boolean).join(' ');

    return (
        <span
            className={classes}
            style={{ ['--play-shared-gem-size' as string]: `${size}px` }}
            aria-hidden="true"
        >
            <svg
                className="play-shared-gem-pickup__svg"
                viewBox="-30 -30 60 64"
                role="presentation"
            >
                <circle
                    cx="0"
                    cy="0"
                    r={PLAY_SHARED_GEM_GLOW_RADIUS}
                    fill={palette.glow}
                />
                <polygon
                    points={GEM_OUTER_POINT_STRING}
                    fill={palette.body}
                    stroke={palette.edge}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <polygon
                    points={GEM_TOP_POINT_STRING}
                    fill={palette.top}
                />
                {PLAY_SHARED_GEM_LINE_SETS.map((lineSet, index) => (
                    <polyline
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        points={getPlaySharedGemPointString(lineSet, PLAY_SHARED_GEM_UNIT)}
                        fill="none"
                        stroke="rgba(255,255,255,0.58)"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                ))}
            </svg>
        </span>
    );
};
