/**
 * Poop Component
 * 똥 오브젝트 렌더링
 */

import React, { useState } from 'react';
import type { Poop as PoopType } from '../../types/nurturing';
import './Poop.css';

interface PoopProps {
  poop: PoopType;
  onClick?: (poopId: string) => void;
}

export const Poop: React.FC<PoopProps> = ({ poop, onClick }) => {
  const [isBeingCleaned, setIsBeingCleaned] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBeingCleaned || !onClick) return;

    // 빗자루 애니메이션 시작
    setIsBeingCleaned(true);

    // 애니메이션 후 제거
    setTimeout(() => {
      onClick(poop.id);
    }, 400); // 애니메이션 duration과 맞춤
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
        title="클릭해서 치우기"
      >
        💩
      </div>
    </>
  );
};

export default Poop;
