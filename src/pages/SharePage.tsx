import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { decodeShareData, type ShareData } from '../utils/shareUtils';
import { JelloAvatar } from '../components/characters/JelloAvatar';
import { RoomBackground } from '../components/PetRoom/RoomBackground';
import { JelloHouse } from '../components/PetRoom/JelloHouse';
import { createCharacter } from '../data/characters';
import type { CharacterSpeciesId } from '../data/species';
import '../components/PetRoom/PetRoom.css';
import './PlayPage.css'; // Reuse basic page styles

import './SharePage.css';

export const SharePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sharedData, setSharedData] = useState<ShareData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const encodedData = searchParams.get('data');
        if (encodedData) {
            const decoded = decodeShareData(encodedData);
            if (decoded) {
                setSharedData(decoded);
            } else {
                setError(t('share.error.invalid', 'Invalid share link'));
            }
        } else {
            setError(t('share.error.missing', 'No data found'));
        }
    }, [searchParams, t]);

    if (error) {
        return (
            <div className="share-error-container">
                <h2>😢 {error}</h2>
                <button className="action-btn" onClick={() => navigate('/')}>
                    {t('common.goHome', 'Go Home')}
                </button>
            </div>
        );
    }

    if (!sharedData) {
        return <div className="loading-overlay">Loading...</div>;
    }

    // Create a temporary character object for display
    let tempCharacter;
    try {
        tempCharacter = createCharacter(sharedData.c as CharacterSpeciesId);
        tempCharacter.evolutionStage = sharedData.e as any;
        tempCharacter.name = sharedData.n;
        tempCharacter.level = sharedData.l;
    } catch (err) {
        console.error('Failed to reconstruct character:', err);
        return (
            <div className="share-error-container">
                <h2>😢 {t('share.error.invalid', 'Invalid share data')}</h2>
                <button className="action-btn" onClick={() => navigate('/')}>
                    {t('common.goHome', 'Go Home')}
                </button>
            </div>
        );
    }

    return (
        <div className="share-page-container">
            {/* Snapshot Card */}
            <div className="share-card">
                {/* Snapshot Box (Recreated Scene) */}
                <div className="share-snapshot-box">
                    {/* Wrap in .pet-room class */}
                    <div className="share-pet-room">
                        <RoomBackground
                            background={sharedData.g}
                            showGiftBox={false}
                        />

                        {/* House - Exact Positioning from PetRoom.tsx */}
                        <div className="share-room-container">
                            <JelloHouse
                                type={sharedData.h}
                                isSleeping={false}
                                onClick={() => { }}
                                style={{
                                    left: '10%',
                                    bottom: '25%',
                                    position: 'absolute'
                                }}
                            />
                        </div>

                        {/* Character Container - Matches PetRoom.tsx positioning */}
                        <div className="share-character-container">
                            <JelloAvatar
                                character={tempCharacter}
                                mood="happy"
                                action="idle"
                                size="small"
                            />
                        </div>
                    </div>
                </div>

                {/* Text Group - Vertically Centered */}
                <div className="share-text-group">
                    <p className="share-title">
                        {t('share.invite.title', 'This is the Jello I\'m raising! 🥰')}
                    </p>
                    <p className="share-desc">
                        {t('share.invite.desc', 'Want to raise one together?')}
                    </p>
                </div>

                <button className="share-action-btn">
                    {t('share.cta', 'Play Now!')}
                </button>
            </div>
        </div>
    );
};
