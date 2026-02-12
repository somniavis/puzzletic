import React, { useState } from 'react';
import styles from './styles.module.css';
import { useRocketLauncherLogic, type AnswerType } from './useRocketLauncherLogic';
import { playButtonSound } from '../../../../../utils/sound';
import RocketColumn from './RocketColumn';

interface GameLogicProps {
    controller: ReturnType<typeof useRocketLauncherLogic>;
}

export const GameLogic: React.FC<GameLogicProps> = ({ controller }) => {
    const {
        leftValue,
        rightValue,
        rocketState,
        handleAnswer,
    } = controller;

    const [pressedBtn, setPressedBtn] = useState<string | null>(null);

    const onBtnClick = (type: AnswerType) => {
        if (rocketState !== 'idle') return; // Prevent clicks during animation
        playButtonSound();
        setPressedBtn(type);
        handleAnswer(type);
        setTimeout(() => setPressedBtn(null), 150);
    };

    return (
        <div className={styles.container}>
            <div className={styles.moon} />
            {/* Little Dipper Constellation */}
            <div className={styles.constellation}>
                <div className={styles.star}>★</div>
                <div className={styles.star}>★</div>
                <div className={styles.star}>★</div>
                <div className={styles.star}>★</div>
                <div className={styles.star}>★</div>
                <div className={styles.star}>★</div>
                <div className={styles.star}>★</div>
            </div>

            <RocketColumn
                side="left"
                value={leftValue}
                rocketState={rocketState}
            />

            {/* Controls */}
            <div className={styles.controlArea}>
                <button
                    className={`${styles.compareBtn} ${styles.btnGreater} ${pressedBtn === '>' ? styles.pressed : ''}`}
                    onClick={() => onBtnClick('>')}
                    disabled={rocketState !== 'idle'}
                >
                    &gt;
                </button>
                <button
                    className={`${styles.compareBtn} ${styles.btnEqual} ${pressedBtn === '=' ? styles.pressed : ''}`}
                    onClick={() => onBtnClick('=')}
                    disabled={rocketState !== 'idle'}
                >
                    =
                </button>
                <button
                    className={`${styles.compareBtn} ${styles.btnLess} ${pressedBtn === '<' ? styles.pressed : ''}`}
                    onClick={() => onBtnClick('<')}
                    disabled={rocketState !== 'idle'}
                >
                    &lt;
                </button>
            </div>

            {/* Right Rocket Area */}
            <RocketColumn
                side="right"
                value={rightValue}
                rocketState={rocketState}
            />
        </div>
    );
};
