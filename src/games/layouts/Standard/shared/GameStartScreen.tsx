import React from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../../../utils/sound';
import './SharedStyles.css';

interface Instruction {
    icon?: string;
    title: string;
    description: string;
}

interface StartScreenProps {
    title: string;
    subtitle?: string;
    description?: string;
    instructions?: Instruction[];
    onStart: () => void;
}

export const GameStartScreen: React.FC<StartScreenProps> = ({
    // title is intentionally omitted to avoid duplication
    subtitle,
    description,
    instructions,
    onStart
}) => {
    const { t } = useTranslation();

    return (
        <div className="overlay-screen start-screen-layout">
            <div className="start-header-section">

                {subtitle && <h2 className="game-subtitle">{subtitle}</h2>}
            </div>
            <div className="start-content-scroll custom-scrollbar">
                <div className="how-to-play-box">
                    <h3 className="section-title">{t('common.howToPlay')}</h3>
                    {/* Description removed per user request */}
                    {instructions && instructions.length > 0 && (
                        <div className="visual-steps-container">
                            {instructions.map((inst, index) => (
                                <div key={index} className="visual-step-card">
                                    <div className="step-number">{index + 1}</div>
                                    {inst.icon && <span className="visual-step-icon">{inst.icon}</span>}
                                    <span className="visual-step-title">{inst.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="start-footer-section">
                <button className="start-btn" onClick={() => { playButtonSound(); onStart(); }}>▶ {t('common.startGame')}</button>
            </div>
        </div>
    );
};
