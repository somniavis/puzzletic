import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { usePinwheelLogic } from './GameLogic';
import manifest_en from './locales/en.ts';
import './PinwheelPop.css';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

interface MathPinwheelProps {
    onExit: () => void;
}

export const MathPinwheel: React.FC<MathPinwheelProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const logic = usePinwheelLogic();
    const {
        innerNumbers,
        outerAnswers,
        currentStage,
        options,
        handleAnswer,
        powerUps,
        isTimeFrozen,

        usePowerUp,
        finalSpin
    } = logic;

    const powerUpConfig = useMemo<PowerUpBtnProps[]>(() => [
        {
            count: powerUps.timeFreeze,
            color: "blue",
            icon: "❄️",
            title: "Time Freeze",
            onClick: () => usePowerUp('timeFreeze'),
            disabledConfig: isTimeFrozen,
            status: isTimeFrozen ? 'active' : 'normal'
        },
        {
            count: powerUps.extraLife,
            color: "red" as const,
            icon: "❤️",
            title: "Extra Life",
            onClick: () => usePowerUp('extraLife'),
            disabledConfig: logic.lives >= 3,
            status: logic.lives >= 3 ? 'maxed' : 'normal'
        },
        {
            count: powerUps.doubleScore,
            color: "yellow" as const,
            icon: "⚡",
            title: "Double Score",
            onClick: () => usePowerUp('doubleScore'),
            disabledConfig: logic.doubleScoreActive,
            status: logic.doubleScoreActive ? 'active' : 'normal'
        }
    ], [powerUps, isTimeFrozen, logic.lives, logic.doubleScoreActive, usePowerUp]);

    // Load Translations
    useEffect(() => {
        const newResources = { en: { translation: { games: { 'pinwheel-pop': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    // Force blur on stage change (Safari Focus Fix)
    useEffect(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, [currentStage]);

    return (
        <Layout2
            title={t('games.pinwheel-pop.title')}
            subtitle={t('games.pinwheel-pop.subtitle')}
            gameId={GameIds.PINWHEEL_POP}
            engine={logic as any}
            powerUps={powerUpConfig}
            instructions={[
                { icon: '👀', title: t('games.pinwheel-pop.howToPlay.step1.title'), description: t('games.pinwheel-pop.howToPlay.step1.description') },
                { icon: '➕', title: t('games.pinwheel-pop.howToPlay.step2.title'), description: t('games.pinwheel-pop.howToPlay.step2.description') },
                { icon: '🌬️', title: t('games.pinwheel-pop.howToPlay.step3.title'), description: t('games.pinwheel-pop.howToPlay.step3.description') },
            ]}
            onExit={onExit}
            className="pinwheel-layout"
        >
            <div className="pinwheel-pop-container">
                {/* Background Decor (Inside Game Area) */}
                <div className="bg-decor">
                    <div className="cloud cloud-1">☁️</div>
                    <div className="cloud cloud-2">☁️</div>
                    <div className="cloud cloud-3">☁️</div>
                </div>

                {/* Pinwheel Visualization Area */}
                <div className="pinwheel-vis-area">
                    <div className={`pinwheel-wrapper ${finalSpin ? 'finale-spin' : ''}`}>

                        {/* Center Operator */}
                        <div className="center-circle">
                            +
                        </div>

                        {/* Inner Blocks (Operands) */}
                        <div className="pw-block inner-block inner-tl">{innerNumbers[0]}</div>
                        <div className="pw-block inner-block inner-tr">{innerNumbers[1]}</div>
                        <div className="pw-block inner-block inner-br">{innerNumbers[2]}</div>
                        <div className="pw-block inner-block inner-bl">{innerNumbers[3]}</div>

                        {/* Outer Blocks (Answers/Wings) */}

                        {/* Top Wing (Physically Top): Mapped to Stage 3 (Left Edge: BL+TL) */}
                        <div className={`pw-block outer-block outer-top ${outerAnswers[3] !== null ? 'solved' : ''} ${currentStage === 3 ? 'active' : (currentStage !== 3 && outerAnswers[3] === null ? 'dimmed' : '')}`}>
                            {outerAnswers[3] ?? '?'}
                        </div>

                        {/* Right Wing (Physically Right): Mapped to Stage 0 (Top Edge: TL+TR) */}
                        <div className={`pw-block outer-block outer-right ${outerAnswers[0] !== null ? 'solved' : ''} ${currentStage === 0 ? 'active' : (currentStage !== 0 && outerAnswers[0] === null ? 'dimmed' : '')}`}>
                            {outerAnswers[0] ?? '?'}
                        </div>

                        {/* Bottom Wing (Physically Bottom): Mapped to Stage 1 (Right Edge: TR+BR) */}
                        <div className={`pw-block outer-block outer-bottom ${outerAnswers[1] !== null ? 'solved' : ''} ${currentStage === 1 ? 'active' : (currentStage !== 1 && outerAnswers[1] === null ? 'dimmed' : '')}`}>
                            {outerAnswers[1] ?? '?'}
                        </div>

                        {/* Left Wing (Physically Left): Mapped to Stage 2 (Bottom Edge: BR+BL) */}
                        <div className={`pw-block outer-block outer-left ${outerAnswers[2] !== null ? 'solved' : ''} ${currentStage === 2 ? 'active' : (currentStage !== 2 && outerAnswers[2] === null ? 'dimmed' : '')}`}>
                            {outerAnswers[2] ?? '?'}
                        </div>
                    </div>

                    {/* Wind Effect: Appears during finale spin */}
                    {finalSpin && (
                        <div className="wind-effect">
                            🌬️
                        </div>
                    )}
                </div>

                {/* Answer Options */}
                <div className="pinwheel-options">
                    {options.map((option, idx) => (
                        <button
                            key={`${option}-${idx}-${currentStage}`}
                            className="pw-option-btn"
                            onClick={() => {
                                if (!finalSpin) {
                                    handleAnswer(option);
                                }
                            }}
                            disabled={finalSpin}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </Layout2>
    );
};

export const manifest: GameManifest = {
    id: GameIds.PINWHEEL_POP,
    title: 'Broken Pinwheel',
    titleKey: 'games.pinwheel-pop.title',
    subtitle: 'Pop & Solve!',
    subtitleKey: 'games.pinwheel-pop.subtitle',
    description: 'Solve the sums to spin the pinwheel!',
    descriptionKey: 'games.pinwheel-pop.description',
    category: 'math',
    level: 2,
    component: MathPinwheel,
    thumbnail: '🍭' // Pinwheel/Candy specific
};
