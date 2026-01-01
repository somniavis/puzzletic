import React, { useMemo } from 'react';
import './MathSymbolBackground.css';

const SYMBOLS = ['✖️', '➕', '➖', '➗', '🟰', '♾️'];
const ROWS = 5;
const COLS = 4;
const CELL_HEIGHT = 100 / ROWS; // 20%
const CELL_WIDTH = 100 / COLS; // 25%

export const MathSymbolBackground: React.FC = () => {
    // Generate positions using Stratified Sampling (Grid + Jitter) with Balanced Distribution
    const particles = useMemo(() => {
        const items = [];
        const totalCells = ROWS * COLS;

        // Create a balanced pool of symbols
        // We have 20 cells. 6 symbols. 3 of each = 18.
        // We fill roughly 18 cells (90%) to keep it organic but dense.
        let pool: string[] = [];
        const baseCount = Math.floor((totalCells * 0.9) / SYMBOLS.length); // 3

        // Fill pool with 3 of each symbol
        for (let i = 0; i < baseCount; i++) {
            pool = [...pool, ...SYMBOLS];
        }

        // Add random remainders to reach ~90% fill if needed (18 items is exactly 3 sets of 6)
        // pool is now 18 items.

        // Shuffle the pool (Fisher-Yates)
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        // Create grid cells
        const cells = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                cells.push({ r, c });
            }
        }

        // Shuffle cells to place symbols randomly across the grid
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        // Assign symbols to cells
        for (let i = 0; i < pool.length; i++) {
            const { r, c } = cells[i];
            const topBase = r * CELL_HEIGHT;
            const leftBase = c * CELL_WIDTH;

            // Jitter within cell (keep away from extreme edges)
            const jitterY = Math.random() * (CELL_HEIGHT * 0.6) + (CELL_HEIGHT * 0.2);
            const jitterX = Math.random() * (CELL_WIDTH * 0.6) + (CELL_WIDTH * 0.2);

            // Size variation: Mixed large and small
            // 30% Large (2.0 - 2.8rem), 70% Small/Medium (1.0 - 1.8rem)
            const isLarge = Math.random() < 0.3;
            const size = isLarge
                ? `${Math.random() * 0.8 + 2.0}rem`
                : `${Math.random() * 0.8 + 1.0}rem`;

            items.push({
                id: `${r}-${c}`,
                symbol: pool[i],
                top: `${topBase + jitterY}%`,
                left: `${leftBase + jitterX}%`,
                size: size,
                rotation: `${Math.random() * 360}deg`,
                opacity: Math.random() * 0.08 + 0.04 // 0.04 to 0.12 (Very faint)
            });
        }

        return items;
    }, []);

    return (
        <div className="math-symbol-bg-layer">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="bg-symbol"
                    style={{
                        top: p.top,
                        left: p.left,
                        fontSize: p.size,
                        transform: `rotate(${p.rotation})`,
                        opacity: p.opacity
                    }}
                >
                    {p.symbol}
                </div>
            ))}
        </div>
    );
};
