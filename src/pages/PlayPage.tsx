import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import './PlayPage.css';
import { playButtonSound } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';
import { GAMES, getGameById } from '../games/registry';
import type { GameCategory, GameManifest } from '../games/types';
import { isGameUnlocked } from '../utils/progression';

// --- Types & Constants ---
type MathMode = 'adventure' | 'genius';
type Operator = 'ADD' | 'SUB' | 'MUL' | 'DIV';

const CATEGORY_ICONS: Record<GameCategory, string> = {
    math: 'fa-calculator',
    brain: 'fa-brain',
    science: 'fa-flask',
    sw: 'fa-code'
};

// Emoji-based icon background colors
const getIconBackground = (thumbnail: string | React.ReactNode | undefined, isLocked: boolean): string => {
    if (isLocked) return '#f1f5f9'; // slate-100 for locked

    if (typeof thumbnail !== 'string') return '#eef2ff';

    // Map emoji to pastel background colors
    const emojiColorMap: Record<string, string> = {
        // Math games
        '🐟': '#e0f2fe', // sky-100
        '🌀': '#e0f2fe', // sky-100 (Round Counting)
        '🐝': '#fef3c7', // amber-100
        '⚖️': '#dbeafe', // blue-100
        '🍎': '#ffe4e6', // rose-100
        '🏹': '#d1fae5', // emerald-100
        '🧱': '#fed7aa', // orange-200
        '🍭': '#ddd6fe', // violet-200
        '🤿': '#cffafe', // cyan-100
        '🍕': '#fecaca', // red-200
        '🛸': '#e9d5ff', // purple-200
        '🚀': '#bfdbfe', // blue-200
        // Brain games
        '🔗': '#fce7f3', // pink-100
        '👯': '#f3e8ff', // purple-100
        '🧩': '#d1fae5', // emerald-100
        '🐒': '#fef9c3', // yellow-100
        '🍽️': '#fef3c7', // amber-100
        '🔍': '#dbeafe', // blue-100
        '📡': '#ccfbf1', // teal-100
    };

    // Find matching emoji
    for (const [emoji, color] of Object.entries(emojiColorMap)) {
        if (thumbnail.includes(emoji)) return color;
    }

    return '#eef2ff'; // default indigo-50
};

