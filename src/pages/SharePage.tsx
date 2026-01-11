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

    const handleStartGame = () => {
        navigate('/signup');
    };

    if (error) {
        return (
            <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: '1rem', background: '#f5f5f5' }}>
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
    const tempCharacter = createCharacter(sharedData.c as CharacterSpeciesId);
    tempCharacter.evolutionStage = sharedData.e as any;
    tempCharacter.name = sharedData.n;
    tempCharacter.level = sharedData.l;

    return (
        <div className="page-container" style={{
            width: '100vw',
            height: '100dvh',
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            {/* Snapshot Card */}
            <div className="snapshot-card" style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '15px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                maxWidth: '360px',
                width: '100%',
                border: '4px solid #8B4513'
            }}>
                {/* Header Title */}
                <h2 style={{
                    margin: '5px 0 0',
                    color: '#5D4037',
                    fontSize: '1.4rem',
                    textAlign: 'center'
                }}>
                    {sharedData.n}
                </h2>
                <p style={{ margin: '0', color: '#888', fontSize: '0.9rem' }}>Lv. {sharedData.l}</p>

                {/* Snapshot Box (Recreated Scene) */}
                <div style={{
                    width: '100%',
                    aspectRatio: '3/4', // Portrait ratio resembling phone screen
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #ccc',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
                }}>
                    {/* Wrap in .pet-room class */}
                    <div className="pet-room" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <RoomBackground
                            background={sharedData.g}
                            showGiftBox={false}
                        />

                        {/* House - Exact Positioning from PetRoom.tsx */}
                        <div className="room-container" style={{ position: 'absolute', inset: 0 }}>
                            <JelloHouse
                                type={sharedData.h}
                                isSleeping={false}
                                onClick={() => { }}
                                style={{
                                    left: '10%',
                                    bottom: '25%',  // Matches PetRoom.tsx
                                    // Note: JelloHouse renders absolute position via its internal CSS or style prop if passed.
                                    // But in PetRoom.tsx it receives style prop. JelloHouse.tsx uses it.
                                    // However, JelloHouse.css might imply absolute position?
                                    // Let's assume style prop overrides/merges.
                                    position: 'absolute'
                                }}
                            />
                        </div>

                        {/* Character Container - Matches PetRoom.tsx positioning */}
                        <div
                            className="character-container"
                            style={{
                                left: '50%', // Centered horizontally
                                bottom: '20%', // Standard floor position roughly
                                transform: 'translate(-50%, 50%)', // Matches PetRoom.tsx transform
                                position: 'absolute',
                                zIndex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <JelloAvatar
                                character={tempCharacter}
                                mood="happy" // Default snapshot mood
                                action="idle" // Default action
                                size="small" // PetRoom uses "small" usually for normal view?
                            // Wait, lines 939 of PetRoom.tsx says size="small".
                            // I previously used "large". Let's use "medium" as compromise or "small" if we want exact match.
                            // But "small" might be too small for a static card.
                            // Let's check PetRoom usage: size="small".
                            />
                        </div>
                    </div>
                </div>
                {/* Footer Text & CTA */}
                <div style={{ textAlign: 'center', width: '100%', marginTop: '5px' }}>
                    <p style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '5px',
                        lineHeight: '1.4'
                    }}>
                        {t('share.invite.title', 'Check out my Jello!')}
                    </p>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '15px'
                    }}>
                        {t('share.invite.desc', 'Join Puzzleletic to raise your own pet!')}
                    </p>

                    <button
                        className="action-btn"
                        style={{
                            width: '100%',
                            height: '60px',
                            justifyContent: 'center',
                            background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
                            color: 'white',
                            border: '3px solid #1b5e20',
                            borderRadius: '12px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 0 #1b5e20, 0 6px 10px rgba(0, 0, 0, 0.2)'
                        }}
                        onClick={handleStartGame}
                    >
                        {t('share.cta', 'Play Now!')}
                    </button>

                    <button
                        style={{
                            marginTop: '12px',
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                        onClick={() => navigate('/')}
                    >
                        {t('common.goHome', 'Go to Home')}
                    </button>
                </div>
            </div>
        </div>
    );
};
