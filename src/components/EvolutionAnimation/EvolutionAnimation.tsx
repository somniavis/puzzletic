import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './EvolutionAnimation.css';
import { JelloAvatar } from '../characters/JelloAvatar';
import type { CharacterSpeciesId } from '../../data/species';
import type { EvolutionStage } from '../../types/character';
import { createCharacter } from '../../data/characters';
import { playClearSound } from '../../utils/sound';

interface EvolutionAnimationProps {
    speciesId: CharacterSpeciesId;
    newStage: EvolutionStage;
    onComplete: () => void;
}

export const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({
    speciesId,
    newStage,
    onComplete,
}) => {
    const { t } = useTranslation();
    const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

    // Create a temporary character object to pass to JelloAvatar
    // We only need it to have the correct species and stage
    const tempCharacter = React.useMemo(() => {
        const char = createCharacter(speciesId);
        char.evolutionStage = newStage;
        return char;
    }, [speciesId, newStage]);

    useEffect(() => {
        // Sound Effect
        playClearSound();

        // Generate confetti particles
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // 0-100%
            delay: Math.random() * 2, // 0-2s delay
            duration: 3 + Math.random() * 2, // 3-5s fall duration
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="evolution-overlay" onClick={onComplete}>
            <div className="evolution-particles">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: `${p.left}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            backgroundColor: ['gold', 'orange', 'yellow', 'white', '#FFD700'][Math.floor(Math.random() * 5)]
                        }}
                    />
                ))}
            </div>

            <div className="evolution-content">
                <div className="evolution-title">{t('evolution.title')}</div>

                <div className="evolution-avatar-container">
                    <div className="evolution-glow" />
                    <div className="evolution-avatar">
                        <JelloAvatar
                            character={tempCharacter}
                            size="large"
                            action="jumping" // Using jumping action for excitement
                            mood="excited"
                            disableAnimation={false} // Let it bounce!
                        />
                    </div>
                </div>

                <div className="evolution-click-hint">
                    {t('evolution.continue')}
                </div>
            </div>
        </div>
    );
};
