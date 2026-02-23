import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './ChipCashier.css';

interface ChipCashierProps {
    onExit: () => void;
}

type BundleSize = 5 | 10;
type CustomerMood = 'normal' | 'correct' | 'wrong';
type CustomerEmojiSet = {
    normal: string;
    correct: string;
    wrong: string;
};

interface Problem {
    bundleSize: BundleSize;
    multiplier: number;
    target: number;
}

interface FallingBundle {
    col: number;
}

const COLS = 5;
const DROP_MOVE_MS = 210;
const DROP_FALL_MS = 230;
const FEEDBACK_START_DELAY_MS = 220;
const NEXT_ROUND_DELAY_MS = 1750;
const POWERUP_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
const ANSWER_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const FALLBACK_PROBLEM: Problem = { bundleSize: 5, multiplier: 1, target: 5 };
const CUSTOMER_EMOJI_SETS: CustomerEmojiSet[] = [
    { normal: '💁', correct: '🙆', wrong: '🙅' },
    { normal: '💁🏻', correct: '🙆🏻', wrong: '🙅🏻' },
    { normal: '💁🏼', correct: '🙆🏼', wrong: '🙅🏼' },
    { normal: '💁🏽', correct: '🙆🏽', wrong: '🙅🏽' },
    { normal: '💁🏾', correct: '🙆🏾', wrong: '🙅🏾' },
    { normal: '💁🏿', correct: '🙆🏿', wrong: '🙅🏿' }
];
const CASHIER_EMOJIS = ['👩‍💼', '👩🏻‍💼', '👩🏼‍💼', '👩🏽‍💼', '👩🏾‍💼', '👩🏿‍💼'] as const;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const wait = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));
const pickRandomCustomerEmojiSet = (): CustomerEmojiSet => CUSTOMER_EMOJI_SETS[randomInt(0, CUSTOMER_EMOJI_SETS.length - 1)];
const pickRandomCashierEmoji = (): string => CASHIER_EMOJIS[randomInt(0, CASHIER_EMOJIS.length - 1)];

const createProblem = (excludeKey?: string): Problem => {
    let bundleSize: BundleSize = Math.random() < 0.5 ? 5 : 10;
    let multiplier = randomInt(1, 10);
    let key = `${bundleSize}x${multiplier}`;

    if (excludeKey) {
        let guard = 0;
        while (key === excludeKey && guard < 20) {
            bundleSize = Math.random() < 0.5 ? 5 : 10;
            multiplier = randomInt(1, 10);
            key = `${bundleSize}x${multiplier}`;
            guard += 1;
        }
    }

    return {
        bundleSize,
        multiplier,
        target: bundleSize * multiplier
    };
};

const ChipToken: React.FC<{ size: BundleSize }> = React.memo(({ size }) => (
    <div className={`chip-preview-token ${size === 10 ? 'is-ten' : 'is-five'}`} aria-hidden="true">
        <span className="chip-preview-token-core">{size}</span>
    </div>
));

