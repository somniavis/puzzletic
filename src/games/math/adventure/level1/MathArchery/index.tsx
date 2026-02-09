import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useMathArcheryLogic } from './GameLogic';
import manifest_en from './locales/en';
import './MathArchery.css';
import { RisingShapesBackground } from '../../../components/RisingShapesBackground';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

interface MathArcheryProps {
    level?: number;
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

export const MathArchery: React.FC<MathArcheryProps> = ({ level = 1, onExit }) => {
    const { t, i18n } = useTranslation();
    const useMathArcheryLogicReturns = useMathArcheryLogic(level);
    const {
        lives, isPlaying, gameOver,
        currentProblem,
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
        const newResources = { en: { translation: { games: { 'math-archery': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
        return () => stopTimer();
    }, []);

    // Drag Logic
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);

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
        { count: powerUps.timeFreeze, color: "blue", icon: "❄️", title: "Freeze", onClick: () => usePowerUp('timeFreeze'), disabledConfig: timeFrozen, status: (timeFrozen ? 'active' : 'normal') },
        { count: powerUps.extraLife, color: "red", icon: "❤️", title: "Life", onClick: () => usePowerUp('extraLife'), disabledConfig: lives >= 3, status: (lives >= 3 ? 'maxed' : 'normal') },
        { count: powerUps.doubleScore, color: "yellow", icon: "⚡", title: "Double", onClick: () => usePowerUp('doubleScore'), disabledConfig: doubleScoreActive, status: (doubleScoreActive ? 'active' : 'normal') }
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
            title={level === 1 ? t('games.math-archery.title-lv1') : t('games.math-archery.title-lv2')}
            subtitle={t('games.math-archery.subtitle')}
            gameId={level === 1 ? GameIds.MATH_ARCHERY_LV1 : GameIds.MATH_ARCHERY_LV2}
            engine={layoutEngine as any}
            powerUps={powerUpConfig}
            onExit={onExit}
            target={{
                value: currentProblem?.equation || "Ready?",
                icon: "🎯"
            }}
            instructions={[
                { icon: '🎯', title: t('games.math-archery.howToPlay.step1.title'), description: t('games.math-archery.howToPlay.step1.description') },
                { icon: '➕', title: t('games.math-archery.howToPlay.step2.title'), description: t('games.math-archery.howToPlay.step2.description') },
                { icon: '🏹', title: t('games.math-archery.howToPlay.step3.title'), description: t('games.math-archery.howToPlay.step3.description') }
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
                    {/* Targets */}
                    {currentProblem && currentProblem.options.map(opt => (
                        <div key={opt.id} className="archery-target" style={{ left: `${opt.x}%`, top: `${opt.y}%` }}>
                            <span className="archery-target-text">{opt.value}</span>
                        </div>
                    ))}

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
            </>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_ARCHERY,
    title: 'Math Archery',
    titleKey: 'games.math-archery.title',
    subtitle: 'Shoot the answer!',
    subtitleKey: 'games.math-archery.subtitle',
    description: 'Solve the equation and shoot the correct target.',
    descriptionKey: 'games.math-archery.description',
    category: 'math',
    level: 1,
    component: MathArchery,
    thumbnail: '🏹'
};
