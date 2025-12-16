import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../contexts/NurturingContext';
import { CHARACTER_SPECIES } from '../data/species';
import { EvolutionNode } from '../components/Encyclopedia/EvolutionNode';
import './EncyclopediaPage.css';

// Color themes for each species
const SPECIES_THEMES: Record<string, { bg: string, border: string, shadow: string, text: string }> = {
    yellowJello: { bg: '#FFD700', border: '#DAA520', shadow: '#B8860B', text: '#4d3e2f' },
    redJello: { bg: '#FF6B6B', border: '#CD5C5C', shadow: '#8B0000', text: '#FFFFFF' },
    blueJello: { bg: '#5CACEE', border: '#4682B4', shadow: '#4169E1', text: '#FFFFFF' },
    mintJello: { bg: '#98FF98', border: '#3CB371', shadow: '#2E8B57', text: '#4d3e2f' },
    purpleJello: { bg: '#DDA0DD', border: '#BA55D3', shadow: '#800080', text: '#FFFFFF' },
    orangeJello: { bg: '#FFA500', border: '#FF8C00', shadow: '#D2691E', text: '#FFFFFF' },
    creamJello: { bg: '#FFFDD0', border: '#F5DEB3', shadow: '#D2B48C', text: '#4d3e2f' },
    pinkJello: { bg: '#FFB6C1', border: '#FF69B4', shadow: '#C71585', text: '#4d3e2f' },
};

export const EncyclopediaPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Get unlock status from context to ensure persistent state is used
    const { unlockedJellos } = useNurturing();
    // unlockedJellos is already the state object
    const speciesList = Object.values(CHARACTER_SPECIES);

    const isUnlocked = (speciesId: string, stage: number) => {
        const speciesUnlocks = unlockedJellos?.[speciesId];
        return speciesUnlocks ? speciesUnlocks.includes(stage) : false;
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
                    {speciesList.map(species => {
                        const theme = SPECIES_THEMES[species.id] || SPECIES_THEMES['yellowJello'];

                        return (
                            <div key={species.id} className="species-track-section">
                                <div className="species-info">
                                    <span
                                        className="species-name"
                                        style={{
                                            backgroundColor: theme.bg,
                                            borderColor: theme.border,
                                            boxShadow: `0 4px 0 ${theme.shadow}`,
                                            color: theme.text
                                        }}
                                    >
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

                                                    {/* Node Component */}
                                                    <div className="track-node-wrapper">
                                                        <EvolutionNode
                                                            speciesId={species.id}
                                                            stage={stage}
                                                            isUnlocked={unlocked}
                                                        />
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
