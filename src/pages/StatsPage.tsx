import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CHARACTERS } from '../components/characters';
import type { Character, CharacterAction, CharacterMood } from '../types/character';
import type { CharacterSpeciesId } from '../data/species';

interface StatsPageProps {
    character: Character;
    selectedSpeciesId: CharacterSpeciesId;
    mood: CharacterMood;
    action: CharacterAction;
    onMoodChange: (mood: CharacterMood) => void;
    onActionChange: (action: CharacterAction) => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({
    character,
    selectedSpeciesId,
    mood,
    action,
    onMoodChange,
    onActionChange
}) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="page-nav">
                <button onClick={() => navigate('/home')}>🏠 Home</button>
                <button onClick={() => navigate('/gallery')}>🖼️ Gallery</button>
            </div>
            <div className="app">
                <div className="app-header">
                    <h1>Puzzletic - Stats</h1>
                    <p>Character Details & Controls</p>
                </div>

                <div className="character-stage">
                    {(() => {
                        const CharacterComponent = CHARACTERS[selectedSpeciesId as keyof typeof CHARACTERS];
                        return (
                            <CharacterComponent
                                character={character}
                                size="large"
                                mood={mood}
                                action={action}
                                onClick={() => onActionChange('jumping')}
                            />
                        );
                    })()}
                </div>

                <div className="controls">
                    <div className="control-section">
                        <h3>Mood</h3>
                        <div className="button-group">
                            <button onClick={() => onMoodChange('happy')}>Happy</button>
                            <button onClick={() => onMoodChange('neutral')}>Neutral</button>
                            <button onClick={() => onMoodChange('sad')}>Sad</button>
                            <button onClick={() => onMoodChange('excited')}>Excited</button>
                            <button onClick={() => onMoodChange('sleeping')}>Sleeping</button>
                        </div>
                    </div>

                    <div className="control-section">
                        <h3>Actions</h3>
                        <div className="button-group">
                            <button onClick={() => onActionChange('idle')}>Idle</button>
                            <button onClick={() => onActionChange('jumping')}>Jump</button>
                            <button onClick={() => onActionChange('happy')}>Wiggle</button>
                            <button onClick={() => onActionChange('playing')}>Play</button>
                        </div>
                    </div>
                </div>

                <div className="character-info">
                    <h3>{character.name}</h3>
                    <div className="stats">
                        <div className="stat">
                            <span>Level:</span> <strong>{character.level}</strong>
                        </div>
                        <div className="stat">
                            <span>Health:</span> <strong>{character.stats.health}%</strong>
                        </div>
                        <div className="stat">
                            <span>Happiness:</span> <strong>{character.stats.happiness}%</strong>
                        </div>
                        <div className="stat">
                            <span>Hunger:</span> <strong>{character.stats.hunger}%</strong>
                        </div>
                        <div className="stat">
                            <span>Hygiene:</span> <strong>{character.stats.hygiene}%</strong>
                        </div>
                        <div className="stat">
                            <span>Fatigue:</span> <strong>{character.stats.fatigue}%</strong>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
