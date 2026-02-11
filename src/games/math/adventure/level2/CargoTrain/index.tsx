
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

    // Filled Cargo State (Visual) - Array for multiple slots
    const [filledValues, setFilledValues] = useState<(number | null)[]>([null, null]);

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
            setFilledValues([null, null]);

            // New problem arrived or initial load
            // Only play arrive animation if we are not initial load (or check score)
            // But simple check: if we were departing, now we arrive
            setTrainState(prev => prev === 'departing' ? 'arriving' : 'idle');

            // Allow animation to play then reset to idle (2s duration)
            const timer = setTimeout(() => setTrainState('idle'), 2000);
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
                delay: 0, // Instant drag
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && over.id.toString().startsWith('train-gap')) {
            // Extract index from "train-gap-0" etc.
            const parts = over.id.toString().split('-');
            const index = parseInt(parts[parts.length - 1], 10);

            // active.data.current?.value holds the number
            const draggedValue = active.data.current?.value;

            if (draggedValue !== undefined && !isNaN(index)) {

                // Update local state temporarily
                const newFilled = [...filledValues];
                newFilled[index] = draggedValue;
                setFilledValues(newFilled);

                // Check Logic
                if (currentProblem) {
                    if (currentProblem.type === 'A') {
                        // Type A: Validate Immediately
                        // We must pass array [value]
                        if (currentProblem && draggedValue === currentProblem.missing[0]) {
                            // Correct visual update already done via state
                            checkAnswer([draggedValue]);
                        } else {
                            // Wrong answer: Reset this slot after short delay or immediately?
                            // GameLogic handles "wrong" event.
                            // We should call checkAnswer to trigger logic.
                            checkAnswer([draggedValue]);
                            // If wrong, reset visual?
                            if (draggedValue !== currentProblem.missing[0]) {
                                setTimeout(() => {
                                    setFilledValues(prev => {
                                        const reset = [...prev];
                                        reset[index] = null;
                                        return reset;
                                    });
                                }, 500);
                            }
                        }
                    } else {
                        // Type B: Validate only if BOTH are filled
                        // Check if the OTHER slot is already filled

                        // Note: filledValues state might not be updated yet in this render cycle?
                        // Actually 'newFilled' has the latest state for this drop.

                        if (newFilled[0] !== null && newFilled[1] !== null) {
                            // Both filled. Validate.
                            // We cast to number[] since we checked null
                            const valuesToCheck = newFilled as number[];

                            // Calculate sum logic is inside GameLogic, but we can pre-check visual reset
                            const isSumCorrect = (valuesToCheck[0] + valuesToCheck[1]) === currentProblem.target;

                            checkAnswer(valuesToCheck);

                            if (!isSumCorrect) {
                                // Reset both if wrong
                                setTimeout(() => {
                                    setFilledValues([null, null]);
                                }, 500);
                            }
                        }
                    }
                }
            }
        }
    };

    // ...

    // Standard PowerUps (Freeze, Life, Double)
    const powerUps = useMemo(() => [
        {
            count: gameLogic.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => gameLogic.activatePowerUp('timeFreeze'),
            status: (gameLogic.isTimeFrozen ? 'active' : 'normal') as 'active' | 'normal' | 'maxed',
            title: t('games.cargoTrain.powerUps.timeFreeze', 'Freeze'),
            disabledConfig: gameLogic.isTimeFrozen
        },
        {
            count: gameLogic.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => gameLogic.activatePowerUp('extraLife'),
            status: (gameLogic.lives >= 3 ? 'maxed' : 'normal') as 'active' | 'normal' | 'maxed',
            title: t('games.cargoTrain.powerUps.extraLife', 'Life'),
            disabledConfig: gameLogic.lives >= 3
        },
        {
            count: gameLogic.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => gameLogic.activatePowerUp('doubleScore'),
            status: (gameLogic.isDoubleScore ? 'active' : 'normal') as 'active' | 'normal' | 'maxed',
            title: t('games.cargoTrain.powerUps.doubleScore', 'Double'),
            disabledConfig: gameLogic.isDoubleScore
        }
    ], [t, gameLogic.powerUps, gameLogic.isTimeFrozen, gameLogic.lives, gameLogic.isDoubleScore, gameLogic.activatePowerUp]);


    const cardBackground = useMemo(() => (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className={styles.skyArea}>
                <div className={styles.cloud} />
            </div>
            <DistantScene triggerAnimation={triggerTrain} />
            <div className={styles.groundArea} />
        </div>
    ), [triggerTrain]);

    const instructions = useMemo(() => [
        { icon: '🚂', title: t('games.cargoTrain.howToPlay.step1.title', 'Step 1'), description: t('games.cargoTrain.howToPlay.step1.desc', 'Check the engine number.') },
        { icon: '🚃', title: t('games.cargoTrain.howToPlay.step2.title', 'Step 2'), description: t('games.cargoTrain.howToPlay.step2.desc', 'Drag the cargo.') },
        { icon: '✅', title: t('games.cargoTrain.howToPlay.step3.title', 'Step 3'), description: t('games.cargoTrain.howToPlay.step3.desc', 'Make the total!') }
    ], [t]);

    return (
        <Layout2
            title={t('games.cargoTrain.title', 'Cargo Train')}
            subtitle={t('games.cargoTrain.subtitle', 'Make 100!')}
            gameId={GAME_ID}
            engine={gameLogic}
            powerUps={powerUps}
            onExit={() => navigate(-1)}
            cardBackground={cardBackground}
            instructions={instructions}
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
                                        type={currentProblem.type}
                                        fixedValue={0}
                                        targetValue={0}
                                        baseDroppableId="rail-layer"
                                        renderMode="rail"
                                        filledValues={[]}
                                    />

                                    {/* Layer 2: Moving Train (Absolutely positioned on top) */}
                                    <div className={`${styles.movingTrainContainer} ${trainState === 'departing' ? styles.departRight :
                                        trainState === 'arriving' ? styles.arriveLeft : ''
                                        }`}>
                                        <TrainSkeleton
                                            type={currentProblem.type}
                                            fixedValue={currentProblem.fixed}
                                            targetValue={currentProblem.target}
                                            baseDroppableId="train-gap"
                                            renderMode="train"
                                            filledValues={filledValues}
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
