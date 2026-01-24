import React from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import './PetRoom.css'; // Ensure styles are available

interface EvolutionControlsProps {
    evolutionPhase: 'GROWTH' | 'READY_TO_EVOLVE' | 'MATURE' | 'LEGENDARY_READY' | 'MAX_LEVEL';
    showGiftBox: boolean;
    isActionInProgress: boolean;
    triggerEvolution: () => void;
    triggerGraduation: () => void;
}

export const EvolutionControls: React.FC<EvolutionControlsProps> = ({
    evolutionPhase,
    showGiftBox,
    isActionInProgress,
    triggerEvolution,
    triggerGraduation,
}) => {
    const { t } = useTranslation();

    // Condition to show ANY buttons
    const shouldShow = (
        evolutionPhase === 'READY_TO_EVOLVE' ||
        evolutionPhase === 'LEGENDARY_READY' ||
        evolutionPhase === 'MATURE' ||
        evolutionPhase === 'MAX_LEVEL'
    ) && !showGiftBox && !isActionInProgress;

    if (!shouldShow) return null;

    return (
        <div className="evolution-controls-container">
            {/* Evolution Button (Shows for Ready or Legendary) */}
            {(evolutionPhase === 'READY_TO_EVOLVE' || evolutionPhase === 'LEGENDARY_READY') && (
                <button
                    className="evolution-btn type-evolution"
                    onClick={() => {
                        playButtonSound();
                        triggerEvolution();
                    }}
                    disabled={isActionInProgress}
                    title={t('actions.evolve', 'Evolve')}
                >
                    <span className="action-icon">💫</span>
                    <span className="btn-text">{t('actions.evolve', 'Evolution')}</span>
                </button>
            )}

            {/* Graduation Button (Shows for Mature, Legendary, or Max) */}
            {(evolutionPhase === 'MATURE' || evolutionPhase === 'LEGENDARY_READY' || evolutionPhase === 'MAX_LEVEL') && (
                <button
                    className="evolution-btn"
                    onClick={() => {
                        playButtonSound();
                        triggerGraduation();
                    }}
                    disabled={isActionInProgress}
                    title={t('actions.graduate', 'Graduate')}
                >
                    <span className="action-icon">🎓</span>
                    <span className="btn-text">{t('actions.graduate', 'Graduation')}</span>
                </button>
            )}
        </div>
    );
};
