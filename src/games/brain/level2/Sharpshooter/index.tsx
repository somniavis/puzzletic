import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../layouts/Standard/Layout3';
import { useMathArcheryLogic } from './GameLogic';
import manifest_en from './locales/en';
import './MathArchery.css';
import { RisingShapesBackground } from '../../../math/components/RisingShapesBackground';
import type { GameManifest } from '../../../types';
import { GameIds } from '../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

interface SharpshooterProps {
    onExit: () => void;
}


// Reusable Arrow Component
const ArrowSVG = ({ style }: { style: React.CSSProperties }) => (
    <div className="arrow-projectile-container" style={style}>
        {/* Shortened by 1/4 (approx 130 -> 100) */}
        <svg width="20" height="100" viewBox="0 0 20 100" style={{ overflow: 'visible' }}>
            {/* Shaft - 10 to 90 */}
            <line x1="10" y1="10" x2="10" y2="90" stroke="#475569" strokeWidth="4" />
            {/* Arrowhead (Triangle) */}
            <path d="M 10 0 L 16 15 L 4 15 Z" fill="#475569" />
            {/* Fletching (Feathers) */}
            <path d="M 10 85 L 18 95 L 10 90 L 2 95 Z" fill="#dc2626" />
        </svg>
    </div>
);

export const Sharpshooter: React.FC<SharpshooterProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const useMathArcheryLogicReturns = useMathArcheryLogic(2);
    const {
        lives, isPlaying, gameOver,
        currentProblem,
        targetOffsetX,
        lastHitRingScore,
        stuckArrow,
        stats,
        powerUps, timeFrozen, doubleScoreActive,
        startGame, stopTimer, usePowerUp, lastEvent,
        arrow, shootArrow
    } = useMathArcheryLogicReturns;

    // Force blur on problem change (Safari Focus Fix)
    React.useEffect(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, [currentProblem]);

    React.useEffect(() => {
        const newResources = { en: { translation: { games: { sharpshooter: manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        return () => stopTimer();
    }, []);

    // Drag Logic
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);
    const [showPullShootHint, setShowPullShootHint] = useState(false);
    const [isPullShootHintExiting, setIsPullShootHintExiting] = useState(false);
    const hasShownPullShootHintRef = React.useRef(false);
    const pullShootHintTimerRef = React.useRef<number | null>(null);
    const pullShootHintExitTimerRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (!gameOver) return;
        if (pullShootHintTimerRef.current) {
            window.clearTimeout(pullShootHintTimerRef.current);
            pullShootHintTimerRef.current = null;
        }
        if (pullShootHintExitTimerRef.current) {
            window.clearTimeout(pullShootHintExitTimerRef.current);
            pullShootHintExitTimerRef.current = null;
        }
        setShowPullShootHint(false);
        setIsPullShootHintExiting(false);
        hasShownPullShootHintRef.current = false;
    }, [gameOver]);

    React.useEffect(() => {
        const isFirstProblem = stats.correct === 0 && stats.wrong === 0;
        if (!isPlaying || !currentProblem || !isFirstProblem || hasShownPullShootHintRef.current) {
            return;
        }

        hasShownPullShootHintRef.current = true;
        setShowPullShootHint(true);
        setIsPullShootHintExiting(false);

        pullShootHintTimerRef.current = window.setTimeout(() => {
            setIsPullShootHintExiting(true);
            pullShootHintExitTimerRef.current = window.setTimeout(() => {
                setShowPullShootHint(false);
                setIsPullShootHintExiting(false);
                pullShootHintExitTimerRef.current = null;
            }, 220);
            pullShootHintTimerRef.current = null;
        }, 1800);

        return () => {
            if (pullShootHintTimerRef.current) {
                window.clearTimeout(pullShootHintTimerRef.current);
                pullShootHintTimerRef.current = null;
            }
            if (pullShootHintExitTimerRef.current) {
                window.clearTimeout(pullShootHintExitTimerRef.current);
                pullShootHintExitTimerRef.current = null;
            }
        };
    }, [isPlaying, currentProblem, stats.correct, stats.wrong]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isPlaying || gameOver || arrow?.active) return;
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragCurrent({ x: e.clientX, y: e.clientY });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragStart) return;
        setDragCurrent({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
        if (!dragStart || !dragCurrent) return;

        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 20) { // Min pull thresholds
            const shootAngleRad = Math.atan2(-dy, -dx);
            const shootAngleDeg = shootAngleRad * (180 / Math.PI);

            const maxPull = 150;
            const power = Math.min(dist, maxPull) / 5;

            shootArrow(shootAngleDeg, power * 1.25);
        }

        setDragStart(null);
        setDragCurrent(null);
    };

    const powerUpConfig: PowerUpBtnProps[] = [
        { count: powerUps.timeFreeze, color: "blue", icon: "❄️", title: t('games.sharpshooter.powerups.freeze'), onClick: () => usePowerUp('timeFreeze'), disabledConfig: timeFrozen, status: (timeFrozen ? 'active' : 'normal') },
        { count: powerUps.extraLife, color: "red", icon: "❤️", title: t('games.sharpshooter.powerups.life'), onClick: () => usePowerUp('extraLife'), disabledConfig: lives >= 3, status: (lives >= 3 ? 'maxed' : 'normal') },
        { count: powerUps.doubleScore, color: "yellow", icon: "⚡", title: t('games.sharpshooter.powerups.double'), onClick: () => usePowerUp('doubleScore'), disabledConfig: doubleScoreActive, status: (doubleScoreActive ? 'active' : 'normal') }
    ];

    const layoutEngine = {
        ...useMathArcheryLogicReturns,
        gameState: gameOver ? 'gameover' : (isPlaying ? 'playing' : 'idle'),
        maxLevel: 3,
        onPause: stopTimer,
        onResume: startGame,
        onExit: onExit,
        onRestart: () => window.location.reload(),
        lastEvent
    };

    // Calculate Bow String Visualization
    // Cupid/Recurve Design:
    // Handle at Top (Y=30), Tips at Bottom (Y=80)
    // String connects Tips (Y=80)
    const tipY = 80;
    const startX = 10;
    const endX = 110;
    const midX = 60;

    let stringPath = `M ${startX} ${tipY} L ${endX} ${tipY} `;
    let arrowRotation = -90; // Up

    if (dragStart && dragCurrent) {
        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;

        // Clamp pull for visual
        const pullX = Math.max(-50, Math.min(50, dx / 2));
        const pullY = Math.max(0, Math.min(80, dy / 2)); // Pull down positive

        stringPath = `M ${startX} ${tipY} Q ${midX + pullX} ${tipY + pullY} ${endX} ${tipY} `;

        // Arrow rotation
        arrowRotation = Math.atan2(-dy, -dx) * (180 / Math.PI);
    }
    else if (arrow && arrow.active) {
        arrowRotation = arrow.angle;
    }

    return (
        <Layout3
            title={t('games.sharpshooter.title')}
            subtitle={t('games.sharpshooter.subtitle')}
            gameId={GameIds.BRAIN_SHARPSHOOTER}
            engine={layoutEngine as any}
            powerUps={powerUpConfig}
            onExit={onExit}
            className="sharpshooter-layout3"
            target={{ value: '' }}
            instructions={[
                { icon: '🪧', title: t('games.sharpshooter.howToPlay.step1.title'), description: t('games.sharpshooter.howToPlay.step1.description') },
                { icon: '👀', title: t('games.sharpshooter.howToPlay.step2.title'), description: t('games.sharpshooter.howToPlay.step2.description') },
                { icon: '🏹', title: t('games.sharpshooter.howToPlay.step3.title'), description: t('games.sharpshooter.howToPlay.step3.description') }
            ]}
        >
            <>
                <RisingShapesBackground />
                <div className="math-archery-container"
                    style={{ zIndex: 10, position: 'relative' }} /* Ensure above background */
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    {showPullShootHint && (
                        <div className={`archery-pull-shoot-hint ${isPullShootHintExiting ? 'is-exiting' : ''}`}>
                            {t('games.sharpshooter.ui.pullShootHint')}
                        </div>
                    )}

                    {/* Targets */}
                    <div className="archery-target-rail" />
                    <div
                        className="archery-targets-group"
                        style={{ transform: `translate3d(${targetOffsetX}%, 0, 0)` }}
                    >
                        {currentProblem && currentProblem.options.map(opt => (
                            <div key={opt.id} className="archery-target-wrap" style={{ left: `${opt.x}%`, top: `${opt.y}%` }}>
                                <div className="archery-target-connector" />
                                <div className="archery-target">
                                    <span className="archery-target-text">{opt.symbol}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Flying Arrow */}
                    {arrow && arrow.active && (
                        <ArrowSVG
                            style={{
                                position: 'absolute',
                                left: `${arrow.x}%`,
                                top: `${arrow.y}%`,
                                transform: `translate(-50%, -50%) rotate(${arrow.angle + 90}deg)`,
                                zIndex: 15,
                                pointerEvents: 'none'
                            }}
                        />
                    )}

                    {/* Stuck Arrow (hit feedback: 300ms) */}
                    {stuckArrow && currentProblem && (() => {
                        const hitTarget = currentProblem.options.find(opt => opt.id === stuckArrow.targetId);
                        if (!hitTarget) return null;
                        return (
                            <ArrowSVG
                                style={{
                                    position: 'absolute',
                                    left: `calc(${hitTarget.x}% + ${targetOffsetX + stuckArrow.xOffset}%)`,
                                    top: `${hitTarget.y}%`,
                                    // Pin arrow tip (top-center of SVG) to the hit point.
                                    transform: `translate(-50%, 0) rotate(${stuckArrow.angle + 90}deg)`,
                                    transformOrigin: '50% 0%',
                                    zIndex: 16,
                                    pointerEvents: 'none'
                                }}
                            />
                        );
                    })()}

                    {/* Bottom 3-column HUD: target / bow / ring scores */}
                    <div className="archery-bottom-bar">
                        <div className="archery-bottom-cell archery-bottom-left">
                            {currentProblem && (
                                <div className="archery-target-signboard" aria-label="target-symbol-sign">
                                    <span className="archery-target-signboard-label">{t('games.sharpshooter.ui.targetLabel')}</span>
                                    <span className="archery-target-signboard-symbol">{currentProblem.targetSymbol}</span>
                                </div>
                            )}
                        </div>

                        <div className="archery-bottom-cell archery-bottom-center">
                            {/* Bow & Arrow (Visual) */}
                            <div className="bow-control-area">
                                <div className="bow-visual">
                                    {/* Bow Body and String SVG */}
                                    <svg width="120" height="120" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                                        {/* Cupid Bow Shape */}
                                        {/* Tips (10, 80) & (110, 80) */}
                                        {/* Handle (60, 30) */}
                                        {/* Curve: Tip -> Curve Out -> Curve In -> Handle -> ... */}
                                        <path
                                            d="M 10 80 
                                           C 0 60, 30 50, 45 40 
                                           Q 60 20, 75 40 
                                           C 90 50, 120 60, 110 80"
                                            fill="none"
                                            stroke="#854d0e"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* String */}
                                        <path d={stringPath} stroke="#cbd5e1" strokeWidth="2" fill="none" />
                                    </svg>

                                    {/* Resting/Pulled Arrow */}
                                    {(!arrow || !arrow.active) && (
                                        <ArrowSVG
                                            style={{
                                                position: 'absolute',
                                                // Start Arrow Nock at String Midpoint
                                                // Base Y = 80 (String line). Arrow Height = 80. Center = 40.
                                                // To place Nock (80) at String (80), Center must be at 40.
                                                top: 40 + (dragCurrent && dragStart ? Math.min(60, (dragCurrent.y - dragStart.y) / 2) : 0),
                                                left: '50%',
                                                transform: `translate(-50%, -50%) rotate(${arrowRotation + 90}deg)`,
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="archery-bottom-cell archery-bottom-right">
                            <div className="archery-ring-score-card">
                                <div className="archery-ring-score-row"><span className="ring-dot ring-yellow" />10</div>
                                <div className="archery-ring-score-row"><span className="ring-dot ring-blue" />8</div>
                                <div className="archery-ring-score-row"><span className="ring-dot ring-white-outer" />6</div>
                                {lastHitRingScore !== null && (
                                    <div className="archery-last-hit-score">+{lastHitRingScore * 10}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.BRAIN_SHARPSHOOTER,
    title: 'Master Archer',
    titleKey: 'games.sharpshooter.title',
    subtitle: '정답을 맞혀라!',
    subtitleKey: 'games.sharpshooter.subtitle',
    description: 'Solve the equation and shoot the correct target.',
    descriptionKey: 'games.sharpshooter.description',
    category: 'brain',
    level: 2,
    component: Sharpshooter,
    thumbnail: '🏹'
};
