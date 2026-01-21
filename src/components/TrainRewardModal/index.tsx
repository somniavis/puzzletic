import React from 'react';
import { useTranslation } from 'react-i18next';
import './TrainRewardModal.css';
import { playButtonSound } from '../../utils/sound';

interface TrainRewardModalProps {
    rewardType: 'small' | 'snack' | 'big' | 'dud';
    amount: number;
    onConfirm: () => void;
}

export const TrainRewardModal: React.FC<TrainRewardModalProps> = ({
    rewardType,
    amount,
    onConfirm,
}) => {
    const { t } = useTranslation();

    const handleConfirm = () => {
        playButtonSound();
        onConfirm();
    };

    // Determine emoji based on reward type
    const getRewardEmoji = () => {
        if (rewardType === 'dud') return '💨';
        if (rewardType === 'big') return '🎉';
        return '💰';
    };

    // Determine label
    const getRewardLabel = () => {
        if (rewardType === 'dud') return t('train.reward.dud');
        return t('train.reward.glo');
    };

    return (
        <div className="train-reward-overlay">
            <div className={`train-reward-modal ${rewardType === 'big' ? 'jackpot' : ''}`}>
                <div className="reward-emoji">{getRewardEmoji()}</div>
                <div className="reward-label">{getRewardLabel()}</div>
                {rewardType !== 'dud' && (
                    <div className="reward-amount">+{amount}</div>
                )}
                <button className="confirm-btn" onClick={handleConfirm}>
                    {t('train.reward.confirm')}
                </button>
            </div>
        </div>
    );
};
