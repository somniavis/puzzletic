import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import { GameIds } from '../../../../../constants/gameIds';
import './ConstellationFinder.css';

interface ConstellationFinderProps {
    onExit: () => void;
}

type PatternType =
    | 'dipper'
    | 'triangle'
    | 'wave'
    | 'double-fish'
    | 'ram'
    | 'horn'
    | 'twins'
    | 'crab-y'
    | 'lion'
    | 'virgo'
    | 'scales'
    | 'scorpion'
    | 'archer';

interface ConstellationSetDef {
    id: string;
    nameKey: string;
    difficultyKey: string;
    starCount: number;
    distractorMin: number;
    distractorMax: number;
    pattern: PatternType;
    edgePairs?: Array<[number, number]>;
    customCoords?: Coord[];
}

interface StarNode {
    id: string;
    x: number;
    y: number;
    value: number;
    isTarget: boolean;
}

interface Question {
    a: number;
    b: number;
    answer: number;
    targetId: string;
}

interface SetSession {
    def: ConstellationSetDef;
    stars: StarNode[];
    edges: Array<[string, string]>;
    questions: Question[];
    targetOrder: string[];
}

type Coord = [number, number];
type DistractorTweak = { index: number; dx?: number; dy?: number };

const PRODUCT_VALUES = Array.from(
    new Set(Array.from({ length: 9 }, (_, a) => a + 1).flatMap((a) => Array.from({ length: 9 }, (_, b) => a * (b + 1))))
).sort((a, b) => a - b);

const FACTOR_MAP = new Map<number, Array<[number, number]>>();
for (let a = 1; a <= 9; a += 1) {
    for (let b = 1; b <= 9; b += 1) {
        const p = a * b;
        const list = FACTOR_MAP.get(p) ?? [];
        list.push([a, b]);
        FACTOR_MAP.set(p, list);
    }
}

