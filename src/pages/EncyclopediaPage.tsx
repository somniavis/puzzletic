import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../contexts/NurturingContext';
import { CHARACTER_SPECIES } from '../data/species';
import { JelloAvatar } from '../components/characters/JelloAvatar';
import { createCharacter } from '../data/characters';
import type { EvolutionStage } from '../types/character';
import { Lock } from 'lucide-react';
import './EncyclopediaPage.css';

export const EncyclopediaPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { unlockedJellos } = useNurturing();
    const speciesList = Object.values(CHARACTER_SPECIES);

    const isUnlocked = (speciesId: string, stage: number) => {
        return unlockedJellos?.[speciesId]?.includes(stage);
    };

    const renderCell = (speciesId: string, stage: number) => {
        // Create a temporary character object for rendering the avatar
        const tempCharacter = React.useMemo(() => {
            const char = createCharacter(speciesId);
            char.evolutionStage = stage as EvolutionStage;
            return char;
        }, [speciesId, stage]);

        return (
            <div className="node-avatar-wrapper">
                <JelloAvatar
                    character={tempCharacter}
                    speciesId={speciesId}
                    size="small"
                    action="idle"
                    mood="neutral"
                    disableAnimation={true}
                />
            </div>
        );
    };

    return (
        <div className="encyclopedia-page">
            <header className="encyclopedia-header">
                <h1>📚 {t('encyclopedia.title')}</h1>
                <button className="close-button" onClick={() => navigate('/home')}>
                    🏠 {t('encyclopedia.home')}
                </button>
            </header>

            <div className="encyclopedia-content">
                <div className="evolution-tree-container">
                    {speciesList.map(species => (
                        <div key={species.id} className="species-track-section">
                            <div className="species-info">
                                <span className="species-name">
                                    {t(`character.species.${species.id}`, species.name).replace(' ', '\n')}
                                </span>
                            </div>

                            <div className="track-scroll-area">
                                <div className="evolution-track">
                                    {[1, 2, 3, 4, 5].map((stage) => {
                                        const unlocked = isUnlocked(species.id, stage);

                                        return (
                                            <React.Fragment key={stage}>
                                                {/* Connector Line (except for first item) */}
                                                {stage > 1 && (
                                                    stage === 5 ? (
                                                        <div className={`track-connector-plus ${unlocked ? 'active' : ''}`}>+</div>
                                                    ) : (
                                                        <div className={`track-connector ${unlocked ? 'active' : ''}`} />
                                                    )
                                                )}

                                                {/* Node */}
                                                <div className="track-node-wrapper">
                                                    <div className={`evolution-node ${unlocked ? 'unlocked' : 'locked'} ${stage === 5 ? 'hidden-node' : ''}`}>
                                                        {unlocked ? (
                                                            renderCell(species.id, stage)
                                                        ) : (
                                                            <div className="node-locked-content">
                                                                <Lock size={20} className="node-lock-icon" />
                                                                <span className="node-stage-label">
                                                                    {stage === 5 ? '?' : stage}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
