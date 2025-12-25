import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './GraduationAnimation.css';
import { JelloAvatar } from '../characters/JelloAvatar';
import type { CharacterSpeciesId } from '../../data/species';
import type { EvolutionStage } from '../../types/character';
import { createCharacter } from '../../data/characters';
// import { playFarewellSound } from '../../utils/sound'; // TODO: Add sound

interface GraduationAnimationProps {
    speciesId: CharacterSpeciesId;
    currentStage: EvolutionStage;
    onComplete: () => void;
}

export const GraduationAnimation: React.FC<GraduationAnimationProps> = ({
    speciesId,
    currentStage,
    onComplete,
}) => {
    const { t } = useTranslation();
    const [opacity, setOpacity] = useState(0);

    // Create a temporary character object to render the current departing Jello
    const tempCharacter = React.useMemo(() => {
        const char = createCharacter(speciesId);
        char.evolutionStage = currentStage;
        return char;
    }, [speciesId, currentStage]);

    useEffect(() => {
        // Fade in
        setTimeout(() => setOpacity(1), 100);
        // playFarewellSound();
    }, []);

    return (
        <div className="graduation-overlay" style={{ opacity }}>
            <div className="graduation-content">
                <div className="graduation-title">{t('graduation.title', 'Goodbye, Jello!')}</div>

                <div className="graduation-avatar-container">
                    <div className="graduation-spotlight" />
                    <div className="graduation-avatar">
                        <JelloAvatar
                            character={tempCharacter}
                            size="medium"
                            action="happy" // Waving goodbye?
                            mood="happy"
                            disableAnimation={false}
                        />
                    </div>
                    {/* Suitcase or items representing departure can be added here */}
                    <div className="graduation-luggage">🧳</div>
                </div>

                <div className="graduation-message">
                    {t('graduation.message', 'Your Jello has grown up and is ready to see the world!')}
                </div>

                <button className="graduation-button" onClick={onComplete}>
                    {t('graduation.action', 'See you again!')}
                </button>
            </div>
        </div>
    );
};
