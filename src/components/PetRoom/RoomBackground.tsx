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
                {currentBackground === 'sweet_ground' && <SweetGround />}
                {currentBackground === 'night_city' && <NightCityGround />}
                {currentBackground === 'layout1_template' && <Layout1Template />}
                {currentBackground === 'shape_ground' && <ShapeGround />}
            </div>
            <div className="room-floor" />
        </div>
    );
});

const FrontBuildings = () => (
    <>
        {/* Individual Buildings for Front Layer (Allows per-building 3D shading) */}
        <div className="building f1" />
        <div className="building f2" />
        <div className="building f3" />
        <div className="building f4" />
        <div className="building f5" />
        <div className="building f6" />
        <div className="building f7" />
        <div className="building f8" />
    </>
);

const NightCityGround = React.memo(() => (
    <>
        <div className="night-sky-gradient" />
        <div className="city-moon">🌙</div>
        <div className="city-stars">
            <div className="star-blink s1" />
            <div className="star-blink s2" />
            <div className="star-blink s3" />
            <div className="star-blink s4" />
            <div className="star-blink s5" />
            <div className="star-blink s6" />
            <div className="star-blink s7" />
            <div className="star-blink s8" />
            <div className="star-blink s9" />
            <div className="star-blink s10" />
        </div>

        {/* Layer 3: Back (Furthest) */}
        <div className="city-layer-back" />

        {/* Layer 2: Middle */}
        <div className="city-layer-middle" />

        {/* Layer 1: Front (Clarkest/Detailed) */}
        <div className="city-layer-front">
            <FrontBuildings />
        </div>

        {/* Road (Below Horizon) */}
        <div className="city-road">
            <div className="traffic-flow flow-right" />
            <div className="traffic-flow flow-left" />
        </div>

        {/* Reflection (All Layers Flipped) */}
        <div className="city-reflection">
            <div className="city-layer-back" />
            <div className="city-layer-middle" />
            <div className="city-layer-front">
                <FrontBuildings />
            </div>
        </div>
    </>
));

// Sub-components for Optimization
const SweetGround = React.memo(() => (
    <>
        <div className="rainbow-sky" />
        <div className="cloud-candy-1" />
        <div className="cloud-candy-2" />
        <div className="star-candy-1" />
        <div className="star-candy-2" />
        <div className="star-candy-3" />
        <div className="star-candy-4" />
        <div className="wrapped-candy-1">
            <div className="candy-body" />
        </div>
        <div className="wrapped-candy-2">
            <div className="candy-body" />
        </div>
        <div className="ice-cream-mountain" />
        <div className="ice-cream-mountain-small" />
        <div className="ice-cream-boat">
            <div className="boat-ripple" />
            <div className="cone-body" />
            <div className="scoop-1" />
            <div className="scoop-2" />
            <div className="scoop-3" />
        </div>
    </>
));

const Layout1Template = React.memo(() => (
    <>
        {/* Placeholder for Middle Layer (e.g., Mountain/Iceberg) */}
        <div className="layout1-middle-placeholder" />
        <div className="layout1-structure-reference">
            {/* Visual Guide for Reference 
            <div style={{ position: 'absolute', top: '50%', width: '100%', borderTop: '1px dashed red' }} />
            */}
        </div>
    </>
));

const ShapeGround = React.memo(() => {
    // Generate random floating shapes localized to this component
    const shapeElements = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => {
            const types = ['circle', 'triangle', 'square'];
            const type = types[Math.floor(Math.random() * types.length)];
            const size = 15 + Math.random() * 35;
            return {
                id: i,
                type,
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 60 + 5}%`,
                size: `${size}px`,
                delay: `${Math.random() * 5}s`,
                duration: `${3 + Math.random() * 4}s`,
                color: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})`
            };
        });
    }, []);

    return (
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
            <div className="shape-lake" />
            <div className="shape-structure structure-left" />
            <div className="shape-structure structure-right" />
            <div className="shape-star star-1" />
            <div className="shape-star star-2" />
            <div className="shape-star star-3" />
        </>
    );
});
