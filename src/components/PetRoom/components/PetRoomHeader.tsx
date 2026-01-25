import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { JelloAvatar } from '../../characters/JelloAvatar';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { useAuth } from '../../../contexts/AuthContext';
import { useNurturing } from '../../../contexts/NurturingContext';

interface PetRoomHeaderProps {
    character: Character;
    showGiftBox: boolean;
    mood: CharacterMood;
    action: CharacterAction;
}

export const PetRoomHeader: React.FC<PetRoomHeaderProps> = ({
    character,
    showGiftBox,
    mood,
    action
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const nurturing = useNurturing();

    const getDisplayName = () => {
        if (user?.displayName) {
            const speciesSuffix = character.name.includes(' ') ? character.name.split(' ').pop() : 'Jello';
            return `${user.displayName} ${speciesSuffix}`;
        }
        return character.name;
    };

    const getHealthIcon = (health: number): string => {
        if (health >= 80) return '💖';
        if (health >= 50) return '❤️';
        if (health >= 30) return '💔';
        if (health >= 10) return '🩶';
        return '🖤';
    };

    const getHappinessIcon = (happiness: number): string => {
        if (happiness >= 80) return '😍';
        if (happiness >= 60) return '😊';
        if (happiness >= 40) return '🙂';
        if (happiness >= 20) return '😔';
        return '😭';
    };

    return (
        <div className="game-header">
            <div className="character-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                <div className="profile-avatar">
                    {!showGiftBox ? (
                        <JelloAvatar
                            character={character}
                            size="small"
                            mood={mood}
                            action={action}
                        />
                    ) : (
                        <div className="profile-avatar-placeholder" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
                    )}
                </div>
                <div className="profile-info">
                    <div className="profile-name">{!showGiftBox ? getDisplayName() : '-'}</div>
                    <div className="profile-stats-row">
                        <div className="profile-level">{t('character.profile.level', { level: character.level })}</div>
                        <div className="profile-gro">💰 {nurturing.gro}</div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1 }} />

            <div className="stats-row">
                <div className="stat-badge stat-badge--hunger">
                    <span className="stat-icon">🍖</span>
                    <span className="stat-value">{Math.round(nurturing.stats.fullness)}</span>
                </div>
                <div className="stat-badge stat-badge--happiness">
                    <span className="stat-icon">{getHappinessIcon(nurturing.stats.happiness)}</span>
                    <span className="stat-value">{Math.round(nurturing.stats.happiness)}</span>
                </div>
                <div className="stat-badge stat-badge--health">
                    <span className="stat-icon">{getHealthIcon(nurturing.stats.health)}</span>
                    <span className="stat-value">{Math.round(nurturing.stats.health)}</span>
                </div>
            </div>
        </div>
    );
};
