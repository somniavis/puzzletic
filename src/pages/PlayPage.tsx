import React, { useEffect, Suspense, useMemo } from 'react';
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
import { usePremiumStatus, isPremiumGame } from '../utils/premiumLogic';
import { PremiumPurchaseModal } from '../components/Premium/PremiumPurchaseModal';
import { SettingsMenu } from '../components/SettingsMenu/SettingsMenu';

// Components
import { AdventureCard } from '../components/PlayPage/AdventureCard';
import { DrillItem } from '../components/PlayPage/DrillItem';
import { GeniusDashboard } from '../components/PlayPage/GeniusDashboard';
import { GameErrorBoundary } from '../components/Game/GameErrorBoundary';

const PlayPage: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { t } = useTranslation();
    const { setGameDifficulty, pauseTick, resumeTick, gameScores, categoryProgress, totalGameStars, lastPlayedGameId, setLastPlayedGameId } = useNurturing();

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

    const { isPremium } = usePremiumStatus();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = React.useState(false);
    const [activeAdventureLevel, setActiveAdventureLevel] = React.useState<number>(1);
    const hubContentRef = React.useRef<HTMLDivElement | null>(null);

    const activeGame = gameId ? getGameById(gameId) : null;
    const mathAdventureLevelGroups = useMemo(() => {
        return [1, 2, 3]
            .map((level) => ({
                level,
                games: adventureGames.filter((game) => game.level === level),
            }))
            .filter((group) => group.games.length > 0);
    }, [adventureGames]);
    const mathAdventureLevelSignature = useMemo(
        () => mathAdventureLevelGroups.map((group) => `${group.level}:${group.games.length}`).join('|'),
        [mathAdventureLevelGroups]
    );

    // -- Effects --
    useEffect(() => {
        pauseTick();
        return () => resumeTick();
    }, [pauseTick, resumeTick]);

    // Auto-scroll to last played game on mount or tab change
    useEffect(() => {
        // Only scroll if we are in List View (no active gameId) and have a last played game
        if (!gameId && lastPlayedGameId) {
            // Small delay to ensure rendering
            const timeoutId = window.setTimeout(() => {
                const element = document.getElementById(`game-card-${lastPlayedGameId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }, 100);

            return () => window.clearTimeout(timeoutId);
        }
    }, [lastPlayedGameId, activeTab, mathMode, gameId]); // Added gameId to trigger when returning from game

    // Sync math mode switcher background with current adventure level section while scrolling.
    useEffect(() => {
        if (activeTab !== 'math' || mathMode !== 'adventure') return;

        const container = hubContentRef.current;
        if (!container) return;
        if (!mathAdventureLevelGroups.length) return;
        const switcher = document.querySelector<HTMLElement>('.mode-switcher-container');
        if (!switcher) return;

        const headerNodes = Array.from(
            container.querySelectorAll<HTMLElement>('.funmath-level-header')
        );
        if (!headerNodes.length) return;
        const headerAnchors = headerNodes
            .map((header) => {
                const section = header.closest<HTMLElement>('.funmath-level-section[data-level]');
                return {
                    level: Number(section?.dataset.level),
                    header,
                };
            })
            .filter((item) => item.level >= 1 && item.level <= 3)
            .sort((a, b) => a.level - b.level);
        if (!headerAnchors.length) return;

        const syncLevelFromScroll = () => {
            const switcherBottom = switcher.getBoundingClientRect().bottom;
            let level = headerAnchors[0].level;
            for (const item of headerAnchors) {
                // Switch background when the "Fun Math" header reaches the switcher's baseline.
                if (item.header.getBoundingClientRect().top <= switcherBottom) level = item.level;
                else break;
            }

            if (level >= 1 && level <= 3) {
                setActiveAdventureLevel((prev) => (prev === level ? prev : level));
            }
        };

        syncLevelFromScroll();

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                syncLevelFromScroll();
                ticking = false;
            });
        };

        const onResize = () => syncLevelFromScroll();

        container.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);

        return () => {
            container.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, [activeTab, mathMode, mathAdventureLevelSignature]);

    // -- Handlers --
    const onTabSelect = (category: GameCategory) => {
        playButtonSound();
        if (category === 'science') {
            setIsSettingsMenuOpen(true);
            return;
        }
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

    const handlePlayClick = (game: GameManifest, isLocked: boolean, _reason?: string) => {
        // 1. Check Premium Lock
        const premiumLocked = !isPremium && isPremiumGame(game);
        if (premiumLocked) {
            playButtonSound();
            setIsPremiumModalOpen(true);
            return;
        }

        if (isLocked) {
            return;
        }
        playButtonSound();
        setGameDifficulty(game.level);
        setLastPlayedGameId(game.id); // Save as last played
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
                <h1 className="brand-title">{t('play.title')}</h1>
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
            {(['math', 'brain', 'sw', 'science'] as GameCategory[]).map(cat => (
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
        <div
            className={`mode-switcher-container ${mathMode === 'adventure' ? `switch-bg-level-${activeAdventureLevel}` : ''}`}
        >
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

    const renderMathAdventureByLevel = () => {
        if (mathAdventureLevelGroups.length === 0) {
            return <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>🚧 {t('play.game.noGames')} 🚧</div>;
        }

        return (
            <div className="funmath-level-groups">
                {mathAdventureLevelGroups.map(({ level, games }, index) => {
                    const nextLevel = mathAdventureLevelGroups[index + 1]?.level;
                    return (
                    <React.Fragment key={level}>
                        <section className={`funmath-level-section level-${level}`} data-level={level}>
                            <div className="funmath-level-header">
                                <p className="funmath-level-eyebrow">{t('play.sections.funMath.title')}</p>
                                <h3 className="funmath-level-title">{t('play.controls.level')} {level}</h3>
                            </div>
                            <div className="game-list">
                                {games.map(game => {
                                    const scoreValue = gameScores?.[game.id];
                                    const { clearCount } = parseGameScore(scoreValue);
                                    const { unlocked, reason, requiredGame } = isGameUnlocked(game.id, GAMES, { gameScores, categoryProgress });

                                    let displayReason = reason;
                                    if (requiredGame) {
                                        const requiredGameTitle = requiredGame.titleKey ? t(requiredGame.titleKey) : requiredGame.title;
                                        displayReason = t('play.game.unlock.reason', { game: requiredGameTitle });
                                    }

                                    const isMastered = clearCount >= ADVENTURE_UNLOCK_THRESHOLD;

                                    return (
                                        <AdventureCard
                                            key={game.id}
                                            id={`game-card-${game.id}`}
                                            game={game}
                                            unlocked={unlocked}
                                            displayReason={displayReason}
                                            clearCount={clearCount}
                                            isMastered={isMastered}
                                            onPlay={handlePlayClick}
                                            isPremiumLocked={!isPremium && isPremiumGame(game)}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                        {index < mathAdventureLevelGroups.length - 1 && (
                            <div
                                className={`funmath-level-transition from-${level} to-${nextLevel}`}
                                data-to-level={nextLevel}
                                aria-hidden="true"
                            />
                        )}
                    </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const renderAdventureSection = () => (
        <div className="section-container">
            {activeTab === 'math' ? renderMathAdventureByLevel() : (
                <>
                    <div className="section-header">
                        <h2 className="section-title">{t(`play.categories.${activeTab}`)}</h2>
                        <p className="section-desc">{t('play.sections.training.desc')}</p>
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

                            const isMastered = clearCount >= ADVENTURE_UNLOCK_THRESHOLD;

                            return (
                                <AdventureCard
                                    key={game.id}
                                    id={`game-card-${game.id}`}
                                    game={game}
                                    unlocked={unlocked}
                                    displayReason={displayReason}
                                    clearCount={clearCount}
                                    isMastered={isMastered}
                                    onPlay={handlePlayClick}
                                    isPremiumLocked={!isPremium && isPremiumGame(game)}
                                />
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>🚧 {t('play.game.noGames')} 🚧</div>
                    )}
                </div>
                </>
            )}
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
                                id={`game-card-${game.id}`}
                                game={game}
                                unlocked={unlocked}
                                clearCount={clearCount}
                                isMastered={isMastered}
                                reason={reason}
                                onPlay={handlePlayClick}
                                isPremiumLocked={!isPremium && isPremiumGame(game)}
                            />
                        );
                    })
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        {t('play.game.noGames')}
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

            <div
                ref={hubContentRef}
                className={`hub-content ${activeTab === 'math' && mathMode === 'adventure' ? 'hub-content-math-adventure' : ''}`}
            >
                {activeTab === 'math' ? (
                    mathMode === 'adventure' ? renderAdventureSection() : renderGeniusSection()
                ) : (
                    // Other tabs reuse the adventure/category layout logic
                    renderAdventureSection()
                )}
            </div>

            {renderBottomNav()}

            <PremiumPurchaseModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />

            <SettingsMenu
                isOpen={isSettingsMenuOpen}
                onClose={() => setIsSettingsMenuOpen(false)}
            />
        </div>
    );
};

export { PlayPage };
