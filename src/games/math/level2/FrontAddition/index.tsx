import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useGameLogic } from './GameLogic';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';
import type { GameManifest } from '../../../types';

// Helper to distribute digits Left-to-Right into active slots (Hiding leading zeros based on targetVal)
const getStepValues = (strVal: string | null, targetVal: number, stepType: 'hundreds' | 'tens' | 'units' | 'total') => {
    const val = strVal || '';
    const chars = val.split('');
    const digitCount = targetVal.toString().length;

    // 4 Slots: [Thousands/Sign, Hundreds, Tens, Units]
    const result = [null, null, null, null] as (string | null)[];

    if (stepType === 'hundreds') {
        // Hundreds (Col 2): Usually 1 digit (max 9+9=18 -> 2 digits)
        // If 2 digits (e.g. 18), occupies Col 1 & 2.
        // If 1 digit (e.g. 5), occupies Col 2.
        const needed = digitCount >= 2 ? [0, 1] : [1];
        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    } else if (stepType === 'tens') {
        // Tens (Col 3): Digits align to Col 3.
        // 2 digits -> Col 2 & 3. 1 digit -> Col 3.
        const needed = digitCount >= 2 ? [1, 2] : [2];
        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    } else if (stepType === 'units') {
        // Units (Col 4): Digits align to Col 4.
        const needed = digitCount >= 2 ? [2, 3] : [3];
        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    } else if (stepType === 'total') {
        // Total (Col 1-4)
        // 1 digit -> Col 4
        // 2 digits -> Col 3,4
        // 3 digits -> Col 2,3,4
        // 4 digits -> Col 1,2,3,4
        let needed: number[] = [];
        if (digitCount === 1) needed = [3];
        else if (digitCount === 2) needed = [2, 3];
        else if (digitCount === 3) needed = [1, 2, 3];
        else needed = [0, 1, 2, 3];

        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    }
    return result;
};

// ... Tile component remains same ...
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

