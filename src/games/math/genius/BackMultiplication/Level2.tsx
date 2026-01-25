import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useBackMultiplicationLogic } from './GameLogic';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad'; // Use local Keypad
import type { GameManifest } from '../../../types';

// Helper to split string values into grid slots (Left to Right filling)
// Step 1 & 2 are strictly 2 digits. Step 3(Total) can be 3 or 4 digits.
// Helper to distribute value Left-to-Right into active slots
// Returns array of size `totalSlots`.
// Inactive slots (left padding) are `null`.
// Active slots (even if empty) are `''` or char.
const fillSlots = (valStr: string | null, activeCols: number, totalSlots: number) => {
    if (valStr === null) return Array(totalSlots).fill(null);

    const chars = valStr.split('');
    const result = Array(totalSlots).fill(null);
    const startCol = totalSlots - activeCols;

    for (let i = 0; i < activeCols; i++) {
        // Assign char if available, else empty string (to show empty box)
        result[startCol + i] = chars[i] || '';
    }
    return result;
};

// Recreated Tile component for local customization if needed, 
// basically identical to FrontAddition but simpler props where possible
// Extracted Hint Arrow Component for cleaner code
const HintArrow = ({ type }: { type: 'down' | 'diagonal' | 'plus' }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        top: '-4px',
        width: '180%',
        left: '-85%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        pointerEvents: 'none'
    };

    if (type === 'diagonal') {
        Object.assign(style, {
            left: '-135%',
            width: '280%',
            top: '-10%',
            transform: 'none'
        });
    } else if (type === 'plus') {
        Object.assign(style, {
            left: '-10%',
            width: '100%',
            top: '40%',
            transform: 'none'
        });
    }

    return (
        <div style={style}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                animation: 'floatGuide 1.5s ease-in-out infinite',
                lineHeight: 1,
                transform: type === 'diagonal' ? 'rotate(-45deg)' : 'none'
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
                    {type === 'plus' ? '+' : '×'}
                </div>
                <div style={{
                    fontSize: '8cqi',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(255,255,255,0.8)',
                }}>
                    {type === 'diagonal' ? '↘' : '↓'}
                </div>
            </div>
        </div>
    );
};

// Simplified Tile Component
const Tile = ({
    val,
    type = 'static',
    active = false,
    isFeedback = false,
    feedbackStatus,
    highlight = false,
    showArrow = false,
    arrowType = 'down'
}: {
    val: string | number | null,
    type?: 'static' | 'input',
    active?: boolean,
    isFeedback?: boolean,
    feedbackStatus?: 'correct' | 'wrong' | null,
    highlight?: boolean,
    showArrow?: boolean,
    arrowType?: 'down' | 'diagonal' | 'plus'
}) => {
    // Base Styles
    let borderColor = '#e2e8f0';
    let shadowColor = '#cbd5e1';
    let backgroundColor = 'white';

    // State-based Style Overrides
    if (highlight) {
        borderColor = '#fda4af';
        shadowColor = '#fda4af';
        backgroundColor = '#ffe4e6';
    }

    if (type === 'input' && active) {
        // Feedback colors take precedence if active
        if (isFeedback) {
            const isCorrect = feedbackStatus === 'correct';
            borderColor = isCorrect ? '#22c55e' : '#ef4444';
            shadowColor = isCorrect ? '#15803d' : '#b91c1c';
        } else {
            borderColor = '#3b82f6';
            shadowColor = '#2563eb';
        }
        backgroundColor = 'white';
    }

    // Ghost mode for empty tiles (just for hints)
    // Only apply if NO value. If arrow is shown, we keep opacity 1, else 0.
    const isGhost = val === null;
    if (isGhost) {
        borderColor = 'transparent';
        shadowColor = 'transparent';
        backgroundColor = 'transparent';
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
            color: '#1e293b',
            background: backgroundColor,
            borderStyle: 'solid',
            borderWidth: '3px 3px 5px 3px',
            borderColor: borderColor,
            boxShadow: `0 2px 0 ${shadowColor}`,
            borderRadius: '12px',
            opacity: (isGhost && !showArrow) ? 0 : 1,
            transform: type === 'input' && active ? 'translateY(2px)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            position: 'relative'
        }}>
            {val}
            {showArrow && <HintArrow type={arrowType} />}
        </div>
    );
};

