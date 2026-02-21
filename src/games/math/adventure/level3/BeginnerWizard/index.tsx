import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './BeginnerWizard.css';

interface BeginnerWizardProps {
    onExit: () => void;
}

type SpellType = 'protect' | 'remove';
type ResolveType = 'none' | 'correct' | 'wrong';

interface RoundProblem {
    animalEmoji: string;
    animalCount: number;
    target: number;
}

const parseTransformOffset = (transform: string | null): { x: number; y: number } => {
    if (!transform || transform === 'none') return { x: 0, y: 0 };
    const matrixMatch = transform.match(/^matrix\((.+)\)$/);
    if (matrixMatch) {
        const parts = matrixMatch[1].split(',').map((v) => Number(v.trim()));
        if (parts.length >= 6 && Number.isFinite(parts[4]) && Number.isFinite(parts[5])) {
            return { x: parts[4], y: parts[5] };
        }
    }
    const matrix3dMatch = transform.match(/^matrix3d\((.+)\)$/);
    if (matrix3dMatch) {
        const parts = matrix3dMatch[1].split(',').map((v) => Number(v.trim()));
        if (parts.length >= 16 && Number.isFinite(parts[12]) && Number.isFinite(parts[13])) {
            return { x: parts[12], y: parts[13] };
        }
    }
    return { x: 0, y: 0 };
};

const FAMILY_TRAVEL_MS = 9800;
const REMOVE_PORTAL_LEAD_MS = 280;
const REMOVE_SUCK_MS = 1100;
const PROTECT_AURA_MS = 780;
const MAGE_CAST_MS = 240;
const ANIMAL_EMOJIS = [
    '🦍', '🐕', '🦝', '🐈‍⬛', '🐅', '🐆', '🫏', '🦓', '🦌', '🦬',
    '🐂', '🐃', '🐖', '🐐', '🐪', '🐫', '🦒', '🐘', '🦣', '🦏',
    '🦛', '🐀', '🐿️', '🦫', '🦔', '🦨'
] as const;
const SKY_EMOJIS = ['☀️', '⛅', '🌧️', '🌨️', '⛈️'] as const;

const pickSkyEmoji = () => SKY_EMOJIS[Math.floor(Math.random() * SKY_EMOJIS.length)];

const createProblem = (): RoundProblem => {
    const animalEmoji = ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)];
    const animalCount = Math.floor(Math.random() * 7) + 3; // 3~9
    const target = Math.random() < 0.5 ? animalCount : 0;
    return { animalEmoji, animalCount, target };
};

