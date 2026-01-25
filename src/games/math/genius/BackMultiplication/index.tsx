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

export const BackMultiplicationGame: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 120 // A bit more time for multiplication
    });

    const {
        currentProblem,
        userInput,
        currentStep,
        feedback,
        handleInput
    } = useBackMultiplicationLogic(engine);

    // Grid Layout: 4 Columns (Thousands, Hundreds, Tens, Units)
    // Row 1: Problem Top (  Tens Units )
    // Row 2: Problem Bot (x      Units )
    // Row 3: Step 1      (    Tens Units ) (Strictly 2 digits, aligned right)
    // Row 4: Step 2      (Hun Tens       ) (Strictly 2 digits, shifted left)
    // Row 5: Total       (Tho Hun Tens Uni)



    // Display Values
    const step1Disp = userInput; // Only 1 step

    // Step 1: Result (Cols 1,2) of size 2.
    const step1Digits = useMemo(() => currentProblem?.step1_str.length || 2, [currentProblem]);
    const step1Tiles = useMemo(() => fillSlots(step1Disp, step1Digits, 2), [step1Disp, step1Digits]);

    return (
        <Layout2
            title="Back Multiplication 1"
            subtitle="1-digit x 1-digit"
            description={t('games.backMultiplication.description')}
            gameId={gameId || 'back-multiplication-lv1'}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#fdf4ff', blob2: '#fae8ff', blob3: '#f0abfc', blob4: '#e879f9' }} />}
            instructions={[
                { icon: '✅', title: t('games.backMultiplication.howToPlay.step1.title'), description: t('games.backMultiplication.hint.step1') }
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
                                maxWidth: '300px', // Smaller width for 1x1
                                height: '100%',
                                maxHeight: '100cqi',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)', // 2 Cols
                                gridTemplateRows: 'repeat(2, minmax(0, 1fr)) auto minmax(0, 1fr)', // P1, P2, Sep, Ans
                                gap: '8px',
                                alignContent: 'center',
                                justifyItems: 'stretch',
                                containerType: 'inline-size'
                            }}>
                                {/* Row 1: Top Number [ ][U] */}
                                <Tile val={null} />
                                <Tile val={currentProblem.row1_units} highlight={currentStep === 1} />

                                {/* Row 2: Bottom Number [x][U] */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12cqi',
                                    fontWeight: 'bold',
                                    color: '#334155'
                                }}>×</div>
                                <Tile val={currentProblem.row2_units} highlight={currentStep === 1} />

                                {/* Separator */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {/* Row 3: Answer [T][U] */}
                                <Tile val={step1Tiles[0]} type="input" active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Tiles[1]} type="input" active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />

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

export const manifestLv1: GameManifest = {
    id: 'back-multiplication-lv1',
    title: 'Back Multiplication 1',
    description: '1-digit x 1-digit',
    category: 'math',
    level: 1, // Start easy
    thumbnail: '✖️',
    titleKey: undefined,
    subtitleKey: undefined,
    component: BackMultiplicationGame
};
