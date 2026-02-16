import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import './TrollAttack.css';

interface TrollAttackProps {
    onExit: () => void;
}

interface Problem {
    a: number;
    b: number;
    answer: number;
}

interface AmmoOption {
    id: number;
    value: number;
}

interface ProjectileVisual {
    value: number;
    x: number;
    y: number;
}

type PathType = 'top' | 'bottom' | 'loop';
type BonusRewardType = 'extraLife' | 'timeFreeze';

interface TrollUnit {
    id: number;
    path: PathType;
    spawnedAt: number;
    progress: number;
    arrivedAt: number | null;
    problem: Problem;
    rewardType: BonusRewardType | null;
}

const CANNON_X = 11;
const CANNON_Y = 79;
const CASTLE_X = 24;
const CASTLE_Y = 80;
const MOUNTAIN_X = 88;
const MOUNTAIN_Y = 13;
const ROAD_CONTROL_X = 57;
const ROAD_CONTROL_Y = 96;
const LOOP_ROAD_PATH = `M ${MOUNTAIN_X} ${MOUNTAIN_Y} C 75 6, 47 8, 35 19 C 26 29, 31 41, 49 42 C 65 44, 79 33, ${MOUNTAIN_X} ${MOUNTAIN_Y}`;
const LOWER_ROAD_PATH = `M ${MOUNTAIN_X} ${MOUNTAIN_Y} C 92 34, 93 64, 74 86 C 56 100, 36 92, ${CASTLE_X} ${CASTLE_Y}`;

const TOP_PATH_DURATION_MS = 15000;
const BOTTOM_PATH_DURATION_MS = 20000;
const LOOP_PATH_DURATION_MS = 12000;
const SPAWN_INTERVAL_MS = 9000;
const CASTLE_HIT_DELAY_MS = 3000;
const POWER_UP_REWARD_TYPES = ['timeFreeze', 'extraLife', 'doubleScore'] as const;

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

const getQuadraticPoint = (
    t: number,
    start: { x: number; y: number },
    control: { x: number; y: number },
    end: { x: number; y: number }
): { x: number; y: number } => {
    const u = 1 - t;
    return {
        x: (u * u * start.x) + (2 * u * t * control.x) + (t * t * end.x),
        y: (u * u * start.y) + (2 * u * t * control.y) + (t * t * end.y)
    };
};

const getCubicPoint = (
    t: number,
    start: { x: number; y: number },
    control1: { x: number; y: number },
    control2: { x: number; y: number },
    end: { x: number; y: number }
): { x: number; y: number } => {
    const u = 1 - t;
    return {
        x:
            (u * u * u * start.x) +
            (3 * u * u * t * control1.x) +
            (3 * u * t * t * control2.x) +
            (t * t * t * end.x),
        y:
            (u * u * u * start.y) +
            (3 * u * u * t * control1.y) +
            (3 * u * t * t * control2.y) +
            (t * t * t * end.y)
    };
};

const createProblem = (): Problem => {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    return { a, b, answer: a * b };
};

const createAmmoOptions = (answer: number): AmmoOption[] => {
    const set = new Set<number>([answer]);
    while (set.size < 3) {
        const distance = 1 + Math.floor(Math.random() * 16);
        const sign = Math.random() > 0.5 ? 1 : -1;
        set.add(clamp(answer + distance * sign, 1, 99));
    }

    return Array.from(set)
        .sort(() => Math.random() - 0.5)
        .map((value, index) => ({ id: index, value }));
};

