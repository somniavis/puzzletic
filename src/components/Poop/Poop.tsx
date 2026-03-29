/**
 * Poop Component
 * 똥 오브젝트 렌더링
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Poop as PoopType } from '../../types/nurturing';
import './Poop.css';

interface PoopProps {
  poop: PoopType;
  onClick?: (poopId: string) => void;
  cleanupTrigger?: number;
}

export const Poop: React.FC<PoopProps> = ({ poop, onClick, cleanupTrigger }) => {
  const { t } = useTranslation();
  const [isBeingCleaned, setIsBeingCleaned] = useState(false);

  const startCleaning = () => {
    if (isBeingCleaned || !onClick) return;

    setIsBeingCleaned(true);

    setTimeout(() => {
      onClick(poop.id);
    }, 400); // 애니메이션 duration과 맞춤
  };

  useEffect(() => {
    if (cleanupTrigger == null) return;
    startCleaning();
  }, [cleanupTrigger]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startCleaning();
  };

  return (
    <>
      {/* 빗자루 이펙트 */}
      {isBeingCleaned && (
        <div
          className="broom-effect"
          style={{
            left: `${poop.x}%`,
            top: `${poop.y}%`,
          }}
        >
          🧹
        </div>
      )}

      {/* 똥 */}
      <div
        className={`poop ${isBeingCleaned ? 'poop-cleaning' : ''}`}
        style={{
          left: `${poop.x}%`,
          top: `${poop.y}%`,
        }}
        onClick={handleClick}
        title={t('nurturingPanel.interactions.cleanPoop')}
      >
        💩
      </div>
    </>
  );
};

export default Poop;
