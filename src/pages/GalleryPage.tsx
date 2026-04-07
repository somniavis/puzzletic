import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EvolutionStage } from '../types/character';
import { CharacterAdmin } from './CharacterAdmin';

interface GalleryPageProps {
    onCharacterSelect: (speciesId: string, stage: EvolutionStage) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onCharacterSelect }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="page-nav">
                <button onClick={() => navigate('/admin')}>🧰 Admin</button>
                <button onClick={() => navigate('/admin/stats')}>📊 Stats</button>
            </div>
            <CharacterAdmin onCharacterSelect={onCharacterSelect} />
        </>
    );
};
