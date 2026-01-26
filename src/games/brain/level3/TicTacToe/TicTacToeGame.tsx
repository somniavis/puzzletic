import React, { useState, useEffect, useCallback } from 'react';
import styles from './TicTacToe.module.css';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useTranslation } from 'react-i18next';

// Types
type Player = 'X' | 'O' | null;
type BoardState = Player[];

interface GameLogicProps {
    engine: ReturnType<typeof useGameEngine>;
}

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const TicTacToeGame: React.FC<GameLogicProps> = ({ engine }) => {
    const { t } = useTranslation();

    // Game State
    const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw' | 'processing'>('playing');
    const [winningLine, setWinningLine] = useState<number[] | null>(null);

    // Engine Helpers
    const { updateScore, updateLives, registerEvent } = engine;

    // --- Core Logic ---

    const checkWinner = (currentBoard: BoardState): { winner: Player | 'draw', line: number[] | null } | null => {
        for (const combo of WINNING_COMBINATIONS) {
            const [a, b, c] = combo;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return { winner: currentBoard[a], line: combo };
            }
        }
        if (!currentBoard.includes(null)) {
            return { winner: 'draw', line: null };
        }
        return null; // Game continues
    };

    const handleGameEnd = useCallback((result: 'won' | 'lost' | 'draw', line: number[] | null) => {
        setGameStatus(result);
        if (line) setWinningLine(line);

        if (result === 'won') {
            updateScore(150); // Good points for winning
            registerEvent({ type: 'correct' });
        } else if (result === 'lost') {
            updateScore(1); // Consolation point to count as "attempt"
            updateLives(false); // Decrement life
            registerEvent({ type: 'wrong' }); // Shake effect & wrong animation
        } else {
            updateScore(10); // Small pity points for draw
        }

        // Auto-restart speed up
        setTimeout(() => {
            resetRound();
        }, 700);
    }, [updateScore, updateLives, registerEvent]);

    const resetRound = () => {
        setBoard(Array(9).fill(null));
        setWinningLine(null);

        // Randomize Turn
        const isPlayerNext = Math.random() < 0.5;
        setIsPlayerTurn(isPlayerNext);
        // If AI starts, set status to processing to trigger the effect
        setGameStatus(isPlayerNext ? 'playing' : 'processing');
    };

    // --- AI Logic (Simple Strategy) ---
    // 1. Win if possible
    // 2. Block if threatened
    // 3. Take center
    // 4. Take random available
    const getBestMove = (currentBoard: BoardState): number => {
        const availableMoves = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];

        // Helper to check if a move leads to a win for a specific player
        const findWinningMove = (player: 'X' | 'O'): number | null => {
            for (const move of availableMoves) {
                const tempBoard = [...currentBoard];
                tempBoard[move] = player;
                const result = checkWinner(tempBoard);
                if (result && result.winner === player) return move;
            }
            return null;
        };

        // 1. Check for winning move for AI ('O')
        const winningMove = findWinningMove('O');
        if (winningMove !== null) return winningMove;

        // 2. Check for blocking move (if Player 'X' is about to win)
        const blockingMove = findWinningMove('X');
        if (blockingMove !== null) return blockingMove;

        // 3. Take Center if available
        if (currentBoard[4] === null) return 4;

        // 4. Random from remaining
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    };

    // --- User Interaction ---

    const handleCellClick = (index: number) => {
        // Allow click only if playing AND player's turn
        if (gameStatus !== 'playing' || !isPlayerTurn || board[index] !== null) return;

        // 1. Player Move
        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);

        // 2. Check Result
        const result = checkWinner(newBoard);
        if (result) {
            handleGameEnd(result.winner === 'X' ? 'won' : 'draw', result.line);
        } else {
            // 3. Pass turn to AI
            setIsPlayerTurn(false);
            setGameStatus('processing'); // Prevent extra clicks
        }
    };

    // --- AI Effect ---
    useEffect(() => {
        if (!isPlayerTurn && gameStatus === 'processing') {
            const timer = setTimeout(() => {
                const bestMove = getBestMove(board);

                if (bestMove !== undefined) {
                    const newBoard = [...board];
                    newBoard[bestMove] = 'O';
                    setBoard(newBoard);

                    const result = checkWinner(newBoard);
                    if (result) {
                        handleGameEnd(result.winner === 'O' ? 'lost' : 'draw', result.line);
                    } else {
                        setIsPlayerTurn(true);
                        setGameStatus('playing');
                    }
                }
            }, 600); // 600ms thinking time
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, gameStatus, board, handleGameEnd]);


    return (
        <div className={styles.container}>
            <div className={styles.statusMessage}>
                {(gameStatus === 'playing' || gameStatus === 'processing') ? (
                    isPlayerTurn ?
                        <>{t('games.tic-tac-toe.status.yourTurn')} <span className={styles.statusIcon}>🔥</span></> :
                        <>{t('games.tic-tac-toe.status.aiThinking')} <span className={styles.statusIcon}>❄️</span></>
                ) : gameStatus === 'won' ? (
                    <>{t('games.tic-tac-toe.status.win')} <span className={styles.statusIcon}>🔥</span></>
                ) : gameStatus === 'lost' ? (
                    <>{t('games.tic-tac-toe.status.loss')} <span className={styles.statusIcon}>❄️</span></>
                ) : (
                    <>{t('games.tic-tac-toe.status.draw')} <span className={styles.statusIcon}>🤝</span></>
                )}
            </div>

            <div className={styles.grid}>
                {board.map((cell, idx) => (
                    <div
                        key={idx}
                        className={`
                            ${styles.cell} 
                            ${cell === 'X' ? styles.cellX : ''}
                            ${cell === 'O' ? styles.cellO : ''}
                            ${cell === null && isPlayerTurn ? styles.clickable : ''}
                            ${winningLine?.includes(idx) ? (gameStatus === 'won' ? styles.winner : styles.loser) : ''}
                        `}
                        onClick={() => handleCellClick(idx)}
                    >
                        {cell === 'X' && <span className={styles.markItem}>🔥</span>}
                        {cell === 'O' && <span className={styles.markItem}>❄️</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};
