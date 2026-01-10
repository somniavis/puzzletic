import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import './PlayPage.css';
import { playButtonSound } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';
import { GAMES, getGameById } from '../games/registry';
import type { GameCategory, GameDifficulty, GameManifest } from '../games/types';
import fishingCountEn from '../games/math/level1/FishingCount/locales/en';
import roundCountingEn from '../games/math/level1/RoundCounting/locales/en';

const CATEGORY_ICONS: Record<GameCategory, string> = {
    brain: '🧠',
    math: '🔢',
    science: '🧪',
    sw: '💻'
};

interface PlayPageProps { }

export const PlayPage: React.FC<PlayPageProps> = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { t, i18n } = useTranslation();
    const { setGameDifficulty, pauseTick, resumeTick } = useNurturing();

    const [selectedCategory, setSelectedCategory] = useState<GameCategory>(() => {
        return (sessionStorage.getItem('play_category') as GameCategory) || 'math';
    });
    const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(() => {
        const stored = sessionStorage.getItem('play_difficulty');
        return stored ? parseInt(stored, 10) as GameDifficulty : 1;
    });
    const [isControlsOpen, setIsControlsOpen] = useState(true);

    // Derive active game from URL
    const activeGame = gameId ? getGameById(gameId) : null;

    // Set Game Difficulty when entering Play Page or changing difficulty, unset when leaving
    useEffect(() => {
        setGameDifficulty(selectedDifficulty);
        pauseTick(); // Pause the game loop

        return () => {
            setGameDifficulty(null);
            resumeTick(); // Resume the game loop
        };
    }, [setGameDifficulty, selectedDifficulty, pauseTick, resumeTick]);

    // Preload Game Translations ensure titles look correct immediately
    useEffect(() => {
        // fishingCountEn and roundCountingEn are imported but better to rely on central en.ts if possible.
        // However, if we keep this logic, we must use correct keys.
        i18n.addResourceBundle('en', 'translation', { games: { 'math-fishing-count': fishingCountEn } }, true, true);
        i18n.addResourceBundle('en', 'translation', { games: { 'math-round-counting': roundCountingEn } }, true, true);
    }, [i18n]);

    const filteredGames = GAMES.filter(
        game => game.category === selectedCategory && game.level === selectedDifficulty
    );

    const handleHomeClick = () => {
        playButtonSound();
        navigate('/home');
    };

    const handleToggleControls = () => {
        playButtonSound();
        setIsControlsOpen(!isControlsOpen);
    };

    const handleCategorySelect = (cat: GameCategory) => {
        playButtonSound();
        setSelectedCategory(cat);
        sessionStorage.setItem('play_category', cat);
    };

    const handleDifficultySelect = (level: GameDifficulty) => {
        playButtonSound();
        setSelectedDifficulty(level);
        sessionStorage.setItem('play_difficulty', level.toString());
    };

    const handlePlayClick = (game: GameManifest) => {
        playButtonSound();
        navigate(`/play/${game.id}`);
    };

    const handleExitGame = () => {
        navigate('/play');
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

    // ... (rest of the render function remains the same)
    return (
        <div className="play-page">
            <header className="play-header">
                <h1>🎮 {t('play.title')}</h1>
                <div className="header-actions" style={{ display: 'flex', gap: '0.5rem' }}>

                    <button className="close-button" onClick={handleHomeClick} aria-label="Close">
                        ✕
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
                                    {(['math', 'brain'] as GameCategory[]).map(cat => (
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
                                    {game.thumbnail ? (
                                        typeof game.thumbnail === 'string' && game.thumbnail.startsWith('http') ? (
                                            <img src={game.thumbnail} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{
                                                fontSize: '2.5rem',
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {game.thumbnail}
                                            </div>
                                        )
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

