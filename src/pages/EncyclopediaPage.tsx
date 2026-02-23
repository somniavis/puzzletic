import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../contexts/NurturingContext';
import { CHARACTER_SPECIES } from '../data/species';
import { EvolutionNode } from '../components/Encyclopedia/EvolutionNode';
import { JelloAvatar } from '../components/characters/JelloAvatar';
import { createCharacter } from '../data/characters';
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
    const { unlockedJellos, totalGameStars } = useNurturing();
    // unlockedJellos is already the state object
    const speciesList = Object.values(CHARACTER_SPECIES);




    const [selectedJello, setSelectedJello] = React.useState<{ speciesId: string, stage: number } | null>(null);

    const isUnlocked = (speciesId: string, stage: number) => {
        const speciesUnlocks = unlockedJellos?.[speciesId];
        return speciesUnlocks ? speciesUnlocks.includes(stage) : false;
    };

    const handleNodeClick = (speciesId: string, stage: number) => {
        setSelectedJello({ speciesId, stage });
    };

    const closeModal = () => {
        setSelectedJello(null);
    };

    // Helper to get display character for modal
    const getModalCharacter = () => {
        if (!selectedJello) return null;
        const char = {
            ...createCharacter(selectedJello.speciesId), // Helper from data/characters
            evolutionStage: selectedJello.stage as any
        };
        // Ensure name is correct if we want to show it
        return char;
    };

    const modalCharacter = getModalCharacter();
    const modalSpecies = modalCharacter ? CHARACTER_SPECIES[selectedJello!.speciesId] : null;

    return (
        <div className="encyclopedia-page">
            <header className="encyclopedia-header">
                <h1>📚 {t('encyclopedia.title')}</h1>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="star-display" style={{ marginRight: '12px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', color: '#FFD700', fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        <span>⭐ {totalGameStars || 0}</span>
                    </div>
                    <button className="close-button" onClick={() => navigate('/profile')} aria-label={t('common.close')}>
                        ←
                    </button>
                </div>
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
                                        {t(`character.species.${species.id}`).replace(' ', '\n')}
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
                                                            onClick={(unlocked || stage === 5) ? handleNodeClick : undefined}
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

            {/* Jello Detail Modal OR Legendary Lock Modal */}
            {selectedJello && (
                <div className="jello-detail-modal-overlay" onClick={closeModal}>
                    {isUnlocked(selectedJello.speciesId, selectedJello.stage) ? (
                        // 1. Unlocked Character Detail Modal
                        <div className="jello-detail-modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={closeModal}>✕</button>

                            <div className="modal-jello-display">
                                <div className="modal-avatar-wrapper">
                                    <JelloAvatar
                                        character={modalCharacter!}
                                        speciesId={selectedJello.speciesId}
                                        size="medium"
                                        action="idle"
                                        mood="happy"
                                    />
                                </div>

                                <div className="modal-jello-info">
                                    <h2 className="modal-species-name">
                                        {t(`character.evolutions.${selectedJello.speciesId}_stage${selectedJello.stage}_name`)}
                                    </h2>
                                    <div className="modal-stage-badge">
                                        {modalSpecies?.tags?.flatMap(tagKey =>
                                            t(`character.tags.${tagKey}`).split('/').map(subTag => subTag.trim())
                                        ).map((tagLabel, idx) => (
                                            <span key={idx} className={`tag-badge ${selectedJello.speciesId}`}>
                                                {tagLabel}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="modal-description">
                                        {t(`character.evolutions.${selectedJello.speciesId}_stage${selectedJello.stage}_desc`)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : selectedJello.stage === 5 ? (
                        // 2. Legendary Lock Modal
                        <div className="jello-detail-modal-content legendary-locked" onClick={e => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={closeModal}>✕</button>

                            <div className="modal-jello-display">
                                <div className="modal-avatar-wrapper legendary-lock-wrapper">
                                    <div className="legendary-lock-icon">🔒</div>
                                </div>

                                <div className="modal-jello-info">
                                    <h2 className="modal-species-name legendary-title">
                                        {t('encyclopedia.legendary.title')}
                                    </h2>
                                    <div className="modal-stage-badge legendary-badge">
                                        {t('encyclopedia.stage', { stage: 5 })}
                                    </div>
                                    <div className="legendary-requirement">
                                        <p>{t('encyclopedia.legendary.prefix')}</p>
                                        <div className="star-requirement">
                                            <span className="star-icon">⭐</span>
                                            <span className="star-count">1000</span>
                                        </div>
                                        <p>{t('encyclopedia.legendary.suffix')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
