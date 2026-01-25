import React from 'react';
import type { CharacterComponentProps } from '../../types/character';
import { CHARACTER_SPECIES } from '../../data/species';
import './JelloAvatar.css';

interface JelloAvatarProps extends CharacterComponentProps {
    speciesId?: string; // Optional override, otherwise use character.speciesId
    disableAnimation?: boolean; // New prop to stop float/bounce
    responsive?: boolean; // New prop for fluid sizing
    customSize?: number; // New prop for arbitrary pixel size
}

export const JelloAvatar: React.FC<JelloAvatarProps> = ({
    character,
    speciesId,
    size = 'medium',
    action = 'idle',
    mood: _mood = 'neutral',
    onClick,
    disableAnimation = false,
    responsive = false,
    customSize,
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
    const sizeInPixels = customSize || getSizeInPixels();

    // Visual balancing: Stage 1 & 2 images have less whitespace, so they appear larger.
    // We add padding to shrink them slightly relative to the container.
    // However, if responsive, we assume parent handles sizing/padding, so we set to 0 to avoid over-shrinking.
    const containerPadding = responsive ? 0 : ((stage <= 2) ? (size === 'small' ? '8px' : '12px') : 0);

    return (
        <div
            // Fix: Remove action from key to prevent unmounting/flicker on state change
            // This allows CSS transitions/animations to switch smoothly on the same element
            key={targetSpeciesId}
            className={`jello-avatar jello-avatar--${action} ${disableAnimation ? 'no-animation' : ''}`}
            onClick={onClick}
            style={{
                width: responsive ? '100%' : sizeInPixels,
                height: responsive ? '100%' : sizeInPixels,
                padding: containerPadding,
                boxSizing: 'border-box', // Ensure padding shrinks the content
                display: responsive ? 'flex' : 'block', // Flex ensures centering if padding is 0
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={species.name}
                    crossOrigin="anonymous"
                    className="jello-avatar__image"
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block', // Prevent baseline gap
                        objectFit: 'contain' // Ensure aspect ratio
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
