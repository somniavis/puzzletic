import React, { useEffect, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import './PlayPage.css';
import { playButtonSound } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';
import { GAMES, getGameById } from '../games/registry';
import type { GameCategory, GameManifest } from '../games/types';
import { isGameUnlocked, parseGameScore, ADVENTURE_UNLOCK_THRESHOLD, GENIUS_UNLOCK_THRESHOLD } from '../utils/progression';
import { useAuth } from '../contexts/AuthContext';
import { createCharacter } from '../data/characters';
import type { EvolutionStage } from '../types/character';

// Hooks & Utils
import { usePlayPageLogic, type Operator } from '../hooks/usePlayPageLogic';
import { usePlayUiPreferences } from '../hooks/usePlayUiPreferences';
import { CATEGORY_ICONS } from '../utils/playPageUtils';
import { usePremiumStatus, isPremiumGame } from '../utils/premiumLogic';
import { PremiumPurchaseModal } from '../components/Premium/PremiumPurchaseModal';
import { SettingsMenu } from '../components/SettingsMenu/SettingsMenu';

// Components
import { AdventureCard } from '../components/PlayPage/AdventureCard';
import { DrillItem } from '../components/PlayPage/DrillItem';
import { GeniusDashboard } from '../components/PlayPage/GeniusDashboard';
import { PlayAdventureBoard, type PlayAdventureBoardGame } from '../components/PlayPage/PlayAdventureBoard';
import { PlayGameInfoModal } from '../components/PlayPage/PlayGameInfoModal';
import { GameErrorBoundary } from '../components/Game/GameErrorBoundary';
import { buildBoardLayout } from '../components/PlayPage/playAdventureBoardLayout';

type BoardPositionTab = 'math' | 'brain' | 'sw';
type StoredBoardTilePosition = {
    level: number;
    x: number;
    y: number;
};

const getPlayBoardPositionStorageKey = (scopeId: string, tab: BoardPositionTab) =>
    `play_board_position:${scopeId}:${tab}`;

const loadStoredBoardTilePosition = (scopeId: string | undefined, tab: BoardPositionTab) => {
    if (!scopeId) return null;

    try {
        const raw = window.localStorage.getItem(getPlayBoardPositionStorageKey(scopeId, tab));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredBoardTilePosition>;
        if (
            typeof parsed.level !== 'number'
            || typeof parsed.x !== 'number'
            || typeof parsed.y !== 'number'
        ) {
            return null;
        }

        return {
            level: parsed.level,
            x: parsed.x,
            y: parsed.y,
        };
    } catch {
        return null;
    }
};

const saveStoredBoardTilePosition = (
    scopeId: string | undefined,
    tab: BoardPositionTab,
    position: StoredBoardTilePosition
) => {
    if (!scopeId) return;

    window.localStorage.setItem(
        getPlayBoardPositionStorageKey(scopeId, tab),
        JSON.stringify(position)
    );
};

const clearStoredBoardTilePosition = (scopeId: string | undefined, tab: BoardPositionTab) => {
    if (!scopeId) return;
    window.localStorage.removeItem(getPlayBoardPositionStorageKey(scopeId, tab));
};

const getBoardStartPosition = (levelGroups: Array<{ level: number; games: PlayAdventureBoardGame[] }>) => {
    const firstLevel = levelGroups.find((group) => group.level === 1) ?? levelGroups[0];
    if (!firstLevel) return null;

    const layout = buildBoardLayout(firstLevel.level, firstLevel.games.length);
    const startSlot = layout.padSlots[0];
    if (!startSlot) return null;

    return {
        level: firstLevel.level,
        x: startSlot.x,
        y: startSlot.y,
    } satisfies StoredBoardTilePosition;
};

const scrollContainerToCenteredElement = (container: HTMLElement, target: HTMLElement) => {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = container.scrollTop
        + (targetRect.top - containerRect.top)
        - ((container.clientHeight - targetRect.height) / 2);

    container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'auto',
    });
};

