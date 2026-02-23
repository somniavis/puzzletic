/**
 * NurturingPanel Component
 * 양육 시스템 통합 패널
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../../contexts/NurturingContext';
import NurturingStat from '../NurturingStat/NurturingStat';
import './NurturingPanel.css';

export const NurturingPanel: React.FC = () => {
  const { t } = useTranslation();
  const { stats, condition, totalCurrencyEarned, studyCount } = useNurturing();

  return (
    <div className="nurturing-panel">
      <div className="nurturing-stats-grid">
        <NurturingStat
          label={t('nurturingPanel.stats.fullness')}
          value={stats.fullness}
          icon="🍖"
        />
        <NurturingStat
          label={t('nurturingPanel.stats.health')}
          value={stats.health}
          icon="❤️"
        />
        <NurturingStat
          label={t('nurturingPanel.stats.happiness')}
          value={stats.happiness}
          icon="😊"
        />
      </div>

      {/* 상태 알림 */}
      {condition.needsAttention && (
        <div className="condition-alerts">
          {condition.isHungry && (
            <div className="alert alert-hungry">{t('nurturingPanel.alerts.hungry')}</div>
          )}
          {condition.isSick && (
            <div className="alert alert-sick">{t('nurturingPanel.alerts.sick')}</div>
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
          <span className="study-value">{t('nurturingPanel.studyCount', { count: studyCount })}</span>
        </div>
      </div>
    </div>
  );
};

export default NurturingPanel;
