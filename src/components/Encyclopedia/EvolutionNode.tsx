import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import { JelloAvatar } from '../characters/JelloAvatar';
import { createCharacter } from '../../data/characters';
import type { EvolutionStage } from '../../types/character';

interface EvolutionNodeProps {
    speciesId: string;
    stage: number;
    isUnlocked: boolean;
    onClick?: (speciesId: string, stage: number) => void;
}

export const EvolutionNode: React.FC<EvolutionNodeProps> = React.memo(({ speciesId, stage, isUnlocked, onClick }) => {
    const isHiddenNode = stage === 5;

    // Memoize the character object creation to prevent unnecessary re-calculations
    // This is safe here because this is a top-level component, not a callback
    const displayCharacter = useMemo(() => {
        if (!isUnlocked) return null;
        const char = createCharacter(speciesId);
        char.evolutionStage = stage as EvolutionStage;
        return char;
    }, [speciesId, stage, isUnlocked]);

    const handleClick = () => {
        if ((isUnlocked || isHiddenNode) && onClick) {
            onClick(speciesId, stage);
        }
    };

    const isClickable = (isUnlocked || isHiddenNode) && onClick;

    return (
        <div
            className={`evolution-node ${isUnlocked ? 'unlocked' : 'locked'} ${isHiddenNode ? 'hidden-node' : ''} ${isClickable ? 'clickable' : ''}`}
            onClick={handleClick}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            {isUnlocked && displayCharacter ? (
                <div className="node-avatar-wrapper">
                    <JelloAvatar
                        character={displayCharacter}
                        speciesId={speciesId}
                        size="small"
                        action="idle"
                        mood="neutral"
                        disableAnimation={true}
                    />
                </div>
            ) : (
                <div className="node-locked-content">
                    <Lock size={20} className="node-lock-icon" />
                    <span className="node-stage-label">
                        {isHiddenNode ? '?' : stage}
                    </span>
                </div>
            )}
        </div>
    );
});
