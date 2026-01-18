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
        // Hundreds Step: Always result of Hundreds column addition.
        // It's the leftmost operation in 3+3 or 3+2
        // If sum is <10 (1 digit), it goes to Hundreds col (index 1).
        // If sum is >=10 (2 digits), it goes to Thousands col (index 0) and Hundreds col (index 1).
        const needed = digitCount >= 2 ? [0, 1] : [1];
        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    } else if (stepType === 'tens') {
        // Tens Step: Result of Tens column addition.
        // If sum is <10 (1 digit), it goes to Tens col (index 2).
        // If sum is >=10 (2 digits), it goes to Hundreds col (index 1) and Tens col (index 2).
        // BUT wait, Front Addition writes the full result below?
        // Yes. e.g. 5+8=13. We write 13 below. The 1 aligns to Hundreds, 3 to Tens.
        const needed = digitCount >= 2 ? [1, 2] : [2];
        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    } else if (stepType === 'units') {
        // Units Step: Result of Units column addition.
        // If sum is <10 (1 digit), it goes to Units col (index 3).
        // If sum is >=10 (2 digits), it goes to Tens col (index 2) and Units col (index 3).
        const needed = digitCount >= 2 ? [2, 3] : [3];
        needed.forEach((slotIndex, i) => { result[slotIndex] = chars[i] || ''; });
    } else if (stepType === 'total') {
        // Total Step: Final Answer.
        // Aligned to rightmost column (Units = index 3).
        // 1 digit -> [3]
        // 2 digits -> [2, 3]
        // 3 digits -> [1, 2, 3]
        // 4 digits -> [0, 1, 2, 3]
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
// ... Tile component updated to accept showArrow
const Tile = ({ val, type = 'static', active = false, isFeedback = false, feedbackStatus, highlight = false, showArrow = false }: { val: string | number | null, type?: 'static' | 'input', active?: boolean, isFeedback?: boolean, feedbackStatus?: 'correct' | 'wrong' | null, highlight?: boolean, showArrow?: boolean }) => {
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
            transition: 'border-color 0.2s, box-shadow 0.2s',
            position: 'relative' // For absolute arrow child
        }}>
            {val}
            {showArrow && (
                <div style={{
                    position: 'absolute',
                    top: '-4px', // Exactly middle of the 8px grid gap
                    left: '-85%', // Horizontal position
                    width: '180%',
                    transform: 'translateY(-50%)', // Center wrapper vertically on the gap
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px', // Space between Plus and Arrow
                        animation: 'floatGuide 1.5s ease-in-out infinite',
                        lineHeight: 1
                    }}>
                        <div style={{
                            width: '7cqi',
                            height: '7cqi',
                            borderRadius: '50%',
                            background: 'white',
                            border: '2px solid #ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4cqi',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            ➕
                        </div>
                        <div style={{
                            fontSize: '8cqi',
                            color: '#ef4444',
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(255,255,255,0.8)'
                        }}>
                            ↓
                        </div>
                    </div>
                </div>
            )}
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
    const stepsData = React.useMemo(() => {
        const nulls = [null, null, null, null];

        // Visibility Checks
        // 3-Digit: Hundreds(1) -> Tens(2) -> Units(3) -> Total(4)
        // 2-Digit: Tens(1) -> Units(2) -> Total(3)
        const showHundreds = is3Digit && currentStep >= 1;
        const showTens = is3Digit ? currentStep >= 2 : currentStep >= 1;
        const showUnits = is3Digit ? currentStep >= 3 : currentStep >= 2;
        const showTotal = is3Digit ? currentStep >= 4 : currentStep >= 3;

        return {
            hundreds: showHundreds ? getStepValues(getDisp(1), currentProblem?.step1_val || 0, 'hundreds') : nulls,
            tens: showTens ? getStepValues(getDisp(is3Digit ? 2 : 1), is3Digit ? (currentProblem?.step2_val || 0) : (currentProblem?.step1_val || 0), 'tens') : nulls,
            units: showUnits ? getStepValues(getDisp(is3Digit ? 3 : 2), is3Digit ? (currentProblem?.step3_val || 0) : (currentProblem?.step2_val || 0), 'units') : nulls,
            total: showTotal ? getStepValues(getDisp(is3Digit ? 4 : 3), is3Digit ? (currentProblem?.step4_val || 0) : (currentProblem?.step3_val || 0), 'total') : nulls
        };
    }, [is3Digit, currentStep, userInput, completedSteps, currentProblem]);

    // Dynamic grid rows definition (Memoized)
    const gridRowsTemplate = React.useMemo(() => is3Digit
        ? 'repeat(2, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)) auto minmax(0, 1fr)'
        : 'repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr)) auto minmax(0, 1fr)', [is3Digit]);

    // Helper to check if arrow should be shown for a column based on currentStep
    const shouldShowArrow = (colType: 'hundreds' | 'tens' | 'units') => {
        if (!currentProblem) return false;
        if (is3Digit) {
            if (currentStep === 1 && colType === 'hundreds') return true;
            if (currentStep === 2 && colType === 'tens') return true;
            if (currentStep === 3 && colType === 'units') return true;
        } else {
            if (currentStep === 1 && colType === 'tens') return true;
            if (currentStep === 2 && colType === 'units') return true;
        }
        return false;
    };

    // Check if Total Separator should be visible
    const showTotalSeparator = is3Digit ? currentStep >= 4 : currentStep >= 3;

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
                                <Tile val={currentProblem.row1_hundreds} highlight={is3Digit && currentStep === 1} />
                                <Tile val={currentProblem.row1_tens} highlight={(is3Digit && currentStep === 2) || (!is3Digit && currentStep === 1)} />
                                <Tile val={currentProblem.row1_units} highlight={(is3Digit && currentStep === 3) || (!is3Digit && currentStep === 2)} />

                                {/* Row 2: Problem Bottom */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10cqi',
                                    fontWeight: 'bold',
                                    color: '#334155'
                                }}>+</div>
                                <Tile val={currentProblem.row2_hundreds} highlight={is3Digit && currentStep === 1} showArrow={shouldShowArrow('hundreds')} />
                                <Tile val={currentProblem.row2_tens} highlight={(is3Digit && currentStep === 2) || (!is3Digit && currentStep === 1)} showArrow={shouldShowArrow('tens')} />
                                <Tile val={currentProblem.row2_units} highlight={(is3Digit && currentStep === 3) || (!is3Digit && currentStep === 2)} showArrow={shouldShowArrow('units')} />

                                {/* Separator 1 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {is3Digit && (
                                    <>
                                        {/* Step 1: Hundreds Sum */}
                                        <Tile val={stepsData.hundreds[0]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                        <Tile val={stepsData.hundreds[1]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                        <Tile val={stepsData.hundreds[2]} />
                                        <Tile val={stepsData.hundreds[3]} />
                                    </>
                                )}

                                {/* Step: Tens Sum */}
                                {/* Alignment correction: If 2 digits (>=10), occupies Hundreds(1) and Tens(2). If 1 digit, occupies Tens(2). */}
                                <Tile val={stepsData.tens[0]} />
                                <Tile val={stepsData.tens[1]} type={currentStep === (is3Digit ? 2 : 1) ? 'input' : 'static'} active={currentStep === (is3Digit ? 2 : 1)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.tens[2]} type={currentStep === (is3Digit ? 2 : 1) ? 'input' : 'static'} active={currentStep === (is3Digit ? 2 : 1)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.tens[3]} />

                                {/* Step: Units Sum */}
                                {/* Alignment correction: If 2 digits (>=10), occupies Tens(2) and Units(3). If 1 digit, occupies Units(3). */}
                                <Tile val={stepsData.units[0]} />
                                <Tile val={stepsData.units[1]} />
                                <Tile val={stepsData.units[2]} type={currentStep === (is3Digit ? 3 : 2) ? 'input' : 'static'} active={currentStep === (is3Digit ? 3 : 2)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.units[3]} type={currentStep === (is3Digit ? 3 : 2) ? 'input' : 'static'} active={currentStep === (is3Digit ? 3 : 2)} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Separator 2 */}
                                <div style={{
                                    gridColumn: '1 / -1',
                                    height: '4px',
                                    background: '#cbd5e1',
                                    borderRadius: '2px',
                                    alignSelf: 'center',
                                    width: '100%',
                                    opacity: showTotalSeparator ? 1 : 0, // Hide until Total step
                                    transition: 'opacity 0.3s ease'
                                }}></div>

                                {/* Step: Final Total */}
                                <Tile val={stepsData.total[0]} type={currentStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={currentStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[1]} type={currentStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={currentStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[2]} type={currentStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={currentStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[3]} type={currentStep === (is3Digit ? 4 : 3) ? 'input' : 'static'} active={currentStep === (is3Digit ? 4 : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
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
