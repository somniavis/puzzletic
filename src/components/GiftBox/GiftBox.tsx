import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import './GiftBox.css';

interface GiftBoxProps {
    onOpen: () => void;
}

export const GiftBox: React.FC<GiftBoxProps> = ({ onOpen }) => {
    const { t } = useTranslation();
    const [isOpening, setIsOpening] = useState(false);
    const [taps, setTaps] = useState(0);
    const isOpeningLock = useRef(false);
    const MAX_TAPS = 10;

    // Calculate progress for UI: 0 to 100%
    const progress = Math.min(100, (taps / MAX_TAPS) * 100);

    const handleClick = () => {
        if (isOpening || isOpeningLock.current) return;

        playButtonSound(); // Play sound on every click

        setTaps(prev => {
            const newTaps = prev + 1;

            if (newTaps >= MAX_TAPS) {
                // Trigger Opening
                if (!isOpeningLock.current) {
                    isOpeningLock.current = true;
                    setIsOpening(true);

                    // Play open animation then trigger callback
                    setTimeout(() => {
                        onOpen();
                    }, 800);
                }
            }
            return newTaps;
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

            {!isOpening && (
                <div className="gift-hint">
                    {t('giftBox.tapHint', { current: taps, max: MAX_TAPS })}
                </div>
            )}
        </div>
    );
};