const SETS: ConstellationSetDef[] = [
    {
        id: 'north-dipper',
        nameKey: 'northDipper',
        difficultyKey: 'mid',
        starCount: 7,
        distractorMin: 4,
        distractorMax: 6,
        pattern: 'dipper',
        // Handle + bowl links (center-to-center), matching the Big Dipper shape.
        edgePairs: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]
    },
    {
        id: 'jan-capricorn',
        nameKey: 'january',
        difficultyKey: 'mid',
        starCount: 10,
        distractorMin: 4,
        distractorMax: 6,
        pattern: 'triangle',
        // Reference-based fixed placement for Capricorn (12.25~01.19 screenshot).
        customCoords: [
            [16, 24], // left tip
            [27, 26], // left-top small
            [39, 31], // top-mid 1
            [51, 37], // top-mid 2
            [73, 37], // right-mid anchor
            [75, 28], // right-up 1
            [83, 25], // right-up 2 tip
            [70, 56], // lower-right
            [53, 70], // bottom
            [35, 58]  // lower-left
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3], [3, 4], // top arc
            [4, 5], [5, 6],                  // right short branch
            [4, 7], [7, 8], [8, 9], [9, 0]   // lower V arc
        ]
    },
    {
        id: 'feb-aquarius',
        nameKey: 'february',
        difficultyKey: 'high',
        starCount: 13,
        distractorMin: 4,
        distractorMax: 6,
        pattern: 'wave',
        // Reference-based fixed placement for Aquarius (01.20~02.18 screenshot).
        customCoords: [
            [16, 79], // bottom tail
            [24, 66],
            [28, 57],
            [29, 47],
            [24, 36], // left shoulder
            [34, 21], // top-left
            [43, 25], // top-mid-left
            [52, 21], // top-mid-right
            [54, 34], // center hub
            [68, 33], // right-mid
            [86, 36], // right tip
            [51, 46], // lower branch
            [58, 58]  // branch end
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3], [3, 4], // left zigzag
            [4, 5], [5, 6], [6, 7],          // top ridge
            [7, 8], [8, 9], [9, 10],         // right stream
            [8, 11], [11, 12]                // downward branch
        ]
    },
    {
        id: 'mar-pisces',
        nameKey: 'march',
        difficultyKey: 'high',
        starCount: 16,
        distractorMin: 4,
        distractorMax: 6,
        pattern: 'double-fish',
        // Reference-based fixed placement for Pisces (screenshot 12.11.07).
        customCoords: [
            [20, 78], // left-bottom tip
            [30, 70], // lower branch 1
            [41, 69], // lower branch 2
            [52, 60], // lower center
            [62, 55], // bridge to right fish
            [72, 51], // right fish left
            [77, 46], // right fish top-left
            [84, 47], // right fish top-right
            [86, 54], // right fish right
            [79, 58], // right fish bottom
            [34, 54], // upper branch low
            [40, 40], // upper branch mid
            [41, 24], // upper fish left
            [46, 17], // upper fish top
            [50, 24], // upper fish right
            [56, 56]  // mid bridge node (extra star)
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 15], [15, 5], // lower stream
            [5, 6], [6, 7], [7, 8], [8, 9], [9, 5], // right fish loop
            [0, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 12], // upper-left fish
            [2, 10] // inner connector
        ]
    },
    {
        id: 'apr-aries',
        nameKey: 'april',
        difficultyKey: 'low',
        starCount: 4,
        // Aries is intentionally sparse, so add more distractors for play tension.
        distractorMin: 8,
        distractorMax: 8,
        pattern: 'ram',
        // Reference-oriented fixed placement for Aries (4-star simple bent line).
        customCoords: [
            [24, 26], // left-top
            [55, 36], // center-top
            [69, 50], // right-mid
            [69, 65]  // right-lower
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3]
        ]
    },
    {
        id: 'may-taurus',
        nameKey: 'may',
        difficultyKey: 'mid',
        starCount: 13,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'horn',
        // Reference-oriented fixed placement for Taurus (screenshot 12.30.26).
        customCoords: [
            [20, 30], // left top 1
            [33, 30], // left top 2
            [45, 34], // left top 3
            [51, 43], // upper center join
            [22, 55], // left mid 1
            [37, 55], // left mid 2
            [47, 52], // left mid 3
            [62, 50], // right center core
            [73, 38], // right upper 1
            [78, 46], // right upper 2
            [60, 67], // right lower 1
            [68, 72], // right lower 2
            [43, 55]  // small inner bridge
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3],      // upper left arc
            [4, 5], [5, 12], [12, 6], [6, 3], // lower left arc with inner bridge
            [3, 7],                       // center link
            [7, 8], [8, 9],               // upper-right branch
            [7, 10], [10, 11]             // lower-right branch
        ]
    },
    {
        id: 'jun-gemini',
        nameKey: 'june',
        difficultyKey: 'high',
        starCount: 17,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'twins',
        // Fully rebuilt from screenshot 12.49.45.
        customCoords: [
            [29, 18], // 0 top-left far
            [38, 18], // 1 top-left near
            [42, 27], // 2 upper shoulder
            [54, 22], // 3 top-right
            [19, 32], // 4 left arm far
            [28, 35], // 5 left arm center
            [35, 34], // 6 left arm inner
            [42, 27], // 7 center cross
            [22, 44], // 8 left short lower
            [35, 50], // 9 lower chain 1
            [49, 54], // 10 lower chain 2 / split root
            [60, 65], // 11 lower right branch tip
            [55, 76], // 12 bottom branch tip
            [58, 41], // 13 right mid root
            [66, 57], // 14 right lower short
            [75, 51], // 15 right chain 1
            [84, 50]  // 16 right chain 2
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3],         // top line
            [2, 7],                         // top to center-cross
            [4, 5], [5, 6], [6, 7],         // left arm into center-cross
            [5, 8],                         // left short branch
            [5, 9], [9, 10],                // lower trunk
            [10, 11], [10, 12],             // lower split branches
            [7, 13], [13, 14],              // right short branch
            [13, 15], [15, 16]              // right long branch
        ]
    },
    {
        id: 'jul-cancer',
        nameKey: 'july',
        difficultyKey: 'low',
        starCount: 5,
        distractorMin: 8,
        distractorMax: 8,
        pattern: 'crab-y',
        // Reference-oriented fixed placement for Cancer (screenshot 12.53.02).
        customCoords: [
            [18, 20], // top-left
            [34, 36], // mid-left
            [44, 50], // center pivot
            [70, 63], // right branch
            [40, 78]  // bottom branch
        ],
        edgePairs: [
            [0, 1], [1, 2], // diagonal chain
            [2, 3],         // right arm
            [2, 4]          // bottom arm
        ]
    },
    {
        id: 'aug-leo',
        nameKey: 'august',
        difficultyKey: 'mid',
        starCount: 9,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'lion',
        // Reference-oriented fixed placement for Leo (screenshot 12.55.23).
        customCoords: [
            [24, 74], // left bottom
            [34, 56], // left upper
            [48, 51], // center
            [60, 63], // right mid
            [62, 74], // right bottom
            [40, 68], // bottom mid
            [54, 44], // upper connector
            [64, 20], // top
            [72, 27]  // top-right
        ],
        edgePairs: [
            [0, 1], [1, 2],       // left side
            [2, 3], [3, 4],       // right side
            [4, 5], [5, 0],       // bottom long links
            [2, 6], [6, 7], [7, 8] // upper arc
        ]
    },
    {
        id: 'sep-virgo',
        nameKey: 'september',
        difficultyKey: 'high',
        starCount: 12,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'virgo',
        // Reference-oriented fixed placement for Virgo (screenshot 12.58.41).
        customCoords: [
            [19, 63], // far left
            [38, 54], // left-mid
            [50, 53], // center-left
            [59, 45], // center
            [67, 54], // right-mid
            [65, 66], // lower-right
            [55, 72], // lower-mid
            [40, 75], // lower-left-mid
            [27, 81], // lower-left tip
            [55, 33], // upper-left branch (32: extra left shift)
            [75, 39], // upper-right mid
            [81, 29]  // upper-right tip
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3], // left to center
            [3, 4], [4, 5],         // center to right down
            [5, 6], [6, 2],         // lower diamond side
            [6, 7], [7, 8],         // lower tail
            [3, 9],                 // upper-left short branch
            [4, 10], [10, 11]       // upper-right branch
        ]
    },
    {
        id: 'oct-libra',
        nameKey: 'october',
        difficultyKey: 'low',
        starCount: 8,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'scales',
        // Reference-oriented fixed placement for Libra (screenshot 1.01.10).
        customCoords: [
            [13, 28], // left far
            [24, 40], // left near
            [42, 34], // center-left
            [58, 15], // top
            [82, 30], // right
            [65, 58], // lower-right
            [39, 64], // lower-left
            [39, 80]  // lower tail
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3], // left chain to top
            [3, 4], [4, 5], [5, 3], // right triangle/diamond
            [5, 6], [6, 7]          // lower tail
        ]
    },
    {
        id: 'nov-scorpio',
        nameKey: 'november',
        difficultyKey: 'top',
        starCount: 17,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'scorpion',
        // Fully rebuilt from reference screenshot (2026-02-16 1.14.15).
        customCoords: [
            [20, 63], // 0 left tiny
            [30, 63], // 1 left top-right
            [25, 67], // 2 left center
            [21, 71], // 3 left lower
            [28, 82], // 4 left bottom
            [42, 83], // 5 bottom mid-left
            [55, 80], // 6 bottom mid-right
            [58, 68], // 7 trunk low
            [59, 56], // 8 trunk mid
            [60, 44], // 9 trunk high
            [67, 34], // 10 upper arc 1
            [73, 30], // 11 upper arc 2
            [80, 27], // 12 head-left connector
            [69, 12], // 13 moved upper-left
            [77, 16], // 14 tiny left of top
            [87, 32], // 15 head mid
            [87, 43]  // 16 head low
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3], [3, 4],  // left claw cluster
            [4, 5], [5, 6],                   // bottom sweep
            [6, 7], [7, 8], [8, 9],           // vertical trunk
            [9, 10], [10, 11], [11, 12],      // upper arc
            [13, 14],                         // 14 -> 15
            [14, 12],                         // top tiny branch
            [15, 16],                         // right vertical segment
            [12, 15]                           // head diagonal from body
        ]
    },
    {
        id: 'dec-sagittarius',
        nameKey: 'december',
        difficultyKey: 'top',
        starCount: 19,
        distractorMin: 4,
        distractorMax: 4,
        pattern: 'archer',
        // Rebuilt from reference screenshot (2026-02-16 1.36.09).
        customCoords: [
            [30, 10], // 0 top-left tip
            [32, 17], // 1 top-left lower
            [40, 23], // 2 top-left right
            [45, 37], // 3 center-left node
            [50, 32], // 4 center upper bright
            [57, 34], // 5 center-right node
            [53, 43], // 6 center bottom
            [66, 28], // 7 right upper middle
            [73, 17], // 8 right upper tip
            [71, 40], // 9 right middle
            [80, 40], // 10 right-middle right
            [71, 54], // 11 right lower
            [75, 61], // 12 right tail tip
            [27, 35], // 13 left shoulder
            [15, 45], // 14 far-left
            [22, 66], // 15 left lower middle
            [30, 84], // 16 bottom main
            [43, 75], // 17 bottom right inner
            [50, 86]  // 18 bottom right end
        ],
        edgePairs: [
            [0, 1], [1, 2], [2, 3],         // top-left branch
            [13, 3], [13, 14],              // left shoulder to center and far-left
            [14, 15], [15, 16],             // left descending line
            [16, 17], [16, 18],             // bottom split
            [3, 4], [4, 5],                 // center bow
            [3, 6], [6, 5],                 // small center triangle
            [5, 7], [7, 8],                 // upper-right branch
            [7, 9], [9, 10],                // right upper to right side
            [9, 11], [11, 12]               // right lower tail
        ]
    }
];

