const ALL_OPTION_VALUES = Array.from({ length: 90 }, (_, index) => index + 1);

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(arr: T[]) => {
    const next = [...arr];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = randInt(0, index);
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
    return next;
};

const unique = (arr: number[]) => Array.from(new Set(arr));
const tensDigit = (value: number) => Math.floor(value / 10);

const pick = (
    pool: number[],
    used: Set<number>,
    predicate: (value: number) => boolean = () => true
): number | null => {
    for (const value of pool) {
        if (!used.has(value) && predicate(value)) {
            used.add(value);
            return value;
        }
    }
    return null;
};

export const buildOptions = (n: number) => {
    const correct = 9 * n;
    const correctTens = tensDigit(correct);
    const allCandidates = ALL_OPTION_VALUES.filter((value) => value !== correct);

    const confusers = unique([
        10 * n,
        n,
        9 * (n - 1),
        9 * (n + 1),
        8 * n,
        11 * n,
        correct - 1,
        correct + 1,
        correct - 9,
        correct + 9,
        correct - 10,
        correct + 10,
        correct - 11,
        correct + 11
    ]).filter((value) => value > 0 && value <= 90 && value !== correct);

    const sameTensAll = allCandidates.filter((value) => tensDigit(value) === correctTens);
    const diffTensAll = allCandidates.filter((value) => tensDigit(value) !== correctTens);

    const sameTensPool = unique([
        ...shuffle(confusers.filter((value) => tensDigit(value) === correctTens)),
        ...shuffle(sameTensAll)
    ]);
    const diffTensPool = unique([
        ...shuffle(confusers.filter((value) => tensDigit(value) !== correctTens)),
        ...shuffle(diffTensAll)
    ]);

    const used = new Set<number>();
    const wrongs: number[] = [];
    const pattern = randInt(1, 5);

    if (pattern === 1) {
        const a = pick(sameTensPool, used);
        const b = pick(diffTensPool, used);
        if (a != null) wrongs.push(a);
        if (b != null) wrongs.push(b);
    } else if (pattern === 2) {
        const a = pick(diffTensPool, used);
        if (a != null) wrongs.push(a);
        const aTens = a != null ? tensDigit(a) : -1;
        const b = pick(diffTensPool, used, (value) => tensDigit(value) !== aTens);
        if (b != null) wrongs.push(b);
    } else if (pattern === 3) {
        const a = pick(sameTensPool, used);
        const b = pick(sameTensPool, used);
        if (a != null) wrongs.push(a);
        if (b != null) wrongs.push(b);
    } else if (pattern === 4) {
        const a = pick(diffTensPool, used);
        if (a != null) wrongs.push(a);
        const targetTens = a != null ? tensDigit(a) : -1;
        const b = pick(diffTensPool, used, (value) => tensDigit(value) === targetTens);
        if (b != null) wrongs.push(b);
    } else {
        const mixedPool = unique([...shuffle(confusers), ...shuffle(allCandidates)]);
        const a = pick(mixedPool, used);
        const b = pick(mixedPool, used);
        if (a != null) wrongs.push(a);
        if (b != null) wrongs.push(b);
    }

    const fallbackPool = unique([...shuffle(confusers), ...shuffle(allCandidates)]);
    while (wrongs.length < 2) {
        const fallback = pick(fallbackPool, used);
        if (fallback == null) break;
        wrongs.push(fallback);
    }

    return shuffle([correct, ...wrongs.slice(0, 2)]);
};
