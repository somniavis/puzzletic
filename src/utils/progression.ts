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
 * MinigameStats를 기반으로 categoryProgress 재계산 (데이터 무결성 복구용)
 * "Smart Merge"가 실패하거나 데이터가 꼬였을 때, 통계 데이터를 "Single Source of Truth"로 사용하여 복구합니다.
 */
export const recalculateCategoryProgress = (
    minigameStats: Record<string, import('../types/nurturing').MinigameStats> | undefined,
): Record<string, string> => {
    if (!minigameStats) return {};

    const reconstructed: Record<string, string> = {};

    // 각 카테고리별로 순회
    for (const [category, order] of Object.entries(GAME_ORDER)) {
        let reachedGameId = order[0]; // 기본적으로 첫 번째 게임은 항상 해금

        // 순서대로 확인하며 해금 조건 충족 시 다음 단계로 진행
        for (let i = 0; i < order.length; i++) {
            const gameId = order[i];
            const stats = minigameStats[gameId];

            // 현재 게임의 도달 기록 갱신
            // (주의: 여기서는 "해금된" 상태가 아니라 "실제 플레이하여 도달한" 상태를 추적해야 함)
            // 하지만 시스템상 "도달했다"는 "이 게임을 해금했다"와 동일한 포인터로 사용됨.

            // 로직:
            // "내가 지금 gameId를 깰 자격이 있는가?" -> No.
            // categoryProgress의 의미: "내가 열어놓은 가장 높은 단계의 게임 ID"

            // 따라서, i번째 게임을 "클리어(마스터)" 했다면, i+1번째 게임이 "Reached" 된 것임.

            if (!stats) break; // 플레이 기록 끊기면 중단

            // 조건 확인: Genius 모드는 10회 플레이, 나머지는 마스터리?
            // 단순화: 일단 플레이 기록이 있으면 그 다음 게임도 열려있다고 가정할 수 있나?
            // 아니면 정확히 조건을 따져야 하나?
            // -> 정확히 따져야 함.

            // Genius 모드 하드코딩 (TODO: GameManifest로 확인하면 더 좋음)
            const isGenius = category.includes('genius');

            let unlockedNext = false;
            if (isGenius) {
                // Genius Rules: 10 clears
                if (stats.playCount >= 10) unlockedNext = true;
            } else {
                // Adventure Rules: Use shared Mastery Logic
                if (isMasteryUnlockReady(stats)) unlockedNext = true;
            }

            if (unlockedNext) {
                // 다음 게임이 존재하면 그 게임을 Reached로 설정
                if (i + 1 < order.length) {
                    reachedGameId = order[i + 1];
                }
            } else {
                // 끊김
                break;
            }
        }

        reconstructed[category] = reachedGameId;
    }

    return reconstructed;
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
