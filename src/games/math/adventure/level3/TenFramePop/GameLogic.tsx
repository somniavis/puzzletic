import { useCallback, useState } from 'react';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { TEN_FRAME_POP_CONSTANTS } from './constants';
import type { TenFramePopState } from './types';

export const useTenFramePopLogic = () => {
    const engine = useGameEngine({
        initialLives: TEN_FRAME_POP_CONSTANTS.BASE_LIVES,
        initialTime: TEN_FRAME_POP_CONSTANTS.TIME_LIMIT,
        maxDifficulty: 1
    });

    const [gameState, setGameState] = useState<TenFramePopState>({
        round: 1
    });

    const nextRound = useCallback(() => {
        setGameState((prev) => ({ round: prev.round + 1 }));
    }, []);

    return {
        ...engine,
        ...gameState,
        nextRound,
        startGame: () => {
            engine.startGame();
            setGameState({ round: 1 });
        }
    };
};