export const ChipCashier: React.FC<ChipCashierProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 60, maxDifficulty: 1 });

    const [problem, setProblem] = React.useState<Problem | null>(null);
    const [selectedCount, setSelectedCount] = React.useState<number | null>(null);
    const [droppedCount, setDroppedCount] = React.useState(0);
    const [customerMood, setCustomerMood] = React.useState<CustomerMood>('normal');
    const [customerEmojiSet, setCustomerEmojiSet] = React.useState<CustomerEmojiSet>(() => pickRandomCustomerEmojiSet());
    const [cashierEmoji, setCashierEmoji] = React.useState<string>(() => pickRandomCashierEmoji());
    const [isCashierCasting, setIsCashierCasting] = React.useState(false);
    const [isDropping, setIsDropping] = React.useState(false);
    const [fallingBundle, setFallingBundle] = React.useState<FallingBundle | null>(null);

    const prevProblemKeyRef = React.useRef<string | null>(null);
    const prevGameStateRef = React.useRef(engine.gameState);
    const gameStateRef = React.useRef(engine.gameState);
    const roundTokenRef = React.useRef(0);
    const cashierAnimTimerRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (cashierAnimTimerRef.current !== null) {
                window.clearTimeout(cashierAnimTimerRef.current);
                cashierAnimTimerRef.current = null;
            }
        };
    }, []);

    const resetRoundUi = React.useCallback(() => {
        setSelectedCount(null);
        setDroppedCount(0);
        setCustomerMood('normal');
        setIsDropping(false);
        setFallingBundle(null);
    }, []);

    const generateNextProblem = React.useCallback(() => {
        roundTokenRef.current += 1;
        const next = createProblem(prevProblemKeyRef.current ?? undefined);
        prevProblemKeyRef.current = `${next.bundleSize}x${next.multiplier}`;
        resetRoundUi();
        setProblem(next);
    }, [resetRoundUi]);

    React.useEffect(() => {
        gameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover' || !problem)) {
            setCustomerEmojiSet(pickRandomCustomerEmojiSet());
            setCashierEmoji(pickRandomCashierEmoji());
            generateNextProblem();
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, generateNextProblem, problem]);

    const triggerAnswer = React.useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                engine.setPowerUps((prev) => ({ ...prev, [type]: prev[type] + 1 }));
            }
        }

        engine.submitAnswer(isCorrect);
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' });
    }, [engine]);

    const handleChooseCount = React.useCallback(async (count: number) => {
        if (!problem || gameStateRef.current !== 'playing' || isDropping) return;

        if (cashierAnimTimerRef.current !== null) {
            window.clearTimeout(cashierAnimTimerRef.current);
        }
        setIsCashierCasting(true);
        cashierAnimTimerRef.current = window.setTimeout(() => {
            setIsCashierCasting(false);
            cashierAnimTimerRef.current = null;
        }, 260);

        const token = roundTokenRef.current + 1;
        roundTokenRef.current = token;

        setSelectedCount(count);
        setDroppedCount(0);
        setCustomerMood('normal');
        setIsDropping(true);

        for (let i = 0; i < count; i += 1) {
            if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;

            const col = i % COLS;
            await wait(DROP_MOVE_MS);
            if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;

            setFallingBundle({ col });
            await wait(DROP_FALL_MS);
            if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;

            setFallingBundle(null);
            setDroppedCount(i + 1);
        }

        if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;

        const isCorrect = count === problem.multiplier;
        setCustomerMood(isCorrect ? 'correct' : 'wrong');

        await wait(FEEDBACK_START_DELAY_MS);
        if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;

        triggerAnswer(isCorrect);

        if (isCorrect) {
            await wait(NEXT_ROUND_DELAY_MS);
            if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;
            generateNextProblem();
            return;
        }

        await wait(NEXT_ROUND_DELAY_MS);
        if (gameStateRef.current !== 'playing' || roundTokenRef.current !== token) return;
        resetRoundUi();
    }, [generateNextProblem, isDropping, problem, resetRoundUi, triggerAnswer]);

    const customerEmoji = React.useMemo(() => (
        customerMood === 'correct'
            ? customerEmojiSet.correct
            : customerMood === 'wrong'
                ? customerEmojiSet.wrong
                : customerEmojiSet.normal
    ), [customerEmojiSet, customerMood]);

    const displayProblem: Problem = problem ?? FALLBACK_PROBLEM;
    const droppedIndices = React.useMemo(
        () => Array.from({ length: droppedCount }, (_, idx) => idx),
        [droppedCount]
    );
    const canSelectAnswer = engine.gameState === 'playing' && !isDropping && !!problem;

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.chip-cashier.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.chip-cashier.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.chip-cashier.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const instructions = React.useMemo(() => ([
        {
            icon: '🙋',
            title: t('games.chip-cashier.howToPlay.step1.title'),
            description: t('games.chip-cashier.howToPlay.step1.description')
        },
        {
            icon: '🪙',
            title: t('games.chip-cashier.howToPlay.step2.title'),
            description: t('games.chip-cashier.howToPlay.step2.description')
        },
        {
            icon: '👆',
            title: t('games.chip-cashier.howToPlay.step3.title'),
            description: t('games.chip-cashier.howToPlay.step3.description')
        }
    ]), [t]);

    return (
        <Layout2
            gameId={GameIds.MATH_CHIP_CASHIER}
            title={t('games.chip-cashier.title')}
            subtitle={t('games.chip-cashier.subtitle')}
            description={t('games.chip-cashier.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            className="chip-cashier-layout2"
            cardBackground={<div className="chip-cashier-card-bg" />}
        >
            <div className="chip-cashier-shell">
                    <section className="chip-top-panel">
                        <div className="chip-speech-bubble">
                            <div className="chip-speech-value">{t('games.chip-cashier.ui.customerRequest', { target: displayProblem.target })}</div>
                        </div>
                        <div className={`chip-customer ${customerMood !== 'normal' ? 'is-reacting' : ''}`} aria-live="polite">{customerEmoji}</div>
                    </section>

                    <section className="chip-middle-panel">
                        <div className="chip-preview-panel">
                            <div className="chip-preview-card">
                                <div className="chip-preview-sign">{t('games.chip-cashier.ui.coinLabel')}</div>
                                <div
                                    className="chip-preview-token-wrap"
                                    aria-label={t('games.chip-cashier.ui.bundleAria', { size: displayProblem.bundleSize })}
                                >
                                    <ChipToken size={displayProblem.bundleSize} />
                                </div>
                            </div>
                        </div>

                        <div className="chip-drop-panel">
                            {fallingBundle && (
                                <div
                                    className="chip-falling-bundle"
                                    style={{ '--fall-col': fallingBundle.col } as React.CSSProperties}
                                    aria-hidden="true"
                                >
                                    <ChipToken size={displayProblem.bundleSize} />
                                </div>
                            )}

                            <div className="chip-drop-field" aria-label={t('games.chip-cashier.ui.dropZone')}>
                                {droppedIndices.map((idx) => (
                                    <div key={`dropped-${idx}`} className="chip-dropped-bundle">
                                        <ChipToken size={displayProblem.bundleSize} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="chip-bottom-panel">
                        <div className="chip-cashier-panel">
                            <div className={`chip-cashier-emoji ${isCashierCasting ? 'is-casting' : ''}`} aria-hidden="true">{cashierEmoji}</div>
                            <div className="chip-cashier-desk" />
                        </div>

                        <div className="chip-buttons-panel">
                            <div className="chip-buttons-grid" role="group" aria-label={t('games.chip-cashier.ui.chooseCount')}>
                                {ANSWER_VALUES.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`chip-answer-btn ${selectedCount === value ? 'is-selected' : ''}`}
                                        onClick={() => { void handleChooseCount(value); }}
                                        disabled={!canSelectAnswer}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
            </div>
        </Layout2>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_CHIP_CASHIER,
    title: '코인 캐셔',
    titleKey: 'games.chip-cashier.title',
    subtitle: '5단 · 10단 마스터',
    subtitleKey: 'games.chip-cashier.subtitle',
    description: '칩 묶음을 골라 목표 수를 맞추세요.',
    descriptionKey: 'games.chip-cashier.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: ChipCashier,
    thumbnail: '🪙',
    tagsKey: 'games.tags.multiplication'
};
