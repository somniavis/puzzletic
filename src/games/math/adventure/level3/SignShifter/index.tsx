import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import './SignShifter.css';

interface SignShifterProps {
    onExit: () => void;
}

type CubeState = 'division' | 'equals';
type DifficultyLevel = 1 | 2 | 3;
type BearId = 'main' | 'small';
type BearDodgeDirection = 'left' | 'right';
type SignRound = {
    dividend: number;
    divisor: number;
    answer: number;
    choices: number[];
};
type AnswerFeedback = {
    kind: 'correct' | 'wrong';
    value: number;
} | null;
type PowerUpType = 'timeFreeze' | 'extraLife' | 'doubleScore';

const DIVISOR_RANGES: Record<DifficultyLevel, number[]> = {
    1: [2, 3],
    2: [3, 4, 5, 6],
    3: [5, 6, 7, 8, 9]
};

const CUBE_UNLOCK_HITS = 3;
const SNOWFLAKE_COUNT = 10;
const ROUND_ANSWERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const REWARD_TYPES: PowerUpType[] = ['timeFreeze', 'extraLife', 'doubleScore'];
const FEEDBACK_HOLD_MS = 700;

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(items: T[]): T[] => {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const createChoices = (answer: number): number[] => {
    const pool = new Set<number>([answer]);
    while (pool.size < 3) {
        const offset = randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1);
        const candidate = Math.max(1, Math.min(9, answer + offset));
        pool.add(candidate);
    }
    return shuffle(Array.from(pool));
};

const getRoundSignature = (round: Pick<SignRound, 'dividend' | 'divisor' | 'answer'>): string =>
    `${round.dividend}/${round.divisor}=${round.answer}`;

const createRoundCandidates = (difficulty: DifficultyLevel): Pick<SignRound, 'dividend' | 'divisor' | 'answer'>[] => {
    const candidates: Pick<SignRound, 'dividend' | 'divisor' | 'answer'>[] = [];
    DIVISOR_RANGES[difficulty].forEach((divisor) => {
        ROUND_ANSWERS.forEach((answer) => {
            candidates.push({
                divisor,
                answer,
                dividend: divisor * answer
            });
        });
    });
    return candidates;
};

const createRound = (difficulty: DifficultyLevel, previousSignature?: string | null): SignRound => {
    const candidates = createRoundCandidates(difficulty);
    const availableCandidates = previousSignature
        ? candidates.filter((candidate) => getRoundSignature(candidate) !== previousSignature)
        : candidates;
    const candidatePool = availableCandidates.length > 0 ? availableCandidates : candidates;
    const selected = candidatePool[randInt(0, candidatePool.length - 1)];

    return {
        ...selected,
        choices: createChoices(selected.answer)
    };
};

