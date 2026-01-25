import { useState, useCallback, useEffect, useRef } from 'react';
import { playClearSound } from '../../../../utils/sound';

export type Player = 'black' | 'white';
// Board is 15x15
export const BOARD_SIZE = 15;

// Directions for checking lines (Horizontal, Vertical, Diagonal \, Diagonal /)
const DIRECTIONS = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
];

interface UseOmokGameProps {
    onGameOver: (result: { success: boolean; score?: number }) => void;
}

export const useOmokGame = ({ onGameOver }: UseOmokGameProps) => {
    // Game State
    const [board, setBoard] = useState<(Player | null)[][]>(
        Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
    );

    // playerSide: The color the HUMAN player controls.
    // Randomly assigned at start of each round.
    const [playerSide, setPlayerSide] = useState<Player>('black');

    const [currentPlayer, setCurrentPlayer] = useState<Player>('black'); // Black always moves first
    const [winner, setWinner] = useState<Player | 'draw' | null>(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [lastMove, setLastMove] = useState<{ r: number, c: number } | null>(null);

    // Prevent double game over triggers & double AI moves
    const isGameOverRef = useRef(false);
    const isAiThinkingRef = useRef(false);

    // -- Init / Reset --
    const resetBoard = useCallback(() => {
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));

        // Randomize Player Side (50% Chance)
        const newSide = Math.random() > 0.5 ? 'black' : 'white';
        setPlayerSide(newSide);

        setCurrentPlayer('black'); // Black always starts
        setWinner(null);
        setLastMove(null);
        isGameOverRef.current = false;

        setIsAiThinking(false);
        isAiThinkingRef.current = false;
    }, []);

    // Initial Start
    useEffect(() => {
        resetBoard();
    }, [resetBoard]); // Careful: resetBoard must be stable


    // -- Game Logic: Check Win --
    const checkWin = useCallback((boardState: (Player | null)[][], r: number, c: number, player: Player) => {
        for (const [dr, dc] of DIRECTIONS) {
            let count = 1;

            // Check forward
            let nr = r + dr;
            let nc = c + dc;
            while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
                count++;
                nr += dr;
                nc += dc;
            }

            // Check backward
            nr = r - dr;
            nc = c - dc;
            while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
                count++;
                nr -= dr;
                nc -= dc;
            }

            if (count >= 5) return true;
        }
        return false;
    }, []);

    // -- AI Logic --
    const makeAiMove = useCallback(() => {
        // Synchronous lock to prevent double execution (React StrictMode etc)
        if (winner || isGameOverRef.current || isAiThinkingRef.current) return;

        isAiThinkingRef.current = true;
        setIsAiThinking(true);

        // Simulate "thinking" time
        setTimeout(() => {
            if (isGameOverRef.current) {
                setIsAiThinking(false);
                isAiThinkingRef.current = false;
                return;
            }

            const aiColor = playerSide === 'black' ? 'white' : 'black';
            const emptyCells: { r: number, c: number, score: number }[] = [];

            // 1. Evaluate all empty cells
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (board[r][c] === null) {
                        let score = 0;

                        // Distance to center preference
                        const centerDist = Math.abs(r - 7) + Math.abs(c - 7);
                        score += (14 - centerDist);

                        // Attack (AI color) vs Defense (Player color)
                        // Adjust weights as needed
                        score += evaluatePosition(board, r, c, aiColor) * 1.2;
                        score += evaluatePosition(board, r, c, playerSide);

                        emptyCells.push({ r, c, score });
                    }
                }
            }

            if (emptyCells.length === 0) {
                setWinner('draw');
                isGameOverRef.current = true;
                onGameOver({ success: true, score: 30 }); // Draw
                return;
            }

            // Sort by score
            emptyCells.sort((a, b) => b.score - a.score);

            // Probabilistic selection from top moves
            const topScore = emptyCells[0].score;
            const bestMoves = emptyCells.filter(m => m.score >= topScore * 0.9);
            const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];

            // Apply Move
            const newBoard = board.map(row => [...row]);
            newBoard[move.r][move.c] = aiColor;
            setBoard(newBoard);
            setLastMove({ r: move.r, c: move.c });
            // playJelloClickSound();

            if (checkWin(newBoard, move.r, move.c, aiColor)) {
                setWinner(aiColor);
                isGameOverRef.current = true;
                onGameOver({ success: false });
            } else {
                setCurrentPlayer(playerSide); // Pass turn to human
            }

            setIsAiThinking(false);
            isAiThinkingRef.current = false;
        }, 600);
    }, [board, checkWin, onGameOver, winner, playerSide]);


    // -- Player Move --
    const handleCellClick = (r: number, c: number) => {
        if (winner || isAiThinking || isGameOverRef.current) return;
        if (board[r][c] !== null) return;
        if (currentPlayer !== playerSide) return; // Not player's turn

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = playerSide;
        setBoard(newBoard);
        setLastMove({ r, c });
        // playJelloClickSound();

        if (checkWin(newBoard, r, c, playerSide)) {
            setWinner(playerSide);
            isGameOverRef.current = true;
            playClearSound();
            onGameOver({ success: true, score: 100 });
        } else {
            setCurrentPlayer(playerSide === 'black' ? 'white' : 'black'); // Pass turn to AI
        }
    };

    // Trigger AI turn if it's AI's turn
    useEffect(() => {
        if (!winner && !isGameOverRef.current && currentPlayer !== playerSide) {
            makeAiMove();
        }
    }, [currentPlayer, winner, playerSide, makeAiMove]);

    return {
        board,
        playerSide,
        currentPlayer,
        winner,
        isAiThinking,
        lastMove,
        handleCellClick,
        resetBoard // Expose reset
    };
};

/**
 * Heuristic evaluation of a single position for a specific player.
 */
function evaluatePosition(board: (Player | null)[][], r: number, c: number, player: Player): number {
    let score = 0;

    for (const [dr, dc] of DIRECTIONS) {
        let count = 0;
        let openEnds = 0;

        // Forward
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
            count++;
            nr += dr;
            nc += dc;
        }
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
            openEnds++;
        }

        // Backward
        nr = r - dr;
        nc = c - dc;
        while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
            count++;
            nr -= dr;
            nc -= dc;
        }
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
            openEnds++;
        }

        // Scoring (Consecutive + Open Ends)
        if (count >= 4) score += 10000;
        else if (count === 3 && openEnds > 0) score += 1000;
        else if (count === 2 && openEnds > 0) score += 100;
        else if (count === 1) score += 10;
    }
    return score;
}