const DISTRACTOR_TWEAKS: Record<string, DistractorTweak[]> = {
    'north-dipper': [
        { index: 3, dx: 10, dy: -10 }, // d-3 / 104
        { index: 2, dx: -8 }           // d-2 / 103
    ],
    'feb-aquarius': [
        { index: 2, dx: 30 }           // d-2 / 103
    ],
    'jun-gemini': [
        { index: 2, dx: -10, dy: -10 } // d-2 / 103
    ],
    'aug-leo': [
        { index: 1, dx: -12, dy: -20 } // d-1 / 102
    ],
    'sep-virgo': [
        { index: 1, dx: -8, dy: -8 }   // d-1 / 102
    ],
    'nov-scorpio': [
        { index: 3, dy: 18 },          // d-3 / 104
        { index: 1, dx: -8, dy: -8 }   // d-1 / 102
    ],
    'dec-sagittarius': [
        { index: 3, dx: -8 }           // d-3 / 104
    ]
};

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

const hashSeed = (text: string): number => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const createSeededRandom = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 4294967296;
    };
};

const shuffleWithRandom = <T,>(arr: T[], rnd: () => number): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rnd() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

const pickUnique = <T,>(pool: T[], count: number, rnd: () => number): T[] => {
    if (count <= 0) return [];
    if (count >= pool.length) return shuffleWithRandom(pool, rnd).slice(0, pool.length);
    return shuffleWithRandom(pool, rnd).slice(0, count);
};

