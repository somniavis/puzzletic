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
        </div>
    );
});
