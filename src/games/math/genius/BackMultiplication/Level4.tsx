import React, { useMemo } from 'react';
import type { GameManifest } from '../../../types';
import { GameIds } from '../../../../constants/gameIds';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useBackMultiplicationLogicLv4 } from './GameLogicLv4';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';

// Helper to fill slots Left-to-Right
const fillSlots = (valStr: string | null, activeCols: number, totalSlots: number) => {
    if (valStr === null) return Array(totalSlots).fill(null);

    const chars = valStr.split('');
    const result = Array(totalSlots).fill(null);
    const startCol = totalSlots - activeCols; // Align Right inside the slot group

    for (let i = 0; i < activeCols; i++) {
        result[startCol + i] = chars[i] || '';
    }
    return result;
};

// Hint Arrow Component (Shared style with Lv2)
const HintArrow = ({ type }: { type: 'down' | 'diagonal-right' | 'diagonal-left' | 'plus' }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        top: '-4px', // This top/left is overridden by conditionals below
        width: '180%',
        left: '-85%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        pointerEvents: 'none'
    };

    if (type === 'diagonal-right') { // ↘
        Object.assign(style, {
            left: '100%',
            width: '150%',
            top: '50%',
            transform: 'translate(-50%, -20%)'
        });
    } else if (type === 'diagonal-left') { // ↙
        Object.assign(style, {
            left: '0%',
            width: '150%',
            top: '50%',
            transform: 'translate(-50%, -20%)'
        });
    } else if (type === 'plus') {
        Object.assign(style, {
            left: '50%', // Center in the cell (Col 1 is empty space)
            width: '100%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
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
            }}>
                <div style={{
                    width: '7cqi', height: '7cqi', borderRadius: '50%', background: 'white',
                    border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '4cqi', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {type === 'plus' ? '+' : 'x'}
                </div>
                {type === 'diagonal-right' && (
                    <div style={{ fontSize: '8cqi', color: '#ef4444', fontWeight: 'bold', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
                        ↘
                    </div>
                )}
                {type === 'diagonal-left' && (
                    <div style={{ fontSize: '8cqi', color: '#ef4444', fontWeight: 'bold', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
                        ↙
                    </div>
                )}
                {(type === 'down' || type === 'plus') && (
                    <div style={{ fontSize: '8cqi', color: '#ef4444', fontWeight: 'bold', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
                        ↓
                    </div>
                )}
            </div>
        </div>
    );
};

interface TileProps {
    val: string | number | null;
    type?: 'static' | 'input';
    active?: boolean;
    isFeedback?: boolean;
    feedbackStatus?: 'correct' | 'wrong' | null;
    highlight?: boolean;
    showArrow?: boolean;
    arrowType?: 'down' | 'diagonal-right' | 'diagonal-left' | 'plus';
}

const Tile = ({
    val, type = 'static', active = false, isFeedback = false, feedbackStatus, highlight = false, showArrow = false, arrowType = 'down'
}: TileProps) => {
    let borderColor = '#e2e8f0';
    let shadowColor = '#cbd5e1';
    let backgroundColor = 'white';

    if (highlight) {
        borderColor = '#fda4af'; shadowColor = '#fda4af'; backgroundColor = '#ffe4e6';
    }
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
    if (isGhost) {
        borderColor = 'transparent'; shadowColor = 'transparent'; backgroundColor = 'transparent';
    }

    return (
        <div style={{
            width: '100%', height: '100%', minHeight: '0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12cqi', fontWeight: '800', color: '#1e293b',
            background: backgroundColor,
            borderStyle: 'solid', borderWidth: '3px 3px 5px 3px',
            borderColor: borderColor, boxShadow: `0 2px 0 ${shadowColor}`, borderRadius: '12px',
            opacity: (isGhost && !showArrow) ? 0 : 1,
            transform: type === 'input' && active ? 'translateY(2px)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative'
        }}>
            {val}
            {showArrow && <HintArrow type={arrowType} />}
        </div>
    );
};

export const BackMultiplicationGameLv4: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 120 });
    const {
        currentProblem, userInput, currentStep, completedSteps, feedback, handleInput
    } = useBackMultiplicationLogicLv4(engine);

    // Grid Layout: 4 Columns (Thousands, Hundreds, Tens, Units)
    // Row 1: Problem Top (  T U )
    // Row 2: Problem Bot (x T U )
    // Row 3: Step 1 & 2 Combined ( [S2][S2][S1][S1] ) -> Cols 1,2,3,4
    // Row 4: Step 3 (Outer Cross) ( [ ][S3][S3][ ] ) -> Cols 2,3
    // Row 5: Step 4 (Inner Cross) ( [ ][S4][S4][ ] ) -> Cols 2,3
    // Row 6: Total ( [T][T][T][T] ) -> Cols 1,2,3,4

    // Display Values
    // Step 1: Units x Units (Cols 3,4)
    const step1Disp = currentStep === 1 ? userInput : (completedSteps[1] || '');
    const step2Disp = currentStep === 2 ? userInput : (completedSteps[2] || '');
    const step3Disp = currentStep === 3 ? userInput : (completedSteps[3] || '');
    const step4Disp = currentStep === 4 ? userInput : (completedSteps[4] || '');
    const step5Disp = currentStep === 5 ? userInput : (completedSteps[5] || '');

    // Tile Generation
    const step1Tiles = useMemo(() => fillSlots(currentStep >= 1 ? step1Disp : null, 2, 2), [step1Disp, currentStep]);
    const step2Tiles = useMemo(() => fillSlots(currentStep >= 2 ? step2Disp : null, 2, 2), [step2Disp, currentStep]);
    const step3Tiles = useMemo(() => fillSlots(currentStep >= 3 ? step3Disp : null, 2, 2), [step3Disp, currentStep]);
    const step4Tiles = useMemo(() => fillSlots(currentStep >= 4 ? step4Disp : null, 2, 2), [step4Disp, currentStep]);
    // Step 5: Variable length
    const totalLen = currentProblem?.step5_target.length || 4;
    const step5Tiles = useMemo(() => fillSlots(currentStep >= 5 ? step5Disp : null, totalLen, 4), [step5Disp, currentStep, totalLen]);

    // Problem Digits
    const n1_t = currentProblem ? Math.floor(currentProblem.num1 / 10) : null;
    const n1_u = currentProblem ? currentProblem.num1 % 10 : null;
    const n2_t = currentProblem ? Math.floor(currentProblem.num2 / 10) : null;
    const n2_u = currentProblem ? currentProblem.num2 % 10 : null;

    return (
        <Layout2
            title={t('games.backMultiplication.lv4.title')}
            subtitle={t('games.backMultiplication.lv4.subtitle')}
            description={t('games.backMultiplication.description')}
            gameId={gameId || GameIds.BACK_MULTIPLICATION_LV4}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground colors={{ blob1: '#e0e7ff', blob2: '#c7d2fe', blob3: '#a5b4fc', blob4: '#818cf8' }} />}
            instructions={[
                { icon: '1️⃣', title: t('games.backMultiplication.howToPlay.step1.title'), description: t('games.backMultiplication.hint.step1_lv3') },
                { icon: '2️⃣', title: t('games.backMultiplication.howToPlay.step2.title'), description: t('games.backMultiplication.hint.step2_lv3') },
                { icon: '3️⃣', title: t('games.backMultiplication.howToPlay.step3_cross1.title'), description: t('games.backMultiplication.hint.step3_cross1') },
                { icon: '4️⃣', title: t('games.backMultiplication.howToPlay.step4_cross2.title'), description: t('games.backMultiplication.hint.step4_cross2') },
                { icon: '✅', title: t('games.backMultiplication.howToPlay.step5.title'), description: t('games.backMultiplication.hint.step5') }
            ]}
            powerUps={[
                { count: engine.powerUps.timeFreeze, color: 'blue', icon: '❄️', title: 'Freeze', onClick: () => engine.activatePowerUp('timeFreeze'), disabledConfig: engine.isTimeFrozen, status: engine.isTimeFrozen ? 'active' : 'normal' },
                { count: engine.powerUps.extraLife, color: 'red', icon: '❤️', title: 'Life', onClick: () => engine.activatePowerUp('extraLife'), disabledConfig: engine.lives >= 3, status: engine.lives >= 3 ? 'maxed' : 'normal' },
                { count: engine.powerUps.doubleScore, color: 'yellow', icon: '⚡', title: 'Double', onClick: () => engine.activatePowerUp('doubleScore'), disabledConfig: engine.isDoubleScore, status: engine.isDoubleScore ? 'active' : 'normal' }
            ]}
        >
            <div style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative'
            }}>
                {currentProblem ? (
                    <>
                        <div style={{
                            flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '10px', minHeight: 0, width: '100%', containerType: 'size'
                        }}>
                            <div style={{
                                width: '100%', maxWidth: '500px', height: '100%', maxHeight: '100cqi',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                // Rows: Prob(2), Sep(1), S1+S2(1), S3(1), S4(1), Sep(1), Total(1)
                                gridTemplateRows: 'repeat(2, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)) auto minmax(0, 1fr)',
                                gap: '8px', alignContent: 'stretch', justifyItems: 'stretch'
                            }}>
                                {/* Row 1: Top Number [ ][ ][T][U] */}
                                <Tile val={null} />
                                <Tile val={null} />
                                <Tile val={n1_t} highlight={currentStep === 2 || currentStep === 3}
                                    showArrow={currentStep === 3} arrowType="diagonal-right" /> {/* Step 3 Arrow: T1 -> U2 (↘) */}
                                <Tile val={n1_u} highlight={currentStep === 1 || currentStep === 4}
                                    showArrow={currentStep === 4} arrowType="diagonal-left" /> {/* Step 4 Arrow: U1 -> T2 (↙) */}

                                {/* Row 2: Bottom Number [x][ ][T][U] */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8cqi', fontWeight: 'bold', color: '#334155' }}>×</div>
                                <Tile val={null} />
                                <Tile val={n2_t} highlight={currentStep === 2 || currentStep === 4}
                                    showArrow={currentStep === 2} arrowType="down" /> {/* Step 2: T x T */}
                                <Tile val={n2_u} highlight={currentStep === 1 || currentStep === 3}
                                    showArrow={currentStep === 1} arrowType="down" /> {/* Step 1: U x U */}

                                {/* Sep */}
                                <div style={{ gridColumn: '1/-1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }} />

                                {/* Row 3: Step 2 & 1 [S2][S2][S1][S1] */}
                                <Tile val={step2Tiles[0]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step2Tiles[1]} type={currentStep === 2 ? 'input' : 'static'} active={currentStep === 2} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Tiles[0]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step1Tiles[1]} type={currentStep === 1 ? 'input' : 'static'} active={currentStep === 1} isFeedback={!!feedback} feedbackStatus={feedback} />

                                {/* Row 4: Step 3 (Outer Cross) [ ][S3][S3][ ] */}
                                <Tile val={null} showArrow={currentStep === 5} arrowType="plus" /> {/* Plus Hint for Step 5 */}
                                <Tile val={step3Tiles[0]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step3Tiles[1]} type={currentStep === 3 ? 'input' : 'static'} active={currentStep === 3} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} />

                                {/* Row 5: Step 4 (Inner Cross) [ ][S4][S4][ ] */}
                                <Tile val={null} />
                                <Tile val={step4Tiles[0]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step4Tiles[1]} type={currentStep === 4 ? 'input' : 'static'} active={currentStep === 4} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={null} />

                                {/* Sep 2 */}
                                <div style={{
                                    gridColumn: '1/-1', height: '4px', background: '#cbd5e1', borderRadius: '2px',
                                    alignSelf: 'center', width: '100%', opacity: currentStep === 5 ? 1 : 0
                                }} />

                                {/* Row 6: Total [T][T][T][T] */}
                                <Tile val={step5Tiles[0]} type={currentStep === 5 ? 'input' : 'static'} active={currentStep === 5} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step5Tiles[1]} type={currentStep === 5 ? 'input' : 'static'} active={currentStep === 5} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step5Tiles[2]} type={currentStep === 5 ? 'input' : 'static'} active={currentStep === 5} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={step5Tiles[3]} type={currentStep === 5 ? 'input' : 'static'} active={currentStep === 5} isFeedback={!!feedback} feedbackStatus={feedback} />
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

export const manifestLv4: GameManifest = {
    id: GameIds.BACK_MULTIPLICATION_LV4,
    title: 'Multiplication Lv4',
    description: '2-digit x 2-digit',
    category: 'math',
    level: 2,
    thumbnail: '✖️',
    titleKey: 'games.backMultiplication.lv4.title',
    subtitleKey: 'games.backMultiplication.lv4.subtitle',
    descriptionKey: 'games.backMultiplication.description',
    mode: 'genius',
    component: BackMultiplicationGameLv4
};
