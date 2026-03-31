import React from 'react';
import type { GameComponentProps } from '../../../types';
import { StandalonePlayGameShell } from '../../shared/StandalonePlayGameShell';

export const JelloComet: React.FC<GameComponentProps> = (props) => {
    return (
        <StandalonePlayGameShell
            {...props}
            title="Jello Comet"
            emoji="☄️"
            description="Arcade-style play game slot ready. Build this one with its own controls, HUD, and scene flow."
        />
    );
};

export default JelloComet;