export const SignShifter: React.FC<SignShifterProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 3 });
    const [difficultyLevel, setDifficultyLevel] = React.useState<DifficultyLevel>(1);
    const [consecutiveCorrect, setConsecutiveCorrect] = React.useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = React.useState(0);
    const [correctCountInLevel, setCorrectCountInLevel] = React.useState(0);
    const [divisionHits, setDivisionHits] = React.useState(0);
    const [equalsHits, setEqualsHits] = React.useState(0);
    const [round, setRound] = React.useState<SignRound>(() => createRound(1));
    const [pressingChoice, setPressingChoice] = React.useState<number | null>(null);
    const [answerFeedback, setAnswerFeedback] = React.useState<AnswerFeedback>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [bearDodges, setBearDodges] = React.useState<Partial<Record<BearId, BearDodgeDirection>>>({});
    const resolveTimerRef = React.useRef<number | null>(null);
    const bearDodgeTimersRef = React.useRef<Partial<Record<BearId, number>>>({});
    const previousRoundSignatureRef = React.useRef<string | null>(null);

    const resetCubes = React.useCallback(() => {
        setDivisionHits(0);
        setEqualsHits(0);
        setPressingChoice(null);
        setAnswerFeedback(null);
        setIsResolving(false);
    }, []);

    const setupRound = React.useCallback((nextDifficulty: DifficultyLevel) => {
        resetCubes();
        const nextRound = createRound(nextDifficulty, previousRoundSignatureRef.current);
        previousRoundSignatureRef.current = getRoundSignature(nextRound);
        setRound(nextRound);
    }, [resetCubes]);

    const layoutEngine = React.useMemo(
        () => ({
            ...engine,
            onExit,
            difficultyLevel,
            maxLevel: 3
        }),
        [difficultyLevel, engine, onExit]
    );

    React.useEffect(() => {
        if (engine.gameState === 'playing') {
            previousRoundSignatureRef.current = null;
            setDifficultyLevel(1);
            setConsecutiveCorrect(0);
            setConsecutiveWrong(0);
            setCorrectCountInLevel(0);
            setupRound(1);
        }
    }, [engine.gameState, setupRound]);

    React.useEffect(
        () => () => {
            if (resolveTimerRef.current != null) {
                window.clearTimeout(resolveTimerRef.current);
                resolveTimerRef.current = null;
            }
            (['main', 'small'] as BearId[]).forEach((bearId) => {
                const timer = bearDodgeTimersRef.current[bearId];
                if (timer != null) window.clearTimeout(timer);
            });
            bearDodgeTimersRef.current = {};
        },
        []
    );

    const isAnswerOpen = divisionHits >= CUBE_UNLOCK_HITS && equalsHits >= CUBE_UNLOCK_HITS;

    const renderCubeSymbol = React.useCallback((cube: CubeState) => {
        if (cube === 'division') return divisionHits >= CUBE_UNLOCK_HITS ? '=' : '÷';
        return equalsHits >= CUBE_UNLOCK_HITS ? '×' : '=';
    }, [divisionHits, equalsHits]);

    const handleCubeTap = React.useCallback((cube: CubeState) => {
        if (engine.gameState !== 'playing' || isResolving) return;

        if (cube === 'division') {
            setDivisionHits((prev) => Math.min(prev + 1, CUBE_UNLOCK_HITS));
            return;
        }

        setEqualsHits((prev) => Math.min(prev + 1, CUBE_UNLOCK_HITS));
    }, [engine.gameState, isResolving]);

    const handleChoicePointerDown = React.useCallback((value: number) => {
        if (!isAnswerOpen || engine.gameState !== 'playing' || isResolving) return;
        setPressingChoice(value);
    }, [engine.gameState, isAnswerOpen, isResolving]);

    const clearPressingChoice = React.useCallback(() => setPressingChoice(null), []);

    const handleBearTap = React.useCallback((bearId: BearId) => {
        const direction: BearDodgeDirection = Math.random() < 0.5 ? 'left' : 'right';

        const existingTimer = bearDodgeTimersRef.current[bearId];
        if (existingTimer != null) {
            window.clearTimeout(existingTimer);
        }

        setBearDodges((prev) => ({ ...prev, [bearId]: direction }));
        bearDodgeTimersRef.current[bearId] = window.setTimeout(() => {
            setBearDodges((prev) => {
                const next = { ...prev };
                delete next[bearId];
                return next;
            });
            delete bearDodgeTimersRef.current[bearId];
        }, 360);
    }, []);

    const handleChoiceClick = React.useCallback((value: number, buttonEl?: HTMLButtonElement | null) => {
        if (!isAnswerOpen || engine.gameState !== 'playing' || isResolving) return;

        buttonEl?.blur();
        setPressingChoice(null);
        setIsResolving(true);

        const isCorrect = value === round.answer;
        setAnswerFeedback({ kind: isCorrect ? 'correct' : 'wrong', value });

        if (isCorrect) {
            const nextConsecutiveCorrect = consecutiveCorrect + 1;
            const nextCorrectCountInLevel = correctCountInLevel + 1;
            const shouldPromote =
                difficultyLevel < 3 &&
                (nextConsecutiveCorrect >= 3 || nextCorrectCountInLevel >= 4);
            const nextDifficulty = shouldPromote ? ((difficultyLevel + 1) as DifficultyLevel) : difficultyLevel;

            setConsecutiveWrong(0);
            if (shouldPromote) {
                setDifficultyLevel(nextDifficulty);
                setConsecutiveCorrect(0);
                setCorrectCountInLevel(0);
            } else {
                setConsecutiveCorrect(nextConsecutiveCorrect);
                setCorrectCountInLevel(nextCorrectCountInLevel);
            }

            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const reward = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
                engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
            }

            engine.submitAnswer(true, { skipFeedback: true, skipDifficulty: true });
            engine.registerEvent({ type: 'correct', isFinal: true });

            resolveTimerRef.current = window.setTimeout(() => {
                setupRound(nextDifficulty);
                resolveTimerRef.current = null;
            }, FEEDBACK_HOLD_MS);
            return;
        }

        const nextConsecutiveWrong = consecutiveWrong + 1;
        const shouldDemote = difficultyLevel > 1 && nextConsecutiveWrong >= 2;
        const nextDifficulty = shouldDemote ? ((difficultyLevel - 1) as DifficultyLevel) : difficultyLevel;
        const isLastLife = engine.lives <= 1;

        setConsecutiveCorrect(0);
        if (shouldDemote) {
            setDifficultyLevel(nextDifficulty);
            setConsecutiveWrong(0);
            setCorrectCountInLevel(0);
        } else {
            setConsecutiveWrong(nextConsecutiveWrong);
        }

        engine.submitAnswer(false, { skipFeedback: true });
        engine.registerEvent({ type: 'wrong' });

        resolveTimerRef.current = window.setTimeout(() => {
            if (isLastLife) {
                resolveTimerRef.current = null;
                return;
            }
            setAnswerFeedback(null);
            setIsResolving(false);
            resolveTimerRef.current = null;
        }, FEEDBACK_HOLD_MS);
    }, [
        consecutiveCorrect,
        consecutiveWrong,
        correctCountInLevel,
        difficultyLevel,
        engine,
        isAnswerOpen,
        isResolving,
        round.answer,
        setupRound
    ]);

    const instructions = React.useMemo(
        () => [
            { icon: '🔎', title: t('games.sign-shifter.howToPlay.step1.title'), description: t('games.sign-shifter.howToPlay.step1.description') },
            { icon: '🧊', title: t('games.sign-shifter.howToPlay.step2.title'), description: t('games.sign-shifter.howToPlay.step2.description') },
            { icon: '✅', title: t('games.sign-shifter.howToPlay.step3.title'), description: t('games.sign-shifter.howToPlay.step3.description') }
        ],
        [t]
    );

    const powerUps = React.useMemo<PowerUpBtnProps[]>(
        () => [
            {
                count: engine.powerUps.timeFreeze,
                color: 'blue',
                icon: '❄️',
                title: t('games.sign-shifter.powerups.timeFreeze'),
                onClick: () => engine.activatePowerUp('timeFreeze'),
                disabledConfig: engine.isTimeFrozen,
                status: engine.isTimeFrozen ? 'active' : 'normal'
            },
            {
                count: engine.powerUps.extraLife,
                color: 'red',
                icon: '❤️',
                title: t('games.sign-shifter.powerups.extraLife'),
                onClick: () => engine.activatePowerUp('extraLife'),
                disabledConfig: engine.lives >= 3,
                status: engine.lives >= 3 ? 'maxed' : 'normal'
            },
            {
                count: engine.powerUps.doubleScore,
                color: 'yellow',
                icon: '⚡',
                title: t('games.sign-shifter.powerups.doubleScore'),
                onClick: () => engine.activatePowerUp('doubleScore'),
                disabledConfig: engine.isDoubleScore,
                status: engine.isDoubleScore ? 'active' : 'normal'
            }
        ],
        [engine, t]
    );

    return (
        <Layout3
            title={t('games.sign-shifter.title')}
            subtitle={t('games.sign-shifter.subtitle')}
            description={t('games.sign-shifter.description')}
            gameId={GameIds.MATH_SIGN_SHIFTER}
            engine={layoutEngine}
            powerUps={powerUps}
            cardBackground={<div className="sign-shifter-card-bg" />}
            instructions={instructions}
            onExit={onExit}
            className="sign-shifter-theme"
        >
            <div className="sign-shifter-playfield">
                <section className="sign-shifter-mid">
                    <div className="sign-shifter-ground">
                        <div className="sign-shifter-snow-scene" aria-hidden="true">
                            <div className="sign-shifter-snowfall">
                                {Array.from({ length: SNOWFLAKE_COUNT }).map((_, index) => (
                                    <span
                                        key={`snowflake-${index}`}
                                        className={`sign-shifter-snowflake snowflake-${index + 1}`}
                                    >
                                        ❄️
                                    </span>
                                ))}
                            </div>
                            <div className="sign-shifter-mountain-range">
                                <span className="sign-shifter-snow-mountain mountain-back" />
                                <span className="sign-shifter-snow-mountain mountain-left" />
                                <span className="sign-shifter-snow-mountain mountain-mid" />
                                <span className="sign-shifter-snow-mountain mountain-front" />
                            </div>
                        </div>
                        <div className="sign-shifter-equation-wrap" aria-label="sign-shifter-equation">
                            <div className="sign-shifter-equation">
                                <span className="sign-shifter-token sign-shifter-number">{round.dividend}</span>
                                <button
                                    type="button"
                                    className={`sign-shifter-ice-cube hit-${Math.min(divisionHits, CUBE_UNLOCK_HITS)} ${divisionHits >= CUBE_UNLOCK_HITS ? 'is-broken' : ''}`}
                                    aria-label="locked division sign"
                                    onClick={() => handleCubeTap('division')}
                                >
                                    <span className="sign-shifter-ice-cube__core">{renderCubeSymbol('division')}</span>
                                    <span className="sign-shifter-ice-cube__shine" aria-hidden="true" />
                                    <span className="sign-shifter-ice-cube__crack crack-a" aria-hidden="true" />
                                    <span className="sign-shifter-ice-cube__crack crack-b" aria-hidden="true" />
                                    <span className="sign-shifter-ice-cube__crack crack-c" aria-hidden="true" />
                                </button>
                                <span className="sign-shifter-token sign-shifter-number">{round.divisor}</span>
                                <button
                                    type="button"
                                    className={`sign-shifter-ice-cube hit-${Math.min(equalsHits, CUBE_UNLOCK_HITS)} ${equalsHits >= CUBE_UNLOCK_HITS ? 'is-broken' : ''}`}
                                    aria-label="locked equals sign"
                                    onClick={() => handleCubeTap('equals')}
                                >
                                    <span className="sign-shifter-ice-cube__core">{renderCubeSymbol('equals')}</span>
                                    <span className="sign-shifter-ice-cube__shine" aria-hidden="true" />
                                    <span className="sign-shifter-ice-cube__crack crack-a" aria-hidden="true" />
                                    <span className="sign-shifter-ice-cube__crack crack-b" aria-hidden="true" />
                                    <span className="sign-shifter-ice-cube__crack crack-c" aria-hidden="true" />
                                </button>
                                <span
                                    className={`sign-shifter-answer-box ${answerFeedback ? `is-${answerFeedback.kind}` : ''}`}
                                >
                                    {answerFeedback ? answerFeedback.value : '?'}
                                </span>
                            </div>
                        </div>
                        <div className="sign-shifter-polar-bears">
                            <button
                                type="button"
                                className={`sign-shifter-polar-bear bear-main ${bearDodges.main ? `is-dodge-${bearDodges.main}` : ''}`}
                                aria-label="polar bear"
                                onClick={() => handleBearTap('main')}
                            >
                                <div className="sign-shifter-polar-bear__dodge">
                                    <div className="sign-shifter-polar-bear__float">
                                        <span className="sign-shifter-polar-bear__face">🐻‍❄️</span>
                                        <span className="sign-shifter-polar-bear__body" />
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`sign-shifter-polar-bear bear-small ${bearDodges.small ? `is-dodge-${bearDodges.small}` : ''}`}
                                aria-label="small polar bear"
                                onClick={() => handleBearTap('small')}
                            >
                                <div className="sign-shifter-polar-bear__dodge">
                                    <div className="sign-shifter-polar-bear__float">
                                        <span className="sign-shifter-polar-bear__face">🐻‍❄️</span>
                                        <span className="sign-shifter-polar-bear__body" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="sign-shifter-bottom">
                    {isAnswerOpen && (
                        <div className="sign-shifter-answer-panel is-visible">
                            <p className="sign-shifter-question">{t('games.sign-shifter.question')}</p>
                            <div className="sign-shifter-options">
                                {round.choices.map((choice) => (
                                    <button
                                        key={`choice-${choice}`}
                                        type="button"
                                        className={`sign-shifter-option-btn ${pressingChoice === choice ? 'is-pressing' : ''}`}
                                        disabled={engine.gameState !== 'playing' || isResolving}
                                        onPointerDown={() => handleChoicePointerDown(choice)}
                                        onPointerUp={clearPressingChoice}
                                        onPointerCancel={clearPressingChoice}
                                        onPointerLeave={clearPressingChoice}
                                        onClick={(event) => handleChoiceClick(choice, event.currentTarget)}
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Layout3>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_SIGN_SHIFTER,
    title: 'Sign Shifter',
    titleKey: 'games.sign-shifter.title',
    subtitle: 'Turn ÷ into ×!',
    subtitleKey: 'games.sign-shifter.subtitle',
    description: 'Break the ice signs and choose the missing number.',
    descriptionKey: 'games.sign-shifter.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: SignShifter,
    thumbnail: '÷',
    tagsKey: 'games.tags.division'
};
