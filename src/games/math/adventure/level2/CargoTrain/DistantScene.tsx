
import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface DistantSceneProps {
    triggerAnimation: boolean;
}

export const DistantScene: React.FC<DistantSceneProps> = ({ triggerAnimation }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (triggerAnimation) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 6000); // Reset after animation duration
            return () => clearTimeout(timer);
        }
    }, [triggerAnimation]);

    return (
        <div className={styles.distantScene}>
            {/* 1. Land (Bottom Layer) */}
            <div className={styles.distantLand} />

            {/* 2. Rail (Middle Layer - Cut through Land) */}
            <div className={styles.distantRail} />

            {/* 3. Factory (Top Layer - Emojis) */}
            <div className={styles.distantFactory}>🏭🏭</div>

            {/* 4. Moving Train (On top of everything) */}
            <div className={`${styles.distantTrain} ${animate ? styles.animateTrain : ''}`}>
                🚂🚃🚃🚃
            </div>
        </div>
    );
};
