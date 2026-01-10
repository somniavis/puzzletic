import React from 'react';
import styles from './PairUpBackground.module.css';

export const PairUpBackground: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.containerInside}>
                <div className={styles.circleSmall} />
                <div className={styles.circleMedium} />
                <div className={styles.circleLarge} />
                <div className={styles.circleXLarge} />
                <div className={styles.circleXXLarge} />
            </div>
        </div>
    );
};
