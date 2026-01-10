
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
                    // Robust Scaling Logic (Updated for Mobile):
                    // Use 100dvh to account for mobile browser bars.
                    // Subtract roughly 180px for Header + SubHeader + Margins.
                    // Use 95vw for width to maximize use of narrow screens.
                    gridTemplateColumns: `repeat(${config.cols}, min(calc(95vw / ${config.cols} - 0.75rem), calc((100dvh - 180px) / ${config.rows} - 0.75rem)))`,
                    gridTemplateRows: `repeat(${config.rows}, min(calc(95vw / ${config.cols} - 0.75rem), calc((100dvh - 180px) / ${config.rows} - 0.75rem)))`
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
        </div>
    );
});
