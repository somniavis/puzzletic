import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterAdmin } from './CharacterAdmin';

interface GalleryPageProps {
    onCharacterSelect: (speciesId: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onCharacterSelect }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="page-nav">
                <button onClick={() => navigate('/home')}>🏠 Home</button>
                <button onClick={() => navigate('/stats')}>📊 Stats</button>
            </div>
            <CharacterAdmin onCharacterSelect={onCharacterSelect} />
        </>
    );
};
