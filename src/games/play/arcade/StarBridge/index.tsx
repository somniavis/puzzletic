import React from 'react';
import type { GameComponentProps } from '../../../types';
import { StandalonePlayGameShell } from '../../shared/StandalonePlayGameShell';

export const StarBridge: React.FC<GameComponentProps> = (props) => {
    return (
        <StandalonePlayGameShell
            {...props}
            title="Star Bridge"
            emoji="🌌"
            description="Puzzle-action play slot ready. Add a fully custom board, effects, and loading flow here later."
        />
    );
};

export default StarBridge;
