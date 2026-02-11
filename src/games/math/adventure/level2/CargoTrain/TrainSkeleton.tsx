
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styles from './styles.module.css';

interface TrainSkeletonProps {
    fixedValue: number;
    targetValue: number;
    droppableId: string;
    renderMode?: 'rail' | 'train'; // New Prop: 'rail' (static) or 'train' (moving parts)
    filledValue?: number | null; // New Prop: If set, shows the cargo instead of '?'
}

export const TrainSkeleton: React.FC<TrainSkeletonProps> = ({ fixedValue, targetValue, droppableId, renderMode = 'train', filledValue }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: droppableId,
        disabled: renderMode === 'rail', // Disable dnd on the rail layer
    });

    const isRail = renderMode === 'rail';
    const isTrain = renderMode === 'train';

    return (
        <div className={styles.trainSystem}>
            {/* Visual Rail Background - Only if 'rail' mode */}
            {isRail && <div className={styles.rail} />}

            {/* Train Units - Only if 'train' mode */}
            {isTrain && (
                <>
                    {/* Unit 1: Fixed Number */}
                    <div className={styles.trainUnit}>
                        <div className={styles.unitContent}>
                            <div className={styles.cargoBox}>
                                {fixedValue}
                            </div>
                        </div>
                        <div className={styles.unitCar}>🚃</div>
                    </div>

                    {/* Unit 2: Plus Operator */}
                    <div className={styles.trainUnit}>
                        <div className={styles.unitContent}>
                            <div className={styles.operator}>+</div>
                        </div>
                        <div className={styles.unitCar}>🚃</div>
                    </div>

                    {/* Unit 3: The Gap (Target - Droppable) */}
                    <div className={styles.trainUnit}>
                        <div className={styles.unitContent} ref={setNodeRef}>
                            {filledValue !== null && filledValue !== undefined ? (
                                // Render Filled Cargo
                                <div className={styles.cargoBox}>
                                    {filledValue}
                                </div>
                            ) : (
                                // Render Drop Zone
                                <div
                                    className={`${styles.cargoBox} ${styles.emptyZone}`}
                                    style={{
                                        borderColor: isOver ? '#FFD700' : undefined, // Yellow glow when hovering
                                        boxShadow: isOver ? '0 0 10px #FFD700' : undefined,
                                        transform: isOver ? 'scale(1.1)' : undefined,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    ?
                                </div>
                            )}
                        </div>
                        <div className={styles.unitCar}>🚃</div>
                    </div>

                    {/* Unit 4: Equals Operator */}
                    <div className={styles.trainUnit}>
                        <div className={styles.unitContent}>
                            <div className={styles.operator}>=</div>
                        </div>
                        <div className={styles.unitCar}>🚃</div>
                    </div>

                    {/* Unit 5: Engine & Result */}
                    <div className={styles.trainUnit}>
                        <div className={styles.unitContent}>
                            <div className={styles.resultBox}>
                                {targetValue}
                            </div>
                        </div>
                        <div className={`${styles.unitCar} ${styles.engineCar}`}>🚂</div>
                    </div>
                </>
            )}
        </div>
    );
};