const PlayPage: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { t } = useTranslation();
    const { setGameDifficulty, pauseTick, resumeTick, minigameStats, categoryProgress } = useNurturing();

    // -- State --
    const [activeTab, setActiveTab] = useState<GameCategory>(() => {
        return (sessionStorage.getItem('play_tab') as GameCategory) || 'math';
    });

    const [mathMode, setMathMode] = useState<MathMode>(() => {
        return (sessionStorage.getItem('play_math_mode') as MathMode) || 'adventure';
    });

    const [selectedOp, setSelectedOp] = useState<Operator>('ADD');

    const activeGame = gameId ? getGameById(gameId) : null;

    // -- Effects --
    useEffect(() => {
        pauseTick();
        return () => resumeTick();
    }, [pauseTick, resumeTick]);

    // -- Handlers --
    const handleTabSelect = (category: GameCategory) => {
        playButtonSound();
        setActiveTab(category);
        sessionStorage.setItem('play_tab', category);
    };

    const handleMathModeSelect = (mode: MathMode) => {
        playButtonSound();
        setMathMode(mode);
        sessionStorage.setItem('play_math_mode', mode);
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

    // -- Data Filtering --
    const adventureGames = useMemo(() => {
        return GAMES.filter(g => g.category === activeTab && g.mode !== 'genius')
            .sort((a, b) => a.level - b.level);
    }, [activeTab]);

    const drillGames = useMemo(() => {
        if (activeTab !== 'math') return [];
        return GAMES.filter(g => g.category === 'math' && g.mode === 'genius');
    }, [activeTab]);

    const filteredDrills = useMemo(() => {
        if (selectedOp === 'ADD') return drillGames.filter(g => g.id.includes('front-addition'));
        if (selectedOp === 'SUB') return drillGames.filter(g => g.id.includes('front-subtraction'));
        return [];
    }, [drillGames, selectedOp]);

    // Drill Stats
    const drillStats = useMemo(() => {
        const total = filteredDrills.length;
        const completed = filteredDrills.filter(g => {
            const stats = minigameStats?.[g.id];
            // Simple logic: considered "completed" if played at least once for now, or use mastery logic
            return stats && stats.playCount > 0;
        }).length;
        return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
    }, [filteredDrills, minigameStats]);


    // -- Render Components --

    const renderDifficultyStars = (level: number) => {
        return (
            <div className="difficulty-stars">
                {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`star ${s <= level ? 'filled' : 'empty'}`}>
                        <i className="fas fa-star"></i>
                    </span>
                ))}
            </div>
        );
    };

    const renderHeader = () => (
        <header className="play-header-hub">
            <div className="header-brand">
                <div className="brand-icon"><i className="fas fa-gamepad"></i></div>
                <h1 className="brand-title">Play & Learn</h1>
            </div>
            <button className="header-close-btn" onClick={handleHomeClick}><i className="fas fa-xmark"></i></button>
        </header>
    );

    const renderBottomNav = () => (
        <nav className="bottom-nav-hub">
            {(['math', 'brain', 'science', 'sw'] as GameCategory[]).map(cat => (
                <button
                    key={cat}
                    className={`nav-item-hub ${activeTab === cat ? `active ${cat}` : ''}`}
                    onClick={() => handleTabSelect(cat)}
                >
                    <div className="nav-icon-box">
                        <i className={`fas ${CATEGORY_ICONS[cat]}`}></i>
                    </div>
                    <span className="nav-label-hub">{t(`play.categories.${cat}`)}</span>
                </button>
            ))}
        </nav>
    );

    // -- Main Content Renderers --

    const renderMathModeSwitcher = () => (
        <div className="mode-switcher-container">
            <div className="mode-switcher-pill">
                <button
                    className={`mode-btn ${mathMode === 'adventure' ? 'active' : ''}`}
                    onClick={() => handleMathModeSelect('adventure')}
                >
                    <i className={`fas fa-map-marked-alt ${mathMode === 'adventure' ? '' : 'text-slate-300'}`}></i> {t('play.modes.adventure')}
                </button>
                <button
                    className={`mode-btn ${mathMode === 'genius' ? 'active' : ''}`}
                    onClick={() => handleMathModeSelect('genius')}
                >
                    <i className={`fas fa-bolt ${mathMode === 'genius' ? '' : 'text-slate-300'}`}></i> {t('play.modes.genius')}
                </button>
            </div>
        </div>
    );

    const renderAdventureMode = () => (
        <div className="section-container">
            <div className="section-header">
                <h2 className="section-title">{t('play.sections.funMath.title')}</h2>
                <p className="section-desc">{t('play.sections.funMath.desc')}</p>
            </div>

            <div className="game-list">
                {adventureGames.length > 0 ? (
                    adventureGames.map(game => {
                        const stats = minigameStats?.[game.id];
                        const { unlocked, reason, requiredGame } = isGameUnlocked(game.id, GAMES, { minigameStats, categoryProgress });
                        let displayReason = reason;
                        if (requiredGame) {
                            const requiredGameTitle = requiredGame.titleKey ? t(requiredGame.titleKey) : requiredGame.title;
                            displayReason = t('play.game.unlock.reason', { game: requiredGameTitle });
                        }

                        // Mastery Logic (1 play + 3 challenges = 4 total)
                        const playCount = stats?.playCount || 0;
                        const isMastered = playCount >= 4;

                        let subtitleContent;
                        if (playCount === 0) {
                            // First time: Show original subtitle
                            subtitleContent = (
                                <span className="card-subtitle-text">
                                    {game.subtitleKey ? t(game.subtitleKey) : (game.tags?.[0] || '')}
                                </span>
                            );
                        } else if (!isMastered) {
                            // Challenge Phase: 1-3 plays
                            const current = Math.max(0, playCount - 1);
                            subtitleContent = (
                                <span className="card-mission-text">
                                    {t('games.mission.challenge', { current, total: 3 })}
                                </span>
                            );
                        } else {
                            // Mastered Phase
                            subtitleContent = (
                                <span className="card-subtitle-text">
                                    {game.subtitleKey ? t(game.subtitleKey) : ''}
                                </span>
                            );
                        }

                        // Remove generic progress bar, replacing with Dynamic Subtitle
                        // Add Badge Button next to Play Button

                        return (
                            <div
                                key={game.id}
                                className={`adventure-card ${!unlocked ? 'locked' : ''}`}
                                onClick={() => handlePlayClick(game, !unlocked, displayReason)}
                            >
                                <div className="card-top">
                                    <div className="card-icon-box" style={{ background: getIconBackground(game.thumbnail, !unlocked) }}>
                                        {/* Use emoji or thumbnail */}
                                        {game.thumbnail && typeof game.thumbnail === 'string' && game.thumbnail.startsWith('http') ? (
                                            <img src={game.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                        ) : (
                                            game.thumbnail ? <span>{game.thumbnail}</span> : <i className={`fas ${CATEGORY_ICONS[game.category]}`}></i>
                                        )}
                                    </div>
                                    <div className="card-info">
                                        <div className="card-meta">
                                            <span className="category-badge">
                                                {game.tagsKey ? t(game.tagsKey) : (game.tags?.[0] || game.category.toUpperCase())}
                                            </span>
                                            {renderDifficultyStars(game.level)}
                                        </div>
                                        <h3 className="card-title">{game.titleKey ? t(game.titleKey) : game.title}</h3>

                                        {/* Dynamic Subtitle Area */}
                                        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', minHeight: '1.2em' }}>
                                            {subtitleContent}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button className="play-quest-btn" style={{ flex: 1 }}>
                                        <i className={`fas ${unlocked ? 'fa-play' : 'fa-lock'}`}></i>
                                    </button>

                                    {/* Mastery Badge Button */}
                                    <div className={`badge-box ${isMastered ? 'gold' : 'gray'}`}>
                                        <i className={`fas ${isMastered ? 'fa-medal' : 'fa-medal'}`}></i>
                                    </div>
                                </div>
                                {/* Locked Overlay for visual feedback if needed, but styling handles opacity */}
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>🚧 No games found 🚧</div>
                )}
            </div>
        </div>
    );

    const renderGeniusMode = () => (
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
            <div className="stats-dashboard">
                <div className="stats-glow"></div>
                <div className="stats-content">
                    <div className="stats-label">Drill Progress</div>
                    <div className="stats-value-box">
                        <h3 className="stats-big-num">{drillStats.completed}</h3>
                        <span className="stats-total">/ {drillStats.total} levels</span>
                    </div>
                </div>
                {/* Circular Progress (Simple CSS/SVG) */}
                <div style={{ position: 'relative', width: '4rem', height: '4rem' }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="5" fill="none" />
                        <circle
                            cx="32" cy="32" r="28"
                            stroke="#818cf8" strokeWidth="5" fill="none"
                            strokeDasharray={176}
                            strokeDashoffset={176 - (176 * drillStats.percentage) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '900' }}>
                        {Math.round(drillStats.percentage)}%
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="drill-list-path">
                <div className="path-line"></div>
                {filteredDrills.length > 0 ? (
                    filteredDrills.map((game) => {
                        const stats = minigameStats?.[game.id];
                        const { unlocked, reason } = isGameUnlocked(game.id, GAMES, { minigameStats, categoryProgress });
                        const playCount = stats?.playCount || 0;
                        const isMastered = playCount >= 10;
                        // In Drill mode, we might want custom unlock logic (sequential), but global usage works too.

                        return (
                            <div
                                key={game.id}
                                className={`drill-item ${unlocked ? 'unlocked' : ''}`}
                                onClick={() => handlePlayClick(game, !unlocked, reason)}
                            >
                                <div className="drill-icon">
                                    {isMastered ? (
                                        <span style={{ fontSize: '1.5rem' }}>🏅</span>
                                    ) : (
                                        game.thumbnail && typeof game.thumbnail === 'string' && game.thumbnail.startsWith('http') ? (
                                            <img src={game.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            game.thumbnail || game.level
                                        )
                                    )}
                                </div>
                                <div className="drill-info">
                                    <h4 className="drill-title">
                                        {game.titleKey ? t(game.titleKey) : game.title}
                                    </h4>
                                    <div className="drill-meta">
                                        <span
                                            style={{
                                                fontSize: '0.85rem',
                                                display: 'block',
                                                marginBottom: '0.25rem',
                                                color: '#64748b', // Slate-500
                                                fontStyle: playCount > 0 && !isMastered ? 'italic' : 'normal',
                                                fontWeight: playCount > 0 && !isMastered ? 'bold' : 'normal'
                                            }}
                                        >
                                            {(() => {
                                                if (playCount === 0) return game.subtitleKey ? t(game.subtitleKey, game.subtitle || 'Start Drill') : (game.subtitle || 'Start Drill');
                                                if (!isMastered) return t('games.mission.challenge10', { current: playCount, total: 10, defaultValue: `Challenge! (${playCount}/10)` });
                                                return game.subtitleKey ? t(game.subtitleKey, game.subtitle || 'Mastered') : (game.subtitle || 'Mastered');
                                            })()}
                                        </span>
                                    </div>
                                </div>

                                <div className="drill-action">
                                    {unlocked ? (
                                        <div className="action-btn-mini"><i className="fas fa-play"></i></div>
                                    ) : (
                                        <span style={{ color: '#cbd5e1' }}><i className="fas fa-lock"></i></span>
                                    )}
                                </div>
                            </div>

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

    const renderSimpleCategoryList = () => (
        <div className="section-container">
            <div className="section-header">
                <h2 className="section-title">{t(`play.categories.${activeTab}`)}</h2>
                <p className="section-desc">Training modules</p>
            </div>
            <div className="game-list">
                {adventureGames.length > 0 ? (
                    adventureGames.map(game => {
                        const stats = minigameStats?.[game.id];
                        const { unlocked, reason, requiredGame } = isGameUnlocked(game.id, GAMES, { minigameStats, categoryProgress });
                        let displayReason = reason;
                        if (requiredGame) {
                            const requiredGameTitle = requiredGame.titleKey ? t(requiredGame.titleKey) : requiredGame.title;
                            displayReason = t('play.game.unlock.reason', { game: requiredGameTitle });
                        }
                        // Mastery Logic (same as adventure)
                        const playCount = stats?.playCount || 0;
                        const isMastered = playCount >= 4;

                        let subtitleContent;
                        if (playCount === 0) {
                            subtitleContent = (
                                <span className="card-subtitle-text">
                                    {game.subtitleKey ? t(game.subtitleKey) : (game.tags?.[0] || '')}
                                </span>
                            );
                        } else if (!isMastered) {
                            const current = Math.max(0, playCount - 1);
                            subtitleContent = (
                                <span className="card-mission-text">
                                    {t('games.mission.challenge', { current, total: 3 })}
                                </span>
                            );
                        } else {
                            subtitleContent = (
                                <span className="card-subtitle-text">
                                    {game.subtitleKey ? t(game.subtitleKey) : ''}
                                </span>
                            );
                        }

                        return (
                            <div
                                key={game.id}
                                className={`adventure-card ${!unlocked ? 'locked' : ''}`}
                                onClick={() => handlePlayClick(game, !unlocked, displayReason)}
                            >
                                <div className="card-top">
                                    <div className="card-icon-box" style={{ background: getIconBackground(game.thumbnail, !unlocked) }}>
                                        {game.thumbnail && typeof game.thumbnail === 'string' && game.thumbnail.startsWith('http') ? (
                                            <img src={game.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                        ) : (
                                            game.thumbnail ? <span>{game.thumbnail}</span> : <i className={`fas ${CATEGORY_ICONS[game.category]}`}></i>
                                        )}
                                    </div>
                                    <div className="card-info">
                                        <div className="card-meta">
                                            <span className="category-badge">
                                                {game.tagsKey ? t(game.tagsKey) : (game.tags?.[0] || game.category.toUpperCase())}
                                            </span>
                                            {renderDifficultyStars(game.level)}
                                        </div>
                                        <h3 className="card-title">{game.titleKey ? t(game.titleKey) : game.title}</h3>

                                        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', minHeight: '1.2em' }}>
                                            {subtitleContent}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button className="play-quest-btn" style={{ flex: 1 }}>
                                        <i className={`fas ${unlocked ? 'fa-play' : 'fa-lock'}`}></i>
                                    </button>

                                    <div className={`badge-box ${isMastered ? 'gold' : 'gray'}`}>
                                        <i className={`fas ${isMastered ? 'fa-medal' : 'fa-medal'}`}></i>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>🚧 Coming Soon 🚧</div>
                )}
            </div>
        </div>
    );


    // -- Main Render --
    if (activeGame) {
        const GameComponent = activeGame.component;
        return (
            <div className="game-wrapper">
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
            </div>
        );
    }

    return (
        <div className="play-page-container">
            {renderHeader()}

            {activeTab === 'math' && renderMathModeSwitcher()}

            <div className="hub-content">
                {activeTab === 'math' ? (
                    mathMode === 'adventure' ? renderAdventureMode() : renderGeniusMode()
                ) : (
                    renderSimpleCategoryList()
                )}
            </div>

            {renderBottomNav()}
        </div>
    );
};

export { PlayPage };
