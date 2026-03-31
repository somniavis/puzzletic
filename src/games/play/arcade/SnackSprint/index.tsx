import React from 'react';
import type { GameComponentProps } from '../../../types';
import { StandalonePlayGameShell } from '../../shared/StandalonePlayGameShell';

export const SnackSprint: React.FC<GameComponentProps> = (props) => {
    return (
        <StandalonePlayGameShell
            {...props}
            title="Snack Sprint"
            emoji="🍓"
            description="Lightweight standalone runner slot ready. Use this route for a game that does not depend on the old layout system."
        />
    );
};

export default SnackSprint;
