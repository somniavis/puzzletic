import React, { useMemo } from 'react';
import './PetRoom.css';

interface RoomBackgroundProps {
    background: string;
    showGiftBox: boolean;
    lightningStyle?: React.CSSProperties;
}

export const RoomBackground: React.FC<RoomBackgroundProps> = React.memo(({
    background,
    showGiftBox,
    lightningStyle
}) => {
    // Generate static random trees for Forest background
    const forestTrees = useMemo(() => {
        return Array.from({ length: 100 }).map((_, i) => {
            const bottomVal = 64 + Math.random() * 2; // 64% to 66% (Top 34% to 36%)
            return {
                id: i,
                type: Math.random() > 0.5 ? '🌲' : '🌳',
                left: `${Math.random() * 96 + 2}%`, // 2% to 98%
                bottom: `${bottomVal}%`,
                fontSize: `${13.6 + Math.random() * 13.6}px`, // 85% of 16px-32px (13.6px-27.2px)
                zIndex: Math.floor(100 - bottomVal), // Lower bottom (closer) -> Higher z-index
            };
        });
    }, []);

    const currentBackground = showGiftBox ? 'default_ground' : background;

    return (
        <div className={`room-background ${currentBackground}`}>
            <div className="room-wall">
                {currentBackground === 'tropical_ground' && (
                    <>
                        <div className="cloud-1" />
                        <div className="cloud-2" />
                        <div className="sand-island">
                            <div className="island-palm-1">🌴</div>
                            <div className="island-palm-2">🌴</div>
                            <div className="island-palm-3">🌴</div>
                        </div>
                    </>
                )}
                {currentBackground === 'desert_ground' && (
                    <>
                        <div className="sand-dune dune-large" />
                        <div className="sand-dune dune-small" />
                        {/* Far Dunes (Right) */}
                        <div className="sand-dune dune-far-large" />
                        <div className="sand-dune dune-far-small" />
                        {/* Sandstorm Animation */}
                        <div className="sandstorm-1" />
                        <div className="sandstorm-2" />
                        {/* Cactus */}
                        <div className="cactus">🌵</div>
                        <div className="cactus-small">🌵</div>
                    </>
                )}
                {currentBackground === 'forest_ground' && (
                    <>
                        <div className="forest-mountain mountain-large" />
                        <div className="forest-mountain mountain-small" />
                        {/* Right Side Mountains (Smaller) */}
                        <div className="forest-mountain mountain-right-large" />
                        <div className="forest-mountain mountain-right-small" />
                        {/* Left Side Mountains (Smaller) */}
                        <div className="forest-mountain mountain-left-large" />
                        <div className="forest-mountain mountain-left-small" />
                        {/* Random Trees */}
                        {forestTrees.map((tree) => (
                            <div
                                key={tree.id}
                                className="forest-tree"
                                style={{
                                    left: tree.left,
                                    bottom: tree.bottom,
                                    fontSize: tree.fontSize,
                                    zIndex: tree.zIndex,
                                }}
                            >
                                {tree.type}
                            </div>
                        ))}
                        {/* Forest Lake */}
                        <div className="forest-lake" />
                    </>
                )}
                {currentBackground === 'volcanic_ground' && (
                    <>
                        <div className="volcano-2" />
                        <div className="volcano" />
                        <div className="volcano-smoke-main-1" />
                        <div className="volcano-smoke-main-2" />
                        <div className="volcano-smoke-main-3" />
                        <div className="volcano-smoke-main-4" />
                        <div className="volcano-smoke-main-5" />
                        <div className="volcano-smoke-main-6" />
                        <div className="volcano-smoke-small-1" />
                        <div className="volcano-smoke-small-2" />
                        <div className="volcano-smoke-small-3" />
                        <div className="volcano-smoke-small-3" />
                        <div
                            className="volcano-lightning"
                            style={lightningStyle}
                        />
                    </>
                )}
                {currentBackground === 'arctic_ground' && (
                    <>
                        <div className="aurora" />
                        <div className="star-1" />
                        <div className="star-2" />
                        <div className="star-3" />
                        <div className="star-4" />
                        <div className="iceberg-1" />
                    </>
                )}
            </div>
            <div className="room-floor" />
        </div>
    );
});
