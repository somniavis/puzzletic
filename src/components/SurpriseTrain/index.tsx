import React, { useState, useEffect } from 'react';
import styles from './SurpriseTrain.module.css';
import { playButtonSound } from '../../utils/sound';

interface SurpriseTrainProps {
    onOpenGift: (rect: DOMRect) => void; // Parent handles the specific reward logic
    onTrainClick?: () => void;
    isActive: boolean;
    onComplete: () => void; // Called when train leaves screen
}

export const SurpriseTrain: React.FC<SurpriseTrainProps> = ({
    onOpenGift,
    onTrainClick,
    isActive,
    onComplete
}) => {
    const [hasGift, setHasGift] = useState(true);
    const [isDriving, setIsDriving] = useState(false);

    useEffect(() => {
        if (isActive) {
            setHasGift(true); // Reset gift
            setIsDriving(true);
        } else {
            setIsDriving(false);
        }
    }, [isActive]);

    // Handle Animation End (Train left screen)
    const handleAnimationEnd = () => {
        if (isDriving) {
            setIsDriving(false);
            onComplete();
        }
    };

    const handleBoxClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't click train
        if (!hasGift) return;

        playButtonSound();
        setHasGift(false); // Gift taken!

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        onOpenGift(rect);
    };

    const handleTrainClick = () => {
        // Choo Choo sound could go here
        onTrainClick?.();
    };

    if (!isActive && !isDriving) return null;

    return (
        <div
            className={`${styles.container} ${isDriving ? styles.driving : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className={styles.trainWrapper} onClick={handleTrainClick}>
                {/* Car 1: Engine with Smoke */}
                <div className={styles.engineContainer}>
                    <div className={styles.smokeStack}>
                        <span className={styles.smoke}></span>
                        <span className={styles.smoke}></span>
                        <span className={styles.smoke}></span>
                    </div>
                    <span className={styles.engine}>🚂</span>
                </div>

                {/* Car 2: Empty Wagon */}
                <span className={styles.wagon}>🚃</span>

                {/* Car 3: Gift Wagon */}
                <div className={styles.wagon}>
                    🚃
                    {hasGift && (
                        <div className={styles.giftBox} onClick={handleBoxClick}>
                            🎁
                        </div>
                    )}
                </div>

                {/* Car 4: Empty Wagon */}
                <span className={styles.wagon}>🚃</span>

                {/* Car 5: Empty Wagon */}
                <span className={styles.wagon}>🚃</span>
            </div>
        </div>
    );
};
