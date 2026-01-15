import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useGameLogic } from './GameLogic';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';
import type { GameManifest } from '../../../types';

// Helper to distribute digits Left-to-Right into active slots (Hiding leading zeros based on targetVal)
const getStepValues = (step: number, strVal: string | null, targetVal: number) => {
    const val = strVal || '';
    const chars = val.split('');
    const digitCount = targetVal.toString().length;

    // Active slots should be '' (empty string) to show grid, inactive null to hide
    const result = [null, null, null] as (string | null)[];

    if (step === 1) {
        // Step 1 (Tens): Col 1 & 2 (Indices 0, 1)
        // If target is 1 digit (e.g. 5), only Col 2 is active. Col 1 is null.
        // If target is 2 digits (e.g. 15), Col 1 & 2 active.

        const needed = digitCount >= 2 ? [0, 1] : [1];

        // Fill active slots LTR
        needed.forEach((slotIndex, i) => {
            result[slotIndex] = chars[i] || '';
        });

    } else if (step === 2) {
        // Step 2 (Units): Col 2 & 3 (Indices 1, 2)
        // If target is 1 digit, only Col 3 active.
        // If target is 2 digits, Col 2 & 3 active.

        const needed = digitCount >= 2 ? [1, 2] : [2];

        needed.forEach((slotIndex, i) => {
            result[slotIndex] = chars[i] || '';
        });

    } else if (step === 3) {
        // Step 3 (Total): Col 1, 2, 3 (Indices 0, 1, 2)
        // Adjust active cols based on digit count

        let needed: number[] = [];
        if (digitCount === 1) needed = [2];
        else if (digitCount === 2) needed = [1, 2];
        else needed = [0, 1, 2];

        needed.forEach((slotIndex, i) => {
            result[slotIndex] = chars[i] || '';
        });
    }
    return result;
};

// Updated Tile to be rectangular and flexible with clear styles
const Tile = ({ val, type = 'static', active = false, isFeedback = false, feedbackStatus, highlight = false }: { val: string | number | null, type?: 'static' | 'input', active?: boolean, isFeedback?: boolean, feedbackStatus?: 'correct' | 'wrong' | null, highlight?: boolean }) => {
    const baseBorderColor = '#e2e8f0';
    const baseShadowColor = '#cbd5e1';

    let borderColor = highlight ? '#fda4af' : baseBorderColor; // Rose-300 border for highlight
    let shadowColor = highlight ? '#fda4af' : baseShadowColor; // Rose-300 shadow for highlight
    let backgroundColor = highlight ? '#ffe4e6' : 'white'; // Rose-100 (Soft Rose) for premium highlight

    if (type === 'input' && active) {
        borderColor = isFeedback ? (feedbackStatus === 'correct' ? '#22c55e' : '#ef4444') : '#3b82f6';
        shadowColor = isFeedback ? (feedbackStatus === 'correct' ? '#15803d' : '#b91c1c') : '#2563eb';
        backgroundColor = 'white'; // Input always white
    }

    return (
        <div style={{
            width: '100%',
            height: '100%', // Fill the grid cell
            minHeight: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12cqi', // Responsive to container width
            fontWeight: '800',
            color: '#1e293b',
            background: backgroundColor,
            borderStyle: 'solid',
            borderWidth: '3px 3px 5px 3px',
            borderColor: borderColor,
            boxShadow: `0 2px 0 ${shadowColor}`,
            borderRadius: '12px',
            opacity: val === null ? 0 : 1,
            transform: type === 'input' && active ? 'translateY(2px)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s'
        }}>
            {val}
        </div>
    );
};

const FrontAdditionGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90
    });

    const { gameState } = engine;
    const {
        currentProblem,
        userInput,
        currentStep,
        completedSteps,
        feedback,
        handleInput
    } = useGameLogic(engine);





    // Derived values for Steps
    const step1Display = currentStep === 1 ? userInput : (completedSteps.step1 || '');
    const step2Display = currentStep === 2 ? userInput : (completedSteps.step2 || '');
    const step3Display = currentStep === 3 ? userInput : (completedSteps.step3 || '');

    const step1Vals = getStepValues(1, step1Display, currentProblem ? currentProblem.step1_val : 0);
    const step2Vals = getStepValues(2, step2Display, currentProblem ? currentProblem.step2_val : 0);
    const step3Vals = getStepValues(3, step3Display, currentProblem ? currentProblem.step3_val : 0);

    return (
        <Layout2
            title={t('games.math-front-addition.title')}
            subtitle={t('games.math-front-addition.subtitle')}
            description={t('games.math-front-addition.description')}
            gameId="math-level2-front-addition"
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#eff6ff', blob2: '#f0f9ff', blob3: '#e0f2fe', blob4: '#dbeafe' }} />}
            instructions={[
                { title: 'Step 1', description: 'Add the tens.' },
                { title: 'Step 2', description: 'Add the ones.' },
                { title: 'Step 3', description: 'Add them together.' }
            ]}
            powerUps={[
                { count: engine.powerUps.timeFreeze, color: 'blue', icon: '❄️', title: 'Freeze', onClick: () => engine.activatePowerUp('timeFreeze'), disabledConfig: engine.isTimeFrozen, status: engine.isTimeFrozen ? 'active' : 'normal' },
                { count: engine.powerUps.extraLife, color: 'red', icon: '❤️', title: 'Life', onClick: () => engine.activatePowerUp('extraLife'), disabledConfig: engine.lives >= 3, status: engine.lives >= 3 ? 'maxed' : 'normal' },
                { count: engine.powerUps.doubleScore, color: 'yellow', icon: '⚡', title: 'Double', onClick: () => engine.activatePowerUp('doubleScore'), disabledConfig: engine.isDoubleScore, status: engine.isDoubleScore ? 'active' : 'normal' }
            ]}
        >
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {currentProblem ? (
                    <>
                        {/* MAIN GAME AREA (Flexible) */}
                        <div style={{
                            flex: '1 1 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            minHeight: 0,
                            width: '100%',
                            containerType: 'size' // Parent container for aspect ratio constraint
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '400px',
                                height: '100%',
                                maxHeight: '100cqi', // Limit height to container width (square max)
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                // Use minmax(0, 1fr) to ensure flexible rows share space equally
                                // auto tracks for separators
                                gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr) auto minmax(0, 1fr) minmax(0, 1fr) auto minmax(0, 1fr)',
                                gap: '8px',
                                alignContent: 'stretch',
                                justifyItems: 'stretch',
                                containerType: 'inline-size' // Keep for font scaling
                            }}>
                                {/* Row 1: Problem Top */}
                                <Tile val={null} />
                                <Tile val={currentProblem.row1_tens} highlight={currentStep === 1} />
                                <Tile val={currentProblem.row1_units} highlight={currentStep === 2} />

                                {/* Row 2: Problem Bottom */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10cqi', // Responsive to grid width
                                    fontWeight: 'bold',
                                    color: '#334155'
                                }}>+</div>
                                <Tile val={currentProblem.row2_tens} highlight={currentStep === 1} />
                                <Tile val={currentProblem.row2_units} highlight={currentStep === 2} />

                                {/* Separator 1 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {/* Row 3: Step 1 (Tens Part) */}
                                <Tile val={step1Vals[0]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Vals[1]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Vals[2]} />

                                {/* Row 4: Step 2 (Units Part) */}
                                <Tile val={step2Vals[0]} />
                                <Tile val={step2Vals[1]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step2Vals[2]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Separator 2 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {/* Row 5: Step 3 (Final) */}
                                <Tile val={step3Vals[0]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Vals[1]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Vals[2]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                            </div>
                        </div>

                        {/* KEYPAD AREA (Fixed Bottom) */}
                        <div style={{
                            flex: '0 0 auto',
                            width: '100%',
                            background: 'transparent',
                            zIndex: 10,
                            padding: '10px 10px 0 10px',
                            marginBottom: '-12px' // Counteract Layout2 padding to reduce gap
                        }}>
                            <Keypad
                                onInput={handleInput}
                                disabled={!!feedback && feedback !== 'correct'}
                            />
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#64748b' }}>
                        {gameState === 'gameover' ? 'Game Over!' : 'Ready...'}
                    </div>
                )}
            </div>
        </Layout2>
    );
};

export const manifest: GameManifest = {
    id: 'math-level2-front-addition',
    title: 'Front Addition',
    description: 'Learn to add from the front!',
    category: 'math',
    level: 2,
    thumbnail: '➕',
    titleKey: 'games.math-front-addition.title',
    subtitleKey: 'games.math-front-addition.subtitle',
    descriptionKey: 'games.math-front-addition.description',
    component: FrontAdditionGame
};
