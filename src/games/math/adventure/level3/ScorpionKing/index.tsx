import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import { useNurturing } from '../../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../../data/characters';
import { JelloAvatar } from '../../../../../components/characters/JelloAvatar';
import type { EvolutionStage } from '../../../../../types/character';
import './ScorpionKing.css';

interface ScorpionKingProps {
    onExit: () => void;
}

interface ScorpionKingRound {
    key: string;
    maxHp: number;
    attackPower: number;
    correctHits: number;
    choices: number[];
    expression: string;
}

type ArenaFeedback = 'correct' | 'wrong' | null;
type ArenaCurtainState = 'idle' | 'closing' | 'opening';
type PowerUpRewardType = 'timeFreeze' | 'extraLife' | 'doubleScore';

const CURTAIN_CLOSE_MS = 560;
const CURTAIN_HOLD_MS = 800;
const CURTAIN_OPEN_MS = 560;
const ENEMY_ATTACK_INTERVAL_MS = 3000;
const ENEMY_ATTACK_HIT_DELAY_MS = 520;
const PLAYER_ATTACK_HIT_DELAY_MS = 680;
const PLAYER_ATTACK_REPEAT_DELAY_MS = 900;
const ROUND_WRONG_DELAY_MS = 420;
const ROUND_CORRECT_DELAY_MS = 760;
const POWER_UP_REWARD_TYPES: PowerUpRewardType[] = ['timeFreeze', 'extraLife', 'doubleScore'];
const DIFFICULTY_HIT_RANGES = {
    1: { min: 2, max: 4 },
    2: { min: 4, max: 7 },
    3: { min: 6, max: 9 }
} as const;

const TIMES_TABLE_ROUNDS: ScorpionKingRound[] = Array.from({ length: 8 }, (_, divisorIndex) => divisorIndex + 2)
    .flatMap(divisor =>
        Array.from({ length: 8 }, (_, quotientIndex) => quotientIndex + 2).map(quotient => {
            const maxHp = divisor * quotient;
            const distractor =
                quotient >= 9 ? quotient - 1 :
                    quotient <= 2 ? quotient + 1 :
                        Math.random() > 0.5 ? quotient + 1 : quotient - 1;

            const choices = Math.random() > 0.5 ? [quotient, distractor] : [distractor, quotient];

            return {
                key: `${maxHp}-${divisor}-${quotient}`,
                maxHp,
                attackPower: divisor,
                correctHits: quotient,
                choices,
                expression: `${maxHp} ÷ ${divisor} = ?`
            };
        })
    );

const ROUNDS_BY_DIFFICULTY = {
    1: TIMES_TABLE_ROUNDS.filter(round => round.correctHits >= DIFFICULTY_HIT_RANGES[1].min && round.correctHits <= DIFFICULTY_HIT_RANGES[1].max),
    2: TIMES_TABLE_ROUNDS.filter(round => round.correctHits >= DIFFICULTY_HIT_RANGES[2].min && round.correctHits <= DIFFICULTY_HIT_RANGES[2].max),
    3: TIMES_TABLE_ROUNDS.filter(round => round.correctHits >= DIFFICULTY_HIT_RANGES[3].min && round.correctHits <= DIFFICULTY_HIT_RANGES[3].max)
} as const;

const createScorpionKingRound = (difficultyLevel: number, previousKey?: string | null): ScorpionKingRound => {
    const difficultyRounds =
        ROUNDS_BY_DIFFICULTY[difficultyLevel as keyof typeof ROUNDS_BY_DIFFICULTY]
        ?? ROUNDS_BY_DIFFICULTY[1];
    const candidates = previousKey
        ? difficultyRounds.filter(round => round.key !== previousKey)
        : difficultyRounds;
    return candidates[Math.floor(Math.random() * candidates.length)] ?? difficultyRounds[0] ?? TIMES_TABLE_ROUNDS[0];
};

