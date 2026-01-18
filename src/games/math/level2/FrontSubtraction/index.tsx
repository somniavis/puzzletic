import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useGameLogic } from './GameLogic';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';
import type { GameManifest } from '../../../types';

// Helper to distribute digits Left-to-Right logic
const getStepValues = (strVal: string | null, targetVal: number, stepType: 'hundreds' | 'tens' | 'units' | 'intermediate' | 'total') => {
    // If strVal exists (user input), use it.
    // If not, split targetVal to see digits (for ghosting or planning).
    const val = strVal !== null ? strVal : '';
    // If user hasn't input anything yet, we might return empty slots.
    // However, if we need to show a "Gray 0" (Ghost Zero) for the Tens step when logic dictates (e.g., 2d-1d or 2d-2d borrow),
    // we need to pass that down.

    const chars = val.split('');
    const targetStr = Math.abs(targetVal).toString();
    const digitCount = targetStr.length;

    // 4 Slots: [Thousands/Sign, Hundreds, Tens, Units]
    const result = [null, null, null, null] as (string | null)[];

    if (stepType === 'tens') {
        // Tens Step: Usually 1 digit (e.g. 80 -> 8). If it's 2 digits (e.g. 150 -> 15), handle it.
        // Special Case: "Gray 0" for 2-digit Subtraction.
        // User inputs "8", we visualize "8" in Tens col, and empty/gray "0" in Units.
        // The `targetVal` here is the *result* of the subtraction step (e.g. 8, representing 80).

        // Alignment:
        // If val is "8", it goes to Tens slot.
        // If val is "15", "1" hundreds, "5" tens.

        // We need to know if we should append a ghost zero. This depends on context not just value.
        // But for now, let's just stick to the display logic requested by `stepsData`.

        // Naive mapping:
        if (digitCount === 1) {
            // e.g. 8
            result[2] = chars[0] || '';
        } else {
            // e.g. 15
            result[1] = chars[0] || '';
            result[2] = chars[1] || '';
        }

    } else if (stepType === 'hundreds') {
        // Hundreds Step: Usually 1 digit.
        // Alignment: Hundreds slot (index 1).
        result[1] = chars[0] || '';
    } else if (stepType === 'units') {
        // Units Step: Usually 1 digit.
        // If Negative (Bar Number): e.g. 3 (representing -3).
        // Alignment: Unit slot (index 3).
        result[3] = chars[0] || '';
    } else if (stepType === 'intermediate') {
        // Intermediate: Combined H & T (e.g. 76).
        // Occupies Hundreds (1) and Tens (2).
        if (digitCount === 1) result[2] = chars[0] || '';
        else { result[1] = chars[0] || ''; result[2] = chars[1] || ''; }
    } else if (stepType === 'total') {
        // Total Step: e.g. 77.
        // Alignment: Right-aligned.
        if (digitCount === 1) result[3] = chars[0] || '';
        else if (digitCount === 2) { result[2] = chars[0] || ''; result[3] = chars[1] || ''; }
        else if (digitCount === 3) { result[1] = chars[0] || ''; result[2] = chars[1] || ''; result[3] = chars[2] || ''; }
    }
    return result;
};

interface TileProps {
    val: string | number | null;
    type?: 'static' | 'input' | 'ghost'; // Added 'ghost'
    active?: boolean;
    isFeedback?: boolean;
    feedbackStatus?: 'correct' | 'wrong' | null;
    highlight?: boolean;
    showArrow?: boolean;
    arrowType?: 'down' | 'up'; // Direction of guide
    isNegative?: boolean; // For styling Bar Number (top minus)
}

