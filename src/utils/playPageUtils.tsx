import React from 'react';
import type { GameCategory } from '../games/types';

export const CATEGORY_ICONS: Record<GameCategory, string> = {
    math: 'fa-calculator',
    brain: 'fa-brain',
    science: 'fa-gear',
    sw: 'fa-code'
};

// Emoji-based icon background colors
export const getIconBackground = (thumbnail: string | React.ReactNode | undefined): string => {
    if (typeof thumbnail !== 'string') return '#eef2ff';

    // Map emoji to pastel background colors
    const emojiColorMap: Record<string, string> = {
        // Math games
        '🐟': '#e0f2fe', // sky-100
        '🌀': '#e0f2fe', // sky-100 (Round Counting)
        '🐝': '#fef3c7', // amber-100
        '⚖️': '#dbeafe', // blue-100
        '🍎': '#ffe4e6', // rose-100
        '🏹': '#d1fae5', // emerald-100
        '🧱': '#fed7aa', // orange-200
        '🍭': '#ddd6fe', // violet-200
        '🤿': '#cffafe', // cyan-100
        '🍕': '#fecaca', // red-200
        '🛸': '#e9d5ff', // purple-200
        '🚀': '#bfdbfe', // blue-200
        // Brain games
        '🔗': '#fce7f3', // pink-100
        '🔴': '#fce7f3', // pink-100 (for quad thumbnails)
        '👯': '#f3e8ff', // purple-100
        '🧩': '#d1fae5', // emerald-100
        '🐒': '#fef9c3', // yellow-100
        '🍽️': '#fef3c7', // amber-100
        '🔍': '#dbeafe', // blue-100
        '📡': '#ccfbf1', // teal-100
        '🐾': '#ffedd5', // orange-100 (Maze Hunter - distinct from amber)
        '🏕️': '#d1fae5', // emerald-100 (Maze Escape)
        '🦉': '#ecfccb', // lime-200 (Wild Link - Jungle theme)
        '🦢': '#e0f2fe', // sky-100 (Wild Link swan)
        '🍌': '#fef9c3', // yellow-100 (Pair Up Connect banana)
        '⚫': '#ffedd5', // Omok - Match Maze Hunter
    };

    // Extract searchable content (for quad: format, use the emoji part)
    const searchContent = thumbnail.startsWith('quad:') ? thumbnail.slice(5) : thumbnail;

    // Find matching emoji
    for (const [emoji, color] of Object.entries(emojiColorMap)) {
        if (searchContent.includes(emoji)) return color;
    }

    return '#eef2ff'; // default indigo-50
};

// Custom thumbnail renderer for special cases
export const renderThumbnail = (thumbnail: string | React.ReactNode | undefined, category: string) => {
    if (!thumbnail) return <i className={`fas ${CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}`}></i>;

    // Quad grid format: "quad:TL,TR,BL,BR" (4-quadrant layout)
    // Example: "quad:🔴,,,🔴" = top-left and bottom-right
    if (typeof thumbnail === 'string' && thumbnail.startsWith('quad:')) {
        const parts = thumbnail.slice(5).split(',');
        const [tl, tr, bl, br] = parts;
        const quadTextStyle: React.CSSProperties = {
            fontSize: '0.7em',
            color: '#111827',
            fontWeight: 900
        };
        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {tl && <span style={{ ...quadTextStyle, position: 'absolute', top: '35%', left: '35%', transform: 'translate(-50%, -50%)' }}>{tl}</span>}
                {tr && <span style={{ ...quadTextStyle, position: 'absolute', top: '35%', right: '35%', transform: 'translate(50%, -50%)' }}>{tr}</span>}
                {bl && <span style={{ ...quadTextStyle, position: 'absolute', bottom: '35%', left: '35%', transform: 'translate(-50%, 50%)' }}>{bl}</span>}
                {br && <span style={{ ...quadTextStyle, position: 'absolute', bottom: '35%', right: '35%', transform: 'translate(50%, 50%)' }}>{br}</span>}
            </div>
        );
    }

    // HTTP URL image
    if (typeof thumbnail === 'string' && thumbnail.startsWith('http')) {
        return <img src={thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />;
    }

    // Hex Hive icon: yellow + slightly larger
    if (typeof thumbnail === 'string' && thumbnail === '⬢') {
        return <span style={{ color: '#facc15', display: 'inline-block', transform: 'scale(1.3)' }}>{thumbnail}</span>;
    }

    // Regular emoji or React node
    return <span>{thumbnail}</span>;
};
