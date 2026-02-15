import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import manifest_en from './locales/en';
import './ShapeSumLink.css';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import { playClearSound, playJelloClickSound } from '../../../../../utils/sound';
import { RisingShapesBackground } from '../../../components/RisingShapesBackground';

interface ShapeSumLinkProps {
    onExit: () => void;
}

type MissionShape = 'triangle' | 'square';

interface Mission {
    numbers: number[];
    requiredCount: 3 | 4;
    target: number;
    shape: MissionShape;
}

type DifficultyLevel = 1 | 2 | 3;

interface DifficultyProgress {
    level: DifficultyLevel;
    consecutiveCorrect: number;
    consecutiveWrong: number;
    totalCorrectInLevel: number;
}

interface PendingRoundAction {
    regenerate: boolean;
    nextLevel: DifficultyLevel;
}

const CENTER_POINT = 50;
const NODE_RADIUS = 31;
const NODE_ANGLES = [-90, -30, 30, 90, 150, 210];

const toPoint = (radius: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: CENTER_POINT + radius * Math.cos(rad),
        y: CENTER_POINT + radius * Math.sin(rad)
    };
};

const NODE_POINTS = NODE_ANGLES.map((angle) => toPoint(NODE_RADIUS, angle));

const SHAPE_ICON: Record<MissionShape, string> = {
    triangle: '▲',
    square: '■'
};

const buildCombinations = (length: number, pickCount: number): number[][] => {
    const result: number[][] = [];
    const dfs = (start: number, path: number[]) => {
        if (path.length === pickCount) {
            result.push([...path]);
            return;
        }
        for (let i = start; i < length; i += 1) {
            path.push(i);
            dfs(i + 1, path);
            path.pop();
        }
    };
    dfs(0, []);
    return result;
};

const COMBINATIONS_BY_COUNT: Record<3 | 4, number[][]> = {
    3: buildCombinations(6, 3),
    4: buildCombinations(6, 4)
};

const shuffle = (arr: number[]): number[] => {
    const copied = [...arr];
    for (let i = copied.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied;
};

const createMission = (level: DifficultyLevel): Mission => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
        const requiredCount: 3 | 4 = level === 3 ? 4 : 3;
        const shape: MissionShape = requiredCount === 3 ? 'triangle' : 'square';
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6);
        const combos = COMBINATIONS_BY_COUNT[requiredCount];

        const sumToCombos = new Map<number, number[][]>();
        combos.forEach((combo) => {
            const sum = combo.reduce((acc, idx) => acc + numbers[idx], 0);
            const current = sumToCombos.get(sum) ?? [];
            current.push(combo);
            sumToCombos.set(sum, current);
        });

        let uniqueTargets = Array.from(sumToCombos.entries())
            .filter(([, comboList]) => comboList.length === 1)
            .map(([sum]) => sum);

        // Difficulty 1: Triangle missions with target <= 10
        if (level === 1) {
            uniqueTargets = uniqueTargets.filter((sum) => sum <= 10);
        }

        if (uniqueTargets.length > 0) {
            const target = uniqueTargets[Math.floor(Math.random() * uniqueTargets.length)];
            return { numbers, requiredCount, target, shape };
        }
    }

    const fallbackNumbers = [1, 2, 3, 4, 5, 9];
    return {
        numbers: fallbackNumbers,
        requiredCount: 3,
        target: 12,
        shape: 'triangle'
    };
};

