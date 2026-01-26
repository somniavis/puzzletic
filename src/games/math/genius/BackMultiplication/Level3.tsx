import React, { useMemo } from 'react';
import type { GameManifest } from '../../../types';
import { GameIds } from '../../../../constants/gameIds';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useBackMultiplicationLogicLv3 } from './GameLogicLv3';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';

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

const HintArrow = ({ type }: { type: 'down' | 'diagonal' | 'diagonal-long' | 'plus' }) => {
    const style: React.CSSProperties = {
        position: 'absolute', top: '-4px', width: '180%', left: '-85%', transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, pointerEvents: 'none'
    };
    if (type === 'diagonal') {
        Object.assign(style, { left: '-135%', width: '280%', top: '-10%', transform: 'none' });
    } else if (type === 'diagonal-long') {
        Object.assign(style, { left: '-235%', width: '380%', top: '-10%', transform: 'none' });
    } else if (type === 'plus') {
        Object.assign(style, { left: '-10%', width: '100%', top: '40%', transform: 'none' });
    }
    return (
        <div style={style}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
                animation: 'floatGuide 1.5s ease-in-out infinite', lineHeight: 1,
                transform: (type === 'diagonal' || type === 'diagonal-long') ? 'rotate(-45deg)' : 'none'
            }}>
                <div style={{
                    width: '7cqi', height: '7cqi', borderRadius: '50%', background: 'white', border: '2px solid #ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4cqi', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {type === 'plus' ? '+' : '×'}
                </div>
                <div style={{ fontSize: '8cqi', color: '#ef4444', fontWeight: 'bold', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
                    {(type === 'diagonal' || type === 'diagonal-long') ? '↘' : '↓'}
                </div>
            </div>
        </div>
    );
};

const Tile = ({
    val, type = 'static', active = false, isFeedback = false, feedbackStatus, highlight = false, showArrow = false, arrowType = 'down'
}: {
    val: string | number | null, type?: 'static' | 'input', active?: boolean, isFeedback?: boolean, feedbackStatus?: 'correct' | 'wrong' | null, highlight?: boolean, showArrow?: boolean, arrowType?: 'down' | 'diagonal' | 'diagonal-long' | 'plus'
}) => {
    let borderColor = '#e2e8f0'; let shadowColor = '#cbd5e1'; let backgroundColor = 'white';
    if (highlight) { borderColor = '#fda4af'; shadowColor = '#fda4af'; backgroundColor = '#ffe4e6'; }
    if (type === 'input' && active) {
        if (isFeedback) {
            borderColor = feedbackStatus === 'correct' ? '#22c55e' : '#ef4444';
            shadowColor = feedbackStatus === 'correct' ? '#15803d' : '#b91c1c';
        } else {
            borderColor = '#3b82f6'; shadowColor = '#2563eb';
        }
        backgroundColor = 'white';
    }
    const isGhost = val === null;
    if (isGhost) { borderColor = 'transparent'; shadowColor = 'transparent'; backgroundColor = 'transparent'; }
    return (
        <div style={{
            width: '100%', height: '100%', minHeight: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12cqi', fontWeight: '800', color: '#1e293b', background: backgroundColor,
            borderStyle: 'solid', borderWidth: '3px 3px 5px 3px', borderColor: borderColor,
            boxShadow: `0 2px 0 ${shadowColor}`, borderRadius: '12px', opacity: (isGhost && !showArrow) ? 0 : 1,
            transform: type === 'input' && active ? 'translateY(2px)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative'
        }}>
            {val}
            {showArrow && <HintArrow type={arrowType} />}
        </div>
    );
};

export const BackMultiplicationGameLv3: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 120 });
    const {
        currentProblem, userInput, currentStep, completedSteps, feedback, handleInput
    } = useBackMultiplicationLogicLv3(engine);

    // Active columns for Step 4 (Total) can be up to 4 digits.
    const totalStepDigits = useMemo(() => {
        return currentProblem?.step4_str.length || 4;
    }, [currentProblem]);

    // Display Values
    const step1Disp = currentStep === 1 ? userInput : (completedSteps.step1 || '');
    const step2Disp = currentStep >= 2 ? (currentStep === 2 ? userInput : (completedSteps.step2 || '')) : null;
    const step3Disp = currentStep >= 3 ? (currentStep === 3 ? userInput : (completedSteps.step3 || '')) : null;
    const step4Disp = currentStep >= 4 ? (currentStep === 4 ? userInput : (completedSteps.step4 || '')) : null;

    // Step Tiles (All 2 digits for partial steps)
    const step1Tiles = useMemo(() => fillSlots(step1Disp, 2, 2), [step1Disp]);
    const step2Tiles = useMemo(() => fillSlots(step2Disp, 2, 2), [step2Disp]);
    const step3Tiles = useMemo(() => fillSlots(step3Disp, 2, 2), [step3Disp]);

    // Total (Step 4)
    const step4Tiles = useMemo(() => fillSlots(step4Disp, totalStepDigits, 4), [step4Disp, totalStepDigits]);

    return (
        <Layout2
            title={t('games.backMultiplication.lv3.title')}
            subtitle={t('games.backMultiplication.lv3.subtitle')}
            description={t('games.backMultiplication.description')}
            gameId={gameId || GameIds.BACK_MULTIPLICATION_LV3}
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
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {currentProblem ? (
                    <>
                        <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', minHeight: 0, width: '100%', containerType: 'size' }}>
                            <div style={{
                                width: '100%', maxWidth: '500px', height: '100%', maxHeight: '100cqi',
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                // H T U columns with 1 padding? No. 4 Cols: T H T U? 
                                // Thousands Hundreds Tens Units = 4 cols.
                                gridTemplateRows: 'repeat(2, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)) auto minmax(0, 1fr)',
                                gap: '6px', alignContent: 'stretch', justifyItems: 'stretch', containerType: 'inline-size'
                            }}>
                                {/* Row 1: Problem Top (  Hun Tens Units ) */}
                                <Tile val={null} />
                                <Tile val={currentProblem.row1_hundreds} highlight={currentStep === 3} />
                                <Tile val={currentProblem.row1_tens} highlight={currentStep === 2} />
                                <Tile val={currentProblem.row1_units} highlight={currentStep === 1} />

                                {/* Row 2: Problem Bot (x            Units ) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8cqi', fontWeight: 'bold', color: '#334155' }}>×</div>
                                <Tile val={null} />
                                <Tile val={null} />
                                <Tile val={currentProblem.row2_units} highlight={true}
                                    showArrow={currentStep >= 1 && currentStep <= 3}
                                    arrowType={currentStep === 3 ? 'diagonal-long' : (currentStep === 2 ? 'diagonal' : 'down')}
                                />

                                {/* Sep */}
                                <div style={{ gridColumn: '1/-1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }} />

                                {/* Step 1: Units x Mult (Cols 3, 4) */}
                                <Tile val={null} />
                                <Tile val={null} />
                                <Tile val={step1Tiles[0]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Tiles[1]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Step 2: Tens x Mult (Cols 2, 3) */}
                                <Tile val={null} />
                                <Tile val={step2Tiles[0]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step2Tiles[1]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} />

                                {/* Step 3: Hundreds x Mult (Cols 1, 2) */}
                                <Tile val={step3Tiles[0]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Tiles[1]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} />
                                <Tile val={null} />

                                {/* Sep 2 */}
                                <div style={{ gridColumn: '1 / -1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%', opacity: currentStep === 4 ? 1 : 0, transition: 'opacity 0.3s' }} />

                                {/* Step 4: Total (Cols 1,2,3,4) */}
                                <Tile val={step4Tiles[0]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[1]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[2]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[3]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />

                            </div>
                        </div>
                        <div style={{ flex: '0 0 auto', width: '100%', background: 'transparent', zIndex: 10, padding: '10px 10px 0 10px', marginBottom: '-12px' }}>
                            <Keypad onInput={handleInput} disabled={!!feedback && feedback !== 'correct'} />
                        </div>
                    </>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </Layout2>
    );
};

export const manifestLv3: GameManifest = {
    id: GameIds.BACK_MULTIPLICATION_LV3,
    title: 'Multiplication Lv3',
    description: '3-digit x 1-digit',
    category: 'math',
    level: 2,
    thumbnail: '✖️',
    titleKey: 'games.backMultiplication.lv3.title',
    subtitleKey: 'games.backMultiplication.lv3.subtitle',
    descriptionKey: 'games.backMultiplication.description',
    mode: 'genius',
    component: BackMultiplicationGameLv3
};
