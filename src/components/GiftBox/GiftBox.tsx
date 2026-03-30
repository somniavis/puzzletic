import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import './GiftBox.css';

interface GiftBoxProps {
    onOpen: () => void;
}

export const GiftBox: React.FC<GiftBoxProps> = ({ onOpen }) => {
    const { t } = useTranslation();
    const [isOpening, setIsOpening] = useState(false);
    const [progress, setProgress] = useState(0);
    const isOpeningLock = useRef(false);
    const isPressingRef = useRef(false);
    const rafRef = useRef<number | null>(null);
    const lastTimestampRef = useRef<number | null>(null);
    const progressMsRef = useRef(0);
    const HOLD_TO_OPEN_MS = 1600;

    const stopPress = () => {
        isPressingRef.current = false;
        lastTimestampRef.current = null;
        if (rafRef.current !== null) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    };

    const triggerOpen = () => {
        if (isOpeningLock.current) return;
        isOpeningLock.current = true;
        setProgress(100);
        setIsOpening(true);

        window.setTimeout(() => {
            onOpen();
        }, 800);
    };

    const tickProgress = (timestamp: number) => {
        if (!isPressingRef.current || isOpeningLock.current) return;

        const lastTimestamp = lastTimestampRef.current ?? timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestampRef.current = timestamp;

        progressMsRef.current = Math.min(HOLD_TO_OPEN_MS, progressMsRef.current + delta);
        const nextProgress = (progressMsRef.current / HOLD_TO_OPEN_MS) * 100;
        setProgress(nextProgress);

        if (progressMsRef.current >= HOLD_TO_OPEN_MS) {
            stopPress();
            triggerOpen();
            return;
        }

        rafRef.current = window.requestAnimationFrame(tickProgress);
    };

    const startPress = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (isOpening || isOpeningLock.current || isPressingRef.current) return;

        playButtonSound();
        isPressingRef.current = true;
        lastTimestampRef.current = null;
        rafRef.current = window.requestAnimationFrame(tickProgress);
    };

    useEffect(() => stopPress, []);

    return (
        <div
            className={`gift-box ${isOpening ? 'opening' : ''}`}
            onPointerDown={startPress}
            onPointerUp={stopPress}
            onPointerLeave={stopPress}
            onPointerCancel={stopPress}
            onContextMenu={(event) => event.preventDefault()}
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

            {!isOpening && (
                <div className="gift-hint">
                    {t('giftBox.holdHint')}
                </div>
            )}
        </div>
    );
};
