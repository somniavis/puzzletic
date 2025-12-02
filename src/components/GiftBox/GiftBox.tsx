import React, { useState, useEffect, useRef } from 'react';
import { playButtonSound } from '../../utils/sound';
import './GiftBox.css';

interface GiftBoxProps {
    onOpen: () => void;
}

export const GiftBox: React.FC<GiftBoxProps> = ({ onOpen }) => {
    const [isOpening, setIsOpening] = useState(false);
    const [progress, setProgress] = useState(0);
    const decayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Decay logic
    useEffect(() => {
        if (isOpening) return;

        decayIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev <= 0) return 0;
                return Math.max(0, prev - 2); // Decay rate: -2 per 50ms
            });
        }, 50);

        return () => {
            if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
        };
    }, [isOpening]);

    const handleClick = () => {
        if (isOpening) return;

        playButtonSound(); // Play sound on every click

        setProgress(prev => {
            const newProgress = Math.min(100, prev + 15); // Click rate: +15

            if (newProgress >= 100) {
                setIsOpening(true);
                if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);

                // Play open animation then trigger callback
                setTimeout(() => {
                    onOpen();
                }, 800); // Slightly faster transition for explosion
            }

            return newProgress;
        });
    };

    return (
        <div
            className={`gift-box ${isOpening ? 'opening' : ''}`}
            onClick={handleClick}
        >
            {/* Gauge Bar */}
            {!isOpening && (
                <div className="gift-gauge-container">
                    <div
                        className="gift-gauge-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div
                className="gift-emoji"
                style={{
                    // Increase shake speed/intensity as progress fills
                    animationDuration: progress > 0 ? `${2 - (progress / 100) * 1.8}s` : '2s'
                }}
            >
                🎁
            </div>

            {/* Explosion Effect */}
            {isOpening && (
                <div className="explosion-effect">
                    <div className="explosion-boom">💥</div>
                    <div className="explosion-particles">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={`particle particle-${i + 1}`} />
                        ))}
                    </div>
                </div>
            )}

            {!isOpening && <div className="gift-hint">Tap Fast! {Math.round(progress)}%</div>}
        </div>
    );
};
