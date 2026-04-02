import { lazy } from 'react';
import { GameIds } from '../../constants/gameIds';
import type { PlayGameManifest } from './types';

const MIN_LOADING_TIME = 800;

const delayedImport = <T,>(importPromise: Promise<T>): Promise<T> => {
    return Promise.all([
        importPromise,
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME)),
    ]).then(([moduleExports]) => moduleExports);
};

const PlayTailRunner = lazy(() => delayedImport(import('./arcade/TailRunner')));
const PlaySnackSprint = lazy(() => delayedImport(import('./arcade/SnackSprint')));
const PlayStarBridge = lazy(() => delayedImport(import('./arcade/StarBridge')));

export const PLAY_GAMES: PlayGameManifest[] = [
    {
        id: GameIds.PLAY_JELLO_COMET,
        title: 'Tail Runner',
        description: 'Run, grow your tail, and survive the world.',
        subtitle: 'Run with your Jello',
        titleKey: 'play.game.gameTitles.tailRunner',
        category: 'play' as const,
        level: 1 as const,
        component: PlayTailRunner,
        launcher: {
            order: 1,
            sticker: '🐍',
            shell: '#4f8b4d',
            shellDark: '#376535',
            accent: '#8ed06f',
            accentLight: '#b9e39d',
            ink: '#17361f',
            edge: '#d9f0c2',
            glow: 'rgba(142, 208, 111, 0.35)',
        },
    },
    {
        id: GameIds.PLAY_SNACK_SPRINT,
        title: 'Snack Sprint',
        description: 'Standalone runner-style play game slot.',
        subtitle: 'Dash for snacks',
        category: 'play' as const,
        level: 1 as const,
        component: PlaySnackSprint,
        launcher: {
            order: 2,
            sticker: '🍓',
            shell: '#c34d4b',
            shellDark: '#953230',
            accent: '#f18a6d',
            accentLight: '#f7b39d',
            ink: '#421714',
            edge: '#ffd2b5',
            glow: 'rgba(241, 138, 109, 0.34)',
        },
    },
    {
        id: GameIds.PLAY_STAR_BRIDGE,
        title: 'Star Bridge',
        description: 'Standalone puzzle-action play game slot.',
        subtitle: 'Build the path',
        category: 'play' as const,
        level: 1 as const,
        component: PlayStarBridge,
        launcher: {
            order: 3,
            sticker: '🌌',
            shell: '#4767b0',
            shellDark: '#314a84',
            accent: '#77a9ff',
            accentLight: '#aacbff',
            ink: '#152549',
            edge: '#dbe6ff',
            glow: 'rgba(119, 169, 255, 0.34)',
        },
    },
].sort((a, b) => a.launcher.order - b.launcher.order);

export const getPlayGames = () => PLAY_GAMES;

export const getPlayGameById = (id: string) =>
    PLAY_GAMES.find((game) => game.id === id);