export const BackMultiplicationGameLv2: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 120 // A bit more time for multiplication
    });

    const {
        currentProblem,
        userInput,
        currentStep,
        completedSteps,
        feedback,
        handleInput
    } = useBackMultiplicationLogic(engine);

    // Grid Layout: 4 Columns (Thousands, Hundreds, Tens, Units)
    // Row 1: Problem Top (  Tens Units )
    // Row 2: Problem Bot (x      Units )
    // Row 3: Step 1      (    Tens Units ) (Strictly 2 digits, aligned right)
    // Row 4: Step 2      (Hun Tens       ) (Strictly 2 digits, shifted left)
    // Row 5: Total       (Tho Hun Tens Uni)

    // Determines active columns for Step 3 (Total) based on expected answer length
    const totalStepDigits = useMemo(() => {
        return currentProblem?.step3_str.length || 3;
    }, [currentProblem]);

    // Display Values (null if step not yet accessible)
    // Step 1 is always accessible.
    const step1Disp = currentStep === 1 ? userInput : (completedSteps.step1 || '');
    // Step 2 visible if >= Step 2
    const step2Disp = currentStep >= 2 ? (currentStep === 2 ? userInput : (completedSteps.step2 || '')) : null;
    // Step 3 visible if >= Step 3
    const step3Disp = currentStep >= 3 ? (currentStep === 3 ? userInput : (completedSteps.step3 || '')) : null;

    // Step 1 values: Dynamic active cols (1 or 2)
    const step1Digits = useMemo(() => currentProblem?.step1_str.length || 2, [currentProblem]);
    const step1Tiles = useMemo(() => fillSlots(step1Disp, step1Digits, 2), [step1Disp, step1Digits]);

    // Step 2 values: Dynamic active cols (1 or 2)
    const step2Digits = useMemo(() => currentProblem?.step2_str.length || 2, [currentProblem]);
    const step2Tiles = useMemo(() => fillSlots(step2Disp, step2Digits, 2), [step2Disp, step2Digits]);

    // Step 3 (Total): Active cols dynamic. 4 Total Slots.
    const step3Tiles = useMemo(() => fillSlots(step3Disp, totalStepDigits, 4), [step3Disp, totalStepDigits]);


    return (
        <Layout2
            title={t('games.backMultiplication.lv1.title')} // Need to add key
            subtitle={t('games.backMultiplication.lv1.subtitle')} // Need to add key
            description={t('games.backMultiplication.description')} // Need to add key
            gameId={gameId || 'back-multiplication-lv1'}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#fdf4ff', blob2: '#fae8ff', blob3: '#f0abfc', blob4: '#e879f9' }} />} // Purple/Pink theme
            instructions={[
                { icon: '1️⃣', title: t('games.backMultiplication.howToPlay.step1.title'), description: t('games.backMultiplication.hint.step1') },
                { icon: '2️⃣', title: t('games.backMultiplication.howToPlay.step2.title'), description: t('games.backMultiplication.hint.step2') },
                { icon: '✅', title: t('games.backMultiplication.howToPlay.step3.title'), description: t('games.backMultiplication.hint.step3') }
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
                                maxWidth: '500px',
                                height: '100%',
                                maxHeight: '100cqi',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gridTemplateRows: 'repeat(2, minmax(0, 1fr)) auto repeat(2, minmax(0, 1fr)) auto minmax(0, 1fr)', // 2 prob, sep, 2 steps, sep, 1 total
                                gap: '8px',
                                alignContent: 'stretch',
                                justifyItems: 'stretch',
                                containerType: 'inline-size'
                            }}>
                                {/* Row 1: Problem Top (  Tens Units ) */}
                                <Tile val={null} />
                                <Tile val={null} />
                                <Tile val={currentProblem.row1_tens} highlight={currentStep === 2} /> {/* Highligh for Diagonal step 2 */}
                                <Tile val={currentProblem.row1_units} highlight={currentStep === 1} /> {/* Highlight for Down step 1 */}

                                {/* Row 2: Problem Bot (x      Units ) */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '8cqi',
                                    fontWeight: 'bold',
                                    color: '#334155'
                                }}>×</div>
                                <Tile val={null} />
                                <Tile val={null} />
                                <Tile val={currentProblem.row2_units}
                                    highlight={currentStep === 1 || currentStep === 2}
                                    showArrow={currentStep === 1 || currentStep === 2}
                                    arrowType={currentStep === 1 ? 'down' : 'diagonal'}
                                />

                                {/* Separator 1 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {/* Step 1 Result: Units x Mult. Right Aligned (Cols 2, 3) */}
                                <Tile val={null}
                                    showArrow={currentStep === 3}
                                    arrowType="plus"
                                />
                                <Tile val={null} />
                                <Tile val={step1Tiles[0]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Tiles[1]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Step 2 Result: Tens x Mult. Shifted Left (Cols 1, 2) */}
                                <Tile val={null} />
                                <Tile val={step2Tiles[0]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step2Tiles[1]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} /> {/* Empty slot under units */}

                                {/* Separator 2 */}
                                <div style={{
                                    gridColumn: '1 / -1',
                                    height: '4px',
                                    background: '#cbd5e1',
                                    borderRadius: '2px',
                                    alignSelf: 'center',
                                    width: '100%',
                                    opacity: currentStep === 3 ? 1 : 0,
                                    transition: 'opacity 0.3s'
                                }}></div>

                                {/* Step 3: Total */}
                                <Tile val={step3Tiles[0]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Tiles[1]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Tiles[2]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Tiles[3]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />

                            </div>
                        </div>
                        {/* KEYPAD */}
                        <div style={{ flex: '0 0 auto', width: '100%', background: 'transparent', zIndex: 10, padding: '10px 10px 0 10px', marginBottom: '-12px' }}>
                            <Keypad onInput={handleInput} disabled={!!feedback && feedback !== 'correct'} />
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#64748b' }}>
                        Loading...
                    </div>
                )}
            </div>
        </Layout2>
    );
};

export const manifestLv2: GameManifest = {
    id: 'back-multiplication-lv2',
    title: 'Multiplication Lv2',
    description: '3-digit x 1-digit',
    category: 'math',
    level: 2,
    thumbnail: '✖️',
    titleKey: 'games.backMultiplication.lv2.title',
    subtitleKey: 'games.backMultiplication.lv2.subtitle',
    descriptionKey: 'games.backMultiplication.description',
    mode: 'genius',
    component: BackMultiplicationGameLv2
};