export const BeginnerWizard: React.FC<BeginnerWizardProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 75,
        maxDifficulty: 3
    });
    const [problem, setProblem] = React.useState<RoundProblem>(() => createProblem());
    const [skyEmoji, setSkyEmoji] = React.useState<string>(() => pickSkyEmoji());
    const [activeSpell, setActiveSpell] = React.useState<SpellType | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [resolveType, setResolveType] = React.useState<ResolveType>('none');
    const [removeSuckActive, setRemoveSuckActive] = React.useState(false);
    const [protectAuraActive, setProtectAuraActive] = React.useState(false);
    const [isMageCasting, setIsMageCasting] = React.useState(false);
    const [showSpellPadHint, setShowSpellPadHint] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const resolveTimerRef = React.useRef<number | null>(null);
    const roundExpireTimerRef = React.useRef<number | null>(null);
    const removeSuckStartTimerRef = React.useRef<number | null>(null);
    const protectAuraTimerRef = React.useRef<number | null>(null);
    const mageCastTimerRef = React.useRef<number | null>(null);
    const hasShownSpellPadHintRef = React.useRef(false);
    const spellPadHintTimerRef = React.useRef<number | null>(null);
    const stageRef = React.useRef<HTMLDivElement | null>(null);
    const familyRef = React.useRef<HTMLDivElement | null>(null);
    const [cloudCount, setCloudCount] = React.useState(12);
    const [cloudSizePx, setCloudSizePx] = React.useState(62);
    const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });
    const [frozenFamilyTransform, setFrozenFamilyTransform] = React.useState<string | null>(null);

    React.useEffect(() => {
        return () => {
            if (resolveTimerRef.current != null) {
                window.clearTimeout(resolveTimerRef.current);
            }
            if (roundExpireTimerRef.current != null) {
                window.clearTimeout(roundExpireTimerRef.current);
            }
            if (removeSuckStartTimerRef.current != null) {
                window.clearTimeout(removeSuckStartTimerRef.current);
            }
            if (protectAuraTimerRef.current != null) {
                window.clearTimeout(protectAuraTimerRef.current);
            }
            if (mageCastTimerRef.current != null) {
                window.clearTimeout(mageCastTimerRef.current);
            }
            if (spellPadHintTimerRef.current != null) {
                window.clearTimeout(spellPadHintTimerRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (engine.gameState !== 'gameover') return;
        if (spellPadHintTimerRef.current != null) {
            window.clearTimeout(spellPadHintTimerRef.current);
            spellPadHintTimerRef.current = null;
        }
        setShowSpellPadHint(false);
        hasShownSpellPadHintRef.current = false;
    }, [engine.gameState]);

    React.useEffect(() => {
        const isFirstProblem = engine.score === 0 && engine.combo === 0;
        if (
            engine.gameState !== 'playing' ||
            isResolving ||
            !isFirstProblem ||
            hasShownSpellPadHintRef.current
        ) {
            return;
        }

        hasShownSpellPadHintRef.current = true;
        setShowSpellPadHint(true);
    }, [engine.combo, engine.gameState, engine.score, isResolving]);

    React.useEffect(() => {
        if (!showSpellPadHint) return;
        if (spellPadHintTimerRef.current != null) {
            window.clearTimeout(spellPadHintTimerRef.current);
        }
        spellPadHintTimerRef.current = window.setTimeout(() => {
            setShowSpellPadHint(false);
            spellPadHintTimerRef.current = null;
        }, 1800);
        return () => {
            if (spellPadHintTimerRef.current != null) {
                window.clearTimeout(spellPadHintTimerRef.current);
                spellPadHintTimerRef.current = null;
            }
        };
    }, [showSpellPadHint]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing') return;
        const el = stageRef.current;
        if (!el) return;

        const updateCloudCount = () => {
            const width = el.clientWidth || 0;
            const height = el.clientHeight || 0;
            const estimatedCloudSize = Math.max(46, Math.min(76, width * 0.07));
            // Emoji glyph width can vary by platform; use a conservative effective step
            // so the cloud rows always extend past the right edge.
            const overlapStep = estimatedCloudSize * 0.4;
            const targetCloudWidth = Math.max(width + estimatedCloudSize * 10.0, 1500);
            const nextCount = Math.max(28, Math.ceil(targetCloudWidth / overlapStep) + 6);
            setCloudSizePx(Math.round(estimatedCloudSize));
            setCloudCount(nextCount);
            setStageSize({ width, height });
        };

        updateCloudCount();
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(updateCloudCount);
            observer.observe(el);
            return () => observer.disconnect();
        }

        window.addEventListener('resize', updateCloudCount);
        return () => window.removeEventListener('resize', updateCloudCount);
    }, [engine.gameState]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            setProblem(createProblem());
            setSkyEmoji(pickSkyEmoji());
            setActiveSpell(null);
            setIsResolving(false);
            setResolveType('none');
            setRemoveSuckActive(false);
            setProtectAuraActive(false);
            setFrozenFamilyTransform(null);
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    const familyNodes = React.useMemo(() => {
        return Array.from({ length: problem.animalCount }, (_, idx) => idx);
    }, [problem.animalCount]);

    const familyLayout = React.useMemo(() => {
        return familyNodes.map((_, idx) => {
            if (idx === 0) {
                // Leader at front-right
                return { x: 78, y: 52, leader: true };
            }
            const trailIdx = idx - 1;
            const col = trailIdx % 4;
            const row = Math.floor(trailIdx / 4);
            return {
                // Followers behind the leader with a bit more spread so they stay visible
                x: 55 - col * 7 - (row % 2) * 1.5,
                y: 65 + row * 9 + (col % 2 ? -0.5 : 1.5),
                leader: false
            };
        });
    }, [familyNodes]);

    const auraCenterX = React.useMemo(() => {
        if (familyLayout.length === 0) return 55;
        const minX = familyLayout.reduce((acc, node) => Math.min(acc, node.x), familyLayout[0].x);
        const maxX = familyLayout.reduce((acc, node) => Math.max(acc, node.x), familyLayout[0].x);
        return (minX + maxX) / 2;
    }, [familyLayout]);

    const resolveRound = React.useCallback((isCorrect: boolean, spell?: SpellType) => {
        if (roundExpireTimerRef.current != null) {
            window.clearTimeout(roundExpireTimerRef.current);
            roundExpireTimerRef.current = null;
        }
        setResolveType(isCorrect ? 'correct' : 'wrong');
        setIsResolving(true);
        setRemoveSuckActive(false);
        setProtectAuraActive(false);

        const commitResult = () => {
            if (isCorrect) {
                const nextCombo = engine.combo + 1;
                if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                    const rewardTypes: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const reward = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
                    engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
                engine.submitAnswer(true, { skipFeedback: true });
                engine.registerEvent({ type: 'correct' } as any);
            } else {
                engine.submitAnswer(false);
                engine.registerEvent({ type: 'wrong' } as any);
            }
        };

        const scheduleNextRound = (delayMs: number) => {
            if (resolveTimerRef.current != null) {
                window.clearTimeout(resolveTimerRef.current);
            }
            resolveTimerRef.current = window.setTimeout(() => {
                if (engine.gameState !== 'playing') return;
                setProblem(createProblem());
                setSkyEmoji(pickSkyEmoji());
                setActiveSpell(null);
                setIsResolving(false);
                setResolveType('none');
                setFrozenFamilyTransform(null);
                resolveTimerRef.current = null;
            }, delayMs);
        };

        // x0 정답 시: 흡입 애니메이션 완료 후 정답 처리/피드백
        if (isCorrect && spell === 'remove') {
            if (removeSuckStartTimerRef.current != null) {
                window.clearTimeout(removeSuckStartTimerRef.current);
            }
            removeSuckStartTimerRef.current = window.setTimeout(() => {
                setRemoveSuckActive(true);
                removeSuckStartTimerRef.current = null;
            }, REMOVE_PORTAL_LEAD_MS);

            if (resolveTimerRef.current != null) {
                window.clearTimeout(resolveTimerRef.current);
            }
            resolveTimerRef.current = window.setTimeout(() => {
                if (engine.gameState !== 'playing') return;
                commitResult();
                scheduleNextRound(420);
            }, REMOVE_PORTAL_LEAD_MS + REMOVE_SUCK_MS);
            return;
        }

        if (isCorrect && spell === 'protect') {
            if (protectAuraTimerRef.current != null) {
                window.clearTimeout(protectAuraTimerRef.current);
            }
            setProtectAuraActive(true);
            protectAuraTimerRef.current = window.setTimeout(() => {
                if (engine.gameState !== 'playing') return;
                setProtectAuraActive(false);
                commitResult();
                scheduleNextRound(380);
                protectAuraTimerRef.current = null;
            }, PROTECT_AURA_MS);
            return;
        }

        commitResult();
        scheduleNextRound(isCorrect ? 920 : 620);
    }, [engine]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing' || isResolving) return;
        if (roundExpireTimerRef.current != null) {
            window.clearTimeout(roundExpireTimerRef.current);
        }
        roundExpireTimerRef.current = window.setTimeout(() => {
            if (engine.gameState !== 'playing' || isResolving) return;
            if (activeSpell !== null) return;
            resolveRound(false);
        }, FAMILY_TRAVEL_MS + 600);
        return () => {
            if (roundExpireTimerRef.current != null) {
                window.clearTimeout(roundExpireTimerRef.current);
                roundExpireTimerRef.current = null;
            }
        };
    }, [activeSpell, engine.gameState, isResolving, problem, resolveRound]);

    const handleSpellClick = React.useCallback((spell: SpellType) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        if (mageCastTimerRef.current != null) {
            window.clearTimeout(mageCastTimerRef.current);
        }
        setIsMageCasting(false);
        requestAnimationFrame(() => setIsMageCasting(true));
        mageCastTimerRef.current = window.setTimeout(() => {
            setIsMageCasting(false);
            mageCastTimerRef.current = null;
        }, MAGE_CAST_MS);

        const expectedSpell: SpellType = problem.target === 0 ? 'remove' : 'protect';
        const isCorrect = spell === expectedSpell;
        if (isCorrect) {
            const el = familyRef.current;
            if (el) {
                const computedTransform = window.getComputedStyle(el).transform;
                setFrozenFamilyTransform(computedTransform && computedTransform !== 'none' ? computedTransform : null);
            }
        } else {
            setFrozenFamilyTransform(null);
        }
        setActiveSpell(spell);
        resolveRound(isCorrect, spell);
    }, [engine.gameState, isResolving, problem.target, resolveRound]);

    const handleFamilyAnimationEnd = React.useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        // Trigger only when the family walk animation itself ends.
        if (event.target !== event.currentTarget) return;
        if (event.animationName !== 'wizard-family-walk') return;
        if (engine.gameState !== 'playing' || isResolving) return;
        if (activeSpell !== null) return;
        resolveRound(false);
    }, [activeSpell, engine.gameState, isResolving, resolveRound]);

    const targetValue = problem.target;
    const showRemoveMotion = isResolving && activeSpell === 'remove' && resolveType === 'correct';
    const showProtectMotion = isResolving && activeSpell === 'protect' && resolveType === 'correct' && protectAuraActive;
    const isFamilyWalking = engine.gameState === 'playing' && !isResolving;
    const weatherToneClass = React.useMemo(() => {
        if (skyEmoji === '⛈️') return 'weather-storm';
        if (skyEmoji === '🌨️') return 'weather-snow';
        if (skyEmoji === '🌧️') return 'weather-rain';
        if (skyEmoji === '⛅') return 'weather-cloudy';
        return 'weather-sunny';
    }, [skyEmoji]);
    const frozenOffset = React.useMemo(() => parseTransformOffset(frozenFamilyTransform), [frozenFamilyTransform]);
    const familyLeftPx = stageSize.width * 0.06;
    const familyTopPx = stageSize.height * 0.31 + cloudSizePx * 0.05;
    const familyWidthPx = stageSize.width * 0.6;
    const familyHeightPx = cloudSizePx * 1.95;
    const portalXpx = stageSize.width * 0.5;
    const portalYpx = stageSize.height * 0.18;

    return (
        <Layout3
            gameId={GameIds.MATH_BEGINNER_WIZARD}
            title={t('games.beginner-wizard.title')}
            subtitle={t('games.beginner-wizard.subtitle')}
            description={t('games.beginner-wizard.description')}
            instructions={[
                {
                    icon: '🪄',
                    title: t('games.beginner-wizard.howToPlay.step1.title'),
                    description: t('games.beginner-wizard.howToPlay.step1.description')
                },
                {
                    icon: '🛡️',
                    title: t('games.beginner-wizard.howToPlay.step2.title'),
                    description: t('games.beginner-wizard.howToPlay.step2.description')
                },
                {
                    icon: '🕳️',
                    title: t('games.beginner-wizard.howToPlay.step3.title'),
                    description: t('games.beginner-wizard.howToPlay.step3.description')
                }
            ]}
            engine={engine as any}
            onExit={onExit}
            powerUps={[
                {
                    count: engine.powerUps.timeFreeze,
                    color: 'blue',
                    icon: '❄️',
                    title: 'Freeze',
                    onClick: () => engine.activatePowerUp('timeFreeze'),
                    disabledConfig: engine.isTimeFrozen,
                    status: engine.isTimeFrozen ? 'active' : 'normal'
                },
                {
                    count: engine.powerUps.extraLife,
                    color: 'red',
                    icon: '❤️',
                    title: 'Life',
                    onClick: () => engine.activatePowerUp('extraLife'),
                    disabledConfig: engine.lives >= 3,
                    status: engine.lives >= 3 ? 'maxed' : 'normal'
                },
                {
                    count: engine.powerUps.doubleScore,
                    color: 'yellow',
                    icon: '⚡',
                    title: 'Double',
                    onClick: () => engine.activatePowerUp('doubleScore'),
                    disabledConfig: engine.isDoubleScore,
                    status: engine.isDoubleScore ? 'active' : 'normal'
                }
            ]}
            target={{
                value: (
                    <>
                        <span className="beginner-wizard-target-animal">{problem.animalEmoji}</span>
                        <span className="beginner-wizard-target-number">{targetValue}</span>
                    </>
                ),
                label: targetValue === 0 ? t('games.beginner-wizard.ui.removeHint') : t('games.beginner-wizard.ui.protectHint')
            }}
            className={`beginner-wizard-layout ${weatherToneClass}`}
        >
            <div
                ref={stageRef}
                className={`beginner-wizard-stage ${resolveType === 'wrong' ? 'is-wrong' : ''}`}
                style={{ ['--cloud-size-px' as any]: `${cloudSizePx}px` }}
            >
                <div className="beginner-wizard-cloud-rows" aria-hidden>
                    {Array.from({ length: 3 }, (_, rowIdx) => (
                        <div
                            key={rowIdx}
                            className="beginner-wizard-cloud-row"
                            style={{
                                transform: `translate(${Math.round(cloudSizePx * (-0.42 + 0.33 * rowIdx))}px, ${Math.round(cloudSizePx * 0.49 * rowIdx)}px)`
                            }}
                        >
                            <span className="beginner-wizard-cloud-emoji">☁️</span>
                            {Array.from({ length: cloudCount }, (_, cloudIdx) => (
                                <span key={cloudIdx} className="beginner-wizard-cloud-emoji">☁️</span>
                            ))}
                        </div>
                    ))}
                </div>
                <span className="beginner-wizard-sky-cloud" aria-hidden>{skyEmoji}</span>

                <div
                    ref={familyRef}
                    className={`beginner-wizard-family ${isFamilyWalking ? 'is-walking' : ''} ${showRemoveMotion && removeSuckActive ? 'is-removing' : ''}`}
                    style={{
                        ['--family-travel-ms' as any]: `${FAMILY_TRAVEL_MS}ms`,
                        ...(frozenFamilyTransform ? { transform: frozenFamilyTransform } : {})
                    }}
                    onAnimationEnd={handleFamilyAnimationEnd}
                >
                    {familyNodes.map((node, idx) => (
                        (() => {
                            const lx = familyLayout[idx]?.x ?? 18;
                            const ly = familyLayout[idx]?.y ?? 54;
                            const animalXpx = familyLeftPx + frozenOffset.x + (familyWidthPx * lx) / 100;
                            const animalYpx = familyTopPx + frozenOffset.y + (familyHeightPx * ly) / 100;
                            const suckDxPx = portalXpx - animalXpx;
                            const suckDyPx = portalYpx - animalYpx;
                            return (
                                <span
                                    key={node}
                                    className={`beginner-wizard-animal ${familyLayout[idx]?.leader ? 'is-leader' : ''}`}
                                    style={{
                                        left: `${lx}%`,
                                        top: `${ly}%`,
                                        ['--suck-dx-px' as any]: `${Math.round(suckDxPx)}px`,
                                        ['--suck-dy-px' as any]: `${Math.round(suckDyPx)}px`
                                    }}
                                >
                                    {problem.animalEmoji}
                                </span>
                            );
                        })()
                    ))}

                    {showProtectMotion && (
                        <div
                            className="beginner-wizard-protect-aura"
                            style={{ left: `${auraCenterX}%` }}
                            aria-hidden
                        >
                            <span className="spark s1">✨</span>
                            <span className="spark s2">✨</span>
                            <span className="spark s3">✨</span>
                            <span className="spark s4">✨</span>
                            <span className="spark s5">✨</span>
                            <span className="spark s6">✨</span>
                            <span className="spark s7">✨</span>
                            <span className="spark s8">✨</span>
                            <span className="spark s9">✨</span>
                            <span className="spark s10">✨</span>
                            <span className="spark s11">✨</span>
                            <span className="spark s12">✨</span>
                            <span className="spark s13">✨</span>
                            <span className="spark s14">✨</span>
                        </div>
                    )}
                </div>

                {showRemoveMotion && <span className="beginner-wizard-portal" aria-hidden />}

                <div className="beginner-wizard-mage-row">
                    <span className={`beginner-wizard-mage ${isMageCasting ? 'is-casting' : ''}`}>🧙🏾‍♂️</span>
                </div>

                <div className="beginner-wizard-spell-pad">
                    <div className="beginner-wizard-count-panel">
                        <div className="beginner-wizard-count-box">{problem.animalCount}</div>
                    </div>
                    <div className="beginner-wizard-spell-panel">
                        {showSpellPadHint && (
                            <div className="beginner-wizard-spell-hint-overlay" aria-hidden="true">
                                <span className="beginner-wizard-spell-hint-text">
                                    {t('games.beginner-wizard.ui.tapSpellHint', '주문을 탭해!')}
                                </span>
                            </div>
                        )}
                        <div className="beginner-wizard-spell-buttons">
                        <button
                            type="button"
                            className={`spell-btn protect ${activeSpell === 'protect' ? 'is-active' : ''}`}
                            onClick={() => handleSpellClick('protect')}
                            disabled={engine.gameState !== 'playing' || isResolving}
                        >
                            <span className="spell-formula">x1</span>
                        </button>
                        <button
                            type="button"
                            className={`spell-btn remove ${activeSpell === 'remove' ? 'is-active' : ''}`}
                            onClick={() => handleSpellClick('remove')}
                            disabled={engine.gameState !== 'playing' || isResolving}
                        >
                            <span className="spell-formula">x0</span>
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_BEGINNER_WIZARD,
    title: '초보마법사',
    titleKey: 'games.beginner-wizard.title',
    subtitle: '0 또는 1 주문을 외워요!',
    subtitleKey: 'games.beginner-wizard.subtitle',
    description: '목표 숫자에 맞춰 보호/삭제 마법을 선택하세요.',
    descriptionKey: 'games.beginner-wizard.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: BeginnerWizard,
    thumbnail: '🧙',
    tagsKey: 'games.tags.mixedOps'
};
