
import React from 'react';
import styles from './PairUpGrid.module.css';
import type { Card } from "./types";

interface PairUpGridProps {
    cards: Card[];
    config: { rows: number; cols: number };
    onCardClick: (id: string) => void;
}

export const PairUpGrid: React.FC<PairUpGridProps> = React.memo(({
    cards,
    config,
    onCardClick
}) => {

    return (
        <div className={styles.gridWrapper}>
            {/* Timer Bar removed - injected into Layout Header */}

            <div
                className={styles.grid}
                style={{
                    // Responsive Scaling using Container Queries (cqi/cqb or cqw/cqh):
                    // The parent layout wrapper provides the content box size.
                    // We fit the grid exactly into that box while maintaining square cells.
                    gridTemplateColumns: `repeat(${config.cols}, min(calc(100cqw / ${config.cols} - 0.75rem), calc(100cqh / ${config.rows} - 0.75rem)))`,
                    gridTemplateRows: `repeat(${config.rows}, min(calc(100cqw / ${config.cols} - 0.75rem), calc(100cqh / ${config.rows} - 0.75rem)))`
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
                                ★
                            </div>
                            <div className={`${styles.cardFace} ${styles.cardBack} ${card.isMatched ? styles.matched : ''}`}>
                                {card.emoji}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
});
