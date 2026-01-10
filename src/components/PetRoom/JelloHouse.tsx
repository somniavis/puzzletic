import React, { useMemo } from 'react';
import './JelloHouse.css';

interface JelloHouseProps {
    type: string; // 'tent', 'church', etc.
    isSleeping: boolean;
    onClick: () => void;
    style?: React.CSSProperties;
}

// House Config - Emojis and styles
const HOUSE_CONFIG: Record<string, { icon: string; size: number }> = {
    tent: { icon: '⛺', size: 1 },
    old_house: { icon: '🏚️', size: 1 },
    house: { icon: '🏠', size: 1.1 },
    garden_house: { icon: '🏡', size: 1.1 },
    building: { icon: '🏢', size: 1.3 },
    hotel: { icon: '🏨', size: 1.3 },
    factory: { icon: '🏭', size: 1.3 },
    circus: { icon: '🎪', size: 1.3 },
    stadium: { icon: '🏟️', size: 1.4 },
    church: { icon: '⛪', size: 1.2 },
    mosque: { icon: '🕌', size: 1.2 },
    hindu_temple: { icon: '🛕', size: 1.2 },
    synagogue: { icon: '🕍', size: 1.2 },
    greek_temple: { icon: '🏛️', size: 1.3 },
    kaaba: { icon: '🕋', size: 1.2 },
    japanese_castle: { icon: '🏯', size: 1.4 },
    european_castle: { icon: '🏰', size: 1.5 },
};

export const JelloHouse: React.FC<JelloHouseProps> = ({
    type = 'tent',
    isSleeping,
    onClick,
    style,
}) => {
    const config = HOUSE_CONFIG[type] || HOUSE_CONFIG.tent;

    // Generate Zzz bubbles
    const zzzBubbles = useMemo(() => {
        if (!isSleeping) return [];
        return Array.from({ length: 3 }).map((_, i) => ({
            id: i,
            delay: i * 1.5,
        }));
    }, [isSleeping]);

    return (
        <div
            className={`jello-house ${isSleeping ? 'is-sleeping' : ''}`}
            onClick={onClick}
            style={{
                ...style,
                fontSize: `min(${config.size * 4}rem, ${config.size * 10}vw)`, // Responsive sizing
            }}
        >
            <div className="house-icon">{config.icon}</div>

            {isSleeping && (
                <div className="zzz-container">
                    {zzzBubbles.map(z => (
                        <span
                            key={z.id}
                            className="zzz-bubble"
                            style={{ animationDelay: `${z.delay}s` }}
                        >
                            Zzz
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
