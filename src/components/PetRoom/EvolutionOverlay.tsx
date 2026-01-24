import React from 'react';
import { useNurturing } from '../../contexts/NurturingContext';
import { EvolutionAnimation } from '../EvolutionAnimation/EvolutionAnimation';
import { GraduationAnimation } from '../GraduationAnimation/GraduationAnimation';

export const EvolutionOverlay: React.FC = () => {
    const {
        evolutionPhase, // Used for condition
        isEvolving,
        isGraduating,
        speciesId,
        evolutionStage,
        completeEvolutionAnimation,
        completeGraduationAnimation,
        characterName,
    } = useNurturing() as any;

    return (
        <div className="evolution-overlay-container" style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50, // Above normal UI, below Modals (100)
            pointerEvents: 'none', // Allow clicks to pass through empty areas
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Animations (Take over screen) */}
            {isEvolving && speciesId && (
                <div style={{ pointerEvents: 'auto', position: 'absolute', inset: 0 }}>
                    <EvolutionAnimation
                        speciesId={speciesId}
                        newStage={evolutionPhase === 'LEGENDARY_READY' ? 5 : (evolutionStage + 1)}
                        onComplete={completeEvolutionAnimation}
                    />
                </div>
            )}

            {isGraduating && speciesId && (
                <div style={{ pointerEvents: 'auto', position: 'absolute', inset: 0 }}>
                    <GraduationAnimation
                        speciesId={speciesId}
                        currentStage={evolutionStage}
                        onComplete={() => completeGraduationAnimation(characterName)}
                    />
                </div>
            )}
        </div>
    );
};
