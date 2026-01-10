
import React from 'react';
import styles from './PairUpGrid.module.css'; // Will rename CSS file in write step
import type { Card, LevelConfig } from "./types";

interface PairUpGridProps {
    cards: Card[];
    config: { rows: number; cols: number };
    previewProgress: number;
    gameState: 'preview' | 'playing';
    onCardClick: (id: string) => void;
}

export const PairUpGrid: React.FC<PairUpGridProps> = ({
    cards,
    config,
    previewProgress,
    gameState,
    onCardClick
}) => {

    return (
        <div className={styles.gridWrapper}>
            {/* Timer Bar removed - injected into Layout Header */}

            <div
                className={styles.grid}
                style={{
                    // Robust Scaling Logic:
                    // Ensure the grid fits within 90vw (width) AND 60vh (height).
                    // We calculate the maximum possible square cell size that satisfies both constraints.
                    // Cell Size = min( 90vw / cols, 60vh / rows )
                    // Then repeat that size for both columns and rows to maintain square cells.
                    gridTemplateColumns: `repeat(${config.cols}, min(calc(90vw / ${config.cols} - 1rem), calc(60vh / ${config.rows} - 1rem)))`,
                    gridTemplateRows: `repeat(${config.rows}, min(calc(90vw / ${config.cols} - 1rem), calc(60vh / ${config.rows} - 1rem)))`
                }}
            >
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={styles.cardScene}
                        onClick={() => onCardClick(card.id)}
                    >
                        <div className={`${styles.card} ${card.isFlipped ? styles.isFlipped : ''}`}>
                            <div className={`${styles.cardFace} ${styles.cardFront}`}>
                                ?
                            </div>
                            <div className={`${styles.cardFace} ${styles.cardBack} ${card.isMatched ? styles.matched : ''}`}>
                                {card.emoji}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
