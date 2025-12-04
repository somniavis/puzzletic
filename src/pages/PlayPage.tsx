import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PlayPage.css';
import { playButtonSound } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';

type Category = 'math' | 'science' | 'sw';
type Difficulty = 1 | 2 | 3 | 4 | 5;

interface Game {
    id: string;
    title: string;
    category: Category;
    difficulty: Difficulty;
    thumbnail?: string;
}

// Placeholder data - will be replaced with dynamic loading later
const GAMES: Game[] = [
    { id: 'math-1-1', title: 'Number Match', category: 'math', difficulty: 1 },
    { id: 'math-1-2', title: 'Simple Addition', category: 'math', difficulty: 1 },
    { id: 'science-1-1', title: 'Animal Sounds', category: 'science', difficulty: 1 },
];

const CATEGORY_ICONS: Record<Category, string> = {
    math: '🔢',
    science: '🧪',
    sw: '💻'
};

interface PlayPageProps {
    onNavigate: (page: 'home') => void;
}

export const PlayPage: React.FC<PlayPageProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const { setGameDifficulty } = useNurturing();
    const [selectedCategory, setSelectedCategory] = useState<Category>('math');
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(1);
    const [isControlsOpen, setIsControlsOpen] = useState(true);

    // Set Game Difficulty when entering Play Page or changing difficulty, unset when leaving
    useEffect(() => {
        setGameDifficulty(selectedDifficulty);
        return () => {
            setGameDifficulty(null);
        };
    }, [setGameDifficulty, selectedDifficulty]);

    const filteredGames = GAMES.filter(
        game => game.category === selectedCategory && game.difficulty === selectedDifficulty
    );

    const handleHomeClick = () => {
        playButtonSound();
        onNavigate('home');
    };

    const handleToggleControls = () => {
        playButtonSound();
        setIsControlsOpen(!isControlsOpen);
    };

    const handleCategorySelect = (cat: Category) => {
        playButtonSound();
        setSelectedCategory(cat);
    };

    const handleDifficultySelect = (level: Difficulty) => {
        playButtonSound();
        setSelectedDifficulty(level);
    };

    const handlePlayClick = () => {
        playButtonSound();
        // Game launch logic will go here
    };

    return (
        <div className="play-page">
            <header className="play-header">
                <h1>🎮 {t('play.title')}</h1>
                <button className="nav-btn" onClick={handleHomeClick}>
                    🏠 {t('play.home')}
                </button>
            </header>

            <div className="play-content">
                <div className={`play-controls ${isControlsOpen ? 'open' : 'closed'}`}>
                    <div className="controls-header" onClick={handleToggleControls}>
                        <h3>{t('play.controls.title')}</h3>
                        <button
                            className="toggle-controls-btn"
                            title={isControlsOpen ? t('play.controls.collapse') : t('play.controls.expand')}
                        >
                            {isControlsOpen ? '🔼' : '🔽'}
                        </button>
                    </div>

                    {isControlsOpen && (
                        <div className="controls-body">
                            <div className="control-group">
                                <div className="category-selector">
                                    {(['math', 'science', 'sw'] as Category[]).map(cat => (
                                        <button
                                            key={cat}
                                            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => handleCategorySelect(cat)}
                                        >
                                            <span>{CATEGORY_ICONS[cat]}</span>
                                            {t(`play.categories.${cat}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="control-group">
                                <h4>{t('play.controls.level')}</h4>
                                <div className="difficulty-selector">
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <button
                                            key={level}
                                            className={`difficulty-btn ${selectedDifficulty === level ? 'active' : ''}`}
                                            onClick={() => handleDifficultySelect(level as Difficulty)}
                                        >
                                            ⭐ {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="game-grid">
                    {filteredGames.length > 0 ? (
                        filteredGames.map(game => (
                            <div key={game.id} className="game-card" onClick={handlePlayClick}>
                                <div className="game-thumbnail">
                                    {/* Placeholder for thumbnail */}
                                    <span>{CATEGORY_ICONS[game.category]}</span>
                                </div>
                                <h3>{game.title}</h3>
                                <button className="play-btn">▶</button>
                            </div>
                        ))
                    ) : (
                        <div className="no-games">
                            <p>🚧 {t('play.game.noGames')} 🚧</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
