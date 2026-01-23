import React, { useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import './PlayPage.css';
import { playButtonSound } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';
import { GAMES, getGameById } from '../games/registry';
import type { GameCategory, GameManifest } from '../games/types';
import { isGameUnlocked, parseGameScore, ADVENTURE_UNLOCK_THRESHOLD, GENIUS_UNLOCK_THRESHOLD } from '../utils/progression';

// Hooks & Utils
import { usePlayPageLogic, type Operator } from '../hooks/usePlayPageLogic';
import { CATEGORY_ICONS } from '../utils/playPageUtils';

// Components
import { AdventureCard } from '../components/PlayPage/AdventureCard';
import { DrillItem } from '../components/PlayPage/DrillItem';
import { GeniusDashboard } from '../components/PlayPage/GeniusDashboard';
import { GameErrorBoundary } from '../components/Game/GameErrorBoundary';

const PlayPage: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { t } = useTranslation();
    const { setGameDifficulty, pauseTick, resumeTick, gameScores, categoryProgress, totalGameStars } = useNurturing();

    // -- Custom Hook for State & Logic --
    const {
        activeTab,
        mathMode,
        selectedOp,
        setSelectedOp,
        adventureGames,
        filteredDrills,
        drillStats,
        handleTabSelect,
        handleMathModeSelect
    } = usePlayPageLogic({ gameScores });

    const activeGame = gameId ? getGameById(gameId) : null;

    // -- Effects --
    useEffect(() => {
        pauseTick();
        return () => resumeTick();
    }, [pauseTick, resumeTick]);

    // -- Handlers --
    const onTabSelect = (category: GameCategory) => {
        playButtonSound();
        handleTabSelect(category);
    };

    const onMathModeSelect = (mode: 'adventure' | 'genius') => {
        playButtonSound();
        handleMathModeSelect(mode);
    };

    const handleHomeClick = () => {
        playButtonSound();
        navigate('/home');
    };

    const handlePlayClick = (game: GameManifest, isLocked: boolean, reason?: string) => {
        if (isLocked) {
            console.log('Game Locked:', reason);
            return;
        }
        playButtonSound();
        setGameDifficulty(game.level);
        navigate(`/play/${game.id}`);
    };

    const handleExitGame = () => {
        setGameDifficulty(null);
        navigate('/play');
    };

    // -- Render Helpers --

    const renderHeader = () => (
        <header className="play-header-hub">
            <div className="header-brand">
                <div className="brand-icon"><i className="fas fa-gamepad"></i></div>
                <h1 className="brand-title">Play & Learn</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="star-display" style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', color: '#FFD700', fontSize: '1rem' }}>
                    <span>⭐ {totalGameStars || 0}</span>
                </div>
                <button className="header-close-btn" onClick={handleHomeClick}><i className="fas fa-xmark"></i></button>
            </div>
        </header>
    );

    const renderBottomNav = () => (
        <nav className="bottom-nav-hub">
            {(['math', 'brain', 'science', 'sw'] as GameCategory[]).map(cat => (
                <button
                    key={cat}
                    className={`nav-item-hub ${activeTab === cat ? `active ${cat}` : ''}`}
                    onClick={() => onTabSelect(cat)}
                >
                    <div className="nav-icon-box">
                        <i className={`fas ${CATEGORY_ICONS[cat]}`}></i>
                    </div>
                    <span className="nav-label-hub">{t(`play.categories.${cat}`)}</span>
                </button>
            ))}
        </nav>
    );

    const renderMathModeSwitcher = () => (
        <div className="mode-switcher-container">
            <div className="mode-switcher-pill">
                <button
                    className={`mode-btn ${mathMode === 'adventure' ? 'active' : ''}`}
                    onClick={() => onMathModeSelect('adventure')}
                >
                    <i className={`fas fa-map-marked-alt ${mathMode === 'adventure' ? '' : 'text-slate-300'}`}></i> {t('play.modes.adventure')}
                </button>
                <button
                    className={`mode-btn ${mathMode === 'genius' ? 'active' : ''}`}
                    onClick={() => onMathModeSelect('genius')}
                >
                    <i className={`fas fa-bolt ${mathMode === 'genius' ? '' : 'text-slate-300'}`}></i> {t('play.modes.genius')}
                </button>
            </div>
        </div>
    );

    // -- Sub-Renderers --

    const renderAdventureSection = () => (
        <div className="section-container">
            <div className="section-header">
                <h2 className="section-title">
                    {activeTab === 'math' ? t('play.sections.funMath.title') : t(`play.categories.${activeTab}`)}
                </h2>
                <p className="section-desc">
                    {activeTab === 'math' ? t('play.sections.funMath.desc') : 'Training modules'}
                </p>
            </div>

            <div className="game-list">
                {adventureGames.length > 0 ? (
                    adventureGames.map(game => {
                        const scoreValue = gameScores?.[game.id];
                        const { clearCount } = parseGameScore(scoreValue);
                        const { unlocked, reason, requiredGame } = isGameUnlocked(game.id, GAMES, { gameScores, categoryProgress });

                        let displayReason = reason;
                        if (requiredGame) {
                            const requiredGameTitle = requiredGame.titleKey ? t(requiredGame.titleKey) : requiredGame.title;
                            displayReason = t('play.game.unlock.reason', { game: requiredGameTitle });
                        }

                        const isMastered = clearCount >= ADVENTURE_UNLOCK_THRESHOLD; // Adventure mastery threshold

                        return (
                            <AdventureCard
                                key={game.id}
                                game={game}
                                unlocked={unlocked}
                                displayReason={displayReason}
                                clearCount={clearCount}
                                isMastered={isMastered}
                                onPlay={handlePlayClick}
                            />
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>🚧 Coming Soon 🚧</div>
                )}
            </div>
        </div>
    );

    const renderGeniusSection = () => (
        <div className="section-container">
            <div className="section-header">
                <h2 className="section-title">{t('play.sections.genius.title')}</h2>
                <p className="section-desc">{t('play.sections.genius.desc')}</p>
            </div>

            {/* Tabs */}
            <div className="operator-tabs">
                {(['ADD', 'SUB', 'MUL', 'DIV'] as Operator[]).map(op => (
                    <button
                        key={op}
                        className={`op-tab ${selectedOp === op ? 'active' : ''}`}
                        onClick={() => setSelectedOp(op)}
                    >
                        {op === 'ADD' ? '+' : op === 'SUB' ? '−' : op === 'MUL' ? '×' : '÷'}
                    </button>
                ))}
            </div>

            {/* Dashboard */}
            <GeniusDashboard
                completedCount={drillStats.completed}
                totalCount={drillStats.total}
                percentage={drillStats.percentage}
            />

            {/* List */}
            <div className="drill-list-path">
                <div className="path-line"></div>
                {filteredDrills.length > 0 ? (
                    filteredDrills.map((game) => {
                        const scoreValue = gameScores?.[game.id];
                        const { clearCount } = parseGameScore(scoreValue);
                        const { unlocked, reason } = isGameUnlocked(game.id, GAMES, { gameScores, categoryProgress });
                        const isMastered = clearCount >= GENIUS_UNLOCK_THRESHOLD; // Drill mastery threshold

                        return (
                            <DrillItem
                                key={game.id}
                                game={game}
                                unlocked={unlocked}
                                clearCount={clearCount}
                                isMastered={isMastered}
                                reason={reason}
                                onPlay={handlePlayClick}
                            />
                        );
                    })
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        Coming Soon...<br /><span style={{ fontSize: '0.8rem' }}>No drills available for this operator yet.</span>
                    </div>
                )}
            </div >
        </div >
    );

    // -- Main Render --
    if (activeGame) {
        const GameComponent = activeGame.component;
        return (
            <div className="game-wrapper">
                <GameErrorBoundary>
                    <Suspense fallback={
                        <div className="loading-overlay">
                            <div className="loading-spinner-container">
                                <div className="loading-spinner">🐾</div>
                                <div className="loading-text">{t('common.loading')}</div>
                            </div>
                        </div>
                    }>
                        <GameComponent onExit={handleExitGame} gameId={activeGame.id} />
                    </Suspense>
                </GameErrorBoundary>
            </div>
        );
    }

    return (
        <div className="play-page-container">
            {renderHeader()}

            {activeTab === 'math' && renderMathModeSwitcher()}

            <div className="hub-content">
                {activeTab === 'math' ? (
                    mathMode === 'adventure' ? renderAdventureSection() : renderGeniusSection()
                ) : (
                    // Other tabs reuse the adventure/category layout logic
                    renderAdventureSection()
                )}
            </div>

            {renderBottomNav()}
        </div>
    );
};

export { PlayPage };
