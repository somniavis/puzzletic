
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styles from './styles.module.css';

interface TrainSkeletonProps {
    type: 'A' | 'B';
    fixedValue: number | null;
    targetValue: number;
    baseDroppableId: string;
    renderMode?: 'rail' | 'train'; // 'rail' (static) or 'train' (moving parts)
    filledValues: (number | null)[]; // Array of filled values
}

// Sub-component for a single DropZone to obey Rules of Hooks
const DropZoneUnit: React.FC<{
    id: string;
    filledValue: number | null;
    disabled: boolean;
}> = ({ id, filledValue, disabled }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
        disabled: disabled,
    });

    return (
        <div className={styles.trainUnit}>
            <div className={styles.unitContent} ref={setNodeRef}>
                {filledValue !== null ? (
                    <div className={styles.cargoBox}>
                        {filledValue}
                    </div>
                ) : (
                    <div
                        className={`${styles.cargoBox} ${styles.emptyZone}`}
                        style={{
                            borderColor: isOver ? '#FFD700' : undefined,
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
    );
};

export const TrainSkeleton: React.FC<TrainSkeletonProps> = React.memo(({ type, fixedValue, targetValue, baseDroppableId, renderMode = 'train', filledValues }) => {
    const isRail = renderMode === 'rail';
    const isTrain = renderMode === 'train';

    return (
        <div className={styles.trainSystem}>
            {/* Visual Rail Background */}
            {isRail && <div className={styles.rail} />}

            {/* Train Units */}
            {isTrain && (
                <>
                    {/* TYPE A: Fixed + Gap = Target */}
                    {type === 'A' && (
                        <>
                            {/* Unit 1: Fixed */}
                            <div className={styles.trainUnit}>
                                <div className={styles.unitContent}>
                                    <div className={styles.cargoBox}>
                                        {fixedValue}
                                    </div>
                                </div>
                                <div className={styles.unitCar}>🚃</div>
                            </div>

                            {/* Unit 2: Plus */}
                            <div className={styles.trainUnit}>
                                <div className={styles.unitContent}>
                                    <div className={styles.operator}>+</div>
                                </div>
                                <div className={styles.unitCar}>🚃</div>
                            </div>

                            {/* Unit 3: Gap */}
                            <DropZoneUnit
                                id={`${baseDroppableId}-0`}
                                filledValue={filledValues[0] ?? null}
                                disabled={false}
                            />
                        </>
                    )}

                    {/* TYPE B: Gap + Gap = Target */}
                    {type === 'B' && (
                        <>
                            {/* Unit 1: Gap 1 */}
                            <DropZoneUnit
                                id={`${baseDroppableId}-0`}
                                filledValue={filledValues[0] ?? null}
                                disabled={false}
                            />

                            {/* Unit 2: Plus */}
                            <div className={styles.trainUnit}>
                                <div className={styles.unitContent}>
                                    <div className={styles.operator}>+</div>
                                </div>
                                <div className={styles.unitCar}>🚃</div>
                            </div>

                            {/* Unit 3: Gap 2 */}
                            <DropZoneUnit
                                id={`${baseDroppableId}-1`}
                                filledValue={filledValues[1] ?? null}
                                disabled={false}
                            />
                        </>
                    )}

                    {/* Common End: Equals + Engine */}
                    <div className={styles.trainUnit}>
                        <div className={styles.unitContent}>
                            <div className={styles.operator}>=</div>
                        </div>
                        <div className={styles.unitCar}>🚃</div>
                    </div>

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
});

TrainSkeleton.displayName = 'TrainSkeleton';
