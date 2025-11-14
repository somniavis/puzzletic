/**
 * NurturingStat Component
 * 양육 스탯 표시 컴포넌트
 */

import React from 'react';
import { getStatState } from '../../services/gameTickService';
import './NurturingStat.css';

interface NurturingStatProps {
  label: string;
  value: number;
  icon: string;
  showWarning?: boolean;
}

export const NurturingStat: React.FC<NurturingStatProps> = ({
  label,
  value,
  icon,
  showWarning = true,
}) => {
  const statState = getStatState(value);
  const roundedValue = Math.round(value);

  // 상태에 따른 색상 클래스
  const getStateClass = () => {
    if (!showWarning) return '';
    switch (statState) {
      case 'critical':
        return 'stat-critical';
      case 'warning':
        return 'stat-warning';
      case 'normal':
        return 'stat-normal';
      case 'excellent':
        return 'stat-excellent';
      default:
        return '';
    }
  };

  return (
    <div className={`nurturing-stat ${getStateClass()}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{roundedValue}/100</div>
      </div>
      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{ width: `${roundedValue}%` }}
        />
      </div>
    </div>
  );
};

export default NurturingStat;