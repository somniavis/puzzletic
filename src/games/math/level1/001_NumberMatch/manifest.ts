import type { GameManifest } from '../../../types';
import { NumberMatch } from './index';

export const manifest: GameManifest = {
    id: 'math-01',
    title: 'Number Match',
    description: 'Match the numbers to solve the puzzle!',
    category: 'math',
    level: 1,
    component: NumberMatch,
    thumbnail: '🔢'
};
