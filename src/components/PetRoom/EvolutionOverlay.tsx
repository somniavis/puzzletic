import React from 'react';
import { useNurturing } from '../../contexts/NurturingContext';
import { WallButton } from './WallButton';
import { EvolutionAnimation } from '../EvolutionAnimation/EvolutionAnimation'; // Ensure path correct
import { GraduationAnimation } from '../GraduationAnimation/GraduationAnimation'; // Ensure path correct

export const EvolutionOverlay: React.FC = () => {
    const {
        evolutionPhase,
        triggerEvolution,
        triggerGraduation,
        isEvolving,
        isGraduating,
        speciesId,
        evolutionStage,
        completeEvolutionAnimation,
        completeGraduationAnimation,
        characterName,
        isActionInProgress,
        showGiftBox
    } = useNurturing() as any; // Cast for safety if context types lag

    // Do not show triggers if an action is already in progress or gift box is open
    // We check this here to keep the overlay clean
    // Note: isEvolving/isGraduating ARE actions in progress, but we need to render the animation then!
    const showTriggers = !isActionInProgress && !showGiftBox && !isEvolving && !isGraduating;

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        top: '20%',
        left: '10%',
        pointerEvents: 'auto' // Re-enable for the button
    };

    const renderButtons = () => {
        if (!showTriggers) return null;

        switch (evolutionPhase) {
            case 'READY_TO_EVOLVE':
                return (
                    <WallButton
                        label="진화 가능!"
                        icon="✨"
                        onClick={triggerEvolution}
                        style={baseStyle}
                    />
                );
            case 'MATURE':
                return (
                    <WallButton
                        label="졸업하기"
                        icon="🎓"
                        onClick={triggerGraduation}
                        style={baseStyle}
                    />
                );
            case 'LEGENDARY_READY':
                return (
                    <div style={{ ...baseStyle, display: 'flex', gap: '20px' }}>
                        <WallButton
                            label="졸업하기"
                            icon="🎓"
                            onClick={triggerGraduation}
                        />
                        <WallButton
                            label="전설 진화"
                            icon="👑"
                            type="legendary"
                            onClick={triggerEvolution}
                        />
                    </div>
                );
            case 'MAX_LEVEL':
                return (
                    <WallButton
                        label="명예 졸업"
                        icon="🏆"
                        onClick={triggerGraduation}
                        style={baseStyle}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="evolution-overlay-container" style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50, // Above normal UI, below Modals (100)
            pointerEvents: 'none', // Allow clicks to pass through empty areas
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* 1. Triggers */}
            {renderButtons()}

            {/* 2. Animations (Take over screen) */}
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
