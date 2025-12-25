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

    // Generate random floating shapes for Shape Land
    const shapeElements = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => {
            const types = ['circle', 'triangle', 'square'];
            const type = types[Math.floor(Math.random() * types.length)];
            const size = 15 + Math.random() * 35; // 15px ~ 50px
            return {
                id: i,
                type,
                left: `${Math.random() * 90 + 5}%`, // 5% ~ 95%
                top: `${Math.random() * 60 + 5}%`, // 5% ~ 65% (Air)
                size: `${size}px`,
                delay: `${Math.random() * 5}s`,
                duration: `${3 + Math.random() * 4}s`, // 3s ~ 7s
                color: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})` // Semi-transparent white
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
                {currentBackground === 'shape_ground' && (
                    <>
                        <div className="shape-bg-gradient" />
                        {shapeElements.map((shape) => (
                            <div
                                key={shape.id}
                                className={`shape-item shape-${shape.type}`}
                                style={{
                                    left: shape.left,
                                    top: shape.top,
                                    width: shape.size,
                                    height: shape.size,
                                    animationDelay: shape.delay,
                                    animationDuration: shape.duration,
                                    opacity: 0.6
                                }}
                            />
                        ))}
                        {/* Middle Layer: Shape Lake */}
                        <div className="shape-lake" />

                        {/* Decorative Large Shapes */}
                        <div className="shape-structure structure-left" />
                        <div className="shape-structure structure-right" />
                        <div className="shape-star star-1" />
                        <div className="shape-star star-2" />
                        <div className="shape-star star-3" />
                    </>
                )}
            </div>
            <div className="room-floor" />
        </div>
    );
});
