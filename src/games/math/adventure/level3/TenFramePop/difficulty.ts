export const DIFFICULTY_1 = 1 as const;
export const DIFFICULTY_2 = 2 as const;

export type DifficultyLevel = typeof DIFFICULTY_1 | typeof DIFFICULTY_2;

export interface DifficultyProgress {
    level: DifficultyLevel;
    diff1ConsecutiveCorrect: number;
    diff1CumulativeCorrect: number;
    diff2ConsecutiveWrong: number;
}

export const createInitialDifficultyProgress = (): DifficultyProgress => ({
    level: DIFFICULTY_1,
    diff1ConsecutiveCorrect: 0,
    diff1CumulativeCorrect: 0,
    diff2ConsecutiveWrong: 0
});

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pickNextNForDifficulty = (level: DifficultyLevel, previousN: number | null): number => {
    const min = level === DIFFICULTY_1 ? 1 : 3;
    const max = level === DIFFICULTY_1 ? 5 : 9;
    const nextN = randInt(min, max);
    if (previousN == null || nextN !== previousN) return nextN;

    const candidates: number[] = [];
    for (let value = min; value <= max; value += 1) {
        if (value !== previousN) candidates.push(value);
    }
    return candidates[randInt(0, candidates.length - 1)];
};

export const applyDifficultyByAnswer = (
    progress: DifficultyProgress,
    isCorrect: boolean
): DifficultyProgress => {
    if (isCorrect) {
        if (progress.level === DIFFICULTY_1) {
            const nextConsecutive = progress.diff1ConsecutiveCorrect + 1;
            const nextCumulative = progress.diff1CumulativeCorrect + 1;
            const promoteToDifficulty2 = nextConsecutive >= 3 || nextCumulative >= 4;
            if (promoteToDifficulty2) {
                return {
                    level: DIFFICULTY_2,
                    diff1ConsecutiveCorrect: 0,
                    diff1CumulativeCorrect: 0,
                    diff2ConsecutiveWrong: 0
                };
            }
            return {
                ...progress,
                diff1ConsecutiveCorrect: nextConsecutive,
                diff1CumulativeCorrect: nextCumulative,
                diff2ConsecutiveWrong: 0
            };
        }
        return {
            ...progress,
            diff2ConsecutiveWrong: 0
        };
    }

    if (progress.level === DIFFICULTY_2) {
        const nextConsecutiveWrong = progress.diff2ConsecutiveWrong + 1;
        if (nextConsecutiveWrong >= 2) {
            return createInitialDifficultyProgress();
        }
        return {
            ...progress,
            diff2ConsecutiveWrong: nextConsecutiveWrong
        };
    }

    return {
        ...progress,
        diff1ConsecutiveCorrect: 0,
        diff2ConsecutiveWrong: 0
    };
};
