import React, { useCallback, useEffect, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import './PlayPage.css';
import { playButtonSound, startBackgroundMusic, startPlayBackgroundMusic, stopBackgroundMusic } from '../utils/sound';
import { useNurturing } from '../contexts/NurturingContext';
import { GAMES, getGameById } from '../games/registry';
import type { GameCategory, GameManifest } from '../games/types';
import { getPlayGameById, getPlayGames } from '../games/play/registry';
import type { PlayGameManifest } from '../games/play/types';
import { isGameUnlocked, parseGameScore, ADVENTURE_UNLOCK_THRESHOLD, GENIUS_UNLOCK_THRESHOLD } from '../utils/progression';
import { useAuth } from '../contexts/AuthContext';
import { createCharacter } from '../data/characters';
import type { EvolutionStage } from '../types/character';

// Hooks & Utils
import { usePlayPageLogic, type Operator } from '../hooks/usePlayPageLogic';
import { usePlayUiPreferences } from '../hooks/usePlayUiPreferences';
import { useMobileInteractionGuard } from '../hooks/useMobileInteractionGuard';
import { CATEGORY_ICONS } from '../utils/playPageUtils';
import { usePremiumStatus, isPremiumGame } from '../utils/premiumLogic';
import { PremiumPurchaseModal } from '../components/Premium/PremiumPurchaseModal';
import { SettingsMenu } from '../components/SettingsMenu/SettingsMenu';
import { useSound } from '../contexts/SoundContext';

// Components
import { AdventureCard } from '../components/PlayPage/AdventureCard';
import { DrillItem } from '../components/PlayPage/DrillItem';
import { GeniusDashboard } from '../components/PlayPage/GeniusDashboard';
import { PlayAdventureBoard, type PlayAdventureBoardGame } from '../components/PlayPage/PlayAdventureBoard';
import { PlayGameInfoModal } from '../components/PlayPage/PlayGameInfoModal';
import { GameErrorBoundary } from '../components/Game/GameErrorBoundary';
import { buildBoardLayout } from '../components/PlayPage/playAdventureBoardLayout';

type BoardPositionTab = 'math' | 'brain';
type StoredBoardTilePosition = {
    level: number;
    x: number;
    y: number;
};

type RetroPlayPhase = 'browse' | 'inserting' | 'loading';

type RetroPlayPack = {
    game: PlayGameManifest;
    launcher: PlayGameManifest['launcher'];
    title: string;
    subtitle: string;
    isPremiumLocked: boolean;
};

const RETRO_PACK_RIDGE_KEYS = Array.from({ length: 8 }, (_, index) => index);
const RETRO_CONSOLE_INSERT_RIDGE_KEYS = Array.from({ length: 6 }, (_, index) => index);

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

const resolveInitialBoardTilePosition = (
    scopeId: string | undefined,
    board: BoardPositionTab,
    levelGroups: Array<{ level: number; games: PlayAdventureBoardGame[] }>,
    isValidPosition: (position: StoredBoardTilePosition, board: BoardPositionTab) => boolean
) => {
    const storedPosition = loadStoredBoardTilePosition(scopeId, board);
    const startPosition = getBoardStartPosition(levelGroups);

    if (!storedPosition) {
        return {
            position: startPosition,
            shouldPersist: Boolean(startPosition),
            shouldClear: false,
        };
    }

    if (!isValidPosition(storedPosition, board)) {
        return {
            position: startPosition,
            shouldPersist: Boolean(startPosition),
            shouldClear: true,
        };
    }

    return {
        position: storedPosition,
        shouldPersist: false,
        shouldClear: false,
    };
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

const getRetroCarouselOffset = (index: number, activeIndex: number, total: number) => {
    let delta = index - activeIndex;
    const half = Math.floor(total / 2);
    if (delta > half) delta -= total;
    if (delta < -half) delta += total;
    return delta;
};

const getLocalizedGameTitle = (game: GameManifest, t: ReturnType<typeof useTranslation>['t']) => {
    if (!game.titleKey) return game.title;
    const localized = t(game.titleKey);
    return localized === game.titleKey ? game.title : localized;
};

const getLocalizedGameSubtitle = (game: GameManifest, t: ReturnType<typeof useTranslation>['t']) => {
    if (!game.subtitleKey) return game.subtitle || '';
    const localized = t(game.subtitleKey);
    return localized === game.subtitleKey ? (game.subtitle || '') : localized;
};

const PlayPage: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { t } = useTranslation();
    const { user, guestId } = useAuth();
    const { settings } = useSound();
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
    const [retroActiveIndex, setRetroActiveIndex] = React.useState(0);
    const [retroSelectedGameId, setRetroSelectedGameId] = React.useState<string | null>(null);
    const [retroPhase, setRetroPhase] = React.useState<RetroPlayPhase>('browse');
    const [retroPowerOn, setRetroPowerOn] = React.useState(true);
    const [retroStartToastVisible, setRetroStartToastVisible] = React.useState(false);
    const hubContentRef = React.useRef<HTMLDivElement | null>(null);
    const retroInsertTimeoutRef = React.useRef<number | null>(null);
    const retroStartToastTimeoutRef = React.useRef<number | null>(null);
    const retroSwipeStartRef = React.useRef<{ x: number; y: number } | null>(null);
    const playPageRootRef = React.useRef<HTMLDivElement | null>(null);
    const isPlayAdventureMode = playLearnMode === 'play'
        && ((activeTab === 'math' && mathMode === 'adventure') || activeTab === 'brain');
    const isRetroPlayTab = activeTab === 'play';

    useMobileInteractionGuard({
        rootRef: playPageRootRef,
    });

    const activeGame = gameId ? (getGameById(gameId) ?? getPlayGameById(gameId)) : null;
    const activePlayGame = gameId ? getPlayGameById(gameId) : null;
    const activeGamePremiumLocked = activeGame ? !isPremium && isPremiumGame(activeGame) : false;
    const retroPlayPacks = useMemo<RetroPlayPack[]>(() => {
        return getPlayGames().map((game) => {
            return {
                game,
                launcher: game.launcher,
                title: getLocalizedGameTitle(game, t),
                subtitle: getLocalizedGameSubtitle(game, t),
                isPremiumLocked: !isPremium && isPremiumGame(game),
            };
        });
    }, [isPremium, t]);
    const retroSelectedPack = useMemo(
        () => retroPlayPacks.find((pack) => pack.game.id === retroSelectedGameId) ?? null,
        [retroPlayPacks, retroSelectedGameId]
    );
    const retroActivePack = retroPlayPacks[retroActiveIndex] ?? null;
    const retroUiText = useMemo(() => ({
        carousel: t('play.retro.selectCartridge'),
        swipeHint: t('play.retro.swipeOrTap'),
        inserting: t('play.retro.inserting'),
        loading: t('play.retro.nowLoading'),
        power: t('play.retro.power'),
        insert: t('play.retro.insert'),
        start: t('play.retro.start'),
        eject: t('play.retro.eject'),
        insertPackFirst: t('play.retro.insertPackFirst'),
        angelPass: t('profile.status.angelPass'),
    }), [t]);
    const retroHintLabel = useMemo(() => {
        if (retroPhase === 'browse') return retroUiText.swipeHint;
        if (retroPhase === 'inserting') return retroUiText.inserting;
        return retroUiText.loading;
    }, [retroPhase, retroUiText]);
    const retroPackRenderItems = useMemo(() => {
        return retroPlayPacks.map((pack, index) => {
            const offset = getRetroCarouselOffset(index, retroActiveIndex, retroPlayPacks.length);
            const depth = Math.abs(offset);

            return {
                pack,
                index,
                isCenter: offset === 0,
                hidden: depth > 2,
                style: {
                    ['--retro-pack-shell' as string]: pack.launcher.shell,
                    ['--retro-pack-shell-dark' as string]: pack.launcher.shellDark,
                    ['--retro-pack-accent' as string]: pack.launcher.accent,
                    ['--retro-pack-accent-light' as string]: pack.launcher.accentLight,
                    ['--retro-pack-ink' as string]: pack.launcher.ink,
                    ['--retro-pack-edge' as string]: pack.launcher.edge,
                    ['--retro-pack-glow' as string]: pack.launcher.glow,
                    transform: `translate3d(${offset === 0 ? 0 : Math.sign(offset) * (depth === 1 ? 108 : 176)}px, ${depth * 12}px, 0) scale(${1 - depth * 0.23}) rotateY(${offset * 28}deg)`,
                    opacity: String(1 - depth * 0.26),
                    filter: pack.isPremiumLocked
                        ? `saturate(${Math.max(0.42, 0.58 - depth * 0.18)}) brightness(0.82)`
                        : `saturate(${1 - depth * 0.35})`,
                    zIndex: String(10 - depth),
                } as React.CSSProperties,
            };
        });
    }, [retroActiveIndex, retroPlayPacks]);
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

    const resetRetroLauncher = useCallback((options?: { keepPowerOn?: boolean }) => {
        if (retroInsertTimeoutRef.current) {
            window.clearTimeout(retroInsertTimeoutRef.current);
            retroInsertTimeoutRef.current = null;
        }
        if (retroStartToastTimeoutRef.current) {
            window.clearTimeout(retroStartToastTimeoutRef.current);
            retroStartToastTimeoutRef.current = null;
        }
        setRetroPhase('browse');
        setRetroSelectedGameId(null);
        setRetroStartToastVisible(false);
        if (!options?.keepPowerOn) {
            setRetroPowerOn(false);
        }
    }, []);

    const moveRetroCarousel = useCallback((direction: 'prev' | 'next') => {
        if (retroPhase !== 'browse' || retroPlayPacks.length <= 1) return;
        playButtonSound();
        setRetroActiveIndex((prev) => {
            if (direction === 'next') {
                return (prev + 1) % retroPlayPacks.length;
            }
            return (prev - 1 + retroPlayPacks.length) % retroPlayPacks.length;
        });
    }, [retroPhase, retroPlayPacks.length]);

    const handleRetroSwipeStart = useCallback((clientX: number, clientY: number) => {
        retroSwipeStartRef.current = { x: clientX, y: clientY };
    }, []);

    const handleRetroSwipeEnd = useCallback((clientX: number, clientY: number) => {
        const start = retroSwipeStartRef.current;
        retroSwipeStartRef.current = null;
        if (!start) return;

        const deltaX = clientX - start.x;
        const deltaY = clientY - start.y;

        if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

        if (deltaX < 0) {
            moveRetroCarousel('next');
        } else {
            moveRetroCarousel('prev');
        }
    }, [moveRetroCarousel]);

    const insertRetroPack = useCallback((pack: RetroPlayPack) => {
        playButtonSound();
        if (pack.isPremiumLocked) {
            setIsPremiumModalOpen(true);
            return;
        }

        setRetroPowerOn(true);
        setRetroSelectedGameId(pack.game.id);
        setRetroPhase('inserting');

        if (retroInsertTimeoutRef.current) {
            window.clearTimeout(retroInsertTimeoutRef.current);
        }

        retroInsertTimeoutRef.current = window.setTimeout(() => {
            setRetroPhase('loading');
            retroInsertTimeoutRef.current = null;
        }, 900);
    }, []);

    const handleRetroPackSelection = useCallback((index: number) => {
        if (retroPhase !== 'browse') return;
        const pack = retroPlayPacks[index];
        if (!pack) return;

        if (index !== retroActiveIndex) {
            playButtonSound();
            setRetroActiveIndex(index);
            return;
        }

        insertRetroPack(pack);
    }, [insertRetroPack, retroActiveIndex, retroPhase, retroPlayPacks]);

    const handleRetroInsertActivePack = useCallback(() => {
        if (retroPhase !== 'browse' || !retroActivePack) return;
        insertRetroPack(retroActivePack);
    }, [insertRetroPack, retroActivePack, retroPhase]);

    const handleRetroReset = useCallback(() => {
        playButtonSound();
        resetRetroLauncher({ keepPowerOn: true });
    }, [resetRetroLauncher]);

    const handleRetroMainAction = useCallback(() => {
        if (retroPhase === 'browse') {
            handleRetroInsertActivePack();
            return;
        }

        if (!retroSelectedPack || retroPhase === 'inserting') {
            playButtonSound();
            setRetroStartToastVisible(true);
            if (retroStartToastTimeoutRef.current) {
                window.clearTimeout(retroStartToastTimeoutRef.current);
            }
            retroStartToastTimeoutRef.current = window.setTimeout(() => {
                setRetroStartToastVisible(false);
                retroStartToastTimeoutRef.current = null;
            }, 1700);
            return;
        }
        if (!retroPowerOn || retroPhase !== 'loading') return;
        if (retroSelectedPack.isPremiumLocked) {
            playButtonSound();
            setIsPremiumModalOpen(true);
            return;
        }
        playButtonSound();
        navigate(`/play/${retroSelectedPack.game.id}`);
    }, [handleRetroInsertActivePack, navigate, retroPhase, retroPowerOn, retroSelectedPack]);

    const handleRetroPowerToggle = useCallback(() => {
        playButtonSound();
        setRetroPowerOn((prev) => {
            const next = !prev;
            if (!next) {
                resetRetroLauncher();
            }
            return next;
        });
    }, [resetRetroLauncher]);

    // -- Effects --
    useEffect(() => {
        if (currentBoardGameId || !lastPlayedGameId) return;
        setCurrentBoardGameId(lastPlayedGameId);
    }, [currentBoardGameId, lastPlayedGameId]);

    useEffect(() => {
        return () => {
            if (retroInsertTimeoutRef.current) {
                window.clearTimeout(retroInsertTimeoutRef.current);
            }
            if (retroStartToastTimeoutRef.current) {
                window.clearTimeout(retroStartToastTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isRetroPlayTab) return;
        resetRetroLauncher();
    }, [isRetroPlayTab, resetRetroLauncher]);

    useEffect(() => {
        if (!isPlayAdventureMode || !currentBoardStorageScope) return;

        const { position, shouldPersist, shouldClear } = resolveInitialBoardTilePosition(
            playUiScopeId,
            currentBoardStorageScope,
            activeBoardLevelGroups,
            isValidBoardPosition
        );

        if (shouldClear) {
            clearStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope);
        }

        setCurrentBoardTilePosition(position);

        if (shouldPersist && position) {
            saveStoredBoardTilePosition(playUiScopeId, currentBoardStorageScope, position);
        }
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

    useEffect(() => {
        if (!isRetroPlayTab || retroPhase !== 'loading') return;

        const container = hubContentRef.current;
        if (!container) return;

        const timeoutId = window.setTimeout(() => {
            const maxScrollTop = container.scrollHeight - container.clientHeight;
            if (maxScrollTop <= 4) return;

            container.scrollTo({
                top: maxScrollTop,
                behavior: 'smooth',
            });
        }, 60);

        return () => window.clearTimeout(timeoutId);
    }, [isRetroPlayTab, retroPhase]);

    useEffect(() => {
        if (!activePlayGame) return;

        if (settings.bgmEnabled && user) {
            void startPlayBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }

        return () => {
            if (settings.bgmEnabled && user) {
                void startBackgroundMusic();
            } else {
                stopBackgroundMusic();
            }
        };
    }, [activePlayGame, settings.bgmEnabled, user]);

    // -- Handlers --
    const onTabSelect = useCallback((category: GameCategory) => {
        playButtonSound();
        if (category === 'science') {
            setIsSettingsMenuOpen(true);
            return;
        }
        handleTabSelect(category);
    }, [handleTabSelect]);

    const onMathModeSelect = useCallback((mode: 'adventure' | 'genius') => {
        playButtonSound();
        handleMathModeSelect(mode);
    }, [handleMathModeSelect]);

    const handleHomeClick = useCallback(() => {
        playButtonSound();
        navigate('/home');
    }, [navigate]);

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
            <div className="play-mode-indicator" aria-label={playLearnMode === 'play' ? 'Game mode' : 'Learn mode'}>
                <span className="play-mode-indicator-label">Mode</span>
                <span className="play-mode-indicator-icon" aria-hidden="true">
                    <i className={`fas ${playLearnMode === 'play' ? 'fa-gamepad' : 'fa-graduation-cap'}`}></i>
                </span>
            </div>
            <div className="play-header-actions">
                <div className="star-display">
                    <span>⭐ {totalGameStars || 0}</span>
                </div>
                <button className="header-close-btn" onClick={handleHomeClick}><i className="fas fa-xmark"></i></button>
            </div>
        </header>
    );

    const renderBottomNav = () => (
        <nav className="bottom-nav-hub">
            {(['math', 'brain', 'play', 'science'] as GameCategory[]).map(cat => (
                <button
                    key={cat}
                    className={`nav-item-hub ${activeTab === cat ? `active ${cat}` : ''}`}
                    onClick={() => onTabSelect(cat)}
                >
                    <div className="nav-icon-box">
                        <i className={CATEGORY_ICONS[cat]}></i>
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

    const renderRetroPlayLauncher = () => {
        if (!retroPlayPacks.length) {
            return (
                <div className="play-board-empty">
                    <div className="play-board-empty-card retro-play-empty-card">
                        <span className="play-board-empty-icon">🎮</span>
                        <h3>{t('play.categories.play')}</h3>
                        <p>{t('play.sections.play.desc')}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="retro-play-stage">
                <div className="retro-play-stage-glow retro-play-stage-glow-a" aria-hidden="true" />
                <div className="retro-play-stage-glow retro-play-stage-glow-b" aria-hidden="true" />

                <div className="retro-play-top">
                    <div className="retro-play-header">
                        <p className="retro-play-eyebrow retro-play-eyebrow-pill">{retroUiText.carousel}</p>
                        <p className="retro-play-hint">{retroHintLabel}</p>
                    </div>

                    <div className="retro-play-display">
                        {retroPhase === 'loading' && retroSelectedPack ? (
                            <div className="retro-play-screen">
                                <div className="retro-play-screen-scanlines" aria-hidden="true" />
                                <div className="retro-play-screen-content">
                                    <span className="retro-play-screen-sticker">{retroSelectedPack.launcher.sticker}</span>
                                    <h3>{retroSelectedPack.title}</h3>
                                    {retroSelectedPack.subtitle && <p>{retroSelectedPack.subtitle}</p>}
                                    <span className="retro-play-screen-loading">{retroUiText.loading}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="retro-play-pack-stack">
                                <div
                                    className="retro-play-carousel"
                                    aria-label={retroUiText.carousel}
                                    onTouchStart={(event) => {
                                        const touch = event.changedTouches[0];
                                        if (!touch) return;
                                        handleRetroSwipeStart(touch.clientX, touch.clientY);
                                    }}
                                    onTouchEnd={(event) => {
                                        const touch = event.changedTouches[0];
                                        if (!touch) return;
                                        handleRetroSwipeEnd(touch.clientX, touch.clientY);
                                    }}
                                    onPointerDown={(event) => {
                                        if (event.pointerType !== 'mouse') {
                                            handleRetroSwipeStart(event.clientX, event.clientY);
                                        }
                                    }}
                                    onPointerUp={(event) => {
                                        if (event.pointerType !== 'mouse') {
                                            handleRetroSwipeEnd(event.clientX, event.clientY);
                                        }
                                    }}
                                    onPointerCancel={() => {
                                        retroSwipeStartRef.current = null;
                                    }}
                                >
                                    {retroPackRenderItems.map(({ pack, index, isCenter, hidden, style }) => {
                                        return (
                                            <button
                                                key={pack.game.id}
                                                type="button"
                                                className={`retro-pack ${isCenter ? 'is-center' : ''} ${hidden ? 'is-hidden' : ''} ${pack.isPremiumLocked ? 'is-premium-locked' : ''}`}
                                                style={style}
                                                onClick={() => handleRetroPackSelection(index)}
                                                aria-pressed={isCenter}
                                                aria-label={pack.isPremiumLocked ? `${pack.title} ${retroUiText.angelPass}` : pack.title}
                                                disabled={retroPhase !== 'browse'}
                                            >
                                                {pack.isPremiumLocked && (
                                                    <span className="retro-pack-premium-lock" aria-hidden="true">
                                                        <span className="retro-pack-premium-lock-icon">🔒</span>
                                                        <span className="retro-pack-premium-lock-badge">{retroUiText.angelPass}</span>
                                                    </span>
                                                )}
                                                <span className="retro-pack-notch" aria-hidden="true" />
                                                <span className="retro-pack-label">
                                                    <span className="retro-pack-sticker" aria-hidden="true">{pack.launcher.sticker}</span>
                                                    <span className="retro-pack-title">{pack.title}</span>
                                                </span>
                                                <span className="retro-pack-ridges" aria-hidden="true">
                                                    {RETRO_PACK_RIDGE_KEYS.map((ridgeIndex) => (
                                                        <span key={ridgeIndex} />
                                                    ))}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="retro-play-dots" aria-label={retroUiText.carousel}>
                                    {retroPlayPacks.map((pack, index) => (
                                        <button
                                            key={pack.game.id}
                                            type="button"
                                            className={`retro-play-dot ${retroActiveIndex === index ? 'active' : ''}`}
                                            onClick={() => handleRetroPackSelection(index)}
                                            disabled={retroPhase !== 'browse'}
                                            aria-label={pack.title}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="retro-console-wrap">
                    {retroStartToastVisible && (
                        <div className="retro-start-toast" role="status" aria-live="polite">
                            {retroUiText.insertPackFirst}
                        </div>
                    )}
                    <div className="retro-console-body">
                        <div className="retro-console-gloss" aria-hidden="true" />
                        <div className="retro-console-slot">
                            <div className="retro-console-slot-mouth" />
                            {retroSelectedPack && (
                                <div
                                    className={`retro-console-insert ${retroPhase === 'inserting' ? 'is-inserting' : retroPhase === 'loading' ? 'is-loaded' : ''}`}
                                    style={{
                                        ['--retro-pack-shell' as string]: retroSelectedPack.launcher.shell,
                                        ['--retro-pack-shell-dark' as string]: retroSelectedPack.launcher.shellDark,
                                        ['--retro-pack-accent' as string]: retroSelectedPack.launcher.accent,
                                        ['--retro-pack-accent-light' as string]: retroSelectedPack.launcher.accentLight,
                                        ['--retro-pack-edge' as string]: retroSelectedPack.launcher.edge,
                                    }}
                                    aria-hidden="true"
                                >
                                    <span className="retro-console-insert-ridges">
                                        {RETRO_CONSOLE_INSERT_RIDGE_KEYS.map((ridgeIndex) => (
                                            <span key={ridgeIndex} />
                                        ))}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="retro-console-controls">
                            <div className="retro-console-power-group">
                                <button
                                    type="button"
                                    className={`retro-console-switch ${retroPowerOn ? 'is-on' : ''}`}
                                    onClick={handleRetroPowerToggle}
                                    aria-pressed={retroPowerOn}
                                    aria-label={retroUiText.power}
                                >
                                    <span />
                                </button>
                                <div className={`retro-console-led ${retroPowerOn ? 'is-on' : ''}`} />
                                <span className="retro-console-label">{retroUiText.power}</span>
                            </div>
                            <button
                                type="button"
                                className={`retro-console-action retro-console-action-start ${retroPhase === 'loading' ? 'is-start' : 'is-insert'}`}
                                onClick={handleRetroMainAction}
                                disabled={!retroPowerOn || retroPhase === 'inserting' || (retroPhase === 'browse' && !retroActivePack)}
                                aria-disabled={!retroPowerOn || retroPhase === 'inserting' || (retroPhase === 'browse' && !retroActivePack)}
                            >
                                {retroPhase === 'loading' ? retroUiText.start : retroUiText.insert}
                            </button>
                            <div className="retro-console-reset-group">
                                <button type="button" className="retro-console-reset-btn" onClick={handleRetroReset}>
                                    <i className="fas fa-eject" aria-hidden="true" />
                                </button>
                                <span className="retro-console-label">{retroUiText.eject}</span>
                            </div>
                        </div>

                        <div className="retro-console-brand" aria-hidden="true">
                            <span className="retro-console-color retro-console-color-red" />
                            <span className="retro-console-color retro-console-color-yellow" />
                            <span className="retro-console-color retro-console-color-blue" />
                            <span className="retro-console-color retro-console-color-green" />
                            <span>JELLO COM</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
        if (activeGamePremiumLocked) {
            return (
                <div
                    ref={playPageRootRef}
                    className="play-page-container mobile-ui-guard"
                >
                    {renderHeader()}
                    <div className="hub-content">
                        <div className="play-board-empty">
                            <div className="play-board-empty-card">
                                <span className="play-board-empty-icon">🔒</span>
                                <h3>{activeGame.titleKey ? t(activeGame.titleKey) : activeGame.title}</h3>
                                <p>{t('common.premium')}</p>
                            </div>
                        </div>
                    </div>
                    {renderBottomNav()}
                    <PremiumPurchaseModal
                        isOpen={true}
                        onClose={() => navigate('/play', { replace: true })}
                    />
                </div>
            );
        }

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

    const pageContent = activeTab === 'play'
        ? renderRetroPlayLauncher()
        : playLearnMode === 'play'
            ? renderPlayModeContent()
            : activeTab === 'math'
                ? (mathMode === 'adventure' ? renderAdventureSection() : renderGeniusSection())
                : renderAdventureSection();

    return (
        <div
            ref={playPageRootRef}
            className={`play-page-container mobile-ui-guard ${activeTab === 'brain' ? 'play-page-container-brain' : ''} ${activeTab === 'play' ? 'play-page-container-play' : ''}`}
        >
            {renderHeader()}

            {activeTab === 'math' && renderMathModeSwitcher()}

            <div
                ref={hubContentRef}
                className={`hub-content ${isPlayAdventureMode ? 'hub-content-adventure-board' : ''} ${activeTab === 'brain' ? 'hub-content-brain' : ''}`}
            >
                {pageContent}
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
                playLearnMode={playLearnMode}
                onPlayLearnModeChange={setPlayLearnMode}
            />
        </div>
    );
};

export { PlayPage };
