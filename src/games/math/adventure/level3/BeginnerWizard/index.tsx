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
    animalCount: number;
    target: number;
}

const ANIMAL_EMOJI = '🦍';

const createProblem = (): RoundProblem => {
    const animalCount = Math.floor(Math.random() * 7) + 3; // 3~9
    const target = Math.random() < 0.5 ? animalCount : 0;
    return { animalCount, target };
};

export const BeginnerWizard: React.FC<BeginnerWizardProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 75,
        maxDifficulty: 3
    });
    const [problem, setProblem] = React.useState<RoundProblem>(() => createProblem());
    const [activeSpell, setActiveSpell] = React.useState<SpellType | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [resolveType, setResolveType] = React.useState<ResolveType>('none');
    const prevGameStateRef = React.useRef(engine.gameState);
    const resolveTimerRef = React.useRef<number | null>(null);
    const stageRef = React.useRef<HTMLDivElement | null>(null);
    const [cloudCount, setCloudCount] = React.useState(9);

    React.useEffect(() => {
        return () => {
            if (resolveTimerRef.current != null) {
                window.clearTimeout(resolveTimerRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const updateCloudCount = () => {
            const width = el.clientWidth || 0;
            const next = Math.max(9, Math.round(width / 46));
            setCloudCount(next);
        };

        updateCloudCount();
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(updateCloudCount);
            observer.observe(el);
            return () => observer.disconnect();
        }

        window.addEventListener('resize', updateCloudCount);
        return () => window.removeEventListener('resize', updateCloudCount);
    }, []);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            setProblem(createProblem());
            setActiveSpell(null);
            setIsResolving(false);
            setResolveType('none');
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    const familyNodes = React.useMemo(() => {
        return Array.from({ length: problem.animalCount }, (_, idx) => idx);
    }, [problem.animalCount]);

    const resolveRound = React.useCallback((isCorrect: boolean) => {
        setResolveType(isCorrect ? 'correct' : 'wrong');
        setIsResolving(true);

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

        if (resolveTimerRef.current != null) {
            window.clearTimeout(resolveTimerRef.current);
        }
        resolveTimerRef.current = window.setTimeout(() => {
            if (engine.gameState !== 'playing') return;
            setProblem(createProblem());
            setActiveSpell(null);
            setIsResolving(false);
            setResolveType('none');
            resolveTimerRef.current = null;
        }, isCorrect ? 920 : 620);
    }, [engine]);

    const handleSpellClick = React.useCallback((spell: SpellType) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        setActiveSpell(spell);
        const expectedSpell: SpellType = problem.target === 0 ? 'remove' : 'protect';
        resolveRound(spell === expectedSpell);
    }, [engine.gameState, isResolving, problem.target, resolveRound]);

    const targetValue = problem.target;
    const showProtectMotion = isResolving && activeSpell === 'protect' && resolveType === 'correct';
    const showRemoveMotion = isResolving && activeSpell === 'remove' && resolveType === 'correct';

    return (
        <Layout3
            gameId={GameIds.MATH_BEGINNER_WIZARD}
            title={t('games.beginner-wizard.title')}
            subtitle={t('games.beginner-wizard.subtitle')}
            description={t('games.beginner-wizard.description')}
            instructions={[
                {
                    icon: '🎯',
                    title: t('games.beginner-wizard.howToPlay.step1.title'),
                    description: t('games.beginner-wizard.howToPlay.step1.description')
                },
                {
                    icon: '🪄',
                    title: t('games.beginner-wizard.howToPlay.step2.title'),
                    description: t('games.beginner-wizard.howToPlay.step2.description')
                },
                {
                    icon: '🐾',
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
                value: String(targetValue),
                label: t('games.beginner-wizard.ui.targetLabel')
            }}
            className="beginner-wizard-layout"
        >
            <div ref={stageRef} className={`beginner-wizard-stage ${resolveType === 'wrong' ? 'is-wrong' : ''}`}>
                <div className="beginner-wizard-cloud-rows" aria-hidden>
                    {Array.from({ length: 4 }, (_, rowIdx) => (
                        <div key={rowIdx} className="beginner-wizard-cloud-row" style={{ marginLeft: `${rowIdx * 3}%` }}>
                            {Array.from({ length: cloudCount }, (_, cloudIdx) => (
                                <span key={cloudIdx} className="beginner-wizard-cloud-emoji">☁️</span>
                            ))}
                        </div>
                    ))}
                </div>

                <div className={`beginner-wizard-family ${showProtectMotion ? 'is-protect-moving' : ''} ${showRemoveMotion ? 'is-removing' : ''}`}>
                    {familyNodes.map((node, idx) => (
                        <span
                            key={node}
                            className={`beginner-wizard-animal ${idx === 0 ? 'is-leader' : ''}`}
                            style={{
                                left: `${10 + (idx % 5) * 16}%`,
                                top: `${40 + Math.floor(idx / 5) * 18}%`
                            }}
                        >
                            {ANIMAL_EMOJI}
                        </span>
                    ))}
                    {showRemoveMotion && (
                        <span className="beginner-wizard-poof">✨</span>
                    )}
                </div>

                <div className="beginner-wizard-mage-row">
                    <span className="beginner-wizard-mage">🧙🏾‍♂️</span>
                </div>

                <div className="beginner-wizard-spell-pad">
                    <button
                        type="button"
                        className={`spell-btn protect ${activeSpell === 'protect' ? 'is-active' : ''}`}
                        onClick={() => handleSpellClick('protect')}
                        disabled={engine.gameState !== 'playing' || isResolving}
                    >
                        <span className="spell-icon">🛡️</span>
                        <span className="spell-formula">x1</span>
                    </button>
                    <button
                        type="button"
                        className={`spell-btn remove ${activeSpell === 'remove' ? 'is-active' : ''}`}
                        onClick={() => handleSpellClick('remove')}
                        disabled={engine.gameState !== 'playing' || isResolving}
                    >
                        <span className="spell-icon">🕳️</span>
                        <span className="spell-formula">x0</span>
                    </button>
                </div>
            </div>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_BEGINNER_WIZARD,
    title: '초보마법사',
    titleKey: 'games.beginner-wizard.title',
    subtitle: '마법으로 동물 가족을 지켜요!',
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
