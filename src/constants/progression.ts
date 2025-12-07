/**
 * Progression Constants
 * 성장 및 게임 보상 관련 상수
 */

import type { EvolutionStage } from '../types/character';

// ==================== 성장 단계 (Growth Stages) ====================

export const GROWTH_STAGES: Record<EvolutionStage, { name: string; requiredXp: number }> = {
    1: { name: 'Baby', requiredXp: 0 },
    2: { name: 'Child', requiredXp: 100 },
    3: { name: 'Teen', requiredXp: 600 },
    4: { name: 'Adult', requiredXp: 3600 },
    5: { name: 'Master', requiredXp: 15600 },
};

// ==================== 게임 난이도 (Game Difficulty) ====================

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyReward {
    xp: number;       // 획득 경험치 (XP)
    happiness: number; // 획득 행복도
}

export const DIFFICULTY_REWARDS: Record<GameDifficulty, DifficultyReward> = {
    easy: {
        xp: 10,
        happiness: 5,
    },
    medium: {
        xp: 25,
        happiness: 10,
    },
    hard: {
        xp: 50,
        happiness: 20,
    },
};
