import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './TenFrameNumber.css';

interface TenFrameNumberProps {
    onExit: () => void;
}

type DotColor = 'blue' | 'red';
type RewardPowerUp = 'timeFreeze' | 'extraLife' | 'doubleScore';

const COLOR_TO_EMOJI: Record<DotColor, string> = {
    blue: '🔵',
    red: '🔴'
};

const LEVEL1_MAX = 10;
const LEVEL2_MAX = 20;
const COVER_IN_MS = 220;
const COVER_HOLD_MS = 1500;
const PEEL_PREP_MS = 90;
const SWIPE_TRANSITION_MS = 900;
const CELL_EMOJI_SIZE_RATIO = 0.85;
const CELL_EMOJI_GLYPH_RATIO = 0.86;
const TARGET_EMOJI_SIZE_RATIO = 0.85;
const SIZE_CHANGE_EPSILON = 0.5;
const GRID_CELLS_PER_CARD = 10;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

interface RoundData {
    maxValue: number;
    gridCount: 1 | 2;
    targetColor: DotColor;
    targetCount: number;
    cells: Array<DotColor | null>;
    options: [number, number];
    signature: string;
}

const buildOptions = (targetCount: number, maxValue: number): [number, number] => {
    const half = maxValue / 2;
    let wrong = maxValue - targetCount;

    // For half-value answers (5 of 10, 10 of 20), keep the problem
    // but use a random different wrong choice.
    if (Number.isInteger(half) && targetCount === half) {
        wrong = randomInt(1, maxValue);
        while (wrong === targetCount) {
            wrong = randomInt(1, maxValue);
        }
    }

    return Math.random() < 0.5 ? [targetCount, wrong] : [wrong, targetCount];
};

const fillLeadingCells = (length: number, fillColor: DotColor, fillCount: number, restColor: DotColor | null = null): Array<DotColor | null> => {
    const cells: Array<DotColor | null> = Array(length).fill(restColor);
    for (let i = 0; i < fillCount; i += 1) {
        cells[i] = fillColor;
    }
    return cells;
};

const createRound = (difficultyLevel: number, prevSignature?: string): RoundData => {
    const tier = Math.min(3, Math.max(1, difficultyLevel));
    let guard = 0;

    while (guard < 40) {
        guard += 1;

        if (tier === 1) {
            const maxValue = LEVEL1_MAX;
            const targetColor: DotColor = 'blue';
            const targetCount = randomInt(1, maxValue - 1);
            const cells = fillLeadingCells(maxValue, targetColor, targetCount, null);
            const options = buildOptions(targetCount, maxValue);
            const signature = `lv1:${targetColor}:${targetCount}`;
            if (signature !== prevSignature) {
                return { maxValue, gridCount: 1, targetColor, targetCount, cells, options, signature };
            }
            continue;
        }

        if (tier === 2) {
            const maxValue = LEVEL1_MAX;
            const targetColor: DotColor = Math.random() < 0.5 ? 'blue' : 'red';
            const targetCount = randomInt(1, maxValue - 1);
            const otherColor: DotColor = targetColor === 'blue' ? 'red' : 'blue';
            const cells = fillLeadingCells(maxValue, targetColor, targetCount, otherColor);
            const options = buildOptions(targetCount, maxValue);
            const signature = `lv2:${targetColor}:${targetCount}`;
            if (signature !== prevSignature) {
                return { maxValue, gridCount: 1, targetColor, targetCount, cells, options, signature };
            }
            continue;
        }

        // tier 3+: 20-cell bridge. Fill target color sequentially so n>10 becomes 10 + (n-10).
        const maxValue = LEVEL2_MAX;
        const targetColor: DotColor = Math.random() < 0.5 ? 'blue' : 'red';
        const targetCount = randomInt(1, maxValue - 1);
        const otherColor: DotColor = targetColor === 'blue' ? 'red' : 'blue';
        const cells: Array<DotColor | null> = Array(maxValue).fill(otherColor);
        for (let i = 0; i < targetCount; i += 1) {
            cells[i] = targetColor;
        }
        const options = buildOptions(targetCount, maxValue);
        const signature = `lv3:${targetColor}:${targetCount}`;
        if (signature !== prevSignature) {
            return { maxValue, gridCount: 2, targetColor, targetCount, cells, options, signature };
        }
    }

    // Fallback (should be unreachable due to guard)
    const maxValue = LEVEL1_MAX;
    const targetColor: DotColor = 'blue';
    const targetCount = 4;
    const cells = fillLeadingCells(maxValue, targetColor, targetCount, null);
    const options: [number, number] = [targetCount, maxValue - targetCount];
    return { maxValue, gridCount: 1, targetColor, targetCount, cells, options, signature: 'fallback' };
};

