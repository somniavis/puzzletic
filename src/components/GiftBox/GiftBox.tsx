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
    const isOpeningLock = useRef(false);

    // Decay logic - Optimized to only run when there is progress
    useEffect(() => {
        if (isOpening || progress <= 0) return;

        decayIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const next = prev - 2;
                if (next <= 0) {
                    if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
                    return 0;
                }
                if (isOpeningLock.current) return prev;
                return next;
            });
        }, 50);

        return () => {
            if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
        };
    }, [isOpening, progress > 0]); // Re-run when progress becomes positive


    const handleClick = () => {
        if (isOpening || isOpeningLock.current) return;

        playButtonSound(); // Play sound on every click

        setProgress(prev => {
            if (isOpeningLock.current) return prev; // Prevent updates if already locked

            const newProgress = Math.min(100, prev + 15); // Click rate: +15

            if (newProgress >= 100) {
                // Critical Section: Ensure we only trigger once
                if (!isOpeningLock.current) {
                    isOpeningLock.current = true;
                    setIsOpening(true);
                    if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);

                    // Play open animation then trigger callback
                    setTimeout(() => {
                        onOpen();
                    }, 800); // Slightly faster transition for explosion
                }
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