const dist = (a: Coord, b: Coord): number => {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.hypot(dx, dy);
};

const samplePolyline = (vertices: Coord[], count: number): Coord[] => {
    if (vertices.length < 2 || count <= 1) {
        return vertices.slice(0, Math.max(1, count));
    }

    const segLengths: number[] = [];
    let total = 0;
    for (let i = 1; i < vertices.length; i += 1) {
        const len = dist(vertices[i - 1], vertices[i]);
        segLengths.push(len);
        total += len;
    }
    if (total <= 0) return Array.from({ length: count }, () => vertices[0]);

    const points: Coord[] = [];
    for (let i = 0; i < count; i += 1) {
        const t = (i / Math.max(1, count - 1)) * total;
        let accum = 0;
        let segIdx = 0;
        while (segIdx < segLengths.length - 1 && accum + segLengths[segIdx] < t) {
            accum += segLengths[segIdx];
            segIdx += 1;
        }
        const segLen = Math.max(0.0001, segLengths[segIdx]);
        const localT = (t - accum) / segLen;
        const a = vertices[segIdx];
        const b = vertices[segIdx + 1];
        points.push([
            a[0] + (b[0] - a[0]) * localT,
            a[1] + (b[1] - a[1]) * localT
        ]);
    }
    return points;
};

const patternVertices = (pattern: PatternType): Coord[] => {
    switch (pattern) {
        case 'dipper':
            // Tuned to resemble the provided Big Dipper reference image.
            return [[16, 24], [36, 29], [45, 40], [56, 51], [74, 57], [66, 73], [54, 66]];
        case 'triangle':
            return [[20, 68], [46, 24], [74, 67], [20, 68]];
        case 'wave':
            return [[12, 50], [24, 34], [36, 55], [48, 39], [60, 58], [72, 43], [84, 62]];
        case 'double-fish':
            return [[14, 34], [28, 26], [42, 38], [56, 52], [70, 42], [84, 30], [70, 58], [54, 70], [38, 62], [24, 74], [14, 66]];
        case 'ram':
            return [[28, 58], [42, 42], [56, 48], [66, 36]];
        case 'horn':
            return [[18, 62], [34, 46], [50, 34], [62, 42], [74, 28], [86, 38]];
        case 'twins':
            return [[24, 28], [24, 66], [36, 52], [48, 30], [60, 66], [72, 36], [72, 70]];
        case 'crab-y':
            return [[24, 62], [40, 44], [56, 62], [72, 44], [56, 34]];
        case 'lion':
            return [[18, 58], [30, 48], [44, 44], [58, 50], [72, 42], [82, 52], [72, 66], [56, 74], [40, 68]];
        case 'virgo':
            return [[18, 30], [30, 42], [42, 34], [54, 46], [66, 40], [78, 54], [70, 68], [56, 74], [42, 66], [30, 78], [20, 66]];
        case 'scales':
            return [[24, 52], [38, 42], [52, 48], [66, 42], [80, 52], [52, 62]];
        case 'scorpion':
            return [[14, 32], [24, 42], [34, 36], [44, 48], [54, 42], [64, 54], [74, 50], [82, 62], [74, 74], [62, 68], [50, 78], [38, 72], [28, 64]];
        case 'archer':
            return [[18, 38], [30, 30], [42, 42], [54, 34], [66, 46], [78, 40], [70, 56], [58, 66], [44, 60], [30, 72], [20, 62]];
        default:
            return [[20, 30], [80, 70]];
    }
};

