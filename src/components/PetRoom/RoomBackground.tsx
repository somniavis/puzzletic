import React, { useMemo } from 'react';
import './PetRoom.css';
import './styles/DeepSea.css';
import './styles/AmusementPark.css';

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
                {currentBackground === 'amusement_park_ground' && <AmusementParkGround />}
                {currentBackground === 'deep_sea_ground' && <DeepSeaGround />}
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
        <div className="cloud-candy-2">
            <div className="candy-rain">
                <div className="star-drop d1" />
                <div className="star-drop d2" />
                <div className="star-drop d3" />
                <div className="star-drop d4" />
                <div className="star-drop d5" />
            </div>
        </div>
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

const AmusementParkGround = React.memo(() => (
    <>
        {/* Phase 1: Left Horizontal Island */}
        <div className="am-island-left">
            {/* Base Island Shape (handled by CSS) */}

            {/* Decorations on the Island */}
            <div className="am-item ferris-wheel">🎡</div>
            <div className="am-item roller-coaster">🎢</div>
            <div className="am-item slide">🛝</div>
            <div className="am-item circus-tent">🎪</div>
            <div className="am-item carousel">🎠</div>

            {/* Floating Balloons Effect */}
            <div className="am-balloon b1">🎈</div>
            <div className="am-balloon b2">🎈</div>
            <div className="am-balloon b3">🎈</div>
        </div>

        {/* Static Rail Line (Global Context) */}
        <div className="am-rail" />

        {/* Sky Train (Global Context) */}
        <div className="am-train-container">
            <div className="am-train">🚂🚃🚃🚃</div>
        </div>

        {/* Pure CSS Fireworks Effect */}
        <div className="am-firework fw1"></div>
        <div className="am-firework fw2"></div>
        <div className="am-firework fw3"></div>

        {/* Structure Reference (Optional, can keep for debugging or remove) */}
        {/* <div className="layout1-structure-reference" /> */}
    </>
));

const DeepSeaGround = React.memo(() => {
    // Interfaces for Type Safety
    interface DeepSeaLandscapeItem {
        type: string;
        left?: string;
        right?: string;
        bottom: string;
        transform?: string;
        color?: string;
        opacity?: number;
        zIndex?: number;
        height?: string;
    }

    interface DeepSeaDecorationItem {
        type: string;
        emoji: string;
        left?: string;
        right?: string;
        bottom?: string;
        size?: string;
        zIndex?: number;
        transform?: string;
        className?: string; // Optional class for sizing (large/small)
    }

    // Data for Background Landscape
    const DEEP_SEA_LANDSCAPE: DeepSeaLandscapeItem[] = [
        // Left Canyon Peaks
        { type: 'canyon-wall', left: '-8%', bottom: '0px', transform: 'scale(1.1)', zIndex: -3 },
        { type: 'canyon-wall', left: '0%', bottom: '0px', transform: 'scale(0.9)', color: 'rgba(20, 35, 65, 0.6)', zIndex: -2 },
        { type: 'canyon-wall', left: '8%', bottom: '0px', transform: 'scale(0.7)', color: 'rgba(25, 45, 80, 0.5)', zIndex: -1 },
        // Right Low Hills
        { type: 'wide', right: '40%', bottom: '0px', opacity: 0.5, transform: 'scale(0.8)' },
        { type: 'wide', right: '15%', bottom: '0px', opacity: 0.7, transform: 'scale(1.2)' },
        { type: 'wide', right: '-15%', bottom: '0px', color: 'rgba(20, 30, 60, 0.6)', transform: 'scale(0.9)' },
    ];

    // Data for Foreground Items
    const DEEP_SEA_ITEMS: DeepSeaDecorationItem[] = [
        // Left Side Group
        { type: 'rock', emoji: '🪨', left: '2%' },
        { type: 'coral', emoji: '🪸', className: 'large', left: '8%' },
        { type: 'shell', emoji: '🐚', left: '18%' },
        { type: 'coral', emoji: '🪸', className: 'small', left: '22%' },
        { type: 'coral', emoji: '🪸', left: '30%' },
        // Center Group
        { type: 'rock', emoji: '🪨', left: '45%', bottom: '-12px', size: '2.8rem', zIndex: 1 },
        { type: 'coral', emoji: '🪸', className: 'large', left: '50%', bottom: '-22px', size: '3.5rem', zIndex: 0, transform: 'translateX(-50%)' },
        { type: 'rock', emoji: '🪨', left: '55%', bottom: '-18px', size: '2.2rem', zIndex: 2 },
        { type: 'coral', emoji: '🪸', className: 'small', left: '42%', bottom: '-8px', size: '2rem', zIndex: 3 },
        { type: 'shell', emoji: '🐚', left: '58%', bottom: '-12px', zIndex: 4 },
        { type: 'oyster', emoji: '🦪', left: '48%', bottom: '-8px', size: '1.5rem', zIndex: 5 },
        // Right Side Group
        { type: 'coral', emoji: '🪸', className: 'small', right: '35%' },
        { type: 'oyster', emoji: '🦪', right: '28%', bottom: '-12px', size: '1.2rem', zIndex: 1 },
        // Diagonal Rocks
        { type: 'rock', emoji: '🪨', right: '15%', bottom: '-20px', size: '3.2rem', zIndex: 0 },
        { type: 'rock', emoji: '🪨', right: '22%', bottom: '-25px', size: '2rem', zIndex: 2 },
    ];

    // Generate static random bubbles (similar to FishingBackground)
    const bubbles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${10 + Math.random() * 20}px`,
        duration: `${10 + Math.random() * 10}s`,
        delay: `${Math.random() * 10}s`
    })), []);

    return (
        <>
            {/* Bubbles */}
            <div className="deep-sea-bubbles">
                {bubbles.map(b => (
                    <div
                        key={b.id}
                        className="ds-bubble-item"
                        style={{
                            '--rise-left': b.left,
                            '--bubble-size': b.size,
                            '--rise-duration': b.duration,
                            '--rise-delay': b.delay
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Deep Sea Decorations (Matched with Ocean Catch) */}
            <div className="deep-sea-decorations">
                {/* Background Landscape */}
                {DEEP_SEA_LANDSCAPE.map((item, index) => (
                    <div
                        key={`landscape-${index}`}
                        className={`ds-mountain ${item.type}`}
                        style={{
                            left: item.left,
                            right: item.right,
                            bottom: item.bottom || '0px',
                            height: item.height,
                            transform: item.transform,
                            borderBottomColor: item.color,
                            opacity: item.opacity,
                            zIndex: item.zIndex
                        }}
                    />
                ))}

                {/* Foreground Decorations */}
                {DEEP_SEA_ITEMS.map((item, index) => (
                    <div
                        key={`item-${index}`}
                        className={`ds-${item.type} ${item.className || ''}`}
                        style={{
                            left: item.left,
                            right: item.right,
                            bottom: item.bottom,
                            fontSize: item.size,
                            zIndex: item.zIndex,
                            transform: item.transform
                        }}
                    >
                        {item.emoji}
                    </div>
                ))}
            </div>
        </>
    );
});

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
