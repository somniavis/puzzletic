import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useBackMultiplicationLogicLv3 } from './GameLogicLv3';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';
import type { GameManifest } from '../../../types';

// Helper to fill slots Left-to-Right
const fillSlots = (valStr: string | null, activeCols: number, totalSlots: number) => {
    if (valStr === null) return Array(totalSlots).fill(null);

    const chars = valStr.split('');
    const result = Array(totalSlots).fill(null);
    const startCol = totalSlots - activeCols;

    for (let i = 0; i < activeCols; i++) {
        result[startCol + i] = chars[i] || '';
    }
    return result;
};

// Hint Arrow Component
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
            top: '40%', // Between rows
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

// Tile Component
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
    let borderColor = '#e2e8f0';
    let shadowColor = '#cbd5e1';
    let backgroundColor = 'white';

    if (highlight) {
        borderColor = '#fda4af';
        shadowColor = '#fda4af';
        backgroundColor = '#ffe4e6';
    }

    if (type === 'input' && active) {
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

export const BackMultiplicationGameLv3: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 150 // More time for 3-digit multiplication
    });

    const {
        currentProblem,
        userInput,
        currentStep,
        completedSteps,
        feedback,
        handleInput
    } = useBackMultiplicationLogicLv3(engine);

    // Determines active columns for Step 4 (Total)
    const totalStepDigits = useMemo(() => {
        return currentProblem?.step4_str.length || 4;
    }, [currentProblem]);

    // Display Values
    const step1Disp = currentStep === 1 ? userInput : (completedSteps.step1 || '');
    const step2Disp = currentStep >= 2 ? (currentStep === 2 ? userInput : (completedSteps.step2 || '')) : null;
    const step3Disp = currentStep >= 3 ? (currentStep === 3 ? userInput : (completedSteps.step3 || '')) : null;
    const step4Disp = currentStep >= 4 ? (currentStep === 4 ? userInput : (completedSteps.step4 || '')) : null;

    // Step 1: Units x Mult (Cols 2, 3)
    const step1Digits = useMemo(() => currentProblem?.step1_str.length || 2, [currentProblem]);
    const step1Tiles = useMemo(() => fillSlots(step1Disp, step1Digits, 2), [step1Disp, step1Digits]);

    // Step 2: Tens x Mult (Cols 1, 2)
    const step2Digits = useMemo(() => currentProblem?.step2_str.length || 2, [currentProblem]);
    const step2Tiles = useMemo(() => fillSlots(step2Disp, step2Digits, 2), [step2Disp, step2Digits]);

    // Step 3: Hundreds x Mult (Cols 0, 1)
    const step3Digits = useMemo(() => currentProblem?.step3_str.length || 2, [currentProblem]);
    const step3Tiles = useMemo(() => fillSlots(step3Disp, step3Digits, 2), [step3Disp, step3Digits]);

    // Step 4: Total (Cols 0, 1, 2, 3)
    const step4Tiles = useMemo(() => fillSlots(step4Disp, totalStepDigits, 4), [step4Disp, totalStepDigits]);


    return (
        <Layout2
            title="Back Multiplication 3"
            subtitle="3-digit x 1-digit"
            description={t('games.backMultiplication.description')}
            gameId={gameId || 'back-multiplication-lv3'}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#fdf4ff', blob2: '#fae8ff', blob3: '#f0abfc', blob4: '#e879f9' }} />}
            instructions={[
                { icon: '1️⃣', title: t('games.backMultiplication.howToPlay.step1.title'), description: t('games.backMultiplication.hint.step1') },
                { icon: '2️⃣', title: t('games.backMultiplication.howToPlay.step2.title'), description: t('games.backMultiplication.hint.step2') },
                { icon: '3️⃣', title: t('games.backMultiplication.howToPlay.step3_hundreds.title'), description: t('games.backMultiplication.hint.step3_hundreds') },
                { icon: '✅', title: t('games.backMultiplication.howToPlay.step4.title'), description: t('games.backMultiplication.hint.step4') }
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
                                gridTemplateRows: 'repeat(2, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)) auto minmax(0, 1fr)',
                                gap: '8px',
                                alignContent: 'stretch',
                                justifyItems: 'stretch',
                                containerType: 'inline-size'
                            }}>
                                {/* Row 1: Problem Top (Hun Ten Uni) */}
                                <Tile val={null} />
                                <Tile val={currentProblem.row1_hundreds} highlight={currentStep === 3} />
                                <Tile val={currentProblem.row1_tens} highlight={currentStep === 2} />
                                <Tile val={currentProblem.row1_units} highlight={currentStep === 1} />

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
                                    highlight={currentStep >= 1 && currentStep <= 3}
                                    showArrow={currentStep >= 1 && currentStep <= 3}
                                    arrowType={currentStep === 1 ? 'down' : 'diagonal'}
                                />

                                {/* Separator 1 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }}></div>

                                {/* Step 1: Units x Mult (Cols 2, 3) */}
                                <Tile val={null}
                                    showArrow={currentStep === 4}
                                    arrowType="plus"
                                />
                                <Tile val={null} />
                                <Tile val={step1Tiles[0]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Tiles[1]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Step 2: Tens x Mult (Cols 1, 2) */}
                                <Tile val={null} />
                                <Tile val={step2Tiles[0]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step2Tiles[1]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} />

                                {/* Step 3: Hundreds x Mult (Cols 0, 1) */}
                                <Tile val={step3Tiles[0]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Tiles[1]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} />
                                <Tile val={null} />

                                {/* Separator 2 */}
                                <div style={{
                                    gridColumn: '1 / -1',
                                    height: '4px',
                                    background: '#cbd5e1',
                                    borderRadius: '2px',
                                    alignSelf: 'center',
                                    width: '100%',
                                    opacity: currentStep === 4 ? 1 : 0,
                                    transition: 'opacity 0.3s'
                                }}></div>

                                {/* Step 4: Total */}
                                <Tile val={step4Tiles[0]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[1]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[2]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[3]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />

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

export const manifestLv3: GameManifest = {
    id: 'back-multiplication-lv3',
    title: 'Back Multiplication 3',
    description: '3-digit x 1-digit',
    category: 'math',
    level: 3,
    thumbnail: '✖️',
    titleKey: undefined, // Use hardcoded title if key missing, or I should update locale.
    // User asked to "Change Titles". I will use hardcoded or wait for locale update.
    // I put "Back Multiplication 3" in title property. 
    subtitleKey: undefined,
    component: BackMultiplicationGameLv3
};