const buildTargetCoords = (def: ConstellationSetDef): Coord[] => {
    if (def.customCoords && def.customCoords.length >= def.starCount) {
        return def.customCoords.slice(0, def.starCount).map(([x, y]) => [clamp(x, 8, 92), clamp(y, 12, 90)]);
    }

    const rnd = createSeededRandom(hashSeed(def.id));
    const base = samplePolyline(patternVertices(def.pattern), def.starCount);
    return base.map(([x, y]) => [
        clamp(x + (rnd() - 0.5) * 3.2, 8, 92),
        clamp(y + (rnd() - 0.5) * 3.2, 12, 90)
    ]);
};

const getRandomInt = (min: number, max: number, rnd: () => number): number => {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(rnd() * (hi - lo + 1)) + lo;
};

const buildDistractorCoords = (def: ConstellationSetDef, targetCoords: Coord[], distractorCount: number): Coord[] => {
    const rnd = createSeededRandom(hashSeed(`${def.id}-distractors`));
    const coords: Coord[] = [];
    const minGapToTarget = 8.5;
    const minGapToDistractor = 10;
    const boardCenter: Coord = [50, 52];

    const edgePenalty = (p: Coord): number => {
        const marginX = Math.min(p[0] - 8, 92 - p[0]);
        const marginY = Math.min(p[1] - 14, 90 - p[1]);
        const edgeMargin = Math.min(marginX, marginY);
        return Math.max(0, (10 - edgeMargin)) * 2.2;
    };

    // Build wide candidates across the whole board (with jitter) for even distribution.
    const candidates: Coord[] = [];
    const cols = 8;
    const rows = 6;
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const baseX = 10 + (c / (cols - 1)) * 80;
            const baseY = 14 + (r / (rows - 1)) * 76;
            const jitterX = (rnd() - 0.5) * 5.6;
            const jitterY = (rnd() - 0.5) * 5.6;
            candidates.push([clamp(baseX + jitterX, 8, 92), clamp(baseY + jitterY, 14, 90)]);
        }
    }
    // Add extra random candidates for variety.
    for (let i = 0; i < 48; i += 1) {
        candidates.push([8 + rnd() * 84, 14 + rnd() * 76]);
    }

    // Greedy farthest-point sampling for broad, even spread.
    while (coords.length < distractorCount) {
        let best: Coord | null = null;
        let bestScore = -1;

        for (let i = 0; i < candidates.length; i += 1) {
            const candidate = candidates[i];
            const minTargetDist = targetCoords.reduce((m, t) => Math.min(m, dist(t, candidate)), Infinity);
            if (minTargetDist < minGapToTarget) continue;

            const minDistractorDist = coords.length > 0
                ? coords.reduce((m, d) => Math.min(m, dist(d, candidate)), Infinity)
                : Infinity;
            if (minDistractorDist < minGapToDistractor) continue;

            // Spread widely but avoid sticking too close to the outer border.
            const centerDist = dist(candidate, boardCenter);
            const centerBias = Math.max(0, 38 - centerDist) * 0.25;
            const score =
                minTargetDist +
                (minDistractorDist === Infinity ? 0 : minDistractorDist * 1.2) +
                centerBias -
                edgePenalty(candidate);
            if (score > bestScore) {
                bestScore = score;
                best = candidate;
            }
        }

        if (best == null) {
            // Fallback: relaxed random pick to avoid deadlock in tight layouts.
            let picked = false;
            for (let retry = 0; retry < 200; retry += 1) {
                const candidate: Coord = [8 + rnd() * 84, 14 + rnd() * 76];
                const nearTarget = targetCoords.some((t) => dist(t, candidate) < 6.5);
                const nearDistractor = coords.some((d) => dist(d, candidate) < 8);
                if (!nearTarget && !nearDistractor) {
                    coords.push(candidate);
                    picked = true;
                    break;
                }
            }
            if (!picked) break;
        } else {
            coords.push(best);
        }
    }

    return coords;
};

