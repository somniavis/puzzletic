import React from 'react';
import styles from './styles.module.css';
import { type RocketState } from './useRocketLauncherLogic';

interface RocketColumnProps {
    side: 'left' | 'right';
    value: number;
    rocketState: RocketState;
}

const RocketColumn: React.FC<RocketColumnProps> = ({ side, value, rocketState }) => {

    // Helper to determine animation class
    const getRocketClass = () => {
        if (rocketState === 'idle') return styles.idle;
        if (rocketState === 'crash') return styles.crashed;

        if (rocketState === 'launch-both') return styles.launching;
        if (side === 'left' && rocketState === 'launch-left') return styles.launching;
        if (side === 'right' && rocketState === 'launch-right') return styles.launching;

        // Robot Arm Interactions
        if (rocketState === 'placing') return styles.beingPlaced;
        if (side === 'left') {
            if (rocketState === 'grabbing-left') return styles.beingGrabbed;
        }
        if (side === 'right') {
            if (rocketState === 'grabbing-right') return styles.beingGrabbed;
        }

        return '';
    };

    // Robot Arm State Helper
    const getArmState = () => {
        if (rocketState === 'placing') return 'placing';
        if (side === 'left' && rocketState === 'grabbing-left') return 'grabbing';
        if (side === 'right' && rocketState === 'grabbing-right') return 'grabbing';
        return 'idle';
    };

    const isRocketVisible = () => {
        if (side === 'left') {
            if (rocketState === 'grabbing-right') return false;
        }
        if (side === 'right') {
            if (rocketState === 'grabbing-left') return false;
        }
        return true;
    };

    // Determine specific styles based on side
    const armStyle = side === 'left' ? styles.armLeft : styles.armRight;
    const launchpadStyle = side === 'left' ? styles.launchpadLeft : styles.launchpadRight;
    const rocketStyle = side === 'left' ? styles.leftRocket : styles.rightRocket;
    const hoseStyle = side === 'left' ? styles.hoseLeft : styles.hoseRight;

    // Hose SVG Path
    const hosePath = side === 'left'
        ? "M 50 100 L 50 80 L 10 80 L 10 20 L 50 20"
        : "M 50 100 L 50 80 L 90 80 L 90 20 L 50 20";

    return (
        <div className={`${styles.rocketArea} ${getRocketClass()}`}>
            <div className={`${styles.robotArm} ${armStyle} ${styles[getArmState()]}`}>
                <div className={styles.claw}></div>
                <div className={styles.heldRocket}>🚀</div>
                <div className={styles.armSegment}></div>
            </div>
            <div className={`${styles.launchpad} ${launchpadStyle}`}></div>
            <div className={styles.rocketWrapper}>
                <div className={`${styles.rocket} ${rocketStyle} ${!isRocketVisible() ? styles.hidden : ''}`}>🚀</div>
                <div className={styles.smokeContainer}>
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
                    ))}
                </div>
            </div>
            <div className={styles.tankWrapper}>
                <svg className={`${styles.fuelHose} ${hoseStyle}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d={hosePath} vectorEffect="non-scaling-stroke" />
                </svg>
                <div className={styles.fuelTank}>
                    <div className={styles.fuelLabel}>Fuel</div>
                    <div className={styles.fuelDisplay}>
                        <div className={styles.fuelValue}>{value.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RocketColumn;
