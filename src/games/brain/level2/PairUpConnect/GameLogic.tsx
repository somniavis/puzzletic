import React from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { usePairUpLogic } from '../../level1/PairUpTwin/usePairUpLogic';
import { PairUpGrid } from '../../level1/PairUpTwin/PairUpGrid';

// We need to access the engine context. Since GameLogic is a child of Layout2, 
// and index.tsx creates the engine, we can pass it down via props OR 
// if Layout2 provided context (it doesn't usually).
// The standard pattern in ColorLink/etc is passing `engine` as prop to Logic Hook, 
// and `GameLogic` component usually uses a hook or receives props.
// BUT `index.tsx` renders `<GameLogic />`. We need to pass engine to it.
// Let's modify index.tsx first to pass engine to GameLogic.

// Wait, I can't modify props of GameLogic here without changing index.tsx.
// Let's assume I will update index.tsx to pass `engine` prop to `GameLogic`.

interface GameLogicProps {
    engine: ReturnType<typeof useGameEngine>;
}

export const GameLogic: React.FC<GameLogicProps> = ({ engine }) => {
    const logic = usePairUpLogic(engine, 'connect');

    return (
        <PairUpGrid
            cards={logic.cards}
            config={logic.gridConfig}
            previewProgress={logic.previewProgress}
            gameState={logic.gameState}
            onCardClick={logic.handleCardClick}
        />
    );
};
