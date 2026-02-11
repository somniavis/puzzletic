
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    DndContext,
    type DragEndEvent,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    KeyboardSensor
} from '@dnd-kit/core';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useCargoTrainLogic } from './GameLogic';
import { GameIds } from '../../../../../constants/gameIds';
import { DistantScene } from './DistantScene';
import { TrainSkeleton } from './TrainSkeleton';
import { DraggableCargo } from './DraggableCargo';
import styles from './styles.module.css';

const GAME_ID = GameIds.MATH_CARGO_TRAIN;

export default function CargoTrain() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Use the unified logic hook
    const gameLogic = useCargoTrainLogic();
    const { currentProblem, checkAnswer, isTransitioning, score } = gameLogic;

    // Distant Train Animation Trigger
    const [triggerTrain, setTriggerTrain] = useState(false);

    // Train Animation State (Game Train)
    const [trainState, setTrainState] = useState<'idle' | 'departing' | 'arriving'>('idle');

    // Filled Cargo State (Visual)
    const [filledValue, setFilledValue] = useState<number | null>(null);

    // Trigger animations based on score & problem change
    useEffect(() => {
        // ... (existing animation logic)
        if (score > 0) {
            // Success! Trigger animations
            // 1. Feedback (Instant)

            // 2. Train Depart (1s delay)
            const departTimer = setTimeout(() => {
                setTrainState('departing');
            }, 1000);

            // 3. Distant Train (2s delay + 2s animation = 4s? No, user said AFTER train departs)
            // Train departs at 1s, takes 2s to leave -> Total 3s.
            // Let's trigger Distant Train at 2.5s to start overlap or 3s.
            const distantTimer = setTimeout(() => {
                setTriggerTrain(true);
            }, 3000);

            // Reset triggers
            const resetDistant = setTimeout(() => setTriggerTrain(false), 9000); // Allow time for slow animation

            return () => {
                clearTimeout(departTimer);
                clearTimeout(distantTimer);
                clearTimeout(resetDistant);
            };
        }
    }, [score]);

    // When problem changes (after logic timeout), trigger arrival
    useEffect(() => {
        if (currentProblem) {
            // Reset filled value for new problem
            setFilledValue(null);

            // New problem arrived or initial load
            // Only play arrive animation if we are not initial load (or check score)
            // But simple check: if we were departing, now we arrive
            setTrainState(prev => prev === 'departing' ? 'arriving' : 'idle');

            // Allow animation to play then reset to idle
            const timer = setTimeout(() => setTrainState('idle'), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentProblem]);

    // ...

    // dnd-kit Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Prevent accidental drags on click
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Slight delay to distinguish scroll vs drag
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && over.id === 'train-gap') {
            // active.data.current?.value holds the number
            const draggedValue = active.data.current?.value;
            if (draggedValue !== undefined) {
                checkAnswer(draggedValue);
                // Visual Update if correct
                if (currentProblem && draggedValue === currentProblem.missing) {
                    setFilledValue(draggedValue);
                }
            }
        }
    };

    // Standard PowerUps (Freeze, Life, Double)
    const powerUps = useMemo(() => [
        {
            count: gameLogic.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => gameLogic.activatePowerUp('timeFreeze'),
            status: (gameLogic.isTimeFrozen ? 'active' : 'normal') as 'active' | 'normal' | 'maxed',
            title: t('powerUps.timeFreeze', 'Freeze'),
            disabledConfig: gameLogic.isTimeFrozen
        },
        {
            count: gameLogic.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => gameLogic.activatePowerUp('extraLife'),
            status: (gameLogic.lives >= 3 ? 'maxed' : 'normal') as 'active' | 'normal' | 'maxed',
            title: t('powerUps.extraLife', 'Life'),
            disabledConfig: gameLogic.lives >= 3
        },
        {
            count: gameLogic.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => gameLogic.activatePowerUp('doubleScore'),
            status: (gameLogic.isDoubleScore ? 'active' : 'normal') as 'active' | 'normal' | 'maxed',
            title: t('powerUps.doubleScore', 'Double'),
            disabledConfig: gameLogic.isDoubleScore
        }
    ], [t, gameLogic.powerUps, gameLogic.isTimeFrozen, gameLogic.lives, gameLogic.isDoubleScore, gameLogic.activatePowerUp]);

    return (
        <Layout2
            title={t('games.cargoTrain.title', 'Cargo Train')}
            subtitle={t('games.cargoTrain.subtitle', 'Make 100!')}
            gameId={GAME_ID}
            engine={gameLogic}
            powerUps={powerUps}
            onExit={() => navigate(-1)}
            cardBackground={
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div className={styles.skyArea} />
                    <DistantScene triggerAnimation={triggerTrain} />
                    <div className={styles.groundArea} />
                </div>
            }
            instructions={[
                { icon: '🚂', title: t('games.cargoTrain.howToPlay.step1.title', 'Step 1'), description: t('games.cargoTrain.howToPlay.step1.desc', 'Check the engine number.') },
                { icon: '🚃', title: t('games.cargoTrain.howToPlay.step2.title', 'Step 2'), description: t('games.cargoTrain.howToPlay.step2.desc', 'Drag the cargo.') },
                { icon: '✅', title: t('games.cargoTrain.howToPlay.step3.title', 'Step 3'), description: t('games.cargoTrain.howToPlay.step3.desc', 'Make the total!') }
            ]}
        >
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className={styles.gameContainer}>
                    {/* Game Content sits on top of Background */}
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '0' }}>
                        <div className={styles.track}>
                            {currentProblem && (
                                <>
                                    {/* Layer 1: Static Rail (Relatively positioned to give track height) */}
                                    <TrainSkeleton
                                        fixedValue={0}
                                        targetValue={0}
                                        droppableId="rail-layer"
                                        renderMode="rail"
                                    />

                                    {/* Layer 2: Moving Train (Absolutely positioned on top) */}
                                    <div className={`${styles.movingTrainContainer} ${trainState === 'departing' ? styles.departRight :
                                        trainState === 'arriving' ? styles.arriveLeft : ''
                                        }`}>
                                        <TrainSkeleton
                                            fixedValue={currentProblem.fixed}
                                            targetValue={currentProblem.target}
                                            droppableId="train-gap"
                                            renderMode="train"
                                            filledValue={filledValue}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.optionsArea}>
                            {currentProblem?.options.map((val, idx) => (
                                <DraggableCargo
                                    key={`${val}-${idx}`}
                                    id={`cargo-${val}-${idx}`}
                                    value={val}
                                    disabled={isTransitioning}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </DndContext>
        </Layout2>
    );
}