const Tile = ({ val, type = 'static', active = false, isFeedback = false, feedbackStatus, highlight = false, showArrow = false, arrowType = 'down', isNegative = false }: TileProps) => {
    const baseBorderColor = '#e2e8f0';
    const baseShadowColor = '#cbd5e1';

    let borderColor = highlight ? '#fda4af' : baseBorderColor;
    let shadowColor = highlight ? '#fda4af' : baseShadowColor;
    let backgroundColor = highlight ? '#ffe4e6' : 'white';
    let textColor = '#1e293b';

    if (type === 'input' && active) {
        borderColor = isFeedback ? (feedbackStatus === 'correct' ? '#22c55e' : '#ef4444') : '#3b82f6';
        shadowColor = isFeedback ? (feedbackStatus === 'correct' ? '#15803d' : '#b91c1c') : '#2563eb';
        backgroundColor = 'white';
    } else if (type === 'ghost') {
        borderColor = 'transparent';
        shadowColor = 'transparent';
        backgroundColor = '#f1f5f9'; // Light gray bg
        textColor = '#cbd5e1'; // Light gray text
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            minHeight: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12cqi',
            fontWeight: '800',
            color: textColor,
            background: backgroundColor,
            borderStyle: 'solid',
            borderWidth: '3px 3px 5px 3px',
            borderColor: borderColor,
            boxShadow: `0 2px 0 ${shadowColor}`,
            borderRadius: '12px',
            opacity: val === null && type !== 'ghost' ? 0 : 1,
            transform: type === 'input' && active ? 'translateY(2px)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            position: 'relative',
            zIndex: isNegative ? 60 : (type === 'input' && active ? 50 : 'auto') // Ensure Bar Number or Active Tile sits on top
        }}>
            {/* Main Value - Always Centered */}
            <div style={{ position: 'relative', display: 'inline-block', zIndex: 1 }}>
                {val}
                {/* Bar Number Indicator - Immediately Above Number */}
                {isNegative && val !== null && val !== '' && (
                    <div style={{
                        position: 'absolute',
                        top: '-0.5em', // Shift up relative to the number text
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.4em',
                        lineHeight: 1,
                        color: '#ef4444',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '1px 12px', // Wider badge (approx 1.5x of previous visuals)
                        borderRadius: '4px',
                        fontWeight: '900',
                        pointerEvents: 'none',
                        zIndex: 50, // Ensure it sits ON TOP of any overlapping text/grid
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        −
                    </div>
                )}
            </div>

            {showArrow && (
                <div style={{
                    position: 'absolute',
                    top: '-4px', // Same top position (Gap between operand rows)
                    // Up Arrow: Visualizes Borrow (Bottom-Up).
                    // Down Arrow: Visualizes Normal (Top-Down).
                    // Both occupy the space BETWEEN the two operands (Row 1 and Row 2).
                    // Since this Tile is usually Row 2:
                    // top: -4px places it above Row 2 (between Row 1 and Row 2).
                    // Let's stick to standardized "Left side" placement for consistency with visual guide.

                    left: '-85%',
                    width: '180%',
                    transform: 'translateY(-50%)', // Always move UP (gap above)
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row', // Always Row for consistent form
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
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
                            ➖
                        </div>
                        <div style={{
                            fontSize: '8cqi',
                            color: '#ef4444',
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(255,255,255,0.8)'
                        }}>
                            {arrowType === 'up' ? '↑' : '↓'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Update component to accept gameId
const FrontSubtractionGame: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
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

    const is3Digit = currentProblem?.totalSteps === 5 || currentProblem?.totalSteps === 4;

    // ... (Memoized config keys section remains same)
    const { titleKey, subtitleKey } = React.useMemo(() => {
        if (gameId === 'math-level2-front-subtraction-lv2') {
            return { titleKey: 'games.frontSubtraction.lv2.title', subtitleKey: 'games.frontSubtraction.lv2.subtitle' };
        } else if (gameId === 'math-level2-front-subtraction-lv3') {
            return { titleKey: 'games.frontSubtraction.lv3.title', subtitleKey: 'games.frontSubtraction.lv3.subtitle' };
        } else if (gameId === 'math-level2-front-subtraction-lv4') {
            return { titleKey: 'games.frontSubtraction.lv4.title', subtitleKey: 'games.frontSubtraction.lv4.subtitle' };
        }
        return { titleKey: 'games.frontSubtraction.lv1.title', subtitleKey: 'games.frontSubtraction.lv1.subtitle' };
    }, [gameId]);

    const getDisp = (targetStep: number) => {
        // If current step, show input. If completed, show stored value.
        // For Negative Bar Numbers, stored value might be "3" but we render it with isNegative flag in Tile.
        return currentStep === targetStep ? userInput : (completedSteps[`step${targetStep}` as keyof typeof completedSteps] || '');
    };

    const stepsData = React.useMemo(() => {
        const nulls = [null, null, null, null];
        const is4Step = is3Digit && currentProblem?.totalSteps === 4; // T is NOT negative, skip Intermediate

        // Visibility logic
        const showHundreds = is3Digit && currentStep >= 1;
        const showTens = is3Digit ? currentStep >= 2 : currentStep >= 1;
        const showUnits = is3Digit ? currentStep >= 3 : currentStep >= 2;
        // Intermediate: only show in 5-step mode and when step >= 4
        const showIntermediate = is3Digit && !is4Step && currentStep >= 4;
        // Total: show at step 4 for 4-step mode, step 5 for 5-step mode
        const showTotal = is3Digit
            ? (is4Step ? currentStep >= 4 : currentStep >= 5)
            : currentStep >= 3;

        // Value logic: always use getDisp() for user input/completed steps
        return {
            hundreds: showHundreds ? getStepValues(getDisp(1), currentProblem?.step1_val || 0, 'hundreds') : nulls,

            tens: showTens ? getStepValues(
                getDisp(is3Digit ? 2 : 1),
                is3Digit ? (currentProblem?.step2_val || 0) : (currentProblem?.step1_val || 0),
                'tens'
            ) : nulls,

            units: showUnits ? getStepValues(
                getDisp(is3Digit ? 3 : 2),
                is3Digit ? (currentProblem?.step3_val || 0) : (currentProblem?.step2_val || 0),
                'units'
            ) : nulls,

            intermediate: showIntermediate ? getStepValues(
                getDisp(4),
                currentProblem?.step4_val || 0,
                'intermediate'
            ) : nulls,

            // For 4-step mode, step 4 is Total. For 5-step mode, step 5 is Total.
            total: showTotal ? getStepValues(
                getDisp(is3Digit ? (is4Step ? 4 : 5) : 3),
                is3Digit ? (currentProblem?.step5_val || 0) : (currentProblem?.step3_val || 0),
                'total'
            ) : nulls,

            // Ghost Zero Logic
            hasTensGhostZero: is3Digit ? currentStep > 2 : currentStep > 1,
            hasHundredsGhostZero: is3Digit && currentStep > 1,

            // Flags
            isTensNegative: is3Digit ? currentProblem?.step2_is_negative : false,
            isUnitsNegative: is3Digit ? currentProblem?.step3_is_negative : currentProblem?.step2_is_negative,
            is4Step: is4Step
        };
    }, [is3Digit, currentStep, userInput, completedSteps, currentProblem, getDisp]);

    // Grid Template
    const gridRowsTemplate = React.useMemo(() => is3Digit
        ? 'repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr)) auto minmax(0, 1fr) auto minmax(0, 1fr)'
        // Updated: added 'auto' (Sep 1.5) between repeat(2) [H/T] and minmax [Merged U/Int]
        : 'repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr)) auto minmax(0, 1fr)', [is3Digit]);

    const activeStep = currentStep;

    const shouldShowArrow = (colType: 'hundreds' | 'tens' | 'units') => {
        if (!currentProblem) return false;
        if (is3Digit) {
            if (activeStep === 1 && colType === 'hundreds') return true;
            if (activeStep === 2 && colType === 'tens') return true;
            if (activeStep === 3 && colType === 'units') return true;
        } else {
            // 2-digit
            if (activeStep === 1 && colType === 'tens') return true;
            if (activeStep === 2 && colType === 'units') return true;
        }
        return false;
    };

    // Check Direction for Arrow (Up for Negative/Borrow steps)
    const getArrowType = (colType: 'hundreds' | 'tens' | 'units'): 'down' | 'up' => {
        if (is3Digit) {
            if (activeStep === 2 && colType === 'tens' && currentProblem?.step2_is_negative) return 'up';
            if (activeStep === 3 && colType === 'units' && currentProblem?.step3_is_negative) return 'up';
        } else {
            if (activeStep === 2 && colType === 'units' && currentProblem?.step2_is_negative) return 'up';
        }
        return 'down';
    };

    // Tooltip Logic
    const getTooltip = () => {
        if (!currentProblem) return null;
        const is4Step = currentProblem.totalSteps === 4;

        if (is3Digit) {
            // 5-step mode: Step 4 is Intermediate, Step 5 is Total
            // 4-step mode: Step 4 is Total (skip Intermediate)

            if (!is4Step && activeStep === 4) {
                // Step 4 Helper (Intermediate): [H*10 - T] - only in 5-step mode
                const hVal = (currentProblem.step1_val || 0);
                const tVal = (currentProblem.step2_val || 0);
                const tIsNeg = currentProblem.step2_is_negative;

                if (tIsNeg) {
                    return `[${hVal * 10} - ${tVal}]`;
                }
                return null;
            }

            // Step 5 Helper (Final) in 5-step mode, or Step 4 in 4-step mode: [Tens - U]
            if ((!is4Step && activeStep === 5) || (is4Step && activeStep === 4)) {
                const uVal = currentProblem.step3_val || 0;
                const uIsNeg = currentProblem.step3_is_negative;
                const hVal = currentProblem.step1_val || 0;
                const tVal = currentProblem.step2_val || 0;

                if (uIsNeg) {
                    // For 4-step mode, calculate intermediate on the fly: H*10+T
                    const intermedVal = is4Step ? (hVal * 10 + tVal) : (currentProblem.step4_val || 0);
                    const tensDigit = intermedVal % 10;
                    return `[${tensDigit * 10} - ${uVal}]`;
                }
                return null;
            }
        } else {
            // 2D logic
            if (activeStep === 3) {
                if (currentProblem?.step2_is_negative) {
                    const tensVal = (currentProblem.step1_val || 0) * 10;
                    const unitsVal = currentProblem.step2_val || 0;
                    return `[${tensVal} - ${unitsVal}]`;
                }
            }
        }
        return null;
    };
    const tooltipText = getTooltip();

    // Split tooltip text if needed by step, but currently getTooltip depends on activeStep so it's fine.
    // However, since we now have TWO separators that could hold tooltips, we must ensure the correct one renders it.
    // Step 4 Tooltip -> Sep 1.5 (Above Merged Row)
    // Step 5 Tooltip -> Sep 2 (Above Total Row)

    const is4Step = is3Digit && currentProblem?.totalSteps === 4;
    const showTotalSeparator = is3Digit
        ? (is4Step ? currentStep >= 4 : currentStep >= 5)
        : currentStep >= 3;

    return (
        <Layout2
            title={t(titleKey)}
            subtitle={t(subtitleKey)}
            description={t('games.frontSubtraction.description')}
            gameId={gameId || 'math-level2-front-subtraction-lv1'}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#eff6ff', blob2: '#f0f9ff', blob3: '#e0f2fe', blob4: '#dbeafe' }} />}
            instructions={[
                { icon: '🔟', title: t('games.frontSubtraction.howToPlay.step1.title'), description: t('games.frontSubtraction.howToPlay.step1.desc') },
                { icon: '1️⃣', title: t('games.frontSubtraction.howToPlay.step2.title'), description: t('games.frontSubtraction.howToPlay.step2.desc') },
                { icon: '✅', title: t('games.frontSubtraction.howToPlay.step3.title'), description: t('games.frontSubtraction.howToPlay.step3.desc') }
            ]}
            powerUps={[
                { count: engine.powerUps.timeFreeze, color: 'blue', icon: '❄️', title: 'Freeze', onClick: () => engine.activatePowerUp('timeFreeze'), disabledConfig: engine.isTimeFrozen, status: engine.isTimeFrozen ? 'active' : 'normal' },
                { count: engine.powerUps.extraLife, color: 'red', icon: '❤️', title: 'Life', onClick: () => engine.activatePowerUp('extraLife'), disabledConfig: engine.lives >= 3, status: engine.lives >= 3 ? 'maxed' : 'normal' },
                { count: engine.powerUps.doubleScore, color: 'yellow', icon: '⚡', title: 'Double', onClick: () => engine.activatePowerUp('doubleScore'), disabledConfig: engine.isDoubleScore, status: engine.isDoubleScore ? 'active' : 'normal' }
            ]}
        >
            <div style={{
                /* ... container styles ... */
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
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '12cqi',
                                    fontWeight: 'bold',
                                    color: '#64748b'
                                }}>-</div>
                                <Tile val={currentProblem.row2_hundreds} highlight={is3Digit && activeStep === 1} showArrow={shouldShowArrow('hundreds')} arrowType={getArrowType('hundreds')} />
                                <Tile val={currentProblem.row2_tens} highlight={(is3Digit && activeStep === 2) || (!is3Digit && activeStep === 1)} showArrow={shouldShowArrow('tens')} arrowType={getArrowType('tens')} />
                                <Tile val={currentProblem.row2_units} highlight={(is3Digit && activeStep === 3) || (!is3Digit && activeStep === 2)} showArrow={shouldShowArrow('units')} arrowType={getArrowType('units')} />

                                {/* Separator 1 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {is3Digit && (
                                    <>
                                        {/* Step 1: Hundreds Sum */}
                                        <Tile val={stepsData.hundreds[0]} type={activeStep === 1 ? 'input' : 'static'} active={activeStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                        <Tile val={stepsData.hundreds[1]} type={activeStep === 1 ? 'input' : 'static'} active={activeStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                        <Tile val={stepsData.hasHundredsGhostZero ? '0' : stepsData.hundreds[2]} type={stepsData.hasHundredsGhostZero ? 'ghost' : 'static'} />
                                        <Tile val={stepsData.hundreds[3]} />
                                    </>
                                )}

                                {/* Step: Tens Sum */}
                                <Tile val={stepsData.tens[0]} />
                                <Tile val={stepsData.tens[1]} type={activeStep === (is3Digit ? 2 : 1) ? 'input' : 'static'} active={activeStep === (is3Digit ? 2 : 1)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.tens[2]} type={activeStep === (is3Digit ? 2 : 1) ? 'input' : 'static'} active={activeStep === (is3Digit ? 2 : 1)} isFeedback={!!feedback} feedbackStatus={feedback} isNegative={stepsData.isTensNegative} />
                                <Tile val={stepsData.hasTensGhostZero ? '0' : stepsData.tens[3]} type={stepsData.hasTensGhostZero ? 'ghost' : 'static'} />

                                {/* Separator 1.5 (For Step 4 Tooltip - 3-Digit only) */}
                                {/* Occupies 0 height if not 3D, or simply conditionally rendered */}
                                {is3Digit && (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        height: '0px', // Invisible height, just an anchor
                                        alignSelf: 'end', // Anchor to bottom of previous cell? or center gap?
                                        width: '100%',
                                        position: 'relative',
                                        zIndex: 200, // Top z-Index
                                        marginBottom: '4px' // Little gap 
                                    }}>
                                        {!stepsData.is4Step && activeStep === 4 && tooltipText && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-15px', // Move down closer to inputs (User req: "little bit lower")
                                                left: (() => {
                                                    const tIsNeg = currentProblem?.step2_is_negative;
                                                    if (tIsNeg) return '50%';
                                                    return '50%';
                                                })(),
                                                transform: 'translate(-50%, 0)', // Remove Y translate to rely on bottom px
                                                color: '#ef4444',
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '4cqi',
                                                fontWeight: '900',
                                                zIndex: 100,
                                                lineHeight: 1,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {tooltipText}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step: Units Sum  AND  Intermediate Result (Merged Row) */}
                                {/* Layout: [Col1: Empty?] [Col2: Intermed H] [Col3: Intermed T] [Col4: Units Result] */}

                                <Tile val={stepsData.intermediate?.[0]} />

                                {/* Intermediate Hundreds: Show if Step >= 4 (5-step mode only) */}
                                {is3Digit && !stepsData.is4Step ? (
                                    <Tile val={stepsData.intermediate?.[1]} type={activeStep === 4 ? 'input' : (currentStep > 4 ? 'static' : 'ghost')} active={activeStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                ) : is3Digit ? (
                                    <Tile val={null} />
                                ) : (
                                    <Tile val={stepsData.units[1]} />
                                )}

                                {/* Intermediate Tens (Col 3): Show if Step >= 4 (5-step mode only) */}
                                {is3Digit && !stepsData.is4Step ? (
                                    <Tile val={stepsData.intermediate?.[2]} type={activeStep === 4 ? 'input' : (currentStep > 4 ? 'static' : 'ghost')} active={activeStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                ) : is3Digit ? (
                                    <Tile val={null} />
                                ) : (
                                    <Tile val={stepsData.units[2]} type={activeStep === 2 ? 'input' : 'static'} active={activeStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                )}

                                {/* Units Result (Col 4): Show if Step >= 3 */}
                                <Tile
                                    val={stepsData.units[3]}
                                    type={activeStep === (is3Digit ? 3 : 2) ? 'input' : 'static'}
                                    active={activeStep === (is3Digit ? 3 : 2)}
                                    isFeedback={!!feedback}
                                    feedbackStatus={feedback}
                                    isNegative={stepsData.isUnitsNegative}
                                />

                                {/* Separator 2 (For Total step Tooltips - Step 5 in 5-step, Step 4 in 4-step) */}
                                <div style={{
                                    gridColumn: '1 / -1',
                                    height: '4px',
                                    background: '#cbd5e1',
                                    borderRadius: '2px',
                                    alignSelf: 'center',
                                    width: '100%',
                                    opacity: showTotalSeparator ? 1 : 0,
                                    transition: 'opacity 0.3s ease',
                                    position: 'relative'
                                }}>
                                    {/* Tooltip for Total step (Step 5 for 5-step, Step 4 for 4-step, Step 3 for 2D) */}
                                    {((is3Digit && is4Step && activeStep === 4) || (is3Digit && !is4Step && activeStep === 5) || (!is3Digit && activeStep === 3)) && tooltipText && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '75%', // Center between T-U columns
                                            transform: 'translate(-50%, -50%)',
                                            color: '#ef4444',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '4cqi',
                                            fontWeight: '900',
                                            zIndex: 100,
                                            lineHeight: 1,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            whiteSpace: 'nowrap',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {tooltipText}
                                        </div>
                                    )}
                                </div>

                                {/* Step: Final Total - Step 4 for 4-step, Step 5 for 5-step */}
                                <Tile val={stepsData.total[0]} type={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[1]} type={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[2]} type={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={stepsData.total[3]} type={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3) ? 'input' : 'static'} active={activeStep === (is3Digit ? (is4Step ? 4 : 5) : 3)} isFeedback={!!feedback} feedbackStatus={feedback} />
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
    id: 'math-level2-front-subtraction-lv1',
    title: 'Front Subtraction 1',
    description: '2-digit - 1-digit Subtraction',
    category: 'math',
    level: 2,
    thumbnail: '➖',
    titleKey: 'games.frontSubtraction.lv1.title',
    subtitleKey: 'games.frontSubtraction.lv1.subtitle',
    descriptionKey: 'games.frontSubtraction.description',
    component: FrontSubtractionGame
};

export const manifestLv2: GameManifest = {
    id: 'math-level2-front-subtraction-lv2',
    title: 'Front Subtraction 2',
    description: '2-digit - 2-digit Subtraction',
    category: 'math',
    level: 2,
    thumbnail: '➖',
    titleKey: 'games.frontSubtraction.lv2.title',
    subtitleKey: 'games.frontSubtraction.lv2.subtitle',
    descriptionKey: 'games.frontSubtraction.description',
    component: FrontSubtractionGame
};

export const manifestLv3: GameManifest = {
    id: 'math-level2-front-subtraction-lv3',
    title: 'Front Subtraction 3',
    description: '3-digit - 2-digit Subtraction',
    category: 'math',
    level: 2,
    thumbnail: '➖',
    titleKey: 'games.frontSubtraction.lv3.title',
    subtitleKey: 'games.frontSubtraction.lv3.subtitle',
    descriptionKey: 'games.frontSubtraction.description',
    component: FrontSubtractionGame
};

export const manifestLv4: GameManifest = {
    id: 'math-level2-front-subtraction-lv4',
    title: 'Front Subtraction 4',
    description: '3-digit - 3-digit Subtraction',
    category: 'math',
    level: 2,
    thumbnail: '➖',
    titleKey: 'games.frontSubtraction.lv4.title',
    subtitleKey: 'games.frontSubtraction.lv4.subtitle',
    descriptionKey: 'games.frontSubtraction.description',
    component: FrontSubtractionGame
};