// Update component to accept gameId
const FrontAdditionGame: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
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
    } = useGameLogic(engine, gameId);

    const is3Digit = currentProblem?.totalSteps === 4;

    // Derived values for Steps
    // Note: Rendering relies on 'currentStep' logic matching the problem type
    // If is3Digit: Step 1=Hundreds, 2=Tens, 3=Units, 4=Total
    // If !is3Digit: Step 1=Tens, 2=Units, 3=Total

    // Determine config keys based on gameId (Memoized)
    const { titleKey, subtitleKey } = React.useMemo(() => {
        if (gameId === 'math-level2-front-addition-lv2') {
            return { titleKey: 'games.frontAddition.lv2.title', subtitleKey: 'games.frontAddition.lv2.subtitle' };
        } else if (gameId === 'math-level2-front-addition-lv3') {
            return { titleKey: 'games.frontAddition.lv3.title', subtitleKey: 'games.frontAddition.lv3.subtitle' };
        } else if (gameId === 'math-level2-front-addition-lv4') {
            return { titleKey: 'games.frontAddition.lv4.title', subtitleKey: 'games.frontAddition.lv4.subtitle' };
        }
        return { titleKey: 'games.frontAddition.lv1.title', subtitleKey: 'games.frontAddition.lv1.subtitle' };
    }, [gameId]);

    // Derived values for Steps
    // Helper to fetch display value based on active step status
    const getDisp = (targetStep: number) => {
        return currentStep === targetStep ? userInput : (completedSteps[`step${targetStep}` as keyof typeof completedSteps] || '');
    };

    // Calculate Grid Values (Memoized to prevent render thrashing)
    const stepsData = React.useMemo(() => ({
        hundreds: is3Digit ? getStepValues(getDisp(1), currentProblem?.step1_val || 0, 'hundreds') : [null, null, null, null],
        tens: getStepValues(getDisp(is3Digit ? 2 : 1), currentProblem?.step2_val || (currentProblem?.step1_val || 0), 'tens'),
        units: getStepValues(getDisp(is3Digit ? 3 : 2), currentProblem?.step3_val || (currentProblem?.step2_val || 0), 'units'),
        total: getStepValues(getDisp(is3Digit ? 4 : 3), is3Digit ? (currentProblem?.step4_val || 0) : (currentProblem?.step3_val || 0), 'total')
    }), [is3Digit, currentStep, userInput, completedSteps, currentProblem]);

    // Dynamic grid rows definition (Memoized)
    const gridRowsTemplate = React.useMemo(() => is3Digit
        ? 'repeat(2, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)) auto minmax(0, 1fr)'
        : 'repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr)) auto minmax(0, 1fr)', [is3Digit]);

    const activeStep = currentStep;

    return (
        <Layout2
            title={t(titleKey)}
            subtitle={t(subtitleKey)}
            description={t('games.frontAddition.description')}
            gameId={gameId || 'math-level2-front-addition-lv1'}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#eff6ff', blob2: '#f0f9ff', blob3: '#e0f2fe', blob4: '#dbeafe' }} />}
            instructions={[
                { icon: '🔟', title: t('games.frontAddition.howToPlay.step1.title'), description: t('games.frontAddition.howToPlay.step1.desc') },
                { icon: '1️⃣', title: t('games.frontAddition.howToPlay.step2.title'), description: t('games.frontAddition.howToPlay.step2.desc') },
                { icon: '✅', title: t('games.frontAddition.howToPlay.step3.title'), description: t('games.frontAddition.howToPlay.step3.desc') }
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
                        <div style={{
                            flex: '1 1 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            minHeight: 0,
                            width: '100%',
                            containerType: 'size'
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '500px', // Slightly wider for 4 columns
                                height: '100%',
                                maxHeight: '100cqi',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)', // 4 Columns
                                gridTemplateRows: gridRowsTemplate,
                                gap: '8px',
                                alignContent: 'stretch',
                                justifyItems: 'stretch',
                                containerType: 'inline-size'
                            }}>
                                {/* Row 1: Problem Top */}
                                <Tile val={null} />
                                <Tile val={currentProblem.row1_hundreds} highlight={is3Digit && activeStep === 1} />
                                <Tile val={currentProblem.row1_tens} highlight={(is3Digit && activeStep === 2) || (!is3Digit && activeStep === 1)} />
                                <Tile val={currentProblem.row1_units} highlight={(is3Digit && activeStep === 3) || (!is3Digit && activeStep === 2)} />

                                {/* Row 2: Problem Bottom */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10cqi',
                                    fontWeight: 'bold',
                                    color: '#334155'
                                }}>+</div>
                                <Tile val={currentProblem.row2_hundreds} highlight={is3Digit && activeStep === 1} />
                                <Tile val={currentProblem.row2_tens} highlight={(is3Digit && activeStep === 2) || (!is3Digit && activeStep === 1)} />
                                <Tile val={currentProblem.row2_units} highlight={(is3Digit && activeStep === 3) || (!is3Digit && activeStep === 2)} />

                                {/* Separator 1 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {is3Digit && (
                                    <>
                                        {/* Step 1: Hundreds */}
                                        <Tile val={stepsData.hundreds[0]} type={activeStep === 1 ? 'input' : 'static'} active={activeStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                        <Tile val={stepsData.hundreds[1]} type={activeStep === 1 ? 'input' : 'static'} active={activeStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                        <Tile val={stepsData.hundreds[2]} />
                                        <Tile val={stepsData.hundreds[3]} />
                                    </>
                                )}

                                {/* Step: Tens */}
                                <Tile val={stepsData.tens[0]} />
                                <Tile val={stepsData.tens[1]} type={activeStep === (is3Digit ? 2 : 1) ? 'input' : 'static'} active={activeStep === (is3Digit ? 2 : 1)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.tens[2]} type={activeStep === (is3Digit ? 2 : 1) ? 'input' : 'static'} active={activeStep === (is3Digit ? 2 : 1)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.tens[3]} />

                                {/* Step: Units */}
                                <Tile val={stepsData.units[0]} />
                                <Tile val={stepsData.units[1]} />
                                <Tile val={stepsData.units[2]} type={activeStep === (is3Digit ? 3 : 2) ? 'input' : 'static'} active={activeStep === (is3Digit ? 3 : 2)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.units[3]} type={activeStep === (is3Digit ? 3 : 2) ? 'input' : 'static'} active={activeStep === (is3Digit ? 3 : 2)} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Separator 2 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {/* Step: Final Total */}
                                <Tile val={stepsData.total[0]} type={activeStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[1]} type={activeStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[2]} type={activeStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[3]} type={activeStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                            </div>
                        </div>

                        {/* KEYPAD AREA */}
                        <div style={{ flex: '0 0 auto', width: '100%', background: 'transparent', zIndex: 10, padding: '10px 10px 0 10px', marginBottom: '-12px' }}>
                            <Keypad onInput={handleInput} disabled={!!feedback && feedback !== 'correct'} />
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

export const manifestLv1: GameManifest = {
    id: 'math-level2-front-addition-lv1',
    title: 'Front Addition 1',
    description: '2-digit + 1-digit Addition',
    category: 'math',
    level: 2,
    thumbnail: '➕',
    titleKey: 'games.frontAddition.lv1.title',
    subtitleKey: 'games.frontAddition.lv1.subtitle',
    descriptionKey: 'games.frontAddition.description',
    component: FrontAdditionGame
};

export const manifestLv2: GameManifest = {
    id: 'math-level2-front-addition-lv2',
    title: 'Front Addition 2',
    description: '2-digit + 2-digit Addition',
    category: 'math',
    level: 2,
    thumbnail: '➕',
    titleKey: 'games.frontAddition.lv2.title',
    subtitleKey: 'games.frontAddition.lv2.subtitle',
    descriptionKey: 'games.frontAddition.description',
    component: FrontAdditionGame
};

export const manifestLv3: GameManifest = {
    id: 'math-level2-front-addition-lv3',
    title: 'Front Addition 3',
    description: '3-digit + 2-digit Addition',
    category: 'math',
    level: 2,
    thumbnail: '➕',
    titleKey: 'games.frontAddition.lv3.title',
    subtitleKey: 'games.frontAddition.lv3.subtitle',
    descriptionKey: 'games.frontAddition.description',
    component: FrontAdditionGame
};

export const manifestLv4: GameManifest = {
    id: 'math-level2-front-addition-lv4',
    title: 'Front Addition 4',
    description: '3-digit + 3-digit Addition',
    category: 'math',
    level: 2,
    thumbnail: '➕',
    titleKey: 'games.frontAddition.lv4.title',
    subtitleKey: 'games.frontAddition.lv4.subtitle',
    descriptionKey: 'games.frontAddition.description',
    component: FrontAdditionGame
};
