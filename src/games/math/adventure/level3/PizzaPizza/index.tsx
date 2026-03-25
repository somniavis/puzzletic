import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import './PizzaPizza.css';

interface PizzaPizzaProps {
    onExit: () => void;
}

const ANIMALS = ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐯', '🦁'] as const;
const PIZZA_TYPES = ['pepperoni', 'cheese', 'veggie'] as const;
const VALID_ROUNDS = [
    { friendCount: 2, sliceCount: 4 },
    { friendCount: 4, sliceCount: 4 },
    { friendCount: 2, sliceCount: 6 },
    { friendCount: 3, sliceCount: 6 },
    { friendCount: 2, sliceCount: 8 },
    { friendCount: 4, sliceCount: 8 },
    { friendCount: 3, sliceCount: 9 },
    { friendCount: 2, sliceCount: 10 },
    { friendCount: 5, sliceCount: 10 }
] as const;
const ROUND_ADVANCE_MS = 1450;
const FAILURE_RESET_MS = 760;
const RESULT_REVEAL_MS = 260;
const POWER_UP_REWARD_TYPES = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
const PIZZA_EMOJI_TIP_OFFSET = 90;
const PIZZA_EMOJI_BASE_ROTATION = 25;
const ANIMAL_BODY_TONES = {
    '🐶': { base: '#e8c59b', shade: '#c99969' },
    '🐱': { base: '#f6d59b', shade: '#e1ad67' },
    '🐰': { base: '#f7eff6', shade: '#e2d3df' },
    '🐻': { base: '#d6b08a', shade: '#b48358' },
    '🐼': { base: '#ececec', shade: '#cccccc' },
    '🦊': { base: '#f7c08a', shade: '#e08a4f' },
    '🐯': { base: '#ffc67d', shade: '#e39a4f' },
    '🦁': { base: '#f2c77f', shade: '#d89d52' }
} as const;
const DEFAULT_ANIMAL_BODY_TONE = { base: '#f8efdf', shade: '#eadac2' } as const;

type PizzaRound = {
    id: string;
    friendCount: number;
    sliceCount: number;
    pizzaType: (typeof PIZZA_TYPES)[number];
    animals: string[];
};

type AnimalBodyTone = {
    base: string;
    shade: string;
};

type SliceDisplayPosition = {
    x: string;
    y: string;
    rotate: number;
    scale?: number;
};

type PlateDisplayPosition = {
    x: string;
    y: string;
    width: string;
    height: string;
};

