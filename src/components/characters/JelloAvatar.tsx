import React from 'react';
import type { CharacterComponentProps } from '../../types/character';
import { CHARACTER_SPECIES } from '../../data/species';
import './JelloAvatar.css';

interface JelloAvatarProps extends CharacterComponentProps {
    speciesId?: string; // Optional override, otherwise use character.speciesId
    disableAnimation?: boolean; // New prop to stop float/bounce
}

export const JelloAvatar: React.FC<JelloAvatarProps> = ({
    character,
    speciesId,
    size = 'medium',
    action = 'idle',
    mood: _mood = 'neutral',
    onClick,
    disableAnimation = false,
}) => {
    // Use passed speciesId or fall back to character's speciesId
    const targetSpeciesId = speciesId || character.speciesId;
    const species = CHARACTER_SPECIES[targetSpeciesId];

    // If species not found (e.g. invalid ID), render placeholder or nothing
    if (!species) {
        console.warn(`Species not found: ${targetSpeciesId}`);
        return null;
    }

    // Determine evolution stage (default to 1 if not set)
    const stage = character.evolutionStage || 1;
    const evolution = species.evolutions.find(e => e.stage === stage);
    const imageUrl = evolution?.imageUrl;

    // Size calculation
    const getSizeInPixels = () => {
        switch (size) {
            case 'small': return 96;
            case 'large': return 288;
            default: return 192;
        }
    };
    const sizeInPixels = getSizeInPixels();

    return (
        <div
            key={`${targetSpeciesId}-${action}`}
            className={`jello-avatar jello-avatar--${action} ${disableAnimation ? 'no-animation' : ''}`}
            onClick={onClick}
            style={{
                width: sizeInPixels,
                height: sizeInPixels,
            }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={species.name}
                    className="jello-avatar__image"
                    style={{
                        width: '100%',
                        height: '100%',
                        imageRendering: 'pixelated',
                    }}
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: '#eee',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                    }}
                >
                    ?
                </div>
            )}
        </div>
    );
};

export default JelloAvatar;
