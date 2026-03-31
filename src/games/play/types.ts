import type { GameManifest } from '../types';

export type PlayGameLauncherTheme = {
    sticker: string;
    shell: string;
    shellDark: string;
    accent: string;
    accentLight: string;
    ink: string;
    edge: string;
    glow: string;
    order: number;
};

export interface PlayGameManifest extends GameManifest {
    category: 'play';
    launcher: PlayGameLauncherTheme;
}