const getPathPoint = (path: PathType, progress: number): { x: number; y: number } => {
    if (path === 'top') {
        return getQuadraticPoint(
            progress,
            { x: MOUNTAIN_X, y: MOUNTAIN_Y },
            { x: ROAD_CONTROL_X, y: ROAD_CONTROL_Y },
            { x: CASTLE_X, y: CASTLE_Y }
        );
    }
    if (path === 'bottom') {
        return getCubicPoint(
            progress,
            { x: MOUNTAIN_X, y: MOUNTAIN_Y },
            { x: 92, y: 34 },
            { x: 93, y: 64 },
            { x: CASTLE_X, y: CASTLE_Y }
        );
    }
    if (progress <= 1 / 3) {
        const localT = progress * 3;
        return getCubicPoint(
            localT,
            { x: MOUNTAIN_X, y: MOUNTAIN_Y },
            { x: 75, y: 6 },
            { x: 47, y: 8 },
            { x: 35, y: 19 }
        );
    }
    if (progress <= 2 / 3) {
        const localT = (progress - 1 / 3) * 3;
        return getCubicPoint(
            localT,
            { x: 35, y: 19 },
            { x: 26, y: 29 },
            { x: 31, y: 41 },
            { x: 49, y: 42 }
        );
    }
    const localT = (progress - 2 / 3) * 3;
    return getCubicPoint(
        localT,
        { x: 49, y: 42 },
        { x: 65, y: 44 },
        { x: 79, y: 33 },
        { x: MOUNTAIN_X, y: MOUNTAIN_Y }
    );
};

const pickSpawnPath = (): PathType => {
    const r = Math.random();
    if (r < 0.4) return 'top';
    if (r < 0.8) return 'bottom';
    return 'loop';
};

const pickLoopRewardType = (): BonusRewardType => {
    return Math.random() < 0.5 ? 'extraLife' : 'timeFreeze';
};

const getPathDuration = (path: PathType): number => {
    if (path === 'top') return TOP_PATH_DURATION_MS;
    if (path === 'bottom') return BOTTOM_PATH_DURATION_MS;
    return LOOP_PATH_DURATION_MS;
};

const getRewardEmoji = (rewardType: BonusRewardType | null): string => {
    if (rewardType === 'extraLife') return '❤️';
    if (rewardType === 'timeFreeze') return '❄️';
    return '';
};

const getPathEndPoint = (path: PathType): { x: number; y: number } => {
    if (path === 'top' || path === 'bottom') return { x: CASTLE_X, y: CASTLE_Y };
    return { x: MOUNTAIN_X, y: MOUNTAIN_Y };
};

const getProjectileTargetPoint = (troll: TrollUnit): { x: number; y: number } => {
    if (troll.arrivedAt != null) {
        const end = getPathEndPoint(troll.path);
        return { x: end.x, y: end.y + 1.2 };
    }
    const pos = getPathPoint(troll.path, troll.progress);
    return { x: pos.x, y: pos.y + 1.2 };
};

const getPathZIndex = (path: PathType, id: number): number => {
    if (path === 'loop') return 100 + id;
    return 1000 - id;
};

const LOOP_PATH_VISUAL_OFFSET = { x: 0.6, y: 0.2 };

const getVisualPoint = (troll: TrollUnit): { x: number; y: number } => {
    if (troll.arrivedAt != null) {
        const end = getPathEndPoint(troll.path);
        return end;
    }
    const pos = getPathPoint(troll.path, troll.progress);
    if (troll.path !== 'loop') return pos;
    return { x: pos.x + LOOP_PATH_VISUAL_OFFSET.x, y: pos.y + LOOP_PATH_VISUAL_OFFSET.y };
};

