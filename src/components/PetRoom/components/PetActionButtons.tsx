import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { playButtonSound } from '../../../utils/sound';
import { useNurturing } from '../../../contexts/NurturingContext';
import type { CharacterAction } from '../../../types/character';

interface PetActionButtonsProps {
    nurturing: ReturnType<typeof useNurturing>;
    isActionInProgress: boolean;
    showGiftBox: boolean;
    action: CharacterAction;
    onToggleFood: () => void;
    onToggleMedicine: () => void;
    onToggleClean: () => void;
    onOpenSettings: () => void;
}

export const PetActionButtons: React.FC<PetActionButtonsProps> = ({
    nurturing,
    isActionInProgress,
    showGiftBox,
    action,
    onToggleFood,
    onToggleMedicine,
    onToggleClean,
    onOpenSettings
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handlePlay = () => {
        playButtonSound();
        navigate('/play');
    };

    return (
        <div className="action-bar">
            <button
                className="action-btn action-btn--small"
                onClick={onToggleFood}
                disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
                title={t('actions.feed')}
            >
                <span className="action-icon">🍖</span>
            </button>

            <button
                className="action-btn action-btn--small"
                onClick={onToggleMedicine}
                disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
                title={t('actions.medicine')}
            >
                <span className="action-icon">💊</span>
            </button>

            <button
                className="action-btn action-btn--main"
                onClick={handlePlay}
                disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
            >
                <span className="action-icon-large">🎾</span>
                <span className="action-label">{t('actions.play')}</span>
            </button>

            <button
                className="action-btn action-btn--small"
                onClick={onToggleClean}
                disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
                title={t('actions.clean')}
            >
                <span className="action-icon">✨</span>
            </button>

            <button
                className="action-btn action-btn--small"
                onClick={() => {
                    playButtonSound();
                    onOpenSettings();
                }}
                disabled={action !== 'idle' || showGiftBox}
                title={t('actions.settings')}
            >
                <span className="action-icon">⚙️</span>
            </button>
        </div>
    );
};
