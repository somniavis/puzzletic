import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import './TenFrameAdd.css';

interface TenFrameAddProps {
    onExit: () => void;
}

type Round = {
    base: 10 | 20;
    left: number;
    answer: number;
    frameCount: 1 | 2;
};
type CellColor = 'blue' | 'red';
type DifficultyLevel = 1 | 2;
type RewardPowerUp = 'timeFreeze' | 'extraLife' | 'doubleScore';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const createRound = (difficulty: DifficultyLevel, prev?: Round): Round => {
    let base: 10 | 20 = difficulty === 1 ? 10 : (Math.random() < 0.5 ? 10 : 20);
    let left = randInt(1, base - 1);

    if (prev) {
        for (let i = 0; i < 10 && prev.base === base && prev.left === left; i += 1) {
            base = difficulty === 1 ? 10 : (Math.random() < 0.5 ? 10 : 20);
            left = randInt(1, base - 1);
        }
    }

    return {
        base,
        left,
        answer: base - left,
        frameCount: base === 10 ? 1 : 2
    };
};

const shuffle = <T,>(arr: T[]): T[] => {
    const next = [...arr];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = randInt(0, i);
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const buildAnswerOptions = (answer: number, base: 10 | 20): number[] => {
    const complement = base - answer;
    if (complement !== answer) {
        return shuffle([answer, complement]);
    }
    // Half-case fallback (10->5, 20->10): keep two unique options.
    const fallback = answer === 1 ? 2 : answer - 1;
    return shuffle([answer, fallback]);
};

const REWARD_TYPES: RewardPowerUp[] = ['timeFreeze', 'extraLife', 'doubleScore'];

export const TenFrameAdd: React.FC<TenFrameAddProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 2 });
    const [difficultyLevel, setDifficultyLevel] = React.useState<DifficultyLevel>(1);
    const [showAnswerPanel, setShowAnswerPanel] = React.useState(false);
    const [round, setRound] = React.useState<Round>(() => createRound(1));
    const [answerOptions, setAnswerOptions] = React.useState<number[]>(() => buildAnswerOptions(round.answer, round.base));
    const [pressingOption, setPressingOption] = React.useState<number | null>(null);
    const [flippedRedCells, setFlippedRedCells] = React.useState<boolean[]>(() => []);
    const [spinningCells, setSpinningCells] = React.useState<boolean[]>(() => []);
    const [frameCellSizes, setFrameCellSizes] = React.useState<number[]>([]);
    const [lv1ConsecutiveCorrect, setLv1ConsecutiveCorrect] = React.useState(0);
    const [lv1TotalCorrect, setLv1TotalCorrect] = React.useState(0);
    const [lv2ConsecutiveWrong, setLv2ConsecutiveWrong] = React.useState(0);
    const spinTimersRef = React.useRef<Array<number | null>>([]);
    const frameElementsRef = React.useRef<Array<HTMLDivElement | null>>([]);
    const gridElementsRef = React.useRef<Array<HTMLDivElement | null>>([]);
    const prevGameStateRef = React.useRef(engine.gameState);

    const baseCells = React.useMemo(() => {
        const cells: CellColor[] = [];
        for (let i = 0; i < round.base; i += 1) {
            cells.push(i < round.left ? 'blue' : 'red');
        }
        return cells;
    }, [round.base, round.left]);

    const displayCells = React.useMemo<CellColor[]>(() => {
        return baseCells.map((color, idx) => (color === 'red' && flippedRedCells[idx] ? 'blue' : color));
    }, [baseCells, flippedRedCells]);

    const frameCells = React.useMemo<CellColor[][]>(() => {
        if (round.frameCount === 1) return [displayCells];
        return [displayCells.slice(0, 10), displayCells.slice(10, 20)];
    }, [displayCells, round.frameCount]);

    const layoutEngine = React.useMemo(
        () => ({
            ...engine,
            onExit,
            difficultyLevel,
            maxLevel: 2
        }),
        [difficultyLevel, engine, onExit]
    );

    const powerUps = React.useMemo<PowerUpBtnProps[]>(
        () => [
            {
                count: engine.powerUps.timeFreeze,
                color: 'blue',
                icon: '❄️',
                title: t('games.ten-frame-add.powerups.timeFreeze'),
                onClick: () => engine.activatePowerUp('timeFreeze'),
                disabledConfig: engine.isTimeFrozen,
                status: engine.isTimeFrozen ? 'active' : 'normal'
            },
            {
                count: engine.powerUps.extraLife,
                color: 'red',
                icon: '❤️',
                title: t('games.ten-frame-add.powerups.extraLife'),
                onClick: () => engine.activatePowerUp('extraLife'),
                disabledConfig: engine.lives >= 3,
                status: engine.lives >= 3 ? 'maxed' : 'normal'
            },
            {
                count: engine.powerUps.doubleScore,
                color: 'yellow',
                icon: '⚡',
                title: t('games.ten-frame-add.powerups.doubleScore'),
                onClick: () => engine.activatePowerUp('doubleScore'),
                disabledConfig: engine.isDoubleScore,
                status: engine.isDoubleScore ? 'active' : 'normal'
            }
        ],
        [engine, t]
    );

    const resetRoundUi = React.useCallback((base: 10 | 20, answer: number) => {
        setFlippedRedCells(Array.from({ length: base }, () => false));
        setSpinningCells(Array.from({ length: base }, () => false));
        setFrameCellSizes([]);
        setShowAnswerPanel(false);
        setAnswerOptions(buildAnswerOptions(answer, base));
        setPressingOption(null);
    }, []);

    const goNextRound = React.useCallback((nextDifficulty: DifficultyLevel) => {
        setRound((prev) => {
            const next = createRound(nextDifficulty, prev);
            resetRoundUi(next.base, next.answer);
            return next;
        });
    }, [resetRoundUi]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState !== 'playing') {
            setShowAnswerPanel(false);
            prevGameStateRef.current = engine.gameState;
            return;
        }
        if (prev === 'idle' || prev === 'gameover') {
            setDifficultyLevel(1);
            setLv1ConsecutiveCorrect(0);
            setLv1TotalCorrect(0);
            setLv2ConsecutiveWrong(0);
            goNextRound(1);
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, goNextRound]);

    React.useEffect(
        () => () => {
            spinTimersRef.current.forEach((timer) => {
                if (timer != null) window.clearTimeout(timer);
            });
        },
        []
    );

    React.useLayoutEffect(() => {
        if (engine.gameState !== 'playing') return;
        const observers: ResizeObserver[] = [];
        const rafIds: number[] = [];
        frameElementsRef.current.forEach((frameEl, index) => {
            const gridEl = gridElementsRef.current[index];
            if (!frameEl || !gridEl) return;
            const updateCellSize = () => {
                const frameRect = frameEl.getBoundingClientRect();
                if (frameRect.width <= 0 || frameRect.height <= 0) return;
                const frameStyle = window.getComputedStyle(frameEl);
                const gridStyle = window.getComputedStyle(gridEl);
                const padX = (Number.parseFloat(frameStyle.paddingLeft) || 0) + (Number.parseFloat(frameStyle.paddingRight) || 0);
                const padY = (Number.parseFloat(frameStyle.paddingTop) || 0) + (Number.parseFloat(frameStyle.paddingBottom) || 0);
                const innerWidth = Math.max(0, frameRect.width - padX);
                const innerHeight = Math.max(0, frameRect.height - padY);
                const colGap = Number.parseFloat(gridStyle.columnGap) || 0;
                const rowGap = Number.parseFloat(gridStyle.rowGap) || colGap;
                const byWidth = (innerWidth - colGap * 4) / 5;
                const byHeight = (innerHeight - rowGap) / 2;
                const nextSize = Math.max(1, Math.floor(Math.min(byWidth, byHeight)));
                setFrameCellSizes((prev) => {
                    if (prev[index] === nextSize) return prev;
                    const next = [...prev];
                    next[index] = nextSize;
                    return next;
                });
            };

            updateCellSize();
            // Ensure first problem is measured after layout settles on initial paint.
            rafIds.push(window.requestAnimationFrame(updateCellSize));
            rafIds.push(window.requestAnimationFrame(updateCellSize));
            const observer = new ResizeObserver(() => updateCellSize());
            observer.observe(frameEl);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
            rafIds.forEach((id) => window.cancelAnimationFrame(id));
        };
    }, [engine.gameState, round.frameCount, round.base, showAnswerPanel]);

    React.useEffect(() => {
        const solved = round.answer > 0 && flippedRedCells.filter(Boolean).length >= round.answer;
        setShowAnswerPanel(solved);
    }, [flippedRedCells, round.answer]);

    const handleCellClick = React.useCallback((cellIndex: number) => {
        if (engine.gameState !== 'playing') return;
        if (cellIndex < round.left) return;
        if (flippedRedCells[cellIndex]) return;
        if (spinningCells[cellIndex]) return;

        setSpinningCells((prev) => {
            const next = [...prev];
            next[cellIndex] = true;
            return next;
        });

        if (spinTimersRef.current[cellIndex] != null) {
            window.clearTimeout(spinTimersRef.current[cellIndex]!);
        }
        spinTimersRef.current[cellIndex] = window.setTimeout(() => {
            setFlippedRedCells((prev) => {
                const next = [...prev];
                next[cellIndex] = true;
                return next;
            });
            setSpinningCells((prev) => {
                const next = [...prev];
                next[cellIndex] = false;
                return next;
            });
            spinTimersRef.current[cellIndex] = null;
        }, 260);
    }, [engine.gameState, flippedRedCells, round.left, spinningCells]);

    const handleOptionClick = React.useCallback((value: number, buttonEl?: HTMLButtonElement | null) => {
        if (engine.gameState !== 'playing' || !showAnswerPanel) return;
        buttonEl?.blur();
        setPressingOption(null);
        const isCorrect = value === round.answer;
        if (isCorrect) {
            engine.submitAnswer(true, { skipFeedback: true, skipDifficulty: true });
            engine.registerEvent({ type: 'correct', isFinal: true });

            // Match NumberBalance: reward chance every 3-hit combo (55%).
            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const reward = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
                engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
            }

            if (difficultyLevel === 1) {
                const nextConsecutive = lv1ConsecutiveCorrect + 1;
                const nextTotal = lv1TotalCorrect + 1;
                const shouldPromote = nextConsecutive >= 3 || nextTotal >= 4;

                if (shouldPromote) {
                    setDifficultyLevel(2);
                    setLv1ConsecutiveCorrect(0);
                    setLv1TotalCorrect(nextTotal);
                    setLv2ConsecutiveWrong(0);
                    goNextRound(2);
                } else {
                    setLv1ConsecutiveCorrect(nextConsecutive);
                    setLv1TotalCorrect(nextTotal);
                    goNextRound(1);
                }
                return;
            }
            setLv2ConsecutiveWrong(0);
            goNextRound(2);
            return;
        }
        engine.registerEvent({ type: 'wrong' });
        engine.updateLives(false);
        engine.updateCombo(false);
        if (difficultyLevel === 1) {
            setLv1ConsecutiveCorrect(0);
            return;
        }
        const nextLv2Wrong = lv2ConsecutiveWrong + 1;
        if (nextLv2Wrong >= 2) {
            setDifficultyLevel(1);
            setLv2ConsecutiveWrong(0);
            setLv1ConsecutiveCorrect(0);
            goNextRound(1);
            return;
        }
        setLv2ConsecutiveWrong(nextLv2Wrong);
    }, [difficultyLevel, engine, goNextRound, lv1ConsecutiveCorrect, lv1TotalCorrect, lv2ConsecutiveWrong, round.answer, showAnswerPanel]);

    const handleOptionPointerDown = React.useCallback((value: number) => {
        if (engine.gameState !== 'playing' || !showAnswerPanel) return;
        setPressingOption(value);
    }, [engine.gameState, showAnswerPanel]);
    const clearPressingOption = React.useCallback(() => setPressingOption(null), []);
    const targetValueNode = React.useMemo(
        () => (
            <span className="ten-frame-add-target-formula">
                <span className="ten-frame-add-target-blue-dot" aria-hidden="true" />
                <span>{round.left}</span>
                <span className="ten-frame-add-target-op">+</span>
                <span className="ten-frame-add-target-blank-box" aria-label="blank" />
                <span className="ten-frame-add-target-op">=</span>
                <span>{round.base}</span>
            </span>
        ),
        [round.base, round.left]
    );

    return (
        <Layout3
            title={t('games.ten-frame-add.title')}
            subtitle={t('games.ten-frame-add.subtitle')}
            description={t('games.ten-frame-add.description')}
            gameId={GameIds.MATH_TENFRAME_ADD}
            engine={layoutEngine as typeof engine}
            powerUps={powerUps}
            cardBackground={<div className="ten-frame-add-card-bg" />}
            target={{ value: targetValueNode }}
            instructions={[
                {
                    icon: '1️⃣',
                    title: t('games.ten-frame-add.howToPlay.step1.title'),
                    description: t('games.ten-frame-add.howToPlay.step1.description')
                },
                {
                    icon: '2️⃣',
                    title: t('games.ten-frame-add.howToPlay.step2.title'),
                    description: t('games.ten-frame-add.howToPlay.step2.description')
                },
                {
                    icon: '3️⃣',
                    title: t('games.ten-frame-add.howToPlay.step3.title'),
                    description: t('games.ten-frame-add.howToPlay.step3.description')
                }
            ]}
            onExit={onExit}
            className="ten-frame-add-theme"
        >
            <div className={`ten-frame-add-playfield ${showAnswerPanel ? 'with-answer' : ''}`}>
                <section className="ten-frame-add-mid">
                    <div className="ten-frame-add-ground">
                        <div
                            className="ten-frame-add-grid-stack"
                            style={{ ['--frame-count' as string]: String(round.frameCount) }}
                        >
                            {frameCells.map((cells, frameIndex) => (
                                <div
                                    key={`frame-${frameIndex}`}
                                    className="ten-frame-add-grid-frame"
                                    ref={(el) => {
                                        frameElementsRef.current[frameIndex] = el;
                                    }}
                                >
                                    <div
                                        className="ten-frame-add-grid"
                                        ref={(el) => {
                                            gridElementsRef.current[frameIndex] = el;
                                        }}
                                        style={{ ['--cell-size-px' as string]: frameCellSizes[frameIndex] ? `${frameCellSizes[frameIndex]}px` : undefined }}
                                    >
                                        {cells.map((color, cellIndex) => (
                                            <button
                                                key={`cell-${frameIndex}-${cellIndex}`}
                                                type="button"
                                                className={`ten-frame-add-cell is-${color} ${spinningCells[frameIndex * 10 + cellIndex] ? 'is-spinning' : ''}`}
                                                onClick={() => handleCellClick(frameIndex * 10 + cellIndex)}
                                                aria-label={`frame-${frameIndex + 1}-cell-${cellIndex + 1}`}
                                            >
                                                <span className="ten-frame-add-cell-dot" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="ten-frame-add-bottom">
                    {showAnswerPanel && (
                        <div className="ten-frame-add-answer-panel is-visible">
                            <p className="ten-frame-add-question">{t('games.ten-frame-add.question')}</p>
                            <div className="ten-frame-add-options">
                                {answerOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`ten-frame-add-option-btn ${pressingOption === option ? 'is-pressing' : ''}`}
                                        disabled={engine.gameState !== 'playing'}
                                        onPointerDown={() => handleOptionPointerDown(option)}
                                        onPointerUp={clearPressingOption}
                                        onPointerCancel={clearPressingOption}
                                        onPointerLeave={clearPressingOption}
                                        onClick={(event) => handleOptionClick(option, event.currentTarget)}
                                    >
                                        {option}
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
    id: GameIds.MATH_TENFRAME_ADD,
    title: '10 frame-add',
    titleKey: 'games.ten-frame-add.title',
    subtitle: 'ㅇㅇㅇ',
    subtitleKey: 'games.ten-frame-add.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.ten-frame-add.description',
    category: 'math',
    level: 1,
    component: TenFrameAdd,
    thumbnail: '🔟'
};
