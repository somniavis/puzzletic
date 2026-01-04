import React from 'react';
import './FishingBackground.css';

export const FishingBackground = React.memo(() => {
    // Generate static random bubbles
    const bubbles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${10 + Math.random() * 20}px`,
        duration: `${10 + Math.random() * 10}s`,
        delay: `${Math.random() * 10}s`
    }));

    return (
        <div className="fishing-bg-area">
            <div className="fishing-rays" />
            <div className="fishing-bubbles">
                {bubbles.map(b => (
                    <div
                        key={b.id}
                        className="fishing-bubble"
                        style={{
                            '--rise-left': b.left,
                            '--bubble-size': b.size,
                            '--rise-duration': b.duration,
                            '--rise-delay': b.delay
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Sand Ground */}
            <div className="sand-ground"></div>

            {/* Coral & Decor Mix */}
            <div className="rock-deco" style={{ left: '2%' }}>🪨</div>
            <div className="coral-deco large" style={{ left: '8%' }}>🪸</div>
            <div className="shell-deco" style={{ left: '18%' }}>🐚</div>
            <div className="coral-deco small" style={{ left: '22%' }}>🪸</div>

            {/* Moved coral further left to avoid Net intersection */}
            <div className="coral-deco" style={{ left: '30%' }}>🪸</div>

            <div className="coral-deco small" style={{ right: '35%' }}>🪸</div>

            {/* Rocks: Diagonal overlap, Upper one bigger, Lower one smaller */}
            <div className="rock-deco" style={{ right: '15%', bottom: '18px', fontSize: '3.2rem', zIndex: 0 }}>🪨</div>
            <div className="rock-deco" style={{ right: '22%', bottom: '5px', fontSize: '2rem', zIndex: 2 }}>🪨</div>

            <div className="coral-deco large" style={{ right: '5%' }}>🪸</div>
            <div className="shell-deco" style={{ right: '2%' }}>🐚</div>
        </div>
    );
});
