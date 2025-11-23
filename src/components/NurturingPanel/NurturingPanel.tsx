/**
 * NurturingPanel Component
 * 양육 시스템 통합 패널
 */

import React from 'react';
import { useNurturing } from '../../contexts/NurturingContext';
import NurturingStat from '../NurturingStat/NurturingStat';
import './NurturingPanel.css';

export const NurturingPanel: React.FC = () => {
  const { stats, condition, totalCurrencyEarned, studyCount } = useNurturing();

  return (
    <div className="nurturing-panel">
      <div className="nurturing-stats-grid">
        <NurturingStat
          label="포만감"
          value={stats.fullness}
          icon="🍖"
        />
        <NurturingStat
          label="건강"
          value={stats.health}
          icon="❤️"
        />
        <NurturingStat
          label="행복도"
          value={stats.happiness}
          icon="😊"
        />
      </div>

      {/* 상태 알림 */}
      {condition.needsAttention && (
        <div className="condition-alerts">
          {condition.isHungry && (
            <div className="alert alert-hungry">🍖 배고파요! 음식을 주세요</div>
          )}
          {condition.isSick && (
            <div className="alert alert-sick">💊 아파요! 약이 필요해요</div>
          )}
        </div>
      )}

      {/* 재화 정보 */}
      <div className="currency-info">
        <div className="currency-item">
          <span className="currency-icon">💰</span>
          <span className="currency-value">{totalCurrencyEarned}</span>
        </div>
        <div className="study-count">
          <span className="study-icon">📚</span>
          <span className="study-value">학습 {studyCount}회</span>
        </div>
      </div>
    </div>
  );
};

export default NurturingPanel;