export const TrollAttack: React.FC<TrollAttackProps> = ({ onExit }) => {
    const { t } = useTranslation();

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 2
    });

    const [trolls, setTrolls] = React.useState<TrollUnit[]>([]);
    const [ammoOptions, setAmmoOptions] = React.useState<AmmoOption[]>([]);
    const [draggingAmmoId, setDraggingAmmoId] = React.useState<number | null>(null);
    const [dragPos, setDragPos] = React.useState({ x: 0, y: 0 });
    const [statusText, setStatusText] = React.useState('');
    const [projectile, setProjectile] = React.useState<ProjectileVisual | null>(null);
    const [isFirePressed, setIsFirePressed] = React.useState(false);
    const [shieldTrollId, setShieldTrollId] = React.useState<number | null>(null);
    const [hitTrollId, setHitTrollId] = React.useState<number | null>(null);
    const [manualTargetId, setManualTargetId] = React.useState<number | null>(null);

    const prevGameStateRef = React.useRef(engine.gameState);
    const gameStateRef = React.useRef(engine.gameState);
    const timersRef = React.useRef<number[]>([]);
    const worldRafRef = React.useRef<number | null>(null);
    const projectileRafRef = React.useRef<number | null>(null);
    const spawnIntervalRef = React.useRef<number | null>(null);
    const dragPointerIdRef = React.useRef<number | null>(null);
    const dragAmmoIdRef = React.useRef<number | null>(null);
    const isDraggingRef = React.useRef(false);
    const dragPosRef = React.useRef({ x: 0, y: 0 });
    const cannonDropRef = React.useRef<HTMLDivElement | null>(null);
    const trollIdRef = React.useRef(1);
    const trollsRef = React.useRef<TrollUnit[]>([]);
    const firingRef = React.useRef(false);
    const registerEventRef = React.useRef(engine.registerEvent);
    const updateLivesRef = React.useRef(engine.updateLives);
    const updateComboRef = React.useRef(engine.updateCombo);

    React.useEffect(() => {
        gameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    React.useEffect(() => {
        registerEventRef.current = engine.registerEvent;
        updateLivesRef.current = engine.updateLives;
        updateComboRef.current = engine.updateCombo;
    }, [engine.registerEvent, engine.updateLives, engine.updateCombo]);

    const clearAllAsync = React.useCallback(() => {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
        if (spawnIntervalRef.current != null) {
            window.clearInterval(spawnIntervalRef.current);
            spawnIntervalRef.current = null;
        }
        if (worldRafRef.current != null) {
            window.cancelAnimationFrame(worldRafRef.current);
            worldRafRef.current = null;
        }
        if (projectileRafRef.current != null) {
            window.cancelAnimationFrame(projectileRafRef.current);
            projectileRafRef.current = null;
        }
    }, []);

    const resetVisuals = React.useCallback(() => {
        setDraggingAmmoId(null);
        dragAmmoIdRef.current = null;
        dragPointerIdRef.current = null;
        isDraggingRef.current = false;
        setProjectile(null);
        setStatusText('');
        setShieldTrollId(null);
        setHitTrollId(null);
        setManualTargetId(null);
        firingRef.current = false;
    }, []);

    const spawnTroll = React.useCallback(() => {
        const path = pickSpawnPath();
        const next: TrollUnit = {
            id: trollIdRef.current++,
            path,
            spawnedAt: performance.now(),
            progress: 0,
            arrivedAt: null,
            problem: createProblem(),
            rewardType: path === 'loop' ? pickLoopRewardType() : null
        };
        setTrolls((prev) => {
            const updated = [...prev, next];
            trollsRef.current = updated;
            return updated;
        });
    }, []);

    const setupGame = React.useCallback(() => {
        clearAllAsync();
        resetVisuals();
        trollIdRef.current = 1;
        trollsRef.current = [];
        setTrolls([]);
        spawnIntervalRef.current = window.setInterval(spawnTroll, SPAWN_INTERVAL_MS);
    }, [clearAllAsync, resetVisuals, spawnTroll]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            setupGame();
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, setupGame]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing') return;
        if (trolls.length > 0) return;
        spawnTroll();
    }, [engine.gameState, trolls.length, spawnTroll]);

    React.useEffect(() => () => clearAllAsync(), [clearAllAsync]);

    const powerUps = React.useMemo<PowerUpBtnProps[]>(() => [
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

    // Update troll movement loop.
    React.useEffect(() => {
        if (engine.gameState !== 'playing') return;

        const tick = (now: number) => {
            let castleLifeLossCount = 0;
            const prev = trollsRef.current;
            const next: TrollUnit[] = [];
            for (const troll of prev) {
                if (troll.arrivedAt != null) {
                    if (now - troll.arrivedAt >= CASTLE_HIT_DELAY_MS) {
                        castleLifeLossCount += 1;
                        continue; // remove troll after castle hit delay
                    }
                    next.push(troll);
                    continue;
                }

                const duration = getPathDuration(troll.path);
                const progress = clamp((now - troll.spawnedAt) / duration, 0, 1);
                if (progress >= 1) {
                    if (troll.path === 'loop') {
                        continue; // loop troll just leaves at mountain (no life penalty)
                    }
                    next.push({ ...troll, progress: 1, arrivedAt: now });
                    continue;
                }
                next.push({ ...troll, progress });
            }
            trollsRef.current = next;
            setTrolls(next);

            if (castleLifeLossCount > 0 && gameStateRef.current === 'playing') {
                for (let i = 0; i < castleLifeLossCount; i += 1) {
                    updateLivesRef.current(false);
                    updateComboRef.current(false);
                    registerEventRef.current({ type: 'wrong' } as any);
                }
                setStatusText(t('games.troll-attack.ui.castleHit'));
            }

            worldRafRef.current = window.requestAnimationFrame(tick);
        };

        worldRafRef.current = window.requestAnimationFrame(tick);
        return () => {
            if (worldRafRef.current != null) {
                window.cancelAnimationFrame(worldRafRef.current);
                worldRafRef.current = null;
            }
        };
    }, [engine.gameState, t]);

    const autoTargetTroll = React.useMemo(() => {
        if (trolls.length === 0) return null;
        return trolls.reduce((best, current) => (current.progress > best.progress ? current : best), trolls[0]);
    }, [trolls]);

    const targetTroll = React.useMemo(() => {
        if (trolls.length === 0) return null;
        if (manualTargetId != null) {
            const selected = trolls.find((troll) => troll.id === manualTargetId);
            if (selected) return selected;
        }
        return autoTargetTroll;
    }, [trolls, manualTargetId, autoTargetTroll]);

    const hasCastleUnderAttack = React.useMemo(
        () => trolls.some((troll) => troll.arrivedAt != null && troll.path !== 'loop'),
        [trolls]
    );

    React.useEffect(() => {
        if (manualTargetId == null) return;
        if (trolls.some((troll) => troll.id === manualTargetId)) return;
        setManualTargetId(null);
    }, [trolls, manualTargetId]);

    React.useEffect(() => {
        if (!targetTroll) {
            setAmmoOptions([]);
            return;
        }
        setAmmoOptions(createAmmoOptions(targetTroll.problem.answer));
    }, [targetTroll?.id]);

    const onShotLanded = React.useCallback((shotValue: number, targetId: number, answer: number) => {
        if (gameStateRef.current !== 'playing') return;

        if (shotValue === answer) {
            setHitTrollId(targetId);
            setStatusText(t('games.troll-attack.ui.correctHit'));
            const hitTarget = trollsRef.current.find((troll) => troll.id === targetId) ?? null;
            setTrolls((prev) => {
                const updated = prev.filter((troll) => troll.id !== targetId);
                trollsRef.current = updated;
                return updated;
            });

            const loopReward = hitTarget?.path === 'loop' ? hitTarget.rewardType : null;
            if (loopReward) {
                engine.setPowerUps((prev) => ({ ...prev, [loopReward]: prev[loopReward] + 1 }));
            }

            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                if (Math.random() > 0.45) {
                    const reward = POWER_UP_REWARD_TYPES[Math.floor(Math.random() * POWER_UP_REWARD_TYPES.length)];
                    engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            engine.submitAnswer(true, { skipDifficulty: true, skipFeedback: true });
            engine.registerEvent({ type: 'correct' } as any);
            const timer = window.setTimeout(() => setHitTrollId(null), 320);
            timersRef.current.push(timer);
            return;
        }

        setShieldTrollId(targetId);
        setStatusText(shotValue > answer ? t('games.troll-attack.ui.overHit') : t('games.troll-attack.ui.underHit'));
        updateLivesRef.current(false);
        updateComboRef.current(false);
        registerEventRef.current({ type: 'wrong' } as any);
        const timer = window.setTimeout(() => setShieldTrollId(null), 320);
        timersRef.current.push(timer);
    }, [engine, t]);

    const fireAmmo = React.useCallback((shotValue: number) => {
        if (engine.gameState !== 'playing') return;
        if (firingRef.current) return;
        const target = targetTroll;
        if (!target) return;

        firingRef.current = true;
        setIsFirePressed(true);
        const pressTimer = window.setTimeout(() => setIsFirePressed(false), 120);
        timersRef.current.push(pressTimer);

        const from = { x: CANNON_X + 2, y: CANNON_Y - 2 };
        const to = getProjectileTargetPoint(target);
        const arcHeight = 16;
        const duration = 650;
        const start = performance.now();
        const answer = target.problem.answer;
        const targetId = target.id;

        const tick = (now: number) => {
            const p = clamp((now - start) / duration, 0, 1);
            const x = lerp(from.x, to.x, p);
            const y = lerp(from.y, to.y, p) - arcHeight * 4 * p * (1 - p);
            setProjectile({ value: shotValue, x, y });
            if (p < 1) {
                projectileRafRef.current = window.requestAnimationFrame(tick);
                return;
            }
            setProjectile(null);
            firingRef.current = false;
            onShotLanded(shotValue, targetId, answer);
        };

        projectileRafRef.current = window.requestAnimationFrame(tick);
    }, [engine.gameState, onShotLanded, targetTroll]);

    const startDrag = React.useCallback((ammoId: number, pos: { x: number; y: number }, pointerId?: number) => {
        if (engine.gameState !== 'playing') return;
        if (firingRef.current) return;
        if (isDraggingRef.current) return;
        isDraggingRef.current = true;
        dragPointerIdRef.current = pointerId ?? null;
        dragAmmoIdRef.current = ammoId;
        setDraggingAmmoId(ammoId);
        dragPosRef.current = pos;
        setDragPos(pos);
    }, [engine.gameState]);

    const updateDrag = React.useCallback((pos: { x: number; y: number }) => {
        if (!isDraggingRef.current || dragAmmoIdRef.current == null) return;
        dragPosRef.current = pos;
        setDragPos(pos);
    }, []);

    const finishDrag = React.useCallback((pos: { x: number; y: number }) => {
        const activeAmmoId = dragAmmoIdRef.current;
        if (!isDraggingRef.current || activeAmmoId == null) return;
        isDraggingRef.current = false;
        dragPointerIdRef.current = null;

        const drop = cannonDropRef.current?.getBoundingClientRect();
        const dropped = drop
            ? pos.x >= drop.left && pos.x <= drop.right && pos.y >= drop.top && pos.y <= drop.bottom
            : false;

        if (dropped && !firingRef.current) {
            const picked = ammoOptions.find((ammo) => ammo.id === activeAmmoId);
            if (picked) {
                fireAmmo(picked.value);
            }
        }

        dragAmmoIdRef.current = null;
        setDraggingAmmoId(null);
    }, [ammoOptions, fireAmmo]);

    React.useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (!isDraggingRef.current || dragAmmoIdRef.current == null) return;
            if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return;
            updateDrag({ x: event.clientX, y: event.clientY });
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (!isDraggingRef.current || dragAmmoIdRef.current == null) return;
            if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return;
            finishDrag({ x: event.clientX || dragPosRef.current.x, y: event.clientY || dragPosRef.current.y });
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!isDraggingRef.current || dragAmmoIdRef.current == null) return;
            const touch = event.changedTouches[0];
            if (!touch) return;
            updateDrag({ x: touch.clientX, y: touch.clientY });
            event.preventDefault();
        };

        const handleTouchEnd = (event: TouchEvent) => {
            if (!isDraggingRef.current || dragAmmoIdRef.current == null) return;
            const touch = event.changedTouches[0];
            if (touch) {
                finishDrag({ x: touch.clientX, y: touch.clientY });
            } else {
                finishDrag({ x: dragPosRef.current.x, y: dragPosRef.current.y });
            }
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [finishDrag, updateDrag]);

    const onAmmoPointerDown = (event: React.PointerEvent<HTMLButtonElement>, ammoId: number) => {
        if (engine.gameState !== 'playing') return;
        if (firingRef.current) return;
        startDrag(ammoId, { x: event.clientX, y: event.clientY }, event.pointerId);
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Some mobile browsers can reject pointer capture.
        }
    };

    const onAmmoTouchStart = (event: React.TouchEvent<HTMLButtonElement>, ammoId: number) => {
        if (engine.gameState !== 'playing') return;
        if (firingRef.current) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        startDrag(ammoId, { x: touch.clientX, y: touch.clientY });
        event.preventDefault();
    };

    const ghostAmmo = draggingAmmoId == null ? null : ammoOptions.find((ammo) => ammo.id === draggingAmmoId) ?? null;
    const ammoSlots = React.useMemo(
        () => Array.from({ length: 3 }, (_, idx) => ammoOptions[idx] ?? null),
        [ammoOptions]
    );

    return (
        <Layout2
            title={t('games.troll-attack.title')}
            subtitle={t('games.troll-attack.subtitle')}
            description={t('games.troll-attack.description')}
            gameId={GameIds.MATH_TROLL_ATTACK}
            engine={engine}
            className="troll-attack-layout2"
            onExit={onExit}
            powerUps={powerUps}
            instructions={[
                {
                    icon: '🧌',
                    title: t('games.troll-attack.howToPlay.step1.title'),
                    description: t('games.troll-attack.howToPlay.step1.description')
                },
                {
                    icon: '💣',
                    title: t('games.troll-attack.howToPlay.step2.title'),
                    description: t('games.troll-attack.howToPlay.step2.description')
                },
                {
                    icon: '💥',
                    title: t('games.troll-attack.howToPlay.step3.title'),
                    description: t('games.troll-attack.howToPlay.step3.description')
                }
            ]}
        >
            <div className="troll-attack-shell">
                <section className="troll-attack-battlefield">
                    <div className={`troll-attack-castle ${hasCastleUnderAttack ? 'under-attack' : ''}`}>🏰</div>
                    <div
                        className="troll-attack-mountain-deco left"
                        style={{ left: `${MOUNTAIN_X - 6}%`, top: `${MOUNTAIN_Y - 5}%` }}
                    >
                        ⛰️
                    </div>
                    <div
                        className="troll-attack-mountain-deco right"
                        style={{ left: `${MOUNTAIN_X + 6}%`, top: `${MOUNTAIN_Y - 5}%` }}
                    >
                        ⛰️
                    </div>
                    <div
                        className="troll-attack-mountain"
                        style={{ left: `${MOUNTAIN_X}%`, top: `${MOUNTAIN_Y}%` }}
                    >
                        ⛰️
                    </div>
                    <svg className="troll-attack-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <path
                            className="troll-road-base"
                            d={LOOP_ROAD_PATH}
                        />
                        <path
                            className="troll-road-highlight"
                            d={LOOP_ROAD_PATH}
                        />
                        <path
                            className="troll-road-base"
                            d={`M ${MOUNTAIN_X} ${MOUNTAIN_Y} Q ${ROAD_CONTROL_X} ${ROAD_CONTROL_Y} ${CASTLE_X} ${CASTLE_Y}`}
                        />
                        <path
                            className="troll-road-highlight"
                            d={`M ${MOUNTAIN_X} ${MOUNTAIN_Y} Q ${ROAD_CONTROL_X} ${ROAD_CONTROL_Y} ${CASTLE_X} ${CASTLE_Y}`}
                        />
                        <path
                            className="troll-road-base troll-road-secondary"
                            d={LOWER_ROAD_PATH}
                        />
                        <path
                            className="troll-road-highlight troll-road-secondary-highlight"
                            d={LOWER_ROAD_PATH}
                        />
                    </svg>

                    <div className="troll-tree-cluster top-left" aria-hidden="true">
                        <span className="troll-tree size-l t1">🌲</span>
                        <span className="troll-tree size-m t2">🌲</span>
                        <span className="troll-tree size-l t3">🌲</span>
                        <span className="troll-tree size-s t4">🌲</span>
                        <span className="troll-tree size-m t5">🌲</span>
                        <span className="troll-tree size-m t6">🌲</span>
                        <span className="troll-tree size-l t7">🌲</span>
                        <span className="troll-tree size-s t8">🌲</span>
                        <span className="troll-tree size-s t9">🌲</span>
                        <span className="troll-tree size-m t10">🌲</span>
                        <span className="troll-tree size-m t11">🌲</span>
                        <span className="troll-tree size-s t12">🌲</span>
                    </div>
                    <div className="troll-tree-cluster bottom-right" aria-hidden="true">
                        <span className="troll-tree size-l t1">🌲</span>
                        <span className="troll-tree size-m t2">🌲</span>
                        <span className="troll-tree size-m t3">🌲</span>
                        <span className="troll-tree size-l t4">🌲</span>
                        <span className="troll-tree size-s t5">🌲</span>
                        <span className="troll-tree size-m t6">🌲</span>
                        <span className="troll-tree size-s t7">🌲</span>
                        <span className="troll-tree size-m t8">🌲</span>
                        <span className="troll-tree size-s t9">🌲</span>
                    </div>

                    <div ref={cannonDropRef} className="troll-attack-cannon-zone">
                        <div className={`troll-attack-cannon-shape ${isFirePressed ? 'pressed' : ''}`}>
                            <div className="troll-cannon-base-block" />
                            <div className="troll-cannon-barrel" />
                            <div className="troll-cannon-muzzle" />
                            <div className="troll-cannon-wheel" />
                        </div>
                    </div>

                    {trolls.map((troll) => {
                        const pos = getVisualPoint(troll);
                        const isTarget = targetTroll?.id === troll.id;
                        const isAttackingCastle = troll.arrivedAt != null && troll.path !== 'loop';
                        return (
                            <div
                                key={troll.id}
                                className="troll-attack-troll-wrap"
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    zIndex: getPathZIndex(troll.path, troll.id)
                                }}
                                onClick={() => {
                                    if (engine.gameState !== 'playing') return;
                                    setManualTargetId(troll.id);
                                }}
                            >
                                <div className={`troll-attack-troll-hud ${isTarget ? 'is-target' : ''}`}>
                                    <div className="troll-hud-bottom">
                                        <span className={`troll-hud-xp ${isTarget ? 'target-mark' : ''}`}>
                                            {isTarget ? '🎯' : 'XP'}
                                        </span>
                                        <div className="troll-hud-gauge">
                                            <div className="troll-hud-gauge-fill" style={{ width: '100%' }} />
                                            <span className="troll-hud-problem">{troll.problem.a}×{troll.problem.b}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`troll-emoji ${isAttackingCastle ? 'attacking' : ''}`}>🧌</div>
                                {isAttackingCastle && <div className="troll-attack-impact">💢</div>}
                                {troll.path === 'loop' && troll.rewardType && (
                                    <div className="troll-reward-badge">
                                        <span className="troll-reward-badge-emoji">{getRewardEmoji(troll.rewardType)}</span>
                                    </div>
                                )}
                                {shieldTrollId === troll.id && <div className="troll-shield">🛡️</div>}
                                {hitTrollId === troll.id && <div className="troll-hit">💥</div>}
                            </div>
                        );
                    })}

                    {projectile && (
                        <div
                            className="troll-projectile"
                            style={{ left: `${projectile.x}%`, top: `${projectile.y}%` }}
                        >
                            <span className="projectile-ball">💣</span>
                        </div>
                    )}
                </section>

                <section className="troll-attack-ammo-panel">
                    <div className="troll-attack-ammo-box">
                        <div className="troll-attack-ammo-row">
                            {ammoSlots.map((ammo, idx) => (
                                <button
                                    key={ammo ? ammo.id : `empty-${idx}`}
                                    type="button"
                                    className={`troll-ammo-btn ${!ammo ? 'empty' : ''} ${ammo && draggingAmmoId === ammo.id ? 'dragging' : ''}`}
                                    onPointerDown={ammo ? (event) => onAmmoPointerDown(event, ammo.id) : undefined}
                                    onTouchStart={ammo ? (event) => onAmmoTouchStart(event, ammo.id) : undefined}
                                    disabled={!ammo}
                                >
                                    <span className="ammo-token">
                                        <span className="ammo-emoji">💣</span>
                                        {ammo && <span className="ammo-value-overlay">{ammo.value}</span>}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="troll-attack-status-line">{statusText || t('games.troll-attack.ui.dragHint')}</div>

                {ghostAmmo && (
                    <div className="troll-ammo-ghost" style={{ left: dragPos.x, top: dragPos.y }}>
                        <span className="ammo-token">
                            <span className="ammo-emoji">💣</span>
                            <span className="ammo-value-overlay">{ghostAmmo.value}</span>
                        </span>
                    </div>
                )}
            </div>
        </Layout2>
    );
};
