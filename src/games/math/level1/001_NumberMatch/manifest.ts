import type { GameManifest } from '../../../types';
import { NumberMatch } from './index';

export const manifest: GameManifest = {
    id: 'math-01',
    title: 'Number Match', // Fallback
    titleKey: 'games.math-01.title',
    subtitle: 'Basic Addition',
    subtitleKey: 'games.math-01.sub',
    description: 'Match the numbers to solve the puzzle!', // Fallback
    descriptionKey: 'games.math-01.desc',
    category: 'math',
    level: 1,
    component: NumberMatch,
    thumbnail: '🔢'
};
