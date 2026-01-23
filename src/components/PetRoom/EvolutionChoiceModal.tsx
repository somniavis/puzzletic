import React from 'react';
import { useTranslation } from 'react-i18next';
import './EvolutionChoiceModal.css';

interface EvolutionChoiceModalProps {
    currentStars: number;
    requiredStars: number;
    onGraduate: () => void;
    onEvolve: () => void;
}

export const EvolutionChoiceModal: React.FC<EvolutionChoiceModalProps> = ({
    currentStars,
    requiredStars,
    onGraduate,
    onEvolve,
}) => {
    const { t } = useTranslation();

    return (
        <div className="evolution-choice-overlay">
            <div className="evolution-choice-container">
                <div className="choice-header">
                    <span className="choice-title-icon">✨</span>
                    <h2>{t('evolution.choice.title', 'Destiny Awaits')}</h2>
                </div>

                <p className="choice-description">
                    {t('evolution.choice.description', 'Your Jello has reached a turning point! Choose its destiny.')}
                </p>

                <div className="choice-options">
                    {/* Option 1: Graduate */}
                    <button className="choice-card graduate-card" onClick={onGraduate}>
                        <div className="card-icon">🎓</div>
                        <div className="card-content">
                            <h3>{t('evolution.choice.graduate.title', 'Graduate Now')}</h3>
                            <p>{t('evolution.choice.graduate.desc', 'Complete the journey at Stage 4.')}</p>
                        </div>
                    </button>

                    {/* Option 2: Evolve */}
                    <button className="choice-card evolve-card" onClick={onEvolve}>
                        <div className="card-icon">👑</div>
                        <div className="card-content">
                            <h3>{t('evolution.choice.evolve.title', 'Evolve to Stage 5')}</h3>
                            <p>{t('evolution.choice.evolve.desc', 'Unlock the ultimate form.')}</p>
                            <div className="price-tag">
                                <span className="star-icon">⭐</span>
                                <span className={currentStars >= requiredStars ? 'price-ok' : 'price-fail'}>
                                    {requiredStars}
                                </span>
                                <span className="current-balance"> (You: {currentStars})</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
