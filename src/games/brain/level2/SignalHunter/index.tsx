

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useSignalHunterLogic } from './GameLogic';
import manifest_en from './locales/en.ts';
import './SignalHunter.css';
import type { GameManifest } from '../../../types';


interface SignalHunterProps {
    onExit: () => void;
}

const WaveBackground = () => {
    return (
        <div className="waveBgContainer">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
        </div>
    );
};

export const SignalHunter: React.FC<SignalHunterProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const logic = useSignalHunterLogic();

    // Load Translations
    useEffect(() => {
        const newResources = { en: { translation: { games: { 'signal-hunter': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    // PowerUp State Mapping (using engine's powerUps)
    const powerUps = [
        {
            count: logic.powerUps?.timeFreeze || 0,
            color: 'blue' as const,
            icon: '❄️',
            title: 'Time Freeze',
            onClick: () => logic.usePowerUp('timeFreeze'),
            disabledConfig: logic.isTimeFrozen,
            status: (logic.isTimeFrozen ? 'active' : 'normal') as 'active' | 'normal' | 'maxed'
        },
        {
            count: logic.powerUps?.extraLife || 0,
            color: 'red' as const,
            icon: '❤️',
            title: 'Extra Life',
            onClick: () => logic.usePowerUp('extraLife'),
            disabledConfig: logic.lives >= 3,
            status: 'normal' as const
        },
        {
            count: logic.powerUps?.doubleScore || 0,
            color: 'yellow' as const,
            icon: '⚡',
            title: 'Double Score',
            onClick: () => logic.usePowerUp('doubleScore'),
            disabledConfig: logic.isDoubleScore,
            status: (logic.isDoubleScore ? 'active' : 'normal') as 'active' | 'normal' | 'maxed'
        }
    ];

    return (
        <Layout2
            title={t('games.signal-hunter.title')}
            subtitle={t('games.signal-hunter.subtitle')}
            gameId="signal-hunter"
            engine={logic}
            powerUps={powerUps}
            instructions={[
                { icon: '🎯', title: t('games.signal-hunter.howToPlay.step1.title'), description: t('games.signal-hunter.howToPlay.step1.desc') },
                { icon: '👁️', title: t('games.signal-hunter.howToPlay.step2.title'), description: t('games.signal-hunter.howToPlay.step2.desc') },
                { icon: '⚡', title: t('games.signal-hunter.howToPlay.step3.title'), description: t('games.signal-hunter.howToPlay.step3.desc') },
            ]}
            onExit={onExit}
            background={<div style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #b1b2fb 50%, #fecdd3 100%)', width: '100%', height: '100%' }} />}
            cardBackground={<WaveBackground />}
            className="signal-hunter-game"
        >
            <div className="signal-hunter-container" onPointerDown={logic.handleTap}>
                {/* Code Sequence Display */}
                <div className="code-sequence-bar">
                    {logic.codes.map((emoji: string, idx: number) => {
                        let statusClass = 'pending';
                        if (idx < logic.currentCodeIdx) statusClass = 'solved';
                        else if (idx === logic.currentCodeIdx) statusClass = 'active';

                        return (
                            <div
                                key={idx}
                                className={`code-slot ${statusClass}`}
                            >
                                {emoji}
                                {idx < logic.currentCodeIdx && <div className="check-overlay">✓</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="lock-body">
                    {/* Inner Track & Marks */}
                    <div className="lock-track"></div>

                    {/* Decoys (Distractions) */}
                    {logic.decoys.map((decoy, i) => (
                        <div
                            key={`decoy-${i}`}
                            className="target-orbit-container"
                            style={{ transform: `rotate(${decoy.angle}deg)` }}
                        >
                            <div
                                className="target-zone"
                                style={{ transform: `rotate(-${decoy.angle}deg)` }}
                            >
                                <div className="target-circle"></div>
                                <div className="target-emoji-float">{decoy.emoji}</div>
                            </div>
                        </div>
                    ))}

                    {/* Target Zone (Responsive Orbit) */}
                    <div
                        className="target-orbit-container"
                        style={{ transform: `rotate(${logic.targetAngle}deg)` }}
                    >
                        <div
                            className="target-zone"
                            style={{ transform: `rotate(-${logic.targetAngle}deg)` }}
                        >
                            <div className="target-circle"></div>
                            <div className="target-emoji-float">{logic.target.value}</div>
                        </div>
                    </div>

                    {/* Needle */}
                    <div className="needle-container" style={{ transform: `rotate(${logic.needleAngle}deg)` }}>
                        <div className="needle-arm"></div>
                        <div className="needle-head"></div>
                    </div>

                    {/* Center Knob */}
                    <div className="lock-center">
                        📡
                    </div>
                </div>
            </div>
        </Layout2>
    );
};

export const manifest: GameManifest = {
    id: 'signal-hunter',
    title: 'Signal Hunter',
    titleKey: 'games.signal-hunter.title',
    subtitle: 'Catch the Signal!',
    subtitleKey: 'games.signal-hunter.subtitle',
    description: 'Scan the radar and lock onto the target signals!',
    descriptionKey: 'games.signal-hunter.description',
    category: 'brain',
    level: 2,
    component: SignalHunter,
    thumbnail: '📡'
};
