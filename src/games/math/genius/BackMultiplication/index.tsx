import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useBackMultiplicationLogic } from './GameLogic';
import { BlobBackground } from '../../components/BlobBackground';
import { Keypad } from './Keypad';
import type { GameManifest } from '../../../types';
import { GameIds } from '../../../../constants/gameIds';

// Simplified Fill Slots for 1x1
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

// Simplified Tile
const Tile = ({
    val, type = 'static', active = false, isFeedback = false, feedbackStatus, highlight = false
}: {
    val: string | number | null, type?: 'static' | 'input', active?: boolean, isFeedback?: boolean, feedbackStatus?: 'correct' | 'wrong' | null, highlight?: boolean
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
            boxShadow: `0 2px 0 ${shadowColor}`, borderRadius: '12px', opacity: isGhost ? 0 : 1,
            transform: type === 'input' && active ? 'translateY(2px)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
        }}>
            {val}
        </div>
    );
};

export const BackMultiplicationGame: React.FC<{ onExit: () => void, gameId?: string }> = ({ onExit, gameId }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 120 });
    const {
        currentProblem, userInput, feedback, handleInput
    } = useBackMultiplicationLogic(engine);

    // Simple Grid: 2 Cols.
    // Row 1: X Y (but separated by X sign).
    // Actually standard vertical format:
    //   A
    // x B
    // ---
    //  CC

    // Values to display
    const totalDigits = currentProblem?.step1_str.length || 2;
    const totalTiles = useMemo(() => fillSlots(userInput, totalDigits, 2), [userInput, totalDigits]);

    return (
        <Layout2
            title={t('games.backMultiplication.lv1.title')}
            subtitle={t('games.backMultiplication.lv1.subtitle')}
            description={t('games.backMultiplication.description')}
            gameId={gameId || GameIds.BACK_MULTIPLICATION_LV1}
            engine={engine}
            onExit={onExit}
            cardBackground={<BlobBackground speed="slow" colors={{ blob1: '#fdf4ff', blob2: '#fae8ff', blob3: '#f0abfc', blob4: '#e879f9' }} />}
            instructions={[
                { icon: '1️⃣', title: t('games.backMultiplication.howToPlay.step1.title'), description: t('games.backMultiplication.hint.step1') },
                { icon: '✅', title: t('games.backMultiplication.howToPlay.answer.title'), description: t('games.backMultiplication.hint.answer') }
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
                                width: '100%', maxWidth: '300px', height: '100%', maxHeight: '60cqi',
                                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                                gridTemplateRows: 'repeat(2, 1fr) auto 1fr',
                                gap: '8px', alignContent: 'center', justifyItems: 'stretch'
                            }}>
                                {/* Row 1:   A */}
                                <Tile val={null} />
                                <Tile val={currentProblem.a} />

                                {/* Row 2: x B */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8cqi', fontWeight: 'bold', color: '#334155' }}>×</div>
                                <Tile val={currentProblem.b} />

                                {/* Sep */}
                                <div style={{ gridColumn: '1/-1', height: '4px', background: '#cbd5e1', borderRadius: '2px', alignSelf: 'center', width: '100%' }} />

                                {/* Row 3: Total */}
                                <Tile val={totalTiles[0]} type="input" active={true} isFeedback={!!feedback} feedbackStatus={feedback} />
                                <Tile val={totalTiles[1]} type="input" active={true} isFeedback={!!feedback} feedbackStatus={feedback} />
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

export const manifestLv1: GameManifest = {
    id: GameIds.BACK_MULTIPLICATION_LV1,
    title: 'Multiplication Lv1',
    description: '1-digit x 1-digit',
    category: 'math',
    level: 2,
    thumbnail: '✖️',
    titleKey: 'games.backMultiplication.lv1.title',
    subtitleKey: 'games.backMultiplication.lv1.subtitle',
    descriptionKey: 'games.backMultiplication.description',
    mode: 'genius',
    component: BackMultiplicationGame
};