const PlayPage: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { t } = useTranslation();
    const { user, guestId } = useAuth();
    const {
        setGameDifficulty,
        gameScores,
        categoryProgress,
        totalGameStars,
        lastPlayedGameId,
        setLastPlayedGameId,
        hasCharacter,
        speciesId,
        evolutionStage,
        characterName,
    } = useNurturing();
    const playUiScopeId = user?.uid || guestId || undefined;
    const {
        playLearnMode,
        setPlayLearnMode,
        activeTab,
        mathMode,
        selectedOp,
        setSelectedOp,
        setActiveTab,
        setMathMode,
    } = usePlayUiPreferences(playUiScopeId);

    // -- Custom Hook for State & Logic --
    const {
        adventureGames,
        filteredDrills,
        drillStats,
        handleTabSelect,
        handleMathModeSelect
    } = usePlayPageLogic({
        gameScores,
        activeTab,
        mathMode,
        selectedOp,
        onActiveTabChange: setActiveTab,
        onMathModeChange: setMathMode,
        onSelectedOpChange: setSelectedOp,
    });

    const { isPremium } = usePremiumStatus();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = React.useState(false);
    const [activeAdventureLevel, setActiveAdventureLevel] = React.useState<number>(1);
    const [selectedPlayBoardGameId, setSelectedPlayBoardGameId] = React.useState<string | null>(null);
    const [currentBoardGameId, setCurrentBoardGameId] = React.useState<string | null>(null);
    const [currentBoardTilePosition, setCurrentBoardTilePosition] = React.useState<{ level: number; x: number; y: number } | null>(null);
    const hubContentRef = React.useRef<HTMLDivElement | null>(null);
    const isPlayAdventureMode = playLearnMode === 'play'
        && ((activeTab === 'math' && mathMode === 'adventure') || activeTab === 'brain');

    const activeGame = gameId ? getGameById(gameId) : null;
    const adventureGameStates = useMemo<PlayAdventureBoardGame[]>(() => {
        return adventureGames.map((game) => {
            const scoreValue = gameScores?.[game.id];
            const { clearCount } = parseGameScore(scoreValue);
            const { unlocked, reason, requiredGame } = isGameUnlocked(game.id, GAMES, { gameScores, categoryProgress });
            let displayReason = reason;
            if (requiredGame) {
                const requiredGameTitle = requiredGame.titleKey ? t(requiredGame.titleKey) : requiredGame.title;
                displayReason = t('play.game.unlock.reason', { game: requiredGameTitle });
            }

            return {
                game,
                unlocked,
                isPremiumLocked: !isPremium && isPremiumGame(game),
                displayReason,
                clearCount,
                isMastered: clearCount >= ADVENTURE_UNLOCK_THRESHOLD,
            };
        });
    }, [adventureGames, gameScores, categoryProgress, isPremium, t]);

    const mathAdventureLevelGroups = useMemo(() => {
        return [1, 2, 3]
            .map((level) => ({
                level,
                games: adventureGameStates.filter(({ game }) => game.level === level),
            }))
            .filter((group) => group.games.length > 0);
    }, [adventureGameStates]);
    const brainAdventureLevelGroups = useMemo(() => {
        if (activeTab !== 'brain') return [];
        return [1, 2, 3]
            .map((level) => ({
                level,
                games: adventureGameStates.filter(({ game }) => game.level === level),
            }))
            .filter((group) => group.games.length > 0);
    }, [activeTab, adventureGameStates]);
    const mathAdventureLevelSignature = useMemo(
        () => mathAdventureLevelGroups.map((group) => `${group.level}:${group.games.length}`).join('|'),
        [mathAdventureLevelGroups]
    );
    const brainAdventureLevelSignature = useMemo(
        () => brainAdventureLevelGroups.map((group) => `${group.level}:${group.games.length}`).join('|'),
        [brainAdventureLevelGroups]
    );
    const adventureGameStateMap = useMemo(
        () => new Map(adventureGameStates.map((state) => [state.game.id, state])),
        [adventureGameStates]
    );
    const currentBoardStorageScope = useMemo<BoardPositionTab | null>(() => {
        if (activeTab === 'brain') return 'brain';
        if (activeTab === 'math' && mathMode === 'adventure') return 'math';
        if (activeTab === 'sw') return 'sw';
        return null;
    }, [activeTab, mathMode]);
    const activeBoardLevelGroups = useMemo(
        () => {
            if (currentBoardStorageScope === 'brain') return brainAdventureLevelGroups;
            if (currentBoardStorageScope === 'math') return mathAdventureLevelGroups;
            return [];
        },
        [brainAdventureLevelGroups, currentBoardStorageScope, mathAdventureLevelGroups]
    );
    const boardGamePositionMap = useMemo(() => {
        const nextMap = new Map<string, StoredBoardTilePosition>();

        activeBoardLevelGroups.forEach(({ level, games }) => {
            const layout = buildBoardLayout(level, games.length);
            const offset = layout.hasStartPad ? 1 : 0;

            games.forEach((boardGame, index) => {
                const slot = layout.padSlots[index + offset];
                if (!slot) return;
                nextMap.set(boardGame.game.id, { level, x: slot.x, y: slot.y });
            });
        });

        return nextMap;
    }, [activeBoardLevelGroups]);
    const isValidBoardPosition = React.useCallback((position: StoredBoardTilePosition, board: BoardPositionTab) => {
        const levelGroups = board === 'brain'
            ? brainAdventureLevelGroups
            : board === 'math'
                ? mathAdventureLevelGroups
                : [];
        const targetLevel = levelGroups.find((group) => group.level === position.level);
        if (!targetLevel) return false;

        const layout = buildBoardLayout(position.level, targetLevel.games.length);
        return layout.tiles.some((tile) => tile.x === position.x && tile.y === position.y)
            || layout.padSlots.some((slot) => slot.x === position.x && slot.y === position.y);
    }, [brainAdventureLevelGroups, mathAdventureLevelGroups]);

    const selectedPlayBoardGame = useMemo(() => {
        return selectedPlayBoardGameId ? adventureGameStateMap.get(selectedPlayBoardGameId) ?? null : null;
    }, [adventureGameStateMap, selectedPlayBoardGameId]);
    const currentBoardJelloGameId = currentBoardGameId || lastPlayedGameId || null;

    const boardJelloCharacter = useMemo(() => {
        if (!hasCharacter || !speciesId) return null;
        const character = createCharacter(speciesId, characterName);
        character.evolutionStage = Math.max(1, Math.min(5, evolutionStage || 1)) as EvolutionStage;
        return character;
    }, [hasCharacter, speciesId, characterName, evolutionStage]);

    // -- Effects --
    useEffect(() => {
        if (currentBoardGameId || !lastPlayedGameId) return;
        setCurrentBoardGameId(lastPlayedGameId);
    }, [currentBoardGameId, lastPlayedGameId]);

    useEffect(() => {
        if (!isPlayAdventureMode || !currentBoardStorageScope) return;

        const storedPosition = loadStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope);
        if (!storedPosition) {
            const startPosition = getBoardStartPosition(activeBoardLevelGroups);
            setCurrentBoardTilePosition(startPosition);
            if (startPosition) {
                saveStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope, startPosition);
            }
            return;
        }

        if (!isValidBoardPosition(storedPosition, currentBoardStorageScope)) {
            clearStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope);
            const startPosition = getBoardStartPosition(activeBoardLevelGroups);
            setCurrentBoardTilePosition(startPosition);
            if (startPosition) {
                saveStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope, startPosition);
            }
            return;
        }

        setCurrentBoardTilePosition(storedPosition);
    }, [
        playUiScopeId,
        isPlayAdventureMode,
        currentBoardStorageScope,
        activeBoardLevelGroups,
        isValidBoardPosition,
        mathAdventureLevelSignature,
        brainAdventureLevelSignature,
    ]);

    // Auto-scroll to the last played game in the currently visible layout.
    useEffect(() => {
        if (gameId || !lastPlayedGameId) return;
        if (isPlayAdventureMode) return;

        const timeoutId = window.setTimeout(() => {
            const targetId = `game-card-${lastPlayedGameId}`;

            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
            }
        }, 100);

        return () => window.clearTimeout(timeoutId);
    }, [lastPlayedGameId, gameId, isPlayAdventureMode]);

    // Sync math mode switcher background with current adventure level section while scrolling.
    useEffect(() => {
        if (activeTab !== 'math' || mathMode !== 'adventure') return;

        const container = hubContentRef.current;
        if (!container) return;
        if (!mathAdventureLevelGroups.length) return;
        const switcher = document.querySelector<HTMLElement>('.mode-switcher-container');
        if (!switcher) return;

        const headerNodes = Array.from(
            container.querySelectorAll<HTMLElement>('.funmath-level-header, .play-board-level-header')
        );
        if (!headerNodes.length) return;
        const headerAnchors = headerNodes
            .map((header) => {
                const section = header.closest<HTMLElement>('.funmath-level-section[data-level]');
                const playSection = header.closest<HTMLElement>('.play-board-level[data-level]');
                return {
                    level: Number(section?.dataset.level ?? playSection?.dataset.level),
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
    }, [activeTab, mathMode, mathAdventureLevelSignature, playLearnMode]);

    useEffect(() => {
        if (gameId) return;
        if (!isPlayAdventureMode) return;

        const container = hubContentRef.current;
        if (!container) return;

        const timeoutId = window.setTimeout(() => {
            if (currentBoardTilePosition) {
                const tileElement = document.getElementById(
                    `play-board-tile-${currentBoardTilePosition.level}-${currentBoardTilePosition.x}-${currentBoardTilePosition.y}`
                );
                if (tileElement) {
                    requestAnimationFrame(() => {
                        scrollContainerToCenteredElement(container, tileElement);
                    });
                    return;
                }
            }

            if (!lastPlayedGameId) {
                container.scrollTo({ top: 0, behavior: 'auto' });
                return;
            }

            const targetElement = document.getElementById(`play-mission-pad-${lastPlayedGameId}`);
            if (targetElement) {
                requestAnimationFrame(() => {
                    scrollContainerToCenteredElement(container, targetElement);
                });
                return;
            }

            container.scrollTo({ top: 0, behavior: 'auto' });
        }, 100);

        return () => window.clearTimeout(timeoutId);
    }, [gameId, isPlayAdventureMode, lastPlayedGameId, currentBoardTilePosition]);

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
        setCurrentBoardGameId(game.id);
        setCurrentBoardTilePosition(null);
        setSelectedPlayBoardGameId(null);
        navigate(`/play/${game.id}`);
    };

    const handleSelectPlayBoardGame = (gameId: string) => {
        setCurrentBoardTilePosition(null);
        setSelectedPlayBoardGameId(gameId);
        const targetGame = adventureGameStateMap.get(gameId);
        if (targetGame?.unlocked && !targetGame.isPremiumLocked) {
            setCurrentBoardGameId(gameId);
            if (currentBoardStorageScope) {
                const missionPosition = boardGamePositionMap.get(gameId);
                if (missionPosition) {
                    saveStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope, missionPosition);
                }
            }
        }
    };

    const handleSelectBoardTile = (position: { level: number; x: number; y: number }) => {
        setCurrentBoardTilePosition(position);
        if (currentBoardStorageScope) {
            saveStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope, position);
        }
    };

    const handleExitGame = () => {
        setGameDifficulty(null);
        navigate('/play');
    };

    // -- Render Helpers --

    const renderHeader = () => (
        <header className="play-header-hub">
            <div className="play-learn-switch" role="tablist" aria-label="Play mode switch">
                <span className="play-learn-mode-label">Mode</span>
                <button
                    type="button"
                    role="tab"
                    aria-selected={playLearnMode === 'play'}
                    aria-label="Play mode"
                    className={`play-learn-btn ${playLearnMode === 'play' ? 'active' : ''}`}
                    onClick={() => {
                        playButtonSound();
                        setPlayLearnMode('play');
                    }}
                >
                    <i className="fas fa-gamepad" aria-hidden="true"></i>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={playLearnMode === 'learn'}
                    aria-label="Learn mode"
                    className={`play-learn-btn ${playLearnMode === 'learn' ? 'active' : ''}`}
                    onClick={() => {
                        playButtonSound();
                        setPlayLearnMode('learn');
                    }}
                >
                    <i className="fas fa-graduation-cap" aria-hidden="true"></i>
                </button>
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
                                {games.map(({ game, unlocked, displayReason, clearCount, isMastered, isPremiumLocked }) => {
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
                                            isPremiumLocked={isPremiumLocked}
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

    const renderBrainAdventureByLevel = () => {
        if (brainAdventureLevelGroups.length === 0) {
            return <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>🚧 {t('play.game.noGames')} 🚧</div>;
        }

        return (
            <div className="brain-level-groups">
                {brainAdventureLevelGroups.map(({ level, games }, index) => {
                    const nextLevel = brainAdventureLevelGroups[index + 1]?.level;
                    return (
                        <React.Fragment key={level}>
                            <section className={`brain-level-section level-${level}`} data-level={level}>
                                <div className="brain-level-synapse" aria-hidden="true">
                                    <span className="brain-level-synapse-pulse pulse-a" />
                                    <span className="brain-level-synapse-pulse pulse-b" />
                                </div>
                                <div className="brain-level-header">
                                    <p className="brain-level-eyebrow">Brain Gym</p>
                                    <h3 className="brain-level-title">{t('play.controls.level')} {level}</h3>
                                </div>
                                <div className="game-list">
                                    {games.map(({ game, unlocked, displayReason, clearCount, isMastered, isPremiumLocked }) => (
                                        <AdventureCard
                                            key={game.id}
                                            id={`game-card-${game.id}`}
                                            game={game}
                                            unlocked={unlocked}
                                            displayReason={displayReason}
                                            clearCount={clearCount}
                                            isMastered={isMastered}
                                            onPlay={handlePlayClick}
                                            isPremiumLocked={isPremiumLocked}
                                            variant="brain-hybrid"
                                        />
                                    ))}
                                </div>
                            </section>
                            {index < brainAdventureLevelGroups.length - 1 && (
                                <div
                                    className={`brain-level-transition from-${level} to-${nextLevel}`}
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
            {activeTab === 'math' ? renderMathAdventureByLevel() : activeTab === 'brain' ? renderBrainAdventureByLevel() : (
                <>
                    <div className="section-header">
                        <h2 className="section-title">{t(`play.categories.${activeTab}`)}</h2>
                        <p className="section-desc">{t('play.sections.training.desc')}</p>
                    </div>
                <div className="game-list">
                    {adventureGameStates.length > 0 ? (
                        adventureGameStates.map(({ game, unlocked, displayReason, clearCount, isMastered, isPremiumLocked }) => {
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
                                    isPremiumLocked={isPremiumLocked}
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

    const renderPlayModeContent = () => {
        if (activeTab === 'math') {
            return mathMode === 'adventure' ? (
                <PlayAdventureBoard
                    theme="math"
                    levelGroups={mathAdventureLevelGroups}
                    selectedGameId={selectedPlayBoardGameId}
                    currentJelloGameId={currentBoardJelloGameId}
                    currentJelloTilePosition={currentBoardTilePosition}
                    jelloCharacter={boardJelloCharacter}
                    onSelectGame={handleSelectPlayBoardGame}
                    onSelectTile={handleSelectBoardTile}
                />
            ) : (
                renderGeniusSection()
            );
        }

        if (activeTab === 'brain') {
            return (
                <PlayAdventureBoard
                    theme="brain"
                    levelGroups={brainAdventureLevelGroups}
                    selectedGameId={selectedPlayBoardGameId}
                    currentJelloGameId={currentBoardJelloGameId}
                    currentJelloTilePosition={currentBoardTilePosition}
                    jelloCharacter={boardJelloCharacter}
                    onSelectGame={handleSelectPlayBoardGame}
                    onSelectTile={handleSelectBoardTile}
                />
            );
        }

        return (
            <div className="play-board-empty">
                <div className="play-board-empty-card">
                    <span className="play-board-empty-icon">🧭</span>
                    <h3>{t('play.categories.' + activeTab)}</h3>
                    <p>{t('play.sections.training.desc')}</p>
                </div>
            </div>
        );
    };

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
        <div className={`play-page-container ${activeTab === 'brain' ? 'play-page-container-brain' : ''}`}>
            {renderHeader()}

            {activeTab === 'math' && renderMathModeSwitcher()}

            <div
                ref={hubContentRef}
                className={`hub-content ${playLearnMode === 'play' && (activeTab === 'math' || activeTab === 'brain') ? 'hub-content-adventure-board' : ''} ${activeTab === 'brain' ? 'hub-content-brain' : ''}`}
            >
                {playLearnMode === 'play' ? (
                    renderPlayModeContent()
                ) : (
                    activeTab === 'math' ? (
                        mathMode === 'adventure' ? renderAdventureSection() : renderGeniusSection()
                    ) : (
                        // Other tabs reuse the adventure/category layout logic
                        renderAdventureSection()
                    )
                )}
            </div>

            {renderBottomNav()}

            {selectedPlayBoardGame && (
                <PlayGameInfoModal
                    game={selectedPlayBoardGame.game}
                    unlocked={selectedPlayBoardGame.unlocked}
                    displayReason={selectedPlayBoardGame.displayReason}
                    clearCount={selectedPlayBoardGame.clearCount}
                    isMastered={selectedPlayBoardGame.isMastered}
                    isPremiumLocked={selectedPlayBoardGame.isPremiumLocked}
                    onPlay={handlePlayClick}
                    onClose={() => setSelectedPlayBoardGameId(null)}
                />
            )}

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
