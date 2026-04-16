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
const PlayJelloKnight = lazy(() => delayedImport(import('./arcade/JelloKnight')));
const PlayGroGroLand = lazy(() => delayedImport(import('./arcade/GroGroLand')));

export const PLAY_GAMES: PlayGameManifest[] = [
    {
        id: GameIds.PLAY_JELLO_COMET,
        title: 'Tail Runner',
        description: 'Run, grow your tail, and survive the world.',
        subtitle: 'Run with your Jello',
        titleKey: 'play.game.gameTitles.tailRunner',
        subtitleKey: 'play.game.gameSubtitles.tailRunner',
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
        id: GameIds.PLAY_JELLO_KNIGHT,
        title: 'Jello Knight',
        description: 'Endless survival prototype with your Jello hero.',
        subtitle: 'Orbit, dodge, and grow',
        titleKey: 'play.game.gameTitles.jelloKnight',
        subtitleKey: 'play.game.gameSubtitles.jelloKnight',
        category: 'play' as const,
        level: 1 as const,
        component: PlayJelloKnight,
        launcher: {
            order: 2,
            sticker: '⚔️',
            shell: '#f1dc59',
            shellDark: '#d2b92f',
            accent: '#fff17a',
            accentLight: '#fff9c9',
            ink: '#5a4700',
            edge: '#fffde7',
            glow: 'rgba(255, 241, 122, 0.34)',
        },
    },
    {
        id: GameIds.PLAY_GROGRO_LAND,
        title: 'GroGro Land',
        description: 'Grow a colorful world in a dedicated play-land.',
        subtitle: 'Grow your land',
        titleKey: 'play.game.gameTitles.groGroLand',
        subtitleKey: 'play.game.gameSubtitles.groGroLand',
        category: 'play' as const,
        level: 1 as const,
        component: PlayGroGroLand,
        launcher: {
            order: 3,
            sticker: '🗺️',
            shell: '#5f89d8',
            shellDark: '#3e5fa7',
            accent: '#89c8ff',
            accentLight: '#c5e6ff',
            ink: '#19345f',
            edge: '#eef7ff',
            glow: 'rgba(137, 200, 255, 0.34)',
        },
    },
].sort((a, b) => a.launcher.order - b.launcher.order);

export const getPlayGames = () => PLAY_GAMES;

export const getPlayGameById = (id: string) =>
    PLAY_GAMES.find((game) => game.id === id);
