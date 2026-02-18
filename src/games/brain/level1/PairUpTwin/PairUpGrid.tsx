
import React, { useEffect, useRef, useState } from 'react';
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
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [cellSize, setCellSize] = useState(56);

    useEffect(() => {
        const GAP_PX = 12; // 0.75rem (matches CSS grid gap)

        const updateSize = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;
            const w = wrapper.clientWidth;
            const h = wrapper.clientHeight;
            if (w <= 0 || h <= 0) return;

            const maxByWidth = (w - GAP_PX * (config.cols - 1)) / config.cols;
            const maxByHeight = (h - GAP_PX * (config.rows - 1)) / config.rows;
            const next = Math.max(32, Math.floor(Math.min(maxByWidth, maxByHeight)));
            setCellSize(next);
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        let observer: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && wrapperRef.current) {
            observer = new ResizeObserver(() => updateSize());
            observer.observe(wrapperRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateSize);
            if (observer) observer.disconnect();
        };
    }, [config.cols, config.rows]);

    return (
        <div className={styles.gridWrapper} ref={wrapperRef}>
            {/* Timer Bar removed - injected into Layout Header */}

            <div
                className={styles.grid}
                style={{
                    // Old Safari-safe sizing (avoid cqw/cqh issues)
                    gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
                    ['--pairup-cell-size' as string]: `${cellSize}px`
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