type GroupedLayoutMetrics = {
    columnCount: number;
    rowCount: number;
    columnGap: number;
    rowGap: number;
    startX: number;
    startY: number;
    totalHeight: number;
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(items: readonly T[]) => {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const rotatePizzaByTip = (tipAngle: number) =>
    tipAngle + PIZZA_EMOJI_TIP_OFFSET + PIZZA_EMOJI_BASE_ROTATION;

const getGroupedColumnGap = (columnCount: number) => {
    if (columnCount <= 2) {
        return 30;
    }

    if (columnCount === 3) {
        return 24.5;
    }

    if (columnCount === 4) {
        return 20.5;
    }

    return 18.2;
};

const getGroupedLayoutMetrics = (friendCount: number, slicesPerFriend: number): GroupedLayoutMetrics => {
    const rowCount = Math.max(1, slicesPerFriend);
    const columnCount = Math.max(1, friendCount);
    const columnGap = getGroupedColumnGap(columnCount);
    const rowGap = rowCount <= 3 ? 18 : 14.5;
    const totalWidth = (columnCount - 1) * columnGap;
    const totalHeight = (rowCount - 1) * rowGap;

    return {
        columnCount,
        rowCount,
        columnGap,
        rowGap,
        startX: 50 - totalWidth / 2,
        startY: 50 - totalHeight / 2,
        totalHeight
    };
};

const createCircleSlicePositions = (sliceCount: number): SliceDisplayPosition[] => {
    const angleStep = 360 / sliceCount;
    const normalizedCount = Math.min(Math.max(sliceCount, 4), 12);
    const radius = 14 + (normalizedCount - 4) * 0.52;
    const scale = 1.2 - (normalizedCount - 4) * 0.018;

    return Array.from({ length: sliceCount }, (_, index) => {
        const angle = -90 + angleStep * index;
        const radians = (angle * Math.PI) / 180;

        return {
            x: `${50 + Math.cos(radians) * radius}%`,
            y: `${50 + Math.sin(radians) * radius}%`,
            rotate: rotatePizzaByTip(angle),
            scale
        };
    });
};

const createGroupedSlicePositions = (
    sliceCount: number,
    layout: GroupedLayoutMetrics
): SliceDisplayPosition[] => {
    const { columnCount, columnGap, rowGap, startX, startY } = layout;
    return Array.from({ length: sliceCount }, (_, index) => {
        const row = Math.floor(index / columnCount);
        const column = index % columnCount;

        return {
            x: `${startX + column * columnGap}%`,
            y: `${startY + row * rowGap}%`,
            rotate: column % 2 === 0 ? -8 : 8,
            scale: 1.18
        };
    });
};

const createGroupedPlatePositions = (
    friendCount: number,
    layout: GroupedLayoutMetrics
): PlateDisplayPosition[] => {
    const { columnCount, rowCount, columnGap, startX, startY, totalHeight } = layout;
    const plateY = startY + totalHeight / 2;
    const widthScale = columnCount >= 5 ? 0.88 : columnCount === 4 ? 0.94 : 1;
    const heightScale = 0.92 + Math.max(0, rowCount - 1) * 0.34;
    const width = `calc(clamp(2.3rem, min(16cqw, 16cqh), 3.4rem) * ${widthScale})`;
    const height = `calc(clamp(5.2rem, min(36cqw, 36cqh), 8.4rem) * ${heightScale})`;

    return Array.from({ length: friendCount }, (_, index) => ({
        x: `${startX + index * columnGap}%`,
        y: `${plateY}%`,
        width,
        height
    }));
};

const getAnimalBodyTone = (animal: string): AnimalBodyTone =>
    ANIMAL_BODY_TONES[animal as keyof typeof ANIMAL_BODY_TONES] ?? DEFAULT_ANIMAL_BODY_TONE;

const createRound = (): PizzaRound => {
    const config = VALID_ROUNDS[randInt(0, VALID_ROUNDS.length - 1)];
    const animals = shuffle(ANIMALS).slice(0, config.friendCount);
    const pizzaType = PIZZA_TYPES[randInt(0, PIZZA_TYPES.length - 1)];

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        friendCount: config.friendCount,
        sliceCount: config.sliceCount,
        pizzaType,
        animals
    };
};

export const PizzaPizza: React.FC<PizzaPizzaProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 1 });
    const resolveTimerRef = React.useRef<number | null>(null);

    const [round, setRound] = React.useState<PizzaRound>(() => createRound());
    const [isResolving, setIsResolving] = React.useState(false);
    const [resolutionState, setResolutionState] = React.useState<'idle' | 'success' | 'fail'>('idle');
    const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);

    const instructions = React.useMemo(() => ([
        {
            icon: '🍕',
            title: t('games.pizza-pizza.howToPlay.step1.title'),
            description: t('games.pizza-pizza.howToPlay.step1.description')
        },
        {
            icon: '👀',
            title: t('games.pizza-pizza.howToPlay.step2.title'),
            description: t('games.pizza-pizza.howToPlay.step2.description')
        },
        {
            icon: '✂️',
            title: t('games.pizza-pizza.howToPlay.step3.title'),
            description: t('games.pizza-pizza.howToPlay.step3.description')
        }
    ]), [t]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.pizza-pizza.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.pizza-pizza.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.pizza-pizza.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const pizzaSlices = React.useMemo(
        () => Array.from({ length: round.sliceCount }, (_, index) => index),
        [round.sliceCount]
    );
    const correctChoiceValue = React.useMemo(
        () => round.sliceCount / round.friendCount,
        [round.friendCount, round.sliceCount]
    );
    const groupedLayoutMetrics = React.useMemo(() => {
        if (selectedChoice == null) {
            return null;
        }

        return getGroupedLayoutMetrics(round.friendCount, selectedChoice);
    }, [round.friendCount, selectedChoice]);

    const sliceDisplayPositions = React.useMemo(() => {
        if (groupedLayoutMetrics == null) {
            return createCircleSlicePositions(round.sliceCount);
        }

        return createGroupedSlicePositions(round.sliceCount, groupedLayoutMetrics);
    }, [groupedLayoutMetrics, round.sliceCount]);
    const groupedPlatePositions = React.useMemo(() => {
        if (groupedLayoutMetrics == null) {
            return [];
        }

        return createGroupedPlatePositions(round.friendCount, groupedLayoutMetrics);
    }, [groupedLayoutMetrics, round.friendCount]);

    const resetForNextRound = React.useCallback(() => {
        setRound(createRound());
        setIsResolving(false);
        setResolutionState('idle');
        setSelectedChoice(null);
    }, []);

    const clearResolveTimer = React.useCallback(() => {
        if (resolveTimerRef.current != null) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => () => {
        clearResolveTimer();
    }, [clearResolveTimer]);

    const maybeAwardComboPowerUp = React.useCallback((nextCombo: number) => {
        if (nextCombo > 0 && nextCombo % 3 === 0 && Math.random() > 0.45) {
            const reward = POWER_UP_REWARD_TYPES[Math.floor(Math.random() * POWER_UP_REWARD_TYPES.length)];
            engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
        }
    }, [engine]);

    const scheduleResolve = React.useCallback((callback: () => void, delayMs: number) => {
        clearResolveTimer();
        resolveTimerRef.current = window.setTimeout(() => {
            resolveTimerRef.current = null;
            callback();
        }, delayMs);
    }, [clearResolveTimer]);

    const finishWithResult = React.useCallback((isCorrect: boolean) => {
        setIsResolving(true);
        setResolutionState(isCorrect ? 'success' : 'fail');

        if (isCorrect) {
            maybeAwardComboPowerUp(engine.combo + 1);
            engine.registerEvent({ type: 'correct', isFinal: true });
            engine.updateScore(120);
            engine.updateCombo(true);
            scheduleResolve(() => {
                resetForNextRound();
            }, ROUND_ADVANCE_MS);
            return;
        }

        engine.registerEvent({ type: 'wrong' });
        engine.updateCombo(false);
        engine.updateLives(false);

        scheduleResolve(() => {
            if (engine.lives - 1 > 0) {
                resetForNextRound();
            }
        }, FAILURE_RESET_MS);
    }, [engine, maybeAwardComboPowerUp, resetForNextRound, scheduleResolve]);

    const bubbleText = React.useMemo(
        () => t('games.pizza-pizza.ui.bubbleText', {
            pizzaType: t(`games.pizza-pizza.pizzaTypes.${round.pizzaType}`),
            sliceCount: round.sliceCount,
            friendCount: round.friendCount
        }),
        [round.friendCount, round.pizzaType, round.sliceCount, t]
    );
    const answerChoices = React.useMemo(() => {
        const divisors = Array.from({ length: round.sliceCount }, (_, index) => index + 1)
            .filter((value) => round.sliceCount % value === 0);
        const distractors = shuffle(divisors.filter((value) => value !== correctChoiceValue)).slice(0, 2);
        const choiceSet = new Set<number>([correctChoiceValue, ...distractors]);

        return shuffle([...choiceSet]);
    }, [correctChoiceValue, round.sliceCount]);
    const handleChoiceSelect = React.useCallback((value: number) => {
        if (engine.gameState !== 'playing' || isResolving) return;

        setIsResolving(true);
        setSelectedChoice(value);
        scheduleResolve(() => {
            finishWithResult(value === correctChoiceValue);
        }, RESULT_REVEAL_MS);
    }, [correctChoiceValue, engine.gameState, finishWithResult, isResolving, scheduleResolve]);

    return (
        <Layout2
            title={t('games.pizza-pizza.title')}
            subtitle={t('games.pizza-pizza.subtitle')}
            description={t('games.pizza-pizza.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            gameId={GameIds.MATH_PIZZA_PIZZA}
            gameLevel={3}
            className="pizza-pizza-layout2"
            cardBackground={
                <div className="pizza-pizza-card-bg">
                    <div className="pizza-pizza-wall-sign" aria-hidden="true">
                        <span className="pizza-pizza-wall-sign-jello">🟢</span>
                        <span className="pizza-pizza-wall-sign-text">JELLO PIZZA</span>
                    </div>
                </div>
            }
        >
            <section className="pizza-pizza-stage" aria-label={t('games.pizza-pizza.ui.boardAriaLabel')}>
                <div className="pizza-pizza-shell">
                    <div className="pizza-pizza-friends">
                        <div className="pizza-pizza-speech-bubble">
                            {bubbleText}
                        </div>
                        {round.animals.map((animal, index) => {
                            const tone = getAnimalBodyTone(animal);

                            return (
                                <div key={`${animal}-${round.id}-${index}`} className="pizza-pizza-friend">
                                    <div
                                        className="pizza-pizza-friend-body"
                                        style={{
                                            ['--pizza-friend-body-base' as string]: tone.base,
                                            ['--pizza-friend-body-shade' as string]: tone.shade
                                        }}
                                        aria-hidden="true"
                                    />
                                    <div
                                        className="pizza-pizza-friend-avatar"
                                        style={{ animationDelay: `${index * 0.22}s` }}
                                        aria-hidden="true"
                                    >
                                        {animal}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pizza-pizza-table-wrap">
                        <div className="pizza-pizza-table" aria-hidden="true">
                            <div
                                className={[
                                    'pizza-pizza-pizza',
                                    selectedChoice != null ? 'is-grouped' : '',
                                    resolutionState === 'success' ? 'is-solved' : '',
                                    resolutionState === 'fail' ? 'is-failing' : ''
                                ].filter(Boolean).join(' ')}
                            >
                                <div className="pizza-pizza-pizza-guide" />
                                {groupedPlatePositions.map((plate, index) => (
                                    <span
                                        key={`plate-${round.id}-${index}`}
                                        className="pizza-pizza-group-plate"
                                        style={{
                                            left: plate.x,
                                            top: plate.y,
                                            width: plate.width,
                                            height: plate.height,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        aria-hidden="true"
                                    />
                                ))}
                                {pizzaSlices.map((sliceIndex) => {
                                    const position = sliceDisplayPositions[sliceIndex];

                                    return (
                                        <span
                                            key={`slice-${round.id}-${sliceIndex}`}
                                            className="pizza-pizza-slice"
                                            style={{
                                                left: position.x,
                                                top: position.y
                                            }}
                                            aria-hidden="true"
                                        >
                                            <span
                                                className="pizza-pizza-slice-token"
                                                style={
                                                    {
                                                        ['--pizza-slice-rotate' as '--pizza-slice-rotate']: `${position.rotate}deg`,
                                                        ['--pizza-slice-scale' as '--pizza-slice-scale']: `${position.scale ?? 1}`
                                                    } as React.CSSProperties
                                                }
                                            >
                                                🍕
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pizza-pizza-choice-box" aria-label={t('games.pizza-pizza.ui.answerChoicesAriaLabel')}>
                        <div className="pizza-pizza-choice-chip pizza-pizza-choice-chip-label" aria-hidden="true">
                            {t('games.pizza-pizza.ui.choiceLabel')}
                        </div>
                        {answerChoices.map((choice) => (
                            <button
                                key={`${round.id}-${choice}`}
                                type="button"
                                className={[
                                    'pizza-pizza-choice-chip',
                                    selectedChoice === choice ? 'is-selected' : ''
                                ].filter(Boolean).join(' ')}
                                onClick={() => handleChoiceSelect(choice)}
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_PIZZA_PIZZA,
    title: 'Pizza Pizza',
    titleKey: 'games.pizza-pizza.title',
    subtitle: 'How Many for Each?',
    subtitleKey: 'games.pizza-pizza.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.pizza-pizza.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: PizzaPizza,
    thumbnail: '🍕'
};
