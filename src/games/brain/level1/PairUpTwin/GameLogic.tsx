import React from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { usePairUpLogic } from './usePairUpLogic';
import { PairUpGrid } from './PairUpGrid';

interface GameLogicProps {
    engine: ReturnType<typeof useGameEngine>;
}

export const GameLogic: React.FC<GameLogicProps> = ({ engine }) => {
    const logic = usePairUpLogic(engine, 'twin');

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