export const ScorpionKing: React.FC<ScorpionKingProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const nurturing = useNurturing();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 3,
        difficultyThresholds: {
            promoteStreak: 2,
            promoteTotal: 3,
            demoteStreak: 2
        }
    });
    const previousRoundKeyRef = React.useRef<string | null>(null);
    const difficultyLevelRef = React.useRef(engine.difficultyLevel);
    const [round, setRound] = React.useState<ScorpionKingRound>(() => createScorpionKingRound(1));
    const [jelloHp, setJelloHp] = React.useState(round.maxHp);
    const [scorpionHp, setScorpionHp] = React.useState(round.maxHp);
    const [isResolving, setIsResolving] = React.useState(false);
    const [selectedHits, setSelectedHits] = React.useState<number | null>(null);
    const [jelloHitPulse, setJelloHitPulse] = React.useState(0);
    const [scorpionHitPulse, setScorpionHitPulse] = React.useState(0);
    const [jelloAttackPulse, setJelloAttackPulse] = React.useState(0);
    const [scorpionAttackPulse, setScorpionAttackPulse] = React.useState(0);
    const [arenaFeedback, setArenaFeedback] = React.useState<ArenaFeedback>(null);
    const [arenaCurtainState, setArenaCurtainState] = React.useState<ArenaCurtainState>('idle');
    const enemyAttackTimerRef = React.useRef<number | null>(null);
    const resolveTimerRef = React.useRef<number | null>(null);
    const comboTimerRef = React.useRef<number | null>(null);
    const curtainTimerRef = React.useRef<number | null>(null);
    const curtainHoldTimerRef = React.useRef<number | null>(null);
    const hitsHintTimerRef = React.useRef<number | null>(null);
    const hitsHintExitTimerRef = React.useRef<number | null>(null);
    const hasShownHitsHintRef = React.useRef(false);
    const submitAnswerRef = React.useRef(engine.submitAnswer);
    const [showHitsHint, setShowHitsHint] = React.useState(false);
    const [isHitsHintExiting, setIsHitsHintExiting] = React.useState(false);
    const {
        gameState,
        lives,
        combo,
        difficultyLevel,
        powerUps: enginePowerUps,
        isTimeFrozen,
        isDoubleScore,
        activatePowerUp,
        registerEvent,
        setPowerUps
    } = engine;

    const clearEnemyAttackTimer = React.useCallback(() => {
        if (enemyAttackTimerRef.current !== null) {
            window.clearInterval(enemyAttackTimerRef.current);
            enemyAttackTimerRef.current = null;
        }
    }, []);

    const clearResolveTimers = React.useCallback(() => {
        if (resolveTimerRef.current !== null) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
        if (comboTimerRef.current !== null) {
            window.clearTimeout(comboTimerRef.current);
            comboTimerRef.current = null;
        }
        if (curtainTimerRef.current !== null) {
            window.clearTimeout(curtainTimerRef.current);
            curtainTimerRef.current = null;
        }
        if (curtainHoldTimerRef.current !== null) {
            window.clearTimeout(curtainHoldTimerRef.current);
            curtainHoldTimerRef.current = null;
        }
        if (hitsHintTimerRef.current !== null) {
            window.clearTimeout(hitsHintTimerRef.current);
            hitsHintTimerRef.current = null;
        }
        if (hitsHintExitTimerRef.current !== null) {
            window.clearTimeout(hitsHintExitTimerRef.current);
            hitsHintExitTimerRef.current = null;
        }
    }, []);

    const beginEnemyAttackLoop = React.useCallback((activeRound: ScorpionKingRound) => {
        clearEnemyAttackTimer();
        enemyAttackTimerRef.current = window.setInterval(() => {
            setScorpionAttackPulse(prev => prev + 1);
            comboTimerRef.current = window.setTimeout(() => {
                setJelloHitPulse(prev => prev + 1);
                setJelloHp(prev => {
                    const nextHp = Math.max(0, prev - activeRound.attackPower);
                    if (nextHp <= 0) {
                        clearEnemyAttackTimer();
                        clearResolveTimers();
                        setIsResolving(true);
                        resolveTimerRef.current = window.setTimeout(() => {
                            submitAnswerRef.current(false);
                        }, 360);
                    }
                    return nextHp;
                });
            }, ENEMY_ATTACK_HIT_DELAY_MS);
        }, ENEMY_ATTACK_INTERVAL_MS);
    }, [clearEnemyAttackTimer, clearResolveTimers]);

    const startRound = React.useCallback((nextRound: ScorpionKingRound) => {
        clearEnemyAttackTimer();
        clearResolveTimers();
        setRound(nextRound);
        setJelloHp(nextRound.maxHp);
        setScorpionHp(nextRound.maxHp);
        setIsResolving(false);
        setSelectedHits(null);
        setJelloHitPulse(0);
        setScorpionHitPulse(0);
        setJelloAttackPulse(0);
        setScorpionAttackPulse(0);
        setArenaFeedback(null);
        setArenaCurtainState('idle');
    }, [clearEnemyAttackTimer, clearResolveTimers]);

    const transitionToNextRound = React.useCallback(() => {
        setArenaCurtainState('closing');
        curtainTimerRef.current = window.setTimeout(() => {
            curtainHoldTimerRef.current = window.setTimeout(() => {
                const nextRound = createScorpionKingRound(difficultyLevelRef.current, previousRoundKeyRef.current);
                previousRoundKeyRef.current = nextRound.key;
                startRound(nextRound);
                setArenaCurtainState('opening');
                curtainTimerRef.current = window.setTimeout(() => {
                    setArenaCurtainState('idle');
                }, CURTAIN_OPEN_MS);
            }, CURTAIN_HOLD_MS);
        }, CURTAIN_CLOSE_MS);
    }, [startRound]);

    const maybeAwardComboPowerUp = React.useCallback((nextCombo: number) => {
        if (nextCombo > 0 && nextCombo % 3 === 0 && Math.random() > 0.45) {
            const reward = POWER_UP_REWARD_TYPES[Math.floor(Math.random() * POWER_UP_REWARD_TYPES.length)];
            setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
        }
    }, [setPowerUps]);

    React.useEffect(() => {
        difficultyLevelRef.current = difficultyLevel;
    }, [difficultyLevel]);

    const powerUps = React.useMemo(() => ([
        {
            count: enginePowerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.scorpion-king.powerups.timeFreeze'),
            onClick: () => activatePowerUp('timeFreeze'),
            disabledConfig: isTimeFrozen,
            status: isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: enginePowerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.scorpion-king.powerups.extraLife'),
            onClick: () => activatePowerUp('extraLife'),
            disabledConfig: lives >= 3,
            status: lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: enginePowerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.scorpion-king.powerups.doubleScore'),
            onClick: () => activatePowerUp('doubleScore'),
            disabledConfig: isDoubleScore,
            status: isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [activatePowerUp, enginePowerUps.doubleScore, enginePowerUps.extraLife, enginePowerUps.timeFreeze, isDoubleScore, isTimeFrozen, lives, t]);

    const instructions = React.useMemo(() => ([
        {
            icon: '❤️',
            title: t('games.scorpion-king.howToPlay.step1.title'),
            description: t('games.scorpion-king.howToPlay.step1.description')
        },
        {
            icon: '🔢',
            title: t('games.scorpion-king.howToPlay.step2.title'),
            description: t('games.scorpion-king.howToPlay.step2.description')
        },
        {
            icon: '⚔️',
            title: t('games.scorpion-king.howToPlay.step3.title'),
            description: t('games.scorpion-king.howToPlay.step3.description')
        }
    ]), [t]);

    const currentJello = React.useMemo(() => {
        const id = nurturing.speciesId || 'yellowJello';
        const char = createCharacter(id);
        char.evolutionStage = Math.min(5, Math.max(1, nurturing.evolutionStage || 1)) as EvolutionStage;
        if (nurturing.characterName) {
            char.name = nurturing.characterName;
        }
        return { id, char };
    }, [nurturing.speciesId, nurturing.evolutionStage, nurturing.characterName]);

    const jelloWrapperClassName = React.useMemo(() => [
        'scorpion-king-jello-wrapper',
        currentJello.char.evolutionStage <= 2 ? 'baby' : '',
        currentJello.char.evolutionStage === 5 ? 'legendary' : ''
    ].filter(Boolean).join(' '), [currentJello.char.evolutionStage]);
    const jelloAttackClassName = jelloAttackPulse === 0 ? '' : (jelloAttackPulse % 2 === 0 ? 'is-attack-even' : 'is-attack-odd');
    const jelloHitClassName = jelloHitPulse === 0 ? '' : (jelloHitPulse % 2 === 0 ? 'is-hit-even' : 'is-hit-odd');
    const scorpionAttackClassName = scorpionAttackPulse === 0 ? '' : (scorpionAttackPulse % 2 === 0 ? 'is-attack-even' : 'is-attack-odd');
    const scorpionHitClassName = scorpionHitPulse === 0 ? '' : (scorpionHitPulse % 2 === 0 ? 'is-hit-even' : 'is-hit-odd');

    React.useEffect(() => {
        submitAnswerRef.current = engine.submitAnswer;
    }, [engine.submitAnswer]);

    React.useEffect(() => {
        if (gameState !== 'playing') {
            clearEnemyAttackTimer();
            clearResolveTimers();
            setShowHitsHint(false);
            setIsHitsHintExiting(false);
            if (gameState === 'idle' || gameState === 'gameover') {
                hasShownHitsHintRef.current = false;
            }
            return;
        }

        const nextRound = createScorpionKingRound(difficultyLevelRef.current, previousRoundKeyRef.current);
        previousRoundKeyRef.current = nextRound.key;
        startRound(nextRound);
        beginEnemyAttackLoop(nextRound);

        return () => {
            clearEnemyAttackTimer();
            clearResolveTimers();
        };
    }, [beginEnemyAttackLoop, clearEnemyAttackTimer, clearResolveTimers, gameState, startRound]);

    React.useEffect(() => {
        const isFirstProblem = engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (gameState !== 'playing' || !isFirstProblem) {
            setShowHitsHint(false);
            setIsHitsHintExiting(false);
            return;
        }

        if (hasShownHitsHintRef.current) {
            return;
        }

        hasShownHitsHintRef.current = true;
        setShowHitsHint(true);
        setIsHitsHintExiting(false);

        hitsHintTimerRef.current = window.setTimeout(() => {
            setIsHitsHintExiting(true);
            hitsHintExitTimerRef.current = window.setTimeout(() => {
                setShowHitsHint(false);
                setIsHitsHintExiting(false);
                hitsHintExitTimerRef.current = null;
            }, 220);
            hitsHintTimerRef.current = null;
        }, 1800);

        return () => {
            if (hitsHintTimerRef.current !== null) {
                window.clearTimeout(hitsHintTimerRef.current);
                hitsHintTimerRef.current = null;
            }
            if (hitsHintExitTimerRef.current !== null) {
                window.clearTimeout(hitsHintExitTimerRef.current);
                hitsHintExitTimerRef.current = null;
            }
        };
    }, [engine.stats.correct, engine.stats.wrong, gameState]);

    const handleChoiceSelect = React.useCallback((hits: number) => {
        if (gameState !== 'playing' || isResolving) {
            return;
        }

        setSelectedHits(hits);
        setIsResolving(true);
        clearEnemyAttackTimer();
        clearResolveTimers();
        setJelloHitPulse(0);
        setScorpionAttackPulse(0);

        if (hits !== round.correctHits) {
            setArenaFeedback('wrong');
            setJelloHitPulse(prev => prev + 1);
            resolveTimerRef.current = window.setTimeout(() => {
                submitAnswerRef.current(false, { skipFeedback: true });
                registerEvent({ type: 'wrong' });
                if (lives > 1) {
                    setIsResolving(false);
                    setSelectedHits(null);
                    setArenaFeedback(null);
                    beginEnemyAttackLoop(round);
                }
            }, ROUND_WRONG_DELAY_MS);
            return;
        }

        setArenaFeedback('correct');
        let completedHits = 0;

        const runAttack = () => {
            setJelloAttackPulse(prev => prev + 1);
            comboTimerRef.current = window.setTimeout(() => {
                setScorpionHitPulse(prev => prev + 1);
                setScorpionHp(prev => Math.max(0, prev - round.attackPower));
                completedHits += 1;

                if (completedHits >= hits) {
                    resolveTimerRef.current = window.setTimeout(() => {
                        maybeAwardComboPowerUp(combo + 1);
                        submitAnswerRef.current(true, { skipFeedback: true });
                        registerEvent({ type: 'correct' });
                        transitionToNextRound();
                    }, ROUND_CORRECT_DELAY_MS);
                    return;
                }

                resolveTimerRef.current = window.setTimeout(runAttack, PLAYER_ATTACK_REPEAT_DELAY_MS);
            }, PLAYER_ATTACK_HIT_DELAY_MS);
        };

        runAttack();
    }, [beginEnemyAttackLoop, clearEnemyAttackTimer, clearResolveTimers, combo, gameState, isResolving, lives, maybeAwardComboPowerUp, registerEvent, round, transitionToNextRound]);

    const jelloHpPercent = (jelloHp / round.maxHp) * 100;
    const scorpionHpPercent = (scorpionHp / round.maxHp) * 100;
    const arenaClassName = [
        'scorpion-king-arena',
        arenaFeedback ? `is-${arenaFeedback}` : '',
        arenaCurtainState !== 'idle' ? `is-curtain-${arenaCurtainState}` : ''
    ].filter(Boolean).join(' ');

    return (
        <Layout2
            title={t('games.scorpion-king.title')}
            subtitle={t('games.scorpion-king.subtitle')}
            description={t('games.scorpion-king.description')}
            gameId={GameIds.MATH_SCORPION_KING}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            instructions={instructions}
            className="scorpion-king-layout2"
            cardBackground={<div className="scorpion-king-card-bg" />}
        >
            <section className="scorpion-king-stage" aria-label={t('games.scorpion-king.ui.boardAriaLabel')}>
                <div className="scorpion-king-scene">
                    <section className="scorpion-king-top-panel" aria-label="status area">
                        <div className="scorpion-king-top-row scorpion-king-top-row-bars">
                            <div className="scorpion-king-hp-card scorpion-king-hp-card-jello">
                                <div className="scorpion-king-hp-card__bar-shell">
                                    <div className="scorpion-king-hp-card__bar">
                                        <div className="scorpion-king-hp-card__fill scorpion-king-hp-card__fill-jello" style={{ width: `${jelloHpPercent}%` }} />
                                        <span className="scorpion-king-hp-card__value">HP. {jelloHp}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="scorpion-king-top-divider">VS</div>
                            <div className="scorpion-king-hp-card scorpion-king-hp-card-scorpion">
                                <div className="scorpion-king-hp-card__bar-shell">
                                    <div className="scorpion-king-hp-card__bar">
                                        <div className="scorpion-king-hp-card__fill scorpion-king-hp-card__fill-scorpion" style={{ width: `${scorpionHpPercent}%` }} />
                                        <span className="scorpion-king-hp-card__value">HP. {scorpionHp}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="scorpion-king-arena-panel" aria-label="arena area">
                        <div className={arenaClassName}>
                            <div className="scorpion-king-arena-curtain scorpion-king-arena-curtain-left" aria-hidden="true" />
                            <div className="scorpion-king-arena-curtain scorpion-king-arena-curtain-right" aria-hidden="true" />
                            <div
                                className={[
                                    'scorpion-king-fighter',
                                    'scorpion-king-fighter-jello',
                                    isResolving ? 'is-resolving' : '',
                                    jelloAttackClassName,
                                    jelloHitClassName
                                ].join(' ')}
                            >
                                <div
                                    className={[
                                        'scorpion-king-jello-platform',
                                        jelloAttackClassName,
                                        jelloHitClassName
                                    ].join(' ')}
                                >
                                    <div className={jelloWrapperClassName}>
                                        <JelloAvatar
                                            character={currentJello.char}
                                            speciesId={currentJello.id}
                                            size="small"
                                            action="idle"
                                            responsive
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="scorpion-king-arena-center-badge">{round.expression}</div>
                            <div
                                className={[
                                    'scorpion-king-fighter',
                                    'scorpion-king-fighter-scorpion',
                                    isResolving ? 'is-resolving' : '',
                                    scorpionAttackClassName,
                                    scorpionHitClassName
                                ].join(' ')}
                            >
                                <div
                                    className={[
                                        'scorpion-king-scorpion-wrap',
                                        scorpionAttackClassName,
                                        scorpionHitClassName
                                    ].join(' ')}
                                >
                                    <div className="scorpion-king-scorpion-angry" aria-hidden="true">💢</div>
                                    <div className="scorpion-king-scorpion-emoji" aria-hidden="true">🦂</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section
                    className="scorpion-king-bottom-panel"
                    aria-label="action area"
                >
                        <button className="scorpion-king-attack-button" type="button">
                            <span className="scorpion-king-attack-button__icon">⚔️</span>
                            <span className="scorpion-king-attack-button__text">{t('character.tags.attack')} {round.attackPower}</span>
                        </button>
                    {round.choices.map(choice => (
                        <button
                            key={choice}
                            className={[
                                'scorpion-king-choice-button',
                                selectedHits === choice && arenaFeedback ? `is-${arenaFeedback}` : ''
                            ].filter(Boolean).join(' ')}
                            type="button"
                            onClick={() => handleChoiceSelect(choice)}
                            disabled={isResolving}
                            aria-pressed={selectedHits === choice}
                        >
                            {choice}
                        </button>
                    ))}
                </section>
                {showHitsHint ? (
                    <div className={`scorpion-king-hits-hint ${isHitsHintExiting ? 'is-exiting' : ''}`}>
                        {t('games.scorpion-king.ui.hitsHint')}
                    </div>
                ) : null}
            </section>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_SCORPION_KING,
    title: 'Scorpion King',
    titleKey: 'games.scorpion-king.title',
    subtitle: 'How Many Hits?',
    subtitleKey: 'games.scorpion-king.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.scorpion-king.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: ScorpionKing,
    thumbnail: '🦂',
    tagsKey: 'games.tags.division'
};
