import React from 'react';
import type { GameCategory } from '../games/types';

export const CATEGORY_ICONS: Record<GameCategory, string> = {
    math: 'fas fa-calculator',
    brain: 'fas fa-brain',
    science: 'fas fa-gear',
    play: 'fab fa-bilibili'
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
        'whack-hammer': '#ffe4ef', // rose-100 (Mouse Whack custom hammer)
        '🧱': '#fed7aa', // orange-200
        '🍭': '#ddd6fe', // violet-200
        '🤿': '#cffafe', // cyan-100
        '🍕': '#fecaca', // red-200
        '🛸': '#e9d5ff', // purple-200
        '🚀': '#bfdbfe', // blue-200
        '8': '#dbeafe', // blue-100 (Neon Matrix)
        // Math level 3 games
        '📦': '#fef3c7', // amber-100
        '🧊': '#cffafe', // cyan-100
        '🟧': '#ffedd5', // orange-100 (quad marker for Floor Tiler)
        '🐸': '#dcfce7', // green-100
        '🪙': '#fde68a', // amber-200
        '🧫': '#e9d5ff', // purple-200
        '🍀': '#d1fae5', // emerald-100
        '🫧': '#dbeafe', // blue-100
        '⬢': '#fef9c3', // yellow-100
        '📜': '#ffedd5', // orange-100
        '⭐': '#fef3c7', // amber-100
        '🧌': '#fecaca', // red-200
        '🧙🏿‍♂️': '#ddd6fe', // violet-200
        // Brain games
        '🔗': '#fce7f3', // pink-100
        '🔴': '#fce7f3', // pink-100 (for quad thumbnails)
        '👯': '#f3e8ff', // purple-100
        '🧩': '#d1fae5', // emerald-100
        '🐒': '#fef9c3', // yellow-100
        '🍽️': '#fef3c7', // amber-100
        '🎨': '#fce7f3', // pink-100
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
    if (!thumbnail) return <i className={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}></i>;

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

    // Neon Matrix icon: neon 8 + glow
    if (typeof thumbnail === 'string' && thumbnail === '8') {
        return (
            <span
                style={{
                    color: '#60c7ff',
                    fontWeight: 900,
                    display: 'inline-block',
                    transform: 'scale(1.06)',
                    textShadow: '0 0 5px rgba(96,199,255,0.92), 0 0 12px rgba(37,99,235,0.62), 0 0 22px rgba(30,58,138,0.56)'
                }}
            >
                8
            </span>
        );
    }

    // Mouse Whack icon: cute pink hammer
    if (typeof thumbnail === 'string' && thumbnail === 'whack-hammer') {
        return (
            <span
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'inline-block'
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        left: '52%',
                        top: '47%',
                        width: '64%',
                        height: '70%',
                        transform: 'translate(-50%, -50%) rotate(25deg)',
                        transformOrigin: '50% 50%'
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '63%',
                            width: '28%',
                            height: '56%',
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '999px',
                            border: '1.5px solid rgba(69,115,110,0.45)',
                            background: 'linear-gradient(180deg, #9df0da 0%, #6fd7bd 100%)',
                            boxShadow: '0 2px 0 rgba(64,121,109,0.35)'
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '28%',
                            width: '74%',
                            height: '34%',
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '999px',
                            border: '1.5px solid rgba(124,76,106,0.45)',
                            background:
                                'radial-gradient(circle at 28% 34%, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0) 42%), linear-gradient(180deg, #ffb4d5 0%, #ff8dc0 100%)',
                            boxShadow: '0 2px 0 rgba(154,86,128,0.45), 0 4px 8px rgba(80,34,57,0.2)'
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            left: '62%',
                            top: '27%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '0.34em',
                            fontWeight: 900,
                            color: 'rgba(255,255,255,0.96)',
                            textShadow: '0 1px 0 rgba(177,89,137,0.4)'
                        }}
                    >
                        ★
                    </span>
                </span>
            </span>
        );
    }

    // Regular emoji or React node
    return <span>{thumbnail}</span>;
};