const buildSetSession = (def: ConstellationSetDef, sessionNonce: number, runSeed: number): SetSession => {
    const rnd = createSeededRandom(hashSeed(`${def.id}-session-${sessionNonce}-run-${runSeed}`));
    const targetCoords = buildTargetCoords(def);
    const distractorCount = getRandomInt(def.distractorMin, def.distractorMax, rnd);
    const distractorCoords = buildDistractorCoords(def, targetCoords, distractorCount);

    const targetValues = pickUnique(PRODUCT_VALUES, def.starCount, rnd);
    const remainingPool = PRODUCT_VALUES.filter((v) => !targetValues.includes(v));
    const distractorValues = pickUnique(remainingPool.length > 0 ? remainingPool : PRODUCT_VALUES, distractorCoords.length, rnd);

    const targetStars: StarNode[] = targetCoords.map((coord, idx) => ({
        id: `t-${idx}`,
        x: coord[0],
        y: coord[1],
        value: targetValues[idx % targetValues.length],
        isTarget: true
    }));
    const distractorStars: StarNode[] = distractorCoords.map((coord, idx) => ({
        id: `d-${idx}`,
        x: coord[0],
        y: coord[1],
        value: distractorValues[idx % distractorValues.length],
        isTarget: false
    }));
    const tweaks = DISTRACTOR_TWEAKS[def.id] ?? [];
    tweaks.forEach(({ index, dx = 0, dy = 0 }) => {
        const star = distractorStars[index];
        if (!star) return;
        star.x = clamp(star.x + dx, 8, 92);
        star.y = clamp(star.y + dy, 14, 90);
    });

    const stars = [...targetStars, ...distractorStars];
    const targetOrder = shuffleWithRandom(targetStars.map((star) => star.id), rnd);
    const edges: Array<[string, string]> = (def.edgePairs && def.edgePairs.length > 0)
        ? def.edgePairs
            .filter(([a, b]) => a >= 0 && b >= 0 && a < targetStars.length && b < targetStars.length)
            .map(([a, b]) => [targetStars[a].id, targetStars[b].id] as [string, string])
        : targetStars.slice(0, -1).map((star, i) => [star.id, targetStars[i + 1].id] as [string, string]);

    const targetStarById = new Map(targetStars.map((star) => [star.id, star] as const));
    const questions: Question[] = targetOrder.map((targetId) => {
        const star = targetStarById.get(targetId)!;
        const pairs = FACTOR_MAP.get(star.value) ?? [[1, star.value]];
        const pairsWithoutOne = pairs.filter(([a, b]) => a > 1 && b > 1);
        const usable = pairsWithoutOne.length > 0 ? pairsWithoutOne : pairs;
        const selected = usable[Math.floor(rnd() * usable.length)];
        return {
            a: selected[0],
            b: selected[1],
            answer: star.value,
            targetId
        };
    });

    return {
        def,
        stars,
        edges,
        questions,
        targetOrder
    };
};

const getSessionSignature = (session: SetSession): string =>
    session.questions.map((q) => `${q.a}x${q.b}=${q.answer}->${q.targetId}`).join('|');