export const TenFrameNumber: React.FC<TenFrameNumberProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 60,
        maxDifficulty: 3,
        difficultyThresholds: {
            promoteStreak: 3,
            promoteTotal: 4,
            demoteStreak: 2
        }
    });
    const [round, setRound] = React.useState<RoundData>(() => createRound(1));
    const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
    const [isCardOverlayVisible, setIsCardOverlayVisible] = React.useState(false);
    const [isCardOverlayPeel, setIsCardOverlayPeel] = React.useState(false);
    const [disableOverlayEnterAnim, setDisableOverlayEnterAnim] = React.useState(false);
    const [emojiSizePx, setEmojiSizePx] = React.useState<number>(0);
    const [targetEmojiSizePx, setTargetEmojiSizePx] = React.useState<number>(0);
    const [showOptionsHint, setShowOptionsHint] = React.useState(false);
    const [numberHintCellKey, setNumberHintCellKey] = React.useState<string | null>(null);
    const [jiggleCellKey, setJiggleCellKey] = React.useState<string | null>(null);
    const prevGameStateRef = React.useRef(engine.gameState);
    const prevSignatureRef = React.useRef<string | undefined>(undefined);
    const peelStartTimerRef = React.useRef<number | null>(null);
    const peelPrepTimerRef = React.useRef<number | null>(null);
    const peelDoneTimerRef = React.useRef<number | null>(null);
    const optionsHintTimerRef = React.useRef<number | null>(null);
    const numberHintTimerRef = React.useRef<number | null>(null);
    const jiggleTimerRef = React.useRef<number | null>(null);
    const stageRef = React.useRef<HTMLDivElement | null>(null);
    const targetBoxRef = React.useRef<HTMLDivElement | null>(null);
    const successfulSetsRef = React.useRef(0);
    const hasShownOptionsHintRef = React.useRef(false);

    const clearOverlayTimers = React.useCallback(() => {
        if (peelStartTimerRef.current != null) {
            window.clearTimeout(peelStartTimerRef.current);
            peelStartTimerRef.current = null;
        }
        if (peelPrepTimerRef.current != null) {
            window.clearTimeout(peelPrepTimerRef.current);
            peelPrepTimerRef.current = null;
        }
        if (peelDoneTimerRef.current != null) {
            window.clearTimeout(peelDoneTimerRef.current);
            peelDoneTimerRef.current = null;
        }
    }, []);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.tenframe-number.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.tenframe-number.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.tenframe-number.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    React.useEffect(() => clearOverlayTimers, [clearOverlayTimers]);

    React.useEffect(() => {
        return () => {
            if (optionsHintTimerRef.current != null) {
                window.clearTimeout(optionsHintTimerRef.current);
                optionsHintTimerRef.current = null;
            }
            if (numberHintTimerRef.current != null) {
                window.clearTimeout(numberHintTimerRef.current);
                numberHintTimerRef.current = null;
            }
            if (jiggleTimerRef.current != null) {
                window.clearTimeout(jiggleTimerRef.current);
                jiggleTimerRef.current = null;
            }
        };
    }, []);

    React.useEffect(() => {
        if (engine.gameState !== 'gameover') return;
        if (optionsHintTimerRef.current != null) {
            window.clearTimeout(optionsHintTimerRef.current);
            optionsHintTimerRef.current = null;
        }
        setShowOptionsHint(false);
        setNumberHintCellKey(null);
        setJiggleCellKey(null);
        hasShownOptionsHintRef.current = false;
    }, [engine.gameState]);

    React.useEffect(() => {
        const isFirstProblem = engine.score === 0 && engine.combo === 0;
        if (
            engine.gameState !== 'playing' ||
            isCardOverlayVisible ||
            !isFirstProblem ||
            hasShownOptionsHintRef.current
        ) {
            return;
        }

        hasShownOptionsHintRef.current = true;
        setShowOptionsHint(true);
    }, [engine.combo, engine.gameState, engine.score, isCardOverlayVisible]);

    React.useEffect(() => {
        if (!showOptionsHint) return;
        if (optionsHintTimerRef.current != null) {
            window.clearTimeout(optionsHintTimerRef.current);
        }
        optionsHintTimerRef.current = window.setTimeout(() => {
            setShowOptionsHint(false);
            optionsHintTimerRef.current = null;
        }, 1800);
        return () => {
            if (optionsHintTimerRef.current != null) {
                window.clearTimeout(optionsHintTimerRef.current);
                optionsHintTimerRef.current = null;
            }
        };
    }, [showOptionsHint]);

    React.useEffect(() => {
        const prevState = prevGameStateRef.current;
        const enteredPlayingFromStart = engine.gameState === 'playing' && (prevState === 'idle' || prevState === 'gameover');
        const enteredPlayingWithNewRound =
            engine.gameState === 'playing' &&
            (prevState === 'idle' || prevState === 'gameover' || prevState === 'correct');

        if (enteredPlayingFromStart) {
            successfulSetsRef.current = 0;
        }

        if (enteredPlayingWithNewRound) {
            const nextRound = createRound(engine.difficultyLevel, prevSignatureRef.current);
            prevSignatureRef.current = nextRound.signature;
            setRound(nextRound);
            setSelectedOption(null);
            setIsCardOverlayVisible(false);
            setIsCardOverlayPeel(false);
            setDisableOverlayEnterAnim(false);
        }

        // Keep the same problem after a wrong answer; only re-enable input.
        if (engine.gameState === 'playing' && prevState === 'wrong') {
            setSelectedOption(null);
            setIsCardOverlayVisible(false);
            setIsCardOverlayPeel(false);
            setDisableOverlayEnterAnim(false);
        }

        prevGameStateRef.current = engine.gameState;
    }, [engine.difficultyLevel, engine.gameState]);

    const gridCount = round.gridCount;
    const totalCells = gridCount * GRID_CELLS_PER_CARD;
    const visibleCells = round.cells.slice(0, totalCells);
    const glyphEmojiSizePx = React.useMemo(
        () => Math.round(emojiSizePx * CELL_EMOJI_GLYPH_RATIO * 10) / 10,
        [emojiSizePx]
    );
    const cardIndexes = React.useMemo(
        () => Array.from({ length: gridCount }, (_, idx) => idx),
        [gridCount]
    );
    const cellIndexes = React.useMemo(
        () => Array.from({ length: GRID_CELLS_PER_CARD }, (_, idx) => idx),
        []
    );
    const instructions = React.useMemo(
        () => [
            { icon: '🃏', title: t('games.tenframe-number.howToPlay.step1.title'), description: t('games.tenframe-number.howToPlay.step1.description') },
            { icon: '🔢', title: t('games.tenframe-number.howToPlay.step2.title'), description: t('games.tenframe-number.howToPlay.step2.description') },
            { icon: '⚡', title: t('games.tenframe-number.howToPlay.step3.title'), description: t('games.tenframe-number.howToPlay.step3.description') }
        ],
        [t]
    );

    React.useEffect(() => {
        const updateEmojiSize = () => {
            const stageEl = stageRef.current;
            if (!stageEl) return;
            const cellEl = stageEl.querySelector('.tenframe-number-grid-cell') as HTMLElement | null;
            if (!cellEl) return;

            const rect = cellEl.getBoundingClientRect();
            const nextSize = Math.max(0, Math.round(rect.width * CELL_EMOJI_SIZE_RATIO * 10) / 10);
            setEmojiSizePx((prev) => (Math.abs(prev - nextSize) > SIZE_CHANGE_EPSILON ? nextSize : prev));

            const targetBoxEl = targetBoxRef.current;
            if (targetBoxEl) {
                const targetRect = targetBoxEl.getBoundingClientRect();
                const nextTargetSize = Math.max(0, Math.round(targetRect.height * TARGET_EMOJI_SIZE_RATIO * 10) / 10);
                setTargetEmojiSizePx((prev) => (Math.abs(prev - nextTargetSize) > SIZE_CHANGE_EPSILON ? nextTargetSize : prev));
            }
        };

        const rafId = window.requestAnimationFrame(updateEmojiSize);
        const stageEl = stageRef.current;

        let resizeObserver: ResizeObserver | null = null;
        const onResize = () => updateEmojiSize();

        if (stageEl && 'ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(() => updateEmojiSize());
            resizeObserver.observe(stageEl);
        } else {
            window.addEventListener('resize', onResize);
        }

        return () => {
            window.cancelAnimationFrame(rafId);
            if (resizeObserver) {
                resizeObserver.disconnect();
            } else {
                window.removeEventListener('resize', onResize);
            }
        };
    }, [gridCount, round.signature]);

    const handleChoose = (value: number) => {
        if (engine.gameState !== 'playing' || selectedOption !== null || isCardOverlayVisible) return;
        setSelectedOption(value);
        const isCorrect = value === round.targetCount;

        if (!isCorrect) {
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });
            return;
        }

        engine.submitAnswer(true, { skipFeedback: true });
        engine.registerEvent({ type: 'correct' });

        // Match HoneyPath/NumberHive reward rule:
        // every 3 successful sets, 55% chance to grant one random power-up.
        successfulSetsRef.current += 1;
        if (successfulSetsRef.current % 3 === 0 && Math.random() > 0.45) {
            const rewards: RewardPowerUp[] = ['timeFreeze', 'extraLife', 'doubleScore'];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
        }

        setIsCardOverlayVisible(true);
        setIsCardOverlayPeel(false);
        setDisableOverlayEnterAnim(false);
        clearOverlayTimers();

        peelStartTimerRef.current = window.setTimeout(() => {
            const nextRound = createRound(engine.difficultyLevel, prevSignatureRef.current);
            prevSignatureRef.current = nextRound.signature;
            setDisableOverlayEnterAnim(true);
            setRound(nextRound);
            setIsCardOverlayVisible(true);
            setIsCardOverlayPeel(false);

            // Let the next layout (e.g. 1 -> 2 cards) render fully covered first,
            // then peel both overlays at the same time.
            peelPrepTimerRef.current = window.setTimeout(() => {
                setIsCardOverlayPeel(true);

                peelDoneTimerRef.current = window.setTimeout(() => {
                    setSelectedOption(null);
                    setIsCardOverlayVisible(false);
                    setIsCardOverlayPeel(false);
                    setDisableOverlayEnterAnim(false);
                    clearOverlayTimers();
                }, SWIPE_TRANSITION_MS);
            }, PEEL_PREP_MS);
        }, COVER_IN_MS + COVER_HOLD_MS);
    };

    const handleTokenTap = React.useCallback((cardIdx: number, cellIdx: number) => {
        const cellKey = `${cardIdx}-${cellIdx}`;
        setJiggleCellKey(cellKey);
        setNumberHintCellKey(cellKey);

        if (jiggleTimerRef.current != null) {
            window.clearTimeout(jiggleTimerRef.current);
        }
        jiggleTimerRef.current = window.setTimeout(() => {
            setJiggleCellKey((prev) => (prev === cellKey ? null : prev));
            jiggleTimerRef.current = null;
        }, 420);

        if (numberHintTimerRef.current != null) {
            window.clearTimeout(numberHintTimerRef.current);
        }
        numberHintTimerRef.current = window.setTimeout(() => {
            setNumberHintCellKey(null);
            numberHintTimerRef.current = null;
        }, 1600);
    }, []);

    return (
        <Layout2
            title={t('games.tenframe-number.title')}
            subtitle={t('games.tenframe-number.subtitle')}
            description={t('games.tenframe-number.description')}
            gameId={GameIds.MATH_TENFRAME_NUMBER}
            gameLevel={1}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            className="tenframe-number-layout2"
            instructions={instructions}
        >
            <div ref={stageRef} className="tenframe-number-stage" aria-label="tenframe-number-layout">
                <section className="tenframe-number-grid-area" aria-label="tenframe-grid-area">
                    <div className={`tenframe-number-grid-deck grid-count-${gridCount}`}>
                        {cardIndexes.map((cardIdx) => (
                            <div key={`tenframe-card-${cardIdx}`} className="tenframe-number-grid-card">
                                <div className="tenframe-number-grid-card-inner">
                                    <div className="tenframe-number-grid-card-corner top-left">♠</div>
                                    <div className="tenframe-number-grid-card-corner bottom-right">♠</div>
                                    <div className="tenframe-number-grid-center">
                                        <div className="tenframe-number-grid">
                                            {cellIndexes.map((cellIdx) => {
                                                const globalCellIdx = cardIdx * GRID_CELLS_PER_CARD + cellIdx;
                                                const cellColor = visibleCells[globalCellIdx] ?? null;
                                                return (
                                                    <div key={`tenframe-cell-${cardIdx}-${cellIdx}`} className="tenframe-number-grid-cell">
                                                        {numberHintCellKey === `${cardIdx}-${cellIdx}` && (
                                                            <span className="tenframe-number-cell-index" aria-hidden="true">
                                                                {cellIdx + 1}
                                                            </span>
                                                        )}
                                                        {cellColor ? (
                                                            <span
                                                                className={`tenframe-number-token ${jiggleCellKey === `${cardIdx}-${cellIdx}` ? 'is-jiggle' : ''}`}
                                                                style={emojiSizePx > 0 ? {
                                                                    width: `${emojiSizePx}px`,
                                                                    height: `${emojiSizePx}px`,
                                                                    fontSize: `${glyphEmojiSizePx}px`
                                                                } : undefined}
                                                                onClick={() => handleTokenTap(cardIdx, cellIdx)}
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(event) => {
                                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                                        event.preventDefault();
                                                                        handleTokenTap(cardIdx, cellIdx);
                                                                    }
                                                                }}
                                                            >
                                                                {COLOR_TO_EMOJI[cellColor]}
                                                            </span>
                                                        ) : ''}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {isCardOverlayVisible && (
                                    <div
                                        className={`tenframe-number-card-overlay ${isCardOverlayPeel ? 'is-peeling' : ''} ${disableOverlayEnterAnim ? 'is-no-enter' : ''}`}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="tenframe-number-answer-area" aria-label="tenframe-answer-area">
                    <div className="tenframe-number-answer-pad">
                        <div className="tenframe-number-count-panel">
                            <div ref={targetBoxRef} className="tenframe-number-count-box tenframe-number-count-box-emoji" aria-label="target-emoji">
                                <span className="tenframe-number-target-emoji" style={targetEmojiSizePx > 0 ? { fontSize: `${targetEmojiSizePx}px` } : undefined}>
                                    {COLOR_TO_EMOJI[round.targetColor]}
                                </span>
                            </div>
                        </div>

                        <div className="tenframe-number-options-panel">
                            {showOptionsHint && (
                                <div className="tenframe-number-options-hint-overlay" aria-hidden="true">
                                    <span className="tenframe-number-options-hint-text">{t('games.tenframe-number.ui.howManyHint')}</span>
                                </div>
                            )}
                            {round.options.map((value) => (
                                <button
                                    key={`answer-${value}`}
                                    type="button"
                                    className={`tenframe-number-option-btn ${selectedOption === value ? 'is-pressed' : ''}`}
                                    onClick={() => handleChoose(value)}
                                    disabled={engine.gameState !== 'playing' || selectedOption !== null}
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

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_TENFRAME_NUMBER,
    title: '10frame-number',
    titleKey: 'games.tenframe-number.title',
    subtitle: 'ㅇㅇㅇ',
    subtitleKey: 'games.tenframe-number.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.tenframe-number.description',
    category: 'math',
    level: 1,
    mode: 'adventure',
    component: TenFrameNumber,
    thumbnail: '🔟',
    tagsKey: 'games.tags.numberSense'
};
