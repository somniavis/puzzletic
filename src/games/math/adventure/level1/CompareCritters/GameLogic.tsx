
import React, { useState } from 'react';
import styles from './styles.module.css';
import { useCompareCrittersLogic } from './useGameLogic';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';

interface GameLogicProps {
    engine: ReturnType<typeof useGameEngine>;
}

type AnswerType = '>' | '<' | '=';

interface AnimalGridProps {
    count: number;
    animal: string;
    rows: number;
    delayBase: number;
}

const AnimalGrid: React.FC<AnimalGridProps> = React.memo(({ count, animal, rows, delayBase }) => (
    <div className={styles.animalGrid} style={{ '--count': count, '--rows': rows } as React.CSSProperties}>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={styles.animal}
                style={{ animationDelay: `${(i * 0.1) + delayBase}s` }}
            >
                {animal}
            </div>
        ))}
    </div>
));

export const GameLogic: React.FC<GameLogicProps> = ({ engine }) => {
    const {
        leftCount,
        rightCount,
        currentAnimal,
        handleAnswer
    } = useCompareCrittersLogic(engine);


    const maxVal = Math.max(leftCount, rightCount, 1);
    const sharedRows = Math.min(maxVal, 10);

    const [pressedBtn, setPressedBtn] = useState<string | null>(null);

    const onBtnClick = (type: AnswerType) => {
        setPressedBtn(type);
        handleAnswer(type);
        setTimeout(() => setPressedBtn(null), 150);
    };

    return (
        <div className={styles.container}>
            {/* Left Fence */}
            <div className={styles.fenceArea}>
                <div className={styles.signBoard}>{leftCount}</div>
                <AnimalGrid count={leftCount} animal={currentAnimal} rows={sharedRows} delayBase={0} />
            </div>

            {/* Controls */}
            <div className={styles.controlArea}>
                <button
                    className={`${styles.compareBtn} ${styles.btnGreater} ${pressedBtn === '>' ? styles.pressed : ''}`}
                    onClick={() => onBtnClick('>')}
                >
                    &gt;
                </button>
                <button
                    className={`${styles.compareBtn} ${styles.btnEqual} ${pressedBtn === '=' ? styles.pressed : ''}`}
                    onClick={() => onBtnClick('=')}
                >
                    =
                </button>
                <button
                    className={`${styles.compareBtn} ${styles.btnLess} ${pressedBtn === '<' ? styles.pressed : ''}`}
                    onClick={() => onBtnClick('<')}
                >
                    &lt;
                </button>
            </div>

            {/* Right Fence */}
            <div className={styles.fenceArea}>
                <div className={styles.signBoard}>{rightCount}</div>
                <AnimalGrid count={rightCount} animal={currentAnimal} rows={sharedRows} delayBase={0.5} />
            </div>

            {/* Feedback is handled byLayout2 via engine events */}
        </div>
    );
};