export const ConstellationFinder: React.FC<ConstellationFinderProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const SHOW_DEBUG_CONTROLS = false;
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 9999,
        maxDifficulty: 3
    });

    const runSeedRef = React.useRef(Math.floor(Date.now() % 1000000000));
    const sessionNonceRef = React.useRef(0);
    const lastSessionSignatureBySetRef = React.useRef<Record<string, string>>({});
    const lastTargetOrderBySetRef = React.useRef<Record<string, string>>({});
    const seenSessionKeysBySetRef = React.useRef<Record<string, Set<string>>>({});
    const [setIndex, setSetIndex] = React.useState(0);
    const [session, setSession] = React.useState<SetSession>(() => buildSetSession(SETS[0], 0, runSeedRef.current));
    const [litTargetIds, setLitTargetIds] = React.useState<string[]>([]);
    const [questionIndex, setQuestionIndex] = React.useState(0);
    const [setCleared, setSetCleared] = React.useState(false);
    const [wrongStarId, setWrongStarId] = React.useState<string | null>(null);
    const [lastSolved, setLastSolved] = React.useState<Question | null>(null);
    const [debugRevealTargets, setDebugRevealTargets] = React.useState(false);

    const wrongFlashTimerRef = React.useRef<number | null>(null);
    const prevGameStateRef = React.useRef(engine.gameState);

    const clearWrongFlashTimer = React.useCallback(() => {
        if (wrongFlashTimerRef.current != null) {
            window.clearTimeout(wrongFlashTimerRef.current);
            wrongFlashTimerRef.current = null;
        }
    }, []);

    const resetSet = React.useCallback((nextIndex: number) => {
        const safeIndex = ((nextIndex % SETS.length) + SETS.length) % SETS.length;
        const def = SETS[safeIndex];
        // Re-mix seed on every set start so the same set does not restart
        // with an identical mission bundle after re-entry.
        runSeedRef.current = (
            (Math.imul(runSeedRef.current, 1664525) + 1013904223 + Math.floor(Math.random() * 1000003)) >>> 0
        );
        const prevSignature = lastSessionSignatureBySetRef.current[def.id];
        const prevOrder = lastTargetOrderBySetRef.current[def.id];
        const seenKeys = (seenSessionKeysBySetRef.current[def.id] ??= new Set<string>());
        let nextSession: SetSession | null = null;
        let nextSignature = '';
        let nextOrder = '';
        let nextKey = '';

        // Ensure a newly started set gets a fresh mission bundle (avoid exact repeat).
        for (let attempt = 0; attempt < 24; attempt += 1) {
            sessionNonceRef.current += 1;
            const candidate = buildSetSession(def, sessionNonceRef.current, runSeedRef.current);
            const signature = getSessionSignature(candidate);
            const order = candidate.targetOrder.join('|');
            const key = `${signature}##${order}`;
            nextSession = candidate;
            nextSignature = signature;
            nextOrder = order;
            nextKey = key;
            const signatureChanged = !prevSignature || signature !== prevSignature;
            const orderChanged = !prevOrder || order !== prevOrder;
            const unseen = !seenKeys.has(key);
            if (signatureChanged && orderChanged && unseen) break;
        }

        if (!nextSession) {
            sessionNonceRef.current += 1;
            nextSession = buildSetSession(def, sessionNonceRef.current, runSeedRef.current);
            nextSignature = getSessionSignature(nextSession);
            nextOrder = nextSession.targetOrder.join('|');
            nextKey = `${nextSignature}##${nextOrder}`;
        }

        lastSessionSignatureBySetRef.current[def.id] = nextSignature;
        lastTargetOrderBySetRef.current[def.id] = nextOrder;
        seenKeys.add(nextKey);
        setSetIndex(safeIndex);
        setSession(nextSession);
        setLitTargetIds([]);
        setQuestionIndex(0);
        setSetCleared(false);
        setWrongStarId(null);
        setLastSolved(null);
    }, []);

    React.useEffect(() => {
        return () => {
            clearWrongFlashTimer();
        };
    }, [clearWrongFlashTimer]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            setDebugRevealTargets(false);
            resetSet(0);
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, resetSet]);

    const currentQuestion = session.questions[questionIndex] ?? null;
    const litSet = React.useMemo(() => new Set(litTargetIds), [litTargetIds]);
    const starById = React.useMemo(() => {
        const map = new Map<string, StarNode>();
        session.stars.forEach((s) => map.set(s.id, s));
        return map;
    }, [session.stars]);

    const getDebugStableLabel = React.useCallback((star: StarNode): string => {
        if (!debugRevealTargets) return String(star.value);
        const [, rawIndex] = star.id.split('-');
        const index = Number(rawIndex);
        if (Number.isNaN(index)) return String(star.value);
        // In debug-set mode, show stable numeric labels for precise star targeting.
        return star.isTarget ? String(index + 1) : String(101 + index);
    }, [debugRevealTargets]);

    const onStarClick = React.useCallback((starId: string) => {
        if (engine.gameState !== 'playing' || setCleared || !currentQuestion) return;
        if (litSet.has(starId)) return;

        const isCorrect = starId === currentQuestion.targetId;
        // Combo is counted per in-set mission (one star answer), not per whole set.
        engine.updateCombo(isCorrect);
        engine.submitAnswer(isCorrect, { skipDifficulty: true, skipFeedback: true, skipCombo: true });
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' });

        if (!isCorrect) {
            setWrongStarId(starId);
            clearWrongFlashTimer();
            wrongFlashTimerRef.current = window.setTimeout(() => {
                setWrongStarId(null);
                wrongFlashTimerRef.current = null;
            }, 360);
            return;
        }

        setLastSolved(currentQuestion);
        setWrongStarId(null);
        const nextLit = [...litTargetIds, starId];
        setLitTargetIds(nextLit);
        if (nextLit.length >= session.targetOrder.length) {
            setSetCleared(true);
            return;
        }
        setQuestionIndex((prev) => prev + 1);
    }, [engine, setCleared, currentQuestion, litSet, clearWrongFlashTimer, litTargetIds, session.targetOrder.length]);

    const onNextSet = React.useCallback(() => {
        if (!setCleared || engine.gameState !== 'playing') return;
        resetSet((setIndex + 1) % SETS.length);
    }, [setCleared, engine.gameState, resetSet, setIndex]);

    const onDebugSetChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextIndex = Number(event.target.value);
        if (Number.isNaN(nextIndex)) return;
        setDebugRevealTargets(true);
        resetSet(nextIndex);
    }, [resetSet]);

    const setName = t(`games.constellation-finder.sets.${session.def.nameKey}`);
    const progressText = `${litTargetIds.length}/${session.targetOrder.length}`;
    const targetExpression = setCleared && lastSolved
        ? `${lastSolved.a} × ${lastSolved.b} = ${lastSolved.answer}`
        : (currentQuestion ? `${currentQuestion.a} × ${currentQuestion.b} = ?` : '1 × 1 = ?');

    const powerUps = React.useMemo<PowerUpBtnProps[]>(() => [
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue',
            icon: '❄️',
            title: 'Freeze Time',
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' : 'normal'
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red',
            icon: '❤️',
            title: 'Extra Life',
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' : 'normal'
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow',
            icon: '⚡',
            title: 'Double Score',
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' : 'normal'
        }
    ], [engine]);

    return (
        <Layout3
            className="constellation-finder-layout"
            title={t('games.constellation-finder.title')}
            subtitle={t('games.constellation-finder.subtitle')}
            description={t('games.constellation-finder.description')}
            gameId={GameIds.MATH_CONSTELLATION_FINDER}
            engine={engine}
            onExit={onExit}
            instructions={[
                {
                    icon: '🌌',
                    title: t('games.constellation-finder.howToPlay.step1.title'),
                    description: t('games.constellation-finder.howToPlay.step1.description')
                },
                {
                    icon: '🧮',
                    title: t('games.constellation-finder.howToPlay.step2.title'),
                    description: t('games.constellation-finder.howToPlay.step2.description')
                },
                {
                    icon: '✅',
                    title: t('games.constellation-finder.howToPlay.step3.title'),
                    description: t('games.constellation-finder.howToPlay.step3.description')
                }
            ]}
            powerUps={powerUps}
            target={{ value: targetExpression, label: progressText }}
            cardBackground={<div className="constellation-night-bg" />}
        >
            <div className="constellation-finder-shell">
                {SHOW_DEBUG_CONTROLS && (
                    <div className="constellation-debug-row">
                        <span className="constellation-debug-label">DEBUG SET</span>
                        <select className="constellation-debug-select" value={setIndex} onChange={onDebugSetChange}>
                            {SETS.map((set, idx) => (
                                <option key={set.id} value={idx}>
                                    {idx + 1}. {t(`games.constellation-finder.sets.${set.nameKey}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="constellation-finder-board">
                    <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        {(setCleared || debugRevealTargets) && session.edges.map(([fromId, toId], idx) => {
                            const from = starById.get(fromId);
                            const to = starById.get(toId);
                            if (!from || !to) return null;
                            return (
                                <line
                                    key={`${fromId}-${toId}-${idx}`}
                                    x1={from.x}
                                    y1={from.y}
                                    x2={to.x}
                                    y2={to.y}
                                    className="constellation-line"
                                />
                            );
                        })}
                    </svg>

                    {session.stars.map((star) => {
                        const isLit = litSet.has(star.id);
                        const isWrong = wrongStarId === star.id;
                        const starClass = [
                            'constellation-star',
                            star.isTarget ? 'target-star' : 'distractor-star',
                            debugRevealTargets && star.isTarget ? 'debug-reveal' : '',
                            isLit ? 'lit' : '',
                            isWrong ? 'wrong' : ''
                        ].filter(Boolean).join(' ');
                        return (
                            <button
                                key={star.id}
                                type="button"
                                className={starClass}
                                style={{ left: `${star.x}%`, top: `${star.y}%`, transform: 'translate(-50%, -50%)' }}
                                onClick={() => onStarClick(star.id)}
                                disabled={engine.gameState !== 'playing' || setCleared}
                                aria-label={`star-${star.id}`}
                            >
                                <span>{getDebugStableLabel(star)}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="constellation-guide" aria-live="polite">
                    {!setCleared ? (
                        <div className="constellation-guide-title">
                            {t('games.constellation-finder.ui.solveGuide')}
                        </div>
                    ) : (
                        <div className="constellation-guide-title">
                            {t('games.constellation-finder.ui.clearedTitle', { name: setName })}
                        </div>
                    )}
                </div>

                {setCleared && (
                    <button type="button" className="constellation-next-btn" onClick={onNextSet}>
                        <span className="constellation-next-icon">✓</span>
                    </button>
                )}
            </div>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_CONSTELLATION_FINDER,
    title: 'Constellation Finder',
    titleKey: 'games.constellation-finder.title',
    subtitle: 'Light up the stars!',
    subtitleKey: 'games.constellation-finder.subtitle',
    description: 'Solve multiplication and find the matching stars.',
    descriptionKey: 'games.constellation-finder.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: ConstellationFinder,
    thumbnail: '⭐',
    tagsKey: 'games.tags.multiplication'
};

export default ConstellationFinder;
