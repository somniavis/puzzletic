import React from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import type { DailyRoutineReward } from '../../services/dailyRoutineRewardService';
import '../TrainRewardModal/TrainRewardModal.css';

interface DailyRoutineRewardModalProps {
  reward: DailyRoutineReward;
  onConfirm: () => void;
}

const getRewardEmoji = (tier: DailyRoutineReward['tier']) => {
  if (tier === 'jackpot') return '🎉';
  if (tier === 'bonus') return '✨';
  return '🗒️';
};

export const DailyRoutineRewardModal: React.FC<DailyRoutineRewardModalProps> = ({
  reward,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <div className="train-reward-overlay">
      <div className={`train-reward-modal ${reward.tier === 'jackpot' ? 'jackpot' : ''}`}>
        <div className="reward-emoji">{getRewardEmoji(reward.tier)}</div>
        <div className="reward-label">
          {t('dailyRoutine.reward.title')}
        </div>
        <div className="reward-amount">+{reward.gro} GRO</div>
        <div className="reward-amount" style={{ fontSize: '1.5rem', marginTop: '-0.4rem' }}>
          +{reward.xp} XP
        </div>
        <button
          className="confirm-btn"
          onClick={() => {
            playButtonSound();
            onConfirm();
          }}
        >
          {t('train.reward.confirm')}
        </button>
      </div>
    </div>
  );
};
