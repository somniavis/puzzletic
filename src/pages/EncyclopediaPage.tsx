import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNurturing } from '../contexts/NurturingContext';
import { CHARACTER_SPECIES } from '../data/species';
import { JelloAvatar } from '../components/characters/JelloAvatar';
import { createCharacter } from '../data/characters';
import type { EvolutionStage } from '../types/character';
import { Lock } from 'lucide-react';
import './EncyclopediaPage.css';

export const EncyclopediaPage: React.FC = () => {
    const navigate = useNavigate();
    const { unlockedJellos } = useNurturing();
    const speciesList = Object.values(CHARACTER_SPECIES);



    const isUnlocked = (speciesId: string, stage: number) => {
        return unlockedJellos?.[speciesId]?.includes(stage);
    };

    const renderCell = (speciesId: string, stage: number) => {
        const unlocked = isUnlocked(speciesId, stage);

        // Create a temporary character object for rendering the avatar
        const tempCharacter = React.useMemo(() => {
            const char = createCharacter(speciesId);
            char.evolutionStage = stage as EvolutionStage;
            return char;
        }, [speciesId, stage]);

        return (
            <div className={`encyclopedia-cell ${unlocked ? 'unlocked' : 'locked'} ${stage === 5 ? 'hidden-stage' : ''}`}>
                <div className="cell-content">
                    {unlocked ? (
                        <div className="jello-wrapper">
                            <div className="jello-scale-wrapper">
                                <JelloAvatar
                                    character={tempCharacter}
                                    speciesId={speciesId}
                                    size="small"
                                    action="idle"
                                    mood="neutral"
                                    disableAnimation={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="locked-content">
                            <Lock size={32} className="lock-icon" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="encyclopedia-page">
            <header className="encyclopedia-header">
                <h1>📚 Encyclopedia</h1>
                <button className="close-button" onClick={() => navigate('/home')}>
                    🏠 Home
                </button>
            </header>

            <div className="encyclopedia-content">
                <div className="encyclopedia-grid">
                    {/* Header Row */}
                    <div className="grid-header-row">
                        <div className="grid-header-col" style={{ visibility: 'hidden' }}>Species</div>
                        {[1, 2, 3, 4, 5].map(stage => (
                            <div key={stage} className="grid-header-col">
                                {stage === 5 ? 'HIDDEN' : `Stage ${stage}`}
                            </div>
                        ))}
                    </div>

                    {/* Species Rows */}
                    {speciesList.map(species => (
                        <div key={species.id} className="grid-row">
                            <div className="grid-header-row-label">
                                <span className="species-label-text">{species.name.replace(' Jello', '')}</span>
                            </div>
                            {[1, 2, 3, 4, 5].map(stage => (
                                <div key={`${species.id}-${stage}`} className="grid-cell-wrapper">
                                    {renderCell(species.id, stage)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
