import type { GameManifest } from '../games/types';
import type { NurturingPersistentState } from '../types/nurturing';
import { GAME_ORDER, getProgressionCategory } from '../constants/gameOrder';
import { isMasteryUnlockReady } from './resultMetrics';

/**
 * Category-Based Progression System (Optimized)
 * 
 * 카테고리별 "도달한 게임 ID"만 저장하여 해금 판정
 * - 데이터 크기: 200개 게임 → ~1KB (vs ~40KB)
 * - 해금 계산: O(1) 순서 비교
 * 
 * 해금 규칙:
 * 1. 첫 번째 게임은 항상 해금
 * 2. categoryProgress[category]에 저장된 게임까지 모두 해금
 * 3. 그 다음 게임은 마스터리 조건 충족 시 해금
 */

/**
 * 게임 해금 여부 확인 (최적화된 버전)
 */
export const isGameUnlocked = (
    targetGameId: string,
    allGames: GameManifest[],
    userState: Pick<NurturingPersistentState, 'minigameStats' | 'categoryProgress'>
): { unlocked: boolean; reason?: string; requiredGame?: GameManifest } => {
    const targetGame = allGames.find(g => g.id === targetGameId);
    if (!targetGame) return { unlocked: false, reason: 'Game not found' };

    // 카테고리 확인
    const category = getProgressionCategory(targetGameId);
    if (!category) {
        // 순서 목록에 없는 게임은 기본 해금
        return { unlocked: true };
    }

    const order = GAME_ORDER[category];
    const targetIndex = order.indexOf(targetGameId);

    // 규칙 1: 첫 번째 게임은 항상 해금
    if (targetIndex === 0) return { unlocked: true };

    // categoryProgress에서 도달한 게임 확인
    const reachedGameId = userState.categoryProgress?.[category];

    if (reachedGameId) {
        const reachedIndex = order.indexOf(reachedGameId);

        // 도달점까지 모두 해금
        if (targetIndex <= reachedIndex) {
            return { unlocked: true };
        }

        // 도달점 다음 게임: 마스터리 조건 확인
        if (targetIndex === reachedIndex + 1) {
            const reachedGameStats = userState.minigameStats?.[reachedGameId];

            // Genius 모드: 10회 플레이
            if (targetGame.mode === 'genius') {
                if (reachedGameStats && reachedGameStats.playCount >= 10) {
                    return { unlocked: true };
                }
            } else {
                // Adventure 모드: 마스터리
                if (isMasteryUnlockReady(reachedGameStats)) {
                    return { unlocked: true };
                }
            }
        }
    }

    // 해금되지 않음 - 이전 게임 정보 반환
    const prevGameId = order[targetIndex - 1];
    const prevGameManifest = allGames.find(g => g.id === prevGameId);

    return {
        unlocked: false,
        requiredGame: prevGameManifest,
        reason: targetGame.mode === 'genius'
            ? `Master ${prevGameManifest?.title} (10 clears) to unlock`
            : undefined
    };
};

/**
 * categoryProgress 업데이트 (게임 완료 시 호출)
 * 현재 게임이 카테고리 내 최고 순서면 업데이트
 */
export const updateCategoryProgress = (
    gameId: string,
    currentProgress: Record<string, string> | undefined
): Record<string, string> | undefined => {
    const category = getProgressionCategory(gameId);
    if (!category) return currentProgress;

    const order = GAME_ORDER[category];
    const currentIndex = order.indexOf(gameId);
    const existingProgress = currentProgress || {};
    const existingReachedId = existingProgress[category];
    const existingIndex = existingReachedId ? order.indexOf(existingReachedId) : -1;

    // 현재 게임이 기존 도달점보다 앞서면 업데이트
    if (currentIndex > existingIndex) {
        return {
            ...existingProgress,
            [category]: gameId
        };
    }

    return currentProgress;
};

/**
 * 모든 게임의 해금 상태 가져오기 (배치)
 */
export const getGameUnlockStatuses = (
    games: GameManifest[],
    userState: NurturingPersistentState
) => {
    return games.map(game => ({
        id: game.id,
        ...isGameUnlocked(game.id, games, userState)
    }));
};
