/**
 * Game Order Constants
 * 카테고리별 게임 순서 정의 - 해금 판정에 사용
 * 
 * 중요: 신규 게임 추가 시 해당 카테고리 배열의 원하는 위치에 삽입하면 됩니다.
 * 기존 사용자의 진행도는 "도달한 게임 ID"로 저장되므로 순서 변경에도 자동 대응됩니다.
 */

// Math Adventure (Level 1 → Level 2 순차)
export const MATH_ADVENTURE_ORDER = [
    // Level 1
    'math-fishing-count',
    'math-round-counting',
    'math-number-hive',
    'math-number-balance',
    'math-fruit-slice',
    'math-archery',
    // Level 2
    'ten-frame-count',
    'pinwheel-pop',
    'deep-sea-dive',
    'math-level2-ufo-invasion',
] as const;

// Math Genius (Addition → Subtraction 순차)
export const MATH_GENIUS_ORDER = [
    'front-addition-lv1',
    'front-addition-lv2',
    'front-addition-lv3',
    'front-addition-lv4',
    'front-subtraction-lv1',
    'front-subtraction-lv2',
    'front-subtraction-lv3',
    'front-subtraction-lv4',
] as const;

// Brain Adventure (Level 1 → Level 2 순차)
export const BRAIN_ADVENTURE_ORDER = [
    // Level 1
    'color-link',
    'pair-up-twin',
    'maze-escape',
    // Level 2
    'wild-link',
    'animal-banquet',
    'pair-up-connect',
    'maze-hunter',
    'signal-hunter',
    // Level 3
    'tic-tac-toe',
    'brain-omok',
] as const;

// 카테고리 키 타입
export type ProgressionCategory = 'math-adventure' | 'math-genius' | 'brain-adventure';

// 통합 순서 맵
export const GAME_ORDER: Record<ProgressionCategory, readonly string[]> = {
    'math-adventure': MATH_ADVENTURE_ORDER,
    'math-genius': MATH_GENIUS_ORDER,
    'brain-adventure': BRAIN_ADVENTURE_ORDER,
};

/**
 * 게임 ID로 카테고리 찾기
 */
export const getProgressionCategory = (gameId: string): ProgressionCategory | null => {
    for (const [category, order] of Object.entries(GAME_ORDER)) {
        if (order.includes(gameId)) {
            return category as ProgressionCategory;
        }
    }
    return null;
};

/**
 * 게임의 순서 인덱스 가져오기
 */
export const getGameOrderIndex = (gameId: string): number => {
    const category = getProgressionCategory(gameId);
    if (!category) return -1;
    return GAME_ORDER[category].indexOf(gameId);
};
