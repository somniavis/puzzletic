import React, { useRef, useState } from 'react';
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
    const [tapCount, setTapCount] = useState(0);
    const isOpeningLock = useRef(false);
    const lastTapTimestampRef = useRef(0);
    const REQUIRED_TAPS = 4;

    const triggerOpen = () => {
        if (isOpeningLock.current) return;
        isOpeningLock.current = true;
        setProgress(100);
        setIsOpening(true);

        window.setTimeout(() => {
            onOpen();
        }, 800);
    };

    const registerTap = () => {
        if (isOpening || isOpeningLock.current) return;

        const now = Date.now();
        if (now - lastTapTimestampRef.current < 220) return;
        lastTapTimestampRef.current = now;

        playButtonSound();
        const nextTapCount = Math.min(REQUIRED_TAPS, tapCount + 1);
        setTapCount(nextTapCount);
        setProgress((nextTapCount / REQUIRED_TAPS) * 100);

        if (nextTapCount >= REQUIRED_TAPS) {
            triggerOpen();
        }
    };

    const handleTap = (event?: React.SyntheticEvent<HTMLDivElement>) => {
        event?.preventDefault();
        registerTap();
    };

    return (
        <div
            className={`gift-box ${isOpening ? 'opening' : ''}`}
            role="button"
            tabIndex={0}
            onPointerUp={handleTap}
            onTouchEnd={handleTap}
            onMouseUp={handleTap}
            onClick={handleTap}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    handleTap(event);
                }
            }}
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
                    {t('giftBox.tapHint')}
                </div>
            )}
        </div>
    );
};
