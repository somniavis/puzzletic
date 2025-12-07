import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PlayPage.css';
import { playButtonSound } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';
import { GAMES } from '../games/registry';
import type { GameCategory, GameDifficulty, GameManifest } from '../games/types';
import numberMatchEn from '../games/math/level1/001_NumberMatch/locales/en';
import roundCountingEn from '../games/math/level1/002_RoundCounting/locales/en';

const CATEGORY_ICONS: Record<GameCategory, string> = {
    math: '🔢',
    science: '🧪',
    sw: '💻'
};

import { useSound } from '../contexts/SoundContext';

interface PlayPageProps {
    onNavigate: (page: 'home') => void;
}

export const PlayPage: React.FC<PlayPageProps> = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { setGameDifficulty } = useNurturing();
    const { settings, toggleBgm } = useSound(); // Use global sound context for BGM sync
    const [selectedCategory, setSelectedCategory] = useState<GameCategory>('math');
    const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(1);
    const [isControlsOpen, setIsControlsOpen] = useState(true);
    const [activeGame, setActiveGame] = useState<GameManifest | null>(null);

    // Set Game Difficulty when entering Play Page or changing difficulty, unset when leaving
    useEffect(() => {
        setGameDifficulty(selectedDifficulty);
        return () => {
            setGameDifficulty(null);
        };
    }, [setGameDifficulty, selectedDifficulty]);

    // Preload Game Translations ensure titles look correct immediately
    useEffect(() => {
        // Number Match
        i18n.addResourceBundle('en', 'translation', { games: { 'math-01': numberMatchEn } }, true, true);

        // Round Counting
        i18n.addResourceBundle('en', 'translation', { games: { 'math-01-round-counting': roundCountingEn } }, true, true);
    }, [i18n]);

    const filteredGames = GAMES.filter(
        game => game.category === selectedCategory && game.level === selectedDifficulty
    );

    const handleHomeClick = () => {
        playButtonSound();
        onNavigate('home');
    };

    const handleToggleControls = () => {
        playButtonSound();
        setIsControlsOpen(!isControlsOpen);
    };

    const handleCategorySelect = (cat: GameCategory) => {
        playButtonSound();
        setSelectedCategory(cat);
    };

    const handleDifficultySelect = (level: GameDifficulty) => {
        playButtonSound();
        setSelectedDifficulty(level);
    };

    const handlePlayClick = (game: GameManifest) => {
        playButtonSound();
        setActiveGame(game);
    };

    const handleExitGame = () => {
        playButtonSound();
        setActiveGame(null);
    };

    // If a game is active, render it full screen
    if (activeGame) {
        const GameComponent = activeGame.component;
        return (
            <div className="game-wrapper">
                <GameComponent onExit={handleExitGame} />
            </div>
        );
    }

    return (
        <div className="play-page">
            <header className="play-header">
                <h1>🎮 {t('play.title')}</h1>
                <div className="header-actions" style={{ display: 'flex', gap: '0.5rem' }}>

                    <button className="nav-btn" onClick={handleHomeClick}>
                        🏠 {t('play.home')}
                    </button>
                </div>
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
                                    {(['math', 'science', 'sw'] as GameCategory[]).map(cat => (
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
                                            className={`difficulty-btn ${selectedDifficulty === (level as GameDifficulty) ? 'active' : ''}`}
                                            onClick={() => handleDifficultySelect(level as GameDifficulty)}
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
                            <div key={game.id} className="game-card" onClick={() => handlePlayClick(game)}>
                                <div className="game-thumbnail">
                                    {/* Placeholder for thumbnail logic - prefer image, fallback to emoji */}
                                    {game.thumbnail && !game.thumbnail.startsWith('http') ? (
                                        <span style={{ fontSize: '2.5rem' }}>{game.thumbnail}</span>
                                    ) : (
                                        <span>{CATEGORY_ICONS[game.category]}</span>
                                    )}
                                </div>
                                <div className="game-title-group">
                                    <h3>{game.titleKey ? t(game.titleKey) : game.title}</h3>
                                    {(game.subtitleKey || game.subtitle) && (
                                        <div className="game-subtitle">
                                            {game.subtitleKey ? t(game.subtitleKey) : game.subtitle}
                                        </div>
                                    )}
                                </div>
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

