
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { Layout3 } from '../../../layouts/Standard/Layout3/index';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

import styles from './UFO.module.css';
import { useUFOInvasionLogic } from './GameLogic';

const GAME_ID = 'math-level2-ufo-invasion';

interface UFOInvasionProps {
    onExit?: () => void;
}

const SpaceBackground = () => {
    // Generate static stars for background
    const stars = useRef(Array.from({ length: 50 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: `${2 + Math.random() * 3}s`,
        delay: `${Math.random() * 2}s`
    })));

    return (
        <div className={styles.outerBackground}>
            {stars.current.map((s, i) => (
                <div
                    key={i}
                    className={styles.star}
                    style={{
                        top: s.top,
                        left: s.left,
                        '--duration': s.duration,
                        '--delay': s.delay
                    } as any}
                />
            ))}
        </div>
    );
};

export default function UFOInvasion({ onExit }: UFOInvasionProps) {
    const navigate = useNavigate();
    const handleExit = onExit || (() => navigate(-1));

    const engine = useGameEngine({
        initialTime: 60,
    });

    const {
        ufos,
        rockets,
        effects,
        currentLockedUfo,
        handleSelectUFO,
        handleAnswer,
        powerUps: logicPowerUps,
        activatePowerUp,
        isTimeFrozen,
        isDoubleScore,
        answerOptions
    } = useUFOInvasionLogic(engine);

    // Standard PowerUps for Level 2 (as per STANDARD_GAME_LAYOUT_SYSTEM.md)
    const powerUps: PowerUpBtnProps[] = [
        {
            count: logicPowerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => activatePowerUp('timeFreeze'),
            status: isTimeFrozen ? 'active' : 'normal',
            title: 'Time Freeze',
            disabledConfig: isTimeFrozen || logicPowerUps.timeFreeze <= 0
        },
        {
            count: logicPowerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => activatePowerUp('extraLife'),
            status: engine.lives >= 3 ? 'maxed' : 'normal',
            title: 'Extra Life',
            disabledConfig: engine.lives >= 3 || logicPowerUps.extraLife <= 0
        },
        {
            count: logicPowerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => activatePowerUp('doubleScore'),
            status: isDoubleScore ? 'active' : 'normal',
            title: 'Double Score',
            disabledConfig: isDoubleScore || logicPowerUps.doubleScore <= 0
        }
    ];

    const targetConfig = currentLockedUfo ? {
        value: currentLockedUfo.problem.q,
        label: 'LOCKED ON'
    } : {
        value: '---',
        label: 'SCANNING...'
    };

    return (
        <Layout3
            title="UFO Invasion"
            subtitle="Defend with Math!"
            gameId={GAME_ID}
            engine={engine}
            target={targetConfig}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<SpaceBackground />}
            instructions={[
                { icon: '🛸', title: 'Lock On', description: 'Tap a UFO.' },
                { icon: '🧮', title: 'Fire', description: 'Select the answer.' },
                { icon: '🛡️', title: 'Defend', description: 'Stop them landing!' }
            ]}
        >
            <div className={styles.gameContainer}>
                {/* Answer Options */}
                {answerOptions.length > 0 && (
                    <div className={styles.optionsContainer}>
                        {answerOptions.map(opt => (
                            <button
                                key={opt}
                                className={styles.optionBtn}
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* UFOs */}
                {ufos.map(ufo => {
                    let warningClass = styles.safe;
                    if (ufo.y > 70) warningClass = styles.danger;
                    else if (ufo.y > 40) warningClass = styles.caution;

                    return (
                        <div
                            key={ufo.id}
                            className={`${styles.ufo} ${warningClass} ${ufo.isDying ? styles.correct : ''}`}
                            style={{ left: `${ufo.x}%`, top: `${ufo.y}%` }}
                            onClick={() => handleSelectUFO(ufo.id)}
                        >
                            <span style={{
                                fontSize: ufo.type === 'boss' ? '7rem' : '4rem',
                                transform: ufo.isFlipped ? 'scaleX(-1)' : 'none',
                                display: 'inline-block'
                            }}>
                                🛸
                            </span>
                            {/* HP Bar for Boss */}
                            {ufo.type === 'boss' && (
                                <div className={styles.hpBar}>
                                    <div className={styles.hpFill} style={{ width: `${(ufo.hp / ufo.maxHp) * 100}%` }} />
                                </div>
                            )}
                            {/* Locked Reticle */}
                            {currentLockedUfo?.id === ufo.id && <div className={styles.reticle} />}
                        </div>
                    );
                })}

                {/* Earth Base */}
                <div className={styles.earthBase}>
                    🌍
                </div>

                {/* Rockets */}
                {rockets.map(r => {
                    let transform = 'translate(-50%, -50%)'; // Base centering
                    if (r.visualType === 'left') transform += ' scaleX(-1)';
                    else if (r.visualType === 'center') transform += ' rotate(-45deg)';

                    return (
                        <div
                            key={r.id}
                            className={styles.rocket}
                            style={{
                                '--tx': `${r.targetX}%`,
                                '--ty': `${r.targetY}%`,
                                transform: transform // Override CSS transform if needed, or better, apply to inner content
                                // Actually, styles.rocket likely has its own transform for movement (if using CSS transitions).
                                // Let's check UFO.module.css. Usually movement is handled by specific classes or left/top interpolation.
                                // But here we see style={{ '--tx': ... }} implying CSS variable based movement.
                            } as any}
                        >
                            {/* Apply rotation to the sprite wrapper to avoid conflicting with movement transform if any */}
                            <span
                                className={styles.trail}
                                style={{
                                    transform: r.visualType === 'left' ? 'scaleX(-1)' : (r.visualType === 'center' ? 'rotate(-45deg)' : undefined),
                                    display: 'inline-block'
                                }}
                            >
                                💨
                            </span>
                            <span
                                style={{
                                    transform: r.visualType === 'left' ? 'scaleX(-1)' : (r.visualType === 'center' ? 'rotate(-45deg)' : undefined),
                                    display: 'inline-block'
                                }}
                            >
                                🚀
                            </span>
                        </div>
                    );
                })}

                {/* Effects */}
                {effects.map(e => (
                    <div
                        key={e.id}
                        className={styles.explosion}
                        style={{ left: `${e.x}%`, top: `${e.y}%` }}
                    >
                        {e.type === 'explosion' ? '💥' : (e.type === 'hit' ? '✨' : '')}
                    </div>
                ))}
            </div>
        </Layout3>
    );
}

export const manifest = {
    id: GAME_ID,
    title: 'UFO Invasion',
    subtitle: 'Defend with Math!',
    category: 'math',
    level: 2,
    component: UFOInvasion,
    description: 'Intercept invaders with math!',
    thumbnail: '🛸'
} as const;