export const ShapeSumLink: React.FC<ShapeSumLinkProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const [mission, setMission] = useState<Mission | null>(null);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [pendingRoundAction, setPendingRoundAction] = useState<PendingRoundAction | null>(null);
    const [difficultyProgress, setDifficultyProgress] = useState<DifficultyProgress>({
        level: 1,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        totalCorrectInLevel: 0
    });
    const draggingPointerIdRef = useRef<number | null>(null);
    const sfxPrimedRef = useRef(false);

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 2
    });
    const prevGameStateRef = useRef(engine.gameState);

    useEffect(() => {
        if (!i18n.exists('games.shape-sum-link.title', { lng: 'en' })) {
            i18n.addResourceBundle(
                'en',
                'translation',
                { games: { 'shape-sum-link': manifest_en } },
                true,
                true
            );
        }
    }, [i18n]);

    useEffect(() => {
        const prevGameState = prevGameStateRef.current;
        const isFreshStart =
            engine.gameState === 'playing' &&
            (prevGameState === 'idle' || prevGameState === 'gameover');

        if (isFreshStart) {
            const initialProgress: DifficultyProgress = {
                level: 1,
                consecutiveCorrect: 0,
                consecutiveWrong: 0,
                totalCorrectInLevel: 0
            };
            setDifficultyProgress(initialProgress);
            setMission(createMission(initialProgress.level));
            setSelectedIndices([]);
            setIsResolving(false);
            setPendingRoundAction(null);
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    useEffect(() => {
        if (!isResolving || pendingRoundAction == null) return;

        if (engine.gameState === 'playing') {
            if (pendingRoundAction.regenerate) {
                setMission(createMission(pendingRoundAction.nextLevel));
            }
            setSelectedIndices([]);
            setIsResolving(false);
            setPendingRoundAction(null);
        } else if (engine.gameState === 'gameover' || engine.gameState === 'idle') {
            setIsResolving(false);
            setPendingRoundAction(null);
        }
    }, [engine.gameState, isResolving, pendingRoundAction]);

    const handleNodeDown = useCallback((event: React.PointerEvent<HTMLButtonElement>, index: number) => {
        if (!mission || isResolving || engine.gameState !== 'playing') {
            return;
        }
        if (!sfxPrimedRef.current) {
            // Mobile-safe prewarm so both success/fail sounds are available in this game session.
            playClearSound(0);
            playJelloClickSound(0);
            sfxPrimedRef.current = true;
        }
        draggingPointerIdRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
        setSelectedIndices([index]);
    }, [mission, isResolving, engine.gameState]);

    const handleNodeEnter = useCallback((index: number) => {
        if (!mission || !isDragging || isResolving || engine.gameState !== 'playing') {
            return;
        }
        setSelectedIndices((prev) => {
            if (prev.length === 0) {
                return [index];
            }

            const firstIndex = prev[0];
            const lastIndex = prev[prev.length - 1];
            if (index === lastIndex) {
                return prev;
            }

            // Shape closes only when user explicitly returns to first node.
            if (index === firstIndex && prev.length === mission.requiredCount) {
                return [...prev, index];
            }

            if (prev.includes(index) || prev.length >= mission.requiredCount) {
                return prev;
            }

            return [...prev, index];
        });
    }, [mission, isDragging, isResolving, engine.gameState]);

    const checkSelection = useCallback((indices: number[]) => {
        if (!mission || isResolving || engine.gameState !== 'playing') {
            return;
        }

        setIsResolving(true);
        const sum = indices.reduce((acc, idx) => acc + mission.numbers[idx], 0);
        const isCorrect = sum === mission.target;
        let nextProgress: DifficultyProgress;

        if (isCorrect) {
            const nextConsecutiveCorrect = difficultyProgress.consecutiveCorrect + 1;
            const nextTotalCorrect = difficultyProgress.totalCorrectInLevel + 1;

            if (difficultyProgress.level === 1) {
                if (nextTotalCorrect >= 3) {
                    nextProgress = {
                        level: 2,
                        consecutiveCorrect: 0,
                        consecutiveWrong: 0,
                        totalCorrectInLevel: 0
                    };
                } else {
                    nextProgress = {
                        level: 1,
                        consecutiveCorrect: nextConsecutiveCorrect,
                        consecutiveWrong: 0,
                        totalCorrectInLevel: nextTotalCorrect
                    };
                }
            } else if (difficultyProgress.level === 2) {
                if (nextConsecutiveCorrect >= 3 || nextTotalCorrect >= 4) {
                    nextProgress = {
                        level: 3,
                        consecutiveCorrect: 0,
                        consecutiveWrong: 0,
                        totalCorrectInLevel: 0
                    };
                } else {
                    nextProgress = {
                        level: 2,
                        consecutiveCorrect: nextConsecutiveCorrect,
                        consecutiveWrong: 0,
                        totalCorrectInLevel: nextTotalCorrect
                    };
                }
            } else {
                // Level 3 is max level for now.
                nextProgress = {
                    level: 3,
                    consecutiveCorrect: nextConsecutiveCorrect,
                    consecutiveWrong: 0,
                    totalCorrectInLevel: nextTotalCorrect
                };
            }
        } else {
            const nextConsecutiveWrong = difficultyProgress.consecutiveWrong + 1;

            if (difficultyProgress.level === 3 && nextConsecutiveWrong >= 2) {
                nextProgress = {
                    level: 2,
                    consecutiveCorrect: 0,
                    consecutiveWrong: 0,
                    totalCorrectInLevel: 0
                };
            } else if (difficultyProgress.level === 2 && nextConsecutiveWrong >= 2) {
                nextProgress = {
                    level: 1,
                    consecutiveCorrect: 0,
                    consecutiveWrong: 0,
                    totalCorrectInLevel: 0
                };
            } else {
                nextProgress = {
                    level: difficultyProgress.level,
                    consecutiveCorrect: 0,
                    consecutiveWrong: nextConsecutiveWrong,
                    totalCorrectInLevel: difficultyProgress.totalCorrectInLevel
                };
            }
        }

        setDifficultyProgress(nextProgress);

        if (isCorrect && engine.setPowerUps) {
            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0 && Math.random() > 0.45) {
                const rewardTypes = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                const reward = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
                engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
            }
        }

        if (isCorrect) {
            playClearSound();
        } else {
            playJelloClickSound(0.55);
        }

        engine.submitAnswer(isCorrect, { skipDifficulty: true });
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong', sfx: 'none' } as any);
        setPendingRoundAction({
            regenerate: isCorrect,
            nextLevel: nextProgress.level
        });
    }, [mission, isResolving, engine, difficultyProgress]);

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (!isDragging || isResolving || engine.gameState !== 'playing') return;
            if (draggingPointerIdRef.current !== null && event.pointerId !== draggingPointerIdRef.current) return;

            const target = document.elementFromPoint(event.clientX, event.clientY);
            if (!(target instanceof Element)) return;
            const nodeEl = target.closest('[data-node-index]');
            if (!nodeEl) return;

            const indexValue = nodeEl.getAttribute('data-node-index');
            if (indexValue == null) return;
            const index = Number(indexValue);
            if (!Number.isFinite(index)) return;

            handleNodeEnter(index);
        };

        const handlePointerRelease = () => {
            if (!isDragging) return;
            draggingPointerIdRef.current = null;
            setIsDragging(false);

            if (!mission || isResolving || engine.gameState !== 'playing') {
                return;
            }

            const isClosedShape =
                selectedIndices.length === mission.requiredCount + 1 &&
                selectedIndices[selectedIndices.length - 1] === selectedIndices[0];

            if (!isClosedShape) {
                setSelectedIndices([]);
                return;
            }

            checkSelection(selectedIndices.slice(0, mission.requiredCount));
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerup', handlePointerRelease);
        window.addEventListener('pointercancel', handlePointerRelease);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerRelease);
            window.removeEventListener('pointercancel', handlePointerRelease);
        };
    }, [isDragging, mission, isResolving, engine.gameState, selectedIndices, checkSelection, handleNodeEnter]);

    const selectedPolyline = useMemo(() => {
        if (selectedIndices.length === 0) return '';
        const points = selectedIndices.map((idx) => {
            const pos = NODE_POINTS[idx];
            return `${pos.x},${pos.y}`;
        });
        return points.join(' ');
    }, [selectedIndices]);

    const powerUps = useMemo<PowerUpBtnProps[]>(() => [
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue',
            icon: '❄️',
            title: 'Freeze Time',
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' : 'normal'
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red',
            icon: '❤️',
            title: 'Extra Life',
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' : 'normal'
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow',
            icon: '⚡',
            title: 'Double Score',
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' : 'normal'
        }
    ], [engine]);

    const targetValue = mission?.target ?? '...';
    const targetIcon = mission ? SHAPE_ICON[mission.shape] : '🎯';
    return (
        <Layout3
            title={t('games.shape-sum-link.title')}
            subtitle={t('games.shape-sum-link.subtitle')}
            description={t('games.shape-sum-link.description')}
            gameId={GameIds.SHAPE_SUM_LINK}
            engine={engine}
            onExit={onExit}
            instructions={[
                {
                    icon: '🔺',
                    title: t('games.shape-sum-link.howToPlay.step1.title'),
                    description: t('games.shape-sum-link.howToPlay.step1.description')
                },
                {
                    icon: '🔗',
                    title: t('games.shape-sum-link.howToPlay.step2.title'),
                    description: t('games.shape-sum-link.howToPlay.step2.description')
                },
                {
                    icon: '✅',
                    title: t('games.shape-sum-link.howToPlay.step3.title'),
                    description: t('games.shape-sum-link.howToPlay.step3.description')
                }
            ]}
            powerUps={powerUps}
            target={{
                value: targetValue,
                icon: targetIcon,
                label: mission ? `${mission.requiredCount} picks` : 'Ready'
            }}
        >
            <>
                <RisingShapesBackground />
                <div className="shape-sum-link-container" style={{ zIndex: 10, position: 'relative' }}>
                    <div className="shape-sum-link-board">
                        <svg className="shape-link-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polyline
                                points={selectedPolyline}
                                className={`shape-link-line ${isResolving ? 'locked' : ''}`}
                            />
                        </svg>
                        <div className="shape-sum-link-circle">
                            <svg className="shape-main-circle-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                                <defs>
                                    <radialGradient id="shapeSumCircleFill" cx="30%" cy="20%" r="78%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
                                        <stop offset="100%" stopColor="rgba(219,234,254,0.86)" />
                                    </radialGradient>
                                </defs>
                                <circle cx="50" cy="50" r={NODE_RADIUS} fill="url(#shapeSumCircleFill)" stroke="#bfdbfe" strokeWidth="1.35" />
                            </svg>
                            <span className="shape-circle-operator">+</span>
                        </div>
                        {(mission?.numbers ?? []).map((num, idx) => {
                            const isSelected = selectedIndices.includes(idx);
                            const nodePoint = NODE_POINTS[idx];
                            return (
                                <button
                                    key={`${num}-${idx}`}
                                    type="button"
                                    className={`shape-node-wrap ${isSelected ? 'selected' : ''} ${isResolving ? 'locked' : ''}`}
                                    style={{ left: `${nodePoint.x}%`, top: `${nodePoint.y}%` }}
                                    data-node-index={idx}
                                    onPointerDown={(event) => handleNodeDown(event, idx)}
                                    onPointerEnter={() => handleNodeEnter(idx)}
                                    disabled={isResolving}
                                    aria-label={`Number ${num}`}
                                >
                                    <div className="shape-node-card">{num}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.SHAPE_SUM_LINK,
    title: 'Shape Sum Link',
    titleKey: 'games.shape-sum-link.title',
    subtitle: 'Draw Shapes in the Circle!',
    subtitleKey: 'games.shape-sum-link.subtitle',
    description: 'Connect numbers to complete shape-based sum missions.',
    descriptionKey: 'games.shape-sum-link.description',
    category: 'math',
    level: 2,
    component: ShapeSumLink,
    thumbnail: '🔺',
    tagsKey: 'games.tags.addition'
};